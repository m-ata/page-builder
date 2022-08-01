import React from 'react'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

export default function useWidth() {
    const theme = useTheme();
    const keys = [...theme.breakpoints.keys].reverse();
    return (
        keys.reduce((output, key) => {
            const matches = useMediaQuery(theme.breakpoints.only(key));
            return !output && matches ? key : output;
        }, null) || 'xs'
    );
}