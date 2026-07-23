import React, { useState, useCallback } from 'react';

const PaginationContext = React.createContext({
	getPagination: () => undefined,
	setPagination: () => {},
});

export const PaginationContextProvider = props => {
	const [paginationByKey, setPaginationByKey] = useState({});

	const getPagination = useCallback(
		key => paginationByKey[key],
		[paginationByKey]
	);

	const setPagination = useCallback((key, value) => {
		setPaginationByKey(prev => ({
			...prev,
			[key]: { ...prev[key], ...value },
		}));
	}, []);

	return (
		<PaginationContext.Provider value={{ getPagination, setPagination }}>
			{props.children}
		</PaginationContext.Provider>
	);
};

export default PaginationContext;
