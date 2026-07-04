import React, {
	Fragment,
	useState,
	useEffect,
	useReducer,
	useMemo,
} from 'react';

import Alert from '@mui/material/Alert';

import AuthContext from '../../store/auth-context';
import { api } from '../../Constants';
import { validateNameLength, validateAddressLength } from '../../Validations';

import {
	Grid,
	TextField,
	Button,
	FormControl,
	Box,
	Typography,
	Autocomplete,
} from '@mui/material';
import classes from '../UI/List/List.module.css';

import AddAgencyPreview from './AddAgencyPreview';
import AddAgencyModal from './AddAgencyModal';
import ListHeader from '../UI/List/ListHeader';

import { useNavigate, useLocation } from 'react-router-dom';

import authFetch from '../../api/authFetch';

function AddAgency() {
	const API = import.meta.env.VITE_API_URL;
	const url = `${API}${api.API_URL_AGENCIES}`;
	const urlCityChoices = `${API}${api.API_URL_CITY_CHOICES}`;
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const agencyData = useMemo(
		() => location.state?.agencyData || [],
		[location.state?.agencyData]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [cityChoices, setCityChoices] = useState([]);
	const [city, setCity] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');

	const nameReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validateNameLength(state.value),
				feedbackText: 'Ingrese nombre valido',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateNameLength(action.val),
				feedbackText: 'Ingrese nombre valido',
			};
		}
		if (action.type === 'INPUT_ERROR') {
			return {
				value: state.value,
				isValid: false,
				feedbackText: action.errorMessage,
			};
		}
		return { value: '', isValid: false };
	};
	const locationReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validateAddressLength(state.value),
				feedbackText: 'Ingrese una dirección valida',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateAddressLength(action.val),
				feedbackText: 'Ingrese una dirección valida',
			};
		}
		return { value: '', isValid: false };
	};

	const [nameState, dispatchName] = useReducer(nameReducer, {
		value: agencyData.name ? agencyData.name : '',
		isValid: true,
		feedbackText: '',
	});
	const [locationState, dispatchLocation] = useReducer(locationReducer, {
		value: agencyData.location ? agencyData.location : '',
		isValid: true,
		feedbackText: '',
	});

	const { isValid: nameIsValid } = nameState;
	const { isValid: locationIsValid } = locationState;

	const nameInputChangeHandler = e => {
		dispatchName({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const locationInputChangeHandler = e => {
		dispatchLocation({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const cityInputChangeHandler = (event, option) => {
		setCity(option);
	};

	const handlerCancel = () => {
		if (isForm) {
			navigate(-1);
		} else {
			setIsForm(!isForm);
		}
	};

	const handleNext = async e => {
		e.preventDefault();
		if (isForm) {
			setIsForm(!isForm);
		}
		if (formIsValid && !isForm && agencyData.length === 0) {
			handleSubmit();
		}
		if (formIsValid && !isForm && agencyData.length !== 0) {
			handleEdit();
		}
	};

	useEffect(() => {
		const fetchCityChoices = async () => {
			try {
				const response = await authFetch(urlCityChoices, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					}
				});
				if (response.ok) {
					const choices = await response.json();
					setCityChoices(choices);
					if (agencyData.city && choices.length > 0) {
						const matchingChoice = choices.find(
							choice => choice.value === agencyData.city
						);
						if (matchingChoice) {
							setCity(matchingChoice);
						}
					}
				}
			} catch (error) {
				console.error('Error fetching agency choices:', error);
			}
		};

		fetchCityChoices();
	}, [urlCityChoices, agencyData.city]);

	const handleSubmit = async () => {
		try {
			const response = await authFetch(url, {
				method: 'POST',
				body: JSON.stringify({
					name: nameState.value,
					location: locationState.value,
					city: city.value,
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();

			if (!response.ok) {
				setErrorMessage('Ocurrió un problema.');
				setIsForm(true);

				if (data.name) {
					dispatchName({
						type: 'INPUT_ERROR',
						errorMessage: data.name[0],
					});
				}
			} else {
				setIsLoading(true);
				setShowModal(true);
			}
		} catch (e) {
			setIsLoading(false);
			setMessage(e.message);
		}
	};
	const handleEdit = async () => {
		try {
			const response = await authFetch(`${url}${agencyData.id}/`, {
				method: 'PUT',
				body: JSON.stringify({
					name: nameState.value,
					location: locationState.value,
					city: city.value,
				}),

				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();

			if (!response.ok) {
				setErrorMessage('Ocurrió un problema.');
				setIsForm(true);

				if (data.name) {
					dispatchName({
						type: 'INPUT_ERROR',
						errorMessage: data.name[0],
					});
				}
			} else {
				setIsLoading(true);
				setShowModal(true);
			}
		} catch (e) {
			setIsLoading(false);
			setMessage(e.message);
		}
	};
	useEffect(() => {
		if (nameState.value && locationState.value && city) {
			const isValid = nameIsValid && locationIsValid;

			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [
		nameState.value,
		locationState.value,
		city,
		nameIsValid,
		locationIsValid,
	]);

	useEffect(() => {
		setTitle(
			agencyData.length !== 0 ? 'Editar Agencia' : 'Agregar Agencia'
		);
		if (agencyData.length !== 0) {
			setButtonText('Guardar Cambios');
		} else {
			setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
		}
	}, [isForm, agencyData]);

	return (
		<>
			<Fragment>
				<ListHeader title={title} text={title} visible={false} />
				{isForm ? (
					<div className={classes.listContainer}>
						{errorMessage && (
							<Alert severity="error">{errorMessage}</Alert>
						)}
						<FormControl fullWidth onSubmit={handleSubmit}>
							<Box mt={4}>
								<h6>1. Datos de Agencia</h6>
								<Grid container spacing={2} mt={1} mb={2}>
									<Grid size={{ xs: 12, sm: 4 }}>
										<TextField
											label="Nombre"
											variant="outlined"
											onChange={nameInputChangeHandler}
											value={nameState.value}
											error={!nameIsValid}
											helperText={
												!nameIsValid
													? nameState.feedbackText
													: ''
											}
											required
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 4 }}>
										<TextField
											label="Dirección"
											variant="outlined"
											onChange={
												locationInputChangeHandler
											}
											value={locationState.value}
											error={!locationIsValid}
											helperText={
												!locationIsValid
													? locationState.feedbackText
													: ''
											}
											required
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 6, sm: 1 }}>
										<Autocomplete
											disablePortal
											value={city}
											options={cityChoices}
											getOptionLabel={option => {
												if (typeof option === 'string')
													return option;
												return option?.label ?? '';
											}}
											isOptionEqualToValue={(
												option,
												value
											) => option.value === value.value}
											renderInput={params => (
												<TextField
													{...params}
													label="Ciudad"
													required
												/>
											)}
											onChange={cityInputChangeHandler}
										/>
									</Grid>
								</Grid>
							</Box>
						</FormControl>
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
								id="cancelar_button"
								variant="outlined"
								onClick={handlerCancel}
								style={{
									textTransform: 'none',
									width: '150px',
								}}
								disabled={isLoading}
							>
								{!isForm ? 'Atrás' : 'Cancelar'}
							</Button>
							<Button
								variant="contained"
								style={{
									textTransform: 'none',
									width: '150px',
								}}
								disabled={disabled || isLoading}
								onClick={handleNext}
							>
								{buttonText}
							</Button>
							{isForm && (
								<Typography
									ml={3}
									style={{
										color: '#6C757D',
										fontStyle: 'italic',
										fontSize: '14px',
									}}
								>
									Los campos con (*) son requeridos para
									avanzar en el formulario.{' '}
								</Typography>
							)}
						</Box>
					</div>
				) : (
					<div className={classes.listContainer}>
						<AddAgencyPreview
							name={nameState.value}
							location={locationState.value}
							city={city}
							message={message}
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
								id="cancelar_button"
								variant="outlined"
								onClick={handlerCancel}
								style={{
									textTransform: 'none',
									width: '150px',
								}}
								disabled={isLoading}
							>
								{!isForm ? 'Atrás' : 'Cancelar'}
							</Button>
							<Button
								variant="contained"
								style={{
									textTransform: 'none',
									width: '150px',
								}}
								disabled={disabled || isLoading}
								onClick={handleNext}
							>
								{buttonText}
							</Button>
							{isForm && (
								<Typography
									ml={3}
									style={{
										color: '#6C757D',
										fontStyle: 'italic',
										fontSize: '14px',
									}}
								>
									Los campos con (*) son requeridos para
									avanzar en el formulario.{' '}
								</Typography>
							)}
						</Box>
					</div>
				)}
				{showModal && <AddAgencyModal editAgency={agencyData} />}
			</Fragment>
		</>
	);
}

export default AddAgency;
