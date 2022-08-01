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
import Fab from "@material-ui/core/Fab";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import {DropzoneDialog} from "material-ui-dropzone";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import CloudDownloadOutlinedIcon from "@material-ui/icons/CloudDownloadOutlined";
import {PreviewFile} from "../../../../model/orest/components/RaFile";
import axios from "axios";
import MediaViewerDialog from "../../../../@webcms-ui/core/media-viewer-dialog";
import CustomTable from "../../../CustomTable";
import {EditOutlined} from "@material-ui/icons";
import Fieldset from "../../../../@webcms-ui/core/fieldset";
import Legend from "../../../../@webcms-ui/core/legend";

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

function Abilities(props) {

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
    const state = useSelector((state) => state?.orest?.state?.emp?.mid || false)

    //locale state
    const initialState = {
        abilityid: {value: '', isError: false, required: true, helperText: ''},
        abilitylevel: {value: '', isError: false, required: false, helperText: ''},
        description: {value: '', isError: false, required: false, helperText: ''},
        stdfileid: {value: 0, isError: false, required: false, helperText: ''},
    }

    const [isLoadingList, setIsLoadingList] = useState(false)
    const [allHotels, setAllHotels] = useState(false)
    const [abilityList, setAbilityList] = useState([])
    const [openAddDialog, setOpenAddDialog] = useState(false);

    const [selectedabilityData, setSelectedabilityData] = useState(null)
    const [selectedGid, setSelectedGid] = useState(false)
    const [getData, setGetData] = useState(null)
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    const [isDef, setIsDef] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [abilityData, setAbilityData] = useState(initialState)
    const [abilityDataBase, setAbilityDataBase] = useState(initialState)
    const [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [abilityFileUploadStatus, setAbilityFileUploadStatus] = useState(false)
    const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [mediaUrl, setMediaUrl] = useState('');
    const [fileType, setFileType] = useState('');
    const [isFileDownloading, setIsFileDownloading] = useState(false);
    const [hasRightData, setHasRightData] = useState()
    const [file, setFile] = useState(null)
    const [isSelectedFileLoading, setIsSelectedFileLoading] = useState(false);
    const [deleteOpenDialog, setDeleteOpenDialog] = useState(false);

    const openDialog = () => {
        setAbilityFileUploadStatus(true)
    }

    const openTrackDialog = (popupState, gid) => {
        setSelectedGid(gid)
        setDeleteOpenDialog(true)
        popupState.close()
    }

    const formElements = [
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'abilityid',
            name: 'abilityid',
            value: abilityData.abilityid?.value || null,
            disabled: isSaving,
            label: t('str_abilities'),
            variant: VARIANT,
            required: abilityData.abilityid?.isRequired,
            error: abilityData.abilityid?.isError,
            helperText: abilityData.abilityid?.helperText,
            onChange: (newValue, name) => handleOnChangeFormElements(newValue, name),
            onBlur: (e, name) => handleOnBlurFormElements(e, name),
            onLoad: (initialValue, name) => {
                const data = {...abilityData}
                data[name].value = initialValue ? initialValue : null
                setAbilityData(data)
            },
            endpoint: 'ability/view/list',
            params: {text: '', limit: 25, field: 'code'},
            initialId: isInitialStateLoad && selectedabilityData?.abilityid || false,
            showOptionLabel: 'code',
            showOption: 'code',
            searchParam: 'code,description',
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.numberFormat,
            id: 'abilitylevel',
            name: 'abilitylevel',
            value: Number(abilityData.abilitylevel?.value),
            currencyCode: 'null',
            error: abilityData.abilitylevel?.isError,
            required: abilityData.abilitylevel?.isRequired,
            disabled: isSaving,
            label: t('str_level'),
            helperText: abilityData.abilitylevel?.helperText,
            onChange: (e, name) => handleChangeNumberFormat(e, name),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 6}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'description',
            name: 'description',
            value: abilityData.description?.value,
            error: abilityData.description?.isError,
            required: abilityData.description?.isRequired,
            disabled: isSaving,
            label: t('str_description'),
            helperText: abilityData.description?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12, sm: 12}
        }
    ]

    const abilityColumns = [
        {
            title: t('str_abilities'),
            field: 'ability',
            render: (props) => <TableColumnText minWidth={150}>{props?.ability}</TableColumnText>
        },
        {
            title: t('str_level'),
            field: 'abilitylevel',
            render: (props) => <TableColumnText>{props?.abilitylevel}</TableColumnText>
        },
        {
            title: t('str_description'),
            field: 'description',
            render: (props) => <TableColumnText minWidth={150}>{props?.description}</TableColumnText>
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
                            handlePreviewFile(props.mid, 'EMPABILITY.CERT')
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
                        onClick={() => handleTaskFileDownload(props.mid, 'EMPABILITY.CERT', props.description, props.tableData.id)}
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
            getAbilityList()
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
        if (isEffect && abilityData && getData) {
            const newClientInitialState = helper.objectMapper(abilityData, getData, ['abilityid'])
            setAbilityData(newClientInitialState)
            setAbilityDataBase(newClientInitialState)
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
            endpoint: OREST_ENDPOINT.EMPABILITY,
            token,
            gid: gid,
            params: {
                hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
            }
        }).then((res) => {
            if (res.status === 200) {
                getAbilityList()
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
                setIsDeleting(false)
            }
        })
    }

    const getAbilityList = () => {
        setIsLoadingList(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPABILITY,
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
                    setAbilityList(res.data.data)
                }
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
        })
    }

    const handleGetSelectedability = (selectedability) => {
        if (selectedability) {
            setIsDef(true)
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.EMPABILITY + SLASH + OREST_ENDPOINT.VIEW + SLASH + 'get' + SLASH + selectedability.gid,
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
            endpoint: OREST_ENDPOINT.EMPABILITY + SLASH + OREST_ENDPOINT.DEF,
            token,
            params: {
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            if (res.status === 200 && res.data.count > 0) {
                const data = Object.assign({}, res.data.data, abilityData)
                setAbilityData(data)
                setAbilityDataBase(data)
            }
            setIsDef(false)
        })
    }

    const handleChangeNumberFormat = (value, name) => {
        setAbilityData({
            ...abilityData,
            [name]: {
                ...abilityData[name],
                value: value?.floatValue,
            }
        })
    }

    const handleSave = () => {
        const data = {...abilityData}
        Object.keys(initialState).map((key) => {
            data[key] = typeof data[key].value === 'object' ? data[key].value ? data[key].value.id : null : data[key].value
        })
        if (empId) {
            setIsSaving(true)
            if (selectedGid) {
                Patch({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.EMPABILITY,
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
                                code: 'EMPABILITY.CERT',
                                orsactive: true,
                                hotelrefno: hotelRefNo
                            },
                            files: [file],
                        }).then(uploadRes => {
                            if (uploadRes.status === 200) {
                                enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                                setOpenAddDialog(false)
                                getAbilityList()
                                handleReset()
                                setIsSaving(false)
                            }
                        })
                    } else {
                        if (res.status === 200) {
                            enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                            setOpenAddDialog(false)
                            getAbilityList()
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
                    endpoint: OREST_ENDPOINT.EMPABILITY,
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
                                    code: 'EMPABILITY.CERT',
                                    orsactive: true,
                                    hotelrefno: hotelRefNo
                                },
                                files: [file],
                            }).then(uploadRes => {
                                if (uploadRes.status === 200) {
                                    getAbilityList()
                                    setOpenAddDialog(false)
                                    handleReset()
                                    setIsSaving(false)
                                } else {
                                    const error = isErrorMsg(uploadRes)
                                    enqueueSnackbar(error.errMsg, {variant: 'error'})
                                }
                            })
                        } else {
                            getAbilityList()
                            setOpenAddDialog(false)
                            handleReset()
                            setIsSaving(false)
                        }
                    } else {
                        const error = isErrorMsg(res)
                        enqueueSnackbar(error.errorMsg, {variant: 'error'})
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
            setAbilityData({
                ...abilityData,
                [name]: {
                    ...abilityData[name],
                    isError: abilityData[name]?.isRequired && !!required(value),
                    helperText: abilityData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        } else {
            setAbilityData({
                ...abilityData,
                [name]: {
                    ...abilityData[name],
                    value: value,
                    isError: abilityData[name]?.isRequired && !!required(value),
                    helperText: abilityData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        }
    }

    const handleOnBlurFormElements = (event, key) => {
        handleOnChangeFormElements(event, key, true)
    }

    const handleOpenAddDialog = (selectedability = false) => {
        if (selectedability) {
            handleGetSelectedability(selectedability)
        } else {
            handleDefRecord()
        }
        setOpenAddDialog(true)
    }

    const handleCloseDialog = () => {
        if (JSON.stringify(abilityData) !== JSON.stringify(abilityDataBase)) {
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
            setAbilityData(initialState)
            setAbilityDataBase(initialState)
            setSelectedabilityData(null)
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
                query: `id:${id},code:EMPABILITY.CERT`,
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
        const raFileId = abilityList.find(e => e.gid === selectedGid)
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
                            getColumns={abilityColumns}
                            getRows={abilityList}
                            onRefresh={() => getAbilityList()}
                            onAdd={() => handleOpenAddDialog(false)}
                            isDisabledAdd={!hasRightData || !hasRightData?.cana}
                            disabledAddInfoText={(!hasRightData || !hasRightData?.cana) && t('str_accessDenied')}
                            firstColumnActions={[
                                {
                                    hidden: !hasRightData || !hasRightData.canu,
                                    icon: <EditOutlined/>,
                                    title: t('str_edit'),
                                    onClick: (popupState, rowData) => {
                                        setSelectedabilityData(rowData)
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
                                }}>{selectedabilityData ? t('str_editAbility') : t('str_addAbilities')}</Typography>
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
                                                open={abilityFileUploadStatus}
                                                onSave={(file) => {
                                                    setAbilityFileUploadStatus(false)
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
                                                onClose={() => setAbilityFileUploadStatus(false)}
                                                submitButtonText={t('str_save')}
                                                cancelButtonText={t('str_cancel')}
                                                dialogTitle={t('str_uploadTheAbilityCertificateFile')}
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

export default Abilities