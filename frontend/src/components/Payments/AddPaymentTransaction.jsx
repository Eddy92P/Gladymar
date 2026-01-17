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
import { api } from '../../Constants';
import { validatePositiveNumber, validTransactionDate } from '../../Validations';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import {
	Grid,
	TextField,
	Button,
	FormControl,
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	InputLabel,
	MenuItem,
	Select,
} from '@mui/material';
import classes from '../UI/List/List.module.css';

import AddPaymentPreview from './AddPaymentTransactionPreview';
import AddPaymentModal from './AddPaymentTransactionModal';
import ListHeader from '../UI/List/ListHeader';

import { useNavigate, useLocation } from 'react-router-dom';

function AddPayment() {
	const API = import.meta.env.VITE_API_URL;
	const url = `${API}${api.API_URL_PAYMENTS}`;

	const paymentMethodChoices = [
		{
			id: 1,
			value: 'efectivo',
			label: 'Efectivo',
		},
		{
			id: 2,
			value: 'tarjeta',
			label: 'Tarjeta',
		},
		{
			id: 3,
			value: 'qr',
			label: 'QR',
		},
	];

	const [isLoading, setIsLoading] = useState(false);
	const authContext = useContext(AuthContext);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const transactionData = useMemo(
		() => location.state?.transactionData || [],
		[location.state?.transactionData]
	);

	const isSale = useMemo(
		() => location.state?.isSale || false,
		[location.state?.isSale]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [paymentMethod, setPaymentMethod] = useState('');

	const amountReducer = (state, action) => {
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validatePositiveNumber(action.val),
				feedbackText: 'Ingrese un número valido',
			};
		}
		if (action.type === 'INPUT_ERROR') {
			return {
				value: state.value,
				isValid: false,
				feedbackText: action.errorMessage,
			};
		}
		return state;
	};

	const paymentDateReducer = (state, action) => {
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validTransactionDate(action.val),
				feedbackText:
					'La fecha no puede ser posterior a la actual',
			};
		}
		return state;
	};

	const amountInputChangeHandler = e => {
		dispatchAmount({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const paymentDateInputChangeHandler = newValue => {
		dispatchPaymentDate({ type: 'INPUT_CHANGE', val: newValue });
	};

	const paymentMethodChangeHandler = e => {
		setPaymentMethod(e.target.value);
	};

	const [amountState, dispatchAmount] = useReducer(amountReducer, {
		value: '',
		isValid: true,
		feedbackText: '',
	});
	const [paymentDateState, dispatchPaymentDate] = useReducer(
		paymentDateReducer,
		{
			value: null,
			isValid: true,
			feedbackText: '',
		}
	);

	const { isValid: amountIsValid } = amountState;
	const { isValid: paymentDateIsValid } = paymentDateState;

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
		if (formIsValid && !isForm) {
			handleSubmit();
		}
	};

	const handleSubmit = async () => {
		try {
			const response = await fetch(url, {
				method: 'POST',
				body: JSON.stringify({
					transaction_id: transactionData.id,
					paymentMethod: paymentMethod,
					transaction_type: isSale ? 'venta' : 'compra',
					amount: amountState.value,
					payment_date: paymentDateState.value.format('YYYY-MM-DD'),
				}),
				headers: {
					Authorization: `Token ${authContext.token}`,
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();

			if (!response.ok) {
				setErrorMessage('Ocurrió un problema.');
				setIsForm(true);

				if (data.amount) {
					dispatchAmount({
						type: 'INPUT_ERROR',
						errorMessage: data.amount[0],
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
		if (amountState.value && paymentDateState.value && paymentMethod) {
			const isValid = amountIsValid && paymentDateIsValid;

			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [
		amountState.value,
		paymentDateState.value,
		paymentMethod,
		amountIsValid,
		paymentDateIsValid,
	]);

	useEffect(() => {
		setTitle('Realizar Pago');

		setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
	}, [isForm]);

	return (
		<>
			<Fragment>
				<ListHeader title={title} text={title} visible={false} />
				{isForm ? (
					<>
						{transactionData && (
							<Paper
								elevation={3}
								sx={{
									p: 4,
								}}
							>
								<Typography
									variant="h5"
									component="h2"
									sx={{
										fontWeight: 'bold',
										mb: 2,
										pb: 1,
									}}
								>
									Detalle General de la Transacción
								</Typography>

								<Box sx={{ width: '100%' }}>
									<TableContainer>
										<Table
											sx={{ minWidth: 650 }}
											aria-label="products table"
										>
											<TableHead>
												<TableRow>
													<TableCell>
														<strong>
															{isSale
																? 'Cliente'
																: 'Proveedor'}
														</strong>
													</TableCell>
													<TableCell>
														<strong>
															Total de la
															Transacción
														</strong>
													</TableCell>
													<TableCell>
														<strong>
															Saldo Pendiente
														</strong>
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												<TableRow>
													<TableCell>
														{transactionData.client
															?.name
															? transactionData
																	.client.name
															: transactionData.supplier}
													</TableCell>
													<TableCell>
														{transactionData.total}
													</TableCell>
													<TableCell>
														{
															transactionData.balanceDue
														}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</TableContainer>
								</Box>
							</Paper>
						)}
						<div className={classes.listContainer}>
							{errorMessage && (
								<Alert severity="error">{errorMessage}</Alert>
							)}
							<FormControl fullWidth onSubmit={handleSubmit}>
								<Box mt={4}>
									<h6>1. Datos de Pago</h6>
									<Grid container spacing={2} mt={1} mb={2}>
										<Grid size={{ xs: 12, sm: 3 }}>
											<TextField
												label="Monto"
												variant="outlined"
												onChange={
													amountInputChangeHandler
												}
												value={amountState.value}
												error={!amountIsValid}
												helperText={
													!amountIsValid
														? amountState.feedbackText
														: ''
												}
												required
												fullWidth
											/>
										</Grid>
										<Grid size={{ xs: 6, sm: 2 }}>
											<FormControl fullWidth required>
												<InputLabel id="payment-method-select-label">
													Método de Pago
												</InputLabel>
												<Select
													labelId="payment-method-select-label"
													id="payment-method-select"
													value={paymentMethod}
													label="Método de Pago"
													onChange={
														paymentMethodChangeHandler
													}
												>
													{paymentMethodChoices.map(
														choice => (
															<MenuItem
																key={choice.id}
																value={
																	choice.value
																}
															>
																{choice.label}
															</MenuItem>
														)
													)}
												</Select>
											</FormControl>
										</Grid>
										<Grid size={{ xs: 12, sm: 3 }}>
											<LocalizationProvider
												dateAdapter={AdapterDayjs}
											>
												<DatePicker
													label="Fecha de Pago"
													onChange={
														paymentDateInputChangeHandler
													}
													value={
														paymentDateState.value
													}
													slotProps={{
														textField: {
															error: !paymentDateIsValid,
															helperText:
																!paymentDateIsValid
																	? paymentDateState.feedbackText
																	: '',
														},
													}}
													fullWidth
												/>
											</LocalizationProvider>
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
					</>
				) : (
					<div className={classes.listContainer}>
						<AddPaymentPreview
							paymentMethod={
								paymentMethodChoices.find(
									choice => choice.value === paymentMethod
								)?.label || paymentMethod
							}
							transactionType={isSale ? 'venta' : 'compra'}
							amount={amountState.value}
							paymentDate={paymentDateState.value.format(
								'YYYY-MM-DD'
							)}
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
				{showModal && <AddPaymentModal />}
			</Fragment>
		</>
	);
}

export default AddPayment;
