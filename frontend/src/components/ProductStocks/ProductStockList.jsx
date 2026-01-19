import List from '../UI/List/List';

import { api } from '../../Constants';
import ListHeader from '../UI/List/ListHeader';
import Filter from '../UI/List/Filter';
import { Fragment, useEffect, useState } from 'react';

import Icon from '@mdi/react';
import { mdiPlusCircle } from '@mdi/js';
import { makeStyles } from '@mui/styles';
import { Tooltip } from '@mui/material';

import { useNavigate } from 'react-router-dom';

import authFetch from '../../api/authFetch';

const useStyles = makeStyles({
	editIcon: {
		color: '#127FE6',
		cursor: 'pointer',
	},
});

const ProductStockList = () => {
	const classes = useStyles();

	const [list, setList] = useState([]);
	const [error, setError] = useState(null);
	const [filterText, setFilterText] = useState('');
	const [rowCount, setRowCount] = useState(0);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(5);
	const navigate = useNavigate();

	const contentHeader = [
		{
			name: 'Código',
			selector: row => row.code,
			sortable: true,
		},
		{
			name: 'Nombre',
			selector: row => row.name,
			sortable: true,
		},
		{
			name: 'Almacén',
			selector: row => row.warehouse,
			sortable: true,
		},
		{
			name: 'Stock Real',
			selector: row => row.stock,
			sortable: true,
		},
		{
			name: 'Stock Disponible',
			selector: row => row.availableStock,
			sortable: true,
		},
		{
			name: 'Stock Dañado',
			selector: row => row.damagedStock,
			sortable: true,
		},
		{
			name: 'Stock Mínimo',
			selector: row => row.minimumStock,
			sortable: true,
		},
		{
			name: 'Stock Máximo',
			selector: row => row.maximumStock,
			sortable: true,
		},
		{
			name: 'Acciones',
			button: 'true',
			cell: row => (
				<Tooltip title="Agregar productos dañados" placement="top">
					<Icon
						path={mdiPlusCircle}
						size={1}
						onClick={e => handleButtonClick(e, row.id)}
						className={classes.editIcon}
					/>
				</Tooltip>
			),
		},
	];

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();
		const API = import.meta.env.VITE_API_URL;

		let url =
			`${API}${api.API_URL_PRODUCT_STOCKS}` +
			`?limit=${pageSize}&offset=${(page - 1) * pageSize}`;
		if (filterText) {
			url += `&search=${filterText}`;
		}

		const fetchAgencies = async () => {
			try {
				const response = await authFetch(url, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error('Failed to fetch clients');
				}

				const data = await response.json();
				setRowCount(data.total);

				if (isMounted) {
					const parsedList = data.rows.map(listData => {
						return {
							id: listData.id,
							name: listData.products.name,
							code: listData.products.code,
							warehouse: listData.warehouses.name,
							stock: listData.stock,
							availableStock: listData.available_stock,
							damagedStock: listData.damaged_stock,
							minimumStock: listData.minimum_stock,
							maximumStock: listData.maximum_stock,
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

		fetchAgencies();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [filterText, page, pageSize]);

	const handleButtonClick = (e, id) => {
		e.preventDefault();
		const productStock = list.find(x => x.id === id);
		navigate(`increment-damaged-stock/${id}`, {
			state: { productStockData: productStock },
		});
	};

	const handlePageChange = newPage => {
		setPage(newPage);
	};

	const handlePageSizeChange = newPageSize => {
		setPageSize(newPageSize);
	};

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<Fragment>
			<ListHeader title="Stock de Productos" visible={false} />
			<List
				onPageSizeChange={handlePageSizeChange}
				onPageChange={handlePageChange}
				rowCount={rowCount}
				parsedList={list}
				contentHeader={contentHeader}
				filter={
					<Filter onFilter={e => setFilterText(e.target.value)} />
				}
			/>
		</Fragment>
	);
};

export default ProductStockList;
