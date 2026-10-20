import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export const NOTE_COLORS = ['blue', 'green', 'amber', 'rose', 'violet'];

export class CreateNoteDto {
  @IsString() @IsNotEmpty() @MaxLength(120) title: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsIn(NOTE_COLORS) color?: string;
  @IsOptional() @IsBoolean() isPinned?: boolean;
  @IsOptional() @IsBoolean() isArchived?: boolean;
}

// Same fields, but all optional - used for PATCH
export class UpdateNoteDto extends PartialType(CreateNoteDto) {}
