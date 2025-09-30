import React, {
	useState,
	useEffect,
	useContext,
	useReducer,
	useCallback,
	Fragment,
} from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Components and styles
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
	IconButton,
	Tooltip,
	Alert,
	Autocomplete,
	InputLabel,
	MenuItem,
	Select,
	InputAdornment,
	FilledInput,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Validations and Constants
import { validatePositiveNumber, validDate } from '../../Validations';
import { api, config } from '../../Constants';

// Components
import AddProductDetailedList from '../Products/AddProductDetailedList';
import AddPurchasePreview from './AddPurchasePreview';
import AddPurchaseModal from './AddPurchaseModal';
import ListHeader from '../UI/List/ListHeader';

// Context
import AuthContext from '../../store/auth-context';
import { StoreContext } from '../../store/store-context';

// CSS classes
import classes from '../UI/List/List.module.css';

// Styled components defined outside the component
const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: '#74353c',
		color: theme.palette.common.white,
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
	},
}));

export const AddPurchase = () => {
	const url = config.url.HOST + api.API_URL_PURCHASES;
	const urlSupplierChoices = config.url.HOST + api.API_URL_ALL_SUPPLIERS;

	const purchaseTypeChoices = [
		{ id: 1, value: 'contado', label: 'Contado' },
		{ id: 2, value: 'credito', label: 'Crédito' },
	];

	const paymentMethodChoices = [
		{ id: 1, value: 'efectivo', label: 'Efectivo' },
		{ id: 2, value: 'tarjeta', label: 'Tarjeta' },
		{ id: 3, value: 'qr', label: 'QR' },
	];

	const [isLoading, setIsLoading] = useState(false);
	const authContext = useContext(AuthContext);
	const storeContext = useContext(StoreContext);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [showProductsModal, setShowProductsModal] = useState(false);
	const [purchaseTotalAmount, setPurchaseTotalAmount] = useState('');
	const [purchaseType, setPurchaseType] = useState('');
	const [supplierChoices, setSupplierChoices] = useState([]);
	const [supplier, setSupplier] = useState(null);
	const [paymentMethod, setPaymentMethod] = useState('');

	const purchaseDateReducer = (state, action) => {
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validDate(action.val),
				feedbackText:
					'La fecha no puede ser anterior ni posterior a la actual',
			};
		}
		return state;
	};

	const invoiceNumberReducer = (state, action) => {
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validatePositiveNumber(action.val),
				feedbackText: 'Ingrese número valido',
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

	const paymentAmountReducer = (state, action) => {
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validatePositiveNumber(action.val),
				feedbackText: 'Ingrese pago valido',
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
				isValid: validDate(action.val),
				feedbackText:
					'La fecha no puede ser anterior ni posterior a la actual',
			};
		}
		return state;
	};

	const productListReducer = (state, action) => {
		if (action.type === 'PRICE_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? {
							...product,
							price: {
								value: action.val,
								isValid: validatePositiveNumber(action.val),
								feedbackText: validatePositiveNumber(action.val)
									? ''
									: 'Ingrese un número válido',
							},
						}
					: product
			);
		}
		if (action.type === 'QUANTITY_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? {
							...product,
							quantity: {
								value: action.val,
								isValid: validatePositiveNumber(action.val),
								feedbackText: validatePositiveNumber(action.val)
									? ''
									: 'Ingrese un número válido',
							},
						}
					: product
			);
		}
		if (action.type === 'UNIT_PRICE_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? {
							...product,
							unitPrice: {
								value: action.val,
								isValid: validatePositiveNumber(action.val),
								feedbackText: validatePositiveNumber(action.val)
									? ''
									: 'Ingrese un número válido',
							},
						}
					: product
			);
		}
		if (action.type === 'TOTAL_PRICE_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? {
							...product,
							totalPrice: {
								value: action.val,
								isValid: validatePositiveNumber(action.val),
							},
						}
					: product
			);
		}
		if (action.type === 'SET_ERROR') {
			return state.map(product => {
				if (product.id === action.id) {
					return {
						...product,
						[action.field]: {
							...product[action.field],
							isValid: false,
							feedbackText: action.errorMessage,
						},
					};
				}
				return product;
			});
		}
		if (action.type === 'REMOVE_PRODUCT') {
			return state.filter(product => product.id !== action.id);
		}
		if (action.type === 'ADD_PRODUCT') {
			return [...state, action.product];
		}

		return state;
	};

	const [purchaseDateState, dispatchPurchaseDate] = useReducer(
		purchaseDateReducer,
		{
			value: null,
			isValid: true,
			feedbackText: '',
		}
	);
	const [invoiceNumberState, dispatchInvoiceNumber] = useReducer(
		invoiceNumberReducer,
		{
			value: '',
			isValid: true,
			feedbackText: '',
		}
	);
	const [paymentAmountState, dispatchPaymentAmount] = useReducer(
		paymentAmountReducer,
		{
			value: '',
			isValid: true,
			feedbackText: '',
		}
	);
	const [paymentDateState, dispatchPaymentDate] = useReducer(
		paymentDateReducer,
		{
			value: null,
			isValid: true,
			feedbackText: '',
		}
	);
	const [productListState, dispatchProductList] = useReducer(
		productListReducer,
		[]
	);

	const { isValid: purchaseDateIsValid } = purchaseDateState;
	const { isValid: invoiceNumberIsValid } = invoiceNumberState;
	const { isValid: paymentAmountIsValid } = paymentAmountState;
	const { isValid: paymentDateIsValid } = paymentDateState;

	const purchaseDateInputChangeHandler = newValue => {
		dispatchPurchaseDate({ type: 'INPUT_CHANGE', val: newValue });
	};

	const invoiceNumberInputChangeHandler = e => {
		dispatchInvoiceNumber({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const paymentAmountInputChangeHandler = e => {
		dispatchPaymentAmount({ type: 'INPUT_CHANGE', val: e.target.value });
		if (
			purchaseType === 'contado' &&
			e.target.value < purchaseTotalAmount
		) {
			dispatchPaymentAmount({
				type: 'INPUT_ERROR',
				errorMessage:
					'Si la compra es al contado el pago debe cubrir el monto total.',
			});
		}
	};

	const paymentDateInputChangeHandler = newValue => {
		dispatchPaymentDate({ type: 'INPUT_CHANGE', val: newValue });
	};

	const purchaseTypeChangeHandler = e => {
		setPurchaseType(e.target.value);
	};

	const paymentMethodChangeHandler = e => {
		setPaymentMethod(e.target.value);
	};

	// Función para calcular y actualizar el precio total de cada producto
	const calculateAndUpdateTotalPrice = useCallback(
		(id, price, quantity) => {
			const totalPrice = price * quantity;
			dispatchProductList({
				type: 'TOTAL_PRICE_CHANGE',
				id,
				val: totalPrice.toString(),
			});
		},
		[dispatchProductList]
	);

	// Función para calcular y actualizar el precio total de la compra
	const calculateAndUpdateTotalPurchasePrice = useCallback(() => {
		const updated = [...productListState];
		let totalPurchasePrice = 0;
		for (const product of updated) {
			totalPurchasePrice += parseFloat(product.totalPrice.value) || 0;
		}

		setPurchaseTotalAmount(totalPurchasePrice);
	}, [productListState]);

	// Recalcular el total de la compra cuando cambie la lista de productos
	useEffect(() => {
		calculateAndUpdateTotalPurchasePrice();
	}, [productListState, calculateAndUpdateTotalPurchasePrice]);

	const priceInputChangeHandler = useCallback(
		(id, value) => {
			dispatchProductList({ type: 'PRICE_CHANGE', id, val: value });

			// Buscar el producto actual para obtener la cantidad
			const product = productListState.find(p => p.id === id);
			if (product) {
				const price = parseFloat(value) || 0;
				const quantity = parseFloat(product.quantity.value) || 0;
				calculateAndUpdateTotalPrice(id, price, quantity);
			}
		},
		[dispatchProductList, productListState, calculateAndUpdateTotalPrice]
	);

	const quantityInputChangeHandler = useCallback(
		(id, value) => {
			dispatchProductList({ type: 'QUANTITY_CHANGE', id, val: value });

			// Buscar el producto actual para obtener el precio
			const product = productListState.find(p => p.id === id);
			if (product) {
				const price = parseFloat(product.price.value) || 0;
				const quantity = parseFloat(value) || 0;
				calculateAndUpdateTotalPrice(id, price, quantity);
			}
		},
		[dispatchProductList, productListState, calculateAndUpdateTotalPrice]
	);

	const supplierInputChangeHandler = (event, option) => {
		setSupplier(option);
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

	useEffect(() => {
		const fetchSuppliers = async () => {
			try {
				const response = await fetch(urlSupplierChoices, {
					method: 'GET',
					headers: {
						Authorization: `Token ${authContext.token}`,
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const data = await response.json();
					const choices = data || [];
					setSupplierChoices(choices);
				}
			} catch (error) {
				console.error(
					'Error al recuperar las opciones de Proveedores:',
					error
				);
			}
		};

		fetchSuppliers();
	}, [authContext.token, urlSupplierChoices]);

	const handleSubmit = async () => {
		try {
			const response = await fetch(url, {
				method: 'POST',
				body: JSON.stringify({
					agency: storeContext.agency,
					supplier: supplier.id,
					purchase_date: purchaseDateState.value.format('YYYY-MM-DD'),
					invoice_number: invoiceNumberState.value,
					purchase_type: purchaseType,
					status: 'realizado',
					total: purchaseTotalAmount,
					balance_due: purchaseTotalAmount,
					purchase_items: productListState.map(product => ({
						product_stock: product.id,
						quantity: product.quantity.value,
						unit_price: product.price.value,
						total_price: product.totalPrice.value,
					})),
					payments: {
						payment_method: paymentMethod,
						transaction_type: 'compra',
						amount: paymentAmountState.value,
						payment_date:
							paymentDateState.value.format('YYYY-MM-DD'),
					},
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

				if (data.invoice_number) {
					dispatchInvoiceNumber({
						type: 'INPUT_ERROR',
						errorMessage: data.invoice_number[0],
					});
				}
				if (data.payments.payment_date) {
					dispatchPaymentDate({
						type: 'INPUT_ERROR',
						errorMessage: data.payments.payment_date[0],
					});
				}
				if (data.payments.amount) {
					dispatchPaymentAmount({
						type: 'INPUT_ERROR',
						errorMessage: data.payments.amount,
					});
				}
				if (data.purchase_items) {
					data.purchase_items.forEach((purchase_item, index) => {
						const productId = productListState[index]?.id;

						if (purchase_item.quantity) {
							const errorMessage = Array.isArray(
								purchase_item.quantity
							)
								? purchase_item.end_date[0]
								: purchase_item.end_date;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'quantity',
							});
						}

						if (purchase_item.unit_price) {
							const errorMessage = Array.isArray(
								purchase_item.unit_price
							)
								? purchase_item.unit_price[0]
								: purchase_item.unit_price;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'unitPrice',
							});
						}

						if (purchase_item.total_price) {
							const errorMessage = Array.isArray(
								purchase_item.total_price
							)
								? purchase_item.total_price[0]
								: purchase_item.total_price;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'totalPrice',
							});
						}
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

	const handleRemoveProduct = (e, id) => {
		dispatchProductList({ type: 'REMOVE_PRODUCT', id });
	};

	useEffect(() => {
		if (
			purchaseDateState.value &&
			invoiceNumberState.value &&
			purchaseType &&
			paymentAmountState.value &&
			paymentMethod &&
			paymentDateState.value &&
			supplier &&
			productListState.length > 0
		) {
			const allFieldsValid = productListState.every(
				product =>
					product.price.value &&
					product.quantity.value &&
					product.totalPrice.value &&
					product.price.isValid &&
					product.quantity.isValid &&
					product.totalPrice.isValid
			);
			const isValid =
				purchaseDateIsValid &&
				invoiceNumberIsValid &&
				paymentAmountIsValid &&
				paymentDateIsValid &&
				allFieldsValid;
			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [
		supplier,
		purchaseDateState.value,
		invoiceNumberState.value,
		paymentAmountState.value,
		paymentDateState.value,
		paymentMethod,
		purchaseType,
		purchaseDateIsValid,
		invoiceNumberIsValid,
		paymentAmountIsValid,
		paymentDateIsValid,
		productListState,
	]);

	useEffect(() => {
		setTitle('Realizar Compra');

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
							<Box sx={{ mt: 2, flexGrow: 1 }}>
								<Typography
									variant="h6"
									component="h2"
									sx={{
										fontWeight: 'bold',
										mb: 2,
										pb: 1,
									}}
								>
									Datos de Compra
								</Typography>
								<Grid container spacing={2} mt={1} mb={2}>
									<Grid size={{ xs: 12, sm: 4 }}>
										<Autocomplete
											disablePortal
											value={supplier}
											options={supplierChoices}
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
													label="Proveedor"
													required
												/>
											)}
											onChange={
												supplierInputChangeHandler
											}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 2 }}>
										<TextField
											label="Nº Factura"
											variant="outlined"
											onChange={
												invoiceNumberInputChangeHandler
											}
											value={invoiceNumberState.value}
											error={!invoiceNumberIsValid}
											helperText={
												!invoiceNumberIsValid
													? invoiceNumberState.feedbackText
													: ''
											}
											required
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 2 }}>
										<LocalizationProvider
											dateAdapter={AdapterDayjs}
										>
											<DatePicker
												label="Fecha de Compra"
												onChange={
													purchaseDateInputChangeHandler
												}
												value={purchaseDateState.value}
												slotProps={{
													textField: {
														error: !purchaseDateIsValid,
														helperText:
															!purchaseDateIsValid
																? purchaseDateState.feedbackText
																: '',
													},
												}}
												required
												fullWidth
											/>
										</LocalizationProvider>
									</Grid>
									<Grid size={{ xs: 12, sm: 2 }}>
										<FormControl fullWidth required>
											<InputLabel id="purchase-type-select-label">
												Tipo de Compra
											</InputLabel>
											<Select
												labelId="purchase-type-select-label"
												id="purchase-type-select"
												value={purchaseType}
												label="Tipo de Compra"
												onChange={
													purchaseTypeChangeHandler
												}
											>
												{purchaseTypeChoices.map(
													choice => (
														<MenuItem
															key={choice.id}
															value={choice.value}
														>
															{choice.label}
														</MenuItem>
													)
												)}
											</Select>
										</FormControl>
									</Grid>
								</Grid>
							</Box>
							{productListState.length > 0 && (
								<>
									<Box sx={{ mt: 2, flexGrow: 1 }}>
										<Typography
											variant="h6"
											component="h2"
											sx={{
												fontWeight: 'bold',
												mb: 2,
												pb: 1,
											}}
										>
											Productos
										</Typography>
										<TableContainer component={Paper}>
											<Table
												sx={{ minWidth: 650 }}
												aria-label="simple table"
											>
												<TableHead>
													<TableRow>
														<StyledTableCell>
															Nombre
														</StyledTableCell>
														<StyledTableCell>
															Código
														</StyledTableCell>
														<StyledTableCell>
															Cantidad
														</StyledTableCell>
														<StyledTableCell>
															Precio Unitario Bs.
														</StyledTableCell>
														<StyledTableCell>
															Costo Total Bs.
														</StyledTableCell>
														<StyledTableCell>
															Acciones
														</StyledTableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													{productListState.map(
														product => (
															<TableRow
																key={`row-${product.id}`}
															>
																<TableCell>
																	{
																		product.name
																	}
																</TableCell>
																<TableCell>
																	{
																		product.code
																	}
																</TableCell>
																<TableCell>
																	<TextField
																		variant="outlined"
																		onChange={e =>
																			quantityInputChangeHandler(
																				product.id,
																				e
																					.target
																					.value
																			)
																		}
																		value={
																			product
																				.quantity
																				.value
																		}
																		error={
																			(product
																				.quantity
																				.value &&
																				!product
																					.quantity
																					.isValid) ||
																			(!product
																				.quantity
																				.isValid &&
																				product
																					.quantity
																					.feedbackText)
																		}
																		helperText={
																			(product
																				.quantity
																				.value &&
																				!product
																					.quantity
																					.isValid) ||
																			(!product
																				.quantity
																				.isValid &&
																				product
																					.quantity
																					.feedbackText)
																				? product
																						.quantity
																						.feedbackText
																				: ''
																		}
																		required
																		fullWidth
																	/>
																</TableCell>
																<TableCell>
																	<TextField
																		variant="outlined"
																		onChange={e =>
																			priceInputChangeHandler(
																				product.id,
																				e
																					.target
																					.value
																			)
																		}
																		value={
																			product
																				.price
																				.value
																		}
																		error={
																			(product
																				.price
																				.value &&
																				!product
																					.price
																					.isValid) ||
																			(!product
																				.price
																				.isValid &&
																				product
																					.price
																					.feedbackText)
																		}
																		helperText={
																			(product
																				.price
																				.value &&
																				!product
																					.price
																					.isValid) ||
																			(!product
																				.price
																				.isValid &&
																				product
																					.price
																					.feedbackText)
																				? product
																						.price
																						.feedbackText
																				: ''
																		}
																		required
																		fullWidth
																	/>
																</TableCell>
																<TableCell>
																	<TextField
																		variant="outlined"
																		onChange={e =>
																			dispatchProductList(
																				{
																					type: 'TOTAL_PRICE_CHANGE',
																					id: product.id,
																					val: e
																						.target
																						.value,
																				}
																			)
																		}
																		value={
																			product
																				.totalPrice
																				.value
																		}
																		disabled
																		fullWidth
																		slotProps={{
																			inputLabel:
																				{
																					shrink: true,
																				},
																		}}
																	/>
																</TableCell>
																<TableCell align="center">
																	<Tooltip
																		title={
																			'Quitar'
																		}
																		placement="top"
																	>
																		<IconButton
																			aria-label="add"
																			onClick={e =>
																				handleRemoveProduct(
																					e,
																					product.id
																				)
																			}
																		>
																			<CancelIcon
																				sx={{
																					color: red[500],
																				}}
																			/>
																		</IconButton>
																	</Tooltip>
																</TableCell>
															</TableRow>
														)
													)}
												</TableBody>
											</Table>
										</TableContainer>
									</Box>
									<Box sx={{ mt: 4, flexGrow: 1 }}>
										<Typography
											variant="h6"
											component="h2"
											sx={{
												fontWeight: 'bold',
												mb: 2,
												pb: 1,
											}}
										>
											Datos de Pago
										</Typography>
										<Grid
											container
											spacing={2}
											mt={1}
											mb={2}
										>
											<Grid size={{ xs: 12, sm: 2 }}>
												<FormControl fullWidth required>
													<InputLabel id="purchase-type-select-label">
														Método de Pago
													</InputLabel>
													<Select
														labelId="purchase-type-select-label"
														id="purchase-type-select"
														value={paymentMethod}
														label="Método de Pago"
														onChange={
															paymentMethodChangeHandler
														}
													>
														{paymentMethodChoices.map(
															choice => (
																<MenuItem
																	key={
																		choice.id
																	}
																	value={
																		choice.value
																	}
																>
																	{
																		choice.label
																	}
																</MenuItem>
															)
														)}
													</Select>
												</FormControl>
											</Grid>
											<Grid size={{ xs: 12, sm: 2 }}>
												<TextField
													label="Monto Cancelado"
													variant="outlined"
													onChange={
														paymentAmountInputChangeHandler
													}
													value={
														paymentAmountState.value
													}
													error={
														!paymentAmountIsValid
													}
													helperText={
														!paymentAmountIsValid
															? paymentAmountState.feedbackText
															: ''
													}
													required
													fullWidth
												/>
											</Grid>
											<Grid size={{ xs: 12, sm: 2 }}>
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
														required
														fullWidth
													/>
												</LocalizationProvider>
											</Grid>
										</Grid>
									</Box>
								</>
							)}
						</FormControl>
						<Box
							sx={{
								mt: 2,
								flexGrow: 1,
								display: 'flex',
								justifyContent: 'center',
							}}
						>
							{purchaseTotalAmount > 0 && (
								<FormControl
									sx={{ m: 1, width: '20%' }}
									variant="filled"
								>
									<InputLabel htmlFor="standard-adornment-amount">
										Total
									</InputLabel>
									<FilledInput
										id="standard-adornment-amount"
										startAdornment={
											<InputAdornment position="start">
												Bs.
											</InputAdornment>
										}
										value={purchaseTotalAmount}
										disabled
									/>
								</FormControl>
							)}
						</Box>
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
							<Button
								variant="contained"
								style={{
									textTransform: 'none',
									width: '200px',
								}}
								onClick={() => setShowProductsModal(true)}
								color="success"
								startIcon={<SearchIcon />}
							>
								Buscar Productos
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
						<AddPurchasePreview
							supplier={supplier}
							invoiceNumber={invoiceNumberState.value}
							purchaseDate={purchaseDateState.value}
							purchaseType={purchaseType}
							products={productListState}
							paymentMethod={paymentMethod}
							paymentAmount={paymentAmountState.value}
							paymentDate={paymentDateState.value.format(
								'DD-MM-YYYY'
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
				{showProductsModal && (
					<AddProductDetailedList
						onProductList={products => {
							products.forEach(product => {
								dispatchProductList({
									type: 'ADD_PRODUCT',
									product,
								});
							});
						}}
						onClose={() => setShowProductsModal(false)}
						addedProducts={productListState}
					/>
				)}

				{showModal && <AddPurchaseModal />}
			</Fragment>
		</>
	);
};

export default AddPurchase;
