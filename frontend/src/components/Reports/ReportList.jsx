import { Grid, Typography, Box, Paper, Button } from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useState } from 'react';
import { api } from '../../Constants';

const ReportList = () => {
	const API = import.meta.env.VITE_API_URL;
	const buyUrl = `${API}${api.BUY_REPORT_PDF_URL}`;
	const sellUrl = `${API}${api.SELL_REPORT_PDF_URL}`;
	const entryUrl = `${API}${api.ENTRY_REPORT_PDF_URL}`;
	const outputUrl = `${API}${api.OUTPUT_REPORT_PDF_URL}`;

	const [buyStartDate, setBuyStartDate] = useState(null);
	const [buyEndDate, setBuyEndDate] = useState(null);
	const [sellStartDate, setSellStartDate] = useState(null);
	const [sellEndDate, setSellEndDate] = useState(null);
	const [entryStartDate, setEntryStartDate] = useState(null);
	const [entryEndDate, setEntryEndDate] = useState(null);
	const [outputStartDate, setOutputStartDate] = useState(null);
	const [outputEndDate, setOutputEndDate] = useState(null);

	const formattedBuyStartDate = buyStartDate
		? buyStartDate.toISOString().split('T')[0]
		: null;
	const formattedBuyEndDate = buyEndDate
		? buyEndDate.toISOString().split('T')[0]
		: null;
	const formattedSellStartDate = sellStartDate
		? sellStartDate.toISOString().split('T')[0]
		: null;
	const formattedSellEndDate = sellEndDate
		? sellEndDate.toISOString().split('T')[0]
		: null;
	const formattedEntryStartDate = entryStartDate
		? entryStartDate.toISOString().split('T')[0]
		: null;
	const formattedEntryEndDate = entryEndDate
		? entryEndDate.toISOString().split('T')[0]
		: null;
	const formattedOutputStartDate = outputStartDate
		? outputStartDate.toISOString().split('T')[0]
		: null;
	const formattedOutputEndDate = outputEndDate
		? outputEndDate.toISOString().split('T')[0]
		: null;

	const handleBuyStartDate = value => {
		setBuyStartDate(value);
	};

	const handleBuyEndDate = value => {
		setBuyEndDate(value);
	};

	const handleSellStartDate = value => {
		setSellStartDate(value);
	};

	const handleSellEndDate = value => {
		setSellEndDate(value);
	};

	const handleEntryStartDate = value => {
		setEntryStartDate(value);
	};

	const handleEntryEndDate = value => {
		setEntryEndDate(value);
	};

	const handleOutputStartDate = value => {
		setOutputStartDate(value);
	};

	const handleOutputEndDate = value => {
		setOutputEndDate(value);
	};

	const handleGenerateBuyReport = e => {
		e.preventDefault();
		const fullUrl = `${buyUrl}?start_date=${formattedBuyStartDate}&end_date=${formattedBuyEndDate}`;
		window.open(fullUrl, '_blank');
		setBuyStartDate(null);
		setBuyEndDate(null);
	};

	const handleGenerateSellReport = e => {
		e.preventDefault();
		const fullUrl = `${sellUrl}?start_date=${formattedSellStartDate}&end_date=${formattedSellEndDate}`;
		window.open(fullUrl, '_blank');
		setSellStartDate(null);
		setSellEndDate(null);
	};

	const handleGenerateEntryReport = e => {
		e.preventDefault();
		const fullUrl = `${entryUrl}?start_date=${formattedEntryStartDate}&end_date=${formattedEntryEndDate}`;
		window.open(fullUrl, '_blank');
		setEntryStartDate(null);
		setEntryEndDate(null);
	};

	const handleGenerateOutputReport = e => {
		e.preventDefault();
		const fullUrl = `${outputUrl}?start_date=${formattedOutputStartDate}&end_date=${formattedOutputEndDate}`;
		window.open(fullUrl, '_blank');
		setOutputStartDate(null);
		setOutputEndDate(null);
	};

	const reports = [
		{
			title: 'Reporte de Compras',
			startDate: buyStartDate,
			endDate: buyEndDate,
			onStartDateChange: handleBuyStartDate,
			onEndDateChange: handleBuyEndDate,
			onGenerateReport: handleGenerateBuyReport,
		},
		{
			title: 'Reporte de Ventas',
			startDate: sellStartDate,
			endDate: sellEndDate,
			onStartDateChange: handleSellStartDate,
			onEndDateChange: handleSellEndDate,
			onGenerateReport: handleGenerateSellReport,
		},
		{
			title: 'Reporte de Entradas al Almacen',
			startDate: entryStartDate,
			endDate: entryEndDate,
			onStartDateChange: handleEntryStartDate,
			onEndDateChange: handleEntryEndDate,
			onGenerateReport: handleGenerateEntryReport,
		},
		{
			title: 'Reporte de Salidas del Almacen',
			startDate: outputStartDate,
			endDate: outputEndDate,
			onStartDateChange: handleOutputStartDate,
			onEndDateChange: handleOutputEndDate,
			onGenerateReport: handleGenerateOutputReport,
		},
	];

	return (
		<Box p={2}>
			<Grid container spacing={10} mt={1} mb={2} justifyContent="center">
				{reports.map((report, index) => (
					<Grid item xs={12} sm={6} md={4} lg={3} key={index}>
						<Paper elevation={3} sx={{ p: 4 }}>
							<Typography
								variant="h5"
								component="h2"
								sx={{
									fontWeight: 'bold',
									mb: 2,
									pb: 2,
									textAlign: 'left',
								}}
							>
								{report.title}
							</Typography>
							<Box
								sx={{
									mt: 2,
									display: 'flex',
									justifyContent: 'center',
								}}
							>
								<Grid container spacing={2} alignItems="center">
									<Grid item xs={12} sm={4}>
										<LocalizationProvider
											dateAdapter={AdapterDayjs}
										>
											<DatePicker
												label="Fecha Inicio"
												value={report.startDate}
												onChange={
													report.onStartDateChange
												}
												fullWidth
											/>
										</LocalizationProvider>
									</Grid>
									<Grid item xs={12} sm={4}>
										<LocalizationProvider
											dateAdapter={AdapterDayjs}
										>
											<DatePicker
												label="Fecha Fin"
												value={report.endDate}
												onChange={
													report.onEndDateChange
												}
												fullWidth
											/>
										</LocalizationProvider>
									</Grid>
									<Grid
										item
										xs={12}
										sm={4}
										sx={{
											display: 'flex',
											justifyContent: 'center',
										}}
									>
										<Button
											onClick={report.onGenerateReport}
											variant="contained"
											style={{
												textTransform: 'none',
												width: '150px',
											}}
											disabled={
												!report.startDate ||
												!report.endDate
											}
										>
											Generar Reporte
										</Button>
									</Grid>
								</Grid>
							</Box>
						</Paper>
					</Grid>
				))}
			</Grid>
		</Box>
	);
};

export default ReportList;
