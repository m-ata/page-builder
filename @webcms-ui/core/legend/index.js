import React from 'react'
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles((theme) => ({
    root: {
        padding: '0 4px',
        marginLeft: '4px',
        marginBottom: '0',
        fontSize: '14px',
        width: 'unset'
    }
}))

export default function Legend(props) {
    const classes = useStyles()
    const { children, className, style } = props

    return(
        <legend className={className || classes.root} style={style || null}>
            {children}
        </legend>
    )
}