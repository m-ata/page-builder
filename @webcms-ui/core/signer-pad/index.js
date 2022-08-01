import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
} from '@material-ui/core'
import { Edit, Visibility } from '@material-ui/icons'
import SignatureCanvas from 'react-signature-canvas'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import { useSnackbar } from 'notistack'
import { Delete, Upload, ViewList } from '@webcms/orest'
import { dataURLtoFile, OREST_ENDPOINT } from 'model/orest/constants'

const FileViewer = ({label, open, handleClose, fileUrl, closeButtonText}) => {
    return (
        <Dialog fullWidth={true} maxWidth="xs" open={open} onClose={handleClose}>
            <DialogTitle>{label}</DialogTitle>
            <DialogContent dividers>
                {fileUrl ? <img src={fileUrl} style={{ width:'100%' }} />: 'Not file'}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    {closeButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const SignerPadDialog = ({disabled, label, open, handleClose, onCallback, saveButtonText, closeButtonText}) => {
    const { t } = useTranslation()
    const [trimmedDataURL, setTrimmedDataURL] = useState(null)
    const [sigPad, setSigPad] = useState(false)

    useEffect(() => {
        if(typeof onCallback === "function"){
            onCallback(trimmedDataURL)
        }
    }, [trimmedDataURL])

    const handleSave = () => {
        setTrimmedDataURL(sigPad.getTrimmedCanvas().toDataURL('image/png'))
    }

    const handleClear = () => {
        sigPad.clear()
    }

    return (
        <Dialog fullWidth={true} maxWidth="xs" open={open} onClose={handleClose}>
            <DialogTitle id="max-width-dialog-title">{label}</DialogTitle>
            <DialogContent dividers>
                <SignatureCanvas
                    ref={(ref) => setSigPad(ref)}
                    penColor='black'
                    canvasProps={{
                        width: 350,
                        height: 200,
                        style: {
                            border: '1px dashed #2196F3',
                            margin: '0 auto',
                            display: 'block',
                        }, className: 'sigCanvas',
                    }} />
                <Button disabled={disabled} style={{ position: 'relative', top: 5, left: 22 }} variant="contained" color="primary" onClick={()=> handleClear()} disableElevation>
                    {t('str_clear')}
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary" disabled={disabled}>
                    {closeButtonText}
                </Button>
                <Button onClick={() => handleSave()} color="primary" disabled={disabled}>
                    {saveButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const SignerPad = ({ id, name, label, required, disabled, fullWidth, size, variant, error, helperText, optionLabel, optionKey, defValue, trgQueryKey, onUpdateCallBack }) => {
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()
    const useToken = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false)
    const [ openSignerPadDialog, setOpenSignerPadDialog ] = useState(false)
    const [ openViewerDialog, setOpenViewerDialog ] = useState(false)
    const [ fileUrl, setFileUrl ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)

    const getIsFileExists = (code, mid) => {
        return ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: useToken,
            params: {
                query: `code::${code},masterid::${mid}`,
                limit: 1,
                allhotels: true,
            },
        }).then((rafileViewListResponse) => {
            if (rafileViewListResponse.status === 200 && rafileViewListResponse?.data?.data.length > 0) {
                return rafileViewListResponse.data.data[0]
            } else {
                return false
            }
        }).catch(() => {
            return false
        })
    }

    const handleFileUpload = async (useFile) => {
        const fileUpload = (code, mid, trgQueryKey, file) => {
            const signFile = dataURLtoFile(file, `${optionLabel}-${mid}.png`)
            return Upload({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                token: useToken,
                params: {
                    code: code,
                    masterid: mid,
                    orsactive: true,
                    hotelrefno: trgQueryKey
                },
                files: [signFile],
            }).then((fileUploadResponse) => {
                if (fileUploadResponse.status === 200 && fileUploadResponse.data.count > 0) {
                    return fileUploadResponse.data.data.url.replace('/var/otello', '').replace('/public', '')
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const fileDelete = (gid, hotelrefno) => {
            return Delete({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token: useToken,
                gid: gid,
                params: {
                    hotelrefno: hotelrefno,
                },
            }).then((rafileDeleteResponse) => {
                return rafileDeleteResponse.status === 200
            }).catch(() => {
                return false
            })
        }

        setIsLoading(true)
        const fileIsExists = await getIsFileExists(optionKey, defValue)
        if(fileIsExists){
            await fileDelete(fileIsExists.gid, fileIsExists.hotelrefno)
        }

        const fileIsUpload = await fileUpload(optionKey, defValue, trgQueryKey, useFile)
        if(fileIsUpload){
            onUpdateCallBack()
            enqueueSnackbar(t('str_fileSuccessfullyUploaded'), { variant: 'info' })
            setOpenSignerPadDialog(false)
        }else{
            onUpdateCallBack()
            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'info' })
        }
        setIsLoading(false)
    }

    const handleOpenFile = async () => {
        const fileIsExists = await getIsFileExists(optionKey, defValue)
        if(fileIsExists){
            setFileUrl(GENERAL_SETTINGS.STATIC_URL + fileIsExists.url.replace('/var/otello', '').replace('/public', ''))
            setOpenViewerDialog(true)
        }else {
            enqueueSnackbar(t('str_fileDoesntExist'), { variant: 'info' })
        }
    }

    return (
        <React.Fragment>
            <TextField
                id={id}
                name={name}
                label={label}
                required={required}
                disabled={disabled}
                fullWidth={fullWidth}
                size={size}
                variant={variant}
                error={error}
                helperText={helperText}
                InputLabelProps={{
                    shrink: false,
                }}
                InputProps={{
                    readOnly: true,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton title={t('str_upload')} disabled={disabled} onClick={()=> setOpenSignerPadDialog(true)}>
                                <Edit />
                            </IconButton>
                            <IconButton title={t('str_view')} disabled={disabled} onClick={() => handleOpenFile()}>
                                <Visibility />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <SignerPadDialog
                disabled={isLoading}
                label={label}
                saveButtonText={t('str_save')}
                closeButtonText={t('str_close')}
                open={openSignerPadDialog}
                handleClose={()=> setOpenSignerPadDialog(false)}
                onCallback={(useFile) => useFile && handleFileUpload(useFile)}
            />
            <FileViewer
                label={label}
                closeButtonText={t('str_close')}
                open={openViewerDialog}
                fileUrl={fileUrl}
                handleClose={()=> setOpenViewerDialog(false)}
            />
        </React.Fragment>
    )
}

export default SignerPad