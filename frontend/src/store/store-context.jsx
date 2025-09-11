import React, { useState, useEffect } from 'react';

const StoreContext = React.createContext({
	agency: '',
	chooseAgency: () => {},
	resetAgency: () => {},
});

const retrieveStoredAgency = () => {
	const storedAgency = sessionStorage.getItem('agency');

	return {
		agency: storedAgency,
	};
};

export const StoreContextProvider = props => {
	const agencyData = retrieveStoredAgency();

	let initialAgency;

	if (agencyData) {
		initialAgency = agencyData.agency;
	}

	const [agency, setAgency] = useState(initialAgency);

	const userAgency = agency;

	const chooseAgencyHandler = agency => {
		setAgency(agency);
		sessionStorage.setItem('agency', agency);
	};

	const resetAgencyHandler = () => {
		setAgency(null);
		sessionStorage.removeItem('agency');
	};

	// Escuchar el evento de logout para resetear la agencia
	useEffect(() => {
		const handleUserLogout = () => {
			resetAgencyHandler();
		};

		window.addEventListener('userLogout', handleUserLogout);

		return () => {
			window.removeEventListener('userLogout', handleUserLogout);
		};
	}, []);

	const contextValue = {
		agency: userAgency,
		chooseAgency: chooseAgencyHandler,
		resetAgency: resetAgencyHandler,
	};

	return (
		<StoreContext.Provider value={contextValue}>
			{props.children}
		</StoreContext.Provider>
	);
};

export { StoreContext };
