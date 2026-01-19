import React, { useEffect, useState, useContext } from 'react';

//MUI Components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
	Dialog,
	DialogTitle,
	Box,
	DialogContent,
	Autocomplete,
	Button,
	TextField,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Configs
import { api } from '../../Constants';

// Context
import AuthContext from '../../store/auth-context';
import { StoreContext } from '../../store/store-context';

// Navigate
import { useNavigate } from 'react-router-dom';

// API
import authFetch from '../../api/authFetch';

const StyledDialog = styled(Dialog)({
	'& .MuiDialog-paper': {
		padding: '32px',
		height: '35%',
	},
});

const SelectAgency = () => {
	const navigate = useNavigate();
	const [agencyChoices, setAgencyChoices] = useState([]);
	const [agency, setAgency] = useState(null);
	const [error, setError] = useState('');
	const [isSelected, setIsSelected] = useState(true);
	const [open, setOpen] = useState(true);
	const authContext = useContext(AuthContext);
	const storeContext = useContext(StoreContext);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

	const agencyChangeHandler = (event, newValue) => {
		setAgency(newValue);
	};

	const confirmHandler = () => {
		closeHandler();
		storeContext.chooseAgency(agency.id);
		navigate('/principal/dashboard');
	};

	const closeHandler = (event, reason) => {
		if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
			return;
		}
		setOpen(false);
	};

	useEffect(() => {
		if (agency) {
			setIsSelected(false);
		}
	}, [agency]);

	useEffect(() => {
		const API = import.meta.env.VITE_API_URL;
		const url = `${API}${api.API_URL_ALL_AGENCIES}`;
		let isMounted = true;
		const controller = new AbortController();

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
					throw new Error('Falló al obtener agencias.');
				}

				const data = await response.json();

				if (isMounted) {
					const parsedList = data.map(listData => {
						return {
							id: listData.id,
							name: listData.name,
						};
					});
					setAgencyChoices(parsedList);
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
	}, [authContext.token]);

	// Si no hay datos, mostrar mensaje
	if (!agencyChoices || agencyChoices.length === 0) {
		return (
			<StyledDialog
				onClose={closeHandler}
				open={open}
				scroll="paper"
				fullScreen={fullScreen}
				maxWidth="lg"
				fullWidth
			>
				<DialogTitle
					sx={{
						m: 0,
						p: 2,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
					id="customized-dialog-title"
				>
					Seleccione la Agencia
				</DialogTitle>
				<DialogContent dividers>
					<TableContainer component={Paper}>
						<Table sx={{ minWidth: 650 }} aria-label="agency_table">
							<TableBody>
								<TableRow>
									<TableCell>
										No hay agencias disponibles, registre
										una para comenzar.
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</DialogContent>
			</StyledDialog>
		);
	}

	return (
		<StyledDialog
			onClose={closeHandler}
			open={open}
			scroll="paper"
			fullScreen={fullScreen}
			maxWidth="lg"
			fullWidth
		>
			<DialogTitle
				sx={{
					m: 0,
					p: 2,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
				id="customized-dialog-title"
			>
				Seleccione la Agencia
			</DialogTitle>
			<DialogContent dividers>
				{error && (
					<Box sx={{ color: 'error.main', mb: 2 }}>{error}</Box>
				)}
				<Autocomplete
					disablePortal
					value={agency}
					options={agencyChoices}
					getOptionLabel={option => (option ? option.name || '' : '')}
					renderOption={(props, option) => (
						<li {...props} key={option.id}>
							{option.name}
						</li>
					)}
					renderInput={params => (
						<TextField {...params} label="Agencia" required />
					)}
					onChange={agencyChangeHandler}
				/>
				<Box
					mt={2}
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						gap: 10,
					}}
				>
					<Button
						id="confirm_button"
						variant="contained"
						onClick={confirmHandler}
						style={{
							textTransform: 'none',
							width: '150px',
						}}
						disabled={isSelected}
					>
						Seleccionar
					</Button>
				</Box>
			</DialogContent>
		</StyledDialog>
	);
};

export default SelectAgency;
