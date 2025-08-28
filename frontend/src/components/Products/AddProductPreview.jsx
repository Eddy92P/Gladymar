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

function AddProductPreview(props) {
	const classes = useStyles();
	return (
		<>
			<Box>
				{props.message && (
					<Alert severity="error">{props.message}</Alert>
				)}
				<Box mt={4}>
					<h6>Detalles del Producto</h6>
					<Grid container spacing={2} mt={1} mb={2}>
						<Grid item md={3}>
							<TextField
								label="Nombre"
								value={props.name}
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
								label="Stock"
								value={props.stock}
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
								label="Stock"
								value={props.stock}
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
								label="Code"
								value={props.code}
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
								label="Stock"
								value={props.stock}
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
								label="Stock minimo"
								value={props.minimum_stock}
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
								label="Stock máximo"
								value={props.maximum_stock}
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
								label="Precio de venta minimo"
								value={props.minimum_sale_price}
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
								label="Precio de venta máximo"
								value={props.maximum_sale_price}
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
export default AddProductPreview;
