// api-paginated-response.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PageResponseDto } from '../dto/page-response.dto';

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel, description = 'Respuesta paginada obtenida con éxito') => {
    return applyDecorators(
        ApiExtraModels(PageResponseDto, model),
        ApiOkResponse({
            description,
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PageResponseDto) },
                    {
                        properties: {
                            content: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                        },
                    },
                ],
            },
        }),
    );
};