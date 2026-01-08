import List from '../UI/List/List';

import { api } from '../../Constants';
import ListHeader from '../UI/List/ListHeader';
import ClientFilter from '../UI/List/ClientFilter';
import { Fragment, useEffect, useState, useContext } from 'react';

import AuthContext from '../../store/auth-context';

import Icon from '@mdi/react';
import { mdiPencilOutline } from '@mdi/js';
import { makeStyles } from '@mui/styles';

import { useNavigate } from 'react-router-dom';

import { Tooltip } from '@mui/material';

const useStyles = makeStyles({
	editIcon: {
		color: '#127FE6',
		cursor: 'pointer',
	},
});

const ClientList = () => {
	const API = import.meta.env.VITE_API_URL;
	const urlClientChoices = `${API}${api.API_URL_CLIENT_CHOICES}`;
	const classes = useStyles();
	const authContext = useContext(AuthContext);

	const [list, setList] = useState([]);
	const [error, setError] = useState(null);
	const [filterTab, setFilterTab] = useState('');
	const [rowCount, setRowCount] = useState(0);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(5);
	const [clientTypeChoices, setClientTypeChoices] = useState([]);
	const [filterText, setFilterText] = useState('');
	const navigate = useNavigate();

	const contentHeader = [
		{
			name: 'Nombre',
			selector: row => row.name,
			sortable: true,
		},
		{
			name: 'Teléfono',
			selector: row => row.phone,
			sortable: true,
		},
		{
			name: 'NIT/CI',
			selector: row => row.nit,
			sortable: true,
		},
		{
			name: 'Correo Electrónico',
			selector: row => row.email,
			sortable: true,
		},
		{
			name: 'Dirección',
			selector: row => row.address,
			sortable: true,
		},
		{
			name: 'Tipo',
			selector: row => row.clientType,
			sortable: true,
		},
		{
			name: 'Acciones',
			button: 'true',
			cell: row => (
				<Tooltip title="Editar cliente" placement="top">
					<Icon
						path={mdiPencilOutline}
						size={1}
						onClick={e => handleButtonClick(e, row.id)}
						className={classes.editIcon}
					/>
				</Tooltip>
			),
		},
	];

	useEffect(() => {
		const fetchClientTypeChoices = async () => {
			try {
				const response = await fetch(urlClientChoices, {
					headers: {
						Authorization: `Token ${authContext.token}`,
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const choices = await response.json();
					setClientTypeChoices(choices);
				}
			} catch (error) {
				console.error('Error fetching client choices:', error);
			}
		};

		fetchClientTypeChoices();
	}, [urlClientChoices, authContext.token]);

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		let url =
			`${API}${api.API_URL_CLIENTS}` +
			`?limit=${pageSize}&offset=${(page - 1) * pageSize}`;
		if (filterText) {
			url += `&search=${filterText}`;
		}

		if (filterTab) {
			url += `&client_type=${filterTab}`;
		}

		const fetchClients = async () => {
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
					throw new Error('Failed to fetch clients');
				}

				const data = await response.json();
				setRowCount(data.total);

				if (isMounted) {
					const parsedList = data.rows.map(listData => {
						return {
							id: listData.id,
							name: listData.name,
							phone: listData.phone,
							nit: listData.nit,
							email: listData.email,
							address: listData.address,
							clientType: listData.client_type,
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

		fetchClients();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [filterText, authContext.token, page, pageSize, filterTab, API]);

	const handleAddClient = () => {
		navigate('agregar_cliente');
	};

	const handleButtonClick = (e, id) => {
		e.preventDefault();
		const client = list.find(x => x.id === id);
		navigate(`editar_cliente/${id}`, { state: { clientData: client } });
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
				title="Clientes"
				text="Agregar"
				onClick={handleAddClient}
				visible={true}
			/>
			<List
				onPageSizeChange={handlePageSizeChange}
				onPageChange={handlePageChange}
				rowCount={rowCount}
				parsedList={list}
				contentHeader={contentHeader}
				filter={
					<ClientFilter
						choices={clientTypeChoices}
						onFilter={e => setFilterText(e.target.value)}
						onTabChange={handleTabChange}
					/>
				}
			/>
		</Fragment>
	);
};

export default ClientList;
