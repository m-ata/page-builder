import React, {useContext, useEffect, useState} from 'react'
import {connect, useSelector} from 'react-redux'
import {deleteFromState, pushToState, setToState, updateState} from "state/actions";
import Button from '@material-ui/core/Button';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {UseOrest,ViewList, Insert} from "@webcms/orest";
import {DEFAULT_OREST_TOKEN, isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST} from "model/orest/constants";
import WebCmsGlobal from "components/webcms-global";
import useNotifications from "model/notification/useNotifications";
import {makeStyles} from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import IconButton from '@material-ui/core/IconButton';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import AddCommentIcon from "@material-ui/icons/AddComment";

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(2),
        paddingBottom: 0
    },
    field: {
        marginRight: theme.spacing(1),
    },
    item: {
        padding: theme.spacing(1)
    },
    textFieldStyle: {
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                border: "1px solid #E8E9EC",
            },
            "&:hover fieldset": {
                borderColor: "#4666B0"
            },
            "&.Mui-focused fieldset": {
                borderColor: "#4666B0",
            },
        },
    }
}));

const NewRequestNote = (props) => {
    const {
        state,
        setToState,
        updateState,
        isDisabled,
        taskmid,
        taskHotelRefNo
    } = props;
    const classes = useStyles();
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);
    const {showError} = useNotifications();
    const loginfo = useSelector(state => state.orest.currentUser && state.orest.currentUser.loginfo);
    const token = useSelector(state => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN);
    const [open, setOpen] = useState(false);
    const [isRefCodeLoading, setIsRefCodeLoading] = useState(false);

    useEffect(() => {
        let active = true;
        if (active) {
            if(!state.defMyRequestNote.length > 0){
                handleDefRequestNote(active);
            }
        }

        return () => {
            active = false;
        };
    }, []);

    const handleDefRequestNote = (active) =>{
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.DEF,
            token,
            method: REQUEST_METHOD_CONST.GET,
            params: {
                start: 0,
                hotelrefno: taskHotelRefNo
            },
        }).then(r => {
            if (active) {
                if (r.status === 200) {
                    setToState('userPortal', ['defMyRequestNote'], r.data.data);
                } else {
                    const retErr = isErrorMsg(r);
                    showError(retErr.errorMsg);
                }
            }
        });
    };

    const handleChange = (e) =>{
        if(e && e.target){
            let defMyRequestNote = state.defMyRequestNote;
            defMyRequestNote[e.target.name] = e.target.value;
            setToState('userPortal', ['defMyRequestNote'], defMyRequestNote);
        }
    };

    const handleSave = () =>{
        state.defMyRequestNote.masterid = taskmid;
        updateState('userPortal', 'currentTaskNotesLoading', true);
        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE,
            token: token,
            params: {
                hotelrefno: taskHotelRefNo
            },
            data: state.defMyRequestNote
        }).then(r1 => {
            if (r1.status === 200) {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RANOTE,
                    token,
                    params: {
                        query: `masterid::${taskmid},isdone::false,isprivate::false`,
                        hotelrefno: taskHotelRefNo
                    }
                }).then(r2 => {
                        if (r2.status === 200) {
                            setToState('userPortal', ['currentTaskNotes'], r2.data.data);
                            handleDefRequestNote(true);
                            updateState('userPortal', 'currentTaskNotesLoading', false);
                        } else {
                            const retErr = isErrorMsg(r2);
                            showError(retErr.errorMsg);
                            updateState('userPortal', 'currentTaskNotesLoading', false);
                        }
                });
            }else{
                updateState('userPortal', 'currentTaskNotesLoading', false);
            }
        });
    };

    return (
        <React.Fragment>
            <Grid container direction="column" className={classes.root} spacing={1}>
            <Grid item xs={12}>
                <Paper className={classes.item}>
                    <Grid container justify="space-between" alignItems="center">
                        <Grid item className={classes.textField} xs={11}>
                            <TextField
                                className={classes.textFieldStyle}
                                variant="outlined"
                                multiline
                                rows={2}
                                id="Note"
                                name="note"
                                label="Note"
                                disabled={state.currentTaskNotesLoading}
                                onChange={handleChange}
                                value={state.defMyRequestNote.note ? state.defMyRequestNote.note : ''}
                                fullWidth
                            />
                        </Grid>
                        <Grid item>
                            <IconButton
                                className={classes.button}
                                aria-label="added"
                                size="small"
                                disabled={state.currentTaskNotesLoading}
                                onClick={handleSave}
                            >
                                <AddCommentIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
            </Grid>
        </React.Fragment>
    )
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
)(NewRequestNote)
