import React, {
	useState,
	useEffect,
	useContext,
	useReducer,
	Fragment,
	useMemo,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
import AddOutputPreview from './AddOutputPreview';
import AddOutputModal from './AddOutputModal';
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

export const AddOutput = () => {
	const url = config.url.HOST + api.API_URL_OUTPUTS;
	const urlClientChoices = config.url.HOST + api.API_URL_ALL_CLIENTS;

	const [isLoading, setIsLoading] = useState(false);
	const authContext = useContext(AuthContext);
	const storeContext = useContext(StoreContext);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const saleData = useMemo(
		() => location.state?.saleData || [],
		[location.state?.saleData]
	);

	const isOutput = useMemo(
		() => location.state?.isOutput || [],
		[location.state?.isOutput]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [showProductsModal, setShowProductsModal] = useState(false);
	const [clientChoices, setClientChoices] = useState([]);
	const [client, setClient] = useState(null);

	const outputDateReducer = (state, action) => {
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
		if (action.type === 'RESET_PRODUCTS') {
			return [];
		}

		return state;
	};

	const [outputDateState, dispatchOutputDate] = useReducer(
		outputDateReducer,
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

	const { isValid: outputDateIsValid } = outputDateState;

	const outputDateInputChangeHandler = newValue => {
		dispatchOutputDate({ type: 'INPUT_CHANGE', val: newValue });
	};

	const clientInputChangeHandler = (event, option) => {
		setClient(option);
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
		const fetchClients = async () => {
			try {
				const response = await fetch(urlClientChoices, {
					method: 'GET',
					headers: {
						Authorization: `Token ${authContext.token}`,
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const data = await response.json();
					const choices = data || [];
					setClientChoices(choices);
					if (saleData.client && choices.length > 0) {
						const matchingChoice = choices.find(
							choice => choice.id === saleData.client.id
						);
						if (matchingChoice) {
							setClient(matchingChoice);
						}
					}
				}
			} catch (error) {
				console.error(
					'Error al recuperar las opciones de Clientes:',
					error
				);
			}
		};

		fetchClients();
	}, [authContext.token, urlClientChoices, saleData.client]);

	const handleSubmit = async () => {
		try {
			// Preparar los datos básicos de la salida
			const outputInfo = {
				client: client.id,
				output_date: outputDateState.value.format('YYYY-MM-DD'),
				output_items: productListState.map(product => ({
					sale_item: product.saleItem,
					product_stock: product.id,
					quantity: product.quantity.value,
				})),
			};

			const response = await fetch(url, {
				method: 'POST',
				body: JSON.stringify(outputInfo),
				headers: {
					Authorization: `Token ${authContext.token}`,
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();

			if (!response.ok) {
				setErrorMessage('Ocurrió un problema.');
				setIsForm(true);
				if (data.output_items) {
					data.output_items.forEach((output_item, index) => {
						const productId = productListState[index]?.id;

						if (output_item.quantity) {
							const errorMessage = Array.isArray(
								output_item.quantity
							)
								? output_item.quantity[0]
								: output_item.quantity;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'quantity',
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
		if (outputDateState.value && client && productListState.length > 0) {
			// Validar Productos
			const allProductsFieldsValid = productListState.every(
				product => product.quantity.value && product.quantity.isValid
			);
			const isValid =
				outputDateIsValid && client && allProductsFieldsValid;
			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [
		client,
		outputDateState.value,
		saleData.length,
		outputDateIsValid,
		productListState,
	]);

	useEffect(() => {
		setTitle('Generar Salida');
		setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
	}, [isForm]);

	return (
		<>
			<Fragment>
				<ListHeader title={title} text={title} visible={false} />
				{isForm ? (
					<>
						{saleData?.saleItems && (
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
									Detalle de Productos Vendidos
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
														<strong>Código</strong>
													</TableCell>
													<TableCell>
														<strong>
															Producto
														</strong>
													</TableCell>
													<TableCell>
														<strong>Almacén</strong>
													</TableCell>
													<TableCell>
														<strong>Estado</strong>
													</TableCell>
													<TableCell align="right">
														<strong>
															Cantidad Vendida
														</strong>
													</TableCell>
													<TableCell align="right">
														<strong>
															Cantidad Despachada
														</strong>
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{saleData.saleItems.map(
													(saleItem, index) => (
														<TableRow key={index}>
															<TableCell>
																{
																	saleItem
																		.products_stock
																		.products
																		.code
																}
															</TableCell>
															<TableCell>
																{
																	saleItem
																		.products_stock
																		.products
																		.name
																}
															</TableCell>
															<TableCell>
																{
																	saleItem
																		.products_stock
																		.warehouses
																		.name
																}
															</TableCell>
															<TableCell>
																{
																	saleItem.status_display
																}
															</TableCell>
															<TableCell align="right">
																{
																	saleItem.quantity
																}
															</TableCell>
															<TableCell align="right">
																{
																	saleItem.dispatched_stock
																}
															</TableCell>
														</TableRow>
													)
												)}
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
										Datos de la Salida
									</Typography>
									<Grid container spacing={2} mt={1} mb={2}>
										<Grid size={{ xs: 12, sm: 4 }}>
											<Autocomplete
												disablePortal
												value={client}
												options={clientChoices}
												getOptionLabel={option =>
													option
														? option.name || ''
														: ''
												}
												renderOption={(
													props,
													option
												) => (
													<li
														{...props}
														key={option.id}
													>
														{option.name}
													</li>
												)}
												renderInput={params => (
													<TextField
														{...params}
														label="Cliente"
														required
													/>
												)}
												onChange={
													clientInputChangeHandler
												}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 2 }}>
											<LocalizationProvider
												dateAdapter={AdapterDayjs}
											>
												<DatePicker
													label="Fecha de Salida"
													onChange={
														outputDateInputChangeHandler
													}
													value={
														outputDateState.value
													}
													slotProps={{
														textField: {
															error: !outputDateIsValid,
															helperText:
																!outputDateIsValid
																	? outputDateState.feedbackText
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
																Stock
															</StyledTableCell>
															<StyledTableCell>
																Cantidad
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
																		{
																			product
																				.stock
																				.value
																		}
																	</TableCell>
																	<TableCell>
																		<TextField
																			variant="outlined"
																			onChange={e =>
																				dispatchProductList(
																					{
																						type: 'QUANTITY_CHANGE',
																						id: product.id,
																						val: e
																							.target
																							.value,
																					}
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
									</>
								)}
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
					</>
				) : (
					<div className={classes.listContainer}>
						<AddOutputPreview
							client={client}
							outputDate={
								outputDateState.value?.format('DD-MM-YYYY') ||
								''
							}
							products={productListState}
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
						sale={saleData}
						agency={storeContext.agency}
						isOutput={isOutput}
					/>
				)}

				{showModal && <AddOutputModal />}
			</Fragment>
		</>
	);
};

export default AddOutput;
