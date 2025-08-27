import { Suspense } from 'react';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingPage = props => {
	return (
		<Suspense
			fallback={
				<Backdrop
					open={true}
					sx={theme => ({
						color: '#fff',
						zIndex: theme.zIndex.drawer + 1,
					})}
				>
					<CircularProgress color="inherit" />
				</Backdrop>
			}
		>
			{props.children}
		</Suspense>
	);
};

export default LoadingPage;
