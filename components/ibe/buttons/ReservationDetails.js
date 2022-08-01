import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Popper from '@material-ui/core/Popper'
import Button from '@material-ui/core/Button'
import MenuIcon from '@material-ui/icons/Menu'
import useTranslation from 'lib/translations/hooks/useTranslation'

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

export default function ReservationPopover() {
    const { t } = useTranslation()
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
            <Button color="inherit" onClick={handleClick} className={classes.rdbutton} startIcon={<MenuIcon />}>
                {t('str_reservationDetails')}
            </Button>
            <Popper
                open={open}
                anchorEl={anchorEl}
                placement="bottom"
                transition
                style={{ zIndex: 9999, width: '220px', left: '-35px' }}
            >
                <img
                    src="/imgs/details.png"
                    style={{
                        position: 'relative',
                        left: '-53px',
                        boxShadow:
                            '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
                    }}
                />
                {/*     {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Paper>

                            <div style={{padding: "20px 20px 20px 20px"}}>
                                <Grid container spacing={1}>

                                    <Grid item xs={12}>
                                        <FormControl variant="outlined" className={classes.formControl}>
                                            <InputLabel ref={inputLabel} id="demo-simple-select-outlined-label">
                                                Language
                                            </InputLabel>
                                            <Select
                                                labelId="demo-simple-select-outlined-label"
                                                id="demo-simple-select-outlined"
                                                value={age}
                                                onChange={handleChange}
                                                labelWidth={labelWidth}
                                            >
                                                <MenuItem value="">
                                                    <em>None</em>
                                                </MenuItem>
                                                <MenuItem value={10}>Ten</MenuItem>
                                                <MenuItem value={20}>Twenty</MenuItem>
                                                <MenuItem value={30}>Thirty</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} style={{marginTop: 10}}>

                                    </Grid>
                                    <Grid item xs={12} style={{marginTop: 5}}>
                                        <Button startIcon={<SaveIcon />} color="primary" variant="contained" size="small" onClick={handleClick}>Save</Button>
                                    </Grid>
                                </Grid>
                            </div>

                        </Paper>
                    </Fade>
                )}*/}
            </Popper>
        </React.Fragment>
    )
}
