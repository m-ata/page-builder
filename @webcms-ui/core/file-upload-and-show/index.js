import React, { useContext, useState } from 'react'
import {useSelector} from 'react-redux'
import { IconButton, InputAdornment, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core'
import { CloudUpload, Visibility } from '@material-ui/icons'
import { DropzoneDialog } from 'material-ui-dropzone'
import { Delete, Upload, ViewList } from '@webcms/orest'
import { OREST_ENDPOINT } from 'model/orest/constants'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import { useSnackbar } from 'notistack'

const FileViewer = ({label, open, handleClose, fileUrl, closeButtonText}) => {
    return (
        <Dialog fullWidth={true} maxWidth="xs" open={open} onClose={handleClose}>
            <DialogTitle id="max-width-dialog-title">{label}</DialogTitle>
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

const FileUploadAndShow = ({ id, name, label, required, disabled, fullWidth, size, variant, error, helperText, optionKey, defValue, trgQueryKey }) => {
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { enqueueSnackbar } = useSnackbar()
    const useToken = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false)
    const [ openUploadDialog, setOpenUploadDialog ] = useState(false)
    const [ openViewerDialog, setOpenViewerDialog ] = useState(false)
    const [ fileUrl, setFileUrl ] = useState(false)

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
            return Upload({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                token: useToken,
                params: {
                    code: code,
                    masterid: mid,
                    orsactive: true,
                    hotelrefno: trgQueryKey
                },
                files: file,
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

        const fileIsExists = await getIsFileExists(optionKey, defValue)
        if(fileIsExists){
            await fileDelete(fileIsExists.gid, fileIsExists.hotelrefno)
        }

        const fileIsUpload = await fileUpload(optionKey, defValue, trgQueryKey, useFile)
        if(fileIsUpload){
            enqueueSnackbar(t('str_fileSuccessfullyUploaded'), { variant: 'info' })
            setOpenUploadDialog(false)
        }else{
            enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'info' })
        }
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
                            <IconButton title={t('str_upload')} disabled={disabled} onClick={() => setOpenUploadDialog(true)}>
                                <CloudUpload />
                            </IconButton>
                            <IconButton title={t('str_view')} disabled={disabled} onClick={() => handleOpenFile()}>
                                <Visibility />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <DropzoneDialog
                maxWidth="xs"
                open={openUploadDialog}
                onSave={handleFileUpload}
                acceptedFiles={['image/jpeg', 'image/png']}
                showPreviews={true}
                maxFileSize={5000000}
                filesLimit={1}
                onClose={() => setOpenUploadDialog(false)}
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

export default FileUploadAndShow