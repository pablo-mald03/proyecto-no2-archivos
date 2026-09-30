import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SharingService } from './sharing.service';
import { CreateSharingDto } from './dto/create-sharing.dto';
import { UpdateSharingDto } from './dto/update-sharing.dto';

@Controller('sharing')
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  @Post()
  create(@Body() createSharingDto: CreateSharingDto) {
    return this.sharingService.create(createSharingDto);
  }

  @Get()
  findAll() {
    return this.sharingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sharingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSharingDto: UpdateSharingDto) {
    return this.sharingService.update(+id, updateSharingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sharingService.remove(+id);
  }
}
