import { useContext, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AuthContext from './store/auth-context';
import { StoreContext } from './store/store-context';

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
import MeasureUnitPage from './pages/MeasureUnitPage';
import AddMeasureUnitPage from './pages/AddMeasureUnitPage';
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
import SelectAgency from './components/Agencies/SelectAgency';
import SalePage from './pages/SalePage';
import AddSalePage from './pages/AddSalePage';
import SaleDetailPage from './pages/SaleDetailPage';
import EntryPage from './pages/EntryPage';
import AddEntryPage from './pages/AddEntryPage';
import EntryDetailPage from './pages/EntryDetailPage';
import AddOutputPage from './pages/AddOutputPage';
import OutputDetailPage from './pages/OutputDetailPage';
import OutputPage from './pages/OutputPage';
import ProductStockPage from './pages/ProductStockPage';
import AddDamagedProductStock from './components/ProductStocks/AddDamagedProduct';
import AddPaymentPage from './pages/AddPaymentTransaction';
import ReportPage from './pages/ReportPage';
import useIdleLogout from './hooks/useIdleLogout';

import ProtectedRoute from './components/Functional/ProtectedRoute';

function App() {
	const authCtx = useContext(AuthContext);
	const storeContext = useContext(StoreContext);

	const logout = useCallback(() => {
		storeContext.resetAgency();
		authCtx.logout();
		window.location.href = '/login';
	}, [authCtx, storeContext]);

	useIdleLogout({ timeout: 1000 * 60 * 15, onLogout: logout });

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
					{!storeContext.agency && (
						<>
							<Route path="/" element={<SelectAgency />} />
							<Route
								path="*"
								element={<Navigate to="/" replace={true} />}
							/>
						</>
					)}
					{storeContext.agency && (
						<>
							<Route path="/principal" element={<MainPage />}>
								<Route
									index
									element={<Navigate to="dashboard" replace={true} />}
								/>
								<Route path="dashboard" element={<DashboardPage />} />
								<Route path="clientes" element={
									<ProtectedRoute allowedRoles={[3, 4]}>
										<ClientPage />
									</ProtectedRoute>}
								/>
								<Route
									path="clientes/agregar_cliente"
									element={
										<ProtectedRoute allowedRoles={[3, 4]}>
											<AddClientPage />
										</ProtectedRoute>}
								/>
								<Route
									path="clientes/editar_cliente/:id"
									element={
										<ProtectedRoute allowedRoles={[3, 4]}>
											<AddClientPage />
										</ProtectedRoute>}
								/>
								<Route path="agencias" element={
									<ProtectedRoute allowedRoles={[4]}>
										<AgencyPage />
									</ProtectedRoute>}
								/>
								<Route
									path="agencias/agregar_agencia"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddAgencyPage />
										</ProtectedRoute>}
								/>
								<Route
									path="agencias/editar_agencia/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddAgencyPage />
										</ProtectedRoute>}
								/>
								<Route path="almacenes" element={
									<ProtectedRoute allowedRoles={[4]}>
										<WarehousePage />
									</ProtectedRoute>}
								/>
								<Route
									path="almacenes/agregar_almacen"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddWarehousePage />
										</ProtectedRoute>}
								/>
								<Route
									path="almacenes/editar_almacen/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddWarehousePage />
										</ProtectedRoute>}
								/>
								<Route path="categorias" element={
									<ProtectedRoute allowedRoles={[4]}>
										<CategoryPage />
									</ProtectedRoute>}
								/>
								<Route
									path="categorias/agregar_categoria"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddCategoryPage />
										</ProtectedRoute>}
								/>
								<Route
									path="categorias/editar_categoria/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddCategoryPage />
										</ProtectedRoute>}
								/>
								<Route
									path="unidades-medida"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<MeasureUnitPage />
										</ProtectedRoute>}
								/>
								<Route
									path="unidades-medida/agregar_unidad_medida"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddMeasureUnitPage />
										</ProtectedRoute>}
								/>
								<Route
									path="unidades-medida/editar_unidad_medida/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddMeasureUnitPage />
										</ProtectedRoute>}
								/>
								<Route path="lotes" element={
									<ProtectedRoute allowedRoles={[4]}>
										<BatchPage />
									</ProtectedRoute>}
								/>
								<Route
									path="lotes/agregar_lote"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddBatchPage />
										</ProtectedRoute>}
								/>
								<Route
									path="lotes/editar_lote/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddBatchPage />
										</ProtectedRoute>}
								/>
								<Route path="productos" element={
									<ProtectedRoute allowedRoles={[4]}>
										<ProductPage />
									</ProtectedRoute>}
								/>
								<Route
									path="productos/agregar_producto"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddProductPage />
										</ProtectedRoute>}
								/>
								<Route
									path="productos/editar_producto/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddProductPage />
										</ProtectedRoute>}
								/>
								<Route path="proveedores" element={
									<ProtectedRoute allowedRoles={[4]}>
										<SupplierPage />
									</ProtectedRoute>}
								/>
								<Route
									path="proveedores/agregar_proveedor"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddSupplierPage />
										</ProtectedRoute>}
								/>
								<Route
									path="proveedores/editar_proveedor/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddSupplierPage />
										</ProtectedRoute>}
								/>
								<Route
									path="canales-venta"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<SellingChannelPage />
										</ProtectedRoute>}
								/>
								<Route
									path="canales-venta/agregar_canal_venta"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddSellingChannelPage />
										</ProtectedRoute>}
								/>
								<Route
									path="canales-venta/editar_canal_venta/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddSellingChannelPage />
										</ProtectedRoute>}
								/>
								<Route path="compras" element={
									<ProtectedRoute allowedRoles={[2, 4]}>
										<PurchasePage />
									</ProtectedRoute>}
								/>
								<Route
									path="compras/agregar_compra"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddPurchasePage />
										</ProtectedRoute>}
								/>
								<Route
									path="compras/editar_compra/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<PurchaseDetailPage />
										</ProtectedRoute>}
								/>
								<Route
									path="compras/agregar_entrada/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddEntryPage />
										</ProtectedRoute>}
								/>
								<Route
									path="compras/agregar_pago/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddPaymentPage />
										</ProtectedRoute>}
								/>
								<Route path="ventas" element={
									<ProtectedRoute allowedRoles={[1, 2, 3, 4]}>
										<SalePage />
									</ProtectedRoute>}
								/>
								<Route
									path="ventas/agregar_venta"
									element={
										<ProtectedRoute allowedRoles={[3, 4]}>
											<AddSalePage />
										</ProtectedRoute>}
								/>
								<Route
									path="ventas/editar_venta/:id"
									element={
										<ProtectedRoute allowedRoles={[1, 4]}>
											<AddSalePage />
										</ProtectedRoute>}
								/>
								<Route
									path="ventas/info_venta/:id"
									element={
										<ProtectedRoute allowedRoles={[1, 3, 4]}>
											<SaleDetailPage />
										</ProtectedRoute>}
								/>
								<Route
									path="ventas/agregar_salida/:id"
									element={
										<ProtectedRoute allowedRoles={[2, 4]}>
											<AddOutputPage />
										</ProtectedRoute>}
								/>
								<Route
									path="ventas/agregar_pago/:id"
									element={
										<ProtectedRoute allowedRoles={[1, 4]}>
											<AddPaymentPage />
										</ProtectedRoute>}
								/>
								<Route path="entradas" element={
									<ProtectedRoute allowedRoles={[1, 2, 4]}>
										<EntryPage />
									</ProtectedRoute>}
								/>
								<Route
									path="entradas/agregar_entrada"
									element={
										<ProtectedRoute allowedRoles={[2, 4]}>
											<AddEntryPage />
										</ProtectedRoute>}
								/>
								<Route
									path="entradas/info_entrada/:id"
									element={
										<ProtectedRoute allowedRoles={[2, 4]}>
											<EntryDetailPage />
										</ProtectedRoute>}
								/>
								<Route path="salidas" element={
									<ProtectedRoute allowedRoles={[2, 4]}>
										<OutputPage />
									</ProtectedRoute>}
								/>
								<Route
									path="salidas/agregar_salida"
									element={
										<ProtectedRoute allowedRoles={[2, 4]}>
											<AddOutputPage />
										</ProtectedRoute>}
								/>
								<Route
									path="salidas/info_salida/:id"
									element={
										<ProtectedRoute allowedRoles={[2, 4]}>
											<OutputDetailPage />
										</ProtectedRoute>}
								/>
								<Route
									path="product_stocks"
									element={
										<ProtectedRoute allowedRoles={[2, 4]}>
											<ProductStockPage />
										</ProtectedRoute>}
								/>
								<Route
									path="product_stocks/increment-damaged-stock/:id"
									element={
										<ProtectedRoute allowedRoles={[4]}>
											<AddDamagedProductStock />
										</ProtectedRoute>}
								/>
								<Route path="reportes" element={
									<ProtectedRoute allowedRoles={[4]}>
										<ReportPage />
									</ProtectedRoute>}
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
				</>
			)}
		</Routes>
	);
}

export default App;
