import React, { useState, useEffect, useContext } from 'react';

// Components
import Filter from '../UI/List/Filter';
import TableList from '../UI/Table/TableList';

// Configs
import { api, config } from '../../Constants';

// Context
import AuthContext from '../../store/auth-context';

const AddProductList = ({ onClose }) => {
	const [list, setList] = useState([]);
	const [error, setError] = useState('');
	const [filterText, setFilterText] = useState('');
	const [showModal, setShowModal] = useState(true);

	const authContext = useContext(AuthContext);

	useEffect(() => {
		let url = config.url.HOST + api.API_URL_PRODUCTS;
		let isMounted = true;

		const controller = new AbortController();

		if (filterText) {
			url += `?search=${filterText}`;
		}

		const fetchProducts = async () => {
			try {
				const response = await fetch(url, {
					method: 'GET',
					headers: {
						Authorization: `Token ${authContext.token}`,
						'Content-Type': 'application/json',
					},
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error('Failed to fetch Products');
				}

				const data = await response.json();

				if (isMounted) {
					const parsedList = data.rows.map(listData => {
						return {
							name: listData.name,
							code: listData.code,
						};
					});
					setList(parsedList);
				}
			} catch (error) {
				if (error.name === 'AbortError') {
					return;
				}
				if (isMounted) {
					setError(error.message);
				}
			}
		};

		fetchProducts();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [authContext.token, filterText]);

	const handleCloseModal = () => {
		setShowModal(false);
		if (onClose) {
			onClose();
		}
	};

	return (
		<>
			{error && (
				<div style={{ color: 'red', margin: '10px 0' }}>{error}</div>
			)}
			<TableList
				data={list}
				open={showModal}
				onClose={handleCloseModal}
				filterComponent={
					<Filter onFilter={e => setFilterText(e.target.value)} />
				}
			/>
		</>
	);
};

export default React.memo(AddProductList);
