import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const AddMeasureUnit = lazy(
	() => import('../components/MeasureUnits/AddMeasureUnit')
);

const AddMeasureUnitPage = () => {
	return (
		<LoadingPage>
			<AddMeasureUnit />
		</LoadingPage>
	);
};

export default AddMeasureUnitPage;
