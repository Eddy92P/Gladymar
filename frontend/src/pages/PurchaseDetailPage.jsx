import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const PurchaseDetail = lazy(
	() => import('../components/Purchases/PurchaseDetail')
);

const PurchaseDetailPage = () => {
	return (
		<LoadingPage>
			<PurchaseDetail />
		</LoadingPage>
	);
};

export default PurchaseDetailPage;
