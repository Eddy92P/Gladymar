import classes from './Button.module.css';
import Spinner from 'react-bootstrap/Spinner';

const Button = props => {
    return (
        <button
            type={props.type || 'button'}
            className={`${classes.button} ${props.className}`}
            onClick={props.onClick}
            disabled={props.disabled}
        >
            {props.isLoading && (
                <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                />
            )}
            {props.children}
        </button>
    );
};

export default Button;
