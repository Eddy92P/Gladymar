import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddClient = lazy(() => import('../components/Clients/AddClient'));

const AddClientPage = () => {
	return (
		<LoadingPage>
			<AddClient />
		</LoadingPage>
	);
};

export default AddClientPage;
