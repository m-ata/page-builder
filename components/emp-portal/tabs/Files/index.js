import React, {useState, useEffect, useContext} from 'react';
import {Insert, UseOrest, ViewList, Patch, Delete, Upload} from "@webcms/orest";
import WebCmsGlobal from "../../../webcms-global";
import {useSelector} from "react-redux";
import {isErrorMsg,  OREST_ENDPOINT} from "../../../../model/orest/constants";
import {
    Grid,
    Typography,
    Dialog,
    IconButton
} from "@material-ui/core";
import {useSnackbar} from "notistack";
import {SLASH} from "../../../../model/globals";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import renderFormElements, {ELEMENT_TYPES} from "../../../render-form-elements";
import {required} from "../../../../state/utils/form";
import AddDialogActions from "../../../AddDialogActions";
import LoadingSpinner from "../../../LoadingSpinner";
import {helper} from "../../../../@webcms-globals";
import TrackedChangesDialog from "../../../TrackedChangesDialog";
import TableColumnText from "../../../TableColumnText";
import {DropzoneDialog} from "material-ui-dropzone";
import {PreviewFile} from "../../../../model/orest/components/RaFile";
import axios from "axios";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import CloudDownloadOutlinedIcon from "@material-ui/icons/CloudDownloadOutlined";
import MediaViewerDialog from "../../../../@webcms-ui/core/media-viewer-dialog";
import {makeStyles} from '@material-ui/core/styles'
import CustomTable from '../../../CustomTable';

const VARIANT = 'outlined'

const fileStyle = (theme) => ({
    uploadbox: {
        marginLeft: 50,
        marginTop: 7,
        [theme.breakpoints.down('xs')]: {
            marginLeft: 0,
            marginTop: 7
        }
    }
})

const useStyles = makeStyles(fileStyle);

function Files(props) {

    //props
    const {mid, empId} = props

    //snackbar
    const {enqueueSnackbar} = useSnackbar();

    //context
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal)
    const {t} = useTranslation()


    //redux state
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const hotelRefNo = useSelector((state) => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || false)
    const state = useSelector((state) => state?.orest?.state?.emp?.mid || false)

    //locale state
    const initialState = {
        code: {value: '', isError: false, required: true, helperText: ''},
        description: {value: '', isError: false, required: true, helperText: ''},
        filetype: {value: '', isError: false, required: true, helperText: ''},
        caption: {value: '', isError: false, required: true, helperText: ''},
        url: {value: '', isError: false, required: true, helperText: ''},
    }

    const classes = useStyles()

    const [isLoadingList, setIsLoadingList] = useState(false)
    const [allHotels, setAllHotels] = useState(false)
    const [fileList, setFileList] = useState([])
    const [openAddDialog, setOpenAddDialog] = useState(false);

    const [selectedFileData, setSelectedFileData] = useState(null)
    const [selectedGid, setSelectedGid] = useState(false)
    const [getData, setGetData] = useState(null)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    const [deleteOpenDialog, setDeleteOpenDialog] = useState(false);
    const [isDef, setIsDef] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [fileData, setFileData] = useState(initialState)
    const [fileDataBase, setFileDataBase] = useState(initialState)
    const [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [langFileUploadStatus, setLangFileUploadStatus] = useState(false)
    const [selectedFileGid, setSelectedFileGid] = useState(null)
    const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
    const [isFileDownloading, setIsFileDownloading] = useState([]);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [mediaUrl, setMediaUrl] = useState('');
    const [fileType, setFileType] = useState('');
    const [hasRightData, setHasRightData] = useState(false)    

    const openDialog = () => {
        setLangFileUploadStatus(true)
    }

    const openTrackDialog = (popupState, gid) => {
        setSelectedFileGid(gid)
        setDeleteOpenDialog(true)
        popupState.close()
    }

    const formElements = [
        {
            type: ELEMENT_TYPES.textField,
            id: 'code',
            name: 'code',
            value: fileData.code?.value,
            error: fileData.code?.isError,
            required: fileData.code?.isRequired,
            disabled: isSaving,
            label: t('str_code'),
            helperText: fileData.code?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'caption',
            name: 'caption',
            value: fileData.caption?.value,
            error: fileData.caption?.isError,
            required: fileData.caption?.isRequired,
            disabled: isSaving,
            label: t('str_fileDesc'),
            helperText: fileData.caption?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'description',
            name: 'description',
            value: fileData.description?.value,
            error: fileData.description?.isError,
            required: fileData.description?.isRequired,
            disabled: isSaving,
            label: t('str_description'),
            helperText: fileData.description?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'filetype',
            name: 'filetype',
            value: fileData.filetype?.value,
            error: fileData.filetype?.isError,
            required: fileData.filetype?.isRequired,
            disabled: isSaving,
            label: t('str_fileType'),
            helperText: fileData.filetype?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'url',
            name: 'url',
            value: fileData.url?.value,
            error: fileData.url?.isError,
            required: fileData.url?.isRequired,
            disabled: isSaving,
            label: t('str_fileType'),
            helperText: fileData.url?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        }
    ]

    const fileColumns = [    
        {
            title: t('str_code'),
            field: 'code',
            render: (props) => <TableColumnText>{props?.code}</TableColumnText>
        },
        {
            title: t('str_fileDesc'),
            field: 'caption',
            render: (props) => <TableColumnText>{props?.caption}</TableColumnText>
        },
        {
            title: t('str_description'),
            field: 'description',
            render: (props) => <TableColumnText>{props?.description}</TableColumnText>
        },
        {
            title: t('str_preview'),
            field: '',
            align: 'center',
            render: props => (
                <TableColumnText textAlign='center' minWidth={70}>
                    <IconButton
                        color='primary'
                        style={{padding: 0}}
                        onClick={() => {
                            setOpenPreviewDialog(true);
                            handlePreviewFile(props?.gid, props?.url)
                        }}
                        disabled={isDeleting || isFileDownloading[props?.tableData?.id]}
                    >
                        <VisibilityOutlinedIcon />
                    </IconButton>
                </TableColumnText>               
            )
        },
        {
            title: t('str_download'),
            field: '',
            align: 'center',
            render: props => (
                <TableColumnText textAlign='center' minWidth={70}>
                    <IconButton
                    color='primary'
                    style={{padding: 0}}
                        onClick={() => handleTaskFileDownload(props.filename, props.gid, props.url, props?.tableData?.id)}
                        disabled={isDeleting || isFileDownloading[props?.tableData?.id]}
                    >
                        {isFileDownloading[props?.tableData?.id] ? <LoadingSpinner size={18}/> : <CloudDownloadOutlinedIcon/>}
                    </IconButton> 
                </TableColumnText>
                                           
            )
        },
        {
            title: t('str_fileType'),
            field: 'filetype',
            render: (props) => <TableColumnText>{props?.filetype}</TableColumnText>
        },
        {
            title: t('str_fileUrl'),
            field: 'url',
            render: (props) => <TableColumnText minWidth={250} maxWidth={250}>{props?.url}</TableColumnText>
        }
    ]

    useEffect(() => {
        if (token && mid) {
            getFileList()
        }
        if(token && empId && !hasRightData) {
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.USER + SLASH + OREST_ENDPOINT.HASRIGHT,
                params: {
                    empid: empId,
                    submoduleid: 9706,
                },
                token
            }).then(res => {
                if(res.status === 200) {
                    setHasRightData(res.data.data)
                } else {
                    setHasRightData(false)
                }
            })
        }
    }, [token, mid, empId])

    useEffect(() => {
        let isEffect = true
        if (isEffect && fileData && getData) {
            const newClientInitialState = helper.objectMapper(fileData, getData, ['code'])
            setFileData(newClientInitialState)
            setFileDataBase(newClientInitialState)
            setIsInitialStateLoad(true)
        }

        return () => {
            isEffect = false
        }

    }, [getData])


    const handleDeleteItem = (gid) => {
        setIsDeleting(true)
        setDeleteOpenDialog(false)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token,
            gid: gid,
            params: {
                hotelrefno: hotelRefNo,
            }
        }).then((res) => {
            if (res.status === 200) {
                getFileList()
                enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})                
            }
            setIsDeleting(false)
        })
    }

    const getFileList = () => {
        setIsLoadingList(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token,
            params: {
                query: `masterid:${mid}`,
                allhotels: allHotels,
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            setIsLoadingList(false)
            if (res.status === 200) {
                if (res.data.count > 0) {
                    const array = []
                    setFileList(res.data.data)
                    res.data.data.map(() => {
                        array.push(false)
                    })
                    setIsFileDownloading(array)
                }
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
        })
    }



    const handleSave = () => {
        const data = {...fileData}
        Object.keys(initialState).map((key) => {
            data[key] = typeof data[key].value === 'object' ? data[key].value ? data[key].value.id : null : data[key].value
        })
        if (mid) {
            setIsSaving(true)
            if (selectedGid) {
                Patch({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    gid: selectedGid,
                    data: data,
                    token
                }).then(res => {
                    if (res.status === 200) {
                        enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                        setOpenAddDialog(false)
                        getFileList()
                        handleReset()
                    } else {
                        const error = isErrorMsg(res)
                        enqueueSnackbar(error.errorMsg, {variant: 'error'})
                    }
                    setIsSaving(false)
                })
            } else {
                data.mid = mid
                data.hotelrefno = hotelRefNo
                Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token,
                    data: data
                }).then(res => {
                    if (res.status === 200) {
                        enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                        setOpenAddDialog(false)
                        getFileList()
                        handleReset()
                    } else {
                        const error = isErrorMsg(res)
                        enqueueSnackbar(error.errorMsg, {variant: 'error'})
                    }
                    setIsSaving(false)
                })
            }
        }
    }

    const handlePreviewFile = (gid, fileUrl) => {
        setIsPreviewLoading(true)
        fileUrl = GENERAL_SETTINGS.STATIC_URL + fileUrl.replace('/var/otello', '').replace('/public', '')
        PreviewFile(GENERAL_SETTINGS, token, gid, fileUrl, hotelRefNo).then(res => {
            setIsPreviewLoading(false);
            if (res.success) {
                setMediaUrl(res?.url);
                setFileType(res?.fileType)
            } else {
                enqueueSnackbar(t(res?.errorText), {variant: res?.variant || 'error'})
            }
        })
    }

    const handleTaskFileDownload = (filename, gid, fileUrl, index) => {
        if (fileUrl.includes('http://') || fileUrl.includes('https://')) {
            const win = window.open(fileUrl, '_blank');
            if (win != null) {
                win.focus();
            }
        } else {
            const loadingList = [...isFileDownloading]
            loadingList[index] = true
            setIsFileDownloading(loadingList);
            axios({
                url:
                    GENERAL_SETTINGS.OREST_URL +
                    OREST_ENDPOINT.SLASH +
                    OREST_ENDPOINT.TOOLS +
                    OREST_ENDPOINT.SLASH +
                    OREST_ENDPOINT.FILE +
                    OREST_ENDPOINT.SLASH +
                    OREST_ENDPOINT.DOWNLOAD,
                method: 'get',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    gid: gid,
                    hotelrefno: hotelRefNo,
                },
                responseType: 'blob',
            }).then((response) => {
                if (response.status === 200) {
                    const url = window.URL.createObjectURL(new Blob([response.data]))
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', filename.toLowerCase()) //or any other extension
                    document.body.appendChild(link)
                    link.click()
                    link.remove()
                    enqueueSnackbar(t('str_selectedDownloadedMsg'), {variant: 'success'})
                } else {
                    const error = isErrorMsg(response)
                    enqueueSnackbar(t(error.errMsg), {variant: 'error'})
                }
                const loadingList = [...isFileDownloading]
                loadingList[index] = false
                setIsFileDownloading(loadingList);
            })
        }
    }

    const handleOnChangeFormElements = (event, key, isOnBlur) => {
        const name = key ? key : event.target.name
        const value = event?.target ? event.target.value : event

        if (isOnBlur) {
            setFileData({
                ...fileData,
                [name]: {
                    ...fileData[name],
                    isError: fileData[name]?.isRequired && !!required(value),
                    helperText: fileData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        } else {
            setFileData({
                ...fileData,
                [name]: {
                    ...fileData[name],
                    value: value,
                    isError: fileData[name]?.isRequired && !!required(value),
                    helperText: fileData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        }
    }

    const handleOnBlurFormElements = (event, key) => {
        handleOnChangeFormElements(event, key, true)
    }


    const handleCloseDialog = () => {
        if (JSON.stringify(fileData) !== JSON.stringify(fileDataBase)) {
            setOpenTrackedDialog(true)
        } else {
            setOpenAddDialog(false)
            handleReset()
        }
    }

    const handleReset = () => {
        setTimeout(() => {
            setIsInitialStateLoad(false)
            setGetData(null)
            setFileData(initialState)
            setFileDataBase(initialState)
            setSelectedFileData(null)
            setSelectedGid(null)
            setFileType('');
            setMediaUrl('');
        }, 100)
    }
 

    const handleLangFileUpload = (file) => {
        Upload({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            token,
            params: {
                masterid: state,
                orsactive: true,
                hotelrefno: hotelRefNo,
                quality: "0.1F"
            },
            files: file,
        }).then((r) => {
            setLangFileUploadStatus(false)
            if (r.status === 200) {
                getFileList()               
                enqueueSnackbar(t('str_haveBeenUploadedMsg'), {variant: 'success'})
            } else {
                const error = isErrorMsg(r);
                enqueueSnackbar(t(error.errMsg), {variant: 'error'})
            }
        })
    }

    return (
        <div>
            <React.Fragment>
                <Grid container>                                                        
                    <Grid item xs={12}>
                    <CustomTable
                        isHoverFirstColumn={false}
                        isActionFirstColumn
                        loading={isLoadingList}
                        getColumns={fileColumns}
                        getRows={fileList}
                        onRefresh={() => getFileList()}
                        onAdd={() => openDialog()}
                        isDisabledAdd={!hasRightData || !hasRightData?.cana}
                        disabledAddInfoText={(!hasRightData || !hasRightData?.cana) && t('str_accessDenied')}
                        firstColumnActions={[                          
                            {   
                                hidden: !hasRightData || !hasRightData.cand,  
                                icon: <DeleteOutlinedIcon style={{color: 'red'}} />,
                                title: t('str_delete'),
                                onClick: (popupState, rowData) => openTrackDialog(popupState, rowData?.gid)
                            }
                        ]}
                    />                      
                    </Grid>
                </Grid>
                <Dialog open={openAddDialog} maxWidth={'sm'} fullWidth>
                    <div style={{padding: 24}}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography style={{
                                    fontWeight: '600',
                                    fontSize: '18px'
                                }}>{selectedFileData ? t('str_editFile') : t('str_addFile')}</Typography>
                            </Grid>
                            {
                                isDef ? (
                                    <Grid item xs={12}>
                                        <LoadingSpinner/>
                                    </Grid>
                                ) : (
                                    <React.Fragment>
                                        {
                                            formElements.map((item, index) => (
                                                <Grid key={index} item {...item.gridProps}>
                                                    {renderFormElements(item)}
                                                </Grid>
                                            ))
                                        }
                                        <Grid item xs={12}>
                                            <AddDialogActions
                                                disabled={isSaving}
                                                loading={isSaving}
                                                disabledSave={fileData.code.value.length <= 0}
                                                toolTipTitle={
                                                    <div>
                                                        <Typography style={{
                                                            fontWeight: '600',
                                                            fontSize: 'inherit'
                                                        }}>{t('str_invalidFields')}</Typography>
                                                        {
                                                            fileData.code.isError || required(fileData.code.value) && (
                                                                <Typography
                                                                    style={{fontSize: 'inherit'}}>{t('str_language')}</Typography>
                                                            )
                                                        }
                                                    </div>
                                                }
                                                onCancelClick={handleCloseDialog}
                                                onSaveClick={handleSave}
                                            />
                                        </Grid>
                                    </React.Fragment>
                                )
                            }
                        </Grid>
                    </div>
                </Dialog>
                <MediaViewerDialog
                    open={openPreviewDialog}
                    maxWidth={'md'}
                    fullWidth
                    loading={isPreviewLoading}
                    fileType={fileType}
                    url={mediaUrl}
                    t={t}
                    onClose={() => {
                        setOpenPreviewDialog(false);
                        setTimeout(() => {
                            handleReset();
                        }, 100)
                    }}
                />
                <TrackedChangesDialog
                    open={openTrackedDialog || deleteOpenDialog}
                    onPressNo={(e) => {
                        setOpenTrackedDialog(e);
                        setDeleteOpenDialog(e)
                    }}
                    dialogTitle={deleteOpenDialog ? t('str_delete') : false}
                    dialogDesc={deleteOpenDialog ? t('str_alertDeleteTitle') : false}
                    onPressYes={(e) => {
                        if (deleteOpenDialog) {
                            handleDeleteItem(selectedFileGid)
                        } else {
                            setOpenTrackedDialog(e);
                            setOpenAddDialog(false)
                            setDeleteOpenDialog(e)
                            handleReset()
                        }
                    }}
                />
                <DropzoneDialog
                    open={langFileUploadStatus}
                    onSave={handleLangFileUpload}
                    acceptedFiles={[
                        'image/jpeg',
                        'image/png',
                        'image/bmp',
                        'image/gif',
                        'video/mp4',
                        'application/zip',
                        'application/pdf',
                    ]}
                    showPreviews={true}
                    filesLimit={3}
                    maxFileSize={5000000}
                    onClose={() => setLangFileUploadStatus(false)}
                    submitButtonText={t('str_save')}
                    cancelButtonText={t('str_cancel')}
                    dialogTitle={t('str_uploadAFile')}           
                />
            </React.Fragment>
        </div>
    )
}

export default Files