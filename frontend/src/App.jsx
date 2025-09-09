import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthContext from './store/auth-context';

import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import DashboardPage from './pages/DashboardPage';
import ClientPage from './pages/ClientPage';
import AddClientPage from './pages/AddClientPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import AgencyPage from './pages/AgencyPage';
import AddAgencyPage from './pages/AddAgencyPage';
import WarehousePage from './pages/WarehousePage';
import AddWarehousePage from './pages/AddWarehousePage';
import CategoryPage from './pages/CategoryPage';
import AddCategoryPage from './pages/AddCategoryPage';
import BatchPage from './pages/BatchPage';
import AddBatchPage from './pages/AddBatchPage';
import ProductPage from './pages/ProductPage';
import AddProductPage from './pages/AddProductPage';
import SupplierPage from './pages/SupplierPage';
import AddSupplierPage from './pages/AddSupplierPage';
import SellingChannelPage from './pages/SellingChannelPage';
import AddSellingChannelPage from './pages/AddSellingChannelPage';
import PurchasePage from './pages/PurchasePage';
import AddPurchasePage from './pages/AddPurchasePage';
import PurchaseDetailPage from './pages/PurchaseDetailPage';

function App() {
	const authCtx = useContext(AuthContext);

	return (
		<Routes>
			{!authCtx.isLoggedIn && (
				<>
					<Route path="/" element={<AuthPage />} />
					<Route
						path="*"
						element={<Navigate to="/" replace={true} />}
					/>
				</>
			)}
			{authCtx.isLoggedIn && (
				<>
					<Route
						path="/"
						element={
							<Navigate
								to="/principal/dashboard"
								replace={true}
							/>
						}
					/>
					<Route path="/principal" element={<MainPage />}>
						<Route
							index
							element={<Navigate to="dashboard" replace={true} />}
						/>
						<Route path="dashboard" element={<DashboardPage />} />
						<Route path="clientes" element={<ClientPage />} />
						<Route
							path="clientes/agregar_cliente"
							element={<AddClientPage />}
						/>
						<Route
							path="clientes/editar_cliente/:id"
							element={<AddClientPage />}
						/>
						<Route path="agencias" element={<AgencyPage />} />
						<Route
							path="agencias/agregar_agencia"
							element={<AddAgencyPage />}
						/>
						<Route
							path="agencias/editar_agencia/:id"
							element={<AddAgencyPage />}
						/>
						<Route path="almacenes" element={<WarehousePage />} />
						<Route
							path="almacenes/agregar_almacen"
							element={<AddWarehousePage />}
						/>
						<Route
							path="almacenes/editar_almacen/:id"
							element={<AddWarehousePage />}
						/>
						<Route path="categorias" element={<CategoryPage />} />
						<Route
							path="categorias/agregar_categoria"
							element={<AddCategoryPage />}
						/>
						<Route
							path="categorias/editar_categoria/:id"
							element={<AddCategoryPage />}
						/>
						<Route path="lotes" element={<BatchPage />} />
						<Route
							path="lotes/agregar_lote"
							element={<AddBatchPage />}
						/>
						<Route
							path="lotes/editar_lote/:id"
							element={<AddBatchPage />}
						/>
						<Route path="productos" element={<ProductPage />} />
						<Route
							path="productos/agregar_producto"
							element={<AddProductPage />}
						/>
						<Route
							path="productos/editar_producto/:id"
							element={<AddProductPage />}
						/>
						<Route path="proveedores" element={<SupplierPage />} />
						<Route
							path="proveedores/agregar_proveedor"
							element={<AddSupplierPage />}
						/>
						<Route
							path="proveedores/editar_proveedor/:id"
							element={<AddSupplierPage />}
						/>
						<Route
							path="canales-venta"
							element={<SellingChannelPage />}
						/>
						<Route
							path="canales-venta/agregar_canal_venta"
							element={<AddSellingChannelPage />}
						/>
						<Route
							path="canales-venta/editar_canal_venta/:id"
							element={<AddSellingChannelPage />}
						/>
						<Route path="compras" element={<PurchasePage />} />
						<Route
							path="compras/agregar_compra"
							element={<AddPurchasePage />}
						/>
						<Route
							path="compras/editar_compra/:id"
							element={<PurchaseDetailPage />}
						/>
					</Route>
					<Route
						path="*"
						element={
							<Navigate
								to="/principal/dashboard"
								replace={true}
							/>
						}
					/>
				</>
			)}
		</Routes>
	);
}

export default App;
