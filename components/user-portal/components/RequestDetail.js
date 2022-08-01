import React, { useState, useContext, useEffect } from 'react'
import { connect, useSelector } from 'react-redux'
import axios from 'axios'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import WebCmsGlobal from 'components/webcms-global'
import { makeStyles } from '@material-ui/core/styles'
import { UseOrest, ViewList, Delete, Upload } from '@webcms/orest'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { DEFAULT_OREST_TOKEN, isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST } from 'model/orest/constants'
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Dialog,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Menu,
    MenuItem,
    Tab,
    Tabs,
    Paper,
    Typography,
    Fab
} from "@material-ui/core";
import LoadingSpinner from '../../LoadingSpinner'
import MaterialTable, {MTableHeader, MTableToolbar} from 'material-table';
import { DropzoneDialog } from 'material-ui-dropzone'
import ViewQuiltIcon from '@material-ui/icons/ViewQuilt'
import EventNoteIcon from '@material-ui/icons/EventNote'
import SubjectIcon from '@material-ui/icons/Subject'
import NoteIcon from '@material-ui/icons/Note'
import CachedIcon from "@material-ui/icons/Cached";
import AddIcon from "@material-ui/icons/Add";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import PhoneIcon from '@material-ui/icons/Phone';
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {CustomToolTip} from './CustomToolTip/CustomToolTip';
import { useSnackbar } from 'notistack';
import moment from 'moment'
import MaterialTableLocalization from "../../MaterialTableLocalization";
import CommonNotes from "../../CommonNotes";
import {SLASH} from "../../../model/globals";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import TableColumnText from "../../TableColumnText";
import TrackedChangesDialog from "../../TrackedChangesDialog";
import MaterialTableGeneric from "../../MaterialTableGeneric";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import AddRaTagDialog from "../../AddRaTagDialog";
import {PreviewFile} from "../../../model/orest/components/RaFile";
import MediaViewerDialog from "../../../@webcms-ui/core/media-viewer-dialog";



const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    listRoot: {
        width: '100%',
        maxHeight: 500,
        minHeight: 500,
        overflowY: 'scroll',
        overflowX: 'hidden',
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    field: {
        marginRight: theme.spacing(1),
    },
    tabPanel: {
        padding: 0,
    },
    tableTitle: {
        fontSize:"24px",
        [theme.breakpoints.down("sm")]: {
            fontSize:"14px",
            textAlign:"center"
        },
    },
    table: {
        '& .MuiTableCell-root': {
            padding: '10px'
        },
        "& tbody>.MuiTableRow-root:hover": {
            backgroundColor: "rgb(163, 166, 180,0.1)"
        },
    },
    dateText: {
        fontSize:"13px"
    },
    overFlowDescriptionText: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontSize:"13px",
        color:"#4D4F5C"
    },
    descriptionText: {
        fontSize:"13px",
        color:"#4D4F5C"
    },
    avatarStyle: {
        backgroundColor: theme.palette.primary.main
    },
    tabsRoot: {
        "& .Mui-selected ": {
            color:"#4666B0",
        },
        "& .MuiTabs-indicator": {
            backgroundColor:"#4666B0"
        }
    },
    iconButton: {
        padding: 0,
    },
    iconStyle: {
        fontSize: 20
    },
    standardText: {
        fontSize: 'inherit',
        minWidth: '100px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },
    menuButton: {
        width: '100%',
        minWidth: 'unset'
    },
    popoverStyle: {
        width:"140px",
    },
}))

function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-force-tabpanel-${index}`}
            aria-labelledby={`scrollable-force-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3} style={{ padding: 0 }}>
                    {children}
                </Box>
            )}
        </div>
    )
}

function a11yProps(index) {
    return {
        id: `scrollable-force-tab-${index}`,
        'aria-controls': `scrollable-force-tabpanel-${index}`,
    }
}

const RequestDetail = (props) => {
    const classes = useStyles()
    const { enqueueSnackbar } = useSnackbar();

    //props
    const { state, taskmid, taskHotelRefNo, tableName, gid, setToState } = props

    //context
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    //redux
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const token = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    )

    //state
    const [isInfoLoading, setIsInfoLoading] = useState(false);
    const [taskPanelStatus, setTaskPanelStatus] = useState(0)
    const [taskTransList, setTaskTransList] = useState([])
    const [taskTransListLoading, setTaskTransListLoading] = useState(false)
    const [taskFileList, setTaskFileList] = useState([])
    const [taskFileListLoading, setTaskFileListLoading] = useState(false)
    const [taskFileUploadStatus, setTaskFileUploadStatus] = useState(false)
    const [hasRightData, setHasRightData] = useState()
    const [tabList, setTabList] = useState([]);
    const [isFileDownloading, setIsFileDownloading] = useState(false);
    const [isFileDeleting, setIsFileDeleting] = useState(false);
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    const [deleteFileInfo, setDeleteFileInfo] = useState(false);
    const [popupState, setPopupState] = useState({});
    const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [mediaUrl, setMediaUrl] = useState('');
    const [fileType, setFileType] = useState('');

    const [isTagLoading, setIsTagLoading] = useState(false);
    const [tagList, setTagList] = useState([]);
    const [openAddRaTagDialog, setOpenAddRaTagDialog] = useState(false);

    const tableLocalization = MaterialTableLocalization();

    const mimeTypes = {
        image: 'image',
        audio: 'audio',
        video: 'video'
    }

    const tabKeys = {
        noteCount: 'notecount',
        transCount: 'transcount',
        fileCount: 'filecount'
    }

    const handleChange = (event, newValue) => {
        setTaskPanelStatus(newValue)
    }

    const handleReset = () => {
        setFileType('');
        setMediaUrl('');
    }

    const taskPanels = {
        noteList: 0,
        transList: 1,
        fileList: 2,
        tagList: 3
    }

    const getTaskFileList = () => {
        setTaskFileListLoading(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token,
            params: {
                query: `masterid:${state.currentTask.mid},isactive:true`,
                limit: 100,
                hotelrefno: taskHotelRefNo,
            },
        }).then((r) => {
            if (r.status === 200 && r.data.data.length > 0) {
                setTaskFileList(r.data.data)
                setTaskFileListLoading(false)
            } else {
                setTaskFileList([])
                setTaskFileListLoading(false)
            }
        })
    }

    const getTagList = () => {
        setIsTagLoading(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RATAG,
            token,
            params: {
                query: `masterid:${state.currentTask.mid}`,
                limit: 100,
                hotelrefno: taskHotelRefNo,
            },
        }).then((r) => {
            setIsTagLoading(false);
            if (r.status === 200) {
                setTagList(r.data.data.length > 0 ? r.data.data : [])
            } else {
                const error = isErrorMsg(r)
                enqueueSnackbar(error.errMsg, {variant: 'error'})

            }
        })
    }

    useEffect(() => {
        let active = true
        if (active) {
            setIsInfoLoading(true);
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: tableName + SLASH + OREST_ENDPOINT.STAT + SLASH + OREST_ENDPOINT.INFO,
                token,
                params: {
                    gid: gid,
                    hotelrefno: taskHotelRefNo
                }
            }).then(res => {
                setIsInfoLoading(false);
                if(res.status === 200 && res.data.data) {
                    const info = res.data.data
                    const tempArray = [];
                    Object.keys(info).forEach((key) => {
                        if(key === tabKeys.noteCount || key === tabKeys.transCount || key === tabKeys.fileCount) {
                            tempArray.push({
                                label: key === tabKeys.noteCount ? t('str_notes') : key === tabKeys.transCount ? t('str_trans') : key === tabKeys.fileCount ? t('str_files') : '',
                                renderNumber: key === tabKeys.noteCount ? taskPanels.noteList : key === tabKeys.transCount ? taskPanels.transList : key === tabKeys.fileCount ? taskPanels.fileList : '',
                            })
                        }
                    })
                    tempArray.push({
                        label: t('str_tags'),
                        renderNumber: taskPanels.tagList,
                    })
                    setTabList(tempArray)

                }
            })
        }

        return () => {
            active = false
        }
    }, [taskmid])

    useEffect(() => {
        if (tabList[taskPanelStatus]?.renderNumber === taskPanels.transList) {
            setTaskTransListLoading(true)
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSLINE,
                token,
                params: {
                    query: `transno::${state.currentTask.transno},isprivate::false`,
                    limit: 100,
                    hotelrefno: taskHotelRefNo,
                },
            }).then((r) => {
                if (r.status === 200 && r.data.data.length > 0) {
                    setTaskTransList(r.data.data)
                    setTaskTransListLoading(false)
                } else {
                    setTaskTransList([])
                    setTaskTransListLoading(false)
                }
            })
        }

        if (tabList[taskPanelStatus]?.renderNumber === taskPanels.fileList) {
            getTaskFileList()
        }
        if(tabList[taskPanelStatus]?.renderNumber === taskPanels.tagList) {
            getTagList();
        }
    }, [taskPanelStatus, taskmid])
    
    const endDateHeader = () => {
        return(
            <CustomToolTip title={t('str_endDateTime')} placement={"top"} arrow>
                <Typography style={{fontSize:"12px"}}>{t('str_endDT')}</Typography>
            </CustomToolTip>
        );
    }
    
    const transNoteCell = (state) => {
        if(state.note?.length > 50) {
            return(
                <CustomToolTip title={state.note} placement={"top"} arrow>
                    <Typography className={classes.overFlowDescriptionText}>{state.note}</Typography>
                </CustomToolTip>
            );
        } else {
            return(
                <Typography key={state.transno} className={classes.descriptionText}>{state.note}</Typography>
            );
        }
    }
    
    const transTime = (state) => {
        const fullEndTime =  state.endtime.split(":");
        const endTime = fullEndTime[0] + ":" + fullEndTime[1];
        const transTime = state.transdate + " " + endTime;
        return(
            <Typography className={classes.dateText}>
                {transTime}
            </Typography>
        );
    }

    const taskColumns = [
        {
            title: t('str_empCode'),
            field: 'empcode',
            cellStyle: {
                minWidth: 70,
            },
        },
        {
            title:t('str_workType'),
            field: 'worktypecode',
            cellStyle: {
                minWidth: 120,
            },
        },
        {
            title: t('str_note'),
            field: 'note',
            render: state => transNoteCell(state),
            cellStyle: {
                minWidth: 260,
                maxWidth: 260,
            },
        },
        {
            title: endDateHeader(),
            field: 'transdate',
            render: state => transTime(state),
            cellStyle: {
                minWidth: 120,
            },
        },
    ]

    const fileColumns = [
        {
            title: (
                <Button className={classes.menuButton} style={{padding: 0, margin: 0}} disabled>
                    <MoreVertIcon className={classes.iconStyle} />
                </Button>
            ),
            field: '',
            headerStyle: {
                maxWidth: 64
            },
            cellStyle: {
                whiteSpace: 'nowrap',
                borderLeft: '1px solid rgba(224, 224, 224, 1)',
                maxWidth: '64px'
            },
            render: props => (
                <PopupState variant="popover" popupId="status-menu">
                    {(popupState) => (
                        <React.Fragment>
                            <Button className={classes.menuButton} color={'primary'} variant={'contained'} {...bindTrigger(popupState)}>
                                <MoreVertIcon className={classes.iconStyle} />
                            </Button>
                            <Menu
                                classes={{
                                    paper: classes.popoverStyle,
                                }}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left"
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "left"
                                }}
                                getContentAnchorEl={null}
                                {...bindMenu(popupState)}
                            >
                                <MenuItem
                                    onClick={() => {
                                        setOpenPreviewDialog(true);
                                        handlePreviewFile(props?.gid, props?.url, popupState)
                                    }}
                                    disabled={isFileDeleting || isFileDownloading}
                                >
                                    <VisibilityOutlinedIcon />
                                    <Typography style={{paddingLeft: '8px'}}>{t('str_preview')}</Typography>
                                </MenuItem>
                                {
                                    hasRightData?.cand && (
                                        <MenuItem
                                            onClick={() => {
                                                setOpenTrackedDialog(true)
                                                setDeleteFileInfo(props);
                                                setPopupState(popupState);
                                            }}
                                            disabled={isFileDeleting || isFileDownloading}
                                        >
                                            {isFileDeleting ? <LoadingSpinner size={18}/> : <DeleteOutlinedIcon />}
                                            <Typography style={{paddingLeft: '8px'}}>{t('str_delete')}</Typography>
                                        </MenuItem>
                                    )
                                }
                                <MenuItem
                                    onClick={() => handleTaskFileDownload(props.filename, props.gid, props.url, popupState)}
                                    disabled={isFileDeleting || isFileDownloading}
                                >
                                    {isFileDownloading ? <LoadingSpinner size={18}/> : <CloudDownloadOutlinedIcon/>}
                                    <Typography style={{paddingLeft: '8px'}}>{t('str_download')}</Typography>
                                </MenuItem>
                            </Menu>
                        </React.Fragment>
                    )}
                </PopupState>
            )
        },
        {
            title: t('str_code'),
            field: 'code',
            render: props => <TableColumnText maxWidth={150}>{props.code}</TableColumnText>
        },
        {
            title: t('str_description'),
            field: 'description',
            render: props => <TableColumnText minWidth={250} maxWidth={250}>{props.description}</TableColumnText>
        },
        { title: t('str_fileType'), field: 'filetype' },
        { title: t('str_contentType'), field: 'contentypedesc' },
        {
            title: t('str_fileDesc'),
            field: 'filename',
            render: props => <TableColumnText minWidth={150} maxWidth={150}>{props.filename}</TableColumnText>
        },
        {
            title: t('str_caption'),
            field: 'caption',
            render: props => <TableColumnText minWidth={150} maxWidth={150}>{props.caption}</TableColumnText>
        },
        {
            title: t('str_updated'),
            field: 'insdatetime',
            render: state => <TableColumnText minWidth={150}>{moment(state.insdatetime).format('L  LT')}</TableColumnText>
        },
        {
            title: t('str_fileUrl'),
            field: 'fileurl',
            render: props => <TableColumnText maxWidth={150} showToolTip>{props.fileurl}</TableColumnText>
        },
        {
            title: t('str_masterId'),
            field: 'masterid',
            headerStyle: {
                textAlign: 'right'
            },
            render: props => <TableColumnText textAlign={'right'}>{props.masterid}</TableColumnText>
        },
        { title: t('str_language'), field: 'langcode' },
        {
            title: t('str_id'),
            field: 'id',
            headerStyle: {
                textAlign: 'right'
            },
            render: props => <TableColumnText textAlign={'right'}>{props.id}</TableColumnText>
        },

    ]

    const handleTaskFileUpload = (file) => {
        Upload({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            token,
            params: {
                masterid: state.currentTask.mid,
                orsactive: true,
                hotelrefno: taskHotelRefNo,
                quality:"0.1F"
            },
            files: file,
        }).then((r) => {
            setTaskFileUploadStatus(false)
            if (r.status === 200) {
                getTaskFileList()
                enqueueSnackbar(t('str_haveBeenUploadedMsg'), { variant: 'success' })
            } else {
                const error = isErrorMsg(r);
                enqueueSnackbar(t(error.errMsg), { variant: 'error' })
            }
        })
    }

    const handleTaskFileDelete = (gid) => {
        setIsFileDeleting(true);
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token,
            gid: gid,
            params: {
                hotelrefno: taskHotelRefNo,
            },
        }).then((r) => {
            setIsFileDeleting(false);
            if (r.status === 200) {
                popupState?.close();
                getTaskFileList();
                enqueueSnackbar(t('str_selectedDeletedMsg'), { variant: 'success' });
            } else {
                const error = isErrorMsg(r);
                enqueueSnackbar(t(error.errMsg), { variant: 'error' });
            }
        })
    }

    useEffect(() => {
            axios({
                url:
                    GENERAL_SETTINGS.OREST_URL +
                    OREST_ENDPOINT.SLASH +
                    OREST_ENDPOINT.TOOLS +
                    OREST_ENDPOINT.SLASH +
                    OREST_ENDPOINT.USER +
                    OREST_ENDPOINT.SLASH +
                    OREST_ENDPOINT.HASRIGHT,
                method: REQUEST_METHOD_CONST.GET,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    empid: loginfo.id,
                    submoduleid: 9706,
                },
            }).then((res) => {
                if (res.status === 200) {
                     setHasRightData(res.data.data)
                } else if(res.status === 401){
                    enqueueSnackbar('401 Unauthorized', { variant: 'error' })
                } else if(res.status === 403) {
                    enqueueSnackbar('403 Forbidden', { variant: 'error' })
                }
            })
    }, [])


    const handlePreviewFile = (gid, fileUrl, popupState) => {
        setIsPreviewLoading(true);
        popupState.close();
        PreviewFile(GENERAL_SETTINGS, token, gid, fileUrl, taskHotelRefNo).then(res => {
            setIsPreviewLoading(false);
            if(res.success) {
                setMediaUrl(res?.url);
                setFileType(res?.fileType)
            } else {
                enqueueSnackbar(t(res?.errorText), { variant: res?.variant || 'error' })
            }
        })
    }

    const handleTaskFileDownload = (filename, gid, fileUrl, popupState) => {
        if(fileUrl.includes('http://') || fileUrl.includes('https://')) {
            popupState.close();
            const win = window.open(fileUrl, '_blank');
            if (win != null) {
                win.focus();
            }
        } else {
            setIsFileDownloading(true);
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
                    hotelrefno: taskHotelRefNo,
                },
                responseType: 'blob',
            }).then((response) => {
                setIsFileDownloading(false);
                if (response.status === 200) {
                    const url = window.URL.createObjectURL(new Blob([response.data]))
                    const link = document.createElement('a')
                    link.href = url
                    link.setAttribute('download', filename.toLowerCase()) //or any other extension
                    document.body.appendChild(link)
                    link.click()
                    link.remove()
                    popupState.close();
                    enqueueSnackbar(t('str_selectedDownloadedMsg'), { variant: 'success' })
                } else {
                    const error = isErrorMsg(response)
                    enqueueSnackbar(t(error.errMsg), { variant: 'error' })
                }
            })
        }
    }

    const handleBack = () => {
        setToState('userPortal', ['panelStatus'], state.panels.requestList)
    }

    return (
        <React.Fragment>
            <Grid container direction="row" className={classes.root} style={{minHeight: '50vh'}} spacing={3}>
                <Grid item xs={12} style={{alignSelf: 'center'}}>
                    <CustomToolTip title={t('str_back')}>
                        <Fab size="medium" color="primary" aria-label="back" onClick={() => handleBack()}>
                            <ArrowBackIcon />
                        </Fab>
                    </CustomToolTip>
                </Grid>
                <Grid item xs={12} sm={tableName === OREST_ENDPOINT.TSTRANS ? 4 : 3} >
                    <Paper square className={classes.root}>
                        <List className={classes.root}>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar className={classes.avatarStyle} >
                                        <b>#</b>
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={t('str_transNo')} secondary={state.currentTask?.transno} />
                            </ListItem>
                            {
                                state.currentTask?.roomno && (
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar className={classes.avatarStyle}>
                                                <ViewQuiltIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={t('str_module')} secondary={state.currentTask?.roomno} />
                                    </ListItem>
                                )
                            }
                            {
                                state.currentTask?.transdate && (
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar className={classes.avatarStyle}>
                                                <EventNoteIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={t('str_transDate')} secondary={state.currentTask?.transdate} />
                                    </ListItem>
                                )
                            }
                            {
                                state.currentTask?.callednumber && (
                                    <ListItem>
                                        <ListItemAvatar>
                                            <Avatar className={classes.avatarStyle}>
                                                <PhoneIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={t('str_calledNumber')} secondary={state.currentTask?.callednumber} />
                                    </ListItem>
                                )
                            }
                            {state.currentTask?.description && (
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar className={classes.avatarStyle}>
                                            <SubjectIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={t('str_description')} secondary={state.currentTask?.description} />
                                </ListItem>
                                )
                            }
                            {state.currentTask?.note && (
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar className={classes.avatarStyle}>
                                            <NoteIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={t('str_note')} secondary={state.currentTask?.note} />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={tableName === OREST_ENDPOINT.TSTRANS ? 8 : 9} >
                    {
                        isInfoLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <Paper square className={classes.root}>
                                <AppBar position="static" color="default">
                                    <Tabs
                                        color={'primary'}
                                        variant="fullWidth"
                                        value={taskPanelStatus}
                                        onChange={handleChange}
                                        scrollButtons="on"
                                    >
                                        {
                                            tabList.sort((a,b) => a.renderNumber - b.renderNumber).map((item, index) => (
                                                <Tab key={index} label={item.label} {...a11yProps(index)} />
                                            ))
                                        }
                                    </Tabs>
                                </AppBar>
                                {
                                    tabList.sort((a,b) => a.renderNumber - b.renderNumber).map((item, index) => (
                                        <TabPanel value={taskPanelStatus} index={index} key={index}>
                                            <div style={{paddingTop: '16px'}}>
                                                {item.renderNumber === taskPanels.noteList ? (
                                                    <CommonNotes
                                                        initialIncDone={false}
                                                        mid={taskmid}
                                                        dataHotelRefNo={taskHotelRefNo}
                                                    />
                                                ) : item.renderNumber === taskPanels.transList ? (
                                                    <div className={classes.table}>
                                                        <MaterialTable
                                                            title={
                                                                <Typography className={classes.tableTitle}>Trans list</Typography>
                                                            }
                                                            columns={taskColumns}
                                                            data={taskTransList}
                                                            isLoading={taskTransListLoading}
                                                            localization={MaterialTableLocalization}
                                                            options={{
                                                                headerStyle:{
                                                                    fontWeight:"bold",
                                                                    fontSize:"12px",
                                                                    color:"#A3A6B4",
                                                                    textTransform:"uppercase",
                                                                    backgroundColor:"#F5F6FA",
                                                                }
                                                            }}
                                                            components={{
                                                                Toolbar: props => (
                                                                    <div className={classes.tableTitle}>
                                                                        <MTableToolbar {...props} />
                                                                    </div>
                                                                )
                                                            }}
                                                        />
                                                    </div>
                                                ) : item.renderNumber === taskPanels.fileList ? (
                                                    <Grid container>
                                                        <Grid item xs={12}>
                                                            <Grid container spacing={3}>
                                                                <Grid item xs={4} sm={3}>
                                                                    <Grid container>
                                                                        <Grid item xs={6} sm={3}>
                                                                            <CustomToolTip title={t('str_refresh')}>
                                                                                <IconButton
                                                                                    onClick={getTaskFileList}
                                                                                >
                                                                                    <CachedIcon style={{color:"#F16A4B"}}/>
                                                                                </IconButton>
                                                                            </CustomToolTip>
                                                                        </Grid>
                                                                        <Grid item xs={6} sm={3}>
                                                                            <CustomToolTip title={t('str_add')}>
                                                                                <IconButton
                                                                                    onClick={() => setTaskFileUploadStatus(true)}
                                                                                >
                                                                                    <AddIcon/>
                                                                                </IconButton>
                                                                            </CustomToolTip>
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid item xs={8}>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <div className={classes.table}>
                                                                <MaterialTable
                                                                    columns={fileColumns}
                                                                    data={taskFileList}
                                                                    isLoading={taskFileListLoading}
                                                                    options={{
                                                                        headerStyle:{
                                                                            cursor: 'default',
                                                                            fontWeight:"bold",
                                                                            fontSize:"12px",
                                                                            color:"#A3A6B4",
                                                                            textTransform:"uppercase",
                                                                            backgroundColor:"#F5F6FA",
                                                                            whiteSpace: 'nowrap',
                                                                            borderLeft: '1px solid #FFF',
                                                                        },
                                                                        cellStyle: {
                                                                            whiteSpace: 'nowrap',
                                                                            borderLeft: '1px solid rgba(224, 224, 224, 1)',
                                                                            minWidth: '100px',
                                                                            fontSize: '13px',
                                                                        },
                                                                        toolbar: false,
                                                                        selection: false,
                                                                        sorting: false,
                                                                        search: false,
                                                                        actionsColumnIndex: 1,
                                                                        selectionColumnIndex: 1
                                                                    }}
                                                                    localization={tableLocalization}
                                                                    components={{
                                                                        Header: (props) => {
                                                                            const overrideProps = {...props}
                                                                            overrideProps.draggable = false
                                                                            return(
                                                                                <MTableHeader  {...overrideProps}/>
                                                                            )
                                                                        },
                                                                    }}
                                                                />
                                                            </div>
                                                        </Grid>
                                                    </Grid>
                                                ) : item.renderNumber === taskPanels.tagList ? (
                                                    <Grid container>
                                                        <Grid item xs={12}>
                                                            <MaterialTableGeneric
                                                                isLoading={isTagLoading}
                                                                hoverFirstColumn={false}
                                                                showMoreActionButton={false}
                                                                actionFirstColumn
                                                                moreActionList={
                                                                    [
                                                                        {
                                                                            title: t('str_edit'),
                                                                            icon: <EditOutlinedIcon />,
                                                                            onClick: (data) => setOpenAddRaTagDialog(true)
                                                                        },
                                                                    ]
                                                                }
                                                                columns={
                                                                    [
                                                                        {
                                                                            title: t('tagstr'),
                                                                            field: 'tagstr',
                                                                            render: (props) => <TableColumnText maxWidth={150}>{props.tagstr}</TableColumnText>
                                                                        },
                                                                        {
                                                                            title: t('masterId'),
                                                                            field: 'masterid',
                                                                            headerStyle: {
                                                                                textAlign: 'right'
                                                                            },
                                                                            render: props => <TableColumnText textAlign={'right'}>{props.masterid}</TableColumnText>
                                                                        },
                                                                        {
                                                                            title: t('str_mid'),
                                                                            field: 'mid',
                                                                            headerStyle: {
                                                                                textAlign: 'right'
                                                                            },
                                                                            render: props => <TableColumnText textAlign={'right'}>{props.mid}</TableColumnText>
                                                                        },
                                                                        {
                                                                            title: t('str_id'),
                                                                            field: 'id',
                                                                            headerStyle: {
                                                                                textAlign: 'right'
                                                                            },
                                                                            render: props => <TableColumnText textAlign={'right'}>{props.id}</TableColumnText>
                                                                        },
                                                                    ]
                                                                }
                                                                onRefresh={() => getTagList()}
                                                                data={tagList}

                                                            />
                                                        </Grid>
                                                    </Grid>
                                                ) : null
                                                }
                                            </div>
                                        </TabPanel>
                                    ))
                                }
                            </Paper>
                        )
                    }
                </Grid>
                <DropzoneDialog
                    open={taskFileUploadStatus}
                    onSave={handleTaskFileUpload}
                    acceptedFiles={[
                        'image/jpeg',
                        'image/png',
                        'image/bmp',
                        'image/gif',
                        'video/mp4',
                        'application/zip',
                    ]}
                    showPreviews={true}
                    filesLimit={3}
                    maxFileSize={5000000}
                    onClose={() => setTaskFileUploadStatus(false)}
                    submitButtonText={t('str_save')}
                    cancelButtonText={t('str_cancel')}
                    dialogTitle={t('str_uploadAFile')}
                />
            </Grid>
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => {
                    setOpenTrackedDialog(e);
                }}
                onPressYes={(e) => {
                    handleTaskFileDelete(deleteFileInfo?.gid);
                    setOpenTrackedDialog(e);
                }}
                dialogTitle={t('str_delete')}
                dialogDesc={
                    <React.Fragment>
                        <a>{t('str_deleteRecordMsg')}</a>
                        <a style={{fontSize: '15px', fontWeight: 'bold'}}>{`${t('str_code')}:${deleteFileInfo?.code}`}</a>
                    </React.Fragment>

                }
            />
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
            <AddRaTagDialog
                open={openAddRaTagDialog}
                onClose={() => {
                    handleReset();
                    setOpenAddRaTagDialog(false);
                }}
                onSuccess={() => {
                    getTagList();
                }}
                mid={taskmid}
                token={token}
                orestUrl={GENERAL_SETTINGS.OREST_URL}
                hotelRefNo={taskHotelRefNo}
                raTagLabel={t('str_label')}
            />
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RequestDetail)
