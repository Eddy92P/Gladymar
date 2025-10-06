import List from '../UI/List/List';

import { api, config } from '../../Constants';
import ListHeader from '../UI/List/ListHeader';
import Filter from '../UI/List/Filter';
import { Fragment, useEffect, useState, useContext } from 'react';

import AuthContext from '../../store/auth-context';

import { useNavigate } from 'react-router-dom';

import { Info } from '@mui/icons-material';

const EntryList = () => {
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
			name: 'Proveedor',
			selector: row => row.supplier,
			sortable: true,
		},
		{
			name: 'Fecha de Entrada',
			selector: row => row.entryDate,
			sortable: true,
		},
		{
			name: 'Nº Factura',
			selector: row => row.invoiceNumber,
			sortable: true,
		},
		{
			name: 'Acciones',
			button: 'true',
			cell: row => (
				<Info
					onClick={e => handleInfoButton(e, row.id)}
					style={{ cursor: 'pointer', color: '#127FE6' }}
				/>
			),
		},
	];

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		let url =
			config.url.HOST +
			api.API_URL_ENTRIES +
			`?limit=${pageSize}&offset=${(page - 1) * pageSize}`;

		if (filterText) {
			url += `&search=${filterText}`;
		}

		const fetchEntries = async () => {
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
					throw new Error('Fallo al obtener las entradas.');
				}

				const data = await response.json();
				setRowCount(data.total);

				if (isMounted) {
					const parsedList = data.rows.map(listData => {
						return {
							id: listData.id,
							supplier: listData.suppliers.name,
							entryDate: listData.entry_date,
							invoiceNumber: listData.invoice_number,
							entryItems: listData.entry_items,
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

		fetchEntries();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [filterText, authContext.token, page, pageSize]);

	const handleAddEntry = () => {
		navigate('agregar_entrada');
	};

	const handleInfoButton = (e, id) => {
		e.preventDefault();
		const entry = list.find(x => x.id === id);
		navigate(`info_entrada/${id}`, {
			state: { entryData: entry },
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
				title="Entradas a Almacén"
				text="Agregar"
				onClick={handleAddEntry}
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

export default EntryList;
