import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersRepository } from 'src/users/repository/users.repository';
import { StorageQuotaExceededException } from '../exceptions/storage-quota-exceeded.exception';

//Principal file quota helper service class
@Injectable()
export class FileQuotaHelperService {
  constructor(private readonly usersRepository: UsersRepository) { }

  /**
   * Principal method to reserve storage quota on owner
   */
  async reserveOrThrow(ownerId: Types.ObjectId | string, bytes: number, customMessage?: string): Promise<void> {
    const success = await this.usersRepository.reserveStorageQuota(ownerId, bytes);
    if (!success) {
      throw new StorageQuotaExceededException(
        customMessage || 'No tienes suficiente espacio de almacenamiento disponible',
      );
    }
  }

  /**
   * Principal method to release storage quota on owner
   */
  async release(ownerId: Types.ObjectId | string, bytes: number, session?: any): Promise<void> {
    await this.usersRepository.releaseStorageQuota(ownerId, bytes, session);
  }
}
