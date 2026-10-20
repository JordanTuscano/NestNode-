import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNoteDto, UpdateNoteDto } from './notes.dto';
import { NotesService } from './notes.service';

type AuthReq = { user: { userId: string } };

@UseGuards(JwtAuthGuard) // every route in this controller requires login
@Controller('notes')
export class NotesController {
  constructor(private notes: NotesService) {}

  @Get() findAll(@Req() req: AuthReq, @Query() q: { search?: string; tag?: string; archived?: string }) {
    return this.notes.findAll(req.user.userId, q);
  }
  @Get('stats') stats(@Req() req: AuthReq) { return this.notes.stats(req.user.userId); } // must be above :id routes
  @Post() create(@Req() req: AuthReq, @Body() dto: CreateNoteDto) { return this.notes.create(req.user.userId, dto); }
  @Patch(':id') update(@Req() req: AuthReq, @Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notes.update(req.user.userId, id, dto);
  }
  @Delete(':id') remove(@Req() req: AuthReq, @Param('id') id: string) { return this.notes.remove(req.user.userId, id); }
}
