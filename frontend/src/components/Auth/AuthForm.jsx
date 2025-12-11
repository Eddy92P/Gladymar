import { api } from '../../Constants';
import { validateEmailLength, validatePasswordLength } from '../../Validations';

import { Link, useNavigate } from 'react-router-dom';
import {
	useRef,
	useContext,
	useState,
	useEffect,
	useReducer,
	Fragment,
} from 'react';

import AuthContext from '../../store/auth-context';

import Form from 'react-bootstrap/Form';
import classes from './AuthForm.module.css';

import Input from '../UI/Input/Input';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import AuthFormMessage from './AuthFormMessage';

const emailReducer = (state, action) => {
	if (action.type === 'INPUT_CHANGE') {
		return {
			value: action.val,
			isValid: validateEmailLength(action.val),
			feedbackText: 'Ingresa un correo electrónico',
		};
	}
	if (action.type === 'INPUT_FOCUS') {
		return {
			value: state.value,
			isValid: validateEmailLength(state.value),
			feedbackText: 'Ingresa un correo electrónico',
		};
	}
	return { value: '', isValid: false };
};

const passwordReducer = (state, action) => {
	if (action.type === 'INPUT_FOCUS') {
		return {
			value: state.value,
			isValid: validatePasswordLength(state.value),
			feedbackText: 'Ingresa la contraseña',
		};
	}
	if (action.type === 'INPUT_CHANGE') {
		return {
			value: action.val,
			isValid: validatePasswordLength(action.val),
			feedbackText: 'Ingresa la contraseña',
		};
	}
	return { value: '', isValid: false };
};

const AuthForm = () => {
	const navigate = useNavigate();
	const authContext = useContext(AuthContext);
	let errorMessage;

	const [formIsValid, setFormIsValid] = useState();

	const [emailState, dispatchEmail] = useReducer(emailReducer, {
		value: '',
		isValid: null,
		feedbackText: '',
	});

	const [passwordState, dispatchPassword] = useReducer(passwordReducer, {
		value: '',
		isValid: null,
		feedbackText: '',
	});

	const { isValid: emailIsValid } = emailState;
	const { isValid: passwordIsValid } = passwordState;

	useEffect(() => {
		setFormIsValid(emailIsValid && passwordIsValid);
	}, [emailIsValid, passwordIsValid]);

	// const [isLogin, setIsLogin] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState('');

	const emailInputChangeHandler = event => {
		dispatchEmail({ type: 'INPUT_CHANGE', val: event.target.value });
	};

	const passwordInputChangeHandler = event => {
		dispatchPassword({ type: 'INPUT_CHANGE', val: event.target.value });
	};

	const emailInputRef = useRef();
	const passwordInputRef = useRef();

	const submitHandler = async event => {
		event.preventDefault();

		// Connecting to Vercel API
		const API = import.meta.env.VITE_API_URL;
		const url = `${API}${api.API_URL_LOGIN}`;

		if (formIsValid) {
			setIsLoading(true);
			try {
				const response = await fetch(url, {
					method: 'POST',
					body: JSON.stringify({
						email: emailState.value,
						password: passwordState.value,
					}),
					headers: {
						'Content-Type': 'application/json',
					},
				});
				setIsLoading(false);
				const data = await response.json();
				if (!response.ok) {
					if (data && data.error) {
						errorMessage =
							'Usuario incorrecto, verifique sus datos.';
					}
					throw new Error(errorMessage);
				}
				// const expirationTime = new Date(
				//   new Date().getTime() + +data.expiresIn * 1000
				// );
				authContext.login(
					data.token,
					data.permissions || [],
					data.name || '',
					data.last_name || '',
					data.is_superuser,
					data.user_type
				);
				navigate('/');
			} catch (error) {
				setIsLoading(false);
				setMessage(error.message);
			}
		} else if (!emailIsValid) {
			emailInputRef.current.focus();
			dispatchEmail({ type: 'INPUT_FOCUS' });
		} else {
			passwordInputRef.current.focus();
			dispatchPassword({ type: 'INPUT_FOCUS' });
		}
	};

	const showMessageHandler = () => {
		setMessage(null);
	};

	return (
		<Fragment>
			<div className={classes.authContainer}>
				{message && (
					<AuthFormMessage
						message={message}
						onShowMessage={showMessageHandler}
					/>
				)}
				<Card className={classes.auth}>
					<h1>Inicio de Sesión</h1>
					<Form onSubmit={submitHandler}>
						<Input
							ref={emailInputRef}
							id="email"
							label="Correo electrónico"
							type="email"
							isValid={emailIsValid}
							value={emailState.value}
							placeholder="Ingrese su correo electrónico"
							onChange={emailInputChangeHandler}
							feedbackText={emailState.feedbackText}
							disabled={isLoading}
						/>
						<Input
							ref={passwordInputRef}
							id="password"
							label="Contraseña"
							type="password"
							isValid={passwordIsValid}
							value={passwordState.value}
							placeholder="Ingrese su contraseña"
							onChange={passwordInputChangeHandler}
							feedbackText={passwordState.feedbackText}
							disabled={isLoading}
						/>
						<div className={classes.link}>
							<Link to={'#'} style={{ textDecoration: 'none' }}>
								¿Olvidaste tu contraseña?
							</Link>
						</div>
						<div className={classes.actions}>
							<Button
								type="submit"
								className={classes.btn}
								disabled={isLoading}
								isLoading={isLoading}
							>
								{!isLoading ? 'Ingresar' : 'Autenticando...'}
							</Button>
						</div>
					</Form>
				</Card>
			</div>
		</Fragment>
	);
};

export default AuthForm;
