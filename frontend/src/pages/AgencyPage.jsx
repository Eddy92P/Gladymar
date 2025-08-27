import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AgencyList = lazy(() => import('../components/Agencies/AgencyList'));

const AgencyPage = () => {
	return (
		<LoadingPage>
			<AgencyList />
		</LoadingPage>
	);
};

export default AgencyPage;
