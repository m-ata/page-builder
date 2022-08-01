import React, {useState, useEffect, useContext} from 'react';
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import ReCaptcha from "react-google-recaptcha";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import {UseOrest, Insert} from "@webcms/orest";
import {OREST_ENDPOINT} from "../../../../../../../model/orest/constants";
import WebCmsGlobal from "../../../../../../webcms-global";
import {useRouter} from "next/router";
import {makeStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { toast } from 'react-toastify'
import {SAVED_SUCCESS} from "../../../../constants";
import validator from "validator";
import { connect, useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
        float: "right",
    },
    textArea: {
        width: '100%',
        borderColor: 'silver',
        borderRadius: 5
    }
}));

const ContactForm = (props) => {

    const {formData, state, otherLangFormData} = props;
    const [accTypes, setAccTypes] = useState([]);
    const [accType, setAccType] = useState('');
    const [groupID, setGroupID] = useState('');
    const [pbookData, setPbookData] = useState({
        refcode: '',
        firstname: '',
        lastname: '',
        workemail: '',
        mobiletel: '',
    });
    const [salesnote, setSalesNote] = useState('');
    const [receiverEmail, setReceiverEmail] = useState('');
    const [hasRecaptcha, setHasRecaptcha] = useState(false);
    const [recaptchaValue, setRecaptchaValue] = useState('');

    const classes = useStyles();
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const router = useRouter();
    const clientToken = useSelector((state) => state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : router.query.authToken)
    const companyId = router.query.companyID || GENERAL_SETTINGS.HOTELREFNO;
    const authToken = token || clientToken || router.query.authToken;

    useEffect(() => {
        // getting languages from service
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.TRANSTYPE + OREST_ENDPOINT.SLASH + OREST_ENDPOINT.ACCTYPE,
            token: authToken,
            method: 'get',
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200 && res.data && res.data.data.length > 0) {
                const updatedPbookData = {...pbookData};
                setAccTypes(res.data.data);
                setAccType(res.data.data[0].code.toLowerCase());
                updatedPbookData['refcode'] = res.data.data[0].code.toLowerCase();
                setPbookData(updatedPbookData);
            }
        })
        // getting groupid from service
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'clientgr/web',
            token: authToken,
            method: 'get',
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200 && res.data && res.data.data) {
                setGroupID(res.data.data.res);
            }
        })
        //getting receiver email
        UseOrest({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: 'hotel/lic/contact',
            token: authToken,
            method: 'get',
            params: {
                hotelrefno: Number(companyId),
            },
        }).then((res) => {
            if (res.status === 200 && res.data && res.data.data) {
                setReceiverEmail(res.data.data.contactemail);
            }
        })
    }, []);

    useEffect(() => {
        if (formData && formData.gid && formData.gid.length > 0) {
            formData.gid.map(d => {
                d.type === 'recaptcha' && d.isActive && setHasRecaptcha(true);
            })
        }
    }, [formData]);

    // const handleSave = () => {
    //     Insert({
    //         // insert web page json to rafile
    //         apiUrl: GENERAL_SETTINGS.OREST_URL,
    //         endpoint: OREST_ENDPOINT.PBOOK,
    //         token: authToken,
    //         data: {
    //             refcode: pbookData.refcode,
    //             firstname: pbookData.firstname,
    //             lastname: pbookData.lastname,
    //             workemail: pbookData.workemail,
    //             mobiletel: pbookData.mobiletel,
    //             groupid: groupID,
    //         },
    //     }).then(res => {
    //         if (res.status === 200 && res.data && res.data.data) {
    //             Insert({
    //                 // insert web page json to rafile
    //                 apiUrl: GENERAL_SETTINGS.OREST_URL,
    //                 endpoint: OREST_ENDPOINT.SALECALL,
    //                 token: authToken,
    //                 data: {
    //                     agencyid: res.data.data.id,
    //                     salesnote: salesnote,
    //                 },
    //             }).then(res1 => {
    //                 if (res1.status === 200 && res1.data && res1.data.data) {
    //                     toast.success(SAVED_SUCCESS, {
    //                         position: toast.POSITION.TOP_RIGHT,
    //                     });
    //                 }
    //             })
    //         }
    //     })
    // }

    const handleChangeText = (key, value) => {
        const updatedPbookData = {...pbookData};
        updatedPbookData[key] = value;
        setPbookData(updatedPbookData);
    }

    const onVerifyRecaptcha = (value) => {
        setRecaptchaValue(value);
    }

    return(
        <React.Fragment>
            {
                state.langCode !== state.defaultLang && otherLangFormData &&
                otherLangFormData.length > 0 &&
                otherLangFormData.map((d, i) => {
                    return(
                        formData.gid[i].isActive ? <Grid container key={i} style={{marginTop: i === 1 ? 24 : 8}}>
                            <Grid item xs={12}>
                                <Grid container>
                                    {
                                        formData.gid[i].type === 'heading' && <Grid item xs={12}>
                                            <Typography component={'h5'} variant={'h5'} style={{fontWeight: "bold"}}>
                                                {
                                                    d.label
                                                }
                                            </Typography>
                                        </Grid>
                                    }
                                    <Grid item xs={4}>
                                        {
                                            formData.gid[i].type !== 'heading' && <Typography style={{width: '100%'}} component={'span'}>
                                                {
                                                    d.label
                                                }
                                            </Typography>
                                        }
                                    </Grid>
                                    <Grid item xs={8}>
                                        {
                                            formData.gid[i].type === 'refcode' && <FormControl
                                                variant="outlined"
                                                fullWidth
                                                size={'small'}
                                            >
                                                <Select
                                                    value={accType}
                                                    onChange={(e) => {
                                                        const updatedPbookData = {...pbookData};
                                                        pbookData['refcode'] = e.target.value;
                                                        setAccType(e.target.value);
                                                        setPbookData(updatedPbookData);
                                                    }}
                                                >
                                                    {accTypes.map((type, index) => {
                                                        return (
                                                            <MenuItem value={type.code.toLowerCase()} key={index}>
                                                                {' '}
                                                                {type.description}{' '}
                                                            </MenuItem>
                                                        )
                                                    })}
                                                </Select>
                                            </FormControl>
                                        }
                                        {
                                            (formData.gid[i].type === 'company' ||
                                                formData.gid[i].type === 'firstname' ||
                                                formData.gid[i].type === 'lastname') &&
                                            <TextField
                                                variant={'outlined'}
                                                size={'small'}
                                                fullWidth
                                                onChange={(e) => handleChangeText(d.type, e.target.value)}
                                            />
                                        }
                                        {
                                            formData.gid[i].type === 'mobiletel' &&
                                            <TextField
                                                variant={'outlined'}
                                                size={'small'}
                                                fullWidth
                                                onChange={(e) => handleChangeText(d.type, e.target.value)}
                                                error={(pbookData.mobiletel && validator.isMobilePhone(pbookData.mobiletel) === false) ? true : false}
                                            />
                                        }
                                        {
                                            formData.gid[i].type === 'workemail' &&
                                            <TextField
                                                variant={'outlined'}
                                                size={'small'}
                                                fullWidth
                                                onChange={(e) => handleChangeText(d.type, e.target.value)}
                                                error={(pbookData.workemail && validator.isEmail(pbookData.workemail) === false) ? true : false}
                                            />
                                        }
                                        {
                                            formData.gid[i].type === 'recaptcha' &&
                                            <ReCaptcha sitekey={GENERAL_SETTINGS.RECAPTCHA_SITE_KEY} onChange={onVerifyRecaptcha} />
                                        }
                                        {
                                            formData.gid[i].type === 'salesnote' &&
                                            <TextareaAutosize
                                                rows={4}
                                                className={classes.textArea}
                                                value={salesnote}
                                                onChange={(e) => setSalesNote(e.target.value)}
                                            />
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid> : null
                    )
                })
            }
            {
                state.langCode === state.defaultLang && formData && formData.gid &&
                formData.gid.length > 0 &&
                formData.gid.map((d, i) => {
                    return(
                        d.isActive ? <Grid container key={i} style={{marginTop: i === 1 ? 24 : (i !== 0 && 8)}}>
                            <Grid item xs={12}>
                                <Grid container>
                                    {
                                        d.type === 'heading' && <Grid item xs={12}>
                                            <Typography component={'h5'} variant={'h5'} style={{fontWeight: "bold"}}>
                                                {
                                                    d.label
                                                }
                                            </Typography>
                                        </Grid>
                                    }
                                    <Grid item xs={4}>
                                        {
                                            d.type !== 'heading' && <Typography style={{width: '100%'}} component={'span'}>
                                                {
                                                    d.label
                                                }
                                            </Typography>
                                        }
                                    </Grid>
                                    <Grid item xs={8}>
                                        {
                                            d.type === 'refcode' && <FormControl
                                                variant="outlined"
                                                fullWidth
                                                size={'small'}
                                            >
                                                <Select
                                                    value={accType}
                                                    onChange={(e) => {
                                                        const updatedPbookData = {...pbookData};
                                                        pbookData['refcode'] = e.target.value;
                                                        setAccType(e.target.value);
                                                        setPbookData(updatedPbookData);
                                                    }}
                                                >
                                                    {accTypes.map((type, index) => {
                                                        return (
                                                            <MenuItem value={type.code.toLowerCase()} key={index}>
                                                                {' '}
                                                                {type.description}{' '}
                                                            </MenuItem>
                                                        )
                                                    })}
                                                </Select>
                                            </FormControl>
                                        }
                                        {
                                            (d.type === 'company' || d.type === 'firstname' || d.type === 'lastname') &&
                                            <TextField
                                                variant={'outlined'}
                                                size={'small'}
                                                fullWidth
                                                onChange={(e) => handleChangeText(d.type, e.target.value)}
                                            />
                                        }
                                        {
                                            d.type === 'mobiletel' &&
                                            <TextField
                                                variant={'outlined'}
                                                size={'small'}
                                                fullWidth
                                                onChange={(e) => handleChangeText(d.type, e.target.value)}
                                                error={(pbookData.mobiletel && validator.isMobilePhone(pbookData.mobiletel) === false) ? true : false}
                                            />
                                        }
                                        {
                                            d.type === 'workemail' &&
                                            <TextField
                                                variant={'outlined'}
                                                size={'small'}
                                                fullWidth
                                                onChange={(e) => handleChangeText(d.type, e.target.value)}
                                                error={(pbookData.workemail && validator.isEmail(pbookData.workemail) === false) ? true : false}
                                            />
                                        }
                                        {
                                            d.type === 'recaptcha' &&
                                            <ReCaptcha sitekey={GENERAL_SETTINGS.RECAPTCHA_SITE_KEY}
                                                       onChange={onVerifyRecaptcha}/>
                                        }
                                        {
                                            d.type === 'salesnote' &&
                                            <TextareaAutosize
                                                rows={4}
                                                className={classes.textArea}
                                                value={salesnote}
                                                onChange={(e) => setSalesNote(e.target.value)}
                                            />
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid> : null
                    )
                })
            }
            <Grid container style={{marginTop: 8}}>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        aria-label="add"
                        className={classes.actionButton}
                        style={{float: "right"}}
                        // onClick={handleSave}
                        disabled={!pbookData.refcode || !pbookData.firstname ||
                        !pbookData.workemail || (hasRecaptcha && !recaptchaValue) ||
                        !validator.isEmail(pbookData.workemail)}
                    >
                        SEND
                    </Button>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}
const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};
export default connect(mapStateToProps)(ContactForm);