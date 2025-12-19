import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const Report = lazy(() => import('../components/Reports/ReportList'));

const ReportPage = () => {
	return (
		<LoadingPage>
			<Report />
		</LoadingPage>
	);
};

export default ReportPage;
