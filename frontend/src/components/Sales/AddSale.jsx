import React, {
	useState,
	useEffect,
	useContext,
	useReducer,
	useCallback,
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
import dayjs from 'dayjs';

// Validations and Constants
import { validatePositiveNumber, validDate } from '../../Validations';
import { api, config } from '../../Constants';

// Components
import AddProductDetailedList from '../Products/AddProductDetailedList';
import AddSalePreview from './AddSalePreview';
import AddSaleModal from './AddSaleModal';
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

export const AddSale = () => {
	const url = config.url.HOST + api.API_URL_SALES;
	const urlClientChoices = config.url.HOST + api.API_URL_ALL_CLIENTS;
	const urlSellingChannelsChoices =
		config.url.HOST + api.API_URL_ALL_SELLING_CHANNEL;

	const saleTypeChoices = [
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
	const location = useLocation();

	const saleData = useMemo(
		() => location.state?.saleData || [],
		[location.state?.saleData]
	);

	const isSale = useMemo(
		() => location.state?.isSale,
		[location.state?.isSale]
	);

	const [formIsValid, setFormIsValid] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isForm, setIsForm] = useState(true);
	const [title, setTitle] = useState('');
	const [buttonText, setButtonText] = useState('');
	const [disabled, setDisabled] = useState(true);
	const [errorMessage, setErrorMessage] = useState('');
	const [showProductsModal, setShowProductsModal] = useState(false);
	const [saleTotalAmount, setSaleTotalAmount] = useState('');
	const [saleType, setSaleType] = useState('');
	const [clientChoices, setClientChoices] = useState([]);
	const [client, setClient] = useState(null);
	const [sellingChannelChoices, setSellingChannelChoices] = useState([]);
	const [sellingChannel, setSellingChannel] = useState(null);
	const [paymentMethod, setPaymentMethod] = useState('');

	const saleDateReducer = (state, action) => {
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

	const salePerformDateReducer = (state, action) => {
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
		if (action.type === 'SUB_TOTAL_PRICE_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? {
							...product,
							subTotalPrice: {
								value: action.val,
								isValid: validatePositiveNumber(action.val),
							},
						}
					: product
			);
		}
		if (action.type === 'DISCOUNT_CHANGE') {
			return state.map(product =>
				product.id === action.id
					? {
							...product,
							discount: {
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

	const [saleDateState, dispatchSaleDate] = useReducer(saleDateReducer, {
		value: saleData.saleDate ? dayjs(saleData.saleDate) : null,
		isValid: true,
		feedbackText: '',
	});

	const [salePerformDateState, dispatchSalePerformDate] = useReducer(
		salePerformDateReducer,
		{
			value: saleData.salePerformDate
				? dayjs(saleData.salePerformDate)
				: null,
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

	const saleProducts = saleData.saleItems?.map(saleItem => {
		return {
			saleItemId: saleItem.id,
			id: saleItem.products.id,
			name: saleItem.products.name,
			code: saleItem.products.code,
			stock: saleItem.products.available_stock,
			minimumSalePrice: saleItem.products.minimum_sale_price,
			maximumSalePrice: saleItem.products.maximum_sale_price,
			price: {
				value: saleItem.unit_price || '',
				isValid: true,
				feedbackText: '',
			},
			quantity: {
				value: saleItem.quantity || '',
				isValid: true,
				feedbackText: '',
			},
			subTotalPrice: {
				value: saleItem.sub_total_price || '',
				isValid: true,
				feedbackText: '',
			},
			discount: {
				value: saleItem.discount || 0,
				isValid: true,
				feedbackText: '',
			},
			totalPrice: {
				value: saleItem.total_price || '',
				isValid: true,
				feedbackText: '',
			},
		};
	});

	const [productListState, dispatchProductList] = useReducer(
		productListReducer,
		saleProducts ? saleProducts : []
	);

	const { isValid: saleDateIsValid } = saleDateState;
	const { isValid: salePerformDateIsValid } = salePerformDateState;
	const { isValid: paymentAmountIsValid } = paymentAmountState;
	const { isValid: paymentDateIsValid } = paymentDateState;

	const saleDateInputChangeHandler = newValue => {
		dispatchSaleDate({ type: 'INPUT_CHANGE', val: newValue });
	};

	const salePerformDateInputChangeHandler = newValue => {
		dispatchSalePerformDate({ type: 'INPUT_CHANGE', val: newValue });
	};

	const paymentAmountInputChangeHandler = e => {
		dispatchPaymentAmount({ type: 'INPUT_CHANGE', val: e.target.value });
		const paymentAmount = parseFloat(e.target.value) || 0;
		if (saleType === 'contado' && paymentAmount < saleTotalAmount) {
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

	const saleTypeChangeHandler = e => {
		setSaleType(e.target.value);
	};

	const paymentMethodChangeHandler = e => {
		setPaymentMethod(e.target.value);
	};

	// Función para calcular y actualizar el precio sub total sin descuento de cada producto
	const calculateAndUpdateSubTotalPrice = useCallback(
		(id, price, quantity) => {
			const subTotalPrice = price * quantity;
			dispatchProductList({
				type: 'SUB_TOTAL_PRICE_CHANGE',
				id,
				val: subTotalPrice.toString(),
			});
		},
		[dispatchProductList]
	);

	// Función para calcular y actualizar el precio total de cada producto
	const calculateAndUpdateTotalPrice = useCallback(
		(id, subTotal, discount) => {
			let totalPrice = 0;
			if (parseFloat(discount) > 0) {
				totalPrice = (subTotal - (subTotal * discount) / 100).toFixed(
					2
				);
			} else {
				totalPrice = subTotal;
			}
			dispatchProductList({
				type: 'TOTAL_PRICE_CHANGE',
				id,
				val: totalPrice.toString(),
			});
		},
		[dispatchProductList]
	);

	// Función para calcular y actualizar el precio total de la compra
	const calculateAndUpdateTotalSalePrice = useCallback(() => {
		const updated = [...productListState];
		let totalSalePrice = 0;
		for (const product of updated) {
			totalSalePrice += parseFloat(product.totalPrice.value) || 0;
		}

		setSaleTotalAmount(totalSalePrice.toFixed(2));
	}, [productListState]);

	// Recalcular el total de la compra cuando cambie la lista de productos
	useEffect(() => {
		calculateAndUpdateTotalSalePrice();
	}, [productListState, calculateAndUpdateTotalSalePrice]);

	const priceInputChangeHandler = useCallback(
		(id, value) => {
			dispatchProductList({ type: 'UNIT_PRICE_CHANGE', id, val: value });

			// Buscar el producto actual para obtener la cantidad
			const product = productListState.find(p => p.id === id);
			if (product) {
				const price = parseFloat(value) || 0;
				const quantity = parseFloat(product.quantity.value) || 0;
				const discount = parseFloat(product.discount.value) || 0;

				// Calcular el nuevo subtotal
				const newSubTotal = price * quantity;
				calculateAndUpdateSubTotalPrice(id, price, quantity);
				calculateAndUpdateTotalPrice(id, newSubTotal, discount);
			}
		},
		[
			dispatchProductList,
			productListState,
			calculateAndUpdateSubTotalPrice,
			calculateAndUpdateTotalPrice,
		]
	);

	const quantityInputChangeHandler = useCallback(
		(id, value) => {
			dispatchProductList({ type: 'QUANTITY_CHANGE', id, val: value });

			// Buscar el producto actual para obtener el precio
			const product = productListState.find(p => p.id === id);
			if (product) {
				const price = parseFloat(product.price.value) || 0;
				const quantity = parseFloat(value) || 0;
				const discount = parseFloat(product.discount.value) || 0;

				// Calcular el nuevo subtotal
				const newSubTotal = price * quantity;
				calculateAndUpdateSubTotalPrice(id, price, quantity);
				calculateAndUpdateTotalPrice(id, newSubTotal, discount);
			}
		},
		[
			dispatchProductList,
			productListState,
			calculateAndUpdateSubTotalPrice,
			calculateAndUpdateTotalPrice,
		]
	);

	const discountInputChangeHandler = useCallback(
		(id, value) => {
			dispatchProductList({ type: 'DISCOUNT_CHANGE', id, val: value });

			// Buscar el producto actual para obtener el precio
			const product = productListState.find(p => p.id === id);
			if (product) {
				const subTotalPrice =
					parseFloat(product.subTotalPrice.value) || 0;
				const discount = parseFloat(value) || 0;
				calculateAndUpdateTotalPrice(id, subTotalPrice, discount);
			}
		},
		[dispatchProductList, productListState, calculateAndUpdateTotalPrice]
	);

	const clientInputChangeHandler = (event, option) => {
		setClient(option);
	};

	const sellingChannelInputChangeHandler = (event, option) => {
		setSellingChannel(option);
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
		if (formIsValid && !isForm && saleData.length === 0) {
			handleSubmit();
		}
		if (formIsValid && !isForm && saleData.length !== 0) {
			handleEdit();
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
	}, [authContext.token, urlClientChoices, saleData]);

	useEffect(() => {
		const fetchSellingChannels = async () => {
			try {
				const response = await fetch(urlSellingChannelsChoices, {
					method: 'GET',
					headers: {
						Authorization: `Token ${authContext.token}`,
						'Content-Type': 'application/json',
					},
				});
				if (response.ok) {
					const data = await response.json();
					const choices = data || [];
					setSellingChannelChoices(choices);
					if (saleData.sellingChannel && choices.length > 0) {
						const matchingChoice = choices.find(
							choice => choice.id === saleData.sellingChannel.id
						);
						if (matchingChoice) {
							setSellingChannel(matchingChoice);
						}
					}
				}
			} catch (error) {
				console.error(
					'Error al recuperar las opciones de Canales de Ventas:',
					error
				);
			}
		};

		fetchSellingChannels();
	}, [authContext.token, urlSellingChannelsChoices, saleData]);

	const handleSubmit = async () => {
		try {
			// Preparar los datos básicos de la venta
			const saleInfo = {
				agency: storeContext.agency,
				client: client.id,
				selling_channel: sellingChannel.id,
				sale_date: saleDateState.value.format('YYYY-MM-DD'),
				sale_type: 'proforma',
				status: 'proforma',
				total: saleTotalAmount,
				balance_due: 0,
				sale_items: productListState.map(product => ({
					product: product.id,
					quantity: product.quantity.value,
					unit_price: product.price.value,
					sub_total_price: product.subTotalPrice.value,
					discount: product.discount.value,
					total_price: product.totalPrice.value,
				})),
			};

			const response = await fetch(url, {
				method: 'POST',
				body: JSON.stringify(saleInfo),
				headers: {
					Authorization: `Token ${authContext.token}`,
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();

			if (!response.ok) {
				setErrorMessage('Ocurrió un problema.');
				setIsForm(true);
				if (data.sale_items) {
					data.sale_items.forEach((sale_item, index) => {
						const productId = productListState[index]?.id;

						if (sale_item.quantity) {
							const errorMessage = Array.isArray(
								sale_item.quantity
							)
								? sale_item.quantity[0]
								: sale_item.quantity;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'quantity',
							});
						}

						if (sale_item.unit_price) {
							const errorMessage = Array.isArray(
								sale_item.unit_price
							)
								? sale_item.unit_price[0]
								: sale_item.unit_price;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'unitPrice',
							});
						}

						if (sale_item.sub_total_price) {
							const errorMessage = Array.isArray(
								sale_item.sub_total_price
							)
								? sale_item.sub_total_price[0]
								: sale_item.sub_total_price;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'subTotalPrice',
							});
						}

						if (sale_item.discount) {
							const errorMessage = Array.isArray(
								sale_item.discount
							)
								? sale_item.discount[0]
								: sale_item.discount;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'discount',
							});
						}

						if (sale_item.total_price) {
							const errorMessage = Array.isArray(
								sale_item.total_price
							)
								? sale_item.total_price[0]
								: sale_item.total_price;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'totalPrice',
							});
						}
					});
				}

				if (data.payments) {
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
			// Preparar los datos básicos de la venta
			const saleInfo = {
				agency: storeContext.agency,
				client: client.id,
				selling_channel: sellingChannel.id,
				sale_date: saleDateState.value.format('YYYY-MM-DD'),
				sale_perform_date: isSale
					? salePerformDateState.value.format('YYYY-MM-DD')
					: null,
				sale_type: isSale ? saleType : 'proforma',
				status: isSale ? 'realizado' : 'proforma',
				total: saleTotalAmount,
				balance_due: isSale ? saleTotalAmount : 0,
				sale_items: productListState.map(product => ({
					id: product.saleItemId,
					product: product.id,
					quantity: product.quantity.value,
					unit_price: product.price.value,
					sub_total_price: product.subTotalPrice.value,
					discount: product.discount.value,
					total_price: product.totalPrice.value,
				})),
			};

			// Solo agregar payments si se proporciona información de pago
			if (
				paymentMethod &&
				paymentAmountState.value &&
				paymentDateState.value
			) {
				saleInfo.payments = {
					payment_method: paymentMethod,
					transaction_type: 'venta',
					amount: paymentAmountState.value,
					payment_date: paymentDateState.value
						? paymentDateState.value.format('YYYY-MM-DD')
						: null,
				};
			}

			const response = await fetch(`${url}${saleData.id}/`, {
				method: 'PUT',
				body: JSON.stringify(saleInfo),
				headers: {
					Authorization: `Token ${authContext.token}`,
					'Content-Type': 'application/json',
				},
			});
			const data = await response.json();

			if (!response.ok) {
				setErrorMessage('Ocurrió un problema.');
				setIsForm(true);
				if (data.sale_items) {
					data.sale_items.forEach((sale_item, index) => {
						const productId = productListState[index]?.id;

						if (sale_item.quantity) {
							const errorMessage = Array.isArray(
								sale_item.quantity
							)
								? sale_item.quantity[0]
								: sale_item.quantity;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'quantity',
							});
						}

						if (sale_item.unit_price) {
							const errorMessage = Array.isArray(
								sale_item.unit_price
							)
								? sale_item.unit_price[0]
								: sale_item.unit_price;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'unitPrice',
							});
						}

						if (sale_item.sub_total_price) {
							const errorMessage = Array.isArray(
								sale_item.sub_total_price
							)
								? sale_item.sub_total_price[0]
								: sale_item.sub_total_price;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'subTotalPrice',
							});
						}

						if (sale_item.discount) {
							const errorMessage = Array.isArray(
								sale_item.discount
							)
								? sale_item.discount[0]
								: sale_item.discount;

							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'discount',
							});
						}

						if (sale_item.total_price) {
							const errorMessage = Array.isArray(
								sale_item.total_price
							)
								? sale_item.total_price[0]
								: sale_item.total_price;
							dispatchProductList({
								type: 'SET_ERROR',
								id: productId,
								errorMessage: errorMessage,
								field: 'totalPrice',
							});
						}
					});
				}

				if (data.payments) {
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
		const saleTypeValid = isSale ? saleType : true;
		const salePerformDateValue = isSale ? salePerformDateState.value : true;
		if (
			saleDateState.value &&
			salePerformDateValue &&
			client &&
			sellingChannel &&
			productListState.length > 0
		) {
			// Validar Productos
			const allProductsFieldsValid = productListState.every(
				product =>
					product.price.value &&
					product.quantity.value &&
					product.subTotalPrice.value &&
					product.discount.value !== '' &&
					product.discount.value !== null &&
					product.discount.value !== undefined &&
					product.totalPrice.value &&
					product.price.isValid &&
					product.quantity.isValid &&
					product.subTotalPrice.isValid &&
					product.discount.isValid &&
					product.totalPrice.isValid
			);

			let paymentIsValid = true;
			if (isSale) {
				paymentIsValid = false;
			}
			if (
				paymentMethod ||
				paymentAmountState.value ||
				paymentDateState.value
			) {
				paymentIsValid =
					paymentMethod &&
					paymentAmountState.value &&
					paymentDateState.value &&
					paymentAmountIsValid &&
					paymentDateIsValid;
			}
			const isValid =
				saleDateIsValid &&
				salePerformDateIsValid &&
				paymentIsValid &&
				client &&
				sellingChannel &&
				saleTypeValid &&
				allProductsFieldsValid;
			setFormIsValid(isValid);
			setDisabled(!isValid);
		} else {
			setDisabled(true);
		}
	}, [
		client,
		saleDateState.value,
		salePerformDateState.value,
		sellingChannel,
		paymentAmountState.value,
		paymentDateState.value,
		paymentMethod,
		saleData.length,
		saleDateIsValid,
		salePerformDateIsValid,
		paymentAmountIsValid,
		paymentDateIsValid,
		productListState,
		isSale,
		saleType,
	]);

	useEffect(() => {
		if (isSale) {
			setTitle('Realizar Venta');
		} else if (!isSale && saleData.length > 0) {
			setTitle('Editar Venta');
		} else {
			setTitle('Generar Proforma');
		}

		setButtonText(!isForm ? 'Finalizar' : 'Siguiente');
	}, [isForm, isSale, saleData]);

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
									Datos de Venta
								</Typography>
								<Grid container spacing={2} mt={1} mb={2}>
									<Grid size={{ xs: 12, sm: 4 }}>
										<Autocomplete
											disablePortal
											value={client}
											options={clientChoices}
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
													label="Cliente"
													required
												/>
											)}
											onChange={clientInputChangeHandler}
										/>
									</Grid>
									<Grid size={{ xs: 12, sm: 4 }}>
										<Autocomplete
											disablePortal
											value={sellingChannel}
											options={sellingChannelChoices}
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
													label="Canal de Ventas"
													required
												/>
											)}
											onChange={
												sellingChannelInputChangeHandler
											}
										/>
									</Grid>
									{isSale && (
										<Grid size={{ xs: 12, sm: 2 }}>
											<FormControl fullWidth required>
												<InputLabel id="sale-type-select-label">
													Tipo de Venta
												</InputLabel>
												<Select
													labelId="sale-type-select-label"
													id="sale-type-select"
													value={saleType}
													label="Tipo de Venta"
													onChange={
														saleTypeChangeHandler
													}
												>
													{saleTypeChoices.map(
														choice => (
															<MenuItem
																key={choice.id}
																value={
																	choice.value
																}
															>
																{choice.label}
															</MenuItem>
														)
													)}
												</Select>
											</FormControl>
										</Grid>
									)}
									{!isSale && (
										<Grid size={{ xs: 12, sm: 2 }}>
											<LocalizationProvider
												dateAdapter={AdapterDayjs}
											>
												<DatePicker
													label="Fecha de Proforma"
													onChange={
														saleDateInputChangeHandler
													}
													value={saleDateState.value}
													slotProps={{
														textField: {
															error: !saleDateIsValid,
															helperText:
																!saleDateIsValid
																	? saleDateState.feedbackText
																	: '',
														},
													}}
													fullWidth
												/>
											</LocalizationProvider>
										</Grid>
									)}
									{isSale && (
										<Grid size={{ xs: 12, sm: 2 }}>
											<LocalizationProvider
												dateAdapter={AdapterDayjs}
											>
												<DatePicker
													label="Fecha de Venta"
													onChange={
														salePerformDateInputChangeHandler
													}
													value={
														salePerformDateState.value
													}
													slotProps={{
														textField: {
															error: !salePerformDateIsValid,
															helperText:
																!salePerformDateIsValid
																	? salePerformDateState.feedbackText
																	: '',
														},
													}}
													fullWidth
												/>
											</LocalizationProvider>
										</Grid>
									)}
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
															Precio Mínimo de
															Venta Bs.
														</StyledTableCell>
														<StyledTableCell>
															Precio Máximo de
															Venta Bs.
														</StyledTableCell>
														<StyledTableCell>
															Cantidad
														</StyledTableCell>
														<StyledTableCell>
															Precio Unitario Bs.
														</StyledTableCell>
														<StyledTableCell>
															Sub Total Bs.
														</StyledTableCell>
														<StyledTableCell>
															Descuento %
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
																	{
																		product.stock
																	}
																</TableCell>
																<TableCell>
																	{
																		product.minimumSalePrice
																	}
																</TableCell>
																<TableCell>
																	{
																		product.maximumSalePrice
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
																					type: 'SUB_TOTAL_PRICE_CHANGE',
																					id: product.id,
																					val: e
																						.target
																						.value,
																				}
																			)
																		}
																		value={
																			product
																				.subTotalPrice
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
																<TableCell>
																	<TextField
																		variant="outlined"
																		onChange={e =>
																			discountInputChangeHandler(
																				product.id,
																				e
																					.target
																					.value
																			)
																		}
																		value={
																			product
																				.discount
																				.value
																		}
																		error={
																			(product
																				.discount
																				.value &&
																				!product
																					.discount
																					.isValid) ||
																			(!product
																				.discount
																				.isValid &&
																				product
																					.discount
																					.feedbackText)
																		}
																		helperText={
																			(product
																				.discount
																				.value &&
																				!product
																					.discount
																					.isValid) ||
																			(!product
																				.discount
																				.isValid &&
																				product
																					.discount
																					.feedbackText)
																				? product
																						.discount
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
																		error={
																			(product
																				.totalPrice
																				.value &&
																				!product
																					.totalPrice
																					.isValid) ||
																			(!product
																				.totalPrice
																				.isValid &&
																				product
																					.totalPrice
																					.feedbackText)
																		}
																		helperText={
																			(product
																				.totalPrice
																				.value &&
																				!product
																					.totalPrice
																					.isValid) ||
																			(!product
																				.totalPrice
																				.isValid &&
																				product
																					.totalPrice
																					.feedbackText)
																				? product
																						.totalPrice
																						.feedbackText
																				: ''
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
									{isSale && saleType && (
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
													<FormControl
														fullWidth
														required
													>
														<InputLabel id="purchase-type-select-label">
															Método de Pago
														</InputLabel>
														<Select
															labelId="purchase-type-select-label"
															id="purchase-type-select"
															value={
																paymentMethod
															}
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
														dateAdapter={
															AdapterDayjs
														}
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
									)}
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
							{saleTotalAmount > 0 && (
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
										value={saleTotalAmount}
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
								disabled={!sellingChannel}
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
						<AddSalePreview
							client={client}
							sellingChannel={sellingChannel}
							saleDate={
								saleDateState.value?.format('DD-MM-YYYY') || ''
							}
							salePerformDate={
								salePerformDateState.value?.format(
									'DD-MM-YYYY'
								) || ''
							}
							saleType={saleType}
							products={productListState}
							paymentMethod={paymentMethod}
							paymentAmount={paymentAmountState.value}
							paymentDate={
								paymentDateState.value?.format('DD-MM-YYYY') ||
								''
							}
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
						sellingChannel={sellingChannel}
					/>
				)}

				{showModal && <AddSaleModal />}
			</Fragment>
		</>
	);
};

export default AddSale;
