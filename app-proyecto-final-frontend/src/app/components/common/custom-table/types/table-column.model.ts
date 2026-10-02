//Table column model config
export interface TableColumn {
    key: string;
    header: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
}

//Table variant config
export type TableVariant =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'ghost';