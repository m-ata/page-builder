import React, { useContext, useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { deleteFromState, pushToState, setToState, updateState } from 'state/actions'
import { UseOrest, Insert, Patch } from '@webcms/orest'
import { makeStyles } from '@material-ui/core/styles'
import {
    Dialog,
    IconButton,
    Typography,
    Button,
    TextField,
    Grid,
    Checkbox,
    FormControlLabel,
    InputAdornment,
} from '@material-ui/core'

import { isErrorMsg, OREST_ENDPOINT } from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import useTranslation from 'lib/translations/hooks/useTranslation'
import { useSnackbar } from 'notistack';
import LoadingSpinner from "../LoadingSpinner";
import TrackedChangesDialog from "../TrackedChangesDialog";
import {SLASH} from "../../model/globals";
import RaTagSelect from "../RaTagSelect";
import {InsertRaTag, PatchRaTag} from "../../model/orest/components/RaTag";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
    characterCountText: {
        fontSize:"12px",
    },
    inputAdornmentStyle: {
        position:"absolute",
        right:"2px",
        top:"10px",
        "&.MuiInputAdornment-positionStart": {
            marginRight:"0"
        }
    },
    refCodeButton: {
        display: 'flex',
        alignItems:'center',
        justifyContent: 'center',
        backgroundColor: '#EBEBEB',
        width: '24px',
        height: '24px',
        borderRadius: '50%'
    },
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


const AddNoteDialog = (props) => {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();

    //props
    const { setToState, state, mid, open, dataHotelRefNo, getNoteList, isReply, onClose } = props

    //context
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    //redux
    const token = useSelector((state) =>  state?.orest?.currentUser?.auth?.access_token || false);
    const loginfo = useSelector((state) => state?.orest?.currentUser?.loginfo || false);

    //state
    const [isRefCodeLoading, setIsRefCodeLoading] = useState(false);
    const [openTrackedDialog, setOpenTrackedDialog] = useState(false);
    const [selectedTagList, setSelectedTagList] = useState([]);
    const [selectedTagListBase, setSelectedTagListBase] = useState([]);
    const [raTagInfo, setRaTagInfo] = useState(false);
    const [isSaving, setIsSaving] = useState(false);


    useEffect(() => {
        if(state.isEditNote && state.defMyRequestNote) {
            setToState('userPortal', ['defMyRequestNoteBase'], state.defMyRequestNote)
        }
    }, [state.isEditNote])


    const handleSaveNote = () => {
        state.defMyRequestNote.masterid = mid
        const noteMid =  isReply ? state.defMyRequestNoteReply?.mid : state.defMyRequestNote?.mid
        const hotelRefNo = isReply ? state.defMyRequestNoteReply?.hotelrefno : state.defMyRequestNote?.hotelrefno
        const data = isReply ? state.defMyRequestNoteReply : state.defMyRequestNote

        let stringValue = '';
        selectedTagList.map((item, ind) => {
            if(ind < selectedTagList.length - 1) {
                stringValue += `${item.inputValue},`
            } else {
                stringValue += item.inputValue
            }
        })
        setIsSaving(true);
        if(data?.gid) {
            Patch({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RANOTE,
                token,
                gid: data.gid,
                data: data
            }).then((res) => {
                if(res.status === 200) {
                    if(raTagInfo?.gid) {
                        PatchRaTag(GENERAL_SETTINGS.OREST_URL, token, raTagInfo?.gid, selectedTagList, hotelRefNo).then(raTagPatchResponse => {
                            handleResponseAfter(raTagPatchResponse)
                        })
                    } else {
                        if(selectedTagList.length > 0) {
                            InsertRaTag(GENERAL_SETTINGS.OREST_URL, token, noteMid, selectedTagList, hotelRefNo).then(r1 => {
                                handleResponseAfter(r1)
                            })
                        } else {
                            handleResponseAfter(res)
                        }
                    }
                } else {
                    const error = isErrorMsg(res);
                    enqueueSnackbar(t(error.errMsg), { variant: 'error' });
                }
            })
        } else {
            Insert({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RANOTE,
                token: token,
                data: data
            }).then(res => {
                if(res.status === 200) {
                    const raNoteResponseData = res.data.data;
                    if(selectedTagList.length > 0) {
                        InsertRaTag(GENERAL_SETTINGS.OREST_URL, token, raNoteResponseData?.mid, selectedTagList, dataHotelRefNo).then(r1 => {
                            handleResponseAfter(r1)
                        })
                    } else {
                        handleResponseAfter(res)
                    }
                } else {
                    const error = isErrorMsg(res);
                    enqueueSnackbar(t(error.errMsg), { variant: 'error' });
                }
            });
        }
    }

    const handleResponseAfter = (res) => {
        if(res.status === 200) {
            setIsSaving(false);
            setToState('userPortal', ['openNoteDialog'], false);
            enqueueSnackbar(t('str_processCompletedSuccessfully'), { variant: 'success' });
            getNoteList();
            handleReset();
            typeof onClose === 'function' && onClose()
        } else {
            const error = isErrorMsg(res);
            enqueueSnackbar(t(error.errMsg), { variant: 'error' });
        }
    }


    const handleGetNextRefCode = () => {
        setIsRefCodeLoading(true);
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE + SLASH + OREST_ENDPOINT.REFCODE,
            token,
            params: {
                calcnext: 1,
                masterid: mid,
                hotelrefno: dataHotelRefNo,
                pfx: state.defMyRequestNote?.refcode || ''
            }
        }).then(res => {
            setIsRefCodeLoading(false);
            if(res.status === 200) {
                const data = {...state.defMyRequestNote}
                data.refcode = res?.data?.data?.nextcode
                setToState('userPortal', ['defMyRequestNote'], data)
            } else {
                const error = isErrorMsg(res);
                enqueueSnackbar(t(error.errorMsg), {variant: 'error'})
            }
        })
    }

    const handleCloseDialog = () => {
        const value = isReply ? JSON.stringify(state.defMyRequestNoteReply) : JSON.stringify(state.defMyRequestNote)
        const baseValue = isReply ? JSON.stringify(state.defMyRequestNoteReplyBase) : JSON.stringify(state.defMyRequestNoteBase)
        if((value !== baseValue) || selectedTagList.length !== selectedTagListBase.length) {
            setOpenTrackedDialog(true);
        } else {
            if(typeof onClose === 'function') onClose()
            setToState('userPortal', ['openNoteDialog'], false);
            setTimeout(() => {
                handleReset();
            }, 150)
        }

    }

    const handleReset = () => {
        setToState('userPortal', ['isEditNote'], false);
        setToState('userPortal', ['defMyRequestNote'], {});
        setToState('userPortal', ['defMyRequestNoteBase'], {});
        setToState('userPortal', ['defMyRequestNoteReply'], {})
        setToState('userPortal', ['defMyRequestNoteReplyBase'], {})
        setSelectedTagList([]);
        setSelectedTagListBase([]);
        setRaTagInfo(false);
    }



    return (
        <React.Fragment>
            <Dialog
                fullWidth
                maxWidth={"md"}
                open={open}
            >
                <div style={{padding: "24px"}}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <Typography>{state.isEditNote ? t('str_editNote') : t('str_addNote')}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <TextField
                                    disabled={isRefCodeLoading || isSaving}
                                    value={isReply ? (state.defMyRequestNoteReply?.refcode || '') : (state.defMyRequestNote?.refcode || '')}
                                    label={t('str_refCode')}
                                    variant={'outlined'}
                                    fullWidth
                                    onChange={(e) => {
                                        const data = {...state.defMyRequestNote}
                                        data.refcode = e.target.value
                                        setToState('userPortal', ['defMyRequestNote'], data)
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            isRefCodeLoading ? (
                                                <InputAdornment position="start">
                                                    <LoadingSpinner size={24}/>
                                                </InputAdornment>
                                            ) : null
                                        ),
                                    }}
                                />
                                <div style={{paddingLeft: '8px'}}>
                                    <IconButton style={{padding: '0'}} onClick={handleGetNextRefCode}>
                                        <div className={classes.refCodeButton}>
                                            <Typography>R.</Typography>
                                        </div>
                                    </IconButton>
                                </div>
                            </div>
                        </Grid>
                        <Grid item xs={6}>
                            <RaTagSelect
                                id={'tags-outlined'}
                                name={'tags-outlined'}
                                value={selectedTagList}
                                disabled={isSaving}
                                onChange={(event, newValue) => {
                                    setSelectedTagList(newValue)
                                }}
                                onLoad={(raTagInfo, tagList) => {
                                    setSelectedTagList(tagList);
                                    setSelectedTagListBase(tagList);
                                    setRaTagInfo(raTagInfo);
                                }}
                                tableName={OREST_ENDPOINT.RANOTE}
                                variant={'outlined'}
                                mid={state?.defMyRequestNote?.mid || 0}
                                label={t('str_tags')}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                value={isReply ? state.defMyRequestNoteReply?.note : state.defMyRequestNote?.note || ""}
                                label={t('str_note')}
                                variant={'outlined'}
                                disabled={isSaving}
                                multiline
                                rows={4}
                                fullWidth
                                onChange={(e) => {
                                    if(isReply) {
                                        const data = {...state.defMyRequestNoteReply}
                                        data.note = e.target.value
                                        setToState('userPortal', ['defMyRequestNoteReply'], data)
                                    } else {
                                        const data = {...state.defMyRequestNote}
                                        data.note = e.target.value
                                        setToState('userPortal', ['defMyRequestNote'], data)
                                    }
                                }}
                                InputProps={{
                                    endAdornment: <InputAdornment
                                        className={classes.inputAdornmentStyle}
                                        position="start"
                                    >
                                        <Typography className={classes.characterCountText}>
                                            {
                                                state.defMyRequestNote?.note ?
                                                    `${state.defMyRequestNote.note.length}/4096`
                                                    :
                                                    null
                                            }
                                        </Typography>
                                    </InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={state.defMyRequestNote?.isdone || false}
                                        onChange={(e) => {
                                            const data = {...state.defMyRequestNote}
                                            data.isdone = e.target.checked
                                            setToState('userPortal', ['defMyRequestNote'], data)}
                                        }
                                    />
                                }
                                label={t('str_done')}
                                disabled={isSaving}
                            />
                        </Grid>
                        <Grid item xs={10}>
                            <div style={{textAlign: "right"}}>
                                <Button
                                    disabled={isSaving}
                                    variant={'outlined'}
                                    color={'primary'}
                                    startIcon={<CloseIcon />}
                                    onClick={() => handleCloseDialog()}
                                >
                                    {t('str_cancel')}
                                </Button>
                                <Button
                                    disabled={isSaving}
                                    style={{marginLeft: '8px'}}
                                    startIcon={isSaving ? <LoadingSpinner size={24}/> : <CheckIcon />}
                                    onClick={() => handleSaveNote()}
                                    color={'primary'}
                                    variant={'contained'}
                                >
                                    {t('str_save')}
                                </Button>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </Dialog>
            <TrackedChangesDialog
                open={openTrackedDialog}
                onPressNo={(e) => setOpenTrackedDialog(e)}
                onPressYes={(e) => {
                    setToState('userPortal', ['openNoteDialog'], false);
                    if(typeof onClose === 'function') onClose()
                    setToState('userPortal', ['isEditNote'], false);
                    setOpenTrackedDialog(e)
                    setTimeout(() => {
                        handleReset();
                    }, 150)
                }}
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

export default connect(mapStateToProps, mapDispatchToProps)(AddNoteDialog)


AddNoteDialog.propTypes = {
    mid: PropTypes.number,
    dataHotelRefNo: PropTypes.number,
    getNoteList: PropTypes.func,
    handleCloseDialog: PropTypes.func,
    open: PropTypes.bool,
    onClose: PropTypes.func


}
