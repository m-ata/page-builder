import React, { useContext, useEffect, useState, useRef } from 'react'
import { connect, useSelector } from 'react-redux'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import {  ViewList,  UseOrest } from '@webcms/orest'
import { makeStyles } from '@material-ui/core/styles'
import {
    IconButton,
    Typography,
    Grid,
    Checkbox,
    FormControlLabel,
} from '@material-ui/core'

import { isErrorMsg, OREST_ENDPOINT, REQUEST_METHOD_CONST } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import CachedIcon from '@material-ui/icons/Cached';
import AddIcon from '@material-ui/icons/Add'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useSnackbar } from 'notistack';
import RequestDetailNote from "../user-portal/components/RequestDetailNote";
import LoadingSpinner from "../LoadingSpinner";
import {CustomToolTip} from "../user-portal/components/CustomToolTip/CustomToolTip";
import {SLASH} from "../../model/globals";
import PropTypes from "prop-types";
import AddNoteDialog from "./AddNoteDialog";

const useStyles = makeStyles((theme) => ({
    noteContainer: {
        position: 'relative',
        height: '50vh',
        maxHeight: '50vh',
        overflow: 'auto',
    },
    loadingContainer: {
        zIndex: 1,
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)'
    }
}));


const CommonNotes = (props) => {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();

    //props
    const { setToState, updateState, state, mid, dataHotelRefNo, initialIncDone } = props

    //context
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    //redux
    const token = useSelector((state) =>  state?.orest?.currentUser?.auth?.access_token || false);
    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false);

    //state
    const [isDoneFromList, setIsDoneFromList] = useState(initialIncDone);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);
    const [currentScrollY, setCurrentScrollY] = useState(-1);
    const [raNoteUserAccess, setRaNoteUserAccess] = useState(false);

    //ref
    const noteContainerRef = useRef();


    useEffect(() => {
       getNoteList();
       setFirstLoad(false);
       if(!loginfo.selfish) {
           UseOrest({
               apiUrl: GENERAL_SETTINGS.OREST_URL,
               endpoint: OREST_ENDPOINT.TOOLS + SLASH + OREST_ENDPOINT.USER + SLASH + OREST_ENDPOINT.HASRIGHT,
               token,
               params: {
                   empid: loginfo.id,
                   submoduleid: 10125,
               },
           }).then(res => {
               if(res.status === 200) {
                   setRaNoteUserAccess(res.data.data)
               }
           })
       }
    },[])

    useEffect(() => {
        if(state.isEditNote && state.defMyRequestNote) {
            setToState('userPortal', ['defMyRequestNoteBase'], state.defMyRequestNote)
        }
    }, [state.isEditNote])


    const handleGetScroll = () => {
        const scrollTop = noteContainerRef.current?.scrollTop
        setCurrentScrollY(scrollTop);
    }

    const getNoteList = (incDone = isDoneFromList) => {
        updateState('userPortal', 'currentTaskNotesLoading', true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE,
            token,
            params: incDone ? {
                query: `masterid:${mid},needone:false,isprivate::false`,
                hotelrefno: dataHotelRefNo

            } : {
                query: `masterid:${mid},isdone:${incDone},needone:false`,
                hotelrefno: dataHotelRefNo
            }
        }).then((r) => {
            if (r.status === 200) {
                setToState('userPortal', ['currentTaskNotes'], r.data.data)
                updateState('userPortal', 'currentTaskNotesLoading', false)
            } else if (r.status === 401) {
                updateState('userPortal', 'currentTaskNotesLoading', false)
                enqueueSnackbar("401 Unauthorized", { variant: 'error' });
            } else if(r.status === 403) {
                updateState('userPortal', 'currentTaskNotesLoading', false)
                enqueueSnackbar("403 Forbidden", { variant: 'error' });
            } else {
                updateState('userPortal', 'currentTaskNotesLoading', false)
            }
        })
        handleGetScroll();
    }



    const handleDefRequestNote = () => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.DEF,
            token,
            method: REQUEST_METHOD_CONST.GET,
            params: {
                hotelrefno: dataHotelRefNo
            },
        }).then(r => {
            if (r.status === 200) {
                setToState('userPortal', ['defMyRequestNote'], r.data.data);
                setToState('userPortal', ['defMyRequestNoteBase'], r.data.data);
            } else {
                const retErr = isErrorMsg(r);
                enqueueSnackbar(t(retErr.errorMsg), {variant: 'error'})
            }
        });
    };


    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={4}>
                    <Grid container>
                        <Grid item xs={5} sm={2}>
                            <CustomToolTip title={t('str_refresh')}>
                                <IconButton
                                    disabled={state.currentTaskNotesLoading}
                                    onClick={() => {
                                        getNoteList();
                                    }}
                                >
                                    <CachedIcon style={{color:"#F16A4B"}}/>
                                </IconButton>
                            </CustomToolTip>
                        </Grid>
                        <Grid item xs={2}>
                            <CustomToolTip title={t('str_add')}>
                                <IconButton
                                    disabled={state.currentTaskNotesLoading}
                                    onClick={() => {
                                        setOpenAddDialog(true)
                                        setToState('userPortal', ['isEditNote'], false);
                                        handleDefRequestNote()
                                    }}
                                >
                                    <AddIcon/>
                                </IconButton>
                            </CustomToolTip>
                        </Grid>
                        <Grid item xs={7} sm={8}>
                            <div style={{marginTop: '3px', textAlign: 'center'}}>
                                <FormControlLabel
                                    disabled={state.currentTaskNotesLoading}
                                    control={
                                        <Checkbox
                                            color={'primary'}
                                            checked={isDoneFromList}
                                            onChange={() => {
                                                let incDone = isDoneFromList;
                                                incDone = !incDone;
                                                setIsDoneFromList(!isDoneFromList)
                                                getNoteList(incDone)
                                            }}
                                        />
                                    }
                                    label={t('str_incDone')}
                                />
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <div className={classes.noteContainer} ref={noteContainerRef} style={{pointerEvents: state.currentTaskNotesLoading ? 'none': 'unset'}}>
                        {
                            state.currentTaskNotesLoading ? (
                                <div className={classes.loadingContainer} style={{top: `calc(${currentScrollY}px + 25vh)`}}>
                                    <LoadingSpinner size={30}/>
                                </div>
                            ) : null
                        }
                        {
                            state.currentTaskNotes.length > 0 ? (
                                state.currentTaskNotes.map((note, i) => (
                                    note.pid === null && (
                                        <RequestDetailNote
                                            handleGetScroll={handleGetScroll}
                                            key={i}
                                            getNoteList={getNoteList}
                                            raNoteUserAccess={raNoteUserAccess}
                                            currentTaskNotes={state.currentTaskNotes}
                                            data={note}
                                            notemasterid={note.masterid}
                                            isreply={false}
                                            treeLevel={note.treelevel}
                                        />
                                    )
                                ))
                            ) : !firstLoad ? (
                                <Typography
                                    variant="subtitle1"
                                    align="center"
                                    style={{ border: '1px solid #efefef', padding: 25, lineHeight: 1, marginTop: 14 }}
                                >
                                    {t('str_noRecordsToDisplay')}
                                </Typography>
                            ) : null
                        }
                    </div>
                </Grid>
            </Grid>
            <AddNoteDialog
                isReply={false}
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                mid={mid}
                getNoteList={getNoteList}
                dataHotelRefNo={dataHotelRefNo}
            />
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
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    deleteFromState: (stateType, stateName, value) => dispatch(deleteFromState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(CommonNotes)

CommonNotes.defaultProps = {
    initialIncDone: false,
}

CommonNotes.propTypes = {
    initialIncDone: PropTypes.bool,
    mid: PropTypes.number,
    dataHotelRefNo: PropTypes.number
}
