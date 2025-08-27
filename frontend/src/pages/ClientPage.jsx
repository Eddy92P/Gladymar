import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const ClientList = lazy(() => import('../components/Clients/ClientList'));

const ClientPage = () => {
	return (
		<LoadingPage>
			<ClientList />
		</LoadingPage>
	);
};

export default ClientPage;
