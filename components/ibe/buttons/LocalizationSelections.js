import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LocaleSwitcher from 'components/LocaleSwitcher'

const useStyles = makeStyles((theme) => ({
    typography: {
        padding: theme.spacing(2),
    },
    rdbutton: {
        marginRight: 10,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}))

export default function LocalizationPopover() {
    const classes = useStyles()
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [open, setOpen] = React.useState(false)

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
        let setStatus = open === false ? true : false
        setOpen(setStatus)
    }

    const [age, setAge] = React.useState('')

    const inputLabel = React.useRef(null)
    const [labelWidth, setLabelWidth] = React.useState(200)

    const handleChange = (event) => {
        setAge(event.target.value)
    }

    return (
        <React.Fragment>
            <LocaleSwitcher />
        </React.Fragment>
    )
}
