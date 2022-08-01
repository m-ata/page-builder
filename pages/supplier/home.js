import React, {useContext, useEffect, useState} from 'react'
import UserPortalWrapper from '../../components/user-portal/UserPortalWrapper'
import useTranslation from '../../lib/translations/hooks/useTranslation'
import WebCmsGlobal from '../../components/webcms-global'
import {useSnackbar} from 'notistack'
import {connect, useSelector} from 'react-redux'
import {setToState, updateState} from '../../state/actions'
import {useOrestAction} from "../../model/orest";
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import SendIcon from '@material-ui/icons/Send';
import {
    Box,
    Button,
    Container,
    FormControl,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem, OutlinedInput,
    TextareaAutosize
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import ListIcon from "@material-ui/icons/List";
import ReplyIcon from "@material-ui/icons/Reply";
import renderFormElements, {ELEMENT_TYPES} from "../../components/render-form-elements";
import {required} from "../../state/utils/form";
import moment from "moment";
import {isErrorMsg, mobileTelNoFormat, OREST_ENDPOINT, REQUEST_METHOD_CONST} from "../../model/orest/constants";
import {SLASH} from "../../model/globals";
import {Insert, Patch, ViewList, UseOrest, Delete} from "@webcms/orest";
import CachedIcon from "@material-ui/icons/Cached";
import EditIcon from "@material-ui/icons/Edit";
import CheckIcon from "@material-ui/icons/Check";
import {ClearAll, DoubleArrow} from "@material-ui/icons";
import TagsIcon from "@material-ui/icons/LocalOffer";
import ClearIcon from "@material-ui/icons/Clear";

const useStyles = makeStyles(theme => ({
    table: {
        minWidth: 650,
    },
    textFieldStyle: {
        width: "308px",
        backgroundColor: "#FFF",
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                border: "none",
            },
            "&:hover fieldset": {
                border: "1px solid #4666B0",
            },
            "&.Mui-focused fieldset": {
                border: "1px solid #4666B0",
            },
        },
    },
    chatSection: {
        width: '100%',
        height: '100%'
    },
    headBG: {
        backgroundColor: '#e0e0e0'
    },
    borderRight500: {
        borderRight: '1px solid #e0e0e0'
    },
    messageArea: {
        overflowY: 'auto',
    },
    inboxListScroll: {
        height: '65vh',
        overflowY: 'auto'
    },
    mainTitle: {
        fontSize: "48px",
        fontWeight: "600"
    },
    actionDiv: {
        paddingBottom: "20px",
        display: "flex",
        [theme.breakpoints.down("sm")]: {
            display: "grid",
        },
    },
    buttonDiv: {
        paddingRight: "16px",
        [theme.breakpoints.down('sm')]: {
            paddingBottom: "8px"
        },
    },
    subTextRefresh: {
        fontSize: "16px",
        fontWeight: "500",
        color: "#F16A4B",
        textTransform: "capitalize",
        [theme.breakpoints.down("md")]: {
            paddingLeft: "0"
        },
    },
    iconStyle: {
        width: "1.5em",
        height: "1.5em"
    },

    textOutlinedColor: {
        '&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
        }
    },
}));

function HomePage(props) {
    const classes = useStyles();

    const {t} = useTranslation()
    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);

    const {state, setToState} = props;

    const {enqueueSnackbar} = useSnackbar();

    //redux
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo);
    const token = useSelector((state) => state?.orest?.currentUser?.auth.access_token || false);
    const hotelRefNo = useSelector(state => state?.hotelinfo?.currentHotelRefNo || GENERAL_SETTINGS.HOTELREFNO || null);

    //locale state
    const initialState = {
        text: {value: null, isError: false, required: true, helperText: ''},
    }

    //orest state
    const {setOrestState} = useOrestAction()
    const [searchText, setSearchText] = useState("");
    const [reply, setReply] = useState(false)
    const [inboxData, setInboxData] = useState(initialState)
    const [isSaving, setIsSaving] = useState(false)
    const [inboxList, setInboxList] = useState([])
    const [selectedNote, setSelectedNote] = useState(false)
    const [replyTextContent, setReplyTextContent] = useState('')
    const [listEdit, setListEdit] = useState([])
    const [dataExist, setDataExist] = useState(false)
    const [replyAnswer, setReplyAnswer] = useState(false)
    const [replyNoteId, setReplyNoteId] = useState('')

    const VARIANT = 'outlined'

    const formElement = [
        {
            type: ELEMENT_TYPES.textField,
            id: 'text',
            name: 'text',
            value: inboxData.text?.value,
            error: inboxData.text?.isError,
            required: inboxData.text?.isRequired,
            disabled: isSaving,
            helperText: inboxData.text?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            multiLine: true,
            rows: 6,
            rowsMax: 6,
            gridProps: {xs: 12}
        }
    ]

    const formElements = [
        {
            type: ELEMENT_TYPES.textField,
            id: 'text',
            name: 'text',
            value: replyTextContent,
            error: inboxData.text?.isError,
            required: inboxData.text?.isRequired,
            disabled: isSaving,
            helperText: inboxData.text?.helperText,
            onChange: (e) => handleOnChangeFormElements(e),
            onBlur: (e) => handleOnBlurFormElements(e),
            variant: VARIANT,
            fullWidth: true,
            multiLine: true,
            rows: 6,
            rowsMax: 6,
            gridProps: {xs: 12}
        }
    ]

    useEffect(() => {
        getInboxList()
    }, [])

    const handleOnBlurFormElements = (event, key) => {
        handleOnChangeFormElements(event, key, true)
    }

    const handleOnChangeFormElements = (event, key, isOnBlur) => {
        const name = key ? key : event.target.name
        const value = event?.target ? event.target.value : event

        if (isOnBlur) {
            setInboxData({
                ...inboxData,
                [name]: {
                    ...inboxData[name],
                    isError: inboxData[name]?.isRequired && !!required(value),
                    helperText: inboxData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        } else {
            setInboxData({
                ...inboxData,
                [name]: {
                    ...inboxData[name],
                    value: value,
                    isError: inboxData[name]?.isRequired && !!required(value),
                    helperText: inboxData[name]?.isRequired && !!required(value) && t('str_mandatory'),
                }
            })
        }
    }

    const insertText = (gid, res) => {
        const data = {...inboxData}
        Object.keys(initialState).map((key) => {
            data[key] = typeof data[key].value === 'object' ? data[key].value ? data[key].value.id : null : data[key].value
        })
        updateNote(gid, res, data.text)
    }

    const getInboxList = () => {
        setSelectedNote(false)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.USERINBOX + SLASH + OREST_ENDPOINT.LIST,
            token,
            params: {
                mention: true,
                limit: 100,
                allhotels: true
            }
        }).then(res => {
            if (searchText.length > 0) {
                UseOrest({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.USERINBOX + SLASH + OREST_ENDPOINT.LIST,
                    token,
                    params: {
                        mention: true,
                        masterusercode: searchText
                    }
                }).then(res => {
                    if (res.status === 200) {
                        setInboxList(res.data.data)
                    } else {
                        const error = isErrorMsg(res)
                        enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
                    }
                })
            }
            if (res.status === 200) {
                setInboxList(res.data.data)
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
        })
    }

    const addNote = (mid) => {
        setReply(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE,
            token,
            params: {
                query: 'mid:' + mid + ',isdone:false',
                allhotels: true,
                limit: 100
            }
        }).then(res => {
            if (res.status === 200) {
                setReplyNoteId(res.data.data[0].id)
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
        })
    }

    const replyNote = (id) => {
        UseOrest({
            method: 'POST',
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE + SLASH + OREST_ENDPOINT.REPLY,
            token,
            params: {
                allhotels: true,
                id: id
            }
        }).then(res => {
            UseOrest({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RANOTE + SLASH + OREST_ENDPOINT.LIST,
                token,
                params: {
                    query: "id:" + res.data.data[0].res,
                    allhotels: true,
                }
            }).then(res => {
                if (res.status === 200) {
                    insertText(res.data.data[0].gid, res.data.data[0])
                } else {
                    const error = isErrorMsg(res)
                    enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
                }
            })
        })
    }

    const updateNote = (gid, res, note) => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE + SLASH + OREST_ENDPOINT.UPD + SLASH + OREST_ENDPOINT.GID,
            method: 'PUT',
            token,
            params: {
                hotelrefno: hotelRefNo
            },
            data:
                {
                    "masterid": res.masterid,
                    "pid": res.pid,
                    "note": note,
                    "id": res.id,
                    "gid": gid,
                    "refcode": res.refcode,
                }
        }).then(res => {
            if (res.status === 200) {
                enqueueSnackbar('successfully saved', {variant: 'success'})
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
            getInboxList()
        })
    }

    const replyText = (masterid, userid) => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.RANOTE,
            token,
            params: {
                query: 'masterid:' + masterid + ',isdone:false,treelevel:1,' + 'empid:' + userid,
                limit: 20
            }
        }).then(res => {
            const length = res.data.data.length
            if (res.status === 200) {
                if (length <= 0) {
                    setReply(false)
                    setDataExist(false)
                    setReplyAnswer(true)
                    setReplyTextContent('')
                } else {
                    setReplyTextContent(res.data.data[length - 1].note)
                    setDataExist(true)
                    setReply(true)
                    setReplyAnswer(false)
                    setListEdit(res.data.data[length - 1])
                }
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
        })
    }

    const setNoteData = (data) => {
        replyText(data?.masterrefmid, data?.empid)
        setSelectedNote(data)
    }

    function stringAvatar(name) {
        return {
            children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}${name.split(' ')[1][1]}`,
        };
    }

    const clearNote = (res) => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.USERINBOX + SLASH + OREST_ENDPOINT.LIST + SLASH + OREST_ENDPOINT.CLEAR,
            method: 'PUT',
            token,
            params: {
                hotelrefno: hotelRefNo
            },
            data:
                [{
                    "hotelrefno": res.hotelrefno,
                    "masterid": res.masterid,
                    "userid": res.empid,
                }]
        }).then(res => {
            if (res.status === 200) {
                enqueueSnackbar('successfully cleared', {variant: 'success'})
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
            getInboxList()
        })
    }

    const clearAllNote = (res) => {
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.USERINBOX + SLASH + OREST_ENDPOINT.CLEAR,
            method: 'PUT',
            token,
            params: {
                userid: res[0].empid,
                hotelrefno: hotelRefNo
            },
            data: {}
        }).then(res => {
            if (res.status === 200) {
                enqueueSnackbar('successfully all cleared', {variant: 'success'})
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
            getInboxClearList()
        })
    }

    const getInboxClearList = () => {
        setSelectedNote(false)
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.USERINBOX + SLASH + OREST_ENDPOINT.LIST,
            token,
            params: {
                mention: true,
                limit: 100,
                allhotels: true
            }
        }).then(res => {
            if (res.status === 200) {
                setInboxList(res.data.data)
            } else {
                const error = isErrorMsg(res)
                enqueueSnackbar(error.errorMsg?.length > 50 ? error.errorMsg?.substring(0, 50) : error.errorMsg, {variant: 'error'})
            }
        })
    }

    return (
        <UserPortalWrapper isSupplierPortal>
            <div>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography className={classes.mainTitle}>{t("str_inbox")}</Typography>
                    </Grid>
                </Grid>
                <Grid container component={Paper} className={classes.chatSection}>
                    <Grid item xs={3} className={classes.borderRight500}>
                        <Grid container style={{padding: '12px 0 12px 0'}}>
                            <Grid item xs={1}/>
                            <Grid>
                                <div className={classes.buttonDiv}>
                                    <Button variant="outlined"
                                            className={classes.subTextRefresh}
                                            startIcon={<CachedIcon className={classes.iconStyle}/>}
                                            onClick={getInboxList}
                                    >
                                        {t("str_refresh")}
                                    </Button>
                                </div>
                            </Grid>
                            <Grid>
                                <div className={classes.buttonDiv}>
                                    <Button variant="outlined"
                                            className={classes.subTextRefresh}
                                            startIcon={<ClearAll className={classes.iconStyle}/>}
                                            onClick={() => clearAllNote(inboxList)}
                                    >
                                        {t("str_clearInbox")}
                                    </Button>
                                </div>
                            </Grid>
                        </Grid>
                        <Divider/>
                        <Grid item xs={10} style={{padding: '10px'}}>
                            <TextField
                                onChange={(e) => setSearchText(e.target.value)}
                                className={classes.textFieldStyle}
                                variant="outlined"
                                placeholder={t("str_searchTransactionsInvoicesOrHelp")}
                                InputProps={{
                                    startAdornment:
                                        <InputAdornment position="start">
                                            <SearchIcon style={{color: "#4666B0"}} onClick={() => getInboxList()}/>
                                        </InputAdornment>,
                                }}
                                value={searchText}
                            />
                        </Grid>
                        <Divider/>
                        <List className={classes.inboxListScroll}>
                            {inboxList.length > 0 && inboxList.map((item) => (
                                <React.Fragment>
                                    <ListItem onClick={() => setNoteData(item)}>
                                        <Grid container>
                                            <Grid item xs={2}>
                                                <ListItemIcon>
                                                    <Avatar style={{
                                                        fontSize: 16,
                                                        color: "white",
                                                        backgroundColor: '#076cb0'
                                                    }} {...stringAvatar(item?.username)} />
                                                </ListItemIcon>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Box component="form" noValidate autoComplete="off">
                                                    <FormControl style={{width: "105%"}}>
                                                        <OutlinedInput className={classes.textOutlinedColor}
                                                                       placeholder={item?.masterdesc}/>
                                                    </FormControl>
                                                </Box>
                                                <Grid container style={{padding: '12px 0 12px 0'}}>
                                                    <Grid item xs={4}>
                                                        <Typography style={{
                                                            fontSize: 15,
                                                        }}>{moment(item?.masterdate).format('L')} </Typography>
                                                    </Grid>
                                                    <Grid item xs={4}>
                                                        <Typography
                                                            style={{fontSize: 15}}>{moment(item?.mastertime, 'HH:mm:ss').format('LT')}</Typography>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <Typography
                                                            style={{fontSize: 15}}>{item?.mastertype}</Typography>
                                                    </Grid>
                                                </Grid>
                                                <Grid container>
                                                    <Grid item xs={6}/>
                                                    <Grid item xs={4}>
                                                        <div className={classes.buttonDiv}>
                                                            <Button
                                                                variant="outlined"
                                                                className={classes.subTextRefresh}
                                                                startIcon={<ClearIcon className={classes.iconStyle}/>}
                                                                onClick={() => clearNote(item)}
                                                            >
                                                                {t("str_clear")}
                                                            </Button>
                                                        </div>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    <Divider/>
                                </React.Fragment>
                            ))
                            }
                        </List>
                    </Grid>
                    {selectedNote ? (
                        <Grid item xs={9}>
                            <List style={{ paddingBottom: 10}}>
                                <ListItem>
                                    <ListItemText primary={selectedNote?.masterusername}></ListItemText>
                                </ListItem>
                                <Divider/>
                                <ListItem style={{maxHeight: '35vh', overflowY: 'auto'}}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Typography>{selectedNote?.masternote}</Typography>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                            </List>
                            <Grid container style={{height: 80}}>
                                <Grid item xs={8}/>
                                <Grid item xs={2}>
                                    <Button
                                        onClick={getInboxList}
                                        variant="outlined"
                                        startIcon={<ListIcon/>}>
                                        Go to Request
                                    </Button>
                                </Grid>
                                <Grid item xs={2}>
                                    <Button
                                        variant="contained"
                                        endIcon={<SendIcon/>}
                                        onClick={() => addNote(selectedNote?.masterid)}>
                                        <Typography
                                            style={{fontSize: 15, paddingLeft: '8px'}}>{t('str_reply')}</Typography>
                                    </Button>
                                </Grid>
                            </Grid>
                            <Divider style={{padding: 10, backgroundColor: "white"}}/>
                            <Divider/>
                            {
                                reply ?
                                    (
                                        <Grid>
                                            <List style={{maxHeight: '46vh'}}>
                                                <ListItem>
                                                    <ReplyIcon style={{paddingRight: 10, fontSize: 40}}/>
                                                    <ListItemText primary={loginfo.description}></ListItemText>
                                                </ListItem>
                                                <Divider/>
                                                {replyAnswer ?
                                                    <ListItem className={classes.messageArea}>
                                                        <Grid container>
                                                            <Grid item xs={12}>
                                                                {
                                                                    formElement.map((item, index) => (
                                                                        <Grid key={index} item {...item.gridProps}>
                                                                            {renderFormElements(item)}
                                                                        </Grid>
                                                                    ))
                                                                }
                                                            </Grid>
                                                        </Grid>
                                                    </ListItem>
                                                    :
                                                    <ListItem className={classes.messageArea}>
                                                        <Grid container>
                                                            <Grid item xs={12}>
                                                                {
                                                                    formElements.map((item, index) => (
                                                                        <Grid key={index} item {...item.gridProps}>
                                                                            {renderFormElements(item)}
                                                                        </Grid>
                                                                    ))
                                                                }
                                                            </Grid>
                                                        </Grid>
                                                    </ListItem>
                                                }
                                            </List>
                                            <Grid container>
                                                <Grid item xs={9}/>
                                                <Grid item xs={1}>
                                                    <Button
                                                        onClick={() => setReplyAnswer(true)}
                                                        variant="outlined"
                                                        startIcon={<EditIcon/>}>
                                                        Edit
                                                    </Button>
                                                </Grid>
                                                <Grid item xs={2}>
                                                    {dataExist ?
                                                        <Button
                                                            variant="contained"
                                                            endIcon={<SendIcon/>}
                                                            onClick={() => updateNote(listEdit.gid, listEdit, inboxData.text?.value)}>
                                                            <Typography style={{
                                                                fontSize: 15,
                                                                paddingLeft: '8px'
                                                            }}>{t('str_send')}</Typography>
                                                        </Button>
                                                        :
                                                        <Button
                                                            variant="contained"
                                                            endIcon={<SendIcon/>}
                                                            onClick={() => replyNote(replyNoteId)}>
                                                            <Typography style={{
                                                                fontSize: 15,
                                                                paddingLeft: '8px'
                                                            }}>{t('str_send')}</Typography>
                                                        </Button>
                                                    }
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    ) : null
                            }
                        </Grid>
                    ) : null}
                </Grid>
            </div>
        </UserPortalWrapper>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.supplierPortal,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HomePage)