import React, {
	Fragment,
	useState,
	useEffect,
	useReducer,
	useContext,
	useMemo,
} from 'react';

import Alert from '@mui/material/Alert';

import AuthContext from '../../store/auth-context';
import { api, config } from '../../Constants';
import {
	validateNameLength,
	validatePhoneNumber,
	validateAddressLength,
	validateCiNumber,
	validateEmail,
} from '../../Validations';

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

import AddClientPreview from './AddClientPreview';
import AddClientModal from './AddClientModal';
import ListHeader from '../UI/List/ListHeader';

import { useNavigate, useLocation } from 'react-router-dom';

function AddClient() {
	const url = config.url.HOST + api.API_URL_CLIENTS;
	const urlClientChoices = config.url.HOST + api.API_URL_CLIENT_CHOICES;
	const [isLoading, setIsLoading] = useState(false);
	const authContext = useContext(AuthContext);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const clientData = useMemo(
		() => location.state?.clientData || [],
		[location.state?.clientData]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [clientTypeChoices, setClientTypeChoices] = useState([]);
	const [clientType, setClientType] = useState(null);
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
	const phoneNumberReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validatePhoneNumber(state.value),
				feedbackText: 'Ingrese numero valido',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validatePhoneNumber(action.val),
				feedbackText: 'Ingrese numero valido',
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
	const nitReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validateCiNumber(state.value),
				feedbackText: 'Ingrese ci/nit valido',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateCiNumber(action.val),
				feedbackText: 'Ingrese ci/nit valido',
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
	const emailReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validateEmail(state.value),
				feedbackText: 'Ingrese correo valido',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateEmail(action.val),
				feedbackText: 'Ingrese correo valido',
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
	const addressReducer = (state, action) => {
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
		value: clientData.name ? clientData.name : '',
		isValid: true,
		feedbackText: '',
	});
	const [phoneNumberState, dispatchPhoneNumber] = useReducer(
		phoneNumberReducer,
		{
			value: clientData.phone ? clientData.phone : '',
			isValid: true,
			feedbackText: '',
		}
	);
	const [nitState, dispatchNit] = useReducer(nitReducer, {
		value: clientData.nit ? clientData.nit : '',
		isValid: true,
		feedbackText: '',
	});
	const [emailState, dispatchEmail] = useReducer(emailReducer, {
		value: clientData.email ? clientData.email : '',
		isValid: true,
		feedbackText: '',
	});
	const [addressState, dispatchAddress] = useReducer(addressReducer, {
		value: clientData.address ? clientData.address : '',
		isValid: true,
		feedbackText: '',
	});

	const { isValid: nameIsValid } = nameState;
	const { isValid: phoneNumberIsValid } = phoneNumberState;
	const { isValid: nitIsValid } = nitState;
	const { isValid: emailIsValid } = emailState;
	const { isValid: addressIsValid } = addressState;

	const nameInputChangeHandler = e => {
		dispatchName({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const phoneNumberInputChangeHandler = e => {
		dispatchPhoneNumber({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const nitInputChangeHandler = e => {
		dispatchNit({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const emailInputChangeHandler = e => {
		dispatchEmail({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const addresInputChangeHandler = e => {
		dispatchAddress({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const clientTypeInputChangeHandler = (event, option) => {
		setClientType(option);
	};

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
					if (clientData.clientType && choices.length > 0) {
						const matchingChoice = choices.find(
							choice => choice.value === clientData.clientType
						);
						if (matchingChoice) {
							setClientType(matchingChoice);
						}
					}
				}
			} catch (error) {
				console.error('Error fetching client choices:', error);
			}
		};

		fetchClientTypeChoices();
	}, [urlClientChoices, authContext.token, clientData.clientType]);

	useEffect(() => {
		if (
			nameState.value &&
			phoneNumberState.value &&
			nitState.value &&
			emailState.value &&
			addressState.value &&
			clientType
		) {
			const isValid =
				nameIsValid &&
				phoneNumberIsValid &&
				nitIsValid &&
				emailIsValid &&
				addressIsValid;

			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [
		clientData,
		nameState.value,
		phoneNumberState.value,
		nitState.value,
		emailState.value,
		addressState.value,
		clientType,
		nameIsValid,
		phoneNumberIsValid,
		nitIsValid,
		emailIsValid,
		addressIsValid,
	]);

	return (
		<>
			<Fragment>
				<div className={classes.listContainer}>
					{errorMessage && (
						<Alert severity="error">{errorMessage}</Alert>
					)}
					<Box mt={4}>
						<h6>1. Datos personales</h6>
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
							<Grid size={{ xs: 6, sm: 2 }}>
								<TextField
									label="NIT/CI"
									variant="outlined"
									onChange={nitInputChangeHandler}
									value={nitState.value}
									error={!nitIsValid}
									helperText={
										!nitIsValid ? nitState.feedbackText : ''
									}
									required
									fullWidth
								/>
							</Grid>
							<Grid size={{ xs: 6, sm: 2 }}>
								<Autocomplete
									disablePortal
									value={clientType}
									options={clientTypeChoices}
									getOptionLabel={option => {
										if (typeof option === 'string')
											return option;
										return option?.label ?? '';
									}}
									isOptionEqualToValue={(option, value) =>
										option.value === value.value
									}
									renderInput={params => (
										<TextField
											{...params}
											label="Tipo"
											required
										/>
									)}
									onChange={clientTypeInputChangeHandler}
								/>
							</Grid>
						</Grid>
					</Box>
					<div>
						<h6>2. Datos de contacto </h6>
						<Grid container spacing={2} mt={1} mb={2}>
							<Grid size={{ xs: 6, sm: 4 }}>
								<TextField
									label="Dirección"
									variant="outlined"
									onChange={addresInputChangeHandler}
									value={addressState.value}
									error={!addressIsValid}
									helperText={
										!addressIsValid
											? addressState.feedbackText
											: ''
									}
									required
									fullWidth
								/>
							</Grid>
							<Grid size={{ xs: 6, sm: 2 }}>
								<TextField
									label="Teléfono"
									variant="outlined"
									onChange={phoneNumberInputChangeHandler}
									value={phoneNumberState.value}
									error={!phoneNumberIsValid}
									helperText={
										!phoneNumberIsValid
											? phoneNumberState.feedbackText
											: ''
									}
									required
									fullWidth
								/>
							</Grid>
							<Grid size={{ xs: 6, sm: 3 }}>
								<TextField
									label="Correo Electrónico"
									variant="outlined"
									onChange={emailInputChangeHandler}
									value={emailState.value}
									error={!emailIsValid}
									helperText={
										!emailIsValid
											? emailState.feedbackText
											: ''
									}
									required
									fullWidth
								/>
							</Grid>
						</Grid>
					</div>
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
								Los campos con (*) son requeridos para avanzar
								en el formulario.{' '}
							</Typography>
						)}
					</Box>
				</div>
			</Fragment>
		</>
	);
}

export default AddClient;
