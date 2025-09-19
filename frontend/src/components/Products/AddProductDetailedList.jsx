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
}) => {
	const [list, setList] = useState([]);
	const [error, setError] = useState('');
	const [filterText, setFilterText] = useState('');
	const [showModal, setShowModal] = useState(true);

	const authContext = useContext(AuthContext);

	useEffect(() => {
		let url = config.url.HOST + api.API_URL_PRODUCTS;
		let sellingChannelUrl = config.url.HOST + api.API_URL_SELLING_CHANNEL;
		let isMounted = true;

		const controller = new AbortController();

		if (filterText) {
			url += `?search=${filterText}`;
		}

		const fetchProducts = async () => {
			try {
				let products = [];
				if (sellingChannel || sellingChannel?.id) {
					let allProducts = [];
					const channelResponse = await fetch(
						sellingChannelUrl + `${sellingChannel.id}`,
						{
							method: 'GET',
							headers: {
								Authorization: `Token ${authContext.token}`,
								'Content-Type': 'application/json',
							},
							signal: controller.signal,
						}
					);

					if (!channelResponse.ok) {
						throw new Error(
							'Failed to fetch Products from Selling Channel'
						);
					}

					const channelData = await channelResponse.json();
					allProducts = channelData.product_channel_price.map(
						item => ({
							id: item.products.id,
							name: item.products.name,
							code: item.products.code,
							price: item.price,
							stock: item.products.available_stock,
							minimumSalePrice: item.products.minimum_sale_price,
							maximumSalePrice: item.products.maximum_sale_price,
						})
					);
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
						throw new Error('Failed to fetch Products');
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
	}, [authContext.token, filterText, sellingChannel]);

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
