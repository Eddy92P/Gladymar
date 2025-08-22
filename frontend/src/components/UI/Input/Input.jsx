import React, { useRef, useImperativeHandle, Fragment } from 'react';

import classes from './Input.module.css';

import Form from 'react-bootstrap/Form';

// eslint-disable-next-line react/display-name
const Input = React.forwardRef((props, ref) => {
    const inputRef = useRef();

    const activate = () => {
        inputRef.current.focus();
    };

    useImperativeHandle(ref, () => {
        return {
            focus: activate,
        };
    });

    let feedbackText;
    if (props.isValid === false) {
        feedbackText = (
            <Form.Text className={classes['invalid-text']}>
                {props.feedbackText}
            </Form.Text>
        );
    }

    return (
        <Fragment>
            <Form.Group
                className={`${classes.control} ${
                    props.isValid === false ? classes.invalid : ''
                } mb-3`}
            >
                <Form.Label htmlFor={props.id}>{props.label}</Form.Label>
                <Form.Control
                    ref={inputRef}
                    id={props.id}
                    type={props.type}
                    value={props.value}
                    placeholder={props.placeholder}
                    onChange={props.onChange}
                    onBlur={props.onBlur}
                    disabled={props.disabled}
                />
                {props.helpText && (
                    <Form.Text className="text-muted">
                        {props.helpText}
                    </Form.Text>
                )}
                {feedbackText}
            </Form.Group>
        </Fragment>
    );
});

export default Input;
