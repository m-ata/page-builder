import React, {useContext, useEffect, useState, useRef} from "react";
import UserPortalWrapper from "../../components/user-portal/UserPortalWrapper";
import {
    Accordion, AccordionDetails, AccordionSummary,
    Button,
    Checkbox,
    ClickAwayListener,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    FormControlLabel,
    Grid, IconButton, InputAdornment,
    TextField,
    Typography,
    Menu,
    MenuItem, InputBase
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import useTranslation from "../../lib/translations/hooks/useTranslation";
import WebCmsGlobal from "../../components/webcms-global";
import {isErrorMsg, OREST_ENDPOINT} from "../../model/orest/constants";
import {ViewList, Insert, UseOrest, Patch} from "@webcms/orest";
import {connect, useSelector} from "react-redux";
import {NextSeo} from "next-seo";
import {setToState, updateState} from "../../state/actions";
import moment from "moment";
import {MAX_MINUTE_VALUE, SLASH} from "../../model/globals";
import MaterialTable, {MTableHeader} from "material-table";
import {useSnackbar} from 'notistack';
import PopupState, {bindTrigger, bindMenu} from 'material-ui-popup-state';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import MaterialTableLocalization from "../../components/MaterialTableLocalization";
import TrackedChangesDialog from "../../components/TrackedChangesDialog";
import SearchIcon from "@material-ui/icons/Search";
import AddIcon from "@material-ui/icons/Add";
import MaterialTableGeneric from "../../components/MaterialTableGeneric";
import renderFormElements, {ELEMENT_TYPES} from "../../components/render-form-elements";
import {required} from "../../state/utils/form";
import AddDialogActions from "../../components/AddDialogActions";
import LoadingSpinner from "../../components/LoadingSpinner";
import {getCvInfo} from "./home";
import TableColumnText from "../../components/TableColumnText";
import {CustomToolTip} from "../../components/user-portal/components/CustomToolTip/CustomToolTip";
import CachedIcon from "@material-ui/icons/Cached";

const useStyles = makeStyles(theme => ({
    space20: {
        paddingBottom: '20px',
    },
    newApp: {
        background: '#122D31',
        color: "white",
    },
    applicationText: {
        textAlign: "left",
        fontSize: '30px',
        fontWeight: 'bold',
        color: "#122D31",
        paddingBottom: '27px',
        paddingTop: '46px',
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '370px',
        },
    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },
    },
    sectionMobile: {
        display: 'flex',
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    search: {
        background: "white",
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: (theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: (theme.palette.common.white, 0.25),
            margin: 0,
        },
        marginRight: theme.spacing(2),
        margin: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 'auto',
            margin: 0,
        },
    },
    searchIcon: {
        margin: 0,
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overflowContainer: {
        maxWidth: '255px',
        minWidth: '255px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
    },
    inputAdornmentStyle: {
        position: "absolute",
        right: "2px",
        top: "10px",
        "&.MuiInputAdornment-positionStart": {
            marginRight: "0"
        }
    },
    transDate: {
        position: 'absolute',
        visibility: 'visible'
    },
    ctxMenu: {
        textAlign: 'right',
        visibility: 'hidden'
    },
    table: {
        "& tbody>.MuiTableRow-root:hover": {
            backgroundColor: "rgb(163, 166, 180,0.1)"
        },
        "& tbody>.MuiTableRow-root:hover $ctxMenu": {
            visibility: 'visible'
        },
        "& tbody>.MuiTableRow-root:hover $transDate": {
            visibility: 'hidden'
        },
    },
    popoverStyle: {
        width: "140px",
    },
    mainTitle: {
        //paddingBottom: "48px",
        fontSize: "42px",
        fontWeight: "600",
        color: theme.palette.text.ultraDark
    },
    subTitle: {
        paddingBottom: "8px",
        fontSize: "25px",
        fontWeight: "600",
        color: theme.palette.text.light
    },
    space48: {
        paddingBottom: "48px",
        [theme.breakpoints.down("sm")]: {
            paddingBottom: "24px",
        },
    }
}))

const VARIANT = 'outlined'

function Applications(props) {
    const classes = useStyles();
    const {t} = useTranslation()
    const { GENERAL_SETTINGS, WEBCMS_DATA } = useContext(WebCmsGlobal);

    const {state, setToState} = props;

    const {enqueueSnackbar} = useSnackbar();

    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo);
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || null);


    //state
    const [empCvAprData, setEmpCvAprData] = useState({
        aprempposid: {value: '', isError: false, isRequired: true, helperText: ''},
        note: {value: '', isError: false, isRequired: false, helperText: ''}
    })
    const [empCvAprDataBase, setEmpCvAprDataBase] = useState(empCvAprData);

    const [isDef, setIsDef] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [jobApplicationsList, setJobApplicationsList] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [trackedOpenDialog, setTrackedOpenDialog] = useState(false);

    //ref
    const tableRef = useRef(null);

    const columns = [
        {
            title: t('str_date'),
            field: 'transdate',
            render: (props) => <TableColumnText minWidth={70} maxWidth={70}>{moment(props.transdate).format('L')}</TableColumnText>
        },
        {
            title: t('str_time'),
            field: 'transtime',
            render: (props) => <TableColumnText minWidth={50} maxWidth={50}>{moment(props.transtime, 'HH:mm:ss').format('HH:mm')}</TableColumnText>
        },
        {
            title: t('str_position'),
            field: 'aprposcode',
            render: (props) => <TableColumnText minWidth={150} maxWidth={150} showToolTip>{props?.aprposcode}</TableColumnText>
        },
        {
            title: t('str_description'),
            field: 'cvdesc',
            render: (props) => <TableColumnText minWidth={250} maxWidth={250} showToolTip>{props?.cvdesc}</TableColumnText>
        },
        {
            title: t('str_note'),
            field: 'note',
            render: (props) => <TableColumnText minWidth={250} maxWidth={250} showToolTip>{props?.note}</TableColumnText>
        },
    ]

    const formElements = [
        {
            type: ELEMENT_TYPES.textField,
            id: 'insuserid',
            name: 'insuserid',
            value: loginfo?.fullname,
            disabled: true,
            label: t('str_fullName'),
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12}
        },
        {
            type: ELEMENT_TYPES.autoComplete,
            id: 'aprempposid',
            name: 'aprempposid',
            value: empCvAprData.aprempposid?.value || null,
            error: empCvAprData.aprempposid?.isError,
            required: empCvAprData.aprempposid?.isRequired,
            label: t('str_position'),
            helperText: empCvAprData.aprempposid?.helperText,
            onChange: (newValue, name) => handleTextFieldChange(newValue, name),
            onBlur: (e, name) => handleTextFieldOnBlur(e, name),
            endpoint: 'emppos/view/list',
            params: {code: '', text: '', limit: 25},
            showOptionLabel: 'code',
            showOption: 'code',
            searchParam: 'code',
            variant: VARIANT,
            fullWidth: true,
            gridProps: {xs: 12}
        },
        {
            type: ELEMENT_TYPES.textField,
            id: 'note',
            name: 'note',
            value: empCvAprData.note?.value,
            error: empCvAprData.note?.isError,
            required: empCvAprData.note?.isRequired,
            label: t('str_note'),
            onChange: (e) => handleTextFieldChange(e),
            variant: VARIANT,
            fullWidth: true,
            multiLine: true,
            rows: 4,
            rowsMax: 4,
            gridProps: {xs: 12}
        },
    ]


    useEffect(() => {
        getJobApplicationList();
        if(!state.empCv && token) {
            getCvInfo({
                GENERAL_SETTINGS: GENERAL_SETTINGS,
                token: token,
                empId: loginfo?.id,
                setToState: setToState,
                hotelRefNo: hotelRefNo,
                enqueueSnackbar: enqueueSnackbar,
                loginInfo: loginfo,
            })
        }

    }, [])

   const getJobApplicationList = () => {
        setIsLoading(true)
       UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.EMPCVAPR + SLASH + OREST_ENDPOINT.VIEW + SLASH +  OREST_ENDPOINT.LIST,
            token,
            params: {
                query: `aprempid:${loginfo.id}`,
                hotelrefno: hotelRefNo
            }
        }).then(res => {
            if(res.status === 200 && res.data.count > 0) {
                setJobApplicationsList(res.data.data)
            }
            setIsLoading(false)
        })
   }


   const handleDefRecord = () => {
        setIsDef(true)
       UseOrest({
           apiUrl: GENERAL_SETTINGS.OREST_URL,
           endpoint: 'empcvapr' + SLASH + OREST_ENDPOINT.DEF,
           token,
           params: {
               hotelrefno: hotelRefNo
           }
       }).then(res => {
           if(res.status === 200 && res.data.count > 0) {
               const data = Object.assign({}, res.data.data, empCvAprData)
               setEmpCvAprData(data)
               setEmpCvAprDataBase(data)
           }
           setIsDef(false)
       })
   }


    const handleTextFieldChange = (event, key) => {
        const  name = key ? key : event.target.name
        const value = event?.target ? event.target.value : event
        setEmpCvAprData({
            ...empCvAprData,
            [name]: {
                ...empCvAprData[name],
                value: value,
                isError: empCvAprData[name]?.isRequired && !!required(value),
                helperText: empCvAprData[name]?.isRequired && !!required(value) && t('str_mandatory'),
            }
        })
    }

    const handleTextFieldOnBlur = (event, key) => {
        const  name = key ? key : event.target.name
        const value = event?.target ? event.target.value : event
        setEmpCvAprData({
            ...empCvAprData,
            [name]: {
                ...empCvAprData[name],
                isError: empCvAprData[name]?.isRequired && !!required(value),
                helperText: empCvAprData[name]?.isRequired && !!required(value) && t('str_mandatory'),
            }
        })
    }

    const handleSave = () => {
        setIsSaving(true)
        const data = {...empCvAprData};
        data.aprempid = loginfo?.id
        data.empcvid = state.empCv?.id
        data.aprempposid = empCvAprData.aprempposid?.value?.id,
        data.note = empCvAprData?.note?.value

        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'empcvapr',
            token,
            data: data
        }).then(res => {
            if(res.status === 200) {
                getJobApplicationList()
                setOpenAddDialog(false)
                enqueueSnackbar(t('str_processCompletedSuccessfully'), {variant: 'success'})
                setTimeout(() => {
                    handleReset()
                }, 100)
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(t(error.errMsg), {variant: 'success'})
            }
            setIsSaving(false)
        })


    }

    const handleOpenAddDialog = () => {
        handleDefRecord()
        setOpenAddDialog(true)
    }

    const handleCloseDialog = () => {
        if(JSON.stringify(empCvAprData) !== JSON.stringify(empCvAprDataBase)) {
            setTrackedOpenDialog(true)
        } else {
            handleReset()
            setOpenAddDialog(false)
        }
    }

    const handleReset = () => {
        const initialData = {
            aprempposid: {value: '', isError: false, required: true, helperText: ''},
            note: {value: '', isError: false, required: true, helperText: ''}
        }
        setEmpCvAprData(initialData)
        setEmpCvAprDataBase(initialData)
    }

    return (
        <React.Fragment>
            <NextSeo
                title={`${WEBCMS_DATA?.assets?.meta?.title} - ${t('str_jobApplications')}`}
            />
            <UserPortalWrapper isEmpPortal>
                <div>
                    <Grid container className={classes.space20}>
                        <Grid item lg={12} xs={12} sm={12} md={1}>
                            <Typography className={classes.applicationText}>
                                {t('str_jobApplications')}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid item xs={6} sm={8} md={3}>
                        <Grid container>
                            <Grid item xs={6} sm={3}>
                                <CustomToolTip title={t('str_refresh')}>
                                    <IconButton
                                        onClick={() => getJobApplicationList()}
                                    >
                                        <CachedIcon style={{color:"#F16A4B"}}/>
                                    </IconButton>
                                </CustomToolTip>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                {
                                    state.empCv ? (
                                        <CustomToolTip title={t('str_add')}>
                                            <IconButton
                                                onClick={() => handleOpenAddDialog()}
                                            >
                                                <AddIcon/>
                                            </IconButton>
                                        </CustomToolTip>
                                    ) : (
                                        <CustomToolTip title={'You cannot apply for a new job without CV information.'}>
                                            <span>
                                                <IconButton disabled>
                                                    <AddIcon/>
                                                </IconButton>
                                            </span>
                                        </CustomToolTip>
                                    )
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={8} sm={4} md={9}>
                    </Grid>
                    <Grid item xs={12}>
                        <MaterialTableGeneric
                            isLoading={isLoading}
                            actionFirstColumn={false}
                            hoverFirstColumn={false}
                            columns={columns}
                            data={jobApplicationsList}
                            showMoreActionButton={false}
                        />
                    </Grid>
                    <Dialog open={openAddDialog} fullWidth maxWidth={'sm'}>
                        <div style={{padding: '24px'}}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography style={{fontSize: '18px', fontWeight: '600'}}>New Jop Application</Typography>
                                </Grid>
                                {
                                    isDef ? (
                                        <Grid item xs={12}>
                                            <LoadingSpinner />
                                        </Grid>
                                    ) : (
                                        <React.Fragment>
                                            <Grid item xs={12}>
                                                <Grid container spacing={3}>
                                                    {formElements.map((item, index) => (
                                                        <Grid item {...item?.gridProps}>
                                                            {renderFormElements(item)}
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <AddDialogActions
                                                    showToolTip
                                                    toolTipTitle={
                                                        <div>
                                                            <Typography style={{fontWeight: '600', fontSize: 'inherit'}}>
                                                                {t('str_invalidFields')}
                                                            </Typography>
                                                            {
                                                                !empCvAprData.aprempposid?.value && (
                                                                    <Typography style={{fontSize: 'inherit'}}>
                                                                        {t('str_position')}
                                                                    </Typography>
                                                                )
                                                            }
                                                        </div>
                                                    }
                                                    loading={isSaving}
                                                    disabled={isSaving}
                                                    disabledSave={isSaving || !empCvAprData.aprempposid?.value}
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
                    <TrackedChangesDialog
                        open={trackedOpenDialog}
                        onPressNo={(e) => setTrackedOpenDialog(e)}
                        onPressYes={(e) => {
                            setOpenAddDialog(false);
                            setTrackedOpenDialog(e);
                            setTimeout(() => {
                                handleReset();
                            }, 100)

                        }}
                    />
                </div>
            </UserPortalWrapper>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.employeePortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Applications)