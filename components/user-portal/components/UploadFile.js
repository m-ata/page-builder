import React, {useContext, useEffect, useState} from 'react'
import {connect, useSelector} from 'react-redux'
import {deleteFromState, pushToState, setToState, updateState} from "../../../state/actions";
import {NextSeo} from 'next-seo';
import useStylesTabPanel from './style/TabPanel.Style';
import Button from '@material-ui/core/Button';
import Grid from "@material-ui/core/Grid";
import {ViewList} from "@webcms/orest";
import {DEFAULT_OREST_TOKEN, isErrorMsg, OREST_ENDPOINT} from "../../../model/orest/constants";
import WebCmsGlobal from "components/webcms-global";
import {makeStyles} from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import useNotifications from "../../../model/notification/useNotifications";
import IconButton from '@material-ui/core/IconButton';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import InsertPhotoIcon from '@material-ui/icons/InsertPhoto';
import useTranslation from 'lib/translations/hooks/useTranslation'

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

const UploadPhoto = (props) => {
    const {
        state
    } = props;
    const { t } = useTranslation()
    const classes = useStyles();
    const classesTabPanel = useStylesTabPanel();
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);
    const {showError} = useNotifications();
    const loginfo = useSelector(state => state.orest.currentUser && state.orest.currentUser.loginfo);
    const token = useSelector(state => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [request, setRequest] = useState([]);

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
                        query: 'userid:' + loginfo.id
                    }
                }).then(r => {
                    if (active) {
                        if (r.status === 200) {
                            setRequest(r.data.data);
                            setIsInitialized(true);
                            setIsLoading(false);
                        } else {
                            const retErr = isErrorMsg(r);
                            showError(retErr.errorMsg);
                            setIsInitialized(true);
                            setIsLoading(false);
                        }
                    }
                });
            } else {
                setIsInitialized(true);
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
    const handleClose = () => {
        setOpen(false);
    };
    const handlePhotoOpen = () => {
        setOpen(true);
    };
    const handlePhotoClose = () => {
        setOpen(false);
    };

    const [module, setModule] = React.useState('');
    const [incident, setIncident] = React.useState('');
    const handleChange = event => {
        setModule(event.target.value);
        setIncident(event.target.value);
    };

    return (
        <React.Fragment>
            <NextSeo title="User Portal"/>
            <Grid container direction={"row"} alignItems={"flex-start"} className={classesTabPanel.gridMain}
                  style={{marginLeft: 0, marginTop: -30}}>
                <IconButton size={'small'}
                            onClick={handlePhotoOpen}>
                    <InsertDriveFileIcon fontSize={'small'}/>
                </IconButton>
                <Dialog onClose={handlePhotoClose}
                        maxWidth="lg"
                        aria-labelledby="customized-dialog-title"
                        open={open}
                        className={classes.dialog}>
                    <DialogTitle
                        id="customized-dialog-title"
                        onClose={handlePhotoClose}>
                        {t('str_uploadAFile')}
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={3}
                              className={classes.grid}>
                            <input
                                color="primary"
                                type="file"
                                id="icon-button-file"
                                style={{display: 'none',}}
                            />
                            <label
                                htmlFor="icon-button-file">
                                <Button
                                    variant="contained"
                                    component="span"
                                    className={classes.button}
                                    size="large"
                                    color="primary"
                                >
                                    <InsertPhotoIcon
                                        className={classes.extendedIcon}/>
                                </Button>
                            </label>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handlePhotoClose}
                                color="primary">
                            {t('str_cancel')}
                        </Button>
                        <Button autoFocus
                                onClick={handlePhotoClose}
                                color="primary">
                            {t('str_save')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </React.Fragment>
    )
};

const mapStateToProps = state => {
    return {
        state: state.formReducer.registerStepper
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
)(UploadPhoto)
