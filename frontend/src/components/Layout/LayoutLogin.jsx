import { useEffect, useState } from 'react';

import classes from './LayoutLogin.module.css';

const getWindowSize = () => {
	const { innerWidth, innerHeight } = window;
	return { innerWidth, innerHeight };
};

const Layout = props => {
	const [windowSize, setWindowSize] = useState(getWindowSize());
	const [imageLoaded, setImageLoaded] = useState(false);

	useEffect(() => {
		function handleWindowResize() {
			setWindowSize(getWindowSize());
		}

		window.addEventListener('resize', handleWindowResize);

		return () => {
			window.removeEventListener('resize', handleWindowResize);
		};
	}, []);

	// Preload the background image to ensure it's available
	useEffect(() => {
		const img = new Image();
		img.onload = () => setImageLoaded(true);
		img.onerror = () => setImageLoaded(false);
		img.src = '/gladymarfondo.jpg';
	}, []);

	return (
		<div>
			<main
				className={`${classes.main} ${
					windowSize.innerWidth <= 980 && classes.small
				} ${imageLoaded ? classes.imageLoaded : classes.imageLoading}`}
			>
				{props.children}
			</main>
		</div>
	);
};

export default Layout;
