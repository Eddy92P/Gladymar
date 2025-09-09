import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddPurchase = lazy(() => import('../components/Purchases/AddPurchase'));

const AddPurchasePage = () => {
	return (
		<LoadingPage>
			<AddPurchase />
		</LoadingPage>
	);
};

export default AddPurchasePage;
