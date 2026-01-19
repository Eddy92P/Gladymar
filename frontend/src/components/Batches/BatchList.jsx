import List from '../UI/List/List';

import { api } from '../../Constants';
import ListHeader from '../UI/List/ListHeader';
import Filter from '../UI/List/Filter';
import { Fragment, useEffect, useState } from 'react';

import Icon from '@mdi/react';
import { mdiPencilOutline } from '@mdi/js';
import { makeStyles } from '@mui/styles';

import { useNavigate } from 'react-router-dom';

import { Tooltip } from '@mui/material';

import authFetch from '../../api/authFetch';

const useStyles = makeStyles({
	editIcon: {
		color: '#127FE6',
		cursor: 'pointer',
	},
});

const BatchList = () => {
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
			name: 'Nombre',
			selector: row => row.name,
			sortable: true,
		},
		{
			name: 'Categoría',
			selector: row => row.category.name,
			sortable: true,
		},
		{
			name: 'Acciones',
			button: 'true',
			cell: row => (
				<Tooltip title="Editar lote" placement="top">
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
		let isMounted = true;
		const controller = new AbortController();
		const API = import.meta.env.VITE_API_URL;

		let url =
			`${API}${api.API_URL_BATCHES}` +
			`?limit=${pageSize}&offset=${(page - 1) * pageSize}`;

		if (filterText) {
			url += `&search=${filterText}`;
		}

		const fetchBatches = async () => {
			try {
				const response = await authFetch(url, {
					method: 'GET',
					headers: {
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
							category: listData.category,
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

		fetchBatches();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [filterText, page, pageSize]);

	const handleAddBatch = () => {
		navigate('agregar_lote');
	};

	const handleButtonClick = (e, id) => {
		e.preventDefault();
		const batch = list.find(x => x.id === id);
		navigate(`editar_lote/${id}`, {
			state: { batchData: batch },
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
				title="Lotes"
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

export default BatchList;
