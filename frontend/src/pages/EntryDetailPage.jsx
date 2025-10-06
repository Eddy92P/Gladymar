import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const EntryDetail = lazy(() => import('../components/Entries/EntryDetail'));

const EntryDetailPage = () => {
	return (
		<LoadingPage>
			<EntryDetail />
		</LoadingPage>
	);
};

export default EntryDetailPage;
