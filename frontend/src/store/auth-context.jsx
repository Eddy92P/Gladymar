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

const retrieveStoredOptions = () => {
    const storedOptions = JSON.parse(sessionStorage.getItem('options'));

    return {
        options: storedOptions,
    };
};

const retrieveStoredName = () => {
    const storedName = sessionStorage.getItem('name');

    return {
        name: storedName,
    };
};

export const AuthContextProvider = props => {
    const tokenData = retrieveStoredToken();
    const optionsData = retrieveStoredOptions();
    const nameData = retrieveStoredName();

    let initialToken;
    let initialOptions;
    let initialName;

    if (tokenData) {
        initialToken = tokenData.token;
    }

    if (optionsData) {
        initialOptions = optionsData.options;
    }

    if (nameData) {
        initialName = nameData.name;
    }

    const [token, setToken] = useState(initialToken);
    const [options, setOptions] = useState(initialOptions);
    const [name, setName] = useState(initialName);

    const userIsLoggedIn = !!token;
    const userOptions = options;
    const userName = name;

    const logoutHandler = useCallback(() => {
        setToken(null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('options');
        sessionStorage.removeItem('name');
    }, []);

    const loginHandler = (token, options, name, expirationTime) => {
        setToken(token);
        setOptions(options);
        setName(name);

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('options', JSON.stringify(options));
        sessionStorage.setItem('name', name);
    };

    // useEffect(() => {
    //   if (tokenData) {
    //     logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    //   }
    // }, [tokenData, logoutHandler]);

    const contextValue = {
        token: token,
        options: userOptions,
        name: userName,
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
