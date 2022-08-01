import React, {useContext, useEffect, useState} from 'react';
import {Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import { connect } from 'react-redux'
import {updateState} from "../../../../../state/actions";
import {useRouter} from "next/router";
import {Insert, Patch, ViewList} from "@webcms/orest";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../../model/orest/constants";
import WebCmsGlobal from "components/webcms-global";
import {toast} from "react-toastify";
import {SAVED_SUCCESS, UPDATE_SUCCESS} from "../../constants";

const useStyles = makeStyles((theme) => ({
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    },
}))

const FAQSave = (props) => {

    const { state, updateState, resetFinal } = props;
    //local state
    const [isOpen, setOpen] = useState(true)
    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [isTemplate, setIsTemplate] = useState(false)
    const classes = useStyles();

    const router = useRouter();
    const companyId = router.query.companyID;
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    useEffect(() => {
        if (router.query.filegid) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token: authToken,
                params: {
                    hotelrefno: Number(companyId),
                    query: `gid:${router.query.filegid}`
                },
            }).then(res => {
                if (res && res.status === 200 && res.data && res.data.data && res.data.data.length > 0) {
                    setCode(res.data.data[0].code);
                    setDescription(res.data.data[0].description);
                    setIsTemplate(res.data.data[0].istemplate);
                }
            })
        }
    }, []);

    const handleReset = () => {
        setCode('')
        setDescription('')
        setOpen(false)
        resetFinal('')
    }

    const handleSave = () => {
        router.query.filegid ? updateFAQ(router.query.filegid) : insertFAQ();
    }

    const insertFAQ = () => { // insert faq to rafile
        Insert({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            data: {
                code: code,
                description: description,
                contentype: '0000525',
                filetype: 'FAQ',
                filedata: Buffer.from(JSON.stringify(state.faq)).toString("base64"),
                istemplate: isTemplate,
                masterid: router.query.masterid ?  router.query.masterid : null,
                langid: state.langId,
                langcode: state.langCode,
                langdesc: state.langDesc,
                hotelrefno: Number(companyId)
            },
        }).then(res => {
            if (res.status === 200 && res.data && res.data.data) {
                updateState('pageBuilder', 'previousStep', 0);
                updateState('pageBuilder', 'pageStep', 0);
                updateState('pageBuilder', 'faq', [{
                    id: 'cat-0',
                    type: 'category',
                    text: 'New Category',
                    items: []
                }]);
                updateState('pageBuilder', 'faqActiveTab', 'cat-0');
                toast.success(SAVED_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT
                });
                handleReset();
            } else {
                const retErr = isErrorMsg(res);
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    const updateFAQ = (gid) => { // update faq into rafile
        Patch({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            gid: gid,
            data: {
                code: code,
                description: description,
                contentype: '0000525',
                filedata: Buffer.from(JSON.stringify(state.faq)).toString('base64'),
                istemplate: isTemplate,
                langid: state.langId,
                langcode: state.langCode,
                langdesc: state.langDesc,
                hotelrefno: Number(companyId),
            },
        }).then(res => {
            if (res && res.status === 200 && res.data && res.data.data) {
                updateState('pageBuilder', 'previousStep', 0);
                updateState('pageBuilder', 'pageStep', 0);
                updateState('pageBuilder', 'faqActiveTab', 'cat-0');
                toast.success(UPDATE_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT
                });
                handleReset();
            } else {
                const retErr = isErrorMsg(res);
                toast.error(retErr.errorMsg, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    return (
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
                Save
                <hr />
            </DialogTitle>
            <DialogContent>
                <div>
                    <TextField
                        label="Code"
                        placeholder="Please enter code here ..."
                        value={code}
                        style={{ minWidth: 500 }}
                        onChange={(e) => setCode(e.target.value)}
                        variant="outlined"
                    />
                </div>
                <div style={{ marginTop: 30 }}>
                    <TextField
                        label="Description"
                        placeholder="Please enter description here ..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        style={{ minWidth: 500 }}
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
                                name="isTemplate"
                                color="primary"
                            />
                        }
                        label="Save as Template"
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleReset}
                    variant="contained"
                    size="small"
                    aria-label="add"
                    className={classes.actionButton}
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
                    disabled={!(description && code)}
                >
                    APPLY
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(FAQSave);