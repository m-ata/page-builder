import React, {useState, useEffect, useContext} from 'react';
//material imports
import {makeStyles} from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import {UseOrest} from "@webcms/orest";
import {OREST_ENDPOINT} from "../../../../../../../model/orest/constants";
import WebCmsGlobal from "../../../../../../webcms-global";
import {useRouter} from "next/router";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ReCaptcha from 'react-google-recaptcha';
import BorderColorSharpIcon from "@material-ui/icons/BorderColorSharp";
import IconButton from "@material-ui/core/IconButton";
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import {Checkbox, FormControlLabel} from "@material-ui/core";

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

const AddContactForm = (props) => {

    const { handleSectionComponent, handleNextDisable } = props;
    const [accTypes, setAccTypes] = useState([]);
    const [accType, setAccType] = useState('');
    const [data, setData] = useState([{
        id: 'label-1',
        type: 'heading',
        label: 'Contact Form',
        isActive: true,
        isEditMode: false
    },{
        id: 'label-2',
        type: 'refcode',
        label: 'Type',
        isActive: true,
        isEditMode: false
    }, {
        id: 'label-3',
        type: 'company',
        label: 'Company Name',
        isActive: true,
        isEditMode: false
    }, {
        id: 'label-4',
        type: 'firstname',
        label: 'First Name',
        isActive: true,
        isEditMode: false
    }, {
        id: 'label-5',
        type: 'lastname',
        label: 'Last Name',
        isActive: true,
        isEditMode: false
    }, {
        id: 'label-6',
        type: 'workemail',
        label: 'Email',
        isActive: true,
        isEditMode: false
    },{
        id: 'label-7',
        type: 'mobiletel',
        label: 'Phone',
        isActive: true,
        isEditMode: false
    }, {
        id: 'label-8',
        type: 'salesnote',
        label: 'Message',
        isActive: true,
        isEditMode: false
    }, {
        id: 'label-9',
        type: 'recaptcha',
        label: '',
        isActive: true,
        isEditMode: false
    }]);
    const [useBgColor, setUseBgColor] = useState(false);

    const classes = useStyles();
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const router = useRouter();
    const companyId = router.query.companyID;
    const authToken = token || router.query.authToken;


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
                setAccTypes(res.data.data);
                setAccType(res.data.data[0].code.toLowerCase());
            }
        })

        handleNextDisable(false);
    }, []);

    useEffect(() => {
        let updatedData = [];
        Promise.all(data.map(d => {
            updatedData.push({
                id: d.id,
                type: d.type,
                label: d.label,
                isActive: d.isActive
            })
        }))
        handleSectionComponent({
            service: "pbook",
            type: "contactForm",
            gid: updatedData,
            useBgColor: useBgColor
        });
    }, [data, useBgColor]);

    return(
        <React.Fragment>
            <Typography component={'div'}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useBgColor}
                            onChange={() => setUseBgColor(!useBgColor)}
                            name="background-color"
                            color="primary"
                            style={{float: 'right'}}
                        />
                    }
                    label="Background Color"
                />
            </Typography>
            {
                data.length > 0 && data.map((d, i) => {
                    const dataValue = d;
                    return(
                        <Grid container key={i}>
                            <Grid item xs={12}>
                                <Grid container>
                                    {
                                        !d.isEditMode && <Grid item xs={3}>
                                            {
                                                d.type === 'heading' ? <Typography component={'h6'} variant={'h6'} style={{fontWeight: "bold"}}>
                                                    {
                                                        d.label
                                                    }
                                                </Typography> : <Typography style={{width: '100%'}} component={'span'}>
                                                    {
                                                        d.label
                                                    }
                                                </Typography>
                                            }
                                        </Grid>
                                    }
                                    {
                                        !d.isEditMode && <Grid item xs={1}>
                                            {
                                                d.type !== 'recaptcha' && <IconButton
                                                    aria-label="Edit item"
                                                    color="primary"
                                                    onClick={() => {
                                                        const updatedData = [...data];
                                                        updatedData[i].isEditMode = !d.isEditMode
                                                        setData(updatedData);
                                                    }
                                                    }
                                                >
                                                    <BorderColorSharpIcon color="primary"/>
                                                </IconButton>
                                            }
                                        </Grid>
                                    }
                                    {
                                        d.isEditMode && <Grid item xs={4}>
                                            <TextField
                                                variant={'outlined'}
                                                size={'small'}
                                                fullWidth
                                                value={dataValue.label}
                                                InputProps={{
                                                    endAdornment: <IconButton
                                                        aria-label="Edit item"
                                                        color="primary"
                                                        onClick={() => {
                                                            const updatedData = [...data];
                                                            updatedData[i].isEditMode = !d.isEditMode
                                                            setData(updatedData);
                                                        }}
                                                    >
                                                        <CheckBoxIcon color="primary"/>
                                                    </IconButton>
                                                }}
                                                onChange={(e) => {
                                                    const updatedData = [...data];
                                                    updatedData[i].label = e.target.value
                                                    setData(updatedData);
                                                }}
                                            />
                                        </Grid>
                                    }
                                    <Grid item xs={4}>
                                        {
                                            d.type === 'refcode' && <FormControl
                                                variant="outlined"
                                                fullWidth
                                                size={'small'}
                                                disabled
                                            >
                                                <Select
                                                    value={accType}
                                                    onChange={(e) => setAccType(e.target.value)}
                                                    label="Language"
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
                                            (d.type === 'company' || d.type === 'firstname' || d.type === 'lastname' ||
                                            d.type === 'mobiletel' || d.type === 'workemail') &&
                                            <TextField
                                                variant={'outlined'}
                                                size={'small'}
                                                fullWidth
                                                disabled
                                            />
                                        }
                                        {
                                            d.type === 'recaptcha' &&
                                            <Typography component={'div'} style={{pointerEvents: "none", opacity: 0.5}}>
                                                <ReCaptcha sitekey={GENERAL_SETTINGS.RECAPTCHA_SITE_KEY} />
                                            </Typography>
                                        }
                                        {
                                            d.type === 'salesnote' &&
                                            <TextareaAutosize
                                                rows={4}
                                                className={classes.textArea}
                                                disabled
                                            />
                                        }
                                    </Grid>
                                    <Grid item xs={2}>
                                        <FormControlLabel
                                            style={{float: "right"}}
                                            control={
                                                <Checkbox
                                                    checked={d.isActive}
                                                    onChange={() => {
                                                        const updatedData = [...data];
                                                        updatedData[i].isActive = !d.isActive;
                                                        setData(updatedData);
                                                    }}
                                                    color="primary"
                                                    disabled={d.type === 'refcode' || d.type === 'firstname' ||
                                                    d.type === 'workemail'}
                                                />
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                })
            }
            <Grid container style={{marginTop: 8}}>
                <Grid item xs={8}>
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        aria-label="add"
                        className={classes.actionButton}
                        style={{float: "right"}}
                    >
                        SEND
                    </Button>
                </Grid>
            </Grid>
        </React.Fragment>
    )
};
export default AddContactForm;