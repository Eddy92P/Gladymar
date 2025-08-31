import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddSupplier = lazy(() => import('../components/Suppliers/AddSupplier'));

const AddSupplierPage = () => {
	return (
		<LoadingPage>
			<AddSupplier />
		</LoadingPage>
	);
};

export default AddSupplierPage;
