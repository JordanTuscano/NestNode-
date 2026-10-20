import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from './note.schema';
import { CreateNoteDto, UpdateNoteDto } from './notes.dto';

@Injectable()
export class NotesService implements OnModuleInit {
  constructor(@InjectModel(Note.name) private model: Model<NoteDocument>) {}

  // One-time fix: notes saved by an earlier version stored `user` as a string.
  // Convert them to real ObjectIds so queries and the dashboard can match them.
  async onModuleInit() {
    await this.model.collection.updateMany(
      { user: { $type: 'string' } },
      [{ $set: { user: { $toObjectId: '$user' } } }],
    );
  }

  findAll(userId: string, q: { search?: string; tag?: string; archived?: string }) {
    const filter: Record<string, any> = { user: userId, isArchived: q.archived === 'true' };
    if (q.tag) filter.tags = q.tag;
    if (q.search) {
      const rx = new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { content: rx }];
    }
    // pinned notes first, then most recently edited
    return this.model.find(filter).sort({ isPinned: -1, updatedAt: -1 });
  }

  create(userId: string, dto: CreateNoteDto) {
    return this.model.create({ ...dto, user: userId });
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    // filtering by user too means nobody can edit someone else's note
    const note = await this.model.findOneAndUpdate({ _id: id, user: userId }, dto, { new: true });
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  async remove(userId: string, id: string) {
    const note = await this.model.findOneAndDelete({ _id: id, user: userId });
    if (!note) throw new NotFoundException('Note not found');
    return { deleted: true };
  }

  // Dashboard data, computed in one MongoDB aggregation using $facet
  async stats(userId: string) {
    const since = new Date(Date.now() - 6 * 86400000);
    since.setUTCHours(0, 0, 0, 0);

    const [r] = await this.model.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $facet: {
          totals: [{
            $group: {
              _id: null,
              total: { $sum: 1 },
              pinned: { $sum: { $cond: ['$isPinned', 1, 0] } },
              archived: { $sum: { $cond: ['$isArchived', 1, 0] } },
            },
          }],
          perDay: [
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          ],
          byTag: [
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 },
          ],
          recent: [
            { $sort: { updatedAt: -1 } },
            { $limit: 5 },
            { $project: { title: 1, color: 1, updatedAt: 1 } },
          ],
        },
      },
    ]);

    const t = r.totals[0] || { total: 0, pinned: 0, archived: 0 };
    const counts = new Map<string, number>(r.perDay.map((d: any) => [d._id, d.count]));
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const key = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10);
      return { date: key, count: counts.get(key) || 0 };
    });

    return {
      total: t.total, pinned: t.pinned, archived: t.archived,
      last7Days,
      byTag: r.byTag.map((x: any) => ({ tag: x._id, count: x.count })),
      recent: r.recent,
    };
  }
}
