import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const SelectAgency = lazy(() => import('../components/Agencies/SelectAgency'));

const SelectAgencyPage = () => {
	return (
		<LoadingPage>
			<SelectAgency />
		</LoadingPage>
	);
};

export default SelectAgencyPage;
