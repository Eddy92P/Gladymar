import classes from './AuthFormMessage.module.css';

import CloseButton from 'react-bootstrap/CloseButton';

const AuthFormMessage = props => {
    return (
        <div className={classes.authMessage}>
            {props.message}{' '}
            <CloseButton
                style={{ float: 'right', width: '3px' }}
                onClick={props.onShowMessage}
            />
        </div>
    );
};

export default AuthFormMessage;
