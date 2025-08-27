import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const Dashboard = lazy(() => import('../components/Dashboard/Dashboard'));

const DashboardPage = () => {
	return (
		<LoadingPage>
			<Dashboard />
		</LoadingPage>
	);
};

export default DashboardPage;
