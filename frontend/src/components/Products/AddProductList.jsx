import React, { useState, useEffect } from 'react';

// Components
import Filter from '../UI/List/Filter';
import TableList from '../UI/Table/TableList';

// Configs
import { api } from '../../Constants';

// Context
import authFetch from '../../api/authFetch';

const AddProductList = ({ onClose, onProductList, addedProducts = [] }) => {
	const [list, setList] = useState([]);
	const [error, setError] = useState('');
	const [filterText, setFilterText] = useState('');
	const [showModal, setShowModal] = useState(true);


	useEffect(() => {
		const API = import.meta.env.VITE_API_URL;
		let url = `${API}${api.API_URL_ALL_PRODUCTS}`;
		let isMounted = true;

		const controller = new AbortController();

		if (filterText) {
			url += `?search=${filterText}`;
		}

		const fetchProducts = async () => {
			try {
				const response = await authFetch(url, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error('Failed to fetch Products');
				}

				const data = await response.json();

				if (isMounted) {
					const parsedList = data.map(listData => {
						return {
							id: listData.id,
							batch: listData.batch__name,
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
	}, [filterText]);

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
				onProductList={onProductList}
				onClose={handleCloseModal}
				addedProducts={addedProducts}
				filterComponent={
					<Filter onFilter={e => setFilterText(e.target.value)} />
				}
			/>
		</>
	);
};

export default React.memo(AddProductList);
