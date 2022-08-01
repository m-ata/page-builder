import React, {useContext, useEffect, useState} from 'react'
import {connect, useSelector} from 'react-redux'
import {useRouter} from "next/router";
import {deleteFromState, pushToState, setToState, updateState} from "../../../state/actions";
import {NextSeo} from 'next-seo';
import Grid from "@material-ui/core/Grid";
import {Patch, ViewList} from "@webcms/orest";
import {DEFAULT_OREST_TOKEN, isErrorMsg, OREST_ENDPOINT} from "../../../model/orest/constants";
import WebCmsGlobal from "components/webcms-global";
import useNotifications from "../../../model/notification/useNotifications";
import {makeStyles} from '@material-ui/core/styles';
import EditIcon from "@material-ui/icons/Edit";
import IconButton from '@material-ui/core/IconButton';
import useStylesTabPanel from './style/TabPanel.Style';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormControl from '@material-ui/core/FormGroup';
import NativeSelect from '@material-ui/core/NativeSelect';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import PropTypes from "prop-types";
import useTranslation from "lib/translations/hooks/useTranslation";

const useStyles = makeStyles(theme => ({
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    },
    field: {
        marginRight: theme.spacing(1),
    }
}));

const EditRequest = (props) => {
    const {
        setToState,
        requestIndex,
        state
    } = props;
    const classes = useStyles();
    const router = useRouter();
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);
    const classesTabPanel = useStylesTabPanel();
    const { t } = useTranslation();
    const {showError} = useNotifications();
    const companyId = router.query.companyID;
    const loginfo = useSelector(state => state.orest.currentUser && state.orest.currentUser.loginfo);
    const token = useSelector(state => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [request, setRequest] = useState([]);
    const [description, setDescription] = useState(state.request[requestIndex].description);


    useEffect(() => {
        let active = true;
        if (active) {
            if (isLoading) {
                return undefined;
            }

            if (loginfo.id) {
                setIsLoading(true);
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.TSTRANS,
                    token,
                    params: {
                        hotelrefno: Number(companyId),
                        query: 'userid:' + loginfo.id
                    }
                }).then(r => {
                    if (active) {
                        if (r.status === 200) {
                            setToState('userPortal', ['request', String(requestIndex)], r.data.data);
                        }
                    }
                });
            }
        }

        return () => {
            active = false;
        };
    }, []);

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const [module, setModule] = React.useState('');
    const [incident, setIncident] = React.useState('');
    const handleChange = event => {
        setModule(event.target.value);
        setIncident(event.target.value);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value)
    };

    const handleSave = () => {
        setIsAdding(true);
        Patch({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TSTRANS,
            token: token,
            gid,
            params: {
                hotelrefno: Number(companyId)
            },
            data: {
                description: description,
            },
        }).then(r1 => {
            if (r1.status === 200) {
                setToState('userPortal', ['request', String(requestIndex), 'description'], r1.data.data.description);
                handleClose();
                showSuccess("Request has been updated!");
            } else {
                const retErr = isErrorMsg(r1);
                showError(retErr.errorMsg);
            }
        });

    };


    return (
        <React.Fragment>
            <NextSeo title="User Portal"/>
            <Grid container direction={"row"}
                  alignItems={"flex-start"}
                  className={classesTabPanel.gridMain}
                  style={{marginLeft: 0, marginTop: -20}}>
                <IconButton size={'small'}
                            onClick={handleOpen}>
                    <EditIcon fontSize={'small'}/>
                </IconButton>
                <Dialog onClose={handleClose} maxWidth="lg"
                        aria-labelledby="customized-dialog-title"
                        open={open}
                        className={classes.dialog}>
                    <DialogTitle
                        id="customized-dialog-title"
                        onClose={handleClose}>
                        {t('str_editRequest')}
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={3}
                              className={classes.grid}>
                            <Grid item xs
                                  className={classes.field}>
                                <TextField
                                    id="date"
                                    label="Date:"
                                    type="date"
                                    defaultValue="2020-04-18"
                                    className={classes.textField}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs
                                  className={classes.field}>
                                <TextField
                                    id="time"
                                    label="Time:"
                                    type="time"
                                    defaultValue="00:00"
                                    className={classes.textField}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        step: 300,
                                    }}
                                />
                            </Grid>
                            <Grid item xs
                                  className={classes.field}>
                                <TextField
                                    variant="filled"
                                    id="transno"
                                    name="transno"
                                    label="Trans#:"
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}
                              className={classes.grid}>
                            <Grid item xs
                                  className={classes.field}>
                                <FormControl>
                                    <InputLabel>Module:</InputLabel>
                                    <NativeSelect
                                        id="demo-customized-select-native"
                                        value={module}
                                        onChange={handleChange}
                                    >
                                        <option
                                            value={10}>{t('str_crm')}
                                        </option>
                                        <option
                                            value={20}>{t('str_hr')}
                                            {t('str_mobileCV')}
                                        </option>
                                        <option
                                            value={30}>{t('str_stock').toUpperCase()}
                                        </option>
                                        <option
                                            value={40}>{t('str_accounting').toUpperCase()}
                                        </option>
                                    </NativeSelect>
                                </FormControl>
                            </Grid>
                            <Grid item xs
                                  className={classes.field}>
                                <FormControl>
                                    <InputLabel>{t('str_incident')}:</InputLabel>
                                    <NativeSelect
                                        id="demo-customized-select-native"
                                        value={incident}
                                        onChange={handleChange}
                                    >
                                        <option
                                            value={50}>{t('str_accounting').toUpperCase()}
                                        </option>
                                        <option
                                            value={60}>{t('str_folio').toUpperCase()}
                                        </option>
                                        <option
                                            value={70}>{t('str_budget').toUpperCase()}
                                        </option>
                                        <option
                                            value={80}>{t('str_crm')}
                                        </option>
                                    </NativeSelect>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}
                              className={classes.grid}>
                            <Grid item xs={12}
                                  className={classes.field}>
                                <TextField
                                    style={{width: 700}}
                                    id="description"
                                    name="description"
                                    label="Description"
                                    className={classes.textField}
                                    value={description || ''}
                                    onChange={handleDescriptionChange}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}
                              className={classes.grid}>
                            <Grid item xs={12}
                                  className={classes.field}>
                                <TextField
                                    style={{width: 700}}
                                    id="Note"
                                    name="note"
                                    label="Note"
                                    className={classes.textField}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}
                                color="primary">
                            {t(' str_cancel')}
                        </Button>
                        <Button autoFocus
                                onClick={handleSave}
                                color="primary">
                            {t('str_save')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </React.Fragment>
    )
};

EditRequest.propTypes = {
    requestIndex: PropTypes.number,
};
const mapStateToProps = state => {
    return {
        state: state.formReducer.userPortal
    }
};

const mapDispatchToProps = dispatch => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditRequest)
