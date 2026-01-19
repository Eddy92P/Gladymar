import React, {
	Fragment,
	useState,
	useEffect,
	useReducer,
	useMemo,
} from 'react';

import Alert from '@mui/material/Alert';

import { api } from '../../Constants';
import { validateNameLength } from '../../Validations';

import {
	Grid,
	TextField,
	Button,
	FormControl,
	Box,
	Typography,
} from '@mui/material';
import classes from '../UI/List/List.module.css';

import AddCategoryPreview from './AddCategoryPreview';
import AddCategoryModal from './AddCategoryModal';
import ListHeader from '../UI/List/ListHeader';

import authFetch from '../../api/authFetch';

import { useNavigate, useLocation } from 'react-router-dom';

function AddCategory() {
	const API = import.meta.env.VITE_API_URL;
	const url = `${API}${api.API_URL_CATEGORIES}`;
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	const categoryData = useMemo(
		() => location.state?.categoryData || [],
		[location.state?.categoryData]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
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
		value: categoryData.name ? categoryData.name : '',
		isValid: true,
		feedbackText: '',
	});

	const { isValid: nameIsValid } = nameState;

	const nameInputChangeHandler = e => {
		dispatchName({ type: 'INPUT_CHANGE', val: e.target.value });
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
		if (formIsValid && !isForm && categoryData.length === 0) {
			handleSubmit();
		}
		if (formIsValid && !isForm && categoryData.length !== 0) {
			handleEdit();
		}
	};

	const handleSubmit = async () => {
		try {
			const response = await authFetch(url, {
				method: 'POST',
				body: JSON.stringify({
					name: nameState.value,
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
			const response = await authFetch(`${url}${categoryData.id}/`, {
				method: 'PUT',
				body: JSON.stringify({
					name: nameState.value,
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
		if (nameState.value) {
			const isValid = nameIsValid;

			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [nameState.value, nameIsValid]);

	useEffect(() => {
		setTitle(
			categoryData.length !== 0 ? 'Editar Categoria' : 'Agregar Categoria'
		);
		if (categoryData.length !== 0) {
			setButtonText('Guardar Cambios');
		} else {
			setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
		}
	}, [isForm, categoryData]);

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
								<h6>1. Datos de la Categoría</h6>
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
						<AddCategoryPreview
							name={nameState.value}
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
				{showModal && <AddCategoryModal editCategory={categoryData} />}
			</Fragment>
		</>
	);
}

export default AddCategory;
