import React, { useState, useContext, useEffect } from 'react'
//material imports
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
//redux imports
import { connect } from 'react-redux'
// imports for toaster
import { ToastContainer, toast } from 'react-toastify'
//imports configs
import WebCmsGlobal from 'components/webcms-global'
import { isErrorMsg, OREST_ENDPOINT } from '../../../../../model/orest/constants'
//router import
import { useRouter } from 'next/router'
import { makeStyles } from '@material-ui/core/styles'
import { setToState, updateState } from '../../../../../state/actions'
import { Insert, Patch, ViewList } from '@webcms/orest'
import { Checkbox, FormControlLabel } from '@material-ui/core'
import {COLORS, SAVED_SUCCESS, UPDATE_SUCCESS} from "../../constants";
import LoadingSpinner from "../../../../LoadingSpinner";

const useStyles = makeStyles((theme) => ({
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    },
}))

const Final = (props) => {
    const { state, dialogTitle, resetFinal, isWebPageSelected, updateState } = props

    //local state
    const [isOpen, setOpen] = useState(true)
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [isTemplate, setIsTemplate] = useState(false)
    const [webPage, setWebPage] = useState('');
    const [langFileGID, setLangFileGID] = useState('');
    const [isRequestSend, setRequestSend] = useState(false);
    const emptyPage = {
        id: '',
        sections: [],
    };
    const [websiteData, setWebsiteData] = useState(null);
    const [websiteGID, setWebsiteGID] = useState(null);

    const classes = useStyles();

    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);

    const router = useRouter();
    const companyId = router.query.companyID;
    const authToken = token || router.query.authToken;

    useEffect(() => {
        if (isWebPageSelected && state.code) {
            setRequestSend(true);
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token: authToken,
                params: {
                    query: `code::${state.code},filetype::WEBPAGE`,
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                if (res.status === 200 && res.data && res.data.data.length > 0) {
                    setWebPage(res.data.data[0])
                    if (!res.data.data[0].istemplate) {
                        setCode(res.data.data[0].code)
                        setDescription(res.data.data[0].description);
                        setIsTemplate(res.data.data[0].istemplate)
                    }
                    ViewList({
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.RAFILE,
                        token: authToken,
                        params: {
                            query: `code::${state.code},filetype::LANG.WEBPAGE`,
                            hotelrefno: Number(companyId),
                        },
                    }).then(res1 => {
                        if (res1.status === 200 && res1.data && res1.data.data.length > 0) {
                            setLangFileGID(res1.data.data[0].gid);
                            ViewList({
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: OREST_ENDPOINT.RAFILE,
                                token: authToken,
                                params: {
                                    query: `code::WEBINDEX,filetype::WEBSITE`,
                                    hotelrefno: Number(companyId),
                                },
                            }).then(res2 => {
                                if (res2?.status === 200 && res2?.data?.data?.length > 0) {
                                    setRequestSend(false);
                                    const website = JSON.parse(Buffer.from(res2?.data?.data[0]?.filedata, 'base64').toString('utf-8'));
                                    setWebsiteGID(res2.data.data[0].gid);
                                    const updatedWebsitePages = [...website.pages];
                                    const page = updatedWebsitePages?.find(x => x?.gid === res.data.data[0].gid);
                                    if (page) {
                                        const index = updatedWebsitePages.indexOf(page);
                                        if (page?.code) {
                                            const pageCode = page?.code?.find(x => x === code);
                                            if (!pageCode) {
                                                page.code.push(code);
                                            }
                                        } else {
                                            page['code'] = [code];
                                        }
                                        updatedWebsitePages[index] = page;
                                        website.pages = updatedWebsitePages;
                                    }
                                    setWebsiteData(website);
                                } else {
                                    setRequestSend(false);
                                }
                            })
                        } else {
                            setRequestSend(false);
                            toast.error('Something went wrong while fetching language webpage file. Please check network tab.', {
                                position: toast.POSITION.TOP_RIGHT,
                            })
                        }
                    })
                } else {
                    setRequestSend(false);
                    toast.error('Something went wrong while fetching webpage file. Please check network tab.', {
                        position: toast.POSITION.TOP_RIGHT,
                    })
                }
            })
        }
    }, [isWebPageSelected, state.code])

    const handleSave = () => {
        // saving web page in rafile
        if (isWebPageSelected) {
            if (webPage && webPage.istemplate) {
                rafileInsert();
            } else {
                rafilePatch();
            }
        } else {
            rafileInsert()
        }
    }

    const rafileInsert = () => {
        setRequestSend(true);
        Insert({
            // insert web page json to rafile
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            data: {
                code: code,
                description: description,
                filetype: 'WEBPAGE',
                filedata: Buffer.from(JSON.stringify(state.page)).toString('base64'),
                istemplate: isTemplate,
                langid: state.langId,
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
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
                        filetype: 'LANG.WEBPAGE',
                        filedata: Buffer.from(JSON.stringify(state.langsFile)).toString('base64'),
                        masterid: res.data.data.mid,
                        hotelrefno: Number(companyId),
                    },
                }).then(res1 => {
                    if (res1.status === 200 && res1?.data?.data) {
                        setRequestSend(false);
                        handleClearData();
                        handleReset();
                        toast.success(SAVED_SUCCESS, {
                            position: toast.POSITION.TOP_RIGHT,
                        });
                    } else {
                        setRequestSend(false);
                        const retErr = isErrorMsg(res);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
            } else {
                setRequestSend(false);
                const retErr = isErrorMsg(res);
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    const rafilePatch = () => {
        setRequestSend(true);
        Patch({
            // update web page json to rafile
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            gid: webPage.gid,
            params: {
                hotelrefno: Number(companyId)
            },
            data: {
                code: code,
                description: description,
                filedata: Buffer.from(JSON.stringify(state.page)).toString('base64'),
                istemplate: isTemplate,
                hotelrefno: Number(companyId),
            },
        }).then((res1) => {
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
                        filedata: Buffer.from(JSON.stringify(state.langsFile)).toString('base64'),
                        masterid: res1.data.data.mid,
                        hotelrefno: Number(companyId),
                    },
                }).then(res2 => {
                    if (res2.status === 200 && res2?.data?.data) {
                        const website = {...websiteData};
                        const updatedWebsitePages = [...website.pages];
                        const page = updatedWebsitePages?.find(x => x?.gid === res1.data.data.gid);
                        if (page) {
                            const index = updatedWebsitePages.indexOf(page);
                            if (page?.code) {
                                const pageCode = page?.code?.find(x => x === code);
                                if (!pageCode) {
                                    page.code.push(code);
                                }
                            } else {
                                page['code'] = [code];
                            }
                            updatedWebsitePages[index] = page;
                            website.pages = updatedWebsitePages;
                            Patch({ // update website into rafile
                                apiUrl: GENERAL_SETTINGS.OREST_URL,
                                endpoint: OREST_ENDPOINT.RAFILE,
                                token: authToken,
                                gid: websiteGID,
                                params: {
                                    hotelrefno: Number(companyId)
                                },
                                data: {
                                    filedata: Buffer.from(JSON.stringify(website)).toString("base64"),
                                    hotelrefno: Number(companyId)
                                },
                            }).then(res3 => {
                                if (res3?.status === 200 && res3?.data?.data) {
                                    setRequestSend(false);
                                    handleClearData();
                                    handleReset();
                                    toast.success(UPDATE_SUCCESS, {
                                        position: toast.POSITION.TOP_RIGHT,
                                    });

                                } else {
                                    const retErr = isErrorMsg(res3);
                                    toast.error(retErr.errorMsg, {
                                        position: toast.POSITION.TOP_RIGHT,
                                    })
                                }
                            })
                        } else {
                            setRequestSend(false);
                            handleClearData();
                            toast.success(UPDATE_SUCCESS, {
                                position: toast.POSITION.TOP_RIGHT,
                            });
                            handleReset();
                        }
                    } else {
                        setRequestSend(false);
                        const retErr = isErrorMsg(res2);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT,
                        })
                    }
                })
            } else {
                setRequestSend(false);
                const retErr = isErrorMsg(res1);
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    const handleClearData = () => {
        updateState('pageBuilder', 'pageStep', 0);
        updateState('pageBuilder', 'isTemplate', false);
        updateState('pageBuilder', 'previousStep', 0);
        updateState('pageBuilder', 'page', emptyPage);
        updateState('pageBuilder', 'langsFile', {});
    }

    const handleReset = () => {
        setCode('')
        setDescription('')
        setOpen(false)
        resetFinal('')
    }

    return (
        <React.Fragment>
            <Dialog
                disableBackdropClick
                disableEnforceFocus
                fullWidth={true}
                maxWidth="md"
                open={isOpen}
                onClose={handleReset}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle color="secondary">
                    {' '}
                    {dialogTitle} <hr />{' '}
                </DialogTitle>
                <DialogContent>
                    {
                        isRequestSend ? <LoadingSpinner style={{color: COLORS.secondary}} size={40} /> :
                            <>
                                <div>
                                    <TextField
                                        label="Code"
                                        placeholder="Please enter code here ..."
                                        value={code}
                                        style={{minWidth: 500}}
                                        onChange={(e) => setCode(e.target.value)}
                                        variant="outlined"
                                    />
                                </div>
                                <div style={{marginTop: 30}}>
                                    <TextField
                                        label="Description"
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
                        disabled={isRequestSend}
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
                        disabled={!(description && code) || isRequestSend}
                    >
                        APPLY
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer autoClose={8000} />
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Final)
