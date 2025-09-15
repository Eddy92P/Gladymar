import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const SaleList = lazy(() => import('../components/Sales/SaleList'));

const SalePage = () => {
	return (
		<LoadingPage>
			<SaleList />
		</LoadingPage>
	);
};

export default SalePage;
