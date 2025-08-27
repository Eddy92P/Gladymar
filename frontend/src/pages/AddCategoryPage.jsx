import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddCategory = lazy(() => import('../components/Categories/AddCategory'));

const AddCategoryPage = () => {
	return (
		<LoadingPage>
			<AddCategory />
		</LoadingPage>
	);
};

export default AddCategoryPage;
