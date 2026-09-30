import { Injectable } from '@nestjs/common';
import { CreateSharingDto } from './dto/create-sharing.dto';
import { UpdateSharingDto } from './dto/update-sharing.dto';

@Injectable()
export class SharingService {
  create(createSharingDto: CreateSharingDto) {
    return 'This action adds a new sharing';
  }

  findAll() {
    return `This action returns all sharing`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sharing`;
  }

  update(id: number, updateSharingDto: UpdateSharingDto) {
    return `This action updates a #${id} sharing`;
  }

  remove(id: number) {
    return `This action removes a #${id} sharing`;
  }
}
