import React, { useContext, useEffect, useState } from 'react'
import { Grid, Paper, Typography, Fab } from '@material-ui/core'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import { makeStyles } from '@material-ui/core/styles'
import { COLORS } from '../../../../constants'
import { DropzoneDialog } from 'material-ui-dropzone'
import { Upload } from '@webcms/orest'
import { isErrorMsg } from '../../../../../../../model/orest/constants'
import useTranslation from '../../../../../../../lib/translations/hooks/useTranslation'
import WebCmsGlobal from '../../../../../../webcms-global'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import ReactPlayer from 'react-player'
import LoadingSpinner from '../../../../../../LoadingSpinner'

const useStyles = makeStyles((theme) => ({
    root: {
        card: {
            maxWidth: 345,
        },
        media: {
            height: 0,
            paddingTop: '56.25%',
        },
    },
    submit: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        borderRadius: 20,
        marginTop: theme.spacing(1),
        float: 'right',
    },
    fabBtn: {
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(1),
    },
    disableEvent: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
    paperBlock: {
        height: 245,
        border: `2px solid ${COLORS?.secondary}`,
        overflow: 'auto',
        position: 'relative',
    },
    card: {
        height: 245,
        width: 392,
        cursor: 'pointer',
    },
    heading: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(2),
        fontWeight: 'bold',
        fontSize: 15,
    },
    textField: {
        paddingRight: theme.spacing(1),
    },
    alignText: {
        textAlign: 'right',
        color: 'red',
    },
    emptyDiv: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 245,
    },
    defaultUploadBtn: {
        float: 'right',
        marginBottom: 8
    }
}))

const EditVideo = (props) => {
    const { handleCmponent, videoComponent } = props
    const [localState, setLocalState] = useState({
        videoFileUrl: null,
        isOpenDialog: false,
        isRequestSend: false,
        fullVideoUrl: null
    })

    const { videoFileUrl, isOpenDialog, isRequestSend } = localState

    const classes = useStyles()
    //context
    const { t } = useTranslation()
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal)
    const router = useRouter()
    const companyId = router.query.companyID
    const authToken = token || router.query.authToken
    const state = useSelector((state) => state?.formReducer?.pageBuilder)

    useEffect(() => {
        videoComponent && setLocalState((prevState) => ({ ...prevState, videoFileUrl: videoComponent.url, fullVideoUrl: GENERAL_SETTINGS.STATIC_URL + videoComponent.url }))
    }, [videoComponent]);

    useEffect(() => {
        handleCmponent({
            service: 'hcmitemvideo',
            type: 'video',
            url: videoFileUrl,
        })
    }, [videoFileUrl])

    const handlevideoFileUrlUpload = (file) => {
        setLocalState((prevState) => ({ ...prevState, isOpenDialog: false, isRequestSend: true }))
        Upload({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            token: authToken,
            params: {
                masterid: state.hotelMid,
                orsactive: true,
                hotelrefno: Number(companyId),
                quality: '0.1F',
            },
            files: file,
        }).then((r) => {
            if (r.status === 200) {
                let url = r.data.data.url.replace('/var/otello', '').replace('/public', '')
                setLocalState((prevState) => ({ ...prevState, videoFileUrl: url, fullVideoUrl: GENERAL_SETTINGS.STATIC_URL + url, isRequestSend: false }))
                toast.success(t('str_haveBeenUploadedMsg'), {
                    position: toast.POSITION.TOP_RIGHT,
                })
            } else {
                const error = isErrorMsg(r)
                toast.error(t(error.errMsg), {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    if (isRequestSend) {
        return <LoadingSpinner size={50} style={{ color: COLORS.secondary }} />
    }

    return (
        <React.Fragment>
            {videoFileUrl && (
                <Typography component={'div'} className={classes.defaultUploadBtn}>
                    <Fab
                        onClick={() => setLocalState((prevState) => ({ ...prevState, isOpenDialog: true }))}
                        variant="extended"
                        size="small"
                        color="primary"
                        aria-label="add"
                    >
                        <CloudUploadIcon />
                        UPLOAD
                    </Fab>
                </Typography>
            )}
            <Grid container>
                {
                    <Grid item xs={12}>
                        <Paper className={classes.paperBlock}>
                            {videoFileUrl ? (
                                <ReactPlayer
                                    url={GENERAL_SETTINGS.STATIC_URL + videoFileUrl}
                                    width="100%"
                                    height="100%"
                                    controls={true}
                                />
                            ) : (
                                <Typography component={'div'} className={classes.emptyDiv}>
                                    <Fab
                                        onClick={() =>
                                            setLocalState((prevState) => ({ ...prevState, isOpenDialog: true }))
                                        }
                                        variant="extended"
                                        size="small"
                                        color="primary"
                                        aria-label="add"
                                        className={classes.fabBtn}
                                    >
                                        <CloudUploadIcon />
                                        UPLOAD
                                    </Fab>
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                }
            </Grid>
            <DropzoneDialog
                open={isOpenDialog}
                onSave={handlevideoFileUrlUpload}
                acceptedFiles={['video/mp4']}
                showPreviews={true}
                filesLimit={3}
                maxFileSize={200000000}
                onClose={() => setLocalState((prevState) => ({ ...prevState, isOpenDialog: false }))}
                submitButtonText={t('str_save')}
                cancelButtonText={t('str_cancel')}
                dialogTitle={t('str_uploadAFile')}
            />
        </React.Fragment>
    )
}
export default EditVideo
