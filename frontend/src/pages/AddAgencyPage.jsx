import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddAgency = lazy(() => import('../components/Agencies/AddAgency'));

const AddAgencyPage = () => {
	return (
		<LoadingPage>
			<AddAgency />
		</LoadingPage>
	);
};

export default AddAgencyPage;
