import { lucidePercent, lucideReceipt, lucideShoppingCart } from "@ng-icons/lucide";

/*Presentation info for each iva type */
export interface IvaTypeInfo {
    label: string;
    module: string;
    description: string;
    icon: string;
    accentClass: string;
}

//Principal iva catalog: Add a new entry here when the back introduces another iva type
const IVA_TYPE_CATALOG: Record<string, IvaTypeInfo> = {
    PURCHASE: {
        label: 'IVA de compras',
        module: 'Compras',
        description: 'Porcentaje que se aplica al registrar compras a proveedores.',
        icon: lucideShoppingCart,
        accentClass: 'bg-amber-950/40 text-amber-400'
    },
    SALE: {
        label: 'IVA de ventas',
        module: 'Ventas',
        description: 'Porcentaje que se aplica al registrar ventas a clientes.',
        icon: lucideReceipt,
        accentClass: 'bg-primary/10 text-primary'
    }
};

//Default iva type info constant
const DEFAULT_IVA_TYPE_INFO: IvaTypeInfo = {
    label: '',
    module: 'General',
    description: 'Porcentaje de IVA configurado para este módulo.',
    icon: lucidePercent,
    accentClass: 'bg-primary/10 text-primary'
};

//Resolve the info of a type, falling back to a generic one
export function getIvaTypeInfo(type: string): IvaTypeInfo {
    return IVA_TYPE_CATALOG[type] ?? { ...DEFAULT_IVA_TYPE_INFO, label: `IVA ${type}` };
}
