import { Fragment, useContext, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import classes from './List.module.css';

import DataTable from 'react-data-table-component';
import PaginationContext from '../../../store/pagination-context';

const List = props => {
	const location = useLocation();
	const { getPagination, setPagination } = useContext(PaginationContext);
	const storedPagination = getPagination(location.pathname);

	const page = storedPagination?.page ?? 0;
	const pageSize = storedPagination?.pageSize ?? 5;

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
					onChangePage={newPage =>
						setPagination(location.pathname, { page: newPage })
					}
					onChangeRowsPerPage={(newSize, newPage) => {
						setPagination(location.pathname, {
							pageSize: newSize,
							page: newPage,
						});
					}}
					paginationPerPage={pageSize}
					paginationDefaultPage={page || 1}
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
