import React, {
	useState,
	useEffect,
	useContext,
	useMemo,
	useReducer,
	Fragment,
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
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Validations and Constants
import {
	validateNameLength,
	validateActualDate,
	validatePositiveNumber,
} from '../../Validations';
import { api, config } from '../../Constants';

// Components
import AddProductDetailedList from '../Products/AddProductDetailedList';
import AddSellingChannelPreview from './AddSellingChannelPreview';
import AddSellingChannelModal from './AddSellingChannelModal';
import ListHeader from '../UI/List/ListHeader';

// Context
import AuthContext from '../../store/auth-context';

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

export const AddSellingChannel = () => {
	const url = config.url.HOST + api.API_URL_SELLING_CHANNEL;

	const [isLoading, setIsLoading] = useState(false);
	const authContext = useContext(AuthContext);
	const [, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const sellingChannelData = useMemo(
		() => location.state?.sellingChannelData || [],
		[location.state?.sellingChannelData]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [showProductsModal, setShowProductsModal] = useState(false);

	const nameReducer = (state, action) => {
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
		if (action.type === 'START_DATE_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? {
							...product,
							startDate: {
								value: action.val,
								isValid: validateActualDate(action.val),
								feedbackText: validateActualDate(action.val)
									? ''
									: 'Ingrese una fecha válida o deje vacío',
							},
						}
					: product
			);
		}
		if (action.type === 'END_DATE_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? {
							...product,
							endDate: {
								value: action.val,
								isValid: validateActualDate(action.val),
								feedbackText: validateActualDate(action.val)
									? ''
									: 'Ingrese una fecha válida o deje vacío',
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

	const [nameState, dispatchName] = useReducer(nameReducer, {
		value: sellingChannelData.name ? sellingChannelData.name : '',
		isValid: true,
		feedbackText: '',
	});
	// Transform the data structure to match the expected reducer format
	const transformProductsForEditing = products => {
		if (!products || !Array.isArray(products)) return [];

		return products.map(product => {
			// Handle different possible data structures from backend
			const transformedProduct = {
				// Core product information
				id: product.id,
				name:
					product.name ||
					product.products?.name ||
					product.product?.name ||
					'',
				code:
					product.code ||
					product.products?.code ||
					product.product?.code ||
					'',

				// Price field with proper structure
				price:
					product.price && typeof product.price === 'object'
						? product.price
						: {
								value: product.price || '',
								isValid: true,
								feedbackText: '',
							},

				// Start date field with proper structure
				startDate:
					product.startDate && typeof product.startDate === 'object'
						? product.startDate
						: {
								value:
									product.start_date ||
									product.startDate ||
									'',
								isValid: true,
								feedbackText: '',
							},

				// End date field with proper structure
				endDate:
					product.endDate && typeof product.endDate === 'object'
						? product.endDate
						: {
								value:
									product.end_date || product.endDate || '',
								isValid: true,
								feedbackText: '',
							},
			};

			return transformedProduct;
		});
	};

	const transformedProducts = transformProductsForEditing(
		sellingChannelData.products
	);

	const [productListState, dispatchProductList] = useReducer(
		productListReducer,
		transformedProducts
	);

	const { isValid: nameIsValid } = nameState;

	const nameInputChangeHandler = e => {
		dispatchName({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const priceInputChangeHandler = (id, value) => {
		dispatchProductList({ type: 'PRICE_CHANGE', id, val: value });
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
		if (formIsValid && !isForm && sellingChannelData.length === 0) {
			handleSubmit();
		}
		if (formIsValid && !isForm && sellingChannelData.length !== 0) {
			handleEdit();
		}
	};

	const handleSubmit = async () => {
		try {
			const response = await fetch(url, {
				method: 'POST',
				body: JSON.stringify({
					name: nameState.value,
					product_channel_price: productListState.map(product => ({
						product: product.id,
						price: product.price?.value,
						start_date: product.startDate?.value || null,
						end_date: product.endDate?.value || null,
					})),
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

				if (data.name) {
					dispatchName({
						type: 'INPUT_ERROR',
						errorMessage: data.name[0],
					});
				}
				if (data.product_channel_price) {
					data.product_channel_price.forEach(
						(product_channel, index) => {
							const productId = productListState[index]?.id;

							// Manejar errores de end_date
							if (product_channel.end_date) {
								const errorMessage = Array.isArray(
									product_channel.end_date
								)
									? product_channel.end_date[0]
									: product_channel.end_date;

								dispatchProductList({
									type: 'SET_ERROR',
									id: productId,
									errorMessage: errorMessage,
									field: 'endDate',
								});
							}
							// Manejar errores de start_date
							if (product_channel.start_date) {
								const errorMessage = Array.isArray(
									product_channel.start_date
								)
									? product_channel.start_date[0]
									: product_channel.start_date;

								dispatchProductList({
									type: 'SET_ERROR',
									id: productId,
									errorMessage: errorMessage,
									field: 'startDate',
								});
							}
							// Manejar errores de price
							if (product_channel.price) {
								const errorMessage = Array.isArray(
									product_channel.price
								)
									? product_channel.price[0]
									: product_channel.price;

								dispatchProductList({
									type: 'SET_ERROR',
									id: productId,
									errorMessage: errorMessage,
									field: 'price',
								});
							}
						}
					);
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
			const response = await fetch(`${url}${sellingChannelData.id}/`, {
				method: 'PUT',
				body: JSON.stringify({
					name: nameState.value,
					product_channel_price: productListState.map(product => ({
						product: product.id,
						price: product.price?.value,
						start_date: product.startDate?.value || null,
						end_date: product.endDate?.value || null,
					})),
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

				if (data.name) {
					dispatchName({
						type: 'INPUT_ERROR',
						errorMessage: data.name[0],
					});
				}
				if (data.product_channel_price) {
					data.product_channel_price.forEach(
						(product_channel, index) => {
							// Manejar errores de end_date
							if (product_channel.end_date) {
								dispatchProductList({
									type: 'SET_ERROR',
									id: productListState[index]?.id,
									errorMessage: Array.isArray(
										product_channel.end_date
									)
										? product_channel.end_date[0]
										: product_channel.end_date,
									field: 'endDate',
								});
							}
							// Manejar errores de start_date
							if (product_channel.start_date) {
								dispatchProductList({
									type: 'SET_ERROR',
									id: productListState[index]?.id,
									errorMessage: Array.isArray(
										product_channel.start_date
									)
										? product_channel.start_date[0]
										: product_channel.start_date,
									field: 'startDate',
								});
							}
							// Manejar errores de price
							if (product_channel.price) {
								dispatchProductList({
									type: 'SET_ERROR',
									id: productListState[index]?.id,
									errorMessage: Array.isArray(
										product_channel.price
									)
										? product_channel.price[0]
										: product_channel.price,
									field: 'price',
								});
							}
						}
					);
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
		if (nameState.value && productListState.length > 0) {
			// Check if all required fields are filled and valid
			const allFieldsValid = productListState.every(
				product =>
					product.price?.value &&
					product.price?.isValid &&
					product.startDate?.isValid &&
					product.endDate?.isValid
			);

			const isValid = nameIsValid && allFieldsValid;
			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else if (nameState.value) {
			setFormIsValid(nameIsValid);
			setDisabled(!nameIsValid);
		} else {
			setDisabled(true);
		}
	}, [nameState.value, nameIsValid, productListState]);

	useEffect(() => {
		setTitle(
			sellingChannelData.length !== 0
				? 'Editar Canal de Venta'
				: 'Agregar Canal de Venta'
		);
		if (sellingChannelData.length !== 0) {
			setButtonText('Guardar Cambios');
		} else {
			setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
		}
	}, [isForm, sellingChannelData]);

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
								<h6>Nombre del Canal de Venta</h6>
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
								</Grid>
							</Box>
							{productListState.length > 0 && (
								<Box sx={{ mt: 2, flexGrow: 1 }}>
									<h5>Productos</h5>
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
														Precio
													</StyledTableCell>
													<StyledTableCell>
														Fecha inicio
													</StyledTableCell>
													<StyledTableCell>
														Fecha Fin
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
																{product.name}
															</TableCell>
															<TableCell>
																{product.code}
															</TableCell>
															<TableCell>
																<TextField
																	label="Precio"
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
																			?.value ||
																		''
																	}
																	error={
																		(product
																			.price
																			?.value &&
																			!product
																				.price
																				?.isValid) ||
																		(!product
																			.price
																			?.isValid &&
																			product
																				.price
																				?.feedbackText)
																	}
																	helperText={
																		(product
																			.price
																			?.value &&
																			!product
																				.price
																				?.isValid) ||
																		(!product
																			.price
																			?.isValid &&
																			product
																				.price
																				?.feedbackText)
																			? product
																					.price
																					?.feedbackText ||
																				''
																			: ''
																	}
																	required
																	fullWidth
																/>
															</TableCell>
															<TableCell>
																<TextField
																	label="Fecha Inicio"
																	type="date"
																	variant="outlined"
																	onChange={e =>
																		dispatchProductList(
																			{
																				type: 'START_DATE_CHANGE',
																				id: product.id,
																				val: e
																					.target
																					.value,
																			}
																		)
																	}
																	value={
																		product
																			.startDate
																			?.value ||
																		''
																	}
																	error={
																		(product
																			.startDate
																			?.value &&
																			!product
																				.startDate
																				?.isValid) ||
																		(!product
																			.startDate
																			?.isValid &&
																			product
																				.startDate
																				?.feedbackText)
																	}
																	helperText={
																		(product
																			.startDate
																			?.value &&
																			!product
																				.startDate
																				?.isValid) ||
																		(!product
																			.startDate
																			?.isValid &&
																			product
																				.startDate
																				?.feedbackText)
																			? product
																					.startDate
																					?.feedbackText ||
																				''
																			: ''
																	}
																	fullWidth
																	slotProps={{
																		inputLabel:
																			{
																				shrink: true,
																			},
																	}}
																/>
															</TableCell>
															<TableCell>
																<TextField
																	label="Fecha Fin"
																	type="date"
																	variant="outlined"
																	onChange={e =>
																		dispatchProductList(
																			{
																				type: 'END_DATE_CHANGE',
																				id: product.id,
																				val: e
																					.target
																					.value,
																			}
																		)
																	}
																	value={
																		product
																			.endDate
																			?.value ||
																		''
																	}
																	error={
																		(product
																			.endDate
																			?.value &&
																			!product
																				.endDate
																				?.isValid) ||
																		(!product
																			.endDate
																			?.isValid &&
																			product
																				.endDate
																				?.feedbackText)
																	}
																	helperText={
																		(product
																			.endDate
																			?.value &&
																			!product
																				.endDate
																				?.isValid) ||
																		(!product
																			.endDate
																			?.isValid &&
																			product
																				.endDate
																				?.feedbackText)
																			? product
																					.endDate
																					?.feedbackText ||
																				''
																			: ''
																	}
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
				) : (
					<div className={classes.listContainer}>
						<AddSellingChannelPreview
							name={nameState.value}
							products={productListState}
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

				{showModal && (
					<AddSellingChannelModal
						editSellingChannel={sellingChannelData}
					/>
				)}
			</Fragment>
		</>
	);
};

export default AddSellingChannel;
