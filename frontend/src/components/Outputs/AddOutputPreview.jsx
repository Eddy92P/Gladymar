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

function AddOutputPreview(props) {
	const classes = useStyles();
	return (
		<>
			<Box>
				{props.message && (
					<Alert severity="error">{props.message}</Alert>
				)}
				<Box mt={4}>
					<h6>1. Datos de la Salida</h6>
					<Grid container spacing={2} mt={1} mb={2}>
						<Grid item md={3}>
							<TextField
								label="Cliente"
								value={props.client.name}
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
								label="Fecha de Salida"
								value={props.outputDate}
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
							</Grid>
						))}
					</Grid>
				</Box>
			</Box>
		</>
	);
}
export default AddOutputPreview;
