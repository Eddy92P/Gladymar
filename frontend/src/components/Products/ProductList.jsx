import List from '../UI/List/List';

import { api, config } from '../../Constants';
import ListHeader from '../UI/List/ListHeader';
import Filter from '../UI/List/Filter';
import { Fragment, useEffect, useState, useContext } from 'react';

import AuthContext from '../../store/auth-context';

import Icon from '@mdi/react';
import { mdiPencilOutline } from '@mdi/js';
import { makeStyles } from '@mui/styles';

import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
	editIcon: {
		color: '#127FE6',
		cursor: 'pointer',
	},
});

const ProductList = () => {
	const classes = useStyles();
	const authContext = useContext(AuthContext);

	const [list, setList] = useState([]);
	const [error, setError] = useState(null);
	const [filterText, setFilterText] = useState('');
	const [rowCount, setRowCount] = useState(0);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(5);
	const navigate = useNavigate();

	const contentHeader = [
		{
			name: 'Categoría',
			selector: row => row.batch.name,
			sortable: true,
		},
		{
			name: 'Nombre',
			selector: row => row.name,
			sortable: true,
		},
		{
			name: 'Código',
			selector: row => row.code,
			sortable: true,
		},
		{
			name: 'Unidad de medida',
			selector: row => row.unitMeasurement,
			sortable: true,
		},
		{
			name: 'Precio de venta mínimo',
			selector: row => row.minimumSalePrice,
			sortable: true,
		},
		{
			name: 'Precio de venta máximo',
			selector: row => row.maximumSalePrice,
			sortable: true,
		},
		{
			name: 'Acciones',
			button: 'true',
			cell: row => (
				<Icon
					path={mdiPencilOutline}
					size={1}
					onClick={e => handleButtonClick(e, row.id)}
					className={classes.editIcon}
				/>
			),
		},
	];

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		let url =
			config.url.HOST +
			api.API_URL_PRODUCTS +
			`?limit=${pageSize}&offset=${(page - 1) * pageSize}`;

		if (filterText) {
			url += `&search=${filterText}`;
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
					throw new Error('Failed to fetch batches.');
				}

				const data = await response.json();
				setRowCount(data.total);

				if (isMounted) {
					const parsedList = data.rows.map(listData => {
						return {
							id: listData.id,
							name: listData.name,
							batch: listData.batch,
							code: listData.code,
							image: listData.image,
							description: listData.description,
							unitMeasurement: listData.unit_of_measurement,
							minimumSalePrice: listData.minimum_sale_price,
							maximumSalePrice: listData.maximum_sale_price,
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
	}, [filterText, authContext.token, page, pageSize]);

	const handleAddBatch = () => {
		navigate('agregar_producto');
	};

	const handleButtonClick = (e, id) => {
		e.preventDefault();
		const product = list.find(x => x.id === id);
		navigate(`editar_producto/${id}`, {
			state: { productData: product },
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
			<ListHeader
				title="Productos"
				text="Agregar"
				onClick={handleAddBatch}
				visible={true}
			/>
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

export default ProductList;
