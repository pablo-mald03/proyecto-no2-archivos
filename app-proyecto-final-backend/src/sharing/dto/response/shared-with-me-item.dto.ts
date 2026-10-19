import { ShareResponseDto } from './share-response.dto';

/*Principal shared with me item response dto*/
export class SharedWithMeItemDto {
  share!: ShareResponseDto;
  resource!: {
    id: string;
    type: 'FILE' | 'FOLDER';
    name: string;
    extension?: string;
    mimeType?: string;
    sizeBytes?: number;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  };
}
