import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddSale = lazy(() => import('../components/Sales/AddSale'));

const AddSalePage = () => {
	return (
		<LoadingPage>
			<AddSale />
		</LoadingPage>
	);
};

export default AddSalePage;
