import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const PurchaseList = lazy(() => import('../components/Purchases/PurchaseList'));

const PurchasePage = () => {
	return (
		<LoadingPage>
			<PurchaseList />
		</LoadingPage>
	);
};

export default PurchasePage;
