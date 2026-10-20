import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true }) // adds createdAt and updatedAt automatically
export class Note {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true }) user: MongooseSchema.Types.ObjectId;
  @Prop({ required: true, trim: true }) title: string;
  @Prop({ default: '' }) content: string;
  @Prop({ type: [String], default: [] }) tags: string[];
  @Prop({ default: 'blue' }) color: string;
  @Prop({ default: false }) isPinned: boolean;
  @Prop({ default: false }) isArchived: boolean;
}

export type NoteDocument = HydratedDocument<Note>;
export const NoteSchema = SchemaFactory.createForClass(Note);
