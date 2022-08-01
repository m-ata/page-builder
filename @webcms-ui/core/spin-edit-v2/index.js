import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { IconButton, Typography } from '@material-ui/core'
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center'
    },
    title: {
        paddingRight: '16px'
    },
    valueText: {
        padding: '0 8px'
    }
}))

export default function SpinEditV2(props) {
    const classes = useStyles()

    const  {label, max, min, defaultValue, size, onChange, disabled} = props;
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])

    const handleOnChange = (type) => {
        let res = value
        if(type === 'inc') {
            if(max > value) {
                setValue(value + 1);
                res = value + 1
            }
        } else if(type === 'dec') {
            if(value > min) {
                setValue(value - 1);
                res = value -1
            }
            if(value > max) {
                setValue(max);
                res = max
            }
        }
        if(typeof onChange === 'function') onChange(res)
    }

    return (
        <div className={classes.root}>
            <Typography className={classes.title}>{label}</Typography>
            <IconButton
                disabled={disabled || value <= min}
                color={'primary'}
                size={size || 'medium'}
                variant={'outlined'}
                onClick={() => handleOnChange('dec')}
            >
                <RemoveCircleOutlineIcon />
            </IconButton>
            <Typography className={classes.valueText}>{value}</Typography>
            <IconButton
                disabled={disabled || value >= max}
                color={'primary'}
                size={size || 'medium'}
                variant={'outlined'}
                onClick={() => handleOnChange('inc')}
            >
                <AddCircleOutlineOutlinedIcon />
            </IconButton>
        </div>
    );
}

SpinEditV2.defaultProps = {
    label: '',
    max: 99,
    min: 1,
    defaultValue: 1,
    size: "medium",
}

SpinEditV2.propTypes = {
    onChange: PropTypes.func,
    label: PropTypes.string,
    max: PropTypes.number,
    min: PropTypes.number,
    defaultValue: PropTypes.number,
    size: PropTypes.string,
}
