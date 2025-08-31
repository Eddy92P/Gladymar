import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const ProductList = lazy(() => import('../components/Products/ProductList'));

const ProductPage = () => {
	return (
		<LoadingPage>
			<ProductList />
		</LoadingPage>
	);
};

export default ProductPage;
