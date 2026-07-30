import React, { useState, useEffect } from 'react';

const StoreContext = React.createContext({
	agency: '',
	chooseAgency: () => {},
	resetAgency: () => {},
});

const retrieveStoredAgency = () => {
	const storedAgency = sessionStorage.getItem('agency');
	const storedAgencyName = sessionStorage.getItem('agencyName');

	return {
		agency: storedAgency,
		agencyName: storedAgencyName,
	};
};

export const StoreContextProvider = props => {
	const agencyData = retrieveStoredAgency();

	let initialAgency;
	let initialAgencyName;
	if (agencyData) {
		initialAgency = agencyData.agency;
		initialAgencyName = agencyData.agencyName;
	}

	const [agency, setAgency] = useState(initialAgency);
	const [agencyName, setAgencyName] = useState(initialAgencyName);
	const userAgency = agency;
	const userAgencyName = agencyName;
	const chooseAgencyHandler = (agency, name) => {
		setAgency(agency);
		sessionStorage.setItem('agency', agency);
		setAgencyName(name);
		sessionStorage.setItem('agencyName', name);
	};

	const resetAgencyHandler = () => {
		setAgency(null);
		sessionStorage.removeItem('agency');
		sessionStorage.removeItem('agencyName');
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
		agencyName: userAgencyName,
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
