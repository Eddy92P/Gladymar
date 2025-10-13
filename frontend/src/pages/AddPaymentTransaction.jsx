import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddPayment = lazy(
	() => import('../components/Payments/AddPaymentTransaction')
);

const AddPaymentPage = () => {
	return (
		<LoadingPage>
			<AddPayment />
		</LoadingPage>
	);
};

export default AddPaymentPage;
