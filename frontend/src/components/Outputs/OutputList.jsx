import List from '../UI/List/List';

import { api } from '../../Constants';
import ListHeader from '../UI/List/ListHeader';
import Filter from '../UI/List/Filter';
import { Fragment, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Info } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import authFetch from '../../api/authFetch';

const OutputList = () => {

	const [list, setList] = useState([]);
	const [error, setError] = useState(null);
	const [filterText, setFilterText] = useState('');
	const [rowCount, setRowCount] = useState(0);
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(5);
	const navigate = useNavigate();

	const contentHeader = [
		{
			name: 'Cliente',
			selector: row => row.client,
			sortable: true,
		},
		{
			name: 'Fecha de Salida',
			selector: row => row.outputDate,
			sortable: true,
		},
		{
			name: 'Nota',
			selector: row => row.note,
			sortable: true,
			cell: row => (
				<div
					style={{
						maxWidth: '400px',
						whiteSpace: 'normal',
						wordWrap: 'break-word',
					}}
				>
					{row.note || ''}
				</div>
			),
		},
		{
			name: 'Acciones',
			button: 'true',
			cell: row => (
				<Tooltip title="Ver salida" placement="top">
					<Info
						onClick={e => handleInfoButton(e, row.id)}
						style={{ cursor: 'pointer', color: '#127FE6' }}
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
			`${API}${api.API_URL_OUTPUTS}` +
			`?limit=${pageSize}&offset=${(page - 1) * pageSize}`;

		if (filterText) {
			url += `&search=${filterText}`;
		}

		const fetchOutputs = async () => {
			try {
				const response = await authFetch(url, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error('Fallo al obtener las salidas.');
				}

				const data = await response.json();
				setRowCount(data.total);

				if (isMounted) {
					const parsedList = data.rows.map(listData => {
						return {
							id: listData.id,
							client: listData.clients.name,
							outputDate: listData.output_date,
							outputItems: listData.output_items,
							note: listData.note,
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

		fetchOutputs();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [filterText, page, pageSize]);

	const handleAddOutput = isOutput => {
		navigate('agregar_salida', { state: { isOutput: isOutput } });
	};

	const handleInfoButton = (e, id) => {
		e.preventDefault();
		const output = list.find(x => x.id === id);
		navigate(`info_salida/${id}`, {
			state: { outputData: output },
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
				title="Salidas del Almacén"
				text="Agregar"
				onClick={() => handleAddOutput(true)}
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

export default OutputList;
