import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import { ViewList, Insert, Upload, List, UseOrest, Patch } from '@webcms/orest'
import {
    isErrorMsg,
    OREST_ENDPOINT,
    REQUEST_METHOD_CONST, ROLETYPES,
    useOrestQuery,
} from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import useNotifications from 'model/notification/useNotifications'
import useTranslation from 'lib/translations/hooks/useTranslation'
import Typography from '@material-ui/core/Typography'
import moment from 'moment'
import { connect } from 'react-redux'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'
import { CustomToolTip } from '../../../user-portal/components/CustomToolTip/CustomToolTip'
import { SLASH } from '../../../../model/globals'
import { decimalColorToHexCode } from '../../../../@webcms-globals/helpers'
import MTableColumnSettings from '../../../MTableColumnSettings'
import CustomTable from '../../../CustomTable'
import { helper } from '../../../../@webcms-globals'
import EditIcon from '@material-ui/icons/Edit'
import Collapse from '@material-ui/core/Collapse'
import RequestDetail from '../../../user-portal/components/RequestDetail'
import { setToState } from '../../../../state/actions'
import TableColumnText from '../../../TableColumnText'
import NewMyRequestStepper from './NewMyRequestStepper'
import utfTransliteration from '@webcms-globals/utf-transliteration'

const useStyles = makeStyles((theme) => ({
    saveRequestWrapper: {
        position: 'relative',
    },
    saveRequestButton: {
        minWidth: 105,
    },
    saveRequestProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    dialogKiosk: {
        marginTop: -285
    },
    container: {
        border: "1px solid #B2CECF",
        padding: "8px",
        textAlign: "center",
        height: "60vh",
        maxHeight: "60vh",
        overflow: "auto"
    },
    formControlLabelStyle: {
        whiteSpace: "nowrap",
        "& .MuiFormControlLabel-label": {
            fontSize: "13px"
        }
    },
    overflowContainer: {
        maxWidth: '255px',
        minWidth: '255px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    fieldSetStyle: {
        border: `1px solid rgba(0, 0, 0, 0.23)`,
        padding: '8px 14px',
        borderRadius: '4px'
    },
    legendStyle: {
        padding: '0 4px',
        marginLeft: '4px',
        marginBottom: '0',
        fontSize: '14px',
        width: 'unset'
    }
}))

const MyRequest = (props) => {
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
        , { enqueueSnackbar } = useSnackbar()
        , { t } = useTranslation()
        , { transliteration } = utfTransliteration()
        , classes = useStyles()
        , { state, setToState } = props
        , router = useRouter()
        , isKiosk = router.query.kiosk === 'true' ? true : false
        , getOpenForm = router.query.open === 'true' ? true : false

    //redux
    const { showSuccess, showError } = useNotifications()
        , token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
        , clientBase = useSelector((state) => state?.orest?.state?.client || false)
        , reservBase = state.clientReservation || false
        , hotelRefNo = state?.changeHotelRefno || state?.clientReservation?.hotelrefno || GENERAL_SETTINGS.HOTELREFNO
        , loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
        , panelStatus = useSelector((state) => state?.formReducer?.userPortal?.panelStatus)
        , detailPanelId = useSelector((state) => state?.formReducer?.userPortal?.panels.requestDetail)
        , listPanelId = useSelector((state) => state?.formReducer?.userPortal?.panels.requestList)
        , requestTypeList = useSelector((state) => state?.formReducer?.guest?.myRequest?.requestTypeList || [])

    //state
    const [isInitialStateLoad, setIsInitialStateLoad] = useState(false)
        , [getData, setGetData] = useState(null)
        , [isDefLoading, setIsDefLoading] = useState(false)
        , [selectedTaskInfo, setSelectedTaskInfo] = useState(false)
        , [guestRequestList, setGuestRequestList] = useState([])
        , [isLoading, setIsLoading] = useState(false)
        , [isTsTypeLoading, setIsTsTypeLoading] = useState(false)
        , isClient = loginfo?.roletype === ROLETYPES.GUEST

    useEffect(()=> {
        if(getOpenForm){
            handleOpenRequest(true)
        }
    }, [])

    useEffect(() => {
        let isEffect = true
        if (isEffect && state.myRequest.requestData && getData) {
            const newClientInitialState = helper.objectMapper(state.myRequest.requestData, getData, ['transtype', 'tstypeid', 'accid'])
            setToState('guest', ['myRequest', 'requestData'], newClientInitialState)
            setToState('guest', ['myRequest', 'requestDataBase'], newClientInitialState)
            setIsInitialStateLoad(true)
        }
        return () => {
            isEffect = false
        }
    }, [getData])


    useEffect(() => {
        let active = true
        if (active) {
            if (isLoading) {
                return undefined
            }

            if(state.myRequest.requestTypeList.length <= 0) {
                setIsTsTypeLoading(true)
                if(isClient) {
                    handleGetTypeList()
                } else {
                    UseOrest({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.TRANSTYPE + SLASH + OREST_ENDPOINT.VIEW + SLASH + OREST_ENDPOINT.TSTRANSTYPE,
                        token,
                        params: {
                            hotelrefno: hotelRefNo,
                            query: "isactive:true"
                        }
                    }).then(res => {
                        if(res.status === 200) {
                            if(res.data.data.length > 0) {
                                setToState('guest', ['myRequest', 'requestTypeList'], res.data.data)
                            }
                        }
                        setIsTsTypeLoading(false)
                    })
                }
            }

            if (!Object.keys(guestRequestList).length > 0 && clientBase?.id) {
                getTsTrans(active)
            } else {
                setIsLoading(false)
            }
        }

        return () => {
            active = false
            setIsLoading(false)
        }
    }, [])


    useEffect(() => {
        let active = true
        if (active) {
            if (isLoading) {
                return undefined
            }

            getTsTrans(active)
        }
        return () => {
            active = false
            setIsLoading(false)
        }
    }, [state.changeHotelRefno])


    const handleOpenRequest = () => {
        //handleDefTsTrans()
        setIsInitialStateLoad(true)
        setToState('guest', ['myRequest', 'openDialog'], true)
        if(requestTypeList?.length > 0) {
            setToState(
                'guest',
                ['myRequest', 'requestData'],
                {
                    ...state.myRequest.requestData,
                    ['transtype']: {
                        ...state.myRequest.requestData['transtype'],
                        value: isClient ? requestTypeList[0]?.transtype : requestTypeList[0]?.code
                    },
                    ['tstypeid']: {
                        ...state.myRequest.requestData['tstypeid'],
                        value: isClient ? requestTypeList[0]?.id : null
                    }
                }
            )
            setToState('guest',
                ['myRequest', 'requestDataBase'],
                {
                    ...state.myRequest.requestDataBase,
                    transtype: {
                        ...state.myRequest.requestDataBase['transtype'],
                        value: isClient ? requestTypeList[0]?.transtype : requestTypeList[0]?.code
                    },
                    tstypeid: {
                        ...state.myRequest.requestDataBase['tstypeid'],
                        value: isClient ? requestTypeList[0]?.id : null
                    }
                }
            )
        }

    }


    const handleDefTsTrans = () => {
        setIsDefLoading(true)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TSTRANS + SLASH + OREST_ENDPOINT.DEF,
            method: REQUEST_METHOD_CONST.GET,
            token,
            params: {
                hotelrefno: hotelRefNo
            },
        }).then((res) => {
            if(res.status === 200) {
                setIsInitialStateLoad(true)
                const data = Object.assign({}, res.data.data, state.myRequest.requestData)
                setToState('guest', ['myRequest', 'requestData'], data)
                setToState('guest', ['myRequest', 'requestDataBase'], data)
                setIsDefLoading(false)
            }
        })
    }

    const handleGetSelectedTsTrans = (gid) => {
        if(gid) {
            setToState('guest', ['myRequest', 'openDialog'], true)
            setIsDefLoading(true)
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSTRANS + SLASH + OREST_ENDPOINT.VIEW + SLASH + OREST_ENDPOINT.GET + SLASH + gid,
                method: REQUEST_METHOD_CONST.GET,
                token,
                params: {
                    hotelrefno: hotelRefNo,
                    chkselfish: false,
                },
            }).then((res) => {
                if(res.status === 200) {
                    const data = res?.data?.data
                    setGetData(data)
                    setIsDefLoading(false)
                } else {
                    setIsDefLoading(false)
                    enqueueSnackbar(t('str_unexpectedProblem'), { variant: 'error' })
                }
            })
        }
    }

    const getTsTrans = (active) => {
        setIsLoading(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TSTRANS,
            token,
            params: {
                query:`requestedbyid:${clientBase.id},hotelrefno:${hotelRefNo}`,
                sort:'insdatetime-',
                chkselfish: false,
                allhotels: true
            },
        }).then((r) => {
            if (active) {
                if (r.status === 200) {
                    setGuestRequestList(r.data.data)
                    setIsLoading(false)
                } else {
                    const retErr = isErrorMsg(r)
                    showError(retErr.errorMsg)
                    setIsLoading(false)
                }
            }
        })
    }

    const handleGetTypeList = () => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TSTYPE,
            token,
            params: {
                query: useOrestQuery({
                    code: `*GUESTAPP.`,
                }),
                chkselfish: false,
                hotelrefno: hotelRefNo,
                allhotels: true
            },
        }).then((r) => {
            setIsTsTypeLoading(false)
            if (r.status === 200) {
                if(r.data.count > 0) {
                    setToState('guest', ['myRequest', 'requestTypeList'], r.data.data)
                    setToState('guest',
                        ['myRequest', 'requestData'],
                        {
                            ...state.myRequest.requestData,
                            transtype: {
                                ...state.myRequest.requestData['transtype'],
                                value: r.data.data[0].transtype
                            },
                            tstypeid: {
                                ...state.myRequest.requestData['tstypeid'],
                                value: r.data.data[0].id
                            }
                        }
                    )
                    setToState('guest',
                        ['myRequest', 'requestDataBase'],
                        {
                            ...state.myRequest.requestDataBase,
                            transtype: {
                                ...state.myRequest.requestDataBase['transtype'],
                                value: r.data.data[0].transtype
                            },
                            tstypeid: {
                                ...state.myRequest.requestDataBase['tstypeid'],
                                value: r.data.data[0].id
                            }
                        }
                    )
                }

            }
        })
    }

    const handleOpenDetailPanel = (taskInfo) => {
        setSelectedTaskInfo(taskInfo)
        setToState('userPortal', ['currentTask'], taskInfo)
        setToState('userPortal', ['panelStatus'], detailPanelId)
    }

    const [columns, setColumns] = useState([

        { title: t('str_status'),
            field: 'status',
            render: props => (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{width: '8px', height:'8px', borderRadius: '50%', backgroundColor: decimalColorToHexCode(props.statuscolor)}}/>
                    <Typography style={{paddingLeft: '4px', fontSize:'inherit', color: decimalColorToHexCode(props.statuscolor)}}>{props.status === "UNDEFINED" ? '-' : t(props.status)}</Typography>
                </div>
            ),
            hidden: false
        },
        {
            title: t('str_request'),
            field: 'description',
            render: props => (
                props.description?.length > 35 ? (
                    <CustomToolTip title={t(transliteration(props.description))}>
                        <Typography className={classes.overflowContainer} style={{fontSize: 'inherit'}}>{t(transliteration(props.description))}</Typography>
                    </CustomToolTip>
                ) : (
                    <Typography  style={{fontSize: 'inherit'}}>{t(transliteration(props.description))}</Typography>
                )
            ),
            hidden: false
        },
        {
            title: t('str_explanation'),
            field: 'note',
            render: props => (
                props.note?.length > 35 ? (
                    <CustomToolTip title={transliteration(props.note)}>
                        <Typography className={classes.overflowContainer} style={{fontSize: 'inherit'}}>{transliteration(props.note)}</Typography>
                    </CustomToolTip>
                ) : (
                    <Typography  style={{fontSize: 'inherit'}}>{transliteration(props.note)}</Typography>
                )
            ),
            hidden: false
        },
        {
            title: t('str_requestDate'),
            field: 'transdate',
            render: props => props.transdate && moment(props.transdate).format('L'),
            hidden: false
        },
        {
            title: `${t('str_trans')}#`,
            field: 'transno',
            align: 'right',
            render: (state) => (
                <Typography style={{fontSize: 'inherit', textAlign: 'right'}}>{state.transno}</Typography>
            ),
            hidden: false
        },
        {
            title: `${t('str_company')}`,
            field: 'accname',
            hidden: false,
            render: (state) => (
                <TableColumnText minWidth={150} maxWidth={150} showToolTip>{transliteration(state.accname)}</TableColumnText>
            ),
        },
    ])


    return (
            <Container maxWidth="xl" style={{padding: 0}}>
                <Grid container>
                    <Grid item xs={12}>
                        <Collapse in={panelStatus === detailPanelId}>
                            {selectedTaskInfo && <RequestDetail taskmid={selectedTaskInfo?.mid} taskHotelRefNo={selectedTaskInfo?.hotelrefno} tableName={OREST_ENDPOINT.TSTRANS} gid={selectedTaskInfo?.gid} />}
                        </Collapse>
                        <Collapse in={panelStatus === listPanelId}>
                            <CustomTable
                                isHoverFirstColumn
                                showMoreActionButton
                                showEditIcon
                                loading={isLoading}
                                getColumns={columns}
                                getRows={guestRequestList}
                                onRefresh={() => getTsTrans(true)}
                                onAdd={() => handleOpenRequest(true)}
                                onClickEditIcon={(rowData) => handleGetSelectedTsTrans(rowData?.gid)}
                                onClickDetailIcon={(rowData) => handleOpenDetailPanel(rowData)}
                                onDoubleClickRow={(rowData) => handleGetSelectedTsTrans(rowData?.gid)}
                                moreActionList={[
                                    {
                                        icon: <EditIcon />,
                                        title: t('str_edit'),
                                        onClick: (popupState, rowData) => {
                                            popupState.close()
                                            handleGetSelectedTsTrans(rowData?.gid)
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
                                options={{
                                    selection: true
                                }}
                            />
                        </Collapse>
                    </Grid>
                </Grid>
                <NewMyRequestStepper
                    isClient={isClient}
                    refreshList={() => getTsTrans(true)}
                    isInitialStateLoad={isInitialStateLoad}
                    isDefLoading={isDefLoading}
                    isKiosk={isKiosk}
                    getData={getData}
                    setGetData={setGetData}
                    isTsTypeLoading={isTsTypeLoading}
                />
            </Container>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(MyRequest)
