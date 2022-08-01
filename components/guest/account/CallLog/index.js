import React, { useContext, useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { ViewList } from '@webcms/orest'
import { Collapse, Grid, IconButton, Typography } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import WebCmsGlobal from '../../../webcms-global'
import moment from 'moment'
import {formatMoney, isErrorMsg, OREST_ENDPOINT} from '../../../../model/orest/constants'
import useTranslation from '../../../../lib/translations/hooks/useTranslation'
import { CustomToolTip } from '../../../user-portal/components/CustomToolTip/CustomToolTip'
import { makeStyles } from '@material-ui/core/styles'
import { setToState } from '../../../../state/actions'
import RequestDetail from '../../../user-portal/components/RequestDetail'
import TableColumnText from '../../../TableColumnText'
import AddRaTagDialog from '../../../AddRaTagDialog'
import MTableColumnSettings from '../../../MTableColumnSettings'
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import {PreviewFile} from "../../../../model/orest/components/RaFile";
import {useSnackbar} from "notistack";
import MediaViewerDialog from "../../../../@webcms-ui/core/media-viewer-dialog";
import axios from "axios";
import CustomTable from "../../../CustomTable";

const useStyles = makeStyles( theme => ({
    overflowContainer: {
        maxWidth: '255px',
        minWidth: '255px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    inputAdornmentStyle: {
        position:"absolute",
        right:"2px",
        top:"10px",
        "&.MuiInputAdornment-positionStart": {
            marginRight:"0"
        }
    },
    table: {
        "& tbody>.MuiTableRow-root:hover": {
            backgroundColor: "rgb(163, 166, 180,0.1)"
        },
        "& tbody>.MuiTableRow-root:hover .ctxMenu": {
            visibility: 'visible'
        },
        "& tbody>.MuiTableRow-root:hover .callType": {
            visibility: 'hidden'
        },
    },
}));

function CallLog(props){
    const classes = useStyles();

    const { enqueueSnackbar } = useSnackbar();

    //props
    const { setToState } = props

    //context
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();

    //redux
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const clientBase = useSelector((state) => state?.orest?.state?.client || false)
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || null);
    const panelStatus = useSelector(state => state?.formReducer?.userPortal?.panelStatus);
    const panels = useSelector(state => state?.formReducer?.userPortal?.panels || false);

    //state
    const [isLoading, setIsLoading] = useState(false);
    const [logList, setLogList] = useState();
    const [selectedCallLogInfo, setSelectedCallLogInfo] = useState(false);
    const [openAddRaTagDialog, setOpenAddRaTagDialog] = useState(false);
    const [midValue, setMidValue] = useState(0);

    const [isPreviewLoading,setIsPreviewLoading] = useState()
    const [lastCallFileUrl, setLastCallFileUrl] = useState('')
    const [fileType, setFileType] = useState('');
    const [openPreviewDialog, setOpenPreviewDialog] = useState(false);


    const  [columns, setColumns] = useState([
        {
            title: t('str_callType'),
            field: 'calltype',
            render: (props) => (
                <Typography style={{textAlign :'center', fontSize: 'inherit'}}>
                    <img src={props?.transtypeicon || ''} style={{maxWidth: '1em'}}/>
                </Typography>
            ),
            hidden: false
        },
        {
            title: t('str_empCode'),
            field: 'empcode',
            render: (state) => <TableColumnText minWidth={150}>{state.empcode}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_date'),
            field: 'transdate',
            render: (state) => <TableColumnText>{moment(state.transdate).format('L')}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_time'),
            field: 'transtime',
            hidden: false
        },
        {
            title: t('str_calledNumber'),
            field: 'callednumber',
            hidden: false
        },
        {
            title: t('str_elapsed'),
            field: 'elapsed',
            hidden: false
        },
        {
            title: t('str_counter'),
            field: 'counter',
            align: 'right',
            render: (state) => <TableColumnText textAlign={'right'}>{state.counter}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_totalPrice'),
            field: 'totalprice',
            align: 'right',
            render: (state) => <TableColumnText textAlign={'right'}>{formatMoney(state.totalprice)}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_numberDesc'),
            field: 'numberdesc',
            render: (state) => <TableColumnText minWidth={250} maxWidth={250} showToolTip>{state.numberdesc}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_account'),
            field: 'acccode',
            hidden: false
        },
        {
            title: t('str_note'),
            field: 'note',
            render: (state) => <TableColumnText minWidth={250} maxWidth={250} showToolTip>{state.note}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_extension'),
            field: 'extension',
            render: (state) => <TableColumnText minWidth={120}>{state.extension}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_commType'),
            field: 'commtypedesc',
            hidden: false
        },
        {
            title: t('str_id'),
            field: 'id',
            align: 'right',
            render: (state) => <TableColumnText textAlign={'right'}>{state.id}</TableColumnText>,
            hidden: false
        },
        {
            title: t('str_preview'),
            field: 'id',
            align: 'center',
            render: (state) => (
                <TableColumnText textAlign={'center'}>
                    <CustomToolTip title={t('str_previewFile')}>
                        <IconButton style={{padding: '0'}} onClick={() => handlePreviewFromTable(state?.mid)}>
                            <VisibilityOutlinedIcon />
                        </IconButton>
                    </CustomToolTip>
                </TableColumnText>
            ),
            hidden: false
        },
        {
            title: t('str_download'),
            field: 'id',
            align: 'center',
            render: (state) => (
                <TableColumnText textAlign={'center'}>
                    <CustomToolTip title={t('str_downloadFile')}>
                        <IconButton style={{padding: '0'}} onClick={() => handleFileDownload(state.mid)}>
                            <CloudUploadIcon />
                        </IconButton>
                    </CustomToolTip>
                </TableColumnText>
            ),
            hidden: false
        },
    ])

    useEffect(() => {
        getCallLogList()
    }, [])

    const getCallLogList = () => {
        setIsLoading(true);
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.COMM,
            token,
            params: {
                hotelrefno: hotelRefNo || GENERAL_SETTINGS.HOTELREFNO,
                query: `accid:${clientBase?.id}`
            }
        }).then(res => {
            if(res.status === 200){
                setLogList(res.data.data);
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        })
    }

    const handleGetLastFile = async (mid) => {
        if(mid) {
            return ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token,
                params: {
                    query: `masterid:${mid}`,
                    hotelrefno: hotelRefNo,
                    limit: 1
                }
            }).then(res => {
                if(res.status === 200 && res?.data?.count > 0) {
                    return res.data.data[0]
                }
            })
        }
    }

    const handlePreviewFromTable = async (mid) => {
        const lastFile = await handleGetLastFile(mid)
        if(lastFile) {
            setIsPreviewLoading(true)
            setOpenPreviewDialog(true)
            PreviewFile(GENERAL_SETTINGS, token, lastFile?.gid).then(res => {
                setIsPreviewLoading(false);
                if(res.success) {
                    setLastCallFileUrl(res?.url);
                    setFileType(res?.fileType)
                } else {
                    enqueueSnackbar(t(res?.errorText), { variant: res?.variant || 'error' })
                }
            })
        } else {
            enqueueSnackbar(t('str_noFileHasBeenFound'), { variant:  'info' })
        }
    }

    const handleFileDownload = async (mid) => {
        const lastFile = await handleGetLastFile(mid)
        if(lastFile) {
            if(lastFile?.url?.includes('http://') || lastFile.url.includes('https://')) {
                const win = window.open(lastFile.url, '_blank');
                if (win != null) {
                    win.focus();
                }
            } else {
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
                        gid: lastFile?.gid,
                        hotelrefno: lastFile?.hotelrefno,
                    },
                    responseType: 'blob',
                }).then((response) => {
                    if (response.status === 200) {
                        const url = window.URL.createObjectURL(new Blob([response.data]))
                        const link = document.createElement('a')
                        link.href = url
                        link.setAttribute('download', lastFile?.filename?.toLowerCase()) //or any other extension
                        document.body.appendChild(link)
                        link.click()
                        link.remove()
                        enqueueSnackbar(t('str_selectedDownloadedMsg'), { variant: 'success' })
                    } else {
                        const error = isErrorMsg(response)
                        enqueueSnackbar(t(error.errMsg), { variant: 'info' })
                    }
                })
            }
        } else {
            enqueueSnackbar(t('str_noFileHasBeenFound'), { variant: 'info' })
        }

    }

    const handleOpenDetailPanel = (callLogInfo) => {
        setSelectedCallLogInfo(callLogInfo)
        setToState('userPortal', ['panelStatus'], panels.requestDetail)
        setToState('userPortal', ['currentTask'], callLogInfo)
    }

    const handleReset = () => {
        setMidValue(0)
    }

    return(
        <div>
            <Grid container>
                <Grid item xs={12}>
                    <Collapse in={panelStatus === panels.requestList}>
                        <Grid
                            container
                            justify="space-between"
                        >
                            <Grid item xs={12}>
                                <CustomTable
                                    isHoverFirstColumn
                                    showMoreActionButton
                                    loading={isLoading}
                                    getColumns={columns}
                                    getRows={logList}
                                    onRefresh={() => getCallLogList()}
                                    onClickDetailIcon={(rowData) => handleOpenDetailPanel(rowData)}
                                    moreActionList={[
                                        {
                                            icon: <AddIcon />,
                                            title: t('str_addTag'),
                                            onClick: (popupState, rowData) => {
                                                setOpenAddRaTagDialog(true)
                                                setMidValue(rowData?.mid)
                                                popupState.close();
                                            },
                                        }
                                    ]}
                                    filterComponentAlign={'right'}
                                    filterComponent={
                                        <React.Fragment>
                                            <Grid container spacing={3} alignItems={'center'}>
                                                <Grid item xs={12} sm={true}>
                                                    <MTableColumnSettings tableId="historyReservation" columns={columns} setColumns={setColumns}/>
                                                </Grid>
                                            </Grid>
                                        </React.Fragment>
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Collapse>
                    <Collapse in={panelStatus === panels.requestDetail}>
                        <Grid container>
                            <Grid item xs={12}>
                                {selectedCallLogInfo && <RequestDetail taskmid={selectedCallLogInfo?.mid} taskHotelRefNo={selectedCallLogInfo?.hotelrefno} tableName={OREST_ENDPOINT.COMM} gid={selectedCallLogInfo?.gid}/>}
                            </Grid>
                        </Grid>
                    </Collapse>
                </Grid>
            </Grid>
            <MediaViewerDialog
                open={openPreviewDialog}
                maxWidth={'md'}
                fullWidth
                loading={isPreviewLoading}
                fileType={fileType}
                url={lastCallFileUrl}
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
                mid={midValue}
                token={token}
                orestUrl={GENERAL_SETTINGS.OREST_URL}
                hotelRefNo={hotelRefNo}
                raTagLabel={t('str_label')}
            />
        </div>
    );
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(null, mapDispatchToProps)(CallLog);