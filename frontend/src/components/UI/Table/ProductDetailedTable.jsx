// MUI Components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
	Dialog,
	DialogTitle,
	Box,
	DialogContent,
	IconButton,
	Tooltip,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import Icon from '@mdi/react';

import { styled, useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { mdiClose } from '@mdi/js';

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

const StyledDialog = styled(Dialog)({
	'& .MuiDialog-paper': {
		padding: '32px',
	},
});

const ProductDetailedTable = ({
	data,
	open: externalOpen,
	onClose,
	filterComponent,
	onProductList,
	addedProducts = [],
}) => {
	const [open, setOpen] = useState(externalOpen || false);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

	// Sync with external open state
	useEffect(() => {
		if (externalOpen !== undefined) {
			setOpen(externalOpen);
		}
	}, [externalOpen]);

	const handleClose = () => {
		setOpen(false);
		if (onClose) {
			onClose();
		}
	};

	const handleAddProduct = (e, id) => {
		e.preventDefault();
		const product = data.find(product => product.id === id);
		const newProduct = {
			...product,
			price: {
				value: product.price ? product.price : '',
				isValid: true,
				feedbackText: '',
			},
			stock: {
				value: product.stock ? product.stock : 0,
				isValid: true,
				feedbackText: '',
			},
			minimumStock: { value: 0, isValid: true, feedbackText: '' },
			maximumStock: { value: 0, isValid: true, feedbackText: '' },
			quantity: { value: '', isValid: true, feedbackText: '' },
			subTotalPrice: { value: '', isValid: true, feedbackText: '' },
			discount: { value: 0, isValid: true, feedbackText: '' },
			totalPrice: { value: '', isValid: true, feedbackText: '' },
			startDate: { value: '', isValid: true, feedbackText: '' },
			endDate: { value: '', isValid: true, feedbackText: '' },
		};
		onProductList([newProduct]);
	};

	// Función para verificar si un producto ya fue agregado
	const isProductAdded = productId => {
		return addedProducts.some(product => product.id === productId);
	};

	// Si no hay datos, mostrar mensaje
	if (!data || data.length === 0) {
		return (
			<StyledDialog
				onClose={handleClose}
				open={open}
				scroll="paper"
				fullScreen={fullScreen}
				maxWidth="lg"
				fullWidth
			>
				<DialogTitle
					sx={{
						m: 0,
						p: 2,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
					id="customized-dialog-title"
				>
					Agregar Productos
					<Icon
						path={mdiClose}
						size={1}
						onClick={handleClose}
						style={{ cursor: 'pointer' }}
					/>
				</DialogTitle>
				<DialogContent dividers>
					{filterComponent && (
						<Box sx={{ mb: 2 }}>{filterComponent}</Box>
					)}
					<TableContainer component={Paper}>
						<Table
							sx={{ minWidth: 650 }}
							aria-label="product table"
						>
							<TableBody>
								<TableRow>
									<TableCell>
										No hay productos disponibles
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</DialogContent>
			</StyledDialog>
		);
	}

	const columns = Object.keys(data[0]);

	return (
		<StyledDialog
			onClose={handleClose}
			open={open}
			scroll="paper"
			fullScreen={fullScreen}
			maxWidth="lg"
			fullWidth
		>
			<DialogTitle
				sx={{
					m: 0,
					p: 2,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
				id="customized-dialog-title"
			>
				Agregar Productos
				<Icon
					path={mdiClose}
					size={1}
					onClick={handleClose}
					style={{ cursor: 'pointer' }}
				/>
			</DialogTitle>
			<DialogContent dividers>
				{filterComponent && <Box sx={{ mb: 2 }}>{filterComponent}</Box>}
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								{data[0].purchaseItem != null && (
									<StyledTableCell>ID Compra</StyledTableCell>
								)}
								{data[0].saleItem != null && (
									<StyledTableCell>ID Venta</StyledTableCell>
								)}
								{data[0].agency != null && (
									<StyledTableCell>Agencia</StyledTableCell>
								)}
								{data[0].warehouse != null && (
									<StyledTableCell>Almacén</StyledTableCell>
								)}
								<StyledTableCell>Nombre</StyledTableCell>
								<StyledTableCell>Código</StyledTableCell>
								{data[0].price != null && (
									<StyledTableCell>
										Precio Bs.
									</StyledTableCell>
								)}
								{data[0].stock != null && (
									<StyledTableCell>Stock</StyledTableCell>
								)}
								{data[0].reservedStock != null && (
									<StyledTableCell>Stock Reservado</StyledTableCell>
								)}
								{data[0].minimumSalePrice != null && (
									<StyledTableCell>
										Precio Mínimo Bs.
									</StyledTableCell>
								)}
								{data[0].maximumSalePrice != null && (
									<StyledTableCell>
										Precio Máximo Bs.
									</StyledTableCell>
								)}
								<StyledTableCell></StyledTableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data.map((item, rowIndex) => (
								<TableRow key={`row-${rowIndex}`}>
									{columns
										.filter(value => value !== 'id')
										.map((value, colIndex) => (
											<TableCell
												key={`cell-${rowIndex}-${colIndex}`}
											>
												{item[value]}
											</TableCell>
										))}
									<TableCell align="center">
										<Tooltip
											title={
												isProductAdded(item.id)
													? 'Producto ya agregado'
													: 'Agregar'
											}
											placement="top"
										>
											<span>
												<IconButton
													aria-label="add"
													onClick={e =>
														handleAddProduct(
															e,
															item.id
														)
													}
													disabled={isProductAdded(
														item.id
													)}
												>
													<AddCircleIcon
														color={
															isProductAdded(
																item.id
															)
																? 'disabled'
																: 'success'
														}
													/>
												</IconButton>
											</span>
										</Tooltip>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</DialogContent>
		</StyledDialog>
	);
};

export default ProductDetailedTable;
