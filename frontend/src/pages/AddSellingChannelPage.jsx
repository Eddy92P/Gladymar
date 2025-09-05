import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddSellingChannel = lazy(
	() => import('../components/SellingChannel/AddSellingChannel')
);

const AddSellingChannelPage = () => {
	return (
		<LoadingPage>
			<AddSellingChannel />
		</LoadingPage>
	);
};

export default AddSellingChannelPage;
