import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const SupplierList = lazy(() => import('../components/Suppliers/SupplierList'));

const SupplierPage = () => {
	return (
		<LoadingPage>
			<SupplierList />
		</LoadingPage>
	);
};

export default SupplierPage;
