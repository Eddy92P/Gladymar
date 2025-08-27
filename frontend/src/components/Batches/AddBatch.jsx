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
import { validateNameLength } from '../../Validations';

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
	const url = config.url.HOST + api.API_URL_BATCHES;
	const urlCategoryChoices = config.url.HOST + api.API_URL_ALL_CATEGORIES;
	const [isLoading, setIsLoading] = useState(false);
	const authContext = useContext(AuthContext);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const batchData = useMemo(
		() => location.state?.batchData || [],
		[location.state?.batchData]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [categoryChoices, setCategoryChoices] = useState([]);
	const [category, setCategory] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');

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

	const [nameState, dispatchName] = useReducer(nameReducer, {
		value: batchData.name ? batchData.name : '',
		isValid: true,
		feedbackText: '',
	});

	const { isValid: nameIsValid } = nameState;

	const nameInputChangeHandler = e => {
		dispatchName({ type: 'INPUT_CHANGE', val: e.target.value });
	};

	const categoryInputChangeHandler = (event, option) => {
		setCategory(option);
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
		if (formIsValid && !isForm && batchData.length === 0) {
			handleSubmit();
		}
		if (formIsValid && !isForm && batchData.length !== 0) {
			handleEdit();
		}
	};

	useEffect(() => {
		const fetchCategoryChoices = async () => {
			try {
				const response = await fetch(urlCategoryChoices, {
					headers: {
						Authorization: `Token ${authContext.token}`,
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const data = await response.json();
					const choices = data || [];
					setCategoryChoices(choices);
					if (batchData.category && choices.length > 0) {
						const matchingChoice = choices.find(
							choice => choice.id === batchData.category.id
						);
						if (matchingChoice) {
							setCategory(matchingChoice);
						}
					}
				}
			} catch (error) {
				console.error('Error fetching warehouse choices:', error);
			}
		};

		fetchCategoryChoices();
	}, [urlCategoryChoices, authContext.token, batchData.category]);

	const handleSubmit = async () => {
		try {
			const response = await fetch(url, {
				method: 'POST',
				body: JSON.stringify({
					name: nameState.value,
					category_id: category.id,
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
			const response = await fetch(`${url}${batchData.id}/`, {
				method: 'PUT',
				body: JSON.stringify({
					name: nameState.value,
					category_id: category.id,
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
		if (nameState.value && category) {
			const isValid = nameIsValid;

			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [nameState.value, category, nameIsValid]);

	useEffect(() => {
		setTitle(batchData.length !== 0 ? 'Editar Lote' : 'Agregar Lote');
		if (batchData.length !== 0) {
			setButtonText('Guardar Cambios');
		} else {
			setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
		}
	}, [isForm, batchData]);

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
								<h6>1. Datos del Lote</h6>
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
