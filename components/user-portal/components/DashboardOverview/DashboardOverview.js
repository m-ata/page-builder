import React, { useContext, useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import styles from '../../../../assets/jss/components/dashboardOverview.style';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import BugReportIcon from '@material-ui/icons/BugReport';
import SettingsIcon from '@material-ui/icons/Settings';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import WebCmsGlobal from '../../../webcms-global';
import { setToState } from '../../../../state/actions';
import {UseOrest, List} from '@webcms/orest';
import {
    DEFAULT_OREST_TOKEN,
    isErrorMsg,
    OREST_ENDPOINT, REQUEST_METHOD_CONST
} from '../../../../model/orest/constants';
import LoadingSpinner from '../../../LoadingSpinner';
import useTranslation from '../../../../lib/translations/hooks/useTranslation';
import {CustomToolTip} from '../CustomToolTip/CustomToolTip';
import {SLASH} from "../../../../model/globals";

const useStyles = makeStyles(styles);

function DashboardOverview(props){
    const classes = useStyles();
    
    const { setToState, state } = props
    
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);
    const { t } = useTranslation();
    
    const token = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    )
    const hotelRefNo = useSelector(state =>
        state.hotelinfo.currentHotelRefNo !== null ? state.hotelinfo.currentHotelRefNo : null);
    const [completed, setCompleted] = useState(false);
    const [queryCounter, setQueryCounter] = useState(0);
    const [transTypeList, setTransTypeList] = useState([]);
    const [taskTypeList, setTaskTypeList] = useState([]);
    const [isListLoaded, setIsListLoaded] = useState(false);
    const [isCombinationListLoaded, setIsCombinationListLoaded] = useState(false);
    const [taskTypesCombinationList, setTaskTypesCombination] = useState([]);
    
    const cardList = [
        {
            icon:(
                <NoteAddIcon className={classes.iconStyle}/>
            ),
            color:"#67B549",
            cardName:t("str_request"),
            closeCount: state.dashBoardOverview.requestTaskCloseCount,
            openCount: state.dashBoardOverview.requestTaskOpenCount,
            totalCount: state.dashBoardOverview.requestTaskTotalCount
        },
        {
            icon:(
                <BugReportIcon className={classes.iconStyle}/>
            ),
            color:"#F16A4B",
            cardName:t("str_bug"),
            closeCount: state.dashBoardOverview.bugTaskCloseCount,
            openCount: state.dashBoardOverview.bugTaskOpenCount,
            totalCount: state.dashBoardOverview.bugTaskTotalCount
        },
        {
            icon:(
                <SettingsIcon className={classes.iconStyle}/>
            ),
            color:"#2697D4",
            cardName:t("str_technicalService"),
            closeCount: state.dashBoardOverview.techServiceTaskCloseCount,
            openCount: state.dashBoardOverview.techServiceTaskOpenCount,
            totalCount: state.dashBoardOverview.techServiceTaskTotalCount
        },
        {
            icon:(
                <SettingsIcon className={classes.iconStyle}/>
            ),
            color:"#FCB655",
            cardName:t("str_other"),
            closeCount: state.dashBoardOverview.otherTaskCloseCount,
            openCount: state.dashBoardOverview.otherTaskOpenCount,
            totalCount: state.dashBoardOverview.otherTaskTotalCount
        }
    ]

    const findTransType = (transTypeDesc) => {
        return transTypeList.find(e => e.description.toUpperCase() === transTypeDesc.toUpperCase())
    }

    const findTaskTypeId = (taskTypeCode) => {
        return taskTypesCombinationList.find(e => e.code.toUpperCase() === taskTypeCode.toUpperCase());
    }

    useEffect(() => {
        let tempArray = [];
        let length = 0;
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TRANSTYPE + SLASH + OREST_ENDPOINT.VIEW + SLASH + OREST_ENDPOINT.TSTRANSTYPE,
            token: token,
            method: REQUEST_METHOD_CONST.GET,
        }).then(res => {
            if(res.status === 200) {
                setTransTypeList(res.data.data);
                res.data.data.map((item) => {
                    List({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: "tstype",
                        token,
                        params: {
                            query: `transtype:${item.code}`
                        }
                    }).then(r1 => {
                        if(r1.status === 200) {
                            if(r1.data.data.length > 0) {
                                tempArray.push(r1.data.data);
                            }
                            if(length + 1 >= res.data.data.length) {
                                setTaskTypeList(tempArray);
                                setIsListLoaded(true);
                            }
                            length++
                        }
                    })

                })
            } else {
                const retErr = isErrorMsg(res);
                showError(retErr.errorMsg);
                setIsLoading(false)
            }
        })

    }, [])

    useEffect(() => {
        let tempArray = [];
        let counter = 0;
        if(isListLoaded) {
            taskTypeList.map((itemList) => {
                itemList.map((item2, ind) => {
                    tempArray.push(item2);
                    if(ind + 1 >= itemList.length) {
                        if(counter + 1 >= taskTypeList.length) {
                            setTaskTypesCombination(tempArray);
                            setIsCombinationListLoaded(true);
                        }
                        counter++
                    }
                })
            })
        }
    },[isListLoaded])


    useEffect(() => {
        let id = "";
        let transType = "";
        if(isCombinationListLoaded && queryCounter <= cardList.length) {
            if(queryCounter === 0) {
                transType = findTransType("TASK").code;
                id =`transtype:${transType},tstypeid:${findTaskTypeId("DEV.REQ").id}`;
            } else if(queryCounter === 1) {
                transType = findTransType("TASK").code;
                id =`transtype:${transType},tstypeid:${findTaskTypeId("TRAINING").id}`;
            } else if(queryCounter === 2) {
                transType = findTransType("SWBUG").code;
                id =`transtype:${transType},tstypeid:${findTaskTypeId("DEV.BUG").id}`;
            } else if(queryCounter === 3) {
                transType = findTransType("TSFORM").code;
                id =`transtype:${transType},tstypeid:${findTaskTypeId("GENERAL").id}`;
            } else if(queryCounter === 4) {
                transType = findTransType("TASK").code;
                id =`transtype:${transType},tstypeid!${findTaskTypeId("DEV.REQ").id},tstypeid!${findTaskTypeId("TRAINING").id}`;
            }
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.TSTRANS + SLASH + OREST_ENDPOINT.VIEW + SLASH + OREST_ENDPOINT.COUNT + SLASH + OREST_ENDPOINT.SEARCH,
                token,
                params: {
                    query:`isclosed:false,hotelrefno:${hotelRefNo},${id}`,
                }
            }).then((res) => {
                if (res.status === 200) {
                    UseOrest({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.TSTRANS + SLASH + OREST_ENDPOINT.VIEW + SLASH + OREST_ENDPOINT.COUNT + SLASH + OREST_ENDPOINT.SEARCH,
                        token,
                        params: {
                            query:`statusid:11,isclosed:true,hotelrefno:${hotelRefNo},${id}`,
                        }
                    }).then(r1 => {
                        if(r1.status === 200) {
                            if(queryCounter === 0) {
                                setToState('userPortal',['dashBoardOverview', 'requestTaskCloseCount'], r1.data.data);
                                setToState('userPortal',['dashBoardOverview', 'requestTaskOpenCount'], res.data.data)
                                setToState('userPortal',['dashBoardOverview', 'requestTaskTotalCount'], res.data.data + r1.data.data)
                            } else if(queryCounter === 1) {
                                setToState('userPortal',['dashBoardOverview', 'requestTaskCloseCount'], r1.data.data + state.dashBoardOverview.requestTaskCloseCount);
                                setToState('userPortal',['dashBoardOverview', 'requestTaskOpenCount'], res.data.data + state.dashBoardOverview.requestTaskOpenCount);
                                setToState('userPortal',['dashBoardOverview', 'requestTaskTotalCount'], (res.data.data + r1.data.data) + state.dashBoardOverview.requestTaskTotalCount);
                            } else if(queryCounter === 2) {
                                setToState('userPortal',['dashBoardOverview', 'bugTaskCloseCount'], r1.data.data);
                                setToState('userPortal',['dashBoardOverview', 'bugTaskOpenCount'], res.data.data);
                                setToState('userPortal',['dashBoardOverview', 'bugTaskTotalCount'], res.data.data + r1.data.data);
                            } else if(queryCounter === 3) {
                                setToState('userPortal',['dashBoardOverview', 'techServiceTaskCloseCount'], r1.data.data);
                                setToState('userPortal',['dashBoardOverview', 'techServiceTaskOpenCount'], res.data.data);
                                setToState('userPortal',['dashBoardOverview', 'techServiceTaskTotalCount'], res.data.data + r1.data.data);
                            } else if(queryCounter === 4) {
                                setToState('userPortal',['dashBoardOverview', 'otherTaskCloseCount'], r1.data.data);
                                setToState('userPortal',['dashBoardOverview', 'otherTaskOpenCount'], res.data.data);
                                setToState('userPortal',['dashBoardOverview', 'otherTaskTotalCount'], res.data.data + r1.data.data);
                                setCompleted(true);
                            }
                            setQueryCounter(queryCounter + 1);
                        } else {
                            const retErr = isErrorMsg(r1)
                            showError(retErr.errorMsg)
                            setCompleted(true);
                        }
                    })
                } else {
                    const retErr = isErrorMsg(res)
                    showError(retErr.errorMsg)
                    setCompleted(true);
                }
            })
        }
   
    },[isCombinationListLoaded, queryCounter])
    
    return(
        <React.Fragment>
            <Typography className={classes.mainTitle}>{t("str_overview")}</Typography>
            <div style={{paddingBottom:"72px"}}/>
            <Grid container spacing={4}>
                {
                    cardList.map((data,i) => {
                        return(
                            <Grid item key={i} xs={12} sm={6} md={6} lg={4} xl={3} >
                                <div style={{position:"relative"}}>
                                    <Card className={classes.cardStyle}>
                                        <CardContent className={classes.cardContent}>
                                            <div className={classes.iconDiv} style={{backgroundColor:data.color}}>
                                                {data.icon}
                                            </div>
                                            {
                                                data.cardName === t("str_technicalService") ?
                                                    (
                                                        <CustomToolTip title={t("str_technicalServiceFullName")} placement={"top"} arrow>
                                                            <Typography className={classes.cardTitle}>{data.cardName}</Typography>
                                                        </CustomToolTip>
                                                    ) :
                                                    (
                                                        <Typography className={classes.cardTitle}>{data.cardName}</Typography>
                                                    )
                                            }
                                            <div>
                                                {
                                                    completed ?
                                                        <Grid container>
                                                            <Grid item xs={12}>
                                                                <Typography
                                                                    className={classes.cardCountText}
                                                                    style={{color:data.color}}
                                                                >
                                                                    {data.totalCount}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <Grid container>
                                                                    <Grid item xs={6}>
                                                                        <Typography className={classes.detailTitle}>{t("str_done")}</Typography>
                                                                        <Typography className={classes.detailDoneCountText}>{data.closeCount}</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Typography className={classes.detailTitle}>{t("str_process")}</Typography>
                                                                        <Typography className={classes.detailProcessCountText}>{data.openCount}</Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        :
                                                        <LoadingSpinner size={30} style={{color: data.color, paddingTop: '16px'}}/>
                                                }
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </Grid>
                        );
                    })
                }
            </Grid>
            <div style={{paddingBottom:"56px"}}/>
            <Divider className={classes.dividerStyle} />
            <div style={{paddingBottom:"40px"}}/>
        </React.Fragment>
    );
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(DashboardOverview)
