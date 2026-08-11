import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Grid, TextField, Box } from '@mui/material';
import Alert from '@mui/material/Alert';

import { makeStyles } from '@mui/styles';

import { formatDisplayDate } from '../../DateUtils';

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

const fieldSx = {
	'& .MuiInput-underline:before': {
		borderBottom: 'none',
	},
	'& .MuiInput-underline:after': {
		borderBottom: 'none',
	},
};

function PreviewField({ label, value, className }) {
	return (
		<Grid item md={3}>
			<TextField
				label={label}
				value={value}
				fullWidth
				variant="standard"
				sx={fieldSx}
				disabled
				className={className}
			/>
		</Grid>
	);
}

function AddSellingChannelPreview(props) {
	const classes = useStyles();
	const listRef = useRef(null);
	const products = props.products || [];
	const productCount = products.length;

	const rowVirtualizer = useVirtualizer({
		count: productCount,
		getScrollElement: () => listRef.current,
		estimateSize: () => 120,
		overscan: 6,
	});

	const virtualRows = rowVirtualizer.getVirtualItems();

	return (
		<>
			<Box>
				{props.message && (
					<Alert severity="error">{props.message}</Alert>
				)}
				<Box mt={4}>
					<h6>1. Datos del Canal de Ventas</h6>
					<Grid container spacing={2} mt={1} mb={2}>
						<PreviewField
							label="Nombre"
							value={props.name}
							className={classes.textStyle}
						/>
					</Grid>
				</Box>
				<Box>
					{productCount > 0 && (
						<h6>2. Datos de los Productos </h6>
					)}
					{productCount > 0 && (
						<Box
							ref={listRef}
							sx={{
								mt: 2,
								mb: 2,
								maxHeight: '60vh',
								overflow: 'auto',
							}}
						>
							<Box
								sx={{
									height: `${rowVirtualizer.getTotalSize()}px`,
									width: '100%',
									position: 'relative',
								}}
							>
								{virtualRows.map(virtualRow => {
									const product = products[virtualRow.index];
									return (
										<Box
											key={
												product.id ??
												virtualRow.index
											}
											data-index={virtualRow.index}
											ref={rowVirtualizer.measureElement}
											sx={{
												position: 'absolute',
												top: 0,
												left: 0,
												width: '100%',
												transform: `translateY(${virtualRow.start}px)`,
											}}
										>
											<Grid container spacing={2}>
												<PreviewField
													label="Nombre del Producto"
													value={product.name}
													className={
														classes.textStyle
													}
												/>
												<PreviewField
													label="Código del Producto"
													value={product.code}
													className={
														classes.textStyle
													}
												/>
												<PreviewField
													label="Precio"
													value={
														product.price
															?.value
													}
													className={
														classes.textStyle
													}
												/>
												<PreviewField
													label="Fecha Inicio"
													value={formatDisplayDate(
														product.startDate
															?.value
													)}
													className={
														classes.textStyle
													}
												/>
												<PreviewField
													label="Fecha Fin"
													value={formatDisplayDate(
														product.endDate
															?.value
													)}
													className={
														classes.textStyle
													}
												/>
											</Grid>
										</Box>
									);
								})}
							</Box>
						</Box>
					)}
				</Box>
			</Box>
		</>
	);
}
export default AddSellingChannelPreview;
