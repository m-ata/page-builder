import React, {useContext, useEffect, useState} from 'react'
import UserPortalWrapper from '../../components/user-portal/UserPortalWrapper'
import useTranslation from '../../lib/translations/hooks/useTranslation'
import WebCmsGlobal from '../../components/webcms-global'
import {useSnackbar} from 'notistack'
import {connect, useSelector} from 'react-redux'
import {setToState, updateState} from '../../state/actions'
import {useOrestAction} from "../../model/orest";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {CustomToolTip} from "../../components/user-portal/components/CustomToolTip/CustomToolTip";
import LoadingSpinner from "../../components/LoadingSpinner";
import Divider from "@material-ui/core/Divider";
import NoteAddIcon from "@material-ui/icons/NoteAdd";
import BugReportIcon from "@material-ui/icons/BugReport";
import SettingsIcon from "@material-ui/icons/Settings";
import {List, UseOrest} from "@webcms/orest";
import {isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST} from "../../model/orest/constants";
import {SLASH} from "../../model/globals";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    mainTitle: {
        paddingTop:"38px",
        fontSize:"28px",
        fontWeight:"normal",
        color:"#43425D",
    },
    iconStyle: {
        color:"#FFF",
        "&.MuiSvgIcon-root": {
            width:"1.75em",
            height:"2.188em"
        }
    },
    iconDiv: {
        top:"-20px",
        padding:"12px 16px",
        position:"absolute",
        width:"78px",
        height:"78px"
    },
    cardStyle: {
        minHeight:"130px",
        [theme.breakpoints.down('xs')]: {
            width:"100%",
        },
    },
    cardContent: {
        padding: "16px 32px",
    },
    cardTitle: {
        fontSize:"18px",
        fontWeight:"normal",
        textAlign:"right",
        color:"#43425D",
        textTransform:"uppercase",
        [theme.breakpoints.down('xs')]: {
            textAlign:"right",
        },
    },
    cardCountText: {
        fontSize:"30px",
        fontWeight:"bold",
        textAlign:"right",
    },
    dividerStyle: {
        width:"calc(100% - 30px)",
        color:"#CECECE",
        [theme.breakpoints.down('xs')]: {
            width:"100%",
        },
    },
    detailTitle: {
        fontSize: "14px",
        fontWeight: "500",
        textTransform: "uppercase",
        color: "#43425D",
        textDecoration: "underline"
    },
    detailDoneCountText: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#5B5A72"
    },
    detailProcessCountText: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#43425D"
    }
}))

function StatsPage(props) {
    const classes = useStyles()

    const {t} = useTranslation()
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);

    const {state, setToState} = props;

    const {enqueueSnackbar} = useSnackbar();

    //reduxf
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo);
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || null);

    //orest state
    const [completed, setCompleted] = useState(false);
    const [queryCounter, setQueryCounter] = useState(0);
    const [transTypeList, setTransTypeList] = useState([]);
    const [taskTypeList, setTaskTypeList] = useState([]);
    const [isListLoaded, setIsListLoaded] = useState(false);
    const [isCombinationListLoaded, setIsCombinationListLoaded] = useState(false);
    const [taskTypesCombinationList, setTaskTypesCombination] = useState([]);

    const {setOrestState} = useOrestAction()

    const cardList = [
        {
            icon:(
                <NoteAddIcon className={classes.iconStyle}/>
            ),
            color:"#67B549",
            cardName:t("TOTAL PRODUCTS"),
            closeCount: state.dashBoardOverview,
            openCount: state.dashBoardOverview,
            totalCount: state.dashBoardOverview
        },
        {
            icon:(
                <BugReportIcon className={classes.iconStyle}/>
            ),
            color:"#F16A4B",
            cardName:t("TOTAL ORDERS"),
            closeCount: state.dashBoardOverview,
            openCount: state.dashBoardOverview,
            totalCount: state.dashBoardOverview
        },
        {
            icon:(
                <SettingsIcon className={classes.iconStyle}/>
            ),
            color:"#2697D4",
            cardName:t("TOTAL SALES"),
            closeCount: state.dashBoardOverview,
            openCount: state.dashBoardOverview,
            totalCount: state.dashBoardOverview
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
                                setToState('userPortal',['dashBoardOverview', 'requestTaskCloseCount'], r1.data.data + state.dashBoardOverview);
                                setToState('userPortal',['dashBoardOverview', 'requestTaskOpenCount'], res.data.data + state.dashBoardOverview);
                                setToState('userPortal',['dashBoardOverview', 'requestTaskTotalCount'], (res.data.data + r1.data.data) + state.dashBoardOverview);
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

    return (
        <UserPortalWrapper isSupplierPortal>
            <React.Fragment>
                <Typography className={classes.mainTitle}>{t("str_statistics")}</Typography>
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
        </UserPortalWrapper>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.supplierPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(StatsPage)