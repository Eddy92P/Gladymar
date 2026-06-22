import { lazy } from 'react';

import LoadingPage from './LoadingPage';

const MeasureUnitList = lazy(
	() => import('../components/MeasureUnits/MeasureUnitList')
);

const MeasureUnitPage = () => {
	return (
		<LoadingPage>
			<MeasureUnitList />
		</LoadingPage>
	);
};

export default MeasureUnitPage;
