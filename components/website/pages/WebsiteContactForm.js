import React, { useState, useEffect, useContext, memo } from 'react'
import WebCmsGlobal from "components/webcms-global";
import {makeStyles} from "@material-ui/core/styles";
import axios from "axios";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import validator from "validator";
import ReCaptcha from "react-google-recaptcha";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import Button from "@material-ui/core/Button";
import {toast, ToastContainer} from "react-toastify";

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

const WebsiteContactForm = (props) => {

    const {formData, otherLangFormData, selectedLang, defaultLang} = props;
    const [accTypes, setAccTypes] = useState([]);
    const [accType, setAccType] = useState('');
    const [groupID, setGroupID] = useState('');
    const [hasRecaptcha, setHasRecaptcha] = useState(false);
    const [recaptchaValue, setRecaptchaValue] = useState('');
    const [salesnote, setSalesNote] = useState('');
    const [pbookData, setPbookData] = useState({
        refcode: '',
        firstname: '',
        lastname: '',
        workemail: '',
        mobiletel: '',
        company: ''
    });

    const classes = useStyles();
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);

    useEffect(() => {
        axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/acc-trans-type/get',
            method: 'post',
        }).then(res => {
            if (res.status === 200 && res.data && res.data.data && res.data.data.length > 0) {
                const updatedPbookData = {...pbookData};
                setAccTypes(res.data.data);
                setAccType(res.data.data[0]);
                updatedPbookData['refcode'] = res.data.data[0].code.toLowerCase();
                setPbookData(updatedPbookData);
            }
        })
        axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/clientgr/web/get',
            method: 'post',
        }).then(res => {
            if (res.status === 200 && res.data && res.data.data) {
                setGroupID(res.data.data.res);
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

    const handleChangeText = (key, value) => {
        const updatedPbookData = {...pbookData};
        updatedPbookData[key] = value;
        setPbookData(updatedPbookData);
    }

    const onVerifyRecaptcha = (value) => {
        setRecaptchaValue(value);
    }

    const handleSave = () => {
        axios({
            url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/pbook/ins',
            method: 'post',
            data: {
                refcode: pbookData.refcode,
                firstname: pbookData.firstname,
                lastname: pbookData.lastname,
                workemail: pbookData.workemail,
                mobiletel: pbookData.mobiletel,
                groupid: groupID,
            }
        }).then(res => {
            if (res.status === 200 && res.data && res.data.data) {
                axios({
                    url: GENERAL_SETTINGS.BASE_URL + 'api/hotel/salecall/ins',
                    method: 'post',
                    data: {
                        agencyid: res.data.data.id,
                        salesnote: salesnote,
                    }
                }).then(res1 => {
                    if (res1.status === 200 && res1.data && res1.data.data) {
                        axios({
                            url: GENERAL_SETTINGS.BASE_URL + 'api/contact/send/mail',
                            method: 'post',
                            data: {
                                firstname: pbookData.firstname,
                                lastname: pbookData.lastname,
                                subject: 'Contact Information',
                                email: pbookData.workemail,
                                mobiletel: pbookData.mobiletel,
                                note: salesnote,
                                acctype: accType.description,
                                company: pbookData.company,
                                acctypeLabel: formData.gid.find(x => x.type === 'refcode').label,
                                companyLabel: formData.gid.find(x => x.type === 'company').label,
                                firstnameLabel: formData.gid.find(x => x.type === 'firstname').label,
                                lastnameLabel: formData.gid.find(x => x.type === 'lastname').label,
                                emailLabel: formData.gid.find(x => x.type === 'workemail').label,
                                phoneLabel: formData.gid.find(x => x.type === 'mobiletel').label,
                                noteLabel: formData.gid.find(x => x.type === 'salesnote').label,
                            }
                        }).then(res2 => {
                            if (res2.status === 200) {
                                toast.success('Email send successfully', {
                                    position: toast.POSITION.TOP_RIGHT,
                                });
                            }
                        })
                    }
                })
            }
        })
    }

    return(
        <React.Fragment>
            {
                selectedLang !== defaultLang && otherLangFormData && otherLangFormData.length > 0 &&
                otherLangFormData.map((d, i) => {
                    return(
                        formData.gid[i].isActive ? <Grid container key={i} style={{marginTop: i === 0 ? 24 : 8}}>
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
                                                    formData.gid[i].label
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
                selectedLang === defaultLang && formData && formData.gid && formData.gid.length > 0 && formData.gid.map((d, i) => {
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
                                                        const tmpAccType = e.target.value;
                                                        const updatedPbookData = {...pbookData};
                                                        pbookData['refcode'] = tmpAccType.code.toLowerCase();
                                                        setAccType(tmpAccType);
                                                        setPbookData(updatedPbookData);
                                                    }}
                                                >
                                                    {accTypes.map((type, index) => {
                                                        return (
                                                            <MenuItem value={type} key={index}>
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
                                            <ReCaptcha sitekey={GENERAL_SETTINGS.RECAPTCHA_SITE_KEY} onChange={onVerifyRecaptcha} />
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
                        onClick={handleSave}
                        disabled={!pbookData.refcode || !pbookData.firstname ||
                        !pbookData.workemail || (hasRecaptcha && !recaptchaValue) ||
                        !validator.isEmail(pbookData.workemail)}
                    >
                        SEND
                    </Button>
                </Grid>
            </Grid>
            <ToastContainer autoClose={8000} />
        </React.Fragment>
    )
}

const memorizedWebsiteContactForm = memo(WebsiteContactForm)

export default memorizedWebsiteContactForm