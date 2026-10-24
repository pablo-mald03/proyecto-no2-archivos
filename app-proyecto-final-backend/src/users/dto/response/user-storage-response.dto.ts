import { ApiProperty } from "@nestjs/swagger";

/*User storage response dto class */
export class UserStorageResponseDto {
    @ApiProperty({ example: 1073741824, description: 'Cuota total asignada en bytes' })
    quotaBytes!: number;

    @ApiProperty({ example: 52428800, description: 'Espacio usado actualmente en bytes' })
    usedBytes!: number;
}
