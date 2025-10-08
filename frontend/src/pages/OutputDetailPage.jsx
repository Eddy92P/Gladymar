import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const OutputDetail = lazy(() => import('../components/Outputs/OutputDetail'));

const OutputDetailPage = () => {
	return (
		<LoadingPage>
			<OutputDetail />
		</LoadingPage>
	);
};

export default OutputDetailPage;
