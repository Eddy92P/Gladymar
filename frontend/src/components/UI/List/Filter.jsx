import Form from 'react-bootstrap/Form';
import classes from './Filter.module.css';

const Filter = ({ onFilter }) => {
	const handleKeyDown = e => {
		if (e.key === 'Enter') {
			onFilter(e);
		}
	};

	return (
		<Form.Control
			id="filtro"
			placeholder="Buscar"
			type="text"
			className={classes.input}
			onKeyDown={handleKeyDown}
		/>
	);
};

export default Filter;
