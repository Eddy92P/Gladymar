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

function AddSupplierPreview(props) {
	const classes = useStyles();
	return (
		<>
			<Box>
				{props.message && (
					<Alert severity="error">{props.message}</Alert>
				)}
				<Box mt={4}>
					<h6>1. Datos del Proveedor</h6>
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
								label="Teléfono"
								value={props.phone}
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
								label="NIT"
								value={props.nit}
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
								label="Correo Electrónico"
								value={props.nit}
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
								label="Dirección"
								value={props.address}
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
				<Box>
					{props.products.length > 0 && (
						<h6>2. Datos de los Productos </h6>
					)}
					<Grid
						container
						spacing={2}
						mt={2}
						mb={2}
						direction="column"
					>
						{props.products.length > 0 &&
							props.products.map((product, index) => (
								<Grid container spacing={2} key={index}>
									<Grid item md={3}>
										<TextField
											label="Nombre del Producto"
											value={product.name}
											fullWidth
											variant="standard"
											sx={{
												'& .MuiInput-underline:before':
													{
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
												'& .MuiInput-underline:before':
													{
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
			</Box>
		</>
	);
}
export default AddSupplierPreview;
