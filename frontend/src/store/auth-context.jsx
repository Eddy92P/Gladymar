import React, { useState, useCallback } from 'react';
import { api } from '../Constants';

const AuthContext = React.createContext({
	token: '',
	perms: [],
	isLoggedIn: false,
	login: () => {},
	logout: () => {},
});

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

const retrieveStoredUserType = () => {
	const storedUserType = sessionStorage.getItem('user_type');

	return {
		userType: storedUserType,
	};
};

export const AuthContextProvider = props => {
	const tokenData = retrieveStoredToken();
	const permissionsData = retrieveStoredPermissions();
	const nameData = retrieveStoredName();
	const lastNameData = retrieveStoredLastName();
	const isSuperuserData = retrieveStoredIsSuperuser();
	const userTypeData = retrieveStoredUserType();

	let initialToken;
	let initialPermission;
	let initialName;
	let initialLastName;
	let initialIsSuperUser;
	let initialUserType;

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

	if (userTypeData) {
		initialUserType = userTypeData.userType;
	}

	const [token, setToken] = useState(initialToken);
	const [permissions, setPermissions] = useState(initialPermission);
	const [name, setName] = useState(initialName);
	const [lastName, setLastName] = useState(initialLastName);
	const [isSuperuser, setIsSuperuser] = useState(initialIsSuperUser);
	const [type, setType] = useState(initialUserType);

	const userIsLoggedIn = !!token;
	const userPermissions = permissions;
	const userName = name;
	const userLastName = lastName;
	const userIsSuperuser = isSuperuser;
	const userType = type;

	const logoutHandler = useCallback(() => {
		setToken(null);
		setPermissions(null);
		setName(null);
		setLastName(null);
		setIsSuperuser(null);
		setType(null);
		sessionStorage.removeItem('agency');
		sessionStorage.removeItem('token');
		sessionStorage.removeItem('permissions');
		sessionStorage.removeItem('name');
		sessionStorage.removeItem('last_name');
		sessionStorage.removeItem('is_superuser');
		sessionStorage.removeItem('user_type');

		const API = import.meta.env.VITE_API_URL;
		const urlLogout = `${API}${api.API_URL_LOGOUT}`;
		
		fetch(urlLogout, {
			method: 'POST',
			credentials: 'include',
		}).catch(error => {
			console.error('Error al cerrar sesión:', error);
		});

		// Disparar evento personalizado para resetear la agencia
		window.dispatchEvent(new CustomEvent('userLogout'));
	}, []);

	const loginHandler = (
		token,
		permissions,
		name,
		last_name,
		is_superuser,
		user_type
	) => {
		setToken(token);
		setPermissions(permissions);
		setName(name);
		setLastName(last_name);
		setIsSuperuser(is_superuser);
		setType(user_type);

		sessionStorage.setItem('token', token);
		sessionStorage.setItem('permissions', JSON.stringify(permissions));
		sessionStorage.setItem('name', name);
		sessionStorage.setItem('last_name', last_name);
		sessionStorage.setItem('is_superuser', is_superuser);
		sessionStorage.setItem('user_type', user_type);
	};

	const contextValue = {
		token: token,
		permissions: userPermissions,
		name: userName,
		lastName: userLastName,
		isSuperuser: userIsSuperuser,
		userType: userType,
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
