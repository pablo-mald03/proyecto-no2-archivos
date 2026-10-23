//Principal log catalog option
export interface LogCatalogOption {
  code: string;
  label: string;
}
//Log catalog model
export interface LogCatalog {
  actions: LogCatalogOption[];
  resourceTypes: LogCatalogOption[];
}
