import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const BatchList = lazy(() => import('../components/Batches/BatchList'));

const BatchPage = () => {
	return (
		<LoadingPage>
			<BatchList />
		</LoadingPage>
	);
};

export default BatchPage;
