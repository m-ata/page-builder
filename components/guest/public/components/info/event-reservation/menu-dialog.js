import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import { Container, Paper } from '@material-ui/core'
import EventMenuList from './event-menu-list'

const useStyles = makeStyles((theme) => ({
    appBar: {
        position: 'relative',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
        [theme.breakpoints.only('md')]: {
            fontSize: 15,
        },
        [theme.breakpoints.only('sm')]: {
            fontSize: 14,
        },
        [theme.breakpoints.only('xs')]: {
            fontSize: 13,
        },
    },
}))

export default function MenuDialog(props) {
    const classes = useStyles()
    const { eventLocData, isOpen, onClose } = props

    const handleCloseMenu = () => {
        onClose(false)
    }

    return (
        <React.Fragment>
            <Dialog fullScreen open={isOpen} onClose={handleCloseMenu}>
                <AppBar color="default" className={classes.appBar}>
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            {eventLocData && eventLocData.locdesc}
                        </Typography>
                        <IconButton edge="end" color="inherit" onClick={handleCloseMenu} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <DialogContent dividers style={{ backgroundColor: '#f1f1f1' }}>
                    <Container maxWidth="md">
                        <Paper>
                            <EventMenuList departId={eventLocData.locdepartid} isAddActive={false} />
                        </Paper>
                    </Container>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    )
}
