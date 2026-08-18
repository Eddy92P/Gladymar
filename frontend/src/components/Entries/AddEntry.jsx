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
import TextareaAutosize from '@mui/material/TextareaAutosize';

// Validations and Constants
import { validatePositiveNumber, validDate } from '../../Validations';
import { api } from '../../Constants';
import { formatDisplayDate } from '../../DateUtils';

// Components
import AddProductDetailedList from '../Products/AddProductDetailedList';
import AddEntryPreview from './AddEntryPreview';
import AddEntryModal from './AddEntryModal';
import ListHeader from '../UI/List/ListHeader';

// Context
import { StoreContext } from '../../store/store-context';

// CSS classes
import classes from '../UI/List/List.module.css';

import authFetch from '../../api/authFetch';

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

export const AddEntry = () => {
	const API = import.meta.env.VITE_API_URL;
	const url = `${API}${api.API_URL_ENTRIES}`;
	const urlSupplierChoices = `${API}${api.API_URL_ALL_SUPPLIERS}`;
	const urlWarehousesChoices = `${API}${api.API_URL_ALL_WAREHOUSES}`;
	const urlBatchChoices = `${API}${api.API_URL_ALL_BATCHES}`;

	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const storeContext = useContext(StoreContext);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const purchaseData = useMemo(
		() => location.state?.purchaseData || [],
		[location.state?.purchaseData]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [showProductsModal, setShowProductsModal] = useState(false);
	const [supplierChoices, setSupplierChoices] = useState([]);
	const [supplier, setSupplier] = useState(null);
	const [warehouseChoices, setWarehouseChoices] = useState([]);
	const [defaultWarehouse, setDefaultWarehouse] = useState(null);
	const [batchChoices, setBatchChoices] = useState([]);
	const [note, setNote] = useState('');

	const entryDateReducer = (state, action) => {
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
					const current = product[action.field];
					if (current && typeof current === 'object') {
						return {
							...product,
							[action.field]: {
								...current,
								isValid: false,
								feedbackText: action.errorMessage,
							},
						};
					}
					return {
						...product,
						[action.field]: {
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
		if (action.type === 'WAREHOUSE_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? { ...product, warehouse: action.warehouse }
					: product
			);
		}
		if (action.type === 'BATCH_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? { ...product, batch: action.batch }
					: product
			);
		}
		if (action.type === 'ADD_PRODUCT') {
			return [...state, action.product];
		}
		if (action.type === 'RESET_PRODUCTS') {
			return [];
		}

		return state;
	};

	const [entryDateState, dispatchEntryDate] = useReducer(entryDateReducer, {
		value: null,
		isValid: true,
		feedbackText: '',
	});

	const [productListState, dispatchProductList] = useReducer(
		productListReducer,
		[]
	);

	const { isValid: entryDateIsValid } = entryDateState;

	const entryDateInputChangeHandler = newValue => {
		dispatchEntryDate({ type: 'INPUT_CHANGE', val: newValue });
	};

	const supplierInputChangeHandler = (event, option) => {
		setSupplier(option);
	};

	const warehouseInputChangeHandler = (event, option, productId) => {
		dispatchProductList({
			type: 'WAREHOUSE_CHANGE',
			id: productId,
			warehouse: option,
		});
	};

	const batchInputChangeHandler = (event, option, productId) => {
		dispatchProductList({
			type: 'BATCH_CHANGE',
			id: productId,
			batch: option,
		});
	};

	const noteInputChangeHandler = event => {
		setNote(event.target.value);
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
				const response = await authFetch(urlSupplierChoices, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const data = await response.json();
					const choices = data || [];
					setSupplierChoices(choices);
					if (purchaseData.supplier && choices.length > 0) {
						const matchingChoice = choices.find(
							choice => choice.name === purchaseData.supplier
						);
						if (matchingChoice) {
							setSupplier(matchingChoice);
						}
					}
				}
			} catch (error) {
				console.error(
					'Error al recuperar las opciones de Proveedores:',
					error
				);
			}
		};

		fetchSuppliers();
	}, [urlSupplierChoices, purchaseData.supplier]);

	useEffect(() => {
		const fetchWarehouses = async () => {
			try {
				const response = await authFetch(urlWarehousesChoices, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const data = await response.json();
					const choices = data || [];
					setWarehouseChoices(choices);
					if (purchaseData.warehouse && choices.length > 0) {
						const matchingChoice = choices.find(
							choice => choice.name === purchaseData.warehouse
						);
						if (matchingChoice) {
							setDefaultWarehouse(matchingChoice);
						}
					}
				}
			} catch (error) {
				console.error(
					'Error al recuperar las opciones de Almacenes:',
					error
				);
			}
		};
		fetchWarehouses();
	}, [urlWarehousesChoices, purchaseData.warehouse]);

	useEffect(() => {
		const fetchBatches = async () => {
			try {
				const response = await authFetch(urlBatchChoices, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const data = await response.json();
					setBatchChoices(data || []);
				}
			} catch (error) {
				console.error(
					'Error al recuperar las opciones de Lotes:',
					error
				);
			}
		};
		fetchBatches();
	}, [urlBatchChoices]);

	const handleSubmit = async () => {
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			// Preparar los datos básicos de la entrada
			const entryInfo = {
				purchase: purchaseData.id,
				agency: storeContext.agency,
				supplier: supplier.id,
				entry_date: entryDateState.value.format('YYYY-MM-DD'),
				entry_items: productListState.map(product => ({
					purchase_item: product.purchaseItem,
					product: product.id,
					warehouse: product.warehouse?.id,
					batch: product.batch?.id,
					quantity: product.quantity.value,
				})),
				note: note,
			};

			const response = await authFetch(url, {
				method: 'POST',
				body: JSON.stringify(entryInfo),
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();

			if (!response.ok) {
				setErrorMessage('Ocurrió un problema.');
				setIsForm(true);
				if (data.entry_items) {
					data.entry_items.forEach((entry_item, index) => {
						const productId = productListState[index]?.id;

						if (entry_item.quantity) {
							const errorMessage = Array.isArray(
								entry_item.quantity
							)
								? entry_item.quantity[0]
								: entry_item.quantity;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'quantity',
							});
						}
						if (entry_item.batch) {
							const errorMessage = Array.isArray(
								entry_item.batch
							)
								? entry_item.batch[0]
								: entry_item.batch;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'batch',
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
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRemoveProduct = (e, id) => {
		dispatchProductList({ type: 'REMOVE_PRODUCT', id });
	};

	useEffect(() => {
		if (
			entryDateState.value &&
			supplier &&
			productListState.length > 0
		) {
			// Validar Productos
			const allProductsFieldsValid = productListState.every(
				product =>
					product.quantity.value &&
					product.quantity.isValid &&
					product.batch?.id &&
					product.warehouse?.id
			);
			const isValid =
				entryDateIsValid &&
				supplier &&
				allProductsFieldsValid;
			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [
		supplier,
		entryDateState.value,
		purchaseData.length,
		entryDateIsValid,
		productListState,
	]);

	useEffect(() => {
		setTitle('Generar Entrada');
		setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
	}, [isForm]);

	return (
		<>
			<Fragment>
				<ListHeader title={title} text={title} visible={false} />
				{isForm ? (
					<>
						{purchaseData?.purchaseItems && (
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
									Detalle de Productos Comprados
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
														<strong>Estado</strong>
													</TableCell>
													<TableCell align="right">
														<strong>
															Cantidad Comprada
														</strong>
													</TableCell>
													<TableCell align="right">
														<strong>
															Cantidad Restante
														</strong>
													</TableCell>
													<TableCell align="right">
														<strong>
															Cantidad Ingresada
														</strong>
													</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{purchaseData.purchaseItems.map(
													(purchaseItem, index) => (
														<TableRow key={index}>
															<TableCell>
																{
																	purchaseItem
																		.products
																		.code
																}
															</TableCell>
															<TableCell>
																{
																	purchaseItem
																		.products
																		.name
																}
															</TableCell>
															<TableCell>
																{
																	purchaseItem.status_display
																}
															</TableCell>
															<TableCell align="right">
																{
																	purchaseItem.quantity
																}
															</TableCell><TableCell align="right">
																{
																	purchaseItem.remaining_quantity
																}
															</TableCell>
															<TableCell align="right">
																{
																	purchaseItem.entered_stock
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
										Datos de la Entrada
									</Typography>
									<Grid container spacing={2} mt={1} mb={2}>
										<Grid size={{ xs: 12, sm: 4 }}>
											<Autocomplete
												disablePortal
												value={supplier}
												options={supplierChoices}
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
											<LocalizationProvider
												dateAdapter={AdapterDayjs}
											>
												<DatePicker
													label="Fecha de Entrada"
													format="DD/MM/YYYY"
													onChange={
														entryDateInputChangeHandler
													}
													value={entryDateState.value}
													slotProps={{
														textField: {
															error: !entryDateIsValid,
															helperText:
																!entryDateIsValid
																	? entryDateState.feedbackText
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
								<Box sx={{ mt: 2, flexGrow: 1 }}>
									<Grid container spacing={2} mt={1} mb={2}>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Typography
												variant="body2"
												sx={{ mb: 1 }}
											>
												Nota
											</Typography>
											<TextareaAutosize
												aria-label="note"
												minRows={3}
												style={{ width: '100%' }}
												value={note}
												onChange={
													noteInputChangeHandler
												}
												fullWidth
											/>
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
																Lote
															</StyledTableCell>
															<StyledTableCell>
																Nombre
															</StyledTableCell>
															<StyledTableCell>
																Código
															</StyledTableCell>
															<StyledTableCell style={{ width: '10%' }}>
																Cantidad
															</StyledTableCell>
															<StyledTableCell>
																Almacén
															</StyledTableCell>
															<StyledTableCell align="center" style={{ width: '10%' }}>
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
																		<Autocomplete
																			disablePortal
																			value={
																				product.batch
																					?.id
																					? product.batch
																					: null
																			}
																			options={
																				batchChoices
																			}
																			isOptionEqualToValue={(
																				option,
																				value
																			) =>
																				option?.id ===
																				value?.id
																			}
																			getOptionLabel={option =>
																				option
																					? option.name ||
																						''
																					: ''
																			}
																			renderOption={(
																				props,
																				option
																			) => (
																				<li
																					{...props}
																					key={
																						option.id
																					}
																				>
																					{
																						option.name
																					}
																				</li>
																			)}
																			renderInput={params => (
																				<TextField
																					{...params}
																					label="Lote"
																					required
																					error={
																						product
																							.batch
																							?.isValid ===
																						false
																					}
																					helperText={
																						product
																							.batch
																							?.isValid ===
																						false
																							? product
																									.batch
																									.feedbackText
																							: ''
																					}
																				/>
																			)}
																			onChange={(
																				event,
																				option
																			) =>
																				batchInputChangeHandler(
																					event,
																					option,
																					product.id
																				)
																			}
																		/>
																	</TableCell>
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
																	<TableCell>
																		<Autocomplete
																			disablePortal
																			value={product.warehouse || null}
																			options={warehouseChoices}
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
																					label="Almacén"
																					required
																				/>
																			)}
																			onChange={(
																				event,
																				option
																			) =>
																				warehouseInputChangeHandler(
																					event,
																					option,
																					product.id
																				)
																			}
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
									disabled={disabled || isLoading || isSubmitting}
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
						<AddEntryPreview
							supplier={supplier}
							entryDate={
								formatDisplayDate(entryDateState.value)
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
								disabled={disabled || isLoading || isSubmitting}
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
									product: {
										...product,
										warehouse: defaultWarehouse,
										batch: null,
									},
								});
							});
						}}
						onClose={() => setShowProductsModal(false)}
						addedProducts={productListState}
						purchase={purchaseData}
						agency={storeContext.agency}
						isEntry={true}
					/>
				)}

				{showModal && <AddEntryModal purchaseData={purchaseData} />}
			</Fragment>
		</>
	);
};

export default AddEntry;
