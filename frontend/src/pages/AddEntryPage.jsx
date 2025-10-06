import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddEntry = lazy(() => import('../components/Entries/AddEntry'));

const AddEntryPage = () => {
	return (
		<LoadingPage>
			<AddEntry />
		</LoadingPage>
	);
};

export default AddEntryPage;
