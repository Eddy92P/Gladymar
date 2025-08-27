import { useState } from 'react';

import Form from 'react-bootstrap/Form';

import classes from './Filter.module.css';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

const ClientFilter = props => {
	const [value, setValue] = useState(props.choices?.[0]?.value || '');

	const handleChange = (event, newValue) => {
		setValue(newValue);

		if (props.onTabChange) {
			props.onTabChange(newValue);
		}
	};

	const handleKeyDown = e => {
		if (e.key === 'Enter') {
			props.onFilter(e);
		}
	};

	return (
		<>
			<Box
				sx={{
					width: '100%',
					marginBottom: 3,
					borderColor: 'divider',
					borderBottom: 1,
				}}
			>
				<Tabs
					value={value}
					onChange={handleChange}
					aria-label="choices-tabs"
					sx={{
						'& .MuiTabs-indicator': {
							backgroundColor: '#74353c',
						},
					}}
				>
					{props.choices?.map((choice, index) => (
						<Tab
							key={choice.value || index}
							value={choice.value}
							label={choice.label}
						/>
					))}
				</Tabs>
			</Box>
			<Form.Control
				id="filtro"
				placeholder="Buscar"
				type="text"
				className={classes.input}
				onKeyDown={handleKeyDown}
			/>
		</>
	);
};

export default ClientFilter;
