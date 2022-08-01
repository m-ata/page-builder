import React from 'react'
import {Button, Dialog, DialogContent, DialogActions, Grid} from "@material-ui/core";
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import LoadingSpinner from "../../../components/LoadingSpinner";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
    dialogContent: {
        padding: 24
    }
}))

const mimeTypes = {
    image: 'image',
    audio: 'audio',
    video: 'video',
    pdf: 'application'
}

export default function MediaViewerDialog(props) {
    const classes = useStyles()
    
    const {open, loading, maxWidth, fullWidth, fileType, url, onClose, t} = props

    const handleOpenNewTab = (url) => {
        if(url) {
            window.open(url, '_blank')
        }
    }

    return(
        <Dialog
            open={open}
            maxWidth={fileType !== mimeTypes.audio ? maxWidth : 'xs'}
            fullWidth={fullWidth}
        >
            <DialogContent className={classes.dialogContent}>
                <Grid container spacing={3}>
                    {
                        loading ? (
                            <Grid item xs={12}>
                                <LoadingSpinner />
                            </Grid>
                        ) : (
                            <React.Fragment>
                                <Grid item xs={12}>
                                    <div style={{textAlign: 'right'}}>
                                        <Button
                                            variant={'contained'}
                                            endIcon={<OpenInNewIcon />}
                                            color={'primary'}
                                            onClick={() => handleOpenNewTab(url)}
                                        >
                                            {t('str_openInNewTab')}
                                        </Button>
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    {
                                        fileType === mimeTypes.video ? (
                                            <video controls>
                                                <source src={url} />
                                            </video>
                                        ) : fileType === mimeTypes.audio ? (
                                            <div style={{textAlign: 'center'}}>
                                                <audio controls>
                                                    <source src={url} />
                                                </audio>
                                            </div>
                                        ) : fileType === mimeTypes.pdf ? (
                                            <iframe style={{minHeight: '50vh'}} width={'100%'} src={url} frameBorder="0" allowFullScreen/>
                                        ) : (
                                            <img src={url} style={{width: '100%'}}/>
                                        )
                                    }
                                </Grid>
                            </React.Fragment>
                        )
                    }
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    color={'primary'}
                    variant={'outlined'}
                    onClick={() => {typeof onClose === 'function' && onClose()}}
                >
                    {t('str_close')}
                </Button>
            </DialogActions>
        </Dialog>
    )
}