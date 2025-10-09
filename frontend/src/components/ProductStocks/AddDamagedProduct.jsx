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
import { validatePositiveNumber } from '../../Validations';

import {
	Grid,
	TextField,
	Button,
	FormControl,
	Box,
	Typography,
} from '@mui/material';
import classes from '../UI/List/List.module.css';

import AddDamagedProductStockPreview from './AddDamagedProductStockPreview';
import AddDamagedProductStockModal from './AddDamagedProductStockModal';
import ListHeader from '../UI/List/ListHeader';

import { useNavigate, useLocation } from 'react-router-dom';

function AddDamagedProductStock() {
	const url = config.url.HOST + api.API_URL_PRODUCT_STOCKS;
	const [isLoading, setIsLoading] = useState(false);
	const authContext = useContext(AuthContext);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const productStockData = useMemo(
		() => location.state?.productStockData || [],
		[location.state?.productStockData]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');

	const quantityReducer = (state, action) => {
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validatePositiveNumber(action.val),
				feedbackText: 'Ingrese número válido',
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

	const [quantityState, dispatchQuantity] = useReducer(quantityReducer, {
		value: '',
		isValid: true,
		feedbackText: '',
	});

	const { isValid: quantityIsValid } = quantityState;

	const quantityInputChangeHandler = e => {
		dispatchQuantity({ type: 'INPUT_CHANGE', val: e.target.value });
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
		if (formIsValid && !isForm) {
			handleSubmit();
		}
	};

	const handleSubmit = async () => {
		try {
			const response = await fetch(
				`${url}${productStockData.id}/increment-damaged-stock/`,
				{
					method: 'POST',
					body: JSON.stringify({
						quantity: quantityState.value,
					}),
					headers: {
						Authorization: `Token ${authContext.token}`,
						'Content-Type': 'application/json',
					},
				}
			);
			const data = await response.json();

			if (!response.ok) {
				setErrorMessage('Ocurrió un problema.');
				setIsForm(true);

				if (data.quantity) {
					dispatchQuantity({
						type: 'INPUT_ERROR',
						errorMessage: data.quantity[0],
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
		if (quantityState.value) {
			const isValid = quantityIsValid;

			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [quantityState.value, quantityIsValid]);

	useEffect(() => {
		setTitle('Agregar Cantidad de Producto Dañado');
		setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
	}, [isForm]);

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
								<h6>Cantidad de Producto Dañado</h6>
								<Grid container spacing={2} mt={1} mb={2}>
									<Grid size={{ xs: 6, sm: 2 }}>
										<TextField
											label="Cantidad"
											variant="outlined"
											onChange={
												quantityInputChangeHandler
											}
											value={quantityState.value}
											error={!quantityIsValid}
											helperText={
												!quantityIsValid
													? quantityState.feedbackText
													: ''
											}
											required
											fullWidth
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
						<AddDamagedProductStockPreview
							quantity={quantityState.value}
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
				{showModal && <AddDamagedProductStockModal />}
			</Fragment>
		</>
	);
}

export default AddDamagedProductStock;
