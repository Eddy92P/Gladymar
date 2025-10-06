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

const EntryDetail = () => {
	const location = useLocation();
	const entryData = useMemo(
		() => location.state?.entryData || [],
		[location.state?.entryData]
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
							Detalle de Productos Ingresados
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
										{entryData.entryItems.map(
											(entryItem, index) => (
												<TableRow key={index}>
													<TableCell>
														{
															entryItem
																.products_stock
																.warehouses.name
														}
													</TableCell>
													<TableCell>
														{
															entryItem
																.products_stock
																.products.code
														}
													</TableCell>
													<TableCell>
														{
															entryItem
																.products_stock
																.products.name
														}
													</TableCell>
													<TableCell align="right">
														{entryItem.quantity}
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

export default EntryDetail;
