import React, { useState, useEffect, useContext } from 'react';

// Components
import Filter from '../UI/List/Filter';
import ProductDetailedTable from '../UI/Table/ProductDetailedTable';

// Configs
import { api, config } from '../../Constants';

// Context
import AuthContext from '../../store/auth-context';

const AddProductDetailedList = ({
	onClose,
	onProductList,
	addedProducts = [],
	sellingChannel,
	warehouse,
}) => {
	const [list, setList] = useState([]);
	const [error, setError] = useState('');
	const [filterText, setFilterText] = useState('');
	const [showModal, setShowModal] = useState(true);

	const authContext = useContext(AuthContext);

	useEffect(() => {
		let url = '';
		if (sellingChannel || warehouse) {
			url = config.url.HOST + api.API_URL_CATALOG;
		} else {
			url = config.url.HOST + api.API_URL_PRODUCTS;
		}
		let isMounted = true;

		const controller = new AbortController();

		if (sellingChannel) {
			url += `?selling_channel_id=${sellingChannel.id}`;
		}
		if (warehouse) {
			url += `?warehouse_id=${sellingChannel.id}`;
		}
		if (filterText && (sellingChannel || warehouse)) {
			url += `&?search=${filterText}`;
		} else if (filterText) {
			url += `?search=${filterText}`;
		}

		const fetchProducts = async () => {
			try {
				let products = [];
				if (sellingChannel || warehouse) {
					let allProducts = [];
					const response = await fetch(url, {
						method: 'GET',
						headers: {
							Authorization: `Token ${authContext.token}`,
							'Content-Type': 'application/json',
						},
						signal: controller.signal,
					});

					if (!response.ok) {
						throw new Error(
							'Failed to fetch Products from Selling Channel'
						);
					}
					const productStockData = await response.json();
					allProducts = productStockData.map(item => ({
						id: item.id,
						name: item.name,
						code: item.code,
						price: item.price,
						stock: item.stock,
						minimumSalePrice: item.minimum_sale_price,
						maximumSalePrice: item.maximum_sale_price,
					}));
					products = allProducts.filter(
						item =>
							item.minimumSalePrice > 0 &&
							item.maximumSalePrice > 0 &&
							item.stock > 0
					);
				} else {
					const response = await fetch(url, {
						method: 'GET',
						headers: {
							Authorization: `Token ${authContext.token}`,
							'Content-Type': 'application/json',
						},
						signal: controller.signal,
					});

					if (!response.ok) {
						throw new Error('Falló al obtener los productos.');
					}

					const data = await response.json();

					if (isMounted) {
						products = data.rows.map(listData => {
							return {
								id: listData.id,
								name: listData.name,
								code: listData.code,
							};
						});
					}
				}
				setList(products);
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
	}, [authContext.token, filterText, sellingChannel, warehouse]);

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
			<ProductDetailedTable
				data={list}
				open={showModal}
				onProductList={onProductList}
				onClose={handleCloseModal}
				addedProducts={addedProducts}
				filterComponent={
					<Filter onFilter={e => setFilterText(e.target.value)} />
				}
				sellingChannel={sellingChannel}
			/>
		</>
	);
};

export default React.memo(AddProductDetailedList);
