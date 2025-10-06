import List from '../UI/List/List';

import { api, config } from '../../Constants';
import ListHeader from '../UI/List/ListHeader';
import Filter from '../UI/List/Filter';
import { Fragment, useEffect, useState, useContext } from 'react';

import AuthContext from '../../store/auth-context';

import { Info, Edit, MonetizationOn } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';

import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
	editIcon: {
		color: '#127FE6',
		cursor: 'pointer',
	},
});

const SaleList = () => {
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
			name: 'Vendedor',
			selector: row => row.seller,
			sortable: true,
		},
		{
			name: 'Cliente',
			selector: row => row.client.name,
			sortable: true,
		},
		{
			name: 'Tipo de Venta',
			selector: row => row.saleType,
			sortable: true,
		},
		{
			name: 'Canal de Venta',
			selector: row => row.sellingChannel.name,
			sortable: true,
		},
		{
			name: 'Fecha de Venta',
			selector: row => row.saleDate,
			sortable: true,
		},
		{
			name: 'Total de la Venta',
			selector: row => row.total,
			sortable: true,
		},
		{
			name: 'Saldo',
			selector: row => row.balanceDue,
			sortable: true,
		},
		{
			name: 'Acciones',
			button: 'true',
			cell: row => (
				<div
					style={{
						display: 'flex',
						gap: '8px',
						alignItems: 'center',
					}}
				>
					{row.status != 'realizado' && (
						<MonetizationOn
							onClick={e => handleEditButton(e, row.id, true)}
							style={{ cursor: 'pointer', color: '#127FE6' }}
						/>
					)}
					{row.status != 'realizado' && (
						<Edit
							onClick={e => handleEditButton(e, row.id, false)}
							className={classes.editIcon}
						/>
					)}
					<Info
						onClick={e => handleInfoButton(e, row.id)}
						style={{ cursor: 'pointer', color: '#127FE6' }}
					/>
				</div>
			),
		},
	];

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		let url =
			config.url.HOST +
			api.API_URL_SALES +
			`?limit=${pageSize}&offset=${(page - 1) * pageSize}`;

		if (filterText) {
			url += `&search=${filterText}`;
		}

		const fetchSales = async () => {
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
					throw new Error('Fallo al obtener las ventas.');
				}

				const data = await response.json();
				setRowCount(data.total);

				if (isMounted) {
					const parsedList = data.rows.map(listData => {
						return {
							id: listData.id,
							seller:
								listData.seller.first_name +
								' ' +
								listData.seller.last_name,
							client: listData.clients,
							sellingChannel: listData.selling_channels,
							saleType: listData.sale_type,
							saleDate: listData.sale_date,
							salePerformDate: listData.sale_perform_date,
							saleDoneDate: listData.sale_done_date,
							total: listData.total,
							balanceDue: listData.balance_due,
							status: listData.status,
							saleItems: listData.sale_items,
							payments: listData.payments,
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

		fetchSales();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [filterText, authContext.token, page, pageSize]);

	const handleAddSale = () => {
		navigate('agregar_venta');
	};

	const handleEditButton = (e, id, isSale) => {
		e.preventDefault();
		const sale = list.find(x => x.id === id);
		navigate(`editar_venta/${id}`, {
			state: { saleData: sale, isSale: isSale },
		});
	};

	const handleInfoButton = (e, id) => {
		e.preventDefault();
		const sale = list.find(x => x.id === id);
		navigate(`info_venta/${id}`, { state: { saleData: sale } });
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
				title="Ventas"
				text="Agregar"
				onClick={handleAddSale}
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

export default SaleList;
