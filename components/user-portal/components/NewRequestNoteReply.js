import React, {useContext, useEffect, useState} from 'react'
import {connect, useSelector} from 'react-redux'
import {deleteFromState, pushToState, setToState, updateState} from "state/actions";
import Button from '@material-ui/core/Button';
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {UseOrest, Delete, ViewList, Insert, Patch} from "@webcms/orest";
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
import ClearIcon from '@material-ui/icons/Clear';
import LoadingSpinner from "../../LoadingSpinner";

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(2),
        paddingTop: 0,
        paddingBottom: 0,
        marginBottom: theme.spacing(1)
    },
    field: {
        marginRight: theme.spacing(1),
    },
    item: {
        padding: theme.spacing(1)
    }
}));


const NewRequestNoteReply = (props) => {
    const {
        state,
        setToState,
        updateState,
        taskmid,
        noteid,
        userid,
        taskHotelRefNo,
        getNoteList
    } = props;
    const classes = useStyles();
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);
    const {showError} = useNotifications();
    const loginfo = useSelector(state => state.orest.currentUser && state.orest.currentUser.loginfo);
    const token = useSelector(state => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [request, setRequest] = useState([]);
    const [open, setOpen] = useState(false);
    const [isRefCodeLoading, setIsRefCodeLoading] = useState(false);

    const handleCloseRequestNote = () => {
        setOpen(false);
    };

    const handleChange = (e) =>{
        if(e && e.target){
            let defMyRequestNoteReply = state.defMyRequestNoteReply;
            defMyRequestNoteReply[e.target.name] = e.target.value;
            setToState('userPortal', ['defMyRequestNoteReply'], defMyRequestNoteReply);
        }
    };

    const handleSave = () =>{
        setIsLoading(true);
        Patch({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE,
            token,
            gid: state.defMyRequestNoteReply.gid,
            params: {
                hotelrefno: taskHotelRefNo,
            },
            data: {
                note: state.defMyRequestNoteReply.note
            }
        }).then(r1 => {
            if (r1.status === 200) {
                updateState('userPortal', 'currentTaskNotesLoading', true);
                setToState('userPortal', ['defMyRequestNoteReply'], []);
                setIsLoading(false);
                getNoteList();

            } else {
                setIsLoading(false);
                const retErr = isErrorMsg(r1);
                showError(retErr.errorMsg);
                updateState('userPortal', 'currentTaskNotesLoading', false);
            }
        });
    };

    const handleClear = () =>{
        Delete({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE,
            token,
            gid:  state.defMyRequestNoteReply.gid,
            params: {
                hotelrefno: taskHotelRefNo
            }
        }).then(r => {
            if (r.status === 200) {
                setToState('userPortal', ['defMyRequestNoteReply'], []);
            }else{

            }
        });
    };

    return (
        <React.Fragment>
            <Grid container
                  direction="row"
                  justify="flex-end"
                  alignItems="center" className={classes.root} spacing={1}>
                <Grid item xs={8}>
                    <Paper className={classes.item}>
                        <Grid container justify="space-between" alignItems="center">
                            <Grid item className={classes.textField} xs={9}>
                                <TextField
                                    variant="outlined"
                                    multiline
                                    rows={2}
                                    id="Note"
                                    name="note"
                                    label="Note"
                                    disabled={state.currentTaskNotesLoading}
                                    onChange={handleChange}
                                    value={state.defMyRequestNoteReply.note ? state.defMyRequestNoteReply.note : ''}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item>
                                <IconButton
                                    className={classes.button}
                                    aria-label="added"
                                    size="small"
                                    disabled={state.currentTaskNotesLoading || isLoading}
                                    onClick={handleSave}
                                >
                                    { isLoading ?
                                        <LoadingSpinner size={20}/>:
                                        <AddCommentIcon />
                                    }
                                </IconButton>
                                <IconButton
                                    className={classes.button}
                                    aria-label="added"
                                    size="small"
                                    disabled={state.currentTaskNotesLoading || isLoading}
                                    onClick={handleClear}
                                >
                                    <ClearIcon />
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
)(NewRequestNoteReply)
