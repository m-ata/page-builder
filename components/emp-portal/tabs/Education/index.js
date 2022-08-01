import React, {useState, useEffect, useContext} from 'react';
import {Insert, UseOrest, ViewList, Patch, Delete, Upload} from "@webcms/orest";
import WebCmsGlobal from "../../../webcms-global";
import {useSelector} from "react-redux";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../model/orest/constants";
import {
    Grid,
    Typography,
    Dialog,
    IconButton, makeStyles
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
import moment from "moment";
import Fab from "@material-ui/core/Fab";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import {DropzoneDialog} from "material-ui-dropzone";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import CloudDownloadOutlinedIcon from "@material-ui/icons/CloudDownloadOutlined";
import axios from "axios";
import MediaViewerDialog from "../../../../@webcms-ui/core/media-viewer-dialog";
import CustomTable from "../../../CustomTable";
import {EditOutlined} from "@material-ui/icons";
import {PreviewFile} from "../../../../model/orest/components/RaFile";
import Fieldset from "../../../../@webcms-ui/core/fieldset";
import Legend from "../../../../@webcms-ui/core/legend";
import {value} from "lodash/seq";

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

function Education(props) {

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
        edutypeid: {value: '', isError: false, required: true, helperText: ''},
        graddate: {value: '', isError: false, required: false, helperText: ''},
        schoolname: {value: '', isError: false, required: false, helperText: ''},
        gradlevel: {value: "", isError: false, required: false, helperText: ''},
        schoolplace: {value: '', isError: false, required: false, helperText: ''},
        note: {value: '', isError: false, required: false, helperText: ''},
        stdfileid: {value: 0, isError: false, required: false, helperText: ''},
    }

    const [isLoadingList, setIsLoadingList] = useState(false)
    const [allHotels, setAllHotels] = useState(false)
    const [educationList, setEducationList] = useState([])
    const [openAddDialog, setOpenAddDialog] = useState(false);

    const [selectedEducationData, setSelectedEducationData] = useState(null)
    const [selectedGid, setSelectedGid] = useState(false)
    const [getData, setGetData] = useState(null)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    const [isDef, setIsDef] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [educationData, setEducationData] = useState(initialState)
    const [educationDataBase, setEducationDataBase] = useState(initialState)
    const [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [eduFileUploadStatus, setEduFileUploadStatus] = useState(false)
    const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [mediaUrl, setMediaUrl] = useState('');
    const [fileType, setFileType] = useState('');
    const [isFileDownloading, setIsFileDownloading] = useState(false);
    const [hasRightData, setHasRightData] = useState();
    const [file, setFile] = useState(null);
    const [isSelectedFileLoading, setIsSelectedFileLoading] = useState(false);
    const [deleteOpenDialog, setDeleteOpenDialog] = useState(false);

    const openDialog = () => {
        setEduFileUploadStatus(true)
    }

    const openTrackDialog = (popupState, gid) => {
        setSelectedGid(gid)
        setDeleteOpenDialog(true)
        popupState.close()
    }

    const formElements = [
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'edutypeid',
            name: 'edutypeid',
            value: educationData.edutypeid?.value || null,
            disabled: isSaving,
            label: t('str_educationType'),
            variant: VARIANT,
            required: educationData.edutypeid?.isRequired,
            error: educationData.edutypeid?.isError,
            helperText: educationData.edutypeid?.helperText,
            onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
            onBlur: (e, name) => handleOnBlurFormElements(e, name),
            onLoad: (initialValue, name) => {
                const data = {...educationData}
                data[name].value = initialValue ? initialValue : null
                setEducationData(data)
            },
            endpoint: 'edutype/view/list',
            params: {text: '', limit: 25, field: 'code'},
            initialId: isInitialStateLoad && selectedEducationData?.edutypeid || false,
            showOptionLabel: 'code',
            showOption: 'code',
            searchParam: 'code,description',
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        },
        {
            type: ELEMENT_TYPES.datePicker,
            id: 'graddate',
            name: 'graddate',
            views: ['year'],
            value: educationData.graddate?.value.substring(0, 4),
            error: educationData.graddate?.isError,
            required: educationData.graddate?.isRequired,
            disabled: isSaving,
            label: t('str_graduateDate'),
            helperText: educationData.graddate?.helperText,
            onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.numberFormat,
            id: 'gradlevel',
            name: 'gradlevel',
            value: Number(educationData.gradlevel?.value),
            currencyCode: 'null',
            error: educationData.gradlevel?.isError,
            required: educationData.gradlevel?.isRequired,
            disabled: isSaving,
            label: t('str_graduateLevel'),
            helperText: educationData.gradlevel?.helperText,
            onChange: (e, name) => handleChangeNumberFormat(e, name),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'schoolname',
            name: 'schoolname',
            value: educationData.schoolname?.value,
            error: educationData.schoolname?.isError,
            required: educationData.schoolname?.isRequired,
            disabled: isSaving,
            label: t('str_schoolName'),
            helperText: educationData.schoolname?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'schoolplace',
            name: 'schoolplace',
            value: educationData.schoolplace?.value,
            error: educationData.schoolplace?.isError,
            required: educationData.schoolplace?.isRequired,
            disabled: isSaving,
            label: t('str_schoolPlace'),
            helperText: educationData.schoolplace?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'note',
            name: 'note',
            value: educationData.note?.value,
            error: educationData.note?.isError,
            required: educationData.note?.isRequired,
            disabled: isSaving,
            label: t('str_note'),
            helperText: educationData.note?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            multiLine: true,
            rows: 4,
            rowsMax: 4,
            fullWidth: true,
            gridProps: {xs: 12}
        },
    ]

    const educationColumns = [
        {
            title: t('str_educationType'),
            field: 'edutype',
            render: (props) => <TableColumnText minWidth={150}>{props?.edutype}</TableColumnText>
        },
        {
            title: t('str_graduateDate'),
            field: 'graddate',
            render: (props) => <TableColumnText>{props?.graddate.substring(0, 4)}</TableColumnText>
        },
        {
            title: t('str_schoolName'),
            field: 'schoolname',
            render: (props) => <TableColumnText>{props?.schoolname}</TableColumnText>
        },
        {
            title: t('str_graduateLevel'),
            field: 'gradlevel',
            render: (props) => <TableColumnText>{props?.gradlevel}</TableColumnText>
        },
        {
            title: t('str_schoolPlace'),
            field: 'schoolplace',
            render: (props) => <TableColumnText>{props?.schoolplace}</TableColumnText>
        },
        {
            title: t('str_note'),
            field: 'note',
            render: (props) => <TableColumnText>{props?.note}</TableColumnText>
        },
        {
            title: t('str_empId'),
            field: 'empid',
            headerStyle: {
                textAlign: 'right'
            },
            render: (props) => <TableColumnText textAlign={'right'}>{props?.empid}</TableColumnText>
        },
        {
            title: t('str_id'),
            field: 'id',
            headerStyle: {
                textAlign: 'right'
            },
            render: (props) => <TableColumnText textAlign={'right'}>{props?.id}</TableColumnText>
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
                            handlePreviewFile(props.mid, 'EMPEDU.CERT')
                        }}
                        disabled={isDeleting || isFileDownloading[props.tableData.id]}
                    >
                        <VisibilityOutlinedIcon/>
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
                        onClick={() => handleTaskFileDownload(props.mid, 'EMPEDU.CERT', props.description, props.tableData.id)}
                        disabled={isDeleting || isFileDownloading[props.tableData.id]}
                    >
                        {isFileDownloading[props.tableData.id] ? <LoadingSpinner size={18}/> :
                            <CloudDownloadOutlinedIcon/>}
                    </IconButton>
                </TableColumnText>
            ) : null
        },
    ]

    useEffect(() => {
        if (token && empId) {
            getEducationList()
        }
        if (token && empId && !hasRightData) {
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.USER + SLASH + OREST_ENDPOINT.HASRIGHT,
                params: {
                    empid: empId,
                    submoduleid: 9921,
                },
                token
            }).then(res => {
                if (res.status === 200) {
                    setHasRightData(res.data.data)
                } else {
                    setHasRightData(false)
                }
            })
        }
    }, [token, empId])

    useEffect(() => {
        let isEffect = true
        if (isEffect && educationData && getData) {
            const newClientInitialState = helper.objectMapper(educationData, getData, ['edutypeid'])
            setEducationData(newClientInitialState)
            setEducationDataBase(newClientInitialState)
            setIsInitialStateLoad(true)
        }


        return () => {
            isEffect = false
        }

    }, [getData])

    const handleChangeNumberFormat = (value, name) => {
        setEducationData({
            ...educationData,
            [name]: {
                ...educationData[name],
                value: value?.floatValue,
            }
        })
    }

    const handleDeleteItem = (gid) => {
        setIsDeleting(true)
        setDeleteOpenDialog(false)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPEDU,
            token,
            gid: gid,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            }
        }).then((res) => {
            if (res.status === 200) {
                getEducationList()
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
                setIsDeleting(false)
            }
        })
    }

    const getEducationList = () => {
        setIsLoadingList(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPEDU,
            token,
            params: {
                query: `empid:${empId}`,
                allhotels: allHotels,
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            setIsLoadingList(false)
            if (res.status === 200) {
                if (res.data.count > 0) {
                    if (res.data.data.length > 0) {
                        const array = []
                        res.data.data.map((item) => {
                            array.push(false)
                        })
                        setIsFileDownloading(array)
                    }
                    setEducationList(res.data.data)
                }
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
        })
    }

    const handleGetSelectededucation = (selectedEducation) => {
        if (selectedEducation) {
            setIsDef(true)
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.EMPEDU + SLASH + OREST_ENDPOINT.VIEW + SLASH + 'get' + SLASH + selectedEducation.gid,
                token
            }).then(res => {
                setIsDef(false)
                if (res.status === 200 && res.data.data) {
                    const data = res.data.data
                    setGetData(data)
                }
            })
        }
    }

    const handleDefRecord = () => {
        setIsDef(true)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPEDU + SLASH + OREST_ENDPOINT.DEF,
            token,
            params: {
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            if (res.status === 200 && res.data.count > 0) {
                const data = Object.assign({}, res.data.data, educationData)
                setEducationData(data)
                setEducationDataBase(data)
            }
            setIsDef(false)
        })
    }

    const handleSave = () => {
        const data = {...educationData}
        Object.keys(initialState).map((key) => {
            data[key] = typeof data[key].value === 'object' ? data[key].value ? data[key].value.id : null : data[key].value
        })
        if (empId) {
            setIsSaving(true)
            if (selectedGid) {
                Patch({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.EMPEDU,
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
                                code: 'EMPEDU.CERT',
                                orsactive: true,
                                hotelrefno: hotelRefNo
                            },
                            files: [file],
                        }).then(uploadRes => {
                            if (uploadRes.status === 200) {
                                enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                                setOpenAddDialog(false)
                                getEducationList()
                                handleReset()
                                setIsSaving(false)
                            }
                        })
                    } else {
                        if (res.status === 200) {
                            enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                            setOpenAddDialog(false)
                            getEducationList()
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
                    endpoint: OREST_ENDPOINT.EMPEDU,
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
                                    code: 'EMPEDU.CERT',
                                    orsactive: true,
                                    hotelrefno: hotelRefNo
                                },
                                files: [file],
                            }).then(uploadRes => {
                                if (uploadRes.status === 200) {
                                    getEducationList()
                                    setOpenAddDialog(false)
                                    handleReset()
                                    setIsSaving(false)
                                } else {
                                    const error = isErrorMsg(uploadRes)
                                    enqueueSnackbar(error.errMsg, {variant: 'error'})
                                }
                            })
                        } else {
                            getEducationList()
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
            setEducationData({
                ...educationData,
                [name]: {
                    ...educationData[name],
                    isError: educationData[name]?.isRequired && !!required(value),
                    helperText: educationData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        } else {
            setEducationData({
                ...educationData,
                [name]: {
                    ...educationData[name],
                    value: name === "graddate" ? moment(value).format(OREST_ENDPOINT.DATEFORMAT) : value,
                    isError: educationData[name]?.isRequired && !!required(value),
                    helperText: educationData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        }
    }

    const handleOnBlurFormElements = (event, key) => {
        handleOnChangeFormElements(event, key, true)
    }

    const handleOpenAddDialog = (selectedEducation = false) => {
        if (selectedEducation) {
            handleGetSelectededucation(selectedEducation)
        } else {
            handleDefRecord()
        }
        setOpenAddDialog(true)
    }

    const handleCloseDialog = () => {
        if (JSON.stringify(educationData) !== JSON.stringify(educationDataBase)) {
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
            setEducationData(initialState)
            setEducationDataBase(initialState)
            setSelectedEducationData(null)
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
            if (res.status === 200 && res.data.count > 0) {
                file = res.data.data[0]
                PreviewFile(GENERAL_SETTINGS, token, file?.gid, file?.fileurl, hotelRefNo).then(res => {
                    setIsPreviewLoading(false);
                    if (res.success) {
                        setMediaUrl(res?.url);
                        setFileType(res?.fileType)
                    } else {
                        enqueueSnackbar(t(res?.errorText), {variant: res?.variant || 'error'})
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
                query: `id:${id},code:EMPEDU.CERT`,
                hotelrefno: hotelRefNo,
                limit: 1
            },
            token
        }).then(res => {
            if (res.status === 200) {
                if (res.data.data.length > 0) {
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
                        if (rafileDeleteResponse.status === 200) {
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
        const raFileId = educationList.find(e => e.gid === selectedGid)
        return (
            <div className={classes.fileActionContainer}>
                <div className={classes.fileActionButton}>
                    <IconButton size={'small'}
                                onClick={() => selectedGid ? handleDeleteFile(raFileId.stdfileid) : setFile(null)}>
                        <DeleteOutlinedIcon style={{color: 'red'}}/>
                    </IconButton>
                </div>
                <object
                    type={file.type}
                    data={url}
                    width="150"
                    height={100}
                    style={{pointerEvents: 'none', overFlow: 'hidden', width: '150px', height: '100px', maxWidth: 150}}
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
                            getColumns={educationColumns}
                            getRows={educationList}
                            onRefresh={() => getEducationList()}
                            onAdd={() => handleOpenAddDialog(false)}
                            isDisabledAdd={!hasRightData || !hasRightData?.cana}
                            disabledAddInfoText={(!hasRightData || !hasRightData?.cana) && t('str_accessDenied')}
                            firstColumnActions={[
                                {
                                    hidden: !hasRightData || !hasRightData.canu,
                                    icon: <EditOutlined/>,
                                    title: t('str_edit'),
                                    onClick: (popupState, rowData) => {
                                        setSelectedEducationData(rowData)
                                        setSelectedGid(rowData?.gid || false)
                                        handleOpenAddDialog(rowData)
                                        popupState.close();
                                    }
                                },
                                {
                                    hidden: !hasRightData || !hasRightData.cand,
                                    icon: <DeleteOutlinedIcon style={{color: 'red'}}/>,
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
                                }}>{selectedEducationData ? t('str_editEducation') : t('str_addEducationInformation')}</Typography>
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
                                                                            <SmallViewFile/>
                                                                        </div>
                                                                    )
                                                                )
                                                            ) : (
                                                                file && (
                                                                    <div className={classes.viewFile}>
                                                                        <SmallViewFile/>
                                                                    </div>
                                                                )
                                                            )}
                                                    </Grid>
                                                </Grid>
                                            </Fieldset>
                                            <DropzoneDialog
                                                open={eduFileUploadStatus}
                                                onSave={(file) => {
                                                    setEduFileUploadStatus(false)
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
                                                filesLimit={3}
                                                maxFileSize={5000000}
                                                onClose={() => setEduFileUploadStatus(false)}
                                                submitButtonText={t('str_save')}
                                                cancelButtonText={t('str_cancel')}
                                                dialogTitle={t('str_uploadTheEducationCertificateFile')}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <AddDialogActions
                                                disabled={isSaving}
                                                loading={isSaving}
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
                            handleDeleteItem(selectedGid)
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

export default Education