import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const SellingChannelList = lazy(
	() => import('../components/SellingChannel/SellingChannelList')
);

const SellingChannelPage = () => {
	return (
		<LoadingPage>
			<SellingChannelList />
		</LoadingPage>
	);
};

export default SellingChannelPage;
