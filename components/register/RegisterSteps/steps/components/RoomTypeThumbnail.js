import React, { useContext, useEffect, useState } from 'react'
import { Delete, Insert, Upload, ViewList } from '@webcms/orest'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from '../../../../../state/actions'
import { connect } from 'react-redux'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import useNotifications from '../../../../../model/notification/useNotifications'
import Grid from '@material-ui/core/Grid'
import { FIELDTYPE, isErrorMsg, OREST_ENDPOINT } from '../../../../../model/orest/constants'
import Image from 'next/image'
import WebCmsGlobal from 'components/webcms-global'
import ImageIcon from '@material-ui/icons/Image'
import { DropzoneArea } from 'material-ui-dropzone'
import CircularProgress from '@material-ui/core/CircularProgress'
import { green } from '@material-ui/core/colors'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        height: '100%',
        maxHeight: '365px',
    },
    extendedIcon: {
        marginRight: theme.spacing(1),
    },
    wrapper: {
        position: 'relative',
    },
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    space50: {
        display: 'block',
        marginTop: 20,
        marginBottom: 20,
    },
}))

const RoomTypeThumbnail = (props) => {
    const { t } = useTranslation()
    const cls = useStyles()
    const { state, roomTypeIndex, setToState } = props
    const { showSuccess, showError } = useNotifications()
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [open, setOpen] = useState(false)
    const [isDelete, setIsDelete] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [roomTypeImg, setRoomTypeImg] = useState('')
    const [roomTypeImgGid, setRoomTypeImgGid] = useState('')
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const [imageFiles, setImageFiles] = useState(null)

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const setThumb = (mid) => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMIMG,
            token: token,
            params: {
                query: `masterid::${mid},orderno::1`,
                limit: 1,
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200 && res.data.data.length > 0) {
                setRoomTypeImg(res.data.data[0].fileurl)
                setRoomTypeImgGid(res.data.data[0].gid)
            } else {
                setRoomTypeImg(null)
            }
        })
    }

    const handleDelete = () => {
        setIsDelete(true)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMIMG,
            token: token,
            gid: roomTypeImgGid,
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200) {
                setRoomTypeImg('')
                setRoomTypeImgGid('')
                setImageFiles('')
                setIsDelete(false)
            } else {
                setIsDelete(false)
            }
        })
    }

    const handleSave = () => {
        setIsAdding(true)
        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEMIMG,
            token,
            data: {
                itemid: state.hcmItemID,
                imgtype: FIELDTYPE.IMG,
                orderno: 1,
                masterid: state.roomTypes[roomTypeIndex].mid,
                hotelrefno: Number(companyId),
            },
        }).then((r1) => {
            if (r1.status === 200) {
                Upload({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    token,
                    params: {
                        masterid: r1.data.data.mid,
                        orsactive: true,
                        hotelrefno: Number(companyId),
                    },
                    files: imageFiles,
                }).then((r) => {
                    setThumb(state.roomTypes[roomTypeIndex].mid)
                    setIsAdding(false)
                })
            } else {
                setIsAdding(false)
            }
        })
    }

    const changeFiles = (e) => {
        setImageFiles(e)
    }

    useEffect(() => {
        let active = true
        if (active) {
            if (state.hcmItemID === 0 || state.hcmRoomCatID === 0) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEM,
                    token: token,
                    params: {
                        limit: 1,
                        hotelrefno: Number(companyId),
                    },
                }).then((r1) => {
                    if (active) {
                        if (r1.status === 200) {
                            setToState('registerStepper', ['hcmItemID'], r1.data.data[0].id)
                        } else {
                            const retErr = isErrorMsg(r1)
                            showError(retErr.errorMsg)
                        }
                    }
                })
            }

            if (roomTypeImg === '') {
                setThumb(state.roomTypes[roomTypeIndex].mid)
            }
        }

        return () => {
            active = false
        }
    }, [])

    return (
        <React.Fragment>
            <Tooltip style={{ marginLeft: 5, verticalAlign: 'super' }} title="Room Type Thumbnail">
                <span>
                    <IconButton onClick={handleClickOpen} size={'small'}>
                        <ImageIcon fontSize={'small'} />
                    </IconButton>
                </span>
            </Tooltip>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_roomTypeThumbnail')}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={1} style={{ width: 380 }}>
                        <Grid item xs={12}>
                            {roomTypeImg ? (
                                    <Image
                                        src={GENERAL_SETTINGS.STATIC_URL + roomTypeImg}
                                        layout="responsive"
                                        width={700}
                                        height={475}
                                    />
                            ) : (
                                'Thumbnail is not available.'
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            {roomTypeImg ? (
                                <React.Fragment>
                                    <span className={cls.space50}></span>
                                    <div className={cls.wrapper}>
                                        <Button
                                            fullWidth={true}
                                            variant="contained"
                                            color="primary"
                                            onClick={handleDelete}
                                            disabled={isDelete}
                                        >
                                            {t('str_deleteThumbnail')}
                                        </Button>
                                        {isDelete && <CircularProgress size={24} className={cls.buttonProgress} />}
                                    </div>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <DropzoneArea
                                        onChange={changeFiles}
                                        acceptedFiles={['image/jpeg', 'image/png']}
                                        showPreviews={false}
                                        maxFileSize={5000000}
                                        filesLimit={1}
                                    />
                                    <span className={cls.space50}></span>
                                    <div className={cls.wrapper}>
                                        <Button
                                            fullWidth={true}
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSave}
                                            disabled={!imageFiles || isAdding}
                                        >
                                            {t('str_uploadThumbnail')}
                                        </Button>
                                        {isAdding && <CircularProgress size={24} className={cls.buttonProgress} />}
                                    </div>
                                </React.Fragment>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t('str_cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RoomTypeThumbnail)
