
import { IconType } from '@ng-icons/core';
import {
    lucideLayoutDashboard,
    lucidePackage,
    lucideShoppingCart,
    lucideWarehouse,
    lucideUsers,
    lucideSettings,
    lucideShield,
    lucideKey,
    lucideLogs,
    lucideLibrary,
    lucideClipboard,
    lucideMailbox,
    lucideArchive,
    lucideDollarSign,
    lucideFeather,
    lucideFileArchive,
    lucidePackageCheck,
    lucideBadgeDollarSign,
    lucideCoins
} from '@ng-icons/lucide';

//Sidebar option menu model
export interface SidebarOption {
    label: string;
    route?: string;
    icon: IconType;
    permission?: string;
    children?: SidebarOption[];
}
/*Principal side bar options */
export const SIDEBAR_OPTIONS: SidebarOption[] = [

    {
        label: 'Dashboard',
        route: '/dashboard',
        icon: lucideLayoutDashboard
    },
    {
        label: 'Productos',
        route: '/dashboard/products',
        icon: lucidePackage,
        permission: 'productos:consultar'
    },
    {
        label: 'Categorias',
        route: '/dashboard/categories',
        icon: lucideLibrary,
        permission: 'categorias:consultar'
    },
    {
        label: 'Tipos de productos',
        route: '/dashboard/product-types',
        icon: lucideClipboard,
        permission: 'tipos_producto:consultar'
    },
    {
        label: 'Compras',
        route: '/dashboard/purchases',
        icon: lucideShoppingCart,
        permission: 'compras:consultar'
    },
    {
        label: 'Ventas',
        route: '/dashboard/sales',
        icon: lucideArchive,
        permission: 'ventas:consultar'
    },
    {
        label: 'Inventario',
        route: '/dashboard/inventory',
        icon: lucideWarehouse,
        permission: 'inventario:consultar'
    },
    {
        label: 'Proveedores',
        route: '/dashboard/providers',
        icon: lucideMailbox,
        permission: 'proveedores:consultar'
    },
    {
        label: 'Clientes',
        route: '/dashboard/customers',
        icon: lucideUsers,
        permission: 'clientes:consultar'
    },
    {
        label: 'Facturas',
        route: '/dashboard/bills',
        icon: lucideFeather,
        permission: 'facturas:consultar'
    },
    {
        label: 'Reporte de Logs',
        route: '/dashboard/logs',
        icon: lucideLogs,
        permission: 'logs:consultar'
    },
    {
        label: 'Reportes',
        route: '/dashboard/reports',
        icon: lucideFileArchive,
        permission: 'reportes:consultar',
        children: [
            {
                label: 'Inventario',
                route: '/dashboard/reports/inventory',
                icon: lucidePackageCheck,
                permission: 'reportes:consultar_inventario'
            },
            {
                label: 'Compras',
                route: '/dashboard/reports/purchases',
                icon: lucideBadgeDollarSign,
                permission: 'reportes:consultar_compras'
            },
            {
                label: 'Ventas',
                route: '/dashboard/reports/sales',
                icon: lucideCoins,
                permission: 'reportes:consultar_ventas'
            }

        ]
    },
    {
        label: 'Administración',
        icon: lucideSettings,
        permission: 'administracion:consultar',

        children: [

            {
                label: 'Usuarios',
                route: '/dashboard/administration/users',
                icon: lucideUsers,
                permission: 'usuarios:consultar'
            },

            {
                label: 'Roles',
                route: '/dashboard/administration/roles',
                icon: lucideShield,
                permission: 'roles:consultar'
            },
            {
                label: 'Permisos',
                route: '/dashboard/administration/permissions',
                icon: lucideKey,
                permission: 'permisos:consultar'
            }

        ]
    },
    {
        label: 'Iva',
        route: '/dashboard/iva',
        icon: lucideDollarSign,
        permission: 'iva:consultar'
    }

];