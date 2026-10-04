
//Principal permission model
export interface Permission {
    id: number;
    module: string;
    action: string;
    description: string;
}