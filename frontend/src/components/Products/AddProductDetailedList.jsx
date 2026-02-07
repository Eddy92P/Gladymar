import React, { useState, useEffect, useContext } from 'react';

// Components
import Filter from '../UI/List/Filter';
import ProductDetailedTable from '../UI/Table/ProductDetailedTable';

// Configs
import { api } from '../../Constants';

// Context
import AuthContext from '../../store/auth-context';
import { StoreContext } from '../../store/store-context';

import authFetch from '../../api/authFetch';

const AddProductDetailedList = ({
	onClose,
	onProductList,
	addedProducts = [],
	sellingChannel,
	purchase,
	sale,
	isPurchase,
	isOutput,
	isEntry,
}) => {
	const [list, setList] = useState([]);
	const [error, setError] = useState('');
	const [filterText, setFilterText] = useState('');
	const [showModal, setShowModal] = useState(true);

	const authContext = useContext(AuthContext);
	const storeContext = useContext(StoreContext);

	useEffect(() => {
		const API = import.meta.env.VITE_API_URL;
		let url = '';
		if (
			sellingChannel ||
			purchase?.id ||
			sale?.id ||
			isPurchase ||
			isOutput ||
			isEntry
		) {
			url = `${API}${api.API_URL_CATALOG}`;
		} else {
			url = `${API}${api.API_URL_PRODUCTS}`;
		}
		let isMounted = true;

		const controller = new AbortController();

		if (sellingChannel) {
			url += `?selling_channel_id=${sellingChannel.id}`;
		} else if (purchase?.id) {
			url += `?purchase_id=${purchase.id}&agency_id=${storeContext.agency}`;
		} else if (sale?.id) {
			url += `?sale_id=${sale.id}&agency_id=${storeContext.agency}`;
		} else if (isEntry || isOutput || isPurchase) {
			url += `?agency_id=${storeContext.agency}`;
		}
		if (
			filterText &&
			(sellingChannel ||
				purchase?.id ||
				sale?.id ||
				isPurchase ||
				isOutput ||
				isEntry)
		) {
			url += `&search=${filterText}`;
		} else if (filterText) {
			url += `?search=${filterText}`;
		}

		const fetchProducts = async () => {
			try {
				let products = [];
				if (sellingChannel) {
					let allProducts = [];
					const response = await authFetch(url, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
						signal: controller.signal,
					});

					if (!response.ok) {
						throw new Error(
							'Falló al obtener productos del canal de ventas'
						);
					}
					const productStockData = await response.json();
					allProducts = productStockData.map(item => ({
						agency: item.agency,
						warehouse: item.warehouse,
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
				} else if (sale?.id) {
					const response = await authFetch(url, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
						signal: controller.signal,
					});

					if (!response.ok) {
						throw new Error(
							'Falló al obtener productos para el almacén'
						);
					}
					const productStockData = await response.json();
					products = productStockData.map(item => ({
						saleItem: item.sale_item_id,
						warehouse: item.warehouse,
						id: item.id,
						name: item.name,
						code: item.code,
						price: item.price,
						stock: item.stock,
						reservedStock: item.reserved_stock,
					}));
				} else if (purchase?.id) {
					const response = await authFetch(url, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
						signal: controller.signal,
					});

					if (!response.ok) {
						throw new Error(
							'Falló al obtener productos para el almacén'
						);
					}
					const productStockData = await response.json();
					products = productStockData.map(item => ({
						purchaseItem: item.purchase_item_id,
						warehouse: item.warehouse,
						id: item.id,
						name: item.name,
						code: item.code,
						price: item.price,
						stock: item.stock,
					}));
				} else if (isEntry || isOutput || isPurchase) {
					const response = await authFetch(url, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
						signal: controller.signal,
					});

					if (!response.ok) {
						throw new Error(
							'Falló al obtener productos para el almacén'
						);
					}
					const productStockData = await response.json();
					products = productStockData.map(item => ({
						agency: item.agency,
						warehouse: item.warehouse,
						id: item.id,
						name: item.name,
						code: item.code,
						price: item.price,
						stock: item.stock,
					}));
				} else {
					const response = await authFetch(url, {
						method: 'GET',
						headers: {
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
	}, [
		authContext.token,
		filterText,
		sellingChannel,
		sale,
		purchase,
		storeContext.agency,
		isPurchase,
		isOutput,
		isEntry,
	]);

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
