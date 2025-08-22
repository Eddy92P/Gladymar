import { Fragment, useState, useMemo } from 'react';

import classes from './Listado.module.css';

import DataTable from 'react-data-table-component';

import Filtrado from './Filtrado';

const Listado = props => {
    const [filterText, setFilterText] = useState('');

    const filteredItems = props.parsedList.filter(item => {
        // If no searchable fields provided, search through all object keys
        const fieldsToSearch = props.searchableFields || Object.keys(item);

        // Check if any field exists in the item
        const hasSearchableFields = fieldsToSearch.some(
            field => item[field] !== undefined
        );

        if (!hasSearchableFields) return false;

        // Search through all specified fields
        return fieldsToSearch.some(field => {
            const value = item[field];
            if (value === undefined) return false;

            // Convert to string and search, handle numbers properly
            const stringValue = String(value).toLowerCase();
            return stringValue.includes(filterText.toLowerCase());
        });
    });

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <Filtrado
                onFilter={e => setFilterText(e.target.value)}
                filterText={filterText}
            />
        );
    }, [filterText]);

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
                    data={filteredItems}
                    pagination
                    paginationComponentOptions={paginationComponentOptions}
                    subHeader
                    subHeaderComponent={subHeaderComponentMemo}
                    persistTableHead
                />
            </div>
        </Fragment>
    );
};

export default Listado;
