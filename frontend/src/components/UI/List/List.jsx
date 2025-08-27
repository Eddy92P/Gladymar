import { Fragment, useState, useMemo, useEffect } from 'react';

import classes from './List.module.css';

import DataTable from 'react-data-table-component';

import Filter from './Filter';

const List = props => {
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
					persistTableHead
				/>
			</div>
		</Fragment>
	);
};

export default List;
