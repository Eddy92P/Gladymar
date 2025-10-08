import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddOutput = lazy(() => import('../components/Outputs/AddOutput'));

const AddOutputPage = () => {
	return (
		<LoadingPage>
			<AddOutput />
		</LoadingPage>
	);
};

export default AddOutputPage;
