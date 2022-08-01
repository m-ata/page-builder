import React, { useContext, useState } from 'react'
import axios from 'axios'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import { pushToState, setToState, updateState } from 'state/actions'
import { connect } from 'react-redux'
import 'regenerator-runtime/runtime'
import { DropzoneArea } from 'material-ui-dropzone'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import useNotifications from 'model/notification/useNotifications'
import { FIELDTYPE, isErrorMsg, OREST_ENDPOINT, OREST_UPLOAD } from 'model/orest/constants'
import { Insert, ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import useTranslation from '../../../../../../lib/translations/hooks/useTranslation'

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
}))

const NewHcmItemVid = (props) => {
    const { t } = useTranslation()
    const cls = useStyles()
    const { setToState, pushToState, updateState, state, groupIndex, hcmItemID, categoryID, orderCount } = props
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const [imageFiles, setImageFiles] = useState([])
    const [stateDialog, setStateDialog] = useState(false)
    const { showSuccess, showError } = useNotifications()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const changeFiles = (e) => {
        setImageFiles(e)
    }

    const openDialog = () => {
        setStateDialog(true)
    }

    const closeDialog = () => {
        setStateDialog(false)
    }

    const VideoUpload = (apiUrl, endPoint, token, masterID, file) => {
        const url = apiUrl + '/' + endPoint + OREST_UPLOAD
        let binaryData = []
        binaryData.push(file)
        let formData = new FormData()
        formData.append('file', new Blob(binaryData, { type: file.type }), file.name)

        const options = {
            url: url,
            method: 'post',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
            params: {
                orsactive: true,
                masterid: masterID,
            },
            data: formData,
        }

        return axios(options)
            .then((response) => {
                return response
            })
            .catch((error) => {
                return error.response || { status: 0 }
            })
    }

    function asyncUpload(file, itemTreated, callback) {
        setTimeout(() => {
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMVID,
                token,
                data: {
                    itemid: hcmItemID,
                    catid: categoryID,
                    vidtype: FIELDTYPE.VID,
                    orderno: itemTreated,
                    langid: 1,
                    hotelrefno: Number(companyId),
                },
            }).then((r1) => {
                if (r1.status === 200) {
                    VideoUpload(GENERAL_SETTINGS.OREST_URL, OREST_ENDPOINT.RAFILE, token, r1.data.data.mid, file).then(
                        (r) => {
                            if (r.status === 200) {
                                callback()
                            } else {
                                callback()
                            }
                        }
                    )
                } else {
                    callback()
                }
            })
        }, 100)
    }

    const uploadFiles = () => {
        updateState('registerStepper', 'backDropStatus', true)
        let itemTreated = orderCount
        let requests = imageFiles.map((file, fileIndex) => {
            return new Promise((resolve) => {
                asyncUpload(file, itemTreated, resolve)
                itemTreated++
            })
        })

        Promise.all(requests).then(() => {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMVID,
                token: token,
                params: {
                    query: `catid:${categoryID}`,
                    sort: 'orderno',
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                if (res.status === 200) {
                    updateState('registerStepper', 'backDropStatus', false)
                    showSuccess('Success')
                    setToState(
                        'registerStepper',
                        ['hcmItemVidCategory', String(groupIndex), 'hcmItemVidItems'],
                        res.data.data
                    )
                    closeDialog()
                } else {
                    updateState('registerStepper', 'backDropStatus', false)
                    const retErr = isErrorMsg(res)
                    showError(retErr.errorMsg)
                    closeDialog()
                }
            })
        })
    }

    return (
        <React.Fragment>
            <Tooltip
                style={{ verticalAlign: 'super', marginRight: 4, marginLeft: 10, marginTop: -2 }}
                title="Video Upload"
            >
                <span>
                    <IconButton onClick={openDialog} size={'small'}>
                        <CloudUploadIcon fontSize={'default'} />
                    </IconButton>
                </span>
            </Tooltip>
            <Dialog open={stateDialog} onClose={closeDialog} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">{t('str_videoUpload')}</DialogTitle>
                <DialogContent>
                    <DropzoneArea
                        onChange={changeFiles}
                        acceptedFiles={['video/mp4']}
                        showPreviews={false}
                        maxFileSize={5000000}
                        filesLimit={1}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">
                        {t('str_cancel')}
                    </Button>
                    <Button onClick={uploadFiles} color="primary">
                        {t('str_upload')}
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

export default connect(mapStateToProps, mapDispatchToProps)(NewHcmItemVid)
