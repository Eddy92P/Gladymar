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
