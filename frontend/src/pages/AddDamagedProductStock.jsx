import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddDamagedProductStock = lazy(
	() => import('../components/ProductStocks/AddDamageProductStock')
);

const AddDamagedProductStockPage = () => {
	return (
		<LoadingPage>
			<AddDamagedProductStock />
		</LoadingPage>
	);
};

export default AddDamagedProductStockPage;
