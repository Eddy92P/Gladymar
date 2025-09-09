import {
	People,
	Store,
	Inventory,
	Category,
	Workspaces,
} from '@mui/icons-material';
import ProductIcon from '/box.png';
import SupplierIcon from '/supplier.png';
import SellingChannelIcon from '/network-connection.png';
import PurchaseIcon from '/buy-button.png';
import DoubleEntryIcon from '/double-entry.png';
import SaleIcon from '/coupon.png';
import PaymentIcon from '/wallet.png';

export const options = [
	{
		key: 'clients',
		label: 'Clientes',
		path: 'clientes',
		permission: 'core.view_client',
		icon: People,
	},
	{
		key: 'agencies',
		label: 'Agencias',
		path: 'agencias',
		permission: 'core.view_agency',
		icon: Store,
	},
	{
		key: 'warehouses',
		label: 'Almacenes',
		path: 'almacenes',
		permission: 'core.view_warehouse',
		icon: Inventory,
	},
	{
		key: 'categories',
		label: 'Categorias',
		path: 'categorias',
		permission: 'core.view_category',
		icon: Category,
	},
	{
		key: 'batches',
		label: 'Lotes',
		path: 'lotes',
		permission: 'core.view_batch',
		icon: Workspaces,
	},
	{
		key: 'products',
		label: 'Productos',
		path: 'productos',
		permission: 'core.view_product',
		icon: () => (
			<img
				src={ProductIcon}
				alt="Productos"
				style={{ width: '24px', height: '24px' }}
			/>
		),
	},
	{
		key: 'suppliers',
		label: 'Proveedores',
		path: 'proveedores',
		permission: 'core.view_supplier',
		icon: () => (
			<img
				src={SupplierIcon}
				alt="Proveedores"
				style={{ width: '24px', height: '24px' }}
			/>
		),
	},
	{
		key: 'selling_channels',
		label: 'Canales de Venta',
		path: 'canales-venta',
		permission: 'core.view_sellingchannel',
		icon: () => (
			<img
				src={SellingChannelIcon}
				alt="Canales de Venta"
				style={{ width: '24px', height: '24px' }}
			/>
		),
	},
	{
		key: 'purchases',
		label: 'Compras',
		path: 'compras',
		permission: 'core.view_purchase',
		icon: () => (
			<img
				src={PurchaseIcon}
				alt="Compras"
				style={{ width: '24px', height: '24px' }}
			/>
		),
	},
	{
		key: 'sales',
		label: 'Ventas',
		path: 'ventas',
		permission: 'core.view_sale',
		icon: () => (
			<img
				src={SaleIcon}
				alt="Ventas"
				style={{ width: '24px', height: '24px' }}
			/>
		),
	},
	{
		key: 'payments',
		label: 'Pagos',
		path: 'pagos',
		permission: 'core.view_payment',
		icon: () => (
			<img
				src={PaymentIcon}
				alt="Pagos"
				style={{ width: '24px', height: '24px' }}
			/>
		),
	},
	{
		key: 'entries',
		label: 'Entradas',
		path: 'entradas',
		permission: 'core.view_entry',
		icon: () => (
			<img
				src={DoubleEntryIcon}
				alt="Entradas"
				style={{ width: '24px', height: '24px' }}
			/>
		),
	},
	{
		key: 'outputs',
		label: 'Salidas',
		path: 'salidas',
		permission: 'core.view_output',
		icon: () => (
			<img
				src={DoubleEntryIcon}
				alt="Salidas"
				style={{ width: '24px', height: '24px' }}
			/>
		),
	},
];
