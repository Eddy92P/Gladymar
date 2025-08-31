// MUI Components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
	Dialog,
	DialogTitle,
	Box,
	DialogContent,
	IconButton,
	Tooltip,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import Icon from '@mdi/react';

import { styled, useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { mdiClose } from '@mdi/js';

// Styled components defined outside the component
const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: '#74353c',
		color: theme.palette.common.white,
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
	},
}));

const StyledDialog = styled(Dialog)({
	'& .MuiDialog-paper': {
		padding: '32px',
	},
});

const TableList = ({ data, open: externalOpen, onClose, filterComponent }) => {
	const [open, setOpen] = useState(externalOpen || false);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

	// Sync with external open state
	useEffect(() => {
		if (externalOpen !== undefined) {
			setOpen(externalOpen);
		}
	}, [externalOpen]);

	const handleClose = () => {
		setOpen(false);
		if (onClose) {
			onClose();
		}
	};

	// Si no hay datos, mostrar mensaje
	if (!data || data.length === 0) {
		return (
			<StyledDialog
				onClose={handleClose}
				open={open}
				scroll="paper"
				fullScreen={fullScreen}
				maxWidth="lg"
				fullWidth
			>
				<DialogTitle
					sx={{
						m: 0,
						p: 2,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
					id="customized-dialog-title"
				>
					Agregar Productos
					<Icon
						path={mdiClose}
						size={1}
						onClick={handleClose}
						style={{ cursor: 'pointer' }}
					/>
				</DialogTitle>
				<DialogContent dividers>
					{filterComponent && (
						<Box sx={{ mb: 2 }}>{filterComponent}</Box>
					)}
					<TableContainer component={Paper}>
						<Table
							sx={{ minWidth: 650 }}
							aria-label="product table"
						>
							<TableBody>
								<TableRow>
									<TableCell>
										No hay productos disponibles
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</DialogContent>
			</StyledDialog>
		);
	}

	const columns = Object.keys(data[0]);

	return (
		<StyledDialog
			onClose={handleClose}
			open={open}
			scroll="paper"
			fullScreen={fullScreen}
			maxWidth="lg"
			fullWidth
		>
			<DialogTitle
				sx={{
					m: 0,
					p: 2,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
				id="customized-dialog-title"
			>
				Agregar Productos
				<Icon
					path={mdiClose}
					size={1}
					onClick={handleClose}
					style={{ cursor: 'pointer' }}
				/>
			</DialogTitle>
			<DialogContent dividers>
				{filterComponent && <Box sx={{ mb: 2 }}>{filterComponent}</Box>}
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<StyledTableCell>Nombre</StyledTableCell>
								<StyledTableCell>Código</StyledTableCell>
								<StyledTableCell></StyledTableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{data.map((item, rowIndex) => (
								<TableRow key={`row-${rowIndex}`}>
									{columns.map((value, colIndex) => (
										<TableCell
											key={`cell-${rowIndex}-${colIndex}`}
										>
											{item[value]}
										</TableCell>
									))}
									<TableCell align="center">
										<Tooltip
											title="Add Product"
											placement="top"
										>
											<IconButton aria-label="add">
												<AddCircleIcon color="success" />
											</IconButton>
										</Tooltip>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</DialogContent>
		</StyledDialog>
	);
};

export default TableList;
