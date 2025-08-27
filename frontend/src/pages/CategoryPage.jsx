import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const CategoryList = lazy(
	() => import('../components/Categories/CategoryList')
);

const CategoryPage = () => {
	return (
		<LoadingPage>
			<CategoryList />
		</LoadingPage>
	);
};

export default CategoryPage;
