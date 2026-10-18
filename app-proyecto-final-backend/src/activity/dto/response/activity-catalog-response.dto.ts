import { CatalogItemDto } from "./activity-item-response.dto";

/*Principal acativity catalog response dto model */
export class ActivityCatalogResponseDto {
  actions!: CatalogItemDto[];
  resourceTypes!: CatalogItemDto[];
}