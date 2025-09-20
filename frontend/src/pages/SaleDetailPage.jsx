import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const SaleDetail = lazy(() => import('../components/Sales/SaleDetail'));

const SaleDetailPage = () => {
	return (
		<LoadingPage>
			<SaleDetail />
		</LoadingPage>
	);
};

export default SaleDetailPage;
