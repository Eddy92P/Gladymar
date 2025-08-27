import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddBatch = lazy(() => import('../components/Batches/AddBatch'));

const AddBatchPage = () => {
	return (
		<LoadingPage>
			<AddBatch />
		</LoadingPage>
	);
};

export default AddBatchPage;
