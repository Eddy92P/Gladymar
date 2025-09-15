import {
	Dialog,
	DialogContentText,
	DialogTitle,
	DialogContent,
	Box,
} from '@mui/material';
import React, { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiClose } from '@mdi/js';
import { makeStyles } from '@mui/styles';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
	closeIcon: {
		display: 'flex',
		justifyContent: 'end',
	},
	checkIcon: {
		color: '#127FE6',
	},
	icons: {
		display: 'flex',
		justifyContent: 'center',
	},
});

function AddSaleModal(props) {
	const classes = useStyles();
	const [open, setOpen] = useState(true);
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
	const [descriptionText, setDescriptionText] = useState('');
	const [messageText, setMessageText] = useState('');
	const navigate = useNavigate();

	const handleClose = () => {
		setOpen(false);
		navigate(-1);
	};
	useEffect(() => {
		setDescriptionText('registrada');
		setMessageText(' La venta fue registrada exitosamente.');
	}, [props]);
	return (
		<Dialog onClose={handleClose} open={open} fullScreen={fullScreen}>
			<Box className={classes.closeIcon} m={2}>
				<Icon path={mdiClose} size={1} onClick={handleClose} />
			</Box>
			<Box className={classes.icons}>
				<Icon
					path={mdiCheckCircle}
					size={5}
					className={classes.checkIcon}
				/>
			</Box>
			<DialogTitle style={{ textAlign: 'center' }}>
				Venta {descriptionText} exitosamente.
			</DialogTitle>
			<DialogContent>
				<DialogContentText
					style={{ minWidth: '497px', textAlign: 'center' }}
				>
					{messageText}
				</DialogContentText>
			</DialogContent>
		</Dialog>
	);
}
export default AddSaleModal;
