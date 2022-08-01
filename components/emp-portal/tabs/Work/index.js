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
import getSymbolFromCurrency from "../../../../model/currency-symbol";
import Fab from "@material-ui/core/Fab";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import {DropzoneDialog} from "material-ui-dropzone";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import CloudDownloadOutlinedIcon from "@material-ui/icons/CloudDownloadOutlined";
import axios from "axios";
import MediaViewerDialog from "../../../../@webcms-ui/core/media-viewer-dialog";
import Fieldset from "../../../../@webcms-ui/core/fieldset";
import Legend from "../../../../@webcms-ui/core/legend";
import {EditOutlined} from "@material-ui/icons";
import CustomTable from "../../../CustomTable";

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

function WorkExperience(props) {

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
        company: {value: '', isError: false, required: true, helperText: ''},
        startdate: {value: '', isError: false, required: false, helperText: ''},
        enddate: {value: '', isError: false, required: false, helperText: ''},
        workpos: {value: '', isError: false, required: false, helperText: ''},
        worksalary: {value: '', isError: false, required: false, helperText: ''},
        leavereason: {value: '', isError: false, required: false, helperText: ''},
        stdfileid: {value: 0, isError: false, required: false, helperText: ''},
    }

    const [isLoadingList, setIsLoadingList] = useState(false)
    const [allHotels, setAllHotels] = useState(false)
    const [workExperienceList, setWorkExperienceList] = useState([])
    const [openAddDialog, setOpenAddDialog] = useState(false);

    const [selectedWorkExperienceData, setSelectedWorkExperienceData] = useState(null)
    const [selectedGid, setSelectedGid] = useState(false)
    const [getData, setGetData] = useState(null)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    const [isDef, setIsDef] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [workExperienceData, setWorkExperienceData] = useState(initialState)
    const [workExperienceDataBase, setWorkExperienceDataBase] = useState(initialState)
    const [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [workFileUploadStatus, setWorkFileUploadStatus] = useState(false)
    const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [mediaUrl, setMediaUrl] = useState('');
    const [fileType, setFileType] = useState('');
    const [isFileDownloading, setIsFileDownloading] = useState(false);
    const [hasRightData, setHasRightData] = useState();
    const [file, setFile] = useState(null)
    const [isSelectedFileLoading, setIsSelectedFileLoading] = useState(false)
    const [deleteOpenDialog, setDeleteOpenDialog] = useState(false);

    const openDialog = () => {
        setWorkFileUploadStatus(true)
    }

    const openTrackDialog = (popupState, gid) => {
        setSelectedGid(gid)
        setDeleteOpenDialog(true)
        popupState.close()
    }
    const formElements = [
        {
            type: ELEMENT_TYPES.textField,
            id: 'company',
            name: 'company',
            value: workExperienceData.company?.value,
            error: workExperienceData.company?.isError,
            required: workExperienceData.company?.isRequired,
            disabled: isSaving,
            label: t('str_company'),
            helperText: workExperienceData.company?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        },
        {
            type: ELEMENT_TYPES.datePicker,
            id: 'startdate',
            name: 'startdate',
            value: workExperienceData.startdate?.value,
            error: workExperienceData.startdate?.isError,
            required: workExperienceData.startdate?.isRequired,
            disabled: isSaving,
            label: t('str_startDate'),
            helperText: workExperienceData.startdate?.helperText,
            onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.datePicker,
            id: 'enddate',
            name: 'enddate',
            value: workExperienceData.enddate?.value,
            error: workExperienceData.enddate?.isError,
            required: workExperienceData.enddate?.isRequired,
            disabled: isSaving,
            label: t('str_endDate'),
            helperText: workExperienceData.enddate?.helperText,
            onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'workpos',
            name: 'workpos',
            value: workExperienceData.workpos?.value,
            error: workExperienceData.workpos?.isError,
            required: workExperienceData.workpos?.isRequired,
            disabled: isSaving,
            label: t('str_workPosition'),
            helperText: workExperienceData.workpos?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.numberFormat,
            id: 'worksalary',
            name: 'worksalary',
            value: Number(workExperienceData.worksalary?.value),
            error: workExperienceData.worksalary?.isError,
            required: workExperienceData.worksalary?.isRequired,
            disabled: isSaving,
            label: t('str_workSalary'),
            helperText: workExperienceData.worksalary?.helperText,
            onChange: (e, name) => handleChangeNumberFormat(e, name),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'leavereason',
            name: 'leavereason',
            value: workExperienceData.leavereason?.value,
            error: workExperienceData.leavereason?.isError,
            required: workExperienceData.leavereason?.isRequired,
            disabled: isSaving,
            label: t('str_reasonForQuit'),
            helperText: workExperienceData.leavereason?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        }
    ]

    const WorkExperienceColumns = [
        {
            title: t('str_company'),
            field: 'company',
            render: (props) => <TableColumnText>{props?.company}</TableColumnText>
        },
        {
            title: t('str_startDate'),
            field: 'startdate',
            render: (props) => <TableColumnText>{props?.startdate}</TableColumnText>
        },
        {
            title: t('str_endDate'),
            field: 'enddate',
            render: (props) => <TableColumnText>{props?.enddate}</TableColumnText>
        },
        {
            title: t('str_workPos'),
            field: 'workpos',
            render: (props) => <TableColumnText>{props?.workpos}</TableColumnText>
        },
        {
            title: t('str_workSalary'),
            field: 'worksalary',
            render: (props) =>
                <TableColumnText>{props?.worksalary} {getSymbolFromCurrency(props?.currencyCode || 'TL')}</TableColumnText>
        },
        {
            title: t('str_reasonForQuit'),
            field: 'leavereason',
            render: (props) => <TableColumnText>{props?.leavereason}</TableColumnText>
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
                            handlePreviewFile(props.mid, 'EMPWORK.CERT')
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
                        onClick={() => handleTaskFileDownload(props.mid, 'EMPWORK.CERT', props.description, props.tableData.id)}
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
            getWorkExperienceList()
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
        if (isEffect && workExperienceData && getData) {
            const newClientInitialState = helper.objectMapper(workExperienceData, getData, ['company'])
            setWorkExperienceData(newClientInitialState)
            setWorkExperienceDataBase(newClientInitialState)
            setIsInitialStateLoad(true)
        }


        return () => {
            isEffect = false
        }

    }, [getData])

    const handleDeleteItem = (gid) => {
        setIsDeleting(true)
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPWORK,
            token,
            gid: gid,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            }
        }).then((res) => {
            if (res.status === 200) {
                getWorkExperienceList()
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
                setIsDeleting(false)
            }
        })
    }

    const getWorkExperienceList = () => {
        setIsLoadingList(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPWORK,
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
                    setWorkExperienceList(res.data.data)
                }
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
        })
    }

    const handleGetSelectedWorkExperience = (selectedWorkExperience) => {
        if (selectedWorkExperience) {
            setIsDef(true)
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.EMPWORK + SLASH + OREST_ENDPOINT.VIEW + SLASH + 'get' + SLASH + selectedWorkExperience.gid,
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
            endpoint: OREST_ENDPOINT.EMPWORK + SLASH + OREST_ENDPOINT.DEF,
            token,
            params: {
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            if (res.status === 200 && res.data.count > 0) {
                const data = Object.assign({}, res.data.data, workExperienceData)
                setWorkExperienceData(data)
                setWorkExperienceDataBase(data)
            }
            setIsDef(false)
        })
    }

    const handleSave = () => {
        const data = {...workExperienceData}

        Object.keys(initialState).map((key) => {
            data[key] = typeof data[key].value === 'object' ? data[key].value ? data[key].value.id : null : data[key].value
        })
        if (empId) {
            setIsSaving(true)
            if (selectedGid) {
                Patch({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.EMPWORK,
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
                                code: 'EMPWORK.CERT',
                                orsactive: true,
                                hotelrefno: hotelRefNo
                            },
                            files: [file],
                        }).then(uploadRes => {
                        if (uploadRes.status === 200) {
                            enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                            setOpenAddDialog(false)
                            getWorkExperienceList()
                            handleReset()
                            setIsSaving(false)
                        }
                    })
                } else
                {
                    if (res.status === 200) {
                        enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                        setOpenAddDialog(false)
                        getWorkExperienceList()
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
                    endpoint: OREST_ENDPOINT.EMPWORK,
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
                                    code: 'EMPWORK.CERT',
                                    orsactive: true,
                                    hotelrefno: hotelRefNo
                                },
                                files: [file],
                            }).then(uploadRes => {
                                if (uploadRes.status === 200) {
                                    getWorkExperienceList()
                                    setOpenAddDialog(false)
                                    handleReset()
                                    setIsSaving(false)
                                } else {
                                    const error = isErrorMsg(uploadRes)
                                    enqueueSnackbar(error.errMsg, {variant: 'error'})
                                }
                            })
                        } else {
                            getWorkExperienceList()
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

    const handleChangeNumberFormat = (value, name) => {
        setWorkExperienceData({
            ...workExperienceData,
            [name]: {
                ...workExperienceData[name],
                value: value?.floatValue,
            }
        })
    }

    const handleOnChangeFormElements = (event, key, isOnBlur) => {
        const name = key ? key : event.target.name
        const value = event?.target ? event.target.value : event

        if (isOnBlur) {
            setWorkExperienceData({
                ...workExperienceData,
                [name]: {
                    ...workExperienceData[name],
                    isError: workExperienceData[name]?.isRequired && !!required(value),
                    helperText: workExperienceData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        } else {
            setWorkExperienceData({
                ...workExperienceData,
                [name]: {
                    ...workExperienceData[name],
                    value: name === "startdate" || name === "enddate" ? moment(value).format(OREST_ENDPOINT.DATEFORMAT) : value,
                    isError: workExperienceData[name]?.isRequired && !!required(value),
                    helperText: workExperienceData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        }
    }

    const handleOnBlurFormElements = (event, key) => {
        handleOnChangeFormElements(event, key, true)
    }

    const handleOpenAddDialog = (selectedWorkExperience = false) => {
        if (selectedWorkExperience) {
            handleGetSelectedWorkExperience(selectedWorkExperience)
        } else {
            handleDefRecord()
        }
        setOpenAddDialog(true)
    }

    const handleCloseDialog = () => {
        if (JSON.stringify(workExperienceData) !== JSON.stringify(workExperienceDataBase)) {
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
            setWorkExperienceData(initialState)
            setWorkExperienceDataBase(initialState)
            setSelectedWorkExperienceData(null)
            setSelectedGid(null)
            setFileType('');
            setMediaUrl('');
            setFile(null);
        }, 100)
    }

    const handlePreviewFile = (mid, code) => {
        setIsPreviewLoading(true)
        axios({
            url: `${GENERAL_SETTINGS.OREST_URL}/tools/file/download`,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            method: 'get',
            responseType: 'arraybuffer',
            params: {
                mid: mid,
                code: code,
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            },
        }).then((r) => {
            if (r.status === 200) {
                let blob = new Blob([r.data], {type: r.data.type})
                    , url = URL.createObjectURL(blob)

                setMediaUrl(url)
                setIsPreviewLoading(false)
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
                query: `id:${id},code:EMPWORK.CERT`,
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
        const raFileId = workExperienceList.find(e => e.gid === selectedGid)
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
                            getColumns={WorkExperienceColumns}
                            getRows={workExperienceList}
                            onRefresh={() => getWorkExperienceList()}
                            onAdd={() => handleOpenAddDialog(false)}
                            isDisabledAdd={!hasRightData || !hasRightData?.cana}
                            disabledAddInfoText={(!hasRightData || !hasRightData?.cana) && t('str_accessDenied')}
                            firstColumnActions={[
                                {
                                    hidden: !hasRightData || !hasRightData.canu,
                                    icon: <EditOutlined />,
                                    title: t('str_edit'),
                                    onClick: (popupState, rowData) => {
                                        setSelectedWorkExperienceData(rowData)
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
                <Dialog open={openAddDialog} disableEnforceFocus maxWidth={'sm'} fullWidth>
                    <div style={{padding: 24}}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography style={{
                                    fontWeight: '600',
                                    fontSize: '18px'
                                }}>{selectedWorkExperienceData ? t('str_editWork') : t('str_addWorkExperience')}</Typography>
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
                                                open={workFileUploadStatus}
                                                onSave={(file) => {
                                                    setWorkFileUploadStatus(false)
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
                                                onClose={() => setWorkFileUploadStatus(false)}
                                                submitButtonText={t('str_save')}
                                                cancelButtonText={t('str_cancel')}
                                                dialogTitle={t('str_uploadTheWorkCertificateFile')}
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

export default WorkExperience