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
	const buyExcelUrl = `${API}${api.BUY_REPORT_EXCEL_URL}`;
	const sellExcelUrl = `${API}${api.SALE_REPORT_EXCEL_URL}`;
	const entryExcelUrl = `${API}${api.ENTRY_REPORT_EXCEL_URL}`;
	const outputExcelUrl = `${API}${api.OUTPUT_REPORT_EXCEL_URL}`;
	const inventoryUrl = `${API}${api.INVENTORY_REPORT_PDF_URL}`;
	const inventoryExcelUrl = `${API}${api.INVENTORY_REPORT_EXCEL_URL}`;

	const [buyStartDate, setBuyStartDate] = useState(null);
	const [buyEndDate, setBuyEndDate] = useState(null);
	const [sellStartDate, setSellStartDate] = useState(null);
	const [sellEndDate, setSellEndDate] = useState(null);
	const [entryStartDate, setEntryStartDate] = useState(null);
	const [entryEndDate, setEntryEndDate] = useState(null);
	const [outputStartDate, setOutputStartDate] = useState(null);
	const [outputEndDate, setOutputEndDate] = useState(null);

	const formattedBuyStartDate = buyStartDate
		? buyStartDate.format('YYYY-MM-DD')
		: null;
	const formattedBuyEndDate = buyEndDate
		? buyEndDate.format('YYYY-MM-DD')
		: null;
	const formattedSellStartDate = sellStartDate
		? sellStartDate.format('YYYY-MM-DD')
		: null;
	const formattedSellEndDate = sellEndDate
		? sellEndDate.format('YYYY-MM-DD')
		: null;
	const formattedEntryStartDate = entryStartDate
		? entryStartDate.format('YYYY-MM-DD')
		: null;
	const formattedEntryEndDate = entryEndDate
		? entryEndDate.format('YYYY-MM-DD')
		: null;
	const formattedOutputStartDate = outputStartDate
		? outputStartDate.format('YYYY-MM-DD')
		: null;
	const formattedOutputEndDate = outputEndDate
		? outputEndDate.format('YYYY-MM-DD')
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

	const handleGenerateInventoryReport = e => {
		e.preventDefault();
		const fullUrl = `${inventoryUrl}`;
		window.open(fullUrl, '_blank');
	};

	const handleGenerateInventoryReportExcel = e => {
		e.preventDefault();
		const fullUrl = `${inventoryExcelUrl}`;
		window.open(fullUrl, '_blank');
	};

	const handleGenerateBuyReportExcel = e => {
		e.preventDefault();
		const fullUrl = `${buyExcelUrl}?start_date=${formattedBuyStartDate}&end_date=${formattedBuyEndDate}`;
		window.open(fullUrl, '_blank');
		setBuyStartDate(null);
		setBuyEndDate(null);
	};

	const handleGenerateSellReportExcel = e => {
		e.preventDefault();
		const fullUrl = `${sellExcelUrl}?start_date=${formattedSellStartDate}&end_date=${formattedSellEndDate}`;
		window.open(fullUrl, '_blank');
		setSellStartDate(null);
		setSellEndDate(null);
	};

	const handleGenerateEntryReportExcel = e => {
		e.preventDefault();
		const fullUrl = `${entryExcelUrl}?start_date=${formattedEntryStartDate}&end_date=${formattedEntryEndDate}`;
		window.open(fullUrl, '_blank');
		setEntryStartDate(null);
		setEntryEndDate(null);
	};

	const handleGenerateOutputReportExcel = e => {
		e.preventDefault();
		const fullUrl = `${outputExcelUrl}?start_date=${formattedOutputStartDate}&end_date=${formattedOutputEndDate}`;
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
			onGenerateReportExcel: handleGenerateBuyReportExcel,
		},
		{
			title: 'Reporte de Ventas',
			startDate: sellStartDate,
			endDate: sellEndDate,
			onStartDateChange: handleSellStartDate,
			onEndDateChange: handleSellEndDate,
			onGenerateReport: handleGenerateSellReport,
			onGenerateReportExcel: handleGenerateSellReportExcel,
		},
		{
			title: 'Reporte de Entradas al Almacen',
			startDate: entryStartDate,
			endDate: entryEndDate,
			onStartDateChange: handleEntryStartDate,
			onEndDateChange: handleEntryEndDate,
			onGenerateReport: handleGenerateEntryReport,
			onGenerateReportExcel: handleGenerateEntryReportExcel,
		},
		{
			title: 'Reporte de Salidas del Almacen',
			startDate: outputStartDate,
			endDate: outputEndDate,
			onStartDateChange: handleOutputStartDate,
			onEndDateChange: handleOutputEndDate,
			onGenerateReport: handleGenerateOutputReport,
			onGenerateReportExcel: handleGenerateOutputReportExcel,
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
											flexDirection: 'column',
											justifyContent: 'center',
											gap: 2,
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
										<Button
											color="success"
											onClick={
												report.onGenerateReportExcel
											}
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
											Generar Reporte en Excel
										</Button>
									</Grid>
								</Grid>
							</Box>
						</Paper>
					</Grid>
				))}
				<Grid item xs={12} sm={6} md={4} lg={3}>
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
							Reporte de Inventario Total
						</Typography>
						<Box
							sx={{
								mt: 2,
								display: 'flex',
								justifyContent: 'center',
								gap: 2,
							}}
						>
							<Button
								onClick={handleGenerateInventoryReport}
								variant="contained"
								style={{
									textTransform: 'none',
									width: '150px',
								}}
							>
								Generar Reporte
							</Button>
							<Button
								color="success"
								onClick={handleGenerateInventoryReportExcel}
								variant="contained"
								style={{
									textTransform: 'none',
									width: '150px',
								}}
							>
								Generar Reporte en Excel
							</Button>
						</Box>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ReportList;
