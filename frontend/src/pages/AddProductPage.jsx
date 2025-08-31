import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddProduct = lazy(() => import('../components/Products/AddProduct'));

const AddProductPage = () => {
	return (
		<LoadingPage>
			<AddProduct />
		</LoadingPage>
	);
};

export default AddProductPage;
