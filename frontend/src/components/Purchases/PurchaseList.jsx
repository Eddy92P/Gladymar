import List from '../UI/List/List';

import { api } from '../../Constants';
import ListHeader from '../UI/List/ListHeader';
import Filter from '../UI/List/Filter';
import { Fragment, useEffect, useState, useContext } from 'react';

import AuthContext from '../../store/auth-context';

import { Info, Login, Payment } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

import { useNavigate } from 'react-router-dom';

import { makeStyles } from '@mui/styles';
import authFetch from '../../api/authFetch';

const useStyles = makeStyles({
	editIcon: {
		color: '#127FE6',
		cursor: 'pointer',
	},
});

const PurchaseList = () => {
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
			name: 'Comprador',
			selector: row => row.buyer,
			sortable: true,
		},
		{
			name: 'Proveedor',
			selector: row => row.supplier,
			sortable: true,
		},
		{
			name: 'Tipo de Compra',
			selector: row => row.purchaseType,
			sortable: true,
		},
		{
			name: 'Fecha de Compra',
			selector: row => row.purchaseDate,
			sortable: true,
		},
		{
			name: 'Nº Factura',
			selector: row => row.invoiceNumber,
			sortable: true,
		},
		{
			name: 'Total de la Compra',
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
					<Tooltip title="Ver compra" placement="top">
						<Info
							onClick={e => handleButtonClick(e, row.id)}
							className={classes.editIcon}
						/>
					</Tooltip>
					{row.status != 'terminado' &&
						(authContext.userType == 4 ||
							authContext.userType == 2) && (
							<Tooltip
								title="Realizar entrada almacén"
								placement="top"
							>
								<Login
									onClick={e => handleEntryButton(e, row.id)}
									style={{
										cursor: 'pointer',
										color: '#127FE6',
									}}
								/>
							</Tooltip>
						)}
					{row.balanceDue > 0 &&
						(authContext.userType == 4 ||
							authContext.userType == 1) && (
							<Tooltip title="Agregar pago" placement="top">
								<Payment
									onClick={e =>
										handlePaymentButton(e, row.id, false)
									}
									className={classes.editIcon}
								/>
							</Tooltip>
						)}
				</div>
			),
		},
	];

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();
		const API = import.meta.env.VITE_API_URL;

		let url =
			`${API}${api.API_URL_PURCHASES}` +
			`?limit=${pageSize}&offset=${(page - 1) * pageSize}`;

		if (filterText) {
			url += `&search=${filterText}`;
		}

		const fetchSuppliers = async () => {
			try {
				const response = await authFetch(url, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error('Fallo al obtener las compras.');
				}

				const data = await response.json();
				setRowCount(data.total);

				if (isMounted) {
					const parsedList = data.rows.map(listData => {
						return {
							id: listData.id,
							buyer:
								listData.buyer.first_name +
								' ' +
								listData.buyer.last_name,
							supplier: listData.suppliers.name,
							purchaseType: listData.purchase_type,
							purchaseDate: listData.purchase_date,
							purchaseEndDate: listData.purchase_end_date,
							invoiceNumber: listData.invoice_number,
							total: listData.total,
							balanceDue: listData.balance_due,
							status: listData.status,
							purchaseItems: listData.purchase_items,
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

		fetchSuppliers();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [filterText, page, pageSize]);

	const handleAddPurchase = () => {
		navigate('agregar_compra');
	};

	const handleButtonClick = (e, id) => {
		e.preventDefault();
		const purchase = list.find(x => x.id === id);
		navigate(`editar_compra/${id}`, {
			state: { purchaseData: purchase },
		});
	};

	const handleEntryButton = (e, id) => {
		e.preventDefault();
		const purchase = list.find(x => x.id === id);
		navigate(`agregar_entrada/${id}`, {
			state: { purchaseData: purchase },
		});
	};

	const handlePaymentButton = (e, id, isSale) => {
		e.preventDefault();
		const sale = list.find(x => x.id === id);
		navigate(`agregar_pago/${id}`, {
			state: { transactionData: sale, isSale: isSale },
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
				title="Compras"
				text="Agregar"
				onClick={handleAddPurchase}
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

export default PurchaseList;
