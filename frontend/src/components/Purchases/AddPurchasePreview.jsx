import React from 'react';

import { Grid, TextField, Box } from '@mui/material';
import Alert from '@mui/material/Alert';

import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
	textStyle: {
		'& .MuiInputBase-input.Mui-disabled': {
			WebkitTextFillColor: '#000000',
		},
		'& .MuiInputLabel-shrink': {
			WebkitTextFillColor: 'blue',
		},
	},
});

function AddPurchasePreview(props) {
	const classes = useStyles();
	return (
		<>
			<Box>
				{props.message && (
					<Alert severity="error">{props.message}</Alert>
				)}
				<Box mt={4}>
					<h6>1. Datos de la Compra</h6>
					<Grid container spacing={2} mt={1} mb={2}>
						<Grid item md={3}>
							<TextField
								label="Proveedor"
								value={props.supplier.name}
								fullWidth
								variant="standard"
								sx={{
									'& .MuiInput-underline:before': {
										borderBottom: 'none',
									},
									'& .MuiInput-underline:after': {
										borderBottom: 'none',
									},
								}}
								disabled
								className={classes.textStyle}
							/>
						</Grid>
						<Grid item md={3}>
							<TextField
								label="Nº Factura"
								value={props.invoiceNumber}
								fullWidth
								variant="standard"
								sx={{
									'& .MuiInput-underline:before': {
										borderBottom: 'none',
									},
									'& .MuiInput-underline:after': {
										borderBottom: 'none',
									},
								}}
								disabled
								className={classes.textStyle}
							/>
						</Grid>
						<Grid item md={3}>
							<TextField
								label="Fecha de Compra"
								value={props.purchaseDate}
								fullWidth
								variant="standard"
								sx={{
									'& .MuiInput-underline:before': {
										borderBottom: 'none',
									},
									'& .MuiInput-underline:after': {
										borderBottom: 'none',
									},
								}}
								disabled
								className={classes.textStyle}
							/>
						</Grid>
						<Grid item md={3}>
							<TextField
								label="Tipo de Compra"
								value={props.purchaseType}
								fullWidth
								variant="standard"
								sx={{
									'& .MuiInput-underline:before': {
										borderBottom: 'none',
									},
									'& .MuiInput-underline:after': {
										borderBottom: 'none',
									},
								}}
								disabled
								className={classes.textStyle}
							/>
						</Grid>
					</Grid>
				</Box>
				<Box mt={4}>
					<h6>2. Datos de los Productos </h6>
					<Grid
						container
						spacing={2}
						mt={2}
						mb={2}
						direction="column"
					>
						{props.products.map((product, index) => (
							<Grid container spacing={2} key={index}>
								<Grid item md={3}>
									<TextField
										label="Nombre del Producto"
										value={product.name}
										fullWidth
										variant="standard"
										sx={{
											'& .MuiInput-underline:before': {
												borderBottom: 'none',
											},
											'& .MuiInput-underline:after': {
												borderBottom: 'none',
											},
										}}
										disabled
										className={classes.textStyle}
									/>
								</Grid>
								<Grid item md={3}>
									<TextField
										label="Código del Producto"
										value={product.code}
										fullWidth
										variant="standard"
										sx={{
											'& .MuiInput-underline:before': {
												borderBottom: 'none',
											},
											'& .MuiInput-underline:after': {
												borderBottom: 'none',
											},
										}}
										disabled
										className={classes.textStyle}
									/>
								</Grid>
								<Grid item md={3}>
									<TextField
										label="Precio Unitario"
										value={product.price.value}
										fullWidth
										variant="standard"
										sx={{
											'& .MuiInput-underline:before': {
												borderBottom: 'none',
											},
											'& .MuiInput-underline:after': {
												borderBottom: 'none',
											},
										}}
										disabled
										className={classes.textStyle}
									/>
								</Grid>
								<Grid item md={3}>
									<TextField
										label="Cantidad"
										value={product.quantity.value}
										fullWidth
										variant="standard"
										sx={{
											'& .MuiInput-underline:before': {
												borderBottom: 'none',
											},
											'& .MuiInput-underline:after': {
												borderBottom: 'none',
											},
										}}
										disabled
										className={classes.textStyle}
									/>
								</Grid>
								<Grid item md={3}>
									<TextField
										label="Costo Total"
										value={product.totalPrice.value}
										fullWidth
										variant="standard"
										sx={{
											'& .MuiInput-underline:before': {
												borderBottom: 'none',
											},
											'& .MuiInput-underline:after': {
												borderBottom: 'none',
											},
										}}
										disabled
										className={classes.textStyle}
									/>
								</Grid>
							</Grid>
						))}
					</Grid>
				</Box>
				<Box mt={4}>
					<h6>3. Datos del Pago </h6>
					<Grid container spacing={2} mt={1} mb={2}>
						<Grid item md={3}>
							<TextField
								label="Método de Pago"
								value={props.paymentMethod}
								fullWidth
								variant="standard"
								sx={{
									'& .MuiInput-underline:before': {
										borderBottom: 'none',
									},
									'& .MuiInput-underline:after': {
										borderBottom: 'none',
									},
								}}
								disabled
								className={classes.textStyle}
							/>
						</Grid>
						<Grid item md={3}>
							<TextField
								label="Monto Cancelado"
								value={props.paymentAmount}
								fullWidth
								variant="standard"
								sx={{
									'& .MuiInput-underline:before': {
										borderBottom: 'none',
									},
									'& .MuiInput-underline:after': {
										borderBottom: 'none',
									},
								}}
								disabled
								className={classes.textStyle}
							/>
						</Grid>
						<Grid item md={3}>
							<TextField
								label="Fecha de Pago"
								value={props.paymentDate}
								fullWidth
								variant="standard"
								sx={{
									'& .MuiInput-underline:before': {
										borderBottom: 'none',
									},
									'& .MuiInput-underline:after': {
										borderBottom: 'none',
									},
								}}
								disabled
								className={classes.textStyle}
							/>
						</Grid>
					</Grid>
				</Box>
			</Box>
		</>
	);
}
export default AddPurchasePreview;
