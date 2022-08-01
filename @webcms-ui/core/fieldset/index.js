import React from 'react'
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles((theme) => ({
    root: {
        border: `1px solid rgba(0, 0, 0, 0.23)`,
        padding: '8px 14px',
        borderRadius: '4px'
    },
}))

export default function Fieldset(props) {
    const classes = useStyles()
    const { children, className, style } = props

    return(
        <fieldset className={className || classes.root} style={style || null}>
            {children}
        </fieldset>
    )
}