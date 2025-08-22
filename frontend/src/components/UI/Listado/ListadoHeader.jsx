import Button from 'react-bootstrap/Button';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import classes from './ListadoHeader.module.css';

const ListadoHeader = props => {
    return (
        <div className={classes.headerContainer}>
            <div className={classes.headerTitle}>{props.title}</div>
            <div>
                {props.visible && (
                    <Button variant="primary" onClick={props.onClick}>
                        <AddCircleOutlineIcon /> {props.text}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ListadoHeader;
