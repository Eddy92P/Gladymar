import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const EntryList = lazy(() => import('../components/Entries/EntryList'));

const EntryPage = () => {
	return (
		<LoadingPage>
			<EntryList />
		</LoadingPage>
	);
};

export default EntryPage;
