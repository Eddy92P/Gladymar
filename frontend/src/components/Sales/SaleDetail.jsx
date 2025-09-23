import {
	Grid,
	Typography,
	Box,
	Paper,
	Stepper,
	Step,
	StepLabel,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableContainer,
	TableRow,
} from '@mui/material';
import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

const SaleDetail = () => {
	const location = useLocation();
	const saleData = useMemo(
		() => location.state?.saleData || [],
		[location.state?.saleData]
	);
	const [activeStep, setActiveStep] = useState(0);
	const steps = [
		{
			label: 'Proforma',
			date: dayjs(saleData.saleDate).format('DD-MM-YYYY'),
		},
		{
			label: 'Realizada',
			date:
				saleData.status === 'realizado'
					? dayjs(saleData.salePerformDate).format('DD-MM-YYYY')
					: '',
		},
		{
			label: 'Terminado',
			date:
				saleData.status === 'terminado'
					? dayjs(saleData.saleDoneDate).format('DD-MM-YYYY')
					: '',
		},
	];

	useEffect(() => {
		if (saleData.status === 'proforma') {
			setActiveStep(1);
		} else if (saleData.status === 'realizado') {
			setActiveStep(2);
		} else {
			setActiveStep(3);
		}
	}, [saleData.status]);

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
							Estado de la Venta
						</Typography>
						<Box sx={{ width: '100%' }}>
							<Stepper activeStep={activeStep} alternativeLabel>
								{steps.map(step => {
									const stepProps = {};
									const labelProps = {};
									return (
										<Step key={step.label} {...stepProps}>
											<StepLabel {...labelProps}>
												<Box
													sx={{ textAlign: 'center' }}
												>
													<Typography
														variant="body2"
														sx={{
															fontWeight: 'bold',
														}}
													>
														{step.label}
													</Typography>
													<Typography
														variant="caption"
														color="text.secondary"
													>
														{step.date}
													</Typography>
												</Box>
											</StepLabel>
										</Step>
									);
								})}
							</Stepper>
							<React.Fragment>
								<Box
									sx={{
										display: 'flex',
										flexDirection: 'row',
										pt: 2,
									}}
								>
									<Box sx={{ flex: '1 1 auto' }} />
								</Box>
							</React.Fragment>
						</Box>
					</Paper>
				</Grid>
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
							Detalle de Productos
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
												<strong>Código</strong>
											</TableCell>
											<TableCell>
												<strong>Producto</strong>
											</TableCell>
											<TableCell align="right">
												<strong>Cantidad</strong>
											</TableCell>
											<TableCell align="right">
												<strong>Precio Unitario</strong>
											</TableCell>
											<TableCell align="right">
												<strong>Sub Total</strong>
											</TableCell>
											<TableCell align="right">
												<strong>Descuento</strong>
											</TableCell>
											<TableCell align="right">
												<strong>Costo Total</strong>
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{saleData.saleItems.map(
											(saleItem, index) => (
												<TableRow key={index}>
													<TableCell>
														{saleItem.products.code}
													</TableCell>
													<TableCell>
														{saleItem.products.name}
													</TableCell>
													<TableCell align="right">
														{saleItem.quantity}
													</TableCell>
													<TableCell align="right">
														{saleItem.unit_price}
													</TableCell>
													<TableCell align="right">
														{
															saleItem.sub_total_price
														}
													</TableCell>
													<TableCell align="right">
														{saleItem.discount}
													</TableCell>
													<TableCell align="right">
														{saleItem.total_price}
													</TableCell>
												</TableRow>
											)
										)}
										<TableRow>
											<TableCell />
											<TableCell />
											<TableCell />
											<TableCell />
											<TableCell />
											<TableCell colSpan={1}>
												<strong>Total Venta</strong>
											</TableCell>
											<TableCell align="right">
												<strong>
													{saleData.total}
												</strong>
											</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</TableContainer>
						</Box>
					</Paper>
				</Grid>
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
							Detalle de Pagos
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
												<strong>Fecha de Pago</strong>
											</TableCell>
											<TableCell>
												<strong>Método de Pago</strong>
											</TableCell>
											<TableCell align="right">
												<strong>Monto</strong>
											</TableCell>
										</TableRow>
									</TableHead>
									{saleData.payments && (
										<TableBody>
											{saleData.payments.map(
												(payment, index) => (
													<TableRow key={index}>
														<TableCell>
															{
																payment.payment_date
															}
														</TableCell>
														<TableCell>
															{
																payment.payment_method
															}
														</TableCell>
														<TableCell align="right">
															{payment.amount}
														</TableCell>
													</TableRow>
												)
											)}
											<TableRow>
												<TableCell />
												<TableCell colSpan={1}>
													<strong>Saldo</strong>
												</TableCell>
												<TableCell align="right">
													<strong>
														{saleData.balanceDue}
													</strong>
												</TableCell>
											</TableRow>
										</TableBody>
									)}
								</Table>
							</TableContainer>
						</Box>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default SaleDetail;
