import React, {
	Fragment,
	useState,
	useEffect,
	useReducer,
	useContext,
	useMemo,
	useRef,
} from 'react';

import Alert from '@mui/material/Alert';

import AuthContext from '../../store/auth-context';
import { api, config } from '../../Constants';
import { validateNameLength, validateCode } from '../../Validations';

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

import AddBatchPreview from './AddBatchPreview';
import AddBatchModal from './AddBatchModal';
import ListHeader from '../UI/List/ListHeader';

import { useNavigate, useLocation } from 'react-router-dom';

function AddBatch() {
	const url = config.url.HOST + api.API_URL_PRODUCTS;
	const urlBatchChoices = config.url.HOST + api.API_URL_ALL_BATCHES;
	const [isLoading, setIsLoading] = useState(false);
	const authContext = useContext(AuthContext);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const productData = useMemo(
		() => location.state?.productData || [],
		[location.state?.productData]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [batchChoices, setBatchChoices] = useState([]);
	const [batch, setBatch] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');
	const textRef = useRef('');
	const fileRef = useRef('');

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

	const stockReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validateCode(state.value),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateCode(action.val),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		return { value: '', isValid: false };
	};

	const unitMeasurementReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: state.value.length > 0,
				feedbackText: 'Ingrese una unidad de medida válida.',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: action.val.length > 0,
				feedbackText: 'Ingrese una unidad de medida válida.',
			};
		}
		return { value: '', isValid: false };
	};

	const minimumStockReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validateCode(state.value),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateCode(action.val),
				feedbackText: 'Ingrese un número válido.',
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

	const maximumStockReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validateCode(state.value),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateCode(action.val),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		return { value: '', isValid: false };
	};

	const minimumSalePriceReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validateCode(state.value),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateCode(action.val),
				feedbackText: 'Ingrese un número válido.',
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

	const maximumSalePriceReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validateCode(state.value),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateCode(action.val),
				feedbackText: 'Ingrese un número válido.',
			};
		}
	};

	const codeReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validateCode(state.value),
				feedbackText: 'Ingrese código válido',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateCode(action.val),
				feedbackText: 'Ingrese código válido',
			};
		}
		return { value: '', isValid: false };
	};

	const [nameState, dispatchName] = useReducer(nameReducer, {
		value: productData.name ? productData.name : '',
		isValid: true,
		feedbackText: '',
	});

	const [stockState, dispatchStock] = useReducer(stockReducer, {
		value: productData.stock ? productData.stock : '',
		isValid: true,
		feedbackText: '',
	});

	const [minimumStockState, dispatchMinimumStock] = useReducer(
		minimumStockReducer,
		{
			value: productData.minimum_stock ? productData.minimum_stock : '',
			isValid: true,
			feedbackText: '',
		}
	);

	const [maximumStockState, dispatchMaximumStock] = useReducer(
		maximumStockReducer,
		{
			value: productData.maximum_stock ? productData.maximum_stock : '',
			isValid: true,
			feedbackText: '',
		}
	);

	const [minimumSalePriceState, dispatchMinimumSalePrice] = useReducer(
		minimumSalePriceReducer,
		{
			value: productData.minimum_sale_price
				? productData.minimum_sale_price
				: '',
			isValid: true,
			feedbackText: '',
		}
	);

	const [maximumSalePriceState, dispatchMaximumSalePrice] = useReducer(
		maximumSalePriceReducer,
		{
			value: productData.maximum_sale_price
				? productData.maximum_sale_price
				: '',
			isValid: true,
			feedbackText: '',
		}
	);

	const [codeState, dispatchCode] = useReducer(codeReducer, {
		value: productData.code ? productData.code : '',
		isValid: true,
		feedbackText: '',
	});

	const [unitMeasurementState, dispatchUnitMeasurementState] = useReducer(
		unitMeasurementReducer,
		{
			value: productData.unit_of_measurement
				? productData.unit_of_measurement
				: '',
			isValid: true,
			feedbackText: '',
		}
	);

	const { isValid: nameIsValid } = nameState;
	const { isValid: codeIsValid } = codeState;
	const { isValid: stockIsValid } = stockState;
	const { isValid: minimumStockIsValid } = minimumStockState;
	const { isValid: maximumStockIsValid } = maximumStockState;
	const { isValid: minimumSalePriceIsValid } = minimumSalePriceState;
	const { isValid: maximumSalePriceIsValid } = maximumSalePriceState;
	const { isValid: unitMeasurementIsValid } = unitMeasurementState;

	const nameInputChangeHandler = e => {
		dispatchName({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const codeInputChangeHandler = e => {
		dispatchCode({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const stockInputChangeHandler = e => {
		dispatchCode({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const minimumStockInputChangeHandler = e => {
		dispatchCode({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const maximumStockInputChangeHandler = e => {
		dispatchCode({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const minimumSalePriceInputChangeHandler = e => {
		dispatchCode({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const maximumSalePriceInputChangeHandler = e => {
		dispatchCode({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const unitMeasurementInputChangeHandler = e => {
		dispatchCode({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const batchInputChangeHandler = (event, option) => {
		setBatch(option);
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
		if (formIsValid && !isForm && productData.length === 0) {
			handleSubmit();
		}
		if (formIsValid && !isForm && productData.length !== 0) {
			handleEdit();
		}
	};

	useEffect(() => {
		const fetchBatchChoices = async () => {
			try {
				const response = await fetch(urlBatchChoices, {
					headers: {
						Authorization: `Token ${authContext.token}`,
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const data = await response.json();
					const choices = data || [];
					setBatchChoices(choices);
					if (productData.batch && choices.length > 0) {
						const matchingChoice = choices.find(
							choice => choice.id === productData.batch.id
						);
						if (matchingChoice) {
							setBatch(matchingChoice);
						}
					}
				}
			} catch (error) {
				console.error('Error fetching batch choices:', error);
			}
		};

		fetchBatchChoices();
	}, [urlBatchChoices, authContext.token, productData.batch]);

	const handleSubmit = async () => {
		const text = textRef.current.value;
		const file = fileRef.current.files[0];

		const formData = new FormData();
		formData.append('name', nameState.value);
		formData.append('stock', stockState.value);
		formData.append('code', codeState.value);
		formData.append('description', text);
		formData.append('image', file);
		formData.append('minimum_stock', minimumStockState.value);
		formData.append('maximum_stock', maximumStockState.value);
		formData.append('minimum_sale_price', minimumSalePriceState.value);
		formData.append('maximum_sale_price', maximumSalePriceState.value);
		formData.append('unit_of_measurement', maximumSalePriceState.value);

		try {
			const response = await fetch(url, {
				method: 'POST',
				body: formData,
				headers: {
					Authorization: `Token ${authContext.token}`,
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
				if (data.minimum_stock) {
					dispatchMinimumStock({
						type: 'INPUT_ERROR',
						errorMessage: data.minimum_stock[0],
					});
				}
				if (data.minimum_sale_price) {
					dispatchMinimumSalePrice({
						type: 'INPUT_ERROR',
						errorMessage: data.minimum_sale_price[0],
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
		const text = textRef.current.value;
		const file = fileRef.current.files[0];

		const formData = new FormData();
		if (file) {
			formData.append('image', file);
		}
		formData.append('name', nameState.value);
		formData.append('stock', stockState.value);
		formData.append('code', codeState.value);
		formData.append('description', text);
		formData.append('minimum_stock', minimumStockState.value);
		formData.append('maximum_stock', maximumStockState.value);
		formData.append('minimum_sale_price', minimumSalePriceState.value);
		formData.append('maximum_sale_price', maximumSalePriceState.value);
		formData.append('unit_of_measurement', maximumSalePriceState.value);

		try {
			const response = await fetch(`${url}${productData.id}/`, {
				method: 'PUT',
				body: formData,

				headers: {
					Authorization: `Token ${authContext.token}`,
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
		if (
			nameState.value &&
			stockState.value &&
			codeState.value &&
			minimumStockState.value &&
			maximumStockState.value &&
			minimumSalePriceState.value &&
			maximumSalePriceState.value &&
			unitMeasurementState.value &&
			batch
		) {
			const isValid =
				nameIsValid &&
				stockIsValid &&
				codeIsValid &&
				minimumStockIsValid &&
				maximumStockIsValid &&
				minimumSalePriceIsValid &&
				maximumSalePriceIsValid &&
				unitMeasurementIsValid;

			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [
		nameState.value,
		stockState.value,
		codeState.value,
		minimumStockState.value,
		maximumStockState.value,
		minimumSalePriceState.value,
		maximumSalePriceState.value,
		unitMeasurementState.value,
		batch,
		nameIsValid,
		stockIsValid,
		codeIsValid,
		minimumStockIsValid,
		maximumStockIsValid,
		minimumSalePriceIsValid,
		maximumSalePriceIsValid,
		unitMeasurementIsValid,
	]);

	useEffect(() => {
		setTitle(
			productData.length !== 0 ? 'Editar Producto' : 'Agregar Producto'
		);
		if (productData.length !== 0) {
			setButtonText('Guardar Cambios');
		} else {
			setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
		}
	}, [isForm, productData]);

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
								<h6>1. Datos del Producto</h6>
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
									<Grid size={{ xs: 6, sm: 3 }}>
										<Autocomplete
											disablePortal
											value={category}
											options={categoryChoices}
											getOptionLabel={option =>
												option ? option.name || '' : ''
											}
											renderOption={(props, option) => (
												<li {...props} key={option.id}>
													{option.name}
												</li>
											)}
											renderInput={params => (
												<TextField
													{...params}
													label="Categoría"
													required
												/>
											)}
											onChange={
												categoryInputChangeHandler
											}
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
						<AddBatchPreview
							name={nameState.value}
							category={category.name}
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
				{showModal && <AddBatchModal editBatch={batchData} />}
			</Fragment>
		</>
	);
}

export default AddBatch;
