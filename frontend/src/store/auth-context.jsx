import React, { useState, useCallback } from 'react';

// let logoutTimer;

const AuthContext = React.createContext({
	token: '',
	perms: [],
	isLoggedIn: false,
	login: token => {},
	logout: () => {},
});

// const calculateRemainingTime = (expirationTime) => {
//   const currentTime = new Date().getTime();
//   const adjExpirationTime = new Date(expirationTime).getTime();

//   const remainingDuration = adjExpirationTime - currentTime;

//   return remainingDuration;
// };

const retrieveStoredToken = () => {
	const storedToken = sessionStorage.getItem('token');

	return {
		token: storedToken,
	};
};

const retrieveStoredPermissions = () => {
	const storedPermissions = JSON.parse(sessionStorage.getItem('permissions'));

	return {
		permissions: storedPermissions,
	};
};

const retrieveStoredName = () => {
	const storedName = sessionStorage.getItem('name');

	return {
		name: storedName,
	};
};

const retrieveStoredLastName = () => {
	const storedLastName = sessionStorage.getItem('last_name');

	return {
		lastName: storedLastName,
	};
};

export const AuthContextProvider = props => {
	const tokenData = retrieveStoredToken();
	const permissionsData = retrieveStoredPermissions();
	const nameData = retrieveStoredName();
	const lastNameData = retrieveStoredLastName();

	let initialToken;
	let initialPermission;
	let initialName;
	let initialLastName;

	if (tokenData) {
		initialToken = tokenData.token;
	}

	if (permissionsData) {
		initialPermission = permissionsData.permissions;
	}

	if (nameData) {
		initialName = nameData.name;
	}

	if (lastNameData) {
		initialLastName = lastNameData.lastName;
	}

	const [token, setToken] = useState(initialToken);
	const [permissions, setPermissions] = useState(initialPermission);
	const [name, setName] = useState(initialName);
	const [lastName, setLastName] = useState(initialLastName);

	const userIsLoggedIn = !!token;
	const userPermissions = permissions;
	const userName = name;
	const userLastName = lastName;

	const logoutHandler = useCallback(() => {
		setToken(null);
		sessionStorage.removeItem('token');
		sessionStorage.removeItem('permissions');
		sessionStorage.removeItem('name');
		sessionStorage.removeItem('last_name');
	}, []);

	const loginHandler = (
		token,
		permissions,
		name,
		last_name,
		expirationTime
	) => {
		setToken(token);
		setPermissions(permissions);
		setName(name);
		setLastName(last_name);

		sessionStorage.setItem('token', token);
		sessionStorage.setItem('permissions', JSON.stringify(permissions));
		sessionStorage.setItem('name', name);
		sessionStorage.setItem('last_name', last_name);
	};

	// useEffect(() => {
	//   if (tokenData) {
	//     logoutTimer = setTimeout(logoutHandler, tokenData.duration);
	//   }
	// }, [tokenData, logoutHandler]);

	const contextValue = {
		token: token,
		permissions: userPermissions,
		name: userName,
		lastName: userLastName,
		isLoggedIn: userIsLoggedIn,
		login: loginHandler,
		logout: logoutHandler,
	};

	return (
		<AuthContext.Provider value={contextValue}>
			{props.children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
