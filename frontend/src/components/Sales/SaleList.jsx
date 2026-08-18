import List from '../UI/List/List';

import { api } from '../../Constants';
import { formatDisplayDate } from '../../DateUtils';
import ListHeader from '../UI/List/ListHeader';
import SaleFilter from '../UI/List/SaleFilter';
import { Fragment, useEffect, useState, useContext } from 'react';

import AuthContext from '../../store/auth-context';

import {
	Info,
	Edit,
	MonetizationOn,
	Logout,
	Payment,
	PictureAsPdf,
} from '@mui/icons-material';
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

const SaleList = () => {
	const classes = useStyles();
	const authContext = useContext(AuthContext);
	const API = import.meta.env.VITE_API_URL;
	const pdfUrl = `${API}${api.PROFORMA_PDF_URL}`;

	const urlSaleChoices = `${API}${api.API_URL_SALE_CHOICES}`;

	const [list, setList] = useState([]);
	const [error, setError] = useState(null);
	const [filterTab, setFilterTab] = useState('');
	const [filterText, setFilterText] = useState('');
	const [rowCount, setRowCount] = useState(0);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(5);
	const [saleStatusChoices, setSaleStatusChoices] = useState([]);
	const navigate = useNavigate();

	const contentHeader = [
		{
			name: 'Nº Proforma',
			selector: row => row.preInvoiceNumber || '-',
			sortable: true,
		},
		{
			name: 'Nº Recibo',
			selector: row => row.invoiceNumber || '-',
			sortable: true,
		},
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
			cell: row => formatDisplayDate(row.saleDate),
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
			name: 'Anticipo',
			selector: row => row.creditBalance,
			sortable: false,
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
					{row.status == 'proforma' &&
						(authContext.userType == 4 ||
							authContext.userType == 1) && (
							<Tooltip title="Efectivizar venta" placement="top">
								<MonetizationOn
									onClick={e =>
										handleEditButton(e, row.id, true)
									}
									style={{
										cursor: 'pointer',
										color: '#127FE6',
									}}
								/>
							</Tooltip>
						)}
					{row.status == 'proforma' &&
						(authContext.userType == 4 ||
							authContext.userType == 3) && (
							<Tooltip title="Editar proforma" placement="top">
								<Edit
									onClick={e =>
										handleEditButton(e, row.id, false)
									}
									className={classes.editIcon}
								/>
							</Tooltip>
						)}
					<Tooltip title="Ver venta" placement="top">
						<Info
							onClick={e => handleInfoButton(e, row.id)}
							style={{ cursor: 'pointer', color: '#127FE6' }}
						/>
					</Tooltip>
					{row.status == 'realizado' &&
						(authContext.userType == 4 ||
							authContext.userType == 2 ||
							authContext.userType == 3) && (
							<Tooltip
								title="Realizar salida almacén"
								placement="top"
							>
								<Logout
									onClick={e =>
										handleOutputButton(e, row.id)
									}
									className={classes.editIcon}
								/>
							</Tooltip>
						)}
					{(row.balanceDue > 0 || row.status == 'proforma') &&
						(authContext.userType == 4 ||
							authContext.userType == 1) && (
							<Tooltip title={row.status == 'proforma' ? "Agregar anticipo" : "Agregar pago"} placement="top">
								<Payment
									onClick={e =>
										handlePaymentButton(e, row.id, true, row.status == 'proforma')
									}
									className={classes.editIcon}
								/>
							</Tooltip>
						)}
					{(row.status == 'proforma' ||
						row.status == 'realizado') && 
						(authContext.userType == 4 || 
							authContext.userType == 1 || 
							authContext.userType == 3) && (
						<Tooltip title="Generar recibo" placement="top">
							<PictureAsPdf
								onClick={e => handlePdfClick(e, row.id)}
								style={{ cursor: 'pointer', color: '#127FE6' }}
							/>
						</Tooltip>
					)}
				</div>
			),
		},
	];

	useEffect(() => {
		const fetchSaleStatusChoices = async () => {
			try {
				const response = await authFetch(urlSaleChoices, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const choices = await response.json();
					setSaleStatusChoices(choices);
				}
			} catch (error) {
				console.error('Error fetching sale choices:', error);
			}
		};

		if (authContext.userType == 4) {
			fetchSaleStatusChoices();
		}
	}, [urlSaleChoices, authContext.userType]);

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		let url =
			`${API}${api.API_URL_SALES}` +
			`?limit=${pageSize}&offset=${(page - 1) * pageSize}`;

		if (filterText) {
			url += `&search=${filterText}`;
		}

		if (filterTab) {
			url += `&status=${filterTab}`;
		}

		const fetchSales = async () => {
			try {
				const response = await authFetch(url, {
					method: 'GET',
					headers: {
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
							preInvoiceNumber: listData.pre_invoice_number,
							invoiceNumber: listData.invoice_number,
							seller:
								listData.seller.first_name +
								' ' +
								listData.seller.last_name,
							client: listData.clients,
							sellingChannel: listData.selling_channels,
							saleType: listData.sale_type,
							saleAnticipo: listData.sale_anticipation,
							saleDate: listData.sale_date,
							salePerformDate: listData.sale_perform_date,
							saleDoneDate: listData.sale_done_date,
							observation: listData.observation,
							total: listData.total,
							balanceDue: listData.balance_due,
							creditBalance: listData.credit_balance,
							status: listData.status,
							saleItems: listData.sale_items,
							payments: listData.payments,
							outputs: listData.outputs,
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
	}, [filterText, page, pageSize, filterTab, API]);

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

	const handleOutputButton = (e, id) => {
		e.preventDefault();
		const sale = list.find(x => x.id === id);
		navigate(`agregar_salida/${id}`, { state: { saleData: sale } });
	};

	const handlePaymentButton = (e, id, isSale, isCredit) => {
		e.preventDefault();
		const sale = list.find(x => x.id === id);
		navigate(`agregar_pago/${id}`, {
			state: { transactionData: sale, isSale: isSale, isCredit: isCredit },
		});
	};

	const handlePdfClick = (e, id) => {
		e.preventDefault();
		const fullPdfUrl = `${pdfUrl}${id}/`;
		window.open(fullPdfUrl, '_blank');
	};

	const handleTabChange = filterTab => {
		setFilterTab(filterTab);
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
				visible={authContext.userType == 4 || authContext.userType == 3}
			/>
			<List
				onPageSizeChange={handlePageSizeChange}
				onPageChange={handlePageChange}
				rowCount={rowCount}
				parsedList={list}
				contentHeader={contentHeader}
				filter={
					<SaleFilter
						choices={saleStatusChoices}
						onFilter={e => setFilterText(e.target.value)}
						onTabChange={handleTabChange}
						visible={authContext.userType == 4}
					/>
				}
			/>
		</Fragment>
	);
};

export default SaleList;
