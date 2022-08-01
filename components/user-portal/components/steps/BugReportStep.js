import React, {useContext, useEffect} from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import {CustomToolTip} from "../CustomToolTip/CustomToolTip";
import {deleteFromState, pushToState, setToState, updateState} from "../../../../state/actions";
import {connect, useSelector} from "react-redux";
import {makeStyles} from "@material-ui/core/styles";
import styles from "../../../../assets/jss/components/newRequestStepperStyle";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";
import {ViewList} from "@webcms/orest";
import WebCmsGlobal from "../../../webcms-global";
import {OREST_ENDPOINT, useOrestQuery} from "../../../../model/orest/constants";

const useStyles = makeStyles(styles);

function BugReportStep(props) {
    const classes = useStyles()

    const { t } = useTranslation();
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);

    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || false);

    const {fieldDisabled, state, setToState} = props

    useEffect(() => {
        if(state.defMyRequest?.transno) {
           ViewList({
               apiUrl: GENERAL_SETTINGS.OREST_URL,
               endpoint: OREST_ENDPOINT.TASKBUG,
               params: {
                   query: useOrestQuery({
                       transno: state.defMyRequest?.transno
                   }),
                   hotelrefno:hotelRefNo
               },
               token
           }).then((res => {
               if(res.status === 200) {
                   let resData = res.data.data[0];
                   let data = {
                       browser: resData?.browser,
                       browserdesc: resData?.browserdesc,
                       curres: resData?.curres,
                       devproject: resData?.devproject,
                       devprojectdesc: resData?.devprojectdesc,
                       expres: resData?.expres,
                       envurl: resData?.envurl,
                       ostype: resData?.ostype,
                       ostypedesc: resData?.ostypedesc,
                       raverid: resData?.raverid || null,
                       repsteps: resData?.repsteps,
                   }
                   setToState('userPortal', ['defMyRequest'], Object.assign({}, state.defMyRequest, data))
                   setToState('userPortal', ['defMyRequestBase'], Object.assign({}, state.defMyRequest, data))
                   setToState('userPortal', ['newRequestStepper', 'taskBugData'], resData)
               }
           }))
        }
    }, [state.defMyRequest?.transno])



    const handleChange = (e, state) => {
        if (e && e.target) {
            setToState('userPortal', ['defMyRequest', String(e.target.name)], e.target.value)
        } else {
            setToState('userPortal', ['defMyRequest', String(state.name)], state.value)
        }
    }

    return(
        <React.Fragment>
            <Grid item xs={6}>
                <Typography className={classes.requestSubTitle}>
                    {t("str_platform") + "*"}
                </Typography>
                <TextField
                    classes={fieldDisabled ? null : {root:classes.textFieldStyle}}
                    error={state.newRequestStepper.fieldError.platform}
                    disabled={fieldDisabled || state.newRequestStepper.isSaveRequest}
                    select
                    required
                    InputLabelProps={{shrink: false}}
                    fullWidth={true}
                    variant="outlined"
                    name="devproject"
                    margin="dense"
                    value={state.defMyRequest.devproject || ''}
                    onChange={(event) => {
                        handleChange(null, {
                            name: event.target.name,
                            value: event.target.value,
                        })
                        let description = state.requestTransTypes.devproject.find(
                            (devproject) =>
                                String(devproject.code) ===
                                String(event.target.value)
                        ).description
                        handleChange(null, {
                            name: 'devprojectdesc',
                            value: description,
                        })
                        setToState(
                            'userPortal',
                            ['newRequestStepper', 'fieldError', 'platform'],
                            false
                        )
                    }}
                >
                    {state.requestTransTypes.devproject.map((option) => (
                        <MenuItem key={option.code} value={option.code}>
                            {option.description}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={6}>
                {state.defMyRequest.devproject &&
                state.requestTransTypes.raver.length > 0 ? (
                    <div>
                        <Typography className={classes.requestSubTitle}>
                            {t("str_version") + "*"}
                        </Typography>
                        <TextField
                            classes={fieldDisabled ? null : {root:classes.textFieldStyle}}
                            error={state.newRequestStepper.fieldError.version}
                            disabled={fieldDisabled || state.newRequestStepper.isSaveRequest}
                            select
                            required
                            fullWidth={true}
                            variant="outlined"
                            name="raverid"
                            InputLabelProps={{shrink: false}}
                            margin="dense"
                            value={state.defMyRequest.raverid || ''}
                            onChange={(event) => {
                                handleChange(null, {
                                    name: event.target.name,
                                    value: event.target.value,
                                })
                                let description = state.requestTransTypes.raver.find(
                                    (raver) =>
                                        Number(raver.id) ===
                                        Number(event.target.value)
                                ).description
                                handleChange(null, {
                                    name: 'raverdesc',
                                    value: description,
                                })
                                setToState(
                                    'userPortal',
                                    ['newRequestStepper', 'fieldError', 'version'],
                                    false
                                )
                            }}
                        >
                            {state.requestTransTypes.raver.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.description}
                                </MenuItem>
                            ))}
                        </TextField>
                    </div>

                ) : (
                    <div>
                        <Typography className={classes.requestSubTitle}>
                            {t("str_version") + "*"}
                        </Typography>
                        <TextField
                            classes={fieldDisabled ? null : {root:classes.textFieldStyle}}
                            error={state.newRequestStepper.fieldError.version}
                            fullWidth={true}
                            required
                            margin="dense"
                            disabled={fieldDisabled || state.newRequestStepper.isSaveRequest}
                            variant="outlined"
                            id="raverdesc"
                            name="raverdesc"
                            InputLabelProps={{shrink: false}}
                            value={state.defMyRequest.raverdesc || ''}
                            onChange={(e) => {
                                handleChange(e, null)
                                setToState(
                                    'userPortal',
                                    ['newRequestStepper', 'fieldError', 'version'],
                                    false
                                )
                            }}
                        />
                    </div>

                )}
            </Grid>
            <Grid item xs={6}>
                <Typography className={classes.requestSubTitle}>
                    {t("str_osType") + "*"}
                </Typography>
                <TextField
                    classes={fieldDisabled ? null : {root:classes.textFieldStyle}}
                    error={state.newRequestStepper.fieldError.ostype}
                    disabled={fieldDisabled || state.newRequestStepper.isSaveRequest}
                    select
                    required
                    InputLabelProps={{shrink: false}}
                    fullWidth={true}
                    variant="outlined"
                    name="ostype"
                    margin="dense"
                    value={state.defMyRequest.ostype || ''}
                    onChange={(event) => {
                        handleChange(null, {
                            name: event.target.name,
                            value: event.target.value,
                        })
                        let description = state.requestTransTypes.ostype.find(
                            (ostype) =>
                                String(ostype.code) ===
                                String(event.target.value)
                        ).description
                        handleChange(null, {
                            name: 'ostypedesc',
                            value: description,
                        })
                        setToState(
                            'userPortal',
                            ['newRequestStepper', 'fieldError', 'ostype'],
                            false
                        )
                    }}
                >
                    {state.requestTransTypes.ostype.map((option) => (
                        <MenuItem key={option.code} value={option.code}>
                            {option.description}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={6}>
                <Typography className={classes.requestSubTitle}>
                    {t("str_browser") + "*"}
                </Typography>
                <TextField
                    classes={fieldDisabled ? null : {root:classes.textFieldStyle}}
                    error={state.newRequestStepper.fieldError.browser}
                    disabled={fieldDisabled || state.newRequestStepper.isSaveRequest}
                    select
                    required
                    InputLabelProps={{shrink: false}}
                    fullWidth={true}
                    variant="outlined"
                    name="browser"
                    margin="dense"
                    value={state.defMyRequest.browser || ''}
                    onChange={(event) => {
                        handleChange(null, {
                            name: event.target.name,
                            value: event.target.value,
                        })
                        let description = state.requestTransTypes.browser.find(
                            (browser) =>
                                String(browser.code) ===
                                String(event.target.value)
                        ).description
                        handleChange(null, {
                            name: 'browserdesc',
                            value: description,
                        })
                        setToState(
                            'userPortal',
                            ['newRequestStepper', 'fieldError', 'browser'],
                            false
                        )
                    }}
                >
                    {state.requestTransTypes.browser.map((option) => (
                        <MenuItem key={option.code} value={option.code}>
                            {option.description}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12}>
                <CustomToolTip title={t("str_repStepsDesc")} placement={"top-start"} arrow>
                    <Typography className={classes.requestSubTitle}>
                        {t("str_repSteps") + "*"}
                    </Typography>
                </CustomToolTip>
                <TextField
                    classes={fieldDisabled ? null : {root:classes.textFieldStyle}}
                    error={state.newRequestStepper.fieldError.repsteps}
                    required
                    disabled={fieldDisabled || state.newRequestStepper.isSaveRequest}
                    fullWidth={true}
                    variant="outlined"
                    name="repsteps"
                    InputLabelProps={{shrink: false}}
                    margin="dense"
                    multiline
                    rows={3}
                    value={state.defMyRequest.repsteps || ''}
                    onChange={(e) => {
                        handleChange(e, null)
                        setToState(
                            'userPortal',
                            ['newRequestStepper', 'fieldError', 'repsteps'],
                            false
                        )
                    }}
                />
            </Grid>
            <Grid item xs={12}>
                <Typography className={classes.requestSubTitle}>
                    {t("str_result") + "*"}
                </Typography>
                <TextField
                    classes={fieldDisabled ? null : {root:classes.textFieldStyle}}
                    error={state.newRequestStepper.fieldError.result}
                    required
                    disabled={fieldDisabled || state.newRequestStepper.isSaveRequest}
                    fullWidth={true}
                    variant="outlined"
                    name="curres"
                    InputLabelProps={{shrink: false}}
                    margin="dense"
                    multiline
                    rows={3}
                    value={state.defMyRequest.curres || ''}
                    onChange={(e) => {
                        handleChange(e, null)
                        setToState(
                            'userPortal',
                            ['newRequestStepper', 'fieldError', 'result'],
                            false
                        )
                    }}
                />
            </Grid>
            <Grid item xs={12}>
                <Typography className={classes.requestSubTitle}>
                    {t("str_expected") + "*"}
                </Typography>
                <TextField
                    classes={fieldDisabled ? null : {root:classes.textFieldStyle}}
                    error={state.newRequestStepper.fieldError.expected}
                    required
                    disabled={fieldDisabled || state.newRequestStepper.isSaveRequest}
                    fullWidth={true}
                    multiline
                    rows={3}
                    variant="outlined"
                    name="expres"
                    InputLabelProps={{shrink: false}}
                    margin="dense"
                    value={state.defMyRequest.expres || ''}
                    onChange={(e) => {
                        handleChange(e, null)
                        handleChange(null, {
                            name: 'description',
                            value: e.target.value,
                        })
                        setToState(
                            'userPortal',
                            ['newRequestStepper', 'fieldError', 'expected'],
                            false
                        )
                    }}
                />
            </Grid>
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
})

export default connect(mapStateToProps, mapDispatchToProps)(BugReportStep)