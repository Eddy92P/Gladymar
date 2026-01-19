import React, {
	Fragment,
	useState,
	useEffect,
	useReducer,
	useMemo,
} from 'react';

import Alert from '@mui/material/Alert';

import authFetch from '../../api/authFetch';
import { api } from '../../Constants';
import {
	validateNameLength,
	validateAddressLength,
	validatePositiveNumber,
} from '../../Validations';

import {
	Grid,
	TextField,
	Button,
	FormControl,
	Box,
	Typography,
	Autocomplete,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Tooltip,
} from '@mui/material';
import classes from '../UI/List/List.module.css';
import { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// MUI Icons
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';

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

import AddProductDetailedList from '../Products/AddProductDetailedList';
import AddWarehousePreview from './AddWarehousePreview';
import AddWarehouseModal from './AddWarehouseModal';
import ListHeader from '../UI/List/ListHeader';

import { useNavigate, useLocation } from 'react-router-dom';

function AddWarehouse() {
	const API = import.meta.env.VITE_API_URL;
	const url = `${API}${api.API_URL_WAREHOUSES}`;
	const urlAgencyChoices = `${API}${api.API_URL_AGENCIES}`;
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const warehouseData = useMemo(
		() => location.state?.warehouseData || [],
		[location.state?.warehouseData]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [agencyChoices, setAgencyChoices] = useState([]);
	const [agency, setAgency] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');
	const [showProductsModal, setShowProductsModal] = useState(false);

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
	const productListReducer = (state, action) => {
		if (action.type === 'STOCK_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? {
							...product,
							stock: {
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
		if (action.type === 'MINIMUM_STOCK_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? {
							...product,
							minimumStock: {
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
		if (action.type === 'MAXIMUM_STOCK_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? {
							...product,
							maximumStock: {
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

		return state;
	};
	// Transform the data structure to match the expected reducer format
	const transformProductsForEditing = products => {
		if (!products || !Array.isArray(products)) return [];

		return products.map(product => {
			// Handle different possible data structures from backend
			const transformedProduct = {
				// Core product information
				productStockId: product.id,
				id: product.products.id,
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
				stock:
					product.stock && typeof product.stock === 'object'
						? product.stock
						: {
								value:
									product.stock !== undefined
										? product.stock
										: '',
								isValid: true,
								feedbackText: '',
							},
				minimumStock:
					product.minimumStock &&
					typeof product.minimumStock === 'object'
						? product.minimumStock
						: {
								value:
									product.minimum_stock !== undefined
										? product.minimum_stock
										: product.minimumStock !== undefined
											? product.minimumStock
											: '',
								isValid: true,
								feedbackText: '',
							},
				maximumStock:
					product.maximumStock &&
					typeof product.maximumStock === 'object'
						? product.maximumStock
						: {
								value:
									product.maximum_stock !== undefined
										? product.maximum_stock
										: product.maximumStock !== undefined
											? product.maximumStock
											: '',
								isValid: true,
								feedbackText: '',
							},
			};

			return transformedProduct;
		});
	};
	const transformedProducts = transformProductsForEditing(
		warehouseData.productStock
	);

	const [nameState, dispatchName] = useReducer(nameReducer, {
		value: warehouseData.name ? warehouseData.name : '',
		isValid: true,
		feedbackText: '',
	});
	const [locationState, dispatchLocation] = useReducer(locationReducer, {
		value: warehouseData.location ? warehouseData.location : '',
		isValid: true,
		feedbackText: '',
	});
	const [productListState, dispatchProductList] = useReducer(
		productListReducer,
		transformedProducts
	);

	const { isValid: nameIsValid } = nameState;
	const { isValid: locationIsValid } = locationState;

	const nameInputChangeHandler = e => {
		dispatchName({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const locationInputChangeHandler = e => {
		dispatchLocation({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const stockInputChangeHandler = (id, value) => {
		dispatchProductList({ type: 'STOCK_CHANGE', id, val: value });
	};

	const agencyInputChangeHandler = (event, option) => {
		setAgency(option);
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
		if (formIsValid && !isForm && warehouseData.length === 0) {
			handleSubmit();
		}
		if (formIsValid && !isForm && warehouseData.length !== 0) {
			handleEdit();
		}
	};

	useEffect(() => {
		const fetchAgencyChoices = async () => {
			try {
				const response = await authFetch(urlAgencyChoices, {
					headers: {
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const data = await response.json();
					const choices = data.rows || [];
					setAgencyChoices(choices);
					if (warehouseData.agency && choices.length > 0) {
						const matchingChoice = choices.find(
							choice => choice.id === warehouseData.agency.id
						);
						if (matchingChoice) {
							setAgency(matchingChoice);
						}
					}
				}
			} catch (error) {
				console.error('Error fetching agency choices:', error);
			}
		};

		fetchAgencyChoices();
	}, [urlAgencyChoices, warehouseData.agency]);

	const handleSubmit = async () => {
		try {
			const response = await authFetch(url, {
				method: 'POST',
				body: JSON.stringify({
					name: nameState.value,
					location: locationState.value,
					agency_id: agency.id,
					product_stock: productListState.map(product => ({
						product: product.id,
						stock: product.stock.value,
						minimum_stock: product.minimumStock.value,
						maximum_stock: product.maximumStock.value,
					})),
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
				if (data.product_stock) {
					data.product_stock.forEach((product_stock, index) => {
						if (product_stock.stock) {
							dispatchProductList({
								type: 'SET_ERROR',
								id: productListState[index]?.id,
								errorMessage: Array.isArray(product_stock.stock)
									? product_stock.stock[0]
									: product_stock.stock,
								field: 'stock',
							});
						}
						if (product_stock.minimum_stock) {
							dispatchProductList({
								type: 'SET_ERROR',
								id: productListState[index]?.id,
								errorMessage: Array.isArray(
									product_stock.minimum_stock
								)
									? product_stock.minimum_stock[0]
									: product_stock.minimum_stock,
								field: 'minimumStock',
							});
						}
						if (product_stock.maximum_stock) {
							dispatchProductList({
								type: 'SET_ERROR',
								id: productListState[index]?.id,
								errorMessage: Array.isArray(
									product_stock.maximum_stock
								)
									? product_stock.maximum_stock[0]
									: product_stock.maximum_stock,
								field: 'maximumStock',
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
	const handleEdit = async () => {
		try {
			const response = await authFetch(`${url}${warehouseData.id}/`, {
				method: 'PUT',
				body: JSON.stringify({
					name: nameState.value,
					location: locationState.value,
					agency_id: agency.id,
					product_stock: productListState.map(product => ({
						id: product.productStockId,
						product: product.id,
						stock: product.stock.value,
						minimum_stock: product.minimumStock.value,
						maximum_stock: product.maximumStock.value,
					})),
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
				if (data.product_stock) {
					data.product_stock.forEach((product_stock, index) => {
						if (product_stock.stock) {
							dispatchProductList({
								type: 'SET_ERROR',
								id: productListState[index]?.id,
								errorMessage: Array.isArray(product_stock.stock)
									? product_stock.stock[0]
									: product_stock.stock,
								field: 'endDate',
							});
						}
						if (product_stock.minimum_stock) {
							dispatchProductList({
								type: 'SET_ERROR',
								id: productListState[index]?.id,
								errorMessage: Array.isArray(
									product_stock.minimum_stock
								)
									? product_stock.minimum_stock[0]
									: product_stock.minimum_stock,
								field: 'minimumStock',
							});
						}
						if (product_stock.maximum_stock) {
							dispatchProductList({
								type: 'SET_ERROR',
								id: productListState[index]?.id,
								errorMessage: Array.isArray(
									product_stock.maximum_stock
								)
									? product_stock.maximum_stock[0]
									: product_stock.maximum_stock,
								field: 'maximumStock',
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
			nameState.value &&
			locationState.value &&
			agency &&
			productListState.length > 0
		) {
			// Check if all required fields are filled and valid
			const allFieldsValid = productListState.every(
				product =>
					product.stock?.value &&
					product.stock?.isValid &&
					product.minimumStock?.isValid &&
					product.maximumStock?.isValid
			);
			const isValid =
				nameIsValid && locationIsValid && agency && allFieldsValid;

			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else if (nameState.value && locationState.value && agency) {
			setFormIsValid(nameIsValid && locationIsValid && agency);
			setDisabled(!nameIsValid && !locationIsValid && !agency);
		} else {
			setDisabled(true);
		}
	}, [
		nameState.value,
		locationState.value,
		productListState,
		agency,
		nameIsValid,
		locationIsValid,
	]);

	useEffect(() => {
		setTitle(
			warehouseData.length !== 0 ? 'Editar Almacen' : 'Agregar Almacen'
		);
		if (warehouseData.length !== 0) {
			setButtonText('Guardar Cambios');
		} else {
			setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
		}
	}, [isForm, warehouseData]);

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
								<h6>1. Datos de Almacén</h6>
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
											label="Ubicación"
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
									<Grid size={{ xs: 6, sm: 3 }}>
										<Autocomplete
											disablePortal
											value={agency}
											options={agencyChoices}
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
													label="Agencia"
													required
												/>
											)}
											onChange={agencyInputChangeHandler}
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
														Stock
													</StyledTableCell>
													<StyledTableCell>
														Stock Mínimo
													</StyledTableCell>
													<StyledTableCell>
														Stock Máximo
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
																	variant="outlined"
																	onChange={e =>
																		stockInputChangeHandler(
																			product.id,
																			e
																				.target
																				.value
																		)
																	}
																	value={
																		product
																			.stock
																			?.value !==
																		undefined
																			? product
																					.stock
																					.value
																			: ''
																	}
																	error={
																		(product
																			.stock
																			?.value !==
																			undefined &&
																			!product
																				.stock
																				?.isValid) ||
																		(!product
																			.stock
																			?.isValid &&
																			product
																				.stock
																				?.feedbackText)
																	}
																	helperText={
																		(product
																			.stock
																			?.value !==
																			undefined &&
																			!product
																				.stock
																				?.isValid) ||
																		(!product
																			.stock
																			?.isValid &&
																			product
																				.stock
																				?.feedbackText)
																			? product
																					.stock
																					?.feedbackText ||
																				''
																			: ''
																	}
																	disabled={
																		warehouseData.length !==
																			0 &&
																		product.productStockId !==
																			undefined
																	}
																	fullWidth
																/>
															</TableCell>
															<TableCell>
																<TextField
																	variant="outlined"
																	onChange={e =>
																		dispatchProductList(
																			{
																				type: 'MINIMUM_STOCK_CHANGE',
																				id: product.id,
																				val: e
																					.target
																					.value,
																			}
																		)
																	}
																	value={
																		product
																			.minimumStock
																			?.value !==
																		undefined
																			? product
																					.minimumStock
																					.value
																			: ''
																	}
																	error={
																		(product
																			.minimumStock
																			?.value !==
																			undefined &&
																			!product
																				.minimumStock
																				?.isValid) ||
																		(!product
																			.minimumStock
																			?.isValid &&
																			product
																				.minimumStock
																				?.feedbackText)
																	}
																	helperText={
																		(product
																			.minimumStock
																			?.value !==
																			undefined &&
																			!product
																				.minimumStock
																				?.isValid) ||
																		(!product
																			.minimumStock
																			?.isValid &&
																			product
																				.minimumStock
																				?.feedbackText)
																			? product
																					.minimumStock
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
																	variant="outlined"
																	onChange={e =>
																		dispatchProductList(
																			{
																				type: 'MAXIMUM_STOCK_CHANGE',
																				id: product.id,
																				val: e
																					.target
																					.value,
																			}
																		)
																	}
																	value={
																		product
																			.maximumStock
																			?.value !==
																		undefined
																			? product
																					.maximumStock
																					.value
																			: ''
																	}
																	error={
																		(product
																			.maximumStock
																			?.value &&
																			!product
																				.maximumStock
																				?.isValid) ||
																		(!product
																			.maximumStock
																			?.isValid &&
																			product
																				.maximumStock
																				?.feedbackText)
																	}
																	helperText={
																		(product
																			.maximumStock
																			?.value &&
																			!product
																				.maximumStock
																				?.isValid) ||
																		(!product
																			.maximumStock
																			?.isValid &&
																			product
																				.maximumStock
																				?.feedbackText)
																			? product
																					.maximumStock
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
						<AddWarehousePreview
							name={nameState.value}
							location={locationState.value}
							agency={agency.name}
							productStock={productListState}
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
				{showModal && (
					<AddWarehouseModal editWarehouse={warehouseData} />
				)}
			</Fragment>
		</>
	);
}

export default AddWarehouse;
