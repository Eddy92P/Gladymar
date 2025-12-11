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
	validateAddressLength,
	validateCiNumber,
	validateEmail,
	validateNameLength,
	validatePhoneNumber,
} from '../../Validations';
import { api } from '../../Constants';

// Components
import AddProductList from '../Products/AddProductList';
import AddSupplierPreview from './AddSupplierPreview';
import AddSupplierModal from './AddSupplierModal';
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

export const AddSupplier = () => {
	const API = import.meta.env.VITE_API_URL;
	const url = `${API}${api.API_URL_SUPPLIERS}`;

	const [isLoading, setIsLoading] = useState(false);
	const authContext = useContext(AuthContext);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const supplierData = useMemo(
		() => location.state?.supplierData || [],
		[location.state?.supplierData]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [showProductsModal, setShowProductsModal] = useState(false);
	const [productsList, setProductsList] = useState(
		supplierData.products ? supplierData.products : []
	);

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

	const phoneReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validatePhoneNumber(state.value),
				feedbackText: 'Ingrese teléfono válido',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validatePhoneNumber(action.val),
				feedbackText: 'Ingrese teléfono válido',
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
				feedbackText: 'Ingrese nit válido',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateCiNumber(action.val),
				feedbackText: 'Ingrese nit válido',
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
				feedbackText: 'Ingrese correo válido',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateEmail(action.val),
				feedbackText: 'Ingrese correo válido',
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
				feedbackText: 'Ingrese dirección válida',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validateAddressLength(action.val),
				feedbackText: 'Ingrese dirección válida',
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

	const [nameState, dispatchName] = useReducer(nameReducer, {
		value: supplierData.name ? supplierData.name : '',
		isValid: true,
		feedbackText: '',
	});

	const [phoneState, dispatchPhone] = useReducer(phoneReducer, {
		value: supplierData.phone ? supplierData.phone : '',
		isValid: true,
		feedbackText: '',
	});

	const [nitState, dispatchNit] = useReducer(nitReducer, {
		value: supplierData.nit ? supplierData.nit : '',
		isValid: true,
		feedbackText: '',
	});

	const [emailState, dispatchEmail] = useReducer(emailReducer, {
		value: supplierData.email ? supplierData.email : '',
		isValid: true,
		feedbackText: '',
	});

	const [addressState, dispatchAddress] = useReducer(addressReducer, {
		value: supplierData.address ? supplierData.address : '',
		isValid: true,
		feedbackText: '',
	});

	const { isValid: nameIsValid } = nameState;
	const { isValid: phoneIsValid } = phoneState;
	const { isValid: nitIsValid } = nitState;
	const { isValid: emailIsValid } = emailState;
	const { isValid: addressIsValid } = addressState;

	const nameInputChangeHandler = e => {
		dispatchName({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const phoneInputChangeHandler = e => {
		dispatchPhone({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const nitInputChangeHandler = e => {
		dispatchNit({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const emailInputChangeHandler = e => {
		dispatchEmail({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const addressInputChangeHandler = e => {
		dispatchAddress({ type: 'INPUT_CHANGE', val: e.target.value });
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
		if (formIsValid && !isForm && supplierData.length === 0) {
			handleSubmit();
		}
		if (formIsValid && !isForm && supplierData.length !== 0) {
			handleEdit();
		}
	};

	const handleSubmit = async () => {
		try {
			const response = await fetch(url, {
				method: 'POST',
				body: JSON.stringify({
					name: nameState.value,
					phone: phoneState.value,
					nit: nitState.value,
					email: emailState.value,
					address: addressState.value,
					product: productsList.map(product => product.id),
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
				if (data.phone) {
					dispatchPhone({
						type: 'INPUT_ERROR',
						errorMessage: data.phone[0],
					});
				}
				if (data.nit) {
					dispatchNit({
						type: 'INPUT_ERROR',
						errorMessage: data.nit[0],
					});
				}
				if (data.email) {
					dispatchName({
						type: 'INPUT_ERROR',
						errorMessage: data.email[0],
					});
				}
				if (data.address) {
					dispatchName({
						type: 'INPUT_ERROR',
						errorMessage: data.address[0],
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
			const response = await fetch(`${url}${supplierData.id}/`, {
				method: 'PUT',
				body: JSON.stringify({
					name: nameState.value,
					phone: phoneState.value,
					nit: nitState.value,
					email: emailState.value,
					addressState: addressState.value,
					product: productsList.map(product => product.id),
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
				if (data.phone) {
					dispatchPhone({
						type: 'INPUT_ERROR',
						errorMessage: data.phone[0],
					});
				}
				if (data.nit) {
					dispatchNit({
						type: 'INPUT_ERROR',
						errorMessage: data.nit[0],
					});
				}
				if (data.email) {
					dispatchName({
						type: 'INPUT_ERROR',
						errorMessage: data.email[0],
					});
				}
				if (data.address) {
					dispatchName({
						type: 'INPUT_ERROR',
						errorMessage: data.address[0],
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
		setProductsList(productsList.filter(product => product.id !== id));
	};

	useEffect(() => {
		if (
			nameState.value &&
			phoneState.value &&
			nitState.value &&
			emailState.value &&
			addressState.value
		) {
			const isValid =
				nameIsValid &&
				phoneIsValid &&
				nitIsValid &&
				emailIsValid &&
				addressIsValid;

			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [
		nameState.value,
		phoneState.value,
		nitState.value,
		emailState.value,
		addressState.value,
		nameIsValid,
		phoneIsValid,
		nitIsValid,
		emailIsValid,
		addressIsValid,
	]);

	useEffect(() => {
		setTitle(
			supplierData.length !== 0 ? 'Editar Proveedor' : 'Agregar Proveedor'
		);
		if (supplierData.length !== 0) {
			setButtonText('Guardar Cambios');
		} else {
			setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
		}
	}, [isForm, supplierData]);

	// Definir columnas estáticas para evitar renderizar objetos anidados
	const columns = ['name', 'code'];

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
								<h6>Datos del Proveedor</h6>
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
									<Grid size={{ xs: 12, sm: 3 }}>
										<TextField
											label="Teléfono"
											variant="outlined"
											onChange={phoneInputChangeHandler}
											value={phoneState.value}
											error={!phoneIsValid}
											helperText={
												!phoneIsValid
													? phoneState.feedbackText
													: ''
											}
											required
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 3 }}>
										<TextField
											label="NIT"
											variant="outlined"
											onChange={nitInputChangeHandler}
											value={nitState.value}
											error={!nitIsValid}
											helperText={
												!nitIsValid
													? nitState.feedbackText
													: ''
											}
											required
											fullWidth
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 3 }}>
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
									<Grid size={{ xs: 12, sm: 4 }}>
										<TextField
											label="Dirección"
											variant="outlined"
											onChange={addressInputChangeHandler}
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
								</Grid>
							</Box>
							{productsList.length > 0 && (
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
													<StyledTableCell></StyledTableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{productsList.map(
													(item, rowIndex) => (
														<TableRow
															key={`row-${rowIndex}`}
														>
															{columns
																.filter(
																	value =>
																		value !==
																		'id'
																)
																.map(
																	(
																		value,
																		colIndex
																	) => (
																		<TableCell
																			key={`cell-${rowIndex}-${colIndex}`}
																		>
																			{
																				item[
																					value
																				]
																			}
																		</TableCell>
																	)
																)}
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
																				item.id
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
						<AddSupplierPreview
							name={nameState.value}
							phone={phoneState.value}
							nit={nitState.value}
							email={emailState.value}
							address={addressState.value}
							products={productsList}
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
					<AddProductList
						onProductList={setProductsList}
						onClose={() => setShowProductsModal(false)}
						addedProducts={productsList}
					/>
				)}

				{showModal && <AddSupplierModal editSupplier={supplierData} />}
			</Fragment>
		</>
	);
};

export default AddSupplier;
