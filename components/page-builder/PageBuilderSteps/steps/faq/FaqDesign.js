import React, {useContext, useEffect, useState} from 'react';
import {Container, AppBar, Tab, Tabs, Typography, Box, Grid, Divider} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from '@material-ui/core/styles';
import ControlPointIcon from '@material-ui/icons/ControlPoint';
import { connect } from 'react-redux';
import FAQ_Dialog from "../../components/faq/dialog/Dialog";
import { pushToState, updateState, setToState } from "../../../../../state/actions";
import {COLORS, DELETE_SUCCESS, DATA_EMPTY} from "../../constants";
import {AlertDialog} from "../../components/alert";
import { toast } from 'react-toastify'
import {useRouter} from "next/router";
import WebCmsGlobal from "components/webcms-global";
import {ViewList} from "@webcms/orest";
import {isErrorMsg, OREST_ENDPOINT} from "../../../../../model/orest/constants";
import clsx from "clsx";
import LanguageDropdown from "../../components/language/LanguageDropdown";
import LoadingSpinner from "../../../../LoadingSpinner";
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    cursorPointer: {
        cursor: 'pointer',
        color: 'silver',
        display: 'flex',
        justifyContent: 'center',
    },
    heading: {
        marginLeft: 16,
        fontWeight: 'bold',
        marginTop: 16
    },
    activeTab: {
        backgroundColor: 'white',
        color: 'silver',
        borderRadius: 10,
        marginTop: 4,
    },
    defaultTab: {
        backgroundColor: 'silver',
        color: 'gray',
        borderRadius: 10,
        marginTop: 4,
    },
    icon: {
        height: 20,
        width: 20
    },
    disable: {
        pointerEvents: "none",
        opacity: 0.5
    },
    qaList: {
        cursor: "pointer",
        "& .hiddenButton": {
            display: "none"
        },
        "&:hover .hiddenButton": {
            display: "inline"
        }
    }
}));

const defaultProps = {
    bgcolor: 'background.paper',
    border: 1,
    borderColor: 'silver',
}

const questionBox = {
    bgcolor: COLORS.backButton,
    m: 2,
    border: 2,
    borderColor: 'gray',
    borderRadius: 5,
}

const answerBox = {
    bgcolor: COLORS.backButton,
    m: 2,
    border: 2,
    borderColor: 'gray',
    borderRadius: 5,
    height: 100,
    overflow: 'auto'
}

const a11yProps = (index) => {
    return {
        id: `${index}`,
        'aria-controls': `${index}`,
    };
}

const FAQDesign = (props) => {

    const { state, pushToState, updateState, setToState } = props;
    //local states
    const [localState, setLocalState] = useState({
        isLoaded: false,
        qa: null,
        isAlert: false,
        dialogType: '',
        isDialogOpen: false,
        alertDialogType: '',
        questionIndex: null,
        categoryIndex: null,
        editValue: null,
        langID: 0,
        isDisable: false
    });

    const classes = useStyles();
    const router = useRouter();
    const companyId = router.query.companyID;
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    const {
        isLoaded,
        qa,
        isAlert,
        dialogType,
        isDialogOpen,
        alertDialogType,
        questionIndex,
        categoryIndex,
        editValue,
        langID,
        isDisable
    } = localState;

    useEffect(() => {
        if (router.query.filegid) {
            setLocalState((prevState) => ({ ...prevState, isLoaded: false }));
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token: authToken,
                params: {
                    hotelrefno: Number(companyId),
                    query: `gid:${router.query.filegid}`
                },
            }).then(res => {
                if (res && res.status === 200 && res.data) {
                    if (res.data.data && res.data.data.length > 0) {
                        updateState('pageBuilder', 'faq', JSON.parse(Buffer.from(res.data.data[0].filedata, 'base64').toString('utf-8')));
                        updateState('pageBuilder', 'faqActiveTab', 'cat-0');
                        updateState('pageBuilder', 'langId', res.data.data[0].langid);
                        updateState('pageBuilder', 'langCode', res.data.data[0].langcode);
                        updateState('pageBuilder', 'langDesc', res.data.data[0].langdesc);
                        setLocalState((prevState) => ({ ...prevState, langID: res.data.data[0].langid, isLoaded: true }));
                    } else {
                        setLocalState((prevState) => ({ ...prevState, isDisable: true, isLoaded: true }));
                        toast.error(DATA_EMPTY, {
                            position: toast.POSITION.TOP_RIGHT,
                        });
                    }
                } else {
                    const retErr = isErrorMsg(res);
                    setLocalState((prevState) => ({ ...prevState, isDisable: true, isLoaded: true }));
                    toast.error(retErr.errorMsg, {
                        position: toast.POSITION.TOP_RIGHT,
                    });
                }
            })
        } else {
            setLocalState((prevState) => ({ ...prevState, langID: router.query.langId, isLoaded: true }));
            if (state.faq.length === 0) {
                const category = {
                    id: 'cat-0',
                    type: 'category',
                    text: 'New Category',
                    items: []
                }
                pushToState('pageBuilder', ['faq'], [category]);
                updateState('pageBuilder', 'faqActiveTab', 'cat-0');
            }
        }
    }, []);

    useEffect(() => {
        let updatedQA = [];
        if (state.faqActiveTab !== 'add') {
            updatedQA = state.faq.find(x => x.id === state.faqActiveTab);
            updatedQA && updatedQA.items && setLocalState((prevState) => ({ ...prevState, qa: updatedQA.items }));
        }
    }, [state.faq, state.faqActiveTab]);

    const handleTabChange = (event, newValue) => {
        if (newValue === 'add') {
            handleOpenDialog('add-category');
        } else {
            updateState('pageBuilder', 'faqActiveTab', newValue);
        }
    }

    const resetDialog = () => {
        setLocalState((prevState) => ({ ...prevState, dialogType: '', isDialogOpen: false }));
    }

    const handleAddCategory = (category) => {
        pushToState('pageBuilder', ['faq'], [category]);
        updateState('pageBuilder', 'faqActiveTab', category.id);
    }

    const handleEditCategory = (category) => {
        setToState('pageBuilder', ['faq', categoryIndex], category);
    }

    const handleDeleteCategory = () => {
        const updatedFAQ = [...state.faq];
        updatedFAQ.splice(categoryIndex, 1);
        Promise.all(updatedFAQ.map((faq, index) => {
            faq.id = `cat-${index}`
        }));
        updateState('pageBuilder', 'faq', updatedFAQ);
        toast.success(DELETE_SUCCESS, {
            position: toast.POSITION.TOP_RIGHT,
        })
        if (updatedFAQ.length > 0) {
            updateState('pageBuilder', 'faqActiveTab', updatedFAQ[updatedFAQ.length - 1].id);
        } else {
            updateState('pageBuilder', 'faqActiveTab', 'add');
            setLocalState((prevState) => ({ ...prevState, qa: null }));
        }
    }

    const handleAddQA = (qa) => {
        const updatedFAQ = [...state.faq];
        const index = updatedFAQ.indexOf(updatedFAQ.find(x => x.id === state.faqActiveTab));
        if (index !== -1) {
            updatedFAQ[index].items.push(qa);
            updateState('pageBuilder', 'faq', updatedFAQ);
        }
    }

    const handleEditQA = (qa) => {
        const updatedFAQ = [...state.faq];
        const index = updatedFAQ.indexOf(updatedFAQ.find(x => x.id === state.faqActiveTab));
        if (index !== -1 && questionIndex !== null) {
            setToState('pageBuilder', ['faq', index, 'items', questionIndex], qa);
        }
    }

    const handleDeleteQA = () => {
        const updatedFAQ = [...state.faq];
        const index = updatedFAQ.indexOf(updatedFAQ.find(x => x.id === state.faqActiveTab));
        if (index !== -1) {
            updatedFAQ[index].items.splice(questionIndex, 1);
            Promise.all(updatedFAQ[index].items.map((question, index) => {
                question.id = `question-${index}`
            }));
            updateState('pageBuilder', 'faq', updatedFAQ);
            toast.success(DELETE_SUCCESS, {
                position: toast.POSITION.TOP_RIGHT,
            })
        }
    }

    const handleOpenDialog = (type) => {
        setLocalState((prevState) => ({ ...prevState, dialogType: type, isDialogOpen: true }));
    }

    const handleDelete = (type, isDelete) => {
        if (isDelete) {
            if (type === 'qa') handleDeleteQA();
            if (type === 'cat') handleDeleteCategory();
        }
        setLocalState((prevState) => ({ ...prevState, isAlert: false }));
    }

    const handleLanguageChange = (lang) => {
        updateState('pageBuilder', 'langCode', lang.code);
        updateState('pageBuilder', 'langId', lang.id);
        updateState('pageBuilder', 'langDesc', lang.description);
    }

    return (
        <Container className={clsx(classes.root, {[classes.disable]: isDisable })}>
            {
                !isLoaded ? <LoadingSpinner /> : <Typography component={'div'}>
                    <LanguageDropdown handleChange={handleLanguageChange} langID={langID} />
                    <AppBar position="static">
                        <Tabs
                            value={state.faqActiveTab}
                            onChange={handleTabChange}
                            aria-label="wrapped label tabs example"
                            variant="scrollable"
                            TabIndicatorProps={{style: {display: 'none'}}}
                        >
                            {
                                state.faq && state.faq.length > 0 && state.faq.map((value, index) => {
                                    return (
                                        <Tab
                                            className={state.faqActiveTab === value.id ? classes.activeTab : classes.defaultTab}
                                            style={{marginLeft: index === 0 ? 0 : 4}}
                                            value={value.id}
                                            label={<Container key={value.id}>
                                                <Grid container justify={'center'}>
                                                    <Grid item>
                                                        <EditIcon
                                                            className={classes.icon}
                                                            onClick={() => {
                                                                setLocalState((prevState) => ({ ...prevState, categoryIndex: index, editValue: value }));
                                                                handleOpenDialog('edit-category');
                                                            }} />
                                                        <DeleteIcon
                                                            className={clsx(classes.icon, {[classes.disable]: state.faq.length === 1})}
                                                            onClick={() => {
                                                                setLocalState((prevState) => ({ ...prevState, isAlert: true, alertDialogType: 'cat', categoryIndex: index  }));
                                                            }} />
                                                    </Grid>
                                                </Grid>
                                                <Grid container justify={'center'} style={{marginTop: 8}} ><Grid item>{value.text}</Grid></Grid>
                                            </Container>}
                                            wrapped
                                            {...a11yProps(value.id)}
                                            key={index}

                                        />
                                    )
                                })
                            }
                            <Tab
                                value={'add'}
                                label={<Container><Grid container><Grid item><ControlPointIcon style={{height: 20, width: 20}} /> Add </Grid></Grid></Container>}
                                aria-label="add"
                            />
                        </Tabs>
                    </AppBar>
                    <Box {...defaultProps} >
                        <Typography component={'div'} style={{height: 800, overflow: 'auto'}} >
                            {
                                qa && qa.length > 0 && qa.map((value, i) => {
                                    return (
                                        <Typography component={'div'} key={`qa-${i}`} className={classes.qaList}>
                                            <Typography component={'div'}>
                                                <Grid container>
                                                    <Grid item xs={6}>
                                                        <Typography component={'h6'} variant={'h6'} className={classes.heading} >
                                                            Question {i + 1}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography component={'div'} style={{float: 'right'}} className={'hiddenButton'}>
                                                            <IconButton
                                                                aria-label="Edit QA"
                                                                color="primary"
                                                                onClick={() => {
                                                                    handleOpenDialog('edit-qa');
                                                                    setLocalState((prevState) => ({ ...prevState, questionIndex: i, editValue: value }));
                                                                }}
                                                            >
                                                                <EditIcon  color={'primary'} />
                                                            </IconButton>
                                                            <IconButton
                                                                aria-label="Edit QA"
                                                                color="primary"
                                                                onClick={() => {
                                                                    setLocalState((prevState) => ({ ...prevState, isAlert: true, alertDialogType: 'qa', questionIndex: i }));
                                                                }}
                                                            >
                                                                <DeleteIcon className={'hiddenButton'} color={'primary'} />
                                                            </IconButton>
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                                <Grid container>
                                                    <Grid item xs={12}>
                                                        <Box {...questionBox}>
                                                            <div dangerouslySetInnerHTML={{__html: value.text}} ></div>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                                <Typography component={'h6'} variant={'h6'} className={classes.heading} >
                                                    Answer
                                                </Typography>
                                                <Grid container>
                                                    <Grid item xs={12}>
                                                        <Box {...answerBox} >
                                                            <div dangerouslySetInnerHTML={{__html: value.items[0].text}} ></div>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                                <Divider style={{marginTop: 8}}  />
                                            </Typography>
                                        </Typography>
                                    )
                                })
                            }
                            {
                                qa &&
                                <>
                                    <Typography component={'h5'} variant={'h5'}
                                                onClick={() => handleOpenDialog('add-qa')}
                                                className={classes.cursorPointer}
                                    >
                                        Click to add Q&A
                                    </Typography>
                                    <Divider style={{marginTop: 8}}/>
                                </>
                            }
                        </Typography>
                    </Box>
                </Typography>
            }
            {
                isDialogOpen && <FAQ_Dialog
                    resetDialog={resetDialog}
                    type={dialogType}
                    onAddCategory={handleAddCategory}
                    onAddQA={handleAddQA}
                    onEditQA={handleEditQA}
                    onEditCategory={handleEditCategory}
                    state={editValue}
                />
            }
            {
                isAlert && <AlertDialog alertDialogType={alertDialogType} handleDelete={handleDelete}  />
            }
        </Container>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    pushToState: (stateType, stateName, value) => dispatch(pushToState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(FAQDesign);