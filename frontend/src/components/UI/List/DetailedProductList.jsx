import { Fragment, useState, useMemo, useEffect } from 'react';

import classes from './List.module.css';

import DataTable from 'react-data-table-component';

// MUI Components
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const DetailedProductList = props => {
	const [page, setPage] = useState(0);
	const [pageSize, setPageSize] = useState(5);

	const subHeaderComponentMemo = useMemo(() => {
		return props.filter ? props.filter : null;
	}, [props.filter]);

	useEffect(() => {
		props.onPageChange(page);
		props.onPageSizeChange(pageSize);
	}, [props, props.onPageChange, props.onPageSizeChange, page, pageSize]);

	const paginationComponentOptions = {
		rowsPerPageText: 'Filas por página',
		rangeSeparatorText: 'de',
		selectAllRowsItem: true,
		selectAllRowsItemText: 'Todos',
	};

	const ProductInfo = ({ data }) => {
		if (data.products.length === 0) return null;

		return (
			<TableContainer component={Paper}>
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Código</TableCell>
							<TableCell>Nombre</TableCell>
							{data.products[0].products && (
								<TableCell>Precio</TableCell>
							)}
							{data.products[0].products && (
								<TableCell>Fecha Inicio</TableCell>
							)}
							{data.products[0].products && (
								<TableCell>Fecha Fin</TableCell>
							)}
						</TableRow>
					</TableHead>
					<TableBody>
						{data.products.map((item, rowIndex) => (
							<TableRow key={`row-${rowIndex}`}>
								<TableCell key={`cell-${rowIndex}-1`}>
									{item.products?.code
										? item.products.code
										: item.code}
								</TableCell>
								<TableCell key={`cell-${rowIndex}-2`}>
									{item.products?.name
										? item.products.name
										: item.name}
								</TableCell>
								{item.price && (
									<TableCell key={`cell-${rowIndex}-3`}>
										{item.price}
									</TableCell>
								)}
								{item.start_date !== undefined && (
									<TableCell key={`cell-${rowIndex}-4`}>
										{item.start_date}
									</TableCell>
								)}

								{item.end_date !== undefined && (
									<TableCell key={`cell-${rowIndex}-5`}>
										{item.end_date}
									</TableCell>
								)}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		);
	};

	return (
		<Fragment>
			<div className={classes.listContainer}>
				<DataTable
					columns={props.contentHeader}
					data={props.parsedList}
					pagination
					paginationComponentOptions={paginationComponentOptions}
					paginationTotalRows={props.rowCount}
					paginationServer
					onChangePage={newPage => setPage(newPage)}
					onChangeRowsPerPage={(newSize, newPage) => {
						setPageSize(newSize);
						setPage(newPage);
					}}
					paginationPerPage={pageSize}
					paginationRowsPerPageOptions={[5, 10]}
					subHeader
					subHeaderComponent={subHeaderComponentMemo}
					noDataComponent={
						<div style={{ padding: '20px', textAlign: 'center' }}>
							<h5>No hay registros disponibles</h5>
						</div>
					}
					expandableRows
					expandableRowsComponent={ProductInfo}
					persistTableHead
				/>
			</div>
		</Fragment>
	);
};

export default DetailedProductList;
