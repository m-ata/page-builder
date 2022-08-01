import React from 'react'
import PropTypes from 'prop-types'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/core/styles'
import style from './LoadingSpinner.styles'
const useStyles = makeStyles(style)

function LoadingSpinner({ size, style }) {
    const classes = useStyles()

    return (
        <div className={classes.root} style={{ ...style }}>
            <CircularProgress variant="indeterminate" color={"inherit"} size={size || 80} />
        </div>
    )
}

LoadingSpinner.propTypes = {
    size: PropTypes.number,
}

export default LoadingSpinner
