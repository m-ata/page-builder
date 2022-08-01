import React, {useContext, useEffect, useState} from 'react';
//material imports
import Paper from "@material-ui/core/Paper";
import { makeStyles } from '@material-ui/core/styles'

//redux imports
import { connect } from 'react-redux';
import {setToState, updateState} from "../../../../../../state/actions";

//server related imports
import { ViewList} from "@webcms/orest";
import {OREST_ENDPOINT} from "../../../../../../model/orest/constants";
import WebCmsGlobal from "../../../../../webcms-global";
import {useRouter} from "next/router";

import {COLORS} from "../../../constants";
import PageItemList from "./PageItemList";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles(theme => ({

    pageBlock: {
        border: `2px solid ${COLORS?.secondary}`,
        height: 200,
        width: 200,
        overflow: 'auto',
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(1),
        cursor: "pointer"
    },
    pageContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        height: 500,
        overflow: 'auto',
    },
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    },
    codeText: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(2),
    }
}));

const EditPage = (props) => {

    const {
        onEditPage,
        webPages,
        resetRender,
        dialogTitle,
        isDialogOpen
    } = props;

    const classes = useStyles();

    const [pages, setPages] = useState([]);
    const [selectedIndexes, setSelectedIndexes] = useState([]);
    const [selectedPages, setSelectedPages] = useState(webPages);
    const [openModal, setOpenModal] = useState(isDialogOpen);

    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const router = useRouter();
    const companyId = router.query.companyID;
    const authToken = token || router.query.authToken;

    useEffect(() => {
        //getting web page from rafile
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RAFILE,
            token: authToken,
            params: {
                hotelrefno: Number(companyId),
                query: `filetype:WEBPAGE`,
            }
        }).then(res => {
            if (res.status === 200 && res.data && res.data.data) {
                setPages(res.data.data);
                let updatedIndexes = [];
                webPages.map(page => {
                    const pageIndex = res.data.data.find(x => x.gid === page.gid);
                    if (pageIndex || pageIndex === 0) {
                        updatedIndexes.push(res.data.data.indexOf(pageIndex));
                    }
                });
                setSelectedIndexes(updatedIndexes)
            }
        })
    }, []);

    const handleSelectedPage = (index, page) => {
        const updatedIndexes = [...selectedIndexes];
        const updatedPages = [...selectedPages];
        const indexExist = selectedIndexes.find(x => x=== index);
        if (!indexExist && indexExist !==0) {
            updatedIndexes.push(index);
            updatedPages.push({
                gid: page?.gid,
                code: [page?.code]
            })
        } else {
            const i = selectedIndexes.indexOf(indexExist);
            updatedIndexes.splice(i, 1);
            updatedPages.splice(i, 1);
        }
        setSelectedIndexes(updatedIndexes);
        setSelectedPages(updatedPages);
    }

    const handleCancel = () => {
        setOpenModal(false);
        resetRender();
    }

    const handleApply = () => {
        onEditPage(selectedPages);
        setOpenModal(false);
        resetRender();
    }

    return (
        <Dialog disableBackdropClick disableEnforceFocus fullWidth={true} maxWidth="md" open={openModal}
                onClose={handleCancel} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title" color="secondary"> {dialogTitle}
                <hr/>
            </DialogTitle>
            <DialogContent>
                <Grid container={true} className={classes.pageContainer}>
                    {
                        pages.length > 0 && pages.map((page, index) => {
                            return (
                                <Grid item key={`page-${index}`}>
                                    <Paper
                                        className={classes.pageBlock}
                                        onClick={() => handleSelectedPage(index, page)}
                                        style={{border: index === selectedIndexes.find(x => x=== index) ? `2px solid red` :
                                                `2px solid ${COLORS?.secondary}`}}
                                    >
                                        <PageItemList
                                            pageData={JSON.parse(Buffer.from(page.filedata, 'base64').toString('utf-8'))} />
                                    </Paper>
                                    <Typography
                                        component={'div'}
                                        className={classes.codeText}
                                        style={{
                                            color: index === selectedIndexes.find(x => x=== index) ? `red` :
                                                `${COLORS?.secondary}`
                                        }}
                                    > {page.code} </Typography>
                                </Grid>
                            )
                        })
                    }
                </Grid>
                <hr />
            </DialogContent>
            <DialogActions>
                <Button
                    className={classes.actionButton}
                    onClick={handleCancel}
                    variant="contained"
                    size="small"
                    aria-label="add"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleApply}
                    className={classes.actionButton}
                    variant="contained"
                    size="small"
                    aria-label="add"
                    color="primary"
                    disabled={selectedPages.length === 0}
                >
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

const mapDispatchToProps = dispatch => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditPage)
