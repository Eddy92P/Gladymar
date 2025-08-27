import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddWarehouse = lazy(
	() => import('../components/Warehouses/AddWarehouse')
);

const AddWarehousePage = () => {
	return (
		<LoadingPage>
			<AddWarehouse />
		</LoadingPage>
	);
};

export default AddWarehousePage;
