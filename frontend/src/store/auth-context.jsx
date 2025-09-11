import React, { useState, useCallback } from 'react';

// let logoutTimer;

const AuthContext = React.createContext({
	token: '',
	perms: [],
	isLoggedIn: false,
	login: () => {},
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

const retrieveStoredIsSuperuser = () => {
	const storedIsSuperuser = sessionStorage.getItem('is_superuser');

	return {
		isSuperuser: storedIsSuperuser,
	};
};

export const AuthContextProvider = props => {
	const tokenData = retrieveStoredToken();
	const permissionsData = retrieveStoredPermissions();
	const nameData = retrieveStoredName();
	const lastNameData = retrieveStoredLastName();
	const isSuperuserData = retrieveStoredIsSuperuser();

	let initialToken;
	let initialPermission;
	let initialName;
	let initialLastName;
	let initialIsSuperUser;

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

	if (isSuperuserData) {
		initialIsSuperUser = isSuperuserData.isSuperuser;
	}

	const [token, setToken] = useState(initialToken);
	const [permissions, setPermissions] = useState(initialPermission);
	const [name, setName] = useState(initialName);
	const [lastName, setLastName] = useState(initialLastName);
	const [isSuperuser, setIsSuperuser] = useState(initialIsSuperUser);

	const userIsLoggedIn = !!token;
	const userPermissions = permissions;
	const userName = name;
	const userLastName = lastName;
	const userIsSuperuser = isSuperuser;

	const logoutHandler = useCallback(() => {
		setToken(null);
		setPermissions(null);
		setName(null);
		setLastName(null);
		setIsSuperuser(null);
		sessionStorage.removeItem('agency');
		sessionStorage.removeItem('token');
		sessionStorage.removeItem('permissions');
		sessionStorage.removeItem('name');
		sessionStorage.removeItem('last_name');
		sessionStorage.removeItem('is_superuser');

		// Disparar evento personalizado para resetear la agencia
		window.dispatchEvent(new CustomEvent('userLogout'));
	}, []);

	const loginHandler = (
		token,
		permissions,
		name,
		last_name,
		is_superuser
	) => {
		setToken(token);
		setPermissions(permissions);
		setName(name);
		setLastName(last_name);
		setIsSuperuser(is_superuser);

		sessionStorage.setItem('token', token);
		sessionStorage.setItem('permissions', JSON.stringify(permissions));
		sessionStorage.setItem('name', name);
		sessionStorage.setItem('last_name', last_name);
		sessionStorage.setItem('is_superuser', is_superuser);
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
		isSuperuser: userIsSuperuser,
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
