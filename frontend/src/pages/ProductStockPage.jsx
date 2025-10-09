import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const ProductStockList = lazy(
	() => import('../components/ProductStocks/ProductStockList')
);

const ProductStockPage = () => {
	return (
		<LoadingPage>
			<ProductStockList />
		</LoadingPage>
	);
};

export default ProductStockPage;
