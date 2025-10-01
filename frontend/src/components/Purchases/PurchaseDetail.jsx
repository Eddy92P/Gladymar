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
const PurchaseDetail = () => {
	const location = useLocation();
	const purchaseData = useMemo(
		() => location.state?.purchaseData || [],
		[location.state?.purchaseData]
	);

	const [activeStep, setActiveStep] = useState(0);
	const steps = [
		{
			label: 'Realizado',
			date: dayjs(purchaseData.purchaseDate).format('DD-MM-YYYY'),
		},
		{
			label: 'Terminado',
			date:
				purchaseData.status === 'terminado'
					? dayjs(purchaseData.purchaseEndDate).format('DD-MM-YYYY')
					: '',
		},
	];

	useEffect(() => {
		if (purchaseData.status === 'realizado') {
			setActiveStep(1);
		} else if (purchaseData.status === 'terminado') {
			setActiveStep(2);
		}
	}, [purchaseData.status]);
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
							Estado de la Compra
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
												<strong>Precio Unitario</strong>
											</TableCell>
											<TableCell align="right">
												<strong>Cantidad</strong>
											</TableCell>
											<TableCell align="right">
												<strong>Costo Total</strong>
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{purchaseData.purchaseItems.map(
											(purchaseItem, index) => (
												<TableRow key={index}>
													<TableCell>
														{
															purchaseItem
																.products_stock
																.products.code
														}
													</TableCell>
													<TableCell>
														{
															purchaseItem
																.products_stock
																.products.name
														}
													</TableCell>
													<TableCell align="right">
														{
															purchaseItem.unit_price
														}
													</TableCell>
													<TableCell align="right">
														{purchaseItem.quantity}
													</TableCell>
													<TableCell align="right">
														{
															purchaseItem.total_price
														}
													</TableCell>
												</TableRow>
											)
										)}
										<TableRow>
											<TableCell />
											<TableCell />
											<TableCell />
											<TableCell colSpan={1}>
												<strong>Total Compra</strong>
											</TableCell>
											<TableCell align="right">
												<strong>
													{purchaseData.total}
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
									<TableBody>
										{purchaseData.payments.map(
											(payment, index) => (
												<TableRow key={index}>
													<TableCell>
														{payment.payment_date}
													</TableCell>
													<TableCell>
														{payment.payment_method}
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
													{purchaseData.balanceDue}
												</strong>
											</TableCell>
										</TableRow>
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

export default PurchaseDetail;
