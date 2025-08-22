import Form from 'react-bootstrap/Form';
import classes from './Filtrado.module.css';

const Filtrado = ({ filterText, onFilter }) => {
    return (
        <Form.Control
            id="filtro"
            placeholder="Buscar"
            type="text"
            className={classes.input}
            value={filterText}
            onChange={onFilter}
        />
    );
};

export default Filtrado;
