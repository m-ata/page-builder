import React, {useState, useContext, useEffect} from 'react';
//material imports
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {makeStyles} from "@material-ui/core/styles";
import {Checkbox, FormControlLabel} from "@material-ui/core";
//redux imports
import { connect } from 'react-redux';
import {setToState, updateState} from "../../../../../state/actions";
// imports for toaster
import { ToastContainer, toast } from 'react-toastify';
//imports configs
import WebCmsGlobal from "components/webcms-global";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../../model/orest/constants";
//router import
import { useRouter } from "next/router";

import {Insert, Patch, ViewList} from "@webcms/orest";
import {COLORS, SAVED_SUCCESS, UPDATE_SUCCESS} from "../../constants";
import LoadingSpinner from "../../../../LoadingSpinner";

const useStyles = makeStyles(theme => ({
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    }
}));

const WebsiteFinal = (props) => {

    const { state,
        dialogTitle,
        resetFinal,
        updateState,
        isWebsiteSelected
    } = props;

    const [isOpen, setOpen] = useState(true);
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [langFileGID, setLangFileGID] = useState('');
    const [isTemplate, setIsTemplate] = useState(false);
    const [websiteData, setWebsiteData] = useState(null);
    const emptyWebsite = {
        header: {},
        pages: [],
        footer: {}
    };
    const [isLoaded, setIsLoaded] = useState(true);

    const classes = useStyles();

    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);

    const router = useRouter();
    const companyId = router.query.companyID;
    const authToken = token || router.query.authToken;

    useEffect(() => {
        if (isWebsiteSelected) {
            setIsLoaded(false);
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token: authToken,
                params: {
                    query: `code:${state.code},filetype::WEBSITE`,
                    hotelrefno:  Number(companyId)
                }
            }).then(res => {
                if (res.status === 200 && res?.data?.data?.length > 0) {
                    setIsLoaded(true);
                    setWebsiteData(res.data.data[0]);
                    if (!res.data.data[0].istemplate) {
                        setIsTemplate(res.data.data[0].istemplate);
                        setCode(res.data.data[0].code);
                        setDescription(res.data.data[0].description);
                    }
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RAFILE,
                        token: authToken,
                        params: {
                            query: `code:${state.code},filetype::LANG.WEBSITE,masterid::${res.data.data[0].mid}`,
                            hotelrefno: Number(companyId),
                        },
                    }).then(res1 => {
                        if (res1.status === 200 && res1.data && res1.data.data.length > 0) {
                            setLangFileGID(res1.data.data[0].gid);
                        }
                    })
                } else {
                    setIsLoaded(true);
                }
            })
        }
    }, [isWebsiteSelected]);

    const handleSave = () => { //saving website into rafile

        if (isWebsiteSelected) {
            if (websiteData && websiteData.istemplate) {
                insertRafile();
            } else {
                patchRafile();
            }
        } else {
            insertRafile();
        }
    };

    const insertRafile = () => {
        setIsLoaded(false);
        Insert({ // insert website to rafile
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            data: {
                code: code,
                description: description,
                filetype: 'WEBSITE',
                filedata: Buffer.from(JSON.stringify(state.website)).toString("base64"),
                istemplate: isTemplate,
                hotelrefno: Number(companyId)
            },
        }).then(res => {
            if (res.status === 200 && res?.data?.data) {
                Insert({
                    // insert language file for web page into rafile
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: authToken,
                    data: {
                        code: code,
                        description: description,
                        contentype: '0000530',
                        filetype: 'LANG.WEBSITE',
                        filedata: Buffer.from(JSON.stringify(state.langsFile)).toString('base64'),
                        masterid: res.data.data.mid,
                        hotelrefno: Number(companyId),
                    },
                }).then(res1 => {
                    if (res1.status === 200 && res1?.data?.data) {
                        setIsLoaded(true);
                        updateState('pageBuilder', 'pageStep', 0);
                        updateState('pageBuilder', 'isTemplate', false);
                        updateState('pageBuilder', 'previousStep', 0);
                        updateState('pageBuilder', 'website', emptyWebsite);
                        updateState('pageBuilder', 'langsFile', {});
                        handleReset();
                        toast.success(SAVED_SUCCESS, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    } else {
                        setIsLoaded(true);
                        const retErr = isErrorMsg(res);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
            } else {
                setIsLoaded(true);
                if (res.data.message) {
                    toast.error(res.data.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            }
        })
    }

    const patchRafile = () => {
        setIsLoaded(false);
        Patch({ // update website into rafile
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            gid: websiteData.gid,
            params: {
                hotelrefno: Number(companyId)
            },
            data: {
                code: code,
                description: description,
                filetype: 'WEBSITE',
                filedata: Buffer.from(JSON.stringify(state.website)).toString("base64"),
                istemplate: isTemplate,
                hotelrefno: Number(companyId)
            },
        }).then(res1 => {
            if (res1.status === 200 && res1?.data?.data) {
                Patch({
                    // update lang file for web page to rafile
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.RAFILE,
                    token: authToken,
                    gid: langFileGID,
                    params: {
                        hotelrefno: Number(companyId)
                    },
                    data: {
                        code: code,
                        description: description,
                        contentype: '0000530',
                        filetype: 'LANG.WEBSITE',
                        filedata: Buffer.from(JSON.stringify(state.langsFile)).toString('base64'),
                        masterid: res1.data.data.mid,
                        hotelrefno: Number(companyId),
                    },
                }).then(res2 => {
                    if (res2.status === 200 && res2?.data?.data) {
                        setIsLoaded(true);
                        updateState('pageBuilder', 'pageStep', 0);
                        updateState('pageBuilder', 'isTemplate', false);
                        updateState('pageBuilder', 'previousStep', 0);
                        updateState('pageBuilder', 'website', emptyWebsite);
                        updateState('pageBuilder', 'langsFile', {});
                        toast.success(UPDATE_SUCCESS, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        handleReset();
                    } else {
                        setIsLoaded(true);
                        const retErr = isErrorMsg(res1);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
            } else {
                setIsLoaded(true);
                if (res1.data.message) {
                    toast.error(res1.data.message, {
                        position: toast.POSITION.TOP_RIGHT
                    });
                }
            }
        })
    }

    const handleReset = () => {
        setCode('');
        setDescription('');
        setOpen(false);
        resetFinal('');
    }

    return (
        <React.Fragment>
            <Dialog disableBackdropClick disableEnforceFocus fullWidth={true} maxWidth="md" open={isOpen} onClose={handleReset} aria-labelledby="form-dialog-title">
                <DialogTitle color="secondary" > {dialogTitle} <hr /> </DialogTitle>
                <DialogContent>
                    {
                        !isLoaded ? <LoadingSpinner style={{color: COLORS.secondary}} size={40} /> :
                            <>
                                <div>
                                    <TextField
                                        label='Code'
                                        placeholder="Please enter code here ..."
                                        value={code}
                                        style={{minWidth: 500}}
                                        onChange={(e) => setCode(e.target.value)}
                                        variant="outlined"
                                    >
                                    </TextField>
                                </div>
                                <div style={{marginTop: 30}}>
                                    <TextField
                                        label='Description'
                                        placeholder="Please enter description here ..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        multiline
                                        style={{minWidth: 500}}
                                        rows={1}
                                        rowsMax={4}
                                        variant="outlined"
                                    />
                                </div>
                                <div>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isTemplate}
                                                onChange={() => setIsTemplate(!isTemplate)}
                                                name="istemplate"
                                                color="primary"
                                            />
                                        }
                                        label="Save as Template"
                                    />
                                </div>
                            </>
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleReset}
                        variant="contained"
                        size="small"
                        aria-label="add"
                        className={classes.actionButton}
                        disabled={!isLoaded}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSave}
                        className={classes.actionButton}
                        variant="contained"
                        size="small"
                        aria-label="add"
                        color="primary"
                        disabled={!(description && code) || !isLoaded}
                    >
                        APPLY
                    </Button>
                </DialogActions>
            </Dialog>



            <ToastContainer autoClose={8000} />
        </React.Fragment>
    )
}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

const mapDispatchToProps = dispatch => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WebsiteFinal);
