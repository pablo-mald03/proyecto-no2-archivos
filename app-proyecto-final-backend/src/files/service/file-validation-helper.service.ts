import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { FilesRepository } from '../repository/files.repository';
import { InvalidFileTypeException } from '../exceptions/invalid-file-type.exception';
import { FileTypeInfo } from '../constants/file-type-info';

/*Principal file validation helper service class*/
@Injectable()
export class FileValidationHelperService {
  constructor(private readonly filesRepository: FilesRepository) { }

  /**
   * Principal method to parse and validate the extension of a file.
   */
  parseAndValidateExtension(filename: string): FileTypeInfo {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.txt')) {
      return { extension: 'txt', mimeType: 'text/plain' };
    }
    if (lower.endsWith('.md')) {
      return { extension: 'md', mimeType: 'text/markdown' };
    }
    throw new InvalidFileTypeException(
      `El archivo "${filename}" no tiene una extensión permitida. Solo se admiten archivos .txt y .md`,
    );
  }

  /**
   * Principal method to generates a collision-free filename if duplicate exists.
   */
  async resolveAvailableName(ownerId: Types.ObjectId, folderId: Types.ObjectId | null,
    originalName: string, extension: 'txt' | 'md', session?: any): Promise<string> {

    let candidate = originalName;
    let counter = 1;
    const baseName = originalName.substring(0, originalName.lastIndexOf('.'));

    while (
      await this.filesRepository.existsActiveSiblingByName(
        ownerId,
        folderId,
        candidate,
        undefined,
        session,
      )
    ) {
      candidate = `${baseName} (${counter}).${extension}`;
      counter++;
    }

    return candidate;
  }
}
