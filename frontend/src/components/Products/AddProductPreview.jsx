import React, { useEffect, useState } from 'react';

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
	const [imageError, setImageError] = useState(false);

	const getImageUrl = () => {
		if (!props.image) return null;

		if (typeof props.image === 'string') {
			return props.image;
		}

		return null;
	};

	const imageUrl = getImageUrl();
	const classes = useStyles();

	useEffect(() => {
		setImageError(false);
	}, [props.image]);
	return (
		<>
			<Box sx={{ display: 'flex', gap: 3 }}>
				<div style={{ minWidth: '200px' }}>
					<h6>Imagen del producto</h6>
					{imageUrl && !imageError && (
						<img
							src={imageUrl}
							alt="preview"
							width={200}
							onError={() => setImageError(true)}
						/>
					)}
					{imageError && (
						<div
							style={{
								width: 200,
								height: 200,
								border: '1px solid #ddd',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: '#666',
								fontSize: '14px',
							}}
						>
							Error al cargar la imagen
						</div>
					)}
				</div>
				<Box sx={{ flex: 1 }}>
					{props.message && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{props.message}
						</Alert>
					)}
					<h6>1. Detalles del Producto</h6>
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
								label="Código"
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
								label="Unidad de Medida"
								value={props.unitMeasurement}
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
					<h6>2. Datos de Validación</h6>
					<Grid container spacing={2} mt={1} mb={2}>
						<Grid item md={3}>
							<TextField
								label="Precio de venta minimo"
								value={props.minimumSalePrice}
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
								value={props.maximumSalePrice}
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
					<h6>3. Datos Adicionales</h6>
					<Grid container spacing={2} mt={1} mb={2}>
						<Grid item md={3}>
							<TextField
								label="Descripción"
								value={props.description}
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
