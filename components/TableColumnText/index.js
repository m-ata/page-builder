import React, { useState, useRef } from 'react';
import {
    Typography
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {CustomToolTip} from "../user-portal/components/CustomToolTip/CustomToolTip";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
    root: props => ({
        overflow: 'hidden',
        fontSize: props?.fontSize || 'inherit',
        fontWeight: props?.fontWeight || '500',
        textTransform: props?.textTransform || 'none',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        textAlign: props.textAlign,
        maxWidth: props?.maxWidth > 0 ? props.maxWidth : 'unset',
        minWidth: props?.minWidth > 0 ? props.minWidth : 'unset'
    })

}))


function TableColumnText(props) {

    //props
    const { maxWidth, minWidth, textAlign, showToolTip, fontSize, fontWeight, textTransform } = props

    //getStyle
    const classes = useStyles({maxWidth, minWidth, textAlign, fontSize, fontWeight, textTransform});

    //state
    const [open, setOpen] = useState(false);

    //ref
    const ref = useRef()


    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        if(showToolTip && ref?.current?.scrollWidth > ref?.current?.offsetWidth) {
            setOpen(true);
        }
    };

    return(
        <CustomToolTip open={open} onClose={handleClose} onOpen={handleOpen} title={props.children || ''}>
            <Typography className={classes.root} ref={ref}>{props.children}</Typography>
        </CustomToolTip>
    )
}

export default TableColumnText;

TableColumnText.defaultProps = {
    showToolTip: false,
    minWidth: 100,
    textAlign: 'left'
}

TableColumnText.propTypes = {
    showToolTip: PropTypes.bool,
    maxWidth: PropTypes.number,
    minWidth: PropTypes.number,
    textAlign: PropTypes.string,
    fontSize: PropTypes.any,
    fontWeight: PropTypes.any,
    textTransform: PropTypes.string
}