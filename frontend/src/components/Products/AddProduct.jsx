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
import {
	validateNameLength,
	validateCode,
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
} from '@mui/material';
import classes from '../UI/List/List.module.css';

import AddProductPreview from './AddProductPreview';
import AddProductModal from './AddProductModal';
import ListHeader from '../UI/List/ListHeader';

import { useNavigate, useLocation } from 'react-router-dom';

function AddProduct() {
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
	const [selectedFile, setSelectedFile] = useState(null);
	const [selectedFileUrl, setSelectedFileUrl] = useState(null);
	const [existingImage, setExistingImage] = useState(null);
	const [shouldDeleteImage, setShouldDeleteImage] = useState(false);
	const [showFileInput, setShowFileInput] = useState(false);
	const [description, setDescription] = useState(
		productData.description || ''
	);
	const fileRef = useRef(null);

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
				isValid: validatePositiveNumber(state.value),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validatePositiveNumber(action.val),
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
				isValid: validatePositiveNumber(state.value),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validatePositiveNumber(action.val),
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
				isValid: validatePositiveNumber(state.value),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validatePositiveNumber(action.val),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		return { value: '', isValid: false };
	};

	const minimumSalePriceReducer = (state, action) => {
		if (action.type === 'INPUT_FOCUS') {
			return {
				value: state.value,
				isValid: validatePositiveNumber(state.value),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validatePositiveNumber(action.val),
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
				isValid: validatePositiveNumber(state.value),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		if (action.type === 'INPUT_CHANGE') {
			return {
				value: action.val,
				isValid: validatePositiveNumber(action.val),
				feedbackText: 'Ingrese un número válido.',
			};
		}
		return { value: '', isValid: false };
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
		value: productData.name ? productData.name : '',
		isValid: true,
		feedbackText: '',
	});

	const [stockState, dispatchStock] = useReducer(stockReducer, {
		value: productData.stock ? productData.stock : 0,
		isValid: true,
		feedbackText: '',
	});

	const [minimumStockState, dispatchMinimumStock] = useReducer(
		minimumStockReducer,
		{
			value: productData.minimumStock ? productData.minimumStock : 0,
			isValid: true,
			feedbackText: '',
		}
	);

	const [maximumStockState, dispatchMaximumStock] = useReducer(
		maximumStockReducer,
		{
			value: productData.maximumStock ? productData.maximumStock : 0,
			isValid: true,
			feedbackText: '',
		}
	);

	const [minimumSalePriceState, dispatchMinimumSalePrice] = useReducer(
		minimumSalePriceReducer,
		{
			value: productData.minimumSalePrice
				? productData.minimumSalePrice
				: 0,
			isValid: true,
			feedbackText: '',
		}
	);

	const [maximumSalePriceState, dispatchMaximumSalePrice] = useReducer(
		maximumSalePriceReducer,
		{
			value: productData.maximumSalePrice
				? productData.maximumSalePrice
				: 0,
			isValid: true,
			feedbackText: '',
		}
	);

	const [codeState, dispatchCode] = useReducer(codeReducer, {
		value: productData.code ? productData.code : '',
		isValid: true,
		feedbackText: '',
	});

	const [unitMeasurementState, dispatchUnitMeasurement] = useReducer(
		unitMeasurementReducer,
		{
			value: productData.unitMeasurement
				? productData.unitMeasurement
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
		dispatchStock({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const minimumStockInputChangeHandler = e => {
		dispatchMinimumStock({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const maximumStockInputChangeHandler = e => {
		dispatchMaximumStock({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const minimumSalePriceInputChangeHandler = e => {
		dispatchMinimumSalePrice({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const maximumSalePriceInputChangeHandler = e => {
		dispatchMaximumSalePrice({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const unitMeasurementInputChangeHandler = e => {
		dispatchUnitMeasurement({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const descriptionInputChangeHandler = e => {
		setDescription(e.target.value);
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

	useEffect(() => {
		if (productData.image && productData.length !== 0) {
			setExistingImage(productData.image);
			setShouldDeleteImage(false);
			setShowFileInput(false);
		}
	}, [productData.image, productData.length]);

	useEffect(() => {
		return () => {
			if (selectedFileUrl) {
				URL.revokeObjectURL(selectedFileUrl);
			}
		};
	}, [selectedFileUrl]);

	useEffect(() => {
		if (fileRef.current) {
			if (selectedFile) {
				// Crear un DataTransfer para simular la selección de archivo
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(selectedFile);
				fileRef.current.files = dataTransfer.files;
			} else if (shouldDeleteImage) {
				fileRef.current.value = '';
			} else if (existingImage && !selectedFile && !shouldDeleteImage) {
				fileRef.current.value = '';
			}
		}
	}, [selectedFile, shouldDeleteImage, existingImage, isForm]);

	const handleSubmit = async () => {
		const file = selectedFile || fileRef.current?.files?.[0];

		const formData = new FormData();
		formData.append('batch_id', batch.id);
		formData.append('name', nameState.value);
		formData.append('stock', stockState.value);
		formData.append('code', codeState.value);
		formData.append('description', description);

		if (file) {
			formData.append('image', file);
		}

		formData.append('minimum_stock', minimumStockState.value);
		formData.append('maximum_stock', maximumStockState.value);
		formData.append('minimum_sale_price', minimumSalePriceState.value);
		formData.append('maximum_sale_price', maximumSalePriceState.value);
		formData.append('unit_of_measurement', unitMeasurementState.value);

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

				if (data.image) {
					alert(`Error con la imagen: ${data.image[0]}`);
				}

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
				if (data.stock) {
					dispatchStock({
						type: 'INPUT_ERROR',
						errorMessage: data.stock[0],
					});
				}
				if (data.code) {
					dispatchCode({
						type: 'INPUT_ERROR',
						errorMessage: data.code[0],
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
		const file = selectedFile || fileRef.current?.files?.[0];

		const formData = new FormData();
		if (file) {
			formData.append('image', file);
		}
		formData.append('batch_id', batch.id);
		formData.append('name', nameState.value);
		formData.append('stock', stockState.value);
		formData.append('code', codeState.value);
		formData.append('description', description);
		formData.append('minimum_stock', minimumStockState.value);
		formData.append('maximum_stock', maximumStockState.value);
		formData.append('minimum_sale_price', minimumSalePriceState.value);
		formData.append('maximum_sale_price', maximumSalePriceState.value);
		formData.append('unit_of_measurement', unitMeasurementState.value);

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

				if (data.image) {
					alert(`Error con la imagen: ${data.image[0]}`);
				}

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
				if (data.stock) {
					dispatchStock({
						type: 'INPUT_ERROR',
						errorMessage: data.stock[0],
					});
				}
				if (data.code) {
					dispatchCode({
						type: 'INPUT_ERROR',
						errorMessage: data.code[0],
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
			stockState.value !== null &&
			codeState.value &&
			minimumStockState.value !== null &&
			maximumStockState.value !== null &&
			minimumSalePriceState.value !== null &&
			maximumSalePriceState.value !== null &&
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
							<Box sx={{ display: 'flex', gap: 3 }}>
								<div style={{ minWidth: '200px' }}>
									<Grid size={{ xs: 12, sm: 4 }}>
										{existingImage && (
											<Box mb={2}>
												<Typography
													variant="body2"
													color="textSecondary"
													mb={1}
												>
													Imagen actual:
												</Typography>
												<img
													src={existingImage}
													alt="Imagen del producto"
													style={{
														maxWidth: '200px',
														maxHeight: '200px',
														border: '1px solid #ddd',
														borderRadius: '4px',
													}}
												/>
												<Box
													sx={{
														display: 'flex',
														gap: 1,
														marginTop: '8px',
													}}
												>
													<Button
														variant="outlined"
														size="small"
														onClick={() => {
															setExistingImage(
																null
															);
															setShouldDeleteImage(
																true
															);
															setShowFileInput(
																false
															);
															if (
																selectedFileUrl
															) {
																URL.revokeObjectURL(
																	selectedFileUrl
																);
																setSelectedFileUrl(
																	null
																);
															}
															if (
																fileRef.current
															) {
																fileRef.current.value =
																	'';
															}
														}}
													>
														Eliminar imagen
													</Button>
													<Button
														variant="contained"
														size="small"
														onClick={() => {
															setShouldDeleteImage(
																false
															);
															setShowFileInput(
																true
															);
															// Forzar el re-render para mostrar el input
															setTimeout(() => {
																if (
																	fileRef.current
																) {
																	fileRef.current.click();
																}
															}, 100);
														}}
													>
														Cambiar imagen
													</Button>
												</Box>
											</Box>
										)}
										{(!existingImage ||
											shouldDeleteImage ||
											selectedFile ||
											showFileInput) && (
											<input
												type="file"
												accept="image/*"
												ref={fileRef}
												onChange={e => {
													const file =
														e.target.files?.[0];
													if (file) {
														if (
															file.size >
															5 * 1024 * 1024
														) {
															alert(
																'El archivo es demasiado grande. El tamaño máximo es 5MB.'
															);
															e.target.value = '';
															setSelectedFile(
																null
															);
															return;
														}

														if (
															!file.type.startsWith(
																'image/'
															)
														) {
															alert(
																'Por favor selecciona un archivo de imagen válido.'
															);
															e.target.value = '';
															setSelectedFile(
																null
															);
															return;
														}
														setSelectedFile(file);
														setSelectedFileUrl(
															URL.createObjectURL(
																file
															)
														);
														setExistingImage(null);
														setShouldDeleteImage(
															false
														);
														setShowFileInput(false);
													} else {
														setSelectedFile(null);
														if (selectedFileUrl) {
															URL.revokeObjectURL(
																selectedFileUrl
															);
															setSelectedFileUrl(
																null
															);
														}
													}
												}}
											/>
										)}
										<Typography
											variant="caption"
											color="textSecondary"
											style={{
												display: 'block',
												marginTop: '8px',
											}}
										>
											Formatos soportados: JPG, PNG, GIF.
											Tamaño máximo: 5MB
										</Typography>
										{existingImage &&
											!selectedFile &&
											!shouldDeleteImage && (
												<Typography
													variant="caption"
													color="primary"
													style={{
														display: 'block',
														marginTop: '4px',
														fontStyle: 'italic',
													}}
												>
													✓ Imagen existente
													disponible. Usa "Cambiar
													imagen" para seleccionar una
													nueva.
												</Typography>
											)}
									</Grid>
								</div>
								<Box mt={4} sx={{ flex: 1 }}>
									<h6>1. Datos del Producto</h6>
									<Grid container spacing={2} mt={1} mb={2}>
										<Grid size={{ xs: 6, sm: 3 }}>
											<Autocomplete
												disablePortal
												value={batch}
												options={batchChoices}
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
														label="Lote"
														required
													/>
												)}
												onChange={
													batchInputChangeHandler
												}
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 4 }}>
											<TextField
												label="Nombre"
												variant="outlined"
												onChange={
													nameInputChangeHandler
												}
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
										<Grid size={{ xs: 12, sm: 2 }}>
											<TextField
												label="Stock"
												variant="outlined"
												onChange={
													stockInputChangeHandler
												}
												value={stockState.value}
												error={!stockIsValid}
												helperText={
													!stockIsValid
														? stockState.feedbackText
														: ''
												}
												required
												fullWidth
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 3 }}>
											<TextField
												label="Código"
												variant="outlined"
												onChange={
													codeInputChangeHandler
												}
												value={codeState.value}
												error={!codeIsValid}
												helperText={
													!codeIsValid
														? codeState.feedbackText
														: ''
												}
												required
												fullWidth
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 2 }}>
											<TextField
												label="Unidad de Medida"
												variant="outlined"
												onChange={
													unitMeasurementInputChangeHandler
												}
												value={
													unitMeasurementState.value
												}
												error={!unitMeasurementIsValid}
												helperText={
													!unitMeasurementIsValid
														? unitMeasurementState.feedbackText
														: ''
												}
												required
												fullWidth
											/>
										</Grid>
									</Grid>
									<h6>2. Datos de Validación</h6>
									<Grid container spacing={2} mt={1} mb={2}>
										<Grid size={{ xs: 12, sm: 2 }}>
											<TextField
												label="Stock Mínimo"
												variant="outlined"
												onChange={
													minimumStockInputChangeHandler
												}
												value={minimumStockState.value}
												error={!minimumStockIsValid}
												helperText={
													!minimumStockIsValid
														? minimumStockState.feedbackText
														: ''
												}
												required
												fullWidth
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 2 }}>
											<TextField
												label="Stock Máximo"
												variant="outlined"
												onChange={
													maximumStockInputChangeHandler
												}
												value={maximumStockState.value}
												error={!maximumStockIsValid}
												helperText={
													!maximumStockIsValid
														? maximumStockState.feedbackText
														: ''
												}
												required
												fullWidth
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 2 }}>
											<TextField
												label="Precio mínimo de venta"
												variant="outlined"
												onChange={
													minimumSalePriceInputChangeHandler
												}
												value={
													minimumSalePriceState.value
												}
												error={!minimumSalePriceIsValid}
												helperText={
													!minimumSalePriceIsValid
														? minimumSalePriceState.feedbackText
														: ''
												}
												required
												fullWidth
											/>
										</Grid>
										<Grid size={{ xs: 12, sm: 2 }}>
											<TextField
												label="Precio máximo de venta"
												variant="outlined"
												onChange={
													maximumSalePriceInputChangeHandler
												}
												value={
													maximumSalePriceState.value
												}
												error={!maximumSalePriceIsValid}
												helperText={
													!maximumSalePriceIsValid
														? maximumSalePriceState.feedbackText
														: ''
												}
												required
												fullWidth
											/>
										</Grid>
									</Grid>
									<h6>3. Datos Adicionales</h6>
									<Grid container spacing={2} mt={1} mb={2}>
										<Grid size={{ xs: 12, sm: 4 }}>
											<TextField
												label="Descripción"
												variant="outlined"
												value={description}
												onChange={
													descriptionInputChangeHandler
												}
												multiline
												fullWidth
											/>
										</Grid>
									</Grid>
								</Box>
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
						<AddProductPreview
							batch={batch.name}
							name={nameState.value}
							stock={stockState.value}
							code={codeState.value}
							image={selectedFileUrl || existingImage}
							unitMeasurement={unitMeasurementState.value}
							description={description}
							minimumStock={minimumStockState.value}
							maximumStock={maximumStockState.value}
							minimumSalePrice={minimumSalePriceState.value}
							maximumSalePrice={maximumSalePriceState.value}
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
				{showModal && <AddProductModal editProduct={productData} />}
			</Fragment>
		</>
	);
}

export default AddProduct;
