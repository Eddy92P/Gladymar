import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const OutputList = lazy(() => import('../components/Outputs/OutputList'));

const OutputPage = () => {
	return (
		<LoadingPage>
			<OutputList />
		</LoadingPage>
	);
};

export default OutputPage;
