import Listado from '../UI/Listado/Listado';

import { api, config } from '../../constants';
import ListadoHeader from '../UI/Listado/ListadoHeader';
import { Fragment, useEffect, useState, useContext } from 'react';

import AuthContext from '../../store/auth-context';
import AgregarProyecto from './Proyecto/AgregarProyecto';
import Icon from '@mdi/react';
import { mdiPencilOutline } from '@mdi/js';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
	editIcon: {
		color: '#127FE6',
		cursor: 'pointer',
	},
});

const ListaProyecto = () => {
	const classes = useStyles();
	const authContext = useContext(AuthContext);

	const url = config.url.HOST + api.API_URL_PROYECTOS;
	const [list, setList] = useState([]);
	const [error, setError] = useState(null);
	const contentHeader = [
		{
			name: 'Nombre',
			selector: row => row.nombreProyecto,
			sortable: true,
		},
		{
			name: 'Costo',
			selector: row => row.costo,
			sortable: true,
		},
		{
			name: 'Porcentaje Visado',
			selector: row => row.porcentajeVisado,
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

	const [agregarProyecto, setAgregarProyecto] = useState(false);
	const [editProyecto, setEditProyecto] = useState(false);
	const [userToEdit, setUserToEdit] = useState({});

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		const fetchProyectos = async () => {
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
					throw new Error('Failed to fetch projects');
				}

				const data = await response.json();

				if (isMounted) {
					const parsedList = data.map(listData => {
						return {
							id: listData.id,
							nombreProyecto: listData.name,
							costo: listData.cost,
							porcentajeVisado: listData.percentaje_visa,
						};
					});
					setList(parsedList);
				}
			} catch (error) {
				if (error.name === 'AbortError') {
					// Handle abort error silently
					return;
				}
				if (isMounted) {
					setError(error.message);
				}
			}
		};

		fetchProyectos();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [url, authContext.token]);

	const handleAgregarProyecto = e => {
		e.preventDefault();
		setAgregarProyecto(!agregarProyecto);
	};

	const handleButtonClick = (e, id) => {
		e.preventDefault();
		const user = list.find(x => x.id === id);
		setUserToEdit(user);
		setEditProyecto(true);
	};

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<>
			{!agregarProyecto && !editProyecto && (
				<Fragment>
					<ListadoHeader
						title="Proyectos"
						text="Agregar"
						onClick={e => handleAgregarProyecto(e)}
						visible={true}
					/>
					<Listado parsedList={list} contentHeader={contentHeader} />
				</Fragment>
			)}
			{(agregarProyecto || editProyecto) && (
				<AgregarProyecto
					parsedList={userToEdit}
					editProyecto={editProyecto}
					setEditProyecto={setEditProyecto}
				/>
			)}
		</>
	);
};

export default ListaProyecto;
