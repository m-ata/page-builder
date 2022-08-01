import React, {useState, useEffect, useContext} from 'react';
import {Insert, UseOrest, ViewList, Patch, Delete, Upload} from "@webcms/orest";
import WebCmsGlobal from "../../../webcms-global";
import {useSelector} from "react-redux";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../model/orest/constants";
import {
    Dialog,
    Grid,
    IconButton,
    makeStyles,
    Typography,
} from "@material-ui/core";
import Fieldset from '../../../../@webcms-ui/core/fieldset';
import Legend from '../../../../@webcms-ui/core/legend';
import {useSnackbar} from "notistack";
import {SLASH} from "../../../../model/globals";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import renderFormElements, {ELEMENT_TYPES} from "../../../render-form-elements";
import {required} from "../../../../state/utils/form";
import AddDialogActions from "../../../AddDialogActions";
import LoadingSpinner from "../../../LoadingSpinner";
import {helper} from "../../../../@webcms-globals";
import TrackedChangesDialog from "../../../TrackedChangesDialog";
import { EditOutlined } from '@material-ui/icons';
import TableColumnText from "../../../TableColumnText";
import {DropzoneDialog} from "material-ui-dropzone";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Fab from "@material-ui/core/Fab";
import MediaViewerDialog from "../../../../@webcms-ui/core/media-viewer-dialog";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import CloudDownloadOutlinedIcon from "@material-ui/icons/CloudDownloadOutlined";
import {PreviewFile} from "../../../../model/orest/components/RaFile";
import axios from "axios";
import CustomTable from '../../../CustomTable';

const useStyles = makeStyles((theme) => ({
    viewFile: {
        '&::-webkit-scrollbar': {
            display: 'none!important'
        },
        display: 'flex'
    },
    fileActionContainer: {
        position: 'relative',
        '&:hover $fileActionButton': {
            opacity: 1
        }
    },
    fileActionButton: {
        position: 'absolute',
        top: -24,
        right: 0,
        opacity: 0,
        transition: '0.2s opacity'
    }
}))

const VARIANT = 'outlined'


function Languages(props) {

    const classes = useStyles()

    //props
    const {empId} = props

    //snackbar
    const {enqueueSnackbar} = useSnackbar();

    //context
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal)
    const {t} = useTranslation()


    //redux state
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const hotelRefNo = useSelector((state) => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || false)

    //locale state
    const initialState = {
        langid: {value: '', isError: false, isRequired: true, helperText: ''},
        verbalevel: {value: 1, isError: false, isRequired: false, helperText: ''},
        writenlevel: {value: 1, isError: false, isRequired: false, helperText: ''},
        readlevel: {value: 1, isError: false, isRequired: false, helperText: ''},
        langlevel: {value: null, isError: false, isRequired: false, helperText: ''},
        description: {value: '', isError: false, isRequired: false, helperText: ''},
        stdfileid: {value: 0, isError: false, isRequired: false, helperText: ''},
    }

    const [isLoadingList, setIsLoadingList] = useState(false)
    const [languageList, setLanguageList] = useState([])
    const [openAddDialog, setOpenAddDialog] = useState(false);

    const [selectedLanguageData, setSelectedLanguageData] = useState(null)
    const [selectedGid, setSelectedGid] = useState(false)
    const [getData, setGetData] = useState(null)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    const [deleteOpenDialog, setDeleteOpenDialog] = useState(false);
    const [isDef, setIsDef] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [languageData, setLanguageData] = useState(initialState)
    const [languageDataBase, setLanguageDataBase] = useState(initialState)
    const [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [langFileUploadStatus, setLangFileUploadStatus] = useState(false)
    const [selectedLanguageGid, setSelectedLanguageGid] = useState(null)
    const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [mediaUrl, setMediaUrl] = useState('');
    const [fileType, setFileType] = useState('');
    const [isFileDownloading, setIsFileDownloading] = useState([]);
    const [hasRightData, setHasRightData] = useState(false);
    const [file, setFile] = useState(null);  
    const [isSelectedFileLoading, setIsSelectedFileLoading] = useState(false)

    const openDialog = () => {
        setLangFileUploadStatus(true)
    }

    const openTrackDialog = (popupState, gid) => {
        setSelectedLanguageGid(gid)
        setDeleteOpenDialog(true)
        popupState.close()
    }

    const formElements = [
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'langid',
            name: 'langid',
            value: typeof languageData.langid?.value === 'object' ?  languageData.langid?.value : null || null,
            disabled: isSaving,
            label: t('str_language'),
            variant: VARIANT,
            required: languageData.langid?.isRequired,
            error: languageData.langid?.isError,
            helperText: languageData.langid?.helperText,
            onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
            onBlur: (e, name) => handleOnBlurFormElements(e, name),
            onLoad: (initialValue, name) => {                
                const data = {...languageData}
                data[name].value = initialValue ? initialValue : null
                setLanguageData(data)
            },
            endpoint: 'ralang/view/list',
            params: {text: '', limit: 25, field: 'code'},
            initialId: isInitialStateLoad && selectedLanguageData?.langid || false,
            showOptionLabel: 'description',
            showOption: 'description',
            searchParam: 'description',
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'langlevel',
            name: 'langlevel',
            value: typeof languageData.langlevel?.value === 'object' ?  languageData.langlevel?.value : null || null,
            disabled: isSaving,
            label: t('str_languageLevel'),
            variant: VARIANT,
            required: languageData.langlevel?.isRequired,
            error: languageData.langlevel?.isError,
            helperText: languageData.langlevel?.helperText,
            onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
            onBlur: (e, name) => handleOnBlurFormElements(e, name),
            onLoad: (initialValue, name) => {
                const data = {...languageData}
                data[name].value = initialValue ? initialValue : null
                setLanguageData(data)
            },
            endpoint: 'transtype/langlevel',
            params: {text: '', limit: 25, field: 'code'},
            searchInitialParam: 'code',
            initialId: isInitialStateLoad && typeof languageData.langlevel?.value !== 'object' ? languageData.langlevel?.value : false || false,
            showOptionLabel: 'description',
            showOption: 'description',
            searchParam: 'description',
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'description',
            name: 'description',
            value: languageData.description?.value,
            error: languageData.description?.isError,
            required: languageData.description?.isRequired,
            disabled: isSaving,
            label: t('str_description'),
            helperText: languageData.description?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        }
    ]

    const languageColumns = [    
        {
            title: t('str_language'),
            field: 'langid',
            render: (props) => <TableColumnText>{props?.langcode}</TableColumnText>
        },
        {
            title: t('str_verbalLevel'),
            field: 'verbalevel',
            render: (props) => <TableColumnText>{props?.verbalevel}</TableColumnText>
        },
        {
            title: t('str_writingLevel'),
            field: 'writenlevel',
            render: (props) => <TableColumnText>{props?.writenlevel}</TableColumnText>
        },
        {
            title: t('str_readingLevel'),
            field: 'readlevel',
            render: (props) => <TableColumnText>{props?.readlevel}</TableColumnText>
        },
        {
            title: t('str_description'),
            field: 'description',
            render: (props) => <TableColumnText minWidth={250} maxWidth={250} showToolTip>{props?.description}</TableColumnText>
        },
        {
            title: t('str_preview'),
            field: 'stdfileid',
            align: 'center',
            render: (props) => props.stdfileid ? (
                <TableColumnText textAlign='center'>
                    <IconButton
                        color={'primary'}
                        style={{padding: 0}}
                        onClick={() => {                        
                            setOpenPreviewDialog(true);
                            handlePreviewFile(props.mid, 'EMPLANG.CERT')
                        }}
                        disabled={isDeleting || isFileDownloading[props.tableData.id]}
                    >
                        <VisibilityOutlinedIcon />
                    </IconButton>
                </TableColumnText>
            ) : null
        },
        {
            title: t('str_download'),
            field: 'stdfileid',
            align: 'center',
            render: props => props.stdfileid ? (
                <TableColumnText textAlign='center'>
                    <IconButton
                        color={'primary'}
                        style={{padding: 0}}
                        onClick={() => handleTaskFileDownload(props.mid, 'EMPLANG.CERT', props.description, props.tableData.id)}
                        disabled={isDeleting || isFileDownloading[props.tableData.id]}
                    >
                        {isFileDownloading[props.tableData.id] ? <LoadingSpinner size={18}/> : <CloudDownloadOutlinedIcon/>}
                    </IconButton>
                </TableColumnText>                
            ) : null
        },
    ]

    useEffect(() => {
        if (token && languageList.length <= 0 && empId) {
            getLanguageList()
        }
        if(token && empId && !hasRightData) {
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.USER + SLASH + OREST_ENDPOINT.HASRIGHT,
                params: {
                    empid: empId,
                    submoduleid: 9921,
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
    }, [token, empId])

    useEffect(() => {
        let isEffect = true
        if (isEffect && languageData && getData) {
            const newClientInitialState = helper.objectMapper(languageData, getData, ['langid'])
            setLanguageData(newClientInitialState)
            setLanguageDataBase(newClientInitialState)
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
            endpoint: OREST_ENDPOINT.EMPLANG,
            token,
            gid: gid,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            }
        }).then((res) => {
            if (res.status === 200) {
                getLanguageList()
                enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
                
            }
            setIsDeleting(false)
        })
    }

    const getLanguageList = () => {
        setIsLoadingList(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPLANG,
            token,
            params: {
                query: `empid:${empId}`,
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            if(res.status === 200) {
                if(res.data.data.length > 0) {
                    const array = []
                    res.data.data.map((item) => {
                        array.push(false)
                    })
                    setIsFileDownloading(array)
                }
                setLanguageList(res.data.data)
            }
            setIsLoadingList(false)
        })
    }

    const handleGetselectedLanguage = (selectedLanguage) => {
        if (selectedLanguage) {
            setIsDef(true)
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.EMPLANG + SLASH + OREST_ENDPOINT.VIEW + SLASH + 'get' + SLASH + selectedLanguage.gid,
                token
            }).then(res => {
                setIsDef(false)
                if (res.status === 200 && res.data.data) {
                    const data = res.data.data
                    setLanguageData({
                        ...languageData,
                        ['langlevel']: {
                            ...languageData['langlevel'],
                            value:  data.readlevel === 1 ? '6500401' : data.readlevel === 2 ? '6500402' : data.readlevel === 3 ? 
                            '6500403' : data.readlevel === 4 ?  '6500404' : data.readlevel === 5 ? '6500405' : data.readlevel === 6 ?
                            '6500406' : ''
                        }
                    })
                    setGetData(data)
                    if(data.stdfileid) {
                        setIsSelectedFileLoading(true)
                        axios({
                            url: `${GENERAL_SETTINGS.OREST_URL}/tools/file/download`,
                            headers: {
                                'Authorization': `Bearer ${token}`,
                            },
                            method: 'get',
                            responseType: 'blob',
                            params: {
                                id: data.stdfileid,
                                code: 'EMPLANG.CERT',
                                hotelrefno: hotelRefNo,
                            },
                        }).then((r) => {
                            if (r.status === 200) {
                                let blob = new Blob([r.data], {type: r.data.type}) 
                                setFile(blob)                       
                            }      
                            setIsSelectedFileLoading(false)                    
                        })
                    }
                }
            })
        }
    }

    const handleDefRecord = () => {
        setIsDef(true)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPLANG + SLASH + OREST_ENDPOINT.DEF,
            token,
            params: {
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            if (res.status === 200 && res.data.count > 0) {
                const data = Object.assign({}, res.data.data, languageData)
                setLanguageData(data)
                setLanguageDataBase(data)
            }
            setIsDef(false)
        })
    }


    const handleSave = () => {
        const data = {...languageData}
        Object.keys(initialState).map((key) => {
            data[key] = typeof data[key].value === 'object' ? data[key].value ? data[key].value.id : null : data[key].value
        })
        if (empId) {
            setIsSaving(true)
            if (languageData.langlevel.value.code === "6500401") {
                data.readlevel = 1
                data.writenlevel = 1
                data.verbalevel = 1
            }
            if (languageData.langlevel.value.code === "6500402") {
                data.readlevel = 2
                data.writenlevel = 2
                data.verbalevel = 2
            }
            if (languageData.langlevel.value.code === "6500403") {
                data.readlevel = 3
                data.writenlevel = 3
                data.verbalevel = 3
            }
            if (languageData.langlevel.value.code === "6500404") {
                data.readlevel = 4
                data.writenlevel = 4
                data.verbalevel = 4
            }
            if (languageData.langlevel.value.code === "6500405") {
                data.readlevel = 5
                data.writenlevel = 5
                data.verbalevel = 5
            }
            if (languageData.langlevel.value.code === "6500406") {
                data.readlevel = 6
                data.writenlevel = 6
                data.verbalevel = 6
            }
            delete data.langlevel
            if (selectedGid) {
                Patch({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.EMPLANG,
                    gid: selectedGid,
                    data: data,
                    token
                }).then(res => {
                    if (file) {
                        Upload({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            token: token,
                            params: {
                                masterid: res.data.data.mid,
                                code: 'EMPLANG.CERT',
                                orsactive: true,
                                hotelrefno: hotelRefNo
                            },
                            files: [file],
                        }).then(uploadRes => {
                            if(uploadRes.status === 200) {
                                enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                                setOpenAddDialog(false)
                                getLanguageList()
                                handleReset()
                                setIsSaving(false)
                            }
                        })
                    } else {
                        if (res.status === 200) {
                            enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                            setOpenAddDialog(false)
                            getLanguageList()
                            handleReset()
                        } else {
                            const error = isErrorMsg(res)
                            enqueueSnackbar(error.errorMsg, {variant: 'error'})
                        }
                        setIsSaving(false)
                    }                
                    
                })
            } else {
                data.empid = empId
                data.hotelrefno = hotelRefNo
                Insert({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.EMPLANG,                   
                    data: data,
                    token
                }).then(async (res) => {
                    if (res.status === 200) {
                        if (file) {
                            Upload({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                token: token,
                                params: {
                                    masterid: res.data.data.mid,
                                    code: 'EMPLANG.CERT',
                                    orsactive: true,
                                    hotelrefno: hotelRefNo
                                },
                                files: [file],
                            }).then(uploadRes => {
                                if(uploadRes.status === 200) {
                                    getLanguageList()
                                    setOpenAddDialog(false)
                                    handleReset()
                                    setIsSaving(false)
                                } else {
                                    const error = isErrorMsg(uploadRes)
                                    enqueueSnackbar(error.errMsg, {variant: 'error'})
                                }
                            })
                        } else {
                            getLanguageList()
                            setOpenAddDialog(false)
                            handleReset()
                            setIsSaving(false)                           
                        }                     
                    } else {
                        const error = isErrorMsg(res)
                        enqueueSnackbar(error.errMsg, {variant: 'error'})
                        setIsSaving(false)
                    }
                    
                })
            }
        }
    }

    const handleOnChangeFormElements = (event, key, isOnBlur) => {
        const name = key ? key : event.target.name
        const value = event?.target ? event.target.value : event

        if (isOnBlur) {
            setLanguageData({
                ...languageData,
                [name]: {
                    ...languageData[name],
                    isError: languageData[name]?.isRequired && !!required(value),
                    helperText: languageData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        } else {
            setLanguageData({
                ...languageData,
                [name]: {
                    ...languageData[name],
                    value: value,
                    isError: languageData[name]?.isRequired && !!required(value),
                    helperText: languageData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        }
    }

    const handleOnBlurFormElements = (event, key) => {
        handleOnChangeFormElements(event, key, true)
    }

    const handleOpenAddDialog = (selectedLanguage = false) => {    
        if (selectedLanguage) {
            handleGetselectedLanguage(selectedLanguage)
        } else {
            handleDefRecord()
        }
        setOpenAddDialog(true)
    }

    const handleCloseDialog = () => {
        if (JSON.stringify(languageData) !== JSON.stringify(languageDataBase)) {
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
            setLanguageData(initialState)
            setLanguageDataBase(initialState)
            setSelectedLanguageData(null)
            setSelectedGid(null)
            setFileType('');
            setMediaUrl('');
            setFile(null)
        }, 100)
    }

    const handlePreviewFile = (mid, code) => {
        setIsPreviewLoading(true)
        let file = false
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            params: {
                query: `isactive:true,masterid:${mid},code:${code}`,
                hotelrefno: hotelRefNo
            },
            token
        }).then(res => {
            if(res.status === 200 && res.data.count > 0) {
                file = res.data.data[0]
                PreviewFile(GENERAL_SETTINGS, token, file?.gid, file?.fileurl, hotelRefNo).then(res => {
                    setIsPreviewLoading(false);
                    if(res.success) {
                        setMediaUrl(res?.url);
                        setFileType(res?.fileType)
                    } else {
                        enqueueSnackbar(t(res?.errorText), { variant: res?.variant || 'error' })
                    }
                })
            }
        }) 
     
    }

    const handleTaskFileDownload = (mid, code, description, index) => {
        const isFileDownloadingArray = [...isFileDownloading]
        isFileDownloadingArray[index] = true
        setIsFileDownloading(isFileDownloadingArray)
        axios({
            url: `${GENERAL_SETTINGS.OREST_URL}/tools/file/download`,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            method: 'get',
            responseType: 'blob',
            params: {
                mid: mid,
                code: code,
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            },
        }).then((r) => {
            if (r.status === 200) {
                let blob = new Blob([r.data], {type: r.data.type})
                    , url = URL.createObjectURL(blob)
                    , link = document.createElement('a')

                link.href = url
                link.setAttribute('download', `${description}`.toLowerCase()) //or any other extension
                document.body.appendChild(link)
                link.click()
                link.remove()
            }
            const isFileDownloadingArray = [...isFileDownloading]
            isFileDownloadingArray[index] = false
            setIsFileDownloading(isFileDownloadingArray)
        })
    }

    const handleDeleteFile = (id) => {
        setIsSelectedFileLoading(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            params: {
                query: `id:${id},code:EMPLANG.CERT`,
                hotelrefno: hotelRefNo,
                limit: 1
            },
            token
        }).then(res => {
            if(res.status === 200) {
                if(res.data.data.length > 0) {
                    const data = res.data.data[0]
                    Delete({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RAFILE,                    
                        gid: data.gid,
                        params: {
                            hotelrefno: hotelRefNo,
                        },
                        token
                    }).then((rafileDeleteResponse) => {
                        if(rafileDeleteResponse.status === 200) {
                            enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                        }      
                        setFile(null)
                        setIsSelectedFileLoading(false)            
                    })
                }                
            }
        })
    }


    const SmallViewFile = (id) => {
        const blob = new Blob([file], {type: file.type})
        const url = URL.createObjectURL(blob)
        const raFileId = languageList.find(e => e.gid === selectedGid)
        return(
            <div className={classes.fileActionContainer}>
                <div className={classes.fileActionButton}>
                    <IconButton size={'small'} onClick={() => selectedGid ?  handleDeleteFile(raFileId.stdfileid) : setFile(null)}>
                        <DeleteOutlinedIcon style={{color: 'red'}} />
                    </IconButton>                  
                </div>
                <object 
                    type={file.type}
                    data={url}
                    width="150"
                    height={100}
                    style={{pointerEvents: 'none', overFlow:'hidden', width: '150px', height: '100px', maxWidth: 150}}
                >
                </object>
            </div>
           
        )
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
                        getColumns={languageColumns}
                        getRows={languageList}
                        onRefresh={() => getLanguageList()}
                        onAdd={() => handleOpenAddDialog(false)}
                        isDisabledAdd={!hasRightData || !hasRightData?.cana}
                        disabledAddInfoText={(!hasRightData || !hasRightData?.cana) && t('str_accessDenied')}
                        firstColumnActions={[
                            {
                                hidden: !hasRightData || !hasRightData.canu, 
                                icon: <EditOutlined />,
                                title: t('str_edit'),                                
                                onClick: (popupState, rowData) => {
                                    setSelectedLanguageData(rowData)
                                    setSelectedGid(rowData?.gid || false)
                                    handleOpenAddDialog(rowData)
                                    popupState.close();
                                }
                            },
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
                                }}>{selectedLanguageData ? t('str_editLanguage') : t('str_addLanguage')}</Typography>
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
                                            <Fieldset>
                                            <Legend>{t('str_file')}</Legend>
                                                <Grid container spacing={2}>                                                
                                                    <Grid item xs={12} style={{textAlign: 'center'}}>
                                                        <Fab
                                                            disabled={isSelectedFileLoading}
                                                            variant="extended"
                                                            size="medium"
                                                            onClick={openDialog}
                                                            color="primary"
                                                            style={{
                                                                fontWeight: '600',
                                                                fontSize: 'inherit',
                                                                borderRadius: 7,
                                                                height: 42
                                                            }}
                                                        >
                                                            <CloudUploadIcon style={{marginRight: 10}}/>
                                                            {t('str_upload')}
                                                        </Fab>
                                                    </Grid>                                                     
                                                    <Grid item xs={12}>
                                                        {  
                                                        selectedGid ? (
                                                            isSelectedFileLoading ? (
                                                                <LoadingSpinner size={18}/>
                                                            ) : (
                                                                file && (
                                                                    <div className={classes.viewFile}>
                                                                        <SmallViewFile />
                                                                    </div>                                                                
                                                                )   
                                                            )                                                            
                                                        )  : (
                                                            file && (
                                                                <div className={classes.viewFile}>
                                                                    <SmallViewFile />
                                                                </div>                                                                
                                                            )   
                                                        )}
                                                    </Grid>                                                                                                                                                                                                                                                                                                                 
                                                </Grid>    
                                            </Fieldset>                                                             
                                            <DropzoneDialog
                                                open={langFileUploadStatus}
                                                onSave={(file) => {
                                                    setLangFileUploadStatus(false)
                                                    setFile(file[0])
                                                }}
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
                                                filesLimit={1}
                                                maxFileSize={5000000}
                                                onClose={() => setLangFileUploadStatus(false)}
                                                submitButtonText={t('str_save')}
                                                cancelButtonText={t('str_cancel')}
                                                dialogTitle={t('str_uploadALanguageCertificateFile')}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <AddDialogActions
                                                disabled={isSaving}
                                                loading={isSaving}
                                                disabledSave={languageData.langid.value.length <= 0}
                                                toolTipTitle={
                                                    <div>
                                                        <Typography style={{
                                                            fontWeight: '600',
                                                            fontSize: 'inherit'
                                                        }}>{t('str_invalidFields')}</Typography>
                                                        {
                                                            languageData.langid.isError || required(languageData.langid.value) && (
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
                            handleDeleteItem(selectedLanguageGid)
                        } else {
                            setOpenTrackedDialog(e);
                            setOpenAddDialog(false)
                            setDeleteOpenDialog(e)
                            handleReset()
                        }
                    }}
                />
            </React.Fragment>
        </div>
    )
}

export default Languages