import {
	Grid,
	Typography,
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableContainer,
	TableRow,
} from '@mui/material';
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const OutputDetail = () => {
	const location = useLocation();
	const outputData = useMemo(
		() => location.state?.outputData || [],
		[location.state?.outputData]
	);
	return (
		<Box p={2}>
			<Grid container spacing={2} mt={1} mb={2}>
				<Grid
					item
					md={3}
					sx={{
						height: '50%',
						width: '100%',
					}}
				>
					<Paper
						elevation={3}
						sx={{
							p: 4,
						}}
					>
						<Typography
							variant="h5"
							component="h2"
							sx={{
								fontWeight: 'bold',
								mb: 2,
								pb: 1,
							}}
						>
							Detalle de Productos Despachados
						</Typography>
						<Box sx={{ width: '100%' }}>
							<TableContainer>
								<Table
									sx={{ minWidth: 650 }}
									aria-label="products table"
								>
									<TableHead>
										<TableRow>
											<TableCell>
												<strong>Almacén</strong>
											</TableCell>
											<TableCell>
												<strong>Código</strong>
											</TableCell>
											<TableCell>
												<strong>Producto</strong>
											</TableCell>
											<TableCell align="right">
												<strong>Cantidad</strong>
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{outputData.outputItems.map(
											(outputItem, index) => (
												<TableRow key={index}>
													<TableCell>
														{
															outputItem
																.products_stock
																.warehouses.name
														}
													</TableCell>
													<TableCell>
														{
															outputItem
																.products_stock
																.products.code
														}
													</TableCell>
													<TableCell>
														{
															outputItem
																.products_stock
																.products.name
														}
													</TableCell>
													<TableCell align="right">
														{outputItem.quantity}
													</TableCell>
												</TableRow>
											)
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</Box>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default OutputDetail;
