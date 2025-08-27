import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const WarehouseList = lazy(
	() => import('../components/Warehouses/WarehouseList')
);

const WarehousePage = () => {
	return (
		<LoadingPage>
			<WarehouseList />
		</LoadingPage>
	);
};

export default WarehousePage;
