import React, {useState, useEffect, useContext} from 'react';
//redux imports
import { connect } from 'react-redux';
//material ui imports
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepConnector from '@material-ui/core/StepConnector';
import {makeStyles} from "@material-ui/core/styles";
import ReceiptIcon from '@material-ui/icons/Receipt';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import TextField from '@material-ui/core/TextField';
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import FormControl from "@material-ui/core/FormControl";
import Container from "@material-ui/core/Container";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CreateIcon from '@material-ui/icons/Create';
import { withStyles } from '@material-ui/core/styles'
//constants
import {COLORS, UPLOAD_SUCCESS} from "../../../constants";

import clsx from "clsx";
import validator from 'validator';
import ReactDropzone from "react-dropzone";
import {Upload} from "@webcms/orest";
import {toast} from "react-toastify";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import WebCmsGlobal from "../../../../../webcms-global";
import {useRouter} from "next/router";
import InputColor from "react-input-color";

const useStyle = makeStyles(theme => ({
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: theme.spacing(2),
    },
    itemCountField: {
        marginLeft: theme.spacing(1),
        '& input': {
            height: 8
        }
    },
    itemCountTxt: {
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(2),
    },
    disableEvent: {
        pointerEvents: "none",
        opacity: 0.5
    },
    icon: {
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        opacity: 0.3,
    },
    imagePreview: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: "center",
        height: 200,
        width: '100%',
        cursor: 'pointer',
    }
}));

const useColorStepIconStyle = makeStyles(() => ({
    root: {
        backgroundColor: '#ccc',
        zIndex: 1,
        color: '#fff',
        width: 50,
        height: 50,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        '& img': {
            width: 35,
        },
    },
    iconSize: {
        height: 30,
        width: 30,
    },
    active: {
        backgroundColor: COLORS.secondary,
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    },
    completed: {
        backgroundColor: COLORS.primary,
        color: '#fff',
    },
}))

const ColorlibConnector = withStyles({
    alternativeLabel: {
        top: 30,
        left: 'calc(-50% + 10px)',
        right: 'calc(50% + 10px)',
    },
    active: {
        '& $line': {
            background: 'transparent linear-gradient(270deg, #269DD4 0%, #0F4571 100%) 0% 0% no-repeat padding-box',
        },
    },
    completed: {
        '& $line': {
            backgroundColor: COLORS.primary,
        },
    },
    line: {
        height: 4,
        border: 0,
        backgroundColor: '#eaeaf0',
        borderRadius: 1,
    },
})(StepConnector)

function getStepsIcons(itemCount, isActive, isCompleted, step) {
    const icon_classes = useColorStepIconStyle()
    let icons = {}
    switch (itemCount) {
        case 1:
            icons = {
                0: <ReceiptIcon className={icon_classes.iconSize} />,
                1: <CreateIcon className={icon_classes.iconSize} />,
            }
            break
        case 2:
            icons = {
                0: <ReceiptIcon className={icon_classes.iconSize} />,
                1: <CreateIcon className={icon_classes.iconSize} />,
                2: <CreateIcon className={icon_classes.iconSize} />,
            }
            break
        case 3:
            icons = {
                0: <ReceiptIcon className={icon_classes.iconSize} />,
                1: <CreateIcon className={icon_classes.iconSize} />,
                2: <CreateIcon className={icon_classes.iconSize} />,
                3: <CreateIcon className={icon_classes.iconSize} />,
            }
            break
        case 4:
            icons = {
                0: <ReceiptIcon className={icon_classes.iconSize} />,
                1: <CreateIcon className={icon_classes.iconSize} />,
                2: <CreateIcon className={icon_classes.iconSize} />,
                3: <CreateIcon className={icon_classes.iconSize} />,
                4: <CreateIcon className={icon_classes.iconSize} />,
            }
            break
        case 5:
            icons = {
                0: <ReceiptIcon className={icon_classes.iconSize} />,
                1: <CreateIcon className={icon_classes.iconSize} />,
                2: <CreateIcon className={icon_classes.iconSize} />,
                3: <CreateIcon className={icon_classes.iconSize} />,
                4: <CreateIcon className={icon_classes.iconSize} />,
                5: <CreateIcon className={icon_classes.iconSize} />,
            }
            break;
        default:
            icons = {
                0: <ReceiptIcon className={icon_classes.iconSize} />,
                1: <CreateIcon className={icon_classes.iconSize} />,
                2: <CreateIcon className={icon_classes.iconSize} />,
                3: <CreateIcon className={icon_classes.iconSize} />,
                4: <CreateIcon className={icon_classes.iconSize} />,
                5: <CreateIcon className={icon_classes.iconSize} />,
            }
            break
    }

    return (
        <div
            className={clsx(icon_classes.root, {
                [icon_classes.active]: isActive,
                [icon_classes.completed]: isCompleted,
            })}
        >
            {icons[step]}
        </div>
    )
}

const EditEmailFooter = (props) => {

    const {
        state,
        onEditFooter
    } = props;

    const [activeStep, setActiveStep] = useState(0);
    const [itemsCount, setItemsCount] = useState(state.email.footer.items.length);
    const [steps, setSteps] = useState([]);
    const [footerItems, setFooterItems] = useState(state.email.footer.items);
    const [isSave, setIsSave] = useState(false);
    const [isNextDisable, setIsNextDisable] = useState(false);
    const [otherLangFooterItems, setOtherLangFooterItems] = useState([]);
    const [bgColor, setBgColor] = useState(state?.email?.footer?.backgroundColor);
    const [textColor, setTextColor] = useState(state?.email?.footer?.textColor);

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal);

    const classes = useStyle();

    useEffect(() => {
        //set footer items for other languages
        if (Object.keys(state.langsFile).length > 0 &&
            state.langsFile.footer &&
            state.langsFile.footer[state.langCode]) {
            setOtherLangFooterItems([...state.langsFile.footer[state.langCode].items]);
        }
    }, []);

    useEffect(() => {
        switch (itemsCount) {
            case 1:
                setSteps(['No Of Items', 'Item 1']);
                break;
            case 2:
                setSteps(['No Of Items', 'Item 1', 'Item 2']);
                break;
            case 3:
                setSteps(['No Of Items', 'Item 1', 'Item 2', 'Item 3']);
                break;
            case 4:
                setSteps(['No Of Items', 'Item 1', 'Item 2', 'Item 3', 'Item 4']);
                break;
            case 5:
                setSteps(['No Of Items', 'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
                break;
            default:
                setSteps(['No Of Items', 'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'])
        }

        if (itemsCount < footerItems.length) {
            const updatedFooterItems = [...footerItems];
            updatedFooterItems.length = itemsCount;
            setFooterItems(updatedFooterItems);
        }
        if (itemsCount > footerItems.length) {
            for (let i = 0; i < itemsCount; i++) {
                if (!footerItems[i]) {
                    footerItems.push({
                        id: `item-${footerItems.length + 1}`,
                        alignment: 'flex-start',
                        items: []
                    })
                }
            }
        }

    }, [itemsCount]);

    const handleBack = () => {
        setActiveStep(previousStep => previousStep - 1);
    };

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            setIsSave(true);
            if (state.langCode === state.defaultLang) {
                onEditFooter({
                    tpl: state.email.footer.tpl,
                    backgroundColor: bgColor,
                    textColor: textColor,
                    items: footerItems
                })
            } else {
                onEditFooter({
                    items: otherLangFooterItems
                })
            }
        } else {
            setActiveStep(previousStep => previousStep + 1);
        }
    }

    const handleItemCountChange = (event) => {
        if (!event.target.value) {
            setItemsCount(1);
        } else {
            if (Number(event.target.value) > 5) setIsNextDisable(true);
            else setIsNextDisable(false);
            setItemsCount(Number(event.target.value));
        }
    }

    return (
        <React.Fragment>
            <Stepper activeStep={activeStep} alternativeLabel connector={<ColorlibConnector />}>
                {steps.map((label, index) => {
                    return (
                        <Step key={`step-${index}`}>
                            <StepLabel
                                color="secondary"
                                StepIconComponent={() =>
                                    getStepsIcons(itemsCount,
                                        activeStep === index, activeStep > index,
                                                index
                                    )
                                }
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    )
                })}
            </Stepper>
            <Divider />
            {
                activeStep === 0 &&
                <Grid container direction="row" justify="flex-start" alignItems="flex-start">
                    <Grid item xs={3} style={{marginTop: 8}}>
                        <Typography component={'span'} className={classes.itemCountTxt}>
                            Item Count :
                        </Typography>
                        <TextField
                            id="item-count"
                            variant="outlined"
                            inputProps={{ min: "1", max: "5", step: "1" }}
                            type="number"
                            className={classes.itemCountField}
                            onChange={handleItemCountChange}
                            value={itemsCount}
                            error={itemsCount > 5}
                            disabled={state.langCode !== state.defaultLang}
                            size={'small'}
                        />
                    </Grid>
                    <Grid item xs={2} style={{marginTop: 8}}>
                        <Typography component={'span'} className={classes.itemCountTxt}>
                            Background :
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <InputColor
                            onChange={(color) => setBgColor(color.hex)}
                            placement="right"
                            initialValue={bgColor}
                            style={{width: 100, marginTop: 8}}
                        />
                    </Grid>
                    <Grid item xs={1} style={{marginTop: 8}}>
                        <Typography component={'span'} className={classes.itemCountTxt}>
                            Text :
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <InputColor
                            onChange={(color) => setTextColor(color.hex)}
                            placement="right"
                            initialValue={textColor}
                            style={{width: 100, marginTop: 8}}
                        />
                    </Grid>
                </Grid>
            }
            {
                activeStep > 0 && state.langCode !== state.defaultLang &&
                otherLangFooterItems.length > 0 &&
                otherLangFooterItems.map((item, index) => {
                    return (activeStep - 1 === index) ? <Container key={index} style={{
                        height: 350,
                        overflow: "auto",
                        pointerEvents: isSave ? "none" : "",
                        opacity: isSave ? 0.5 : 1
                    }}>
                        <Grid container
                              justify="flex-start"
                              style={{marginTop: 8}}
                        >
                            <Grid item xs={4}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    aria-label="add"
                                    className={classes.actionButton}
                                    disabled
                                >
                                    <AddCircleIcon /> ADD
                                </Button>
                            </Grid>
                            <Grid item xs={8}>
                                <FormControl
                                    component="fieldset"
                                    style={{float: "right"}}
                                    disabled
                                >
                                    <RadioGroup
                                        aria-label="footeritem"
                                        row
                                        name="footer-item"
                                        value={item.alignment}
                                    >
                                        <FormControlLabel
                                            value={'left'}
                                            control={<Radio color="primary"/>}
                                            label="Align Left"
                                            labelPlacement="start"
                                        />
                                        <FormControlLabel
                                            value={'center'}
                                            control={<Radio color="primary"/>}
                                            label="Alight Center"
                                            labelPlacement="start"
                                        />
                                        <FormControlLabel
                                            value={'right'}
                                            control={<Radio color="primary"/>}
                                            label="Alight Right"
                                            labelPlacement="start"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        </Grid>
                        {
                            item.items.map((item, i) => {
                                return (
                                    <Grid container={true}
                                          justify={'flex-start'}
                                          key={i}
                                          style={{marginTop: 8, marginLeft: 40}}
                                    >
                                        <Grid item xs={2}>
                                            <FormControl disabled>
                                                <InputLabel htmlFor="age-native-simple">Sub Item</InputLabel>
                                                <Select
                                                    native
                                                    name='type'
                                                    variant={'outlined'}
                                                    value={footerItems[activeStep - 1].items[i].type}
                                                >
                                                    <option style={{ display: 'none' }} value=''></option>
                                                    <option value='paragraph'>Paragraph</option>
                                                    <option value='heading'>Heading</option>
                                                    <option value='link'>Link</option>
                                                    <option value='social-link'>Social Link</option>
                                                    <option value='address'>Address</option>
                                                    <option value='image'>Image</option>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={8}>
                                            {
                                                (footerItems[activeStep - 1].items[i].type === 'social-link' ||
                                                    footerItems[activeStep - 1].items[i].type === 'link' ||
                                                    footerItems[activeStep - 1].items[i].type === 'button') &&
                                                <Grid container={true}
                                                      justify={'flex-start'}
                                                      spacing={3}
                                                >
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label={'Title'}
                                                            variant="outlined"
                                                            fullWidth
                                                            value={item.value}
                                                            onChange={(e) => {
                                                                const updatedFooterItems = [...otherLangFooterItems];
                                                                updatedFooterItems[index].items[i].value = e.target.value;
                                                                setOtherLangFooterItems(updatedFooterItems);
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label={'Link'}
                                                            variant="outlined"
                                                            fullWidth
                                                            value={footerItems[activeStep - 1].items[index].value.value}
                                                            disabled
                                                        />
                                                    </Grid>
                                                </Grid>
                                            }
                                            {
                                                footerItems[activeStep - 1]?.items[i]?.type === 'image' &&
                                                <Grid container justify={'center'} spacing={1}>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label={'Link'}
                                                            variant="outlined"
                                                            fullWidth
                                                            value={footerItems[activeStep - 1]?.items[index]?.value?.link}
                                                            disabled
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Paper style={{border: `2px solid ${COLORS.secondary}`}} className={classes.disabledEvent}>
                                                            <ReactDropzone
                                                                accept={'image/png,image/jpg,image/jpeg'}
                                                                acceptedFile
                                                            >
                                                                {({ getRootProps, getInputProps }) => (
                                                                    <section>
                                                                        <div {...getRootProps()} style={{ width: '100%', height: 200 }}>
                                                                            <input {...getInputProps()} />
                                                                            {
                                                                                footerItems[activeStep - 1]?.items[index]?.value.image ? <div
                                                                                    style={{
                                                                                        backgroundImage: `url(${
                                                                                            GENERAL_SETTINGS.STATIC_URL + footerItems[activeStep - 1]?.items[index]?.value.image
                                                                                        })`,
                                                                                    }}
                                                                                    className={classes.imagePreview}
                                                                                ></div> : <CloudUploadIcon className={classes.icon} />
                                                                            }
                                                                        </div>
                                                                    </section>
                                                                )}
                                                            </ReactDropzone>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            }
                                            {
                                                (footerItems[activeStep - 1].items[i].type === 'paragraph' ||
                                                    footerItems[activeStep - 1].items[i].type === 'heading') &&
                                                <Grid container={true}
                                                      justify={'flex-start'}
                                                >
                                                    <TextField
                                                        label={'Value'}
                                                        variant="outlined"
                                                        fullWidth
                                                        value={item.value}
                                                        onChange={(e) => {
                                                            const updatedFooterItems = [...otherLangFooterItems];
                                                            updatedFooterItems[index].items[i].value = e.target.value;
                                                            setOtherLangFooterItems(updatedFooterItems);
                                                        }}
                                                    />
                                                </Grid>
                                            }
                                            {
                                                footerItems[activeStep - 1].items[i].type === 'address' &&
                                                <Paper style={{border: `2px solid ${COLORS.secondary}`,
                                                    height: 220,
                                                    overflow: "auto"
                                                }}>
                                                    <Grid container justify={'flex-start'}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            color="primary"
                                                            aria-label="add"
                                                            className={classes.actionButton}
                                                            style={{marginTop: 8}}
                                                            disabled
                                                        >
                                                            <AddCircleIcon /> ADD
                                                        </Button>
                                                    </Grid>
                                                    {
                                                        footerItems[activeStep - 1].items[i].value.length > 0 &&
                                                        footerItems[activeStep - 1].items[i].value.map((value, addIndex) => {
                                                            return (
                                                                <Grid style={{marginTop: 8, marginBottom: 8}}
                                                                      key={addIndex}
                                                                      container={true}
                                                                      justify={'flex-start'}
                                                                      spacing={3}
                                                                >
                                                                    <Grid item xs={5}>
                                                                        <TextField
                                                                            disabled
                                                                            label={'Title'}
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            value={value.title}
                                                                            style={{marginLeft: 8}}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={5}>
                                                                        <TextField
                                                                            label={'Link'}
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            value={value.value}
                                                                            disabled
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={2}>
                                                                        <IconButton
                                                                            aria-label="Delete item"
                                                                            color="primary"
                                                                            disabled
                                                                            className={classes.disableEvent}
                                                                        >
                                                                            <CancelIcon style={{color: 'grey'}} />
                                                                        </IconButton>
                                                                    </Grid>
                                                                </Grid>
                                                            )
                                                        })
                                                    }
                                                </Paper>
                                            }
                                        </Grid>
                                        <Grid item xs={2}>
                                            <IconButton
                                                aria-label="Delete item"
                                                color="primary"
                                                disabled
                                                className={classes.disableEvent}
                                            >
                                                <CancelIcon style={{color: 'grey'}} />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                )
                            })
                        }
                    </Container> : null
                })
            }
            {
                activeStep > 0 && state.langCode === state.defaultLang && footerItems.length > 0 && footerItems.map((footerItem, index) => {
                    return (activeStep - 1 === index) ? <Container  key={index} style={{
                        height: 350,
                        overflow: "auto",
                        pointerEvents: isSave ? "none" : "",
                        opacity: isSave ? 0.5 : 1
                    }}>
                        <Grid container
                              justify="flex-start"
                              style={{marginTop: 8}}
                        >
                            <Grid item xs={4}>
                                <Button
                                    onClick={() => {
                                        const updatedFooterItems = [...footerItems];
                                        updatedFooterItems[index].items.push({
                                            id: `item-${footerItem.items.length - 1}`,
                                            type: 'paragraph',
                                            value: '',
                                        });
                                        setFooterItems(updatedFooterItems);
                                    }}
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    aria-label="add"
                                    className={classes.actionButton}
                                >
                                    <AddCircleIcon /> ADD
                                </Button>
                            </Grid>
                            <Grid item xs={8}>
                                <FormControl
                                    component="fieldset"
                                    style={{float: "right"}}
                                >
                                    <RadioGroup
                                                aria-label="footeritem"
                                                row
                                                name="footer-item"
                                                value={footerItem.alignment}
                                                onChange={(e) => {
                                                    const updatedFooterItems = [...footerItems];
                                                    updatedFooterItems[index].alignment = e.target.value;
                                                    setFooterItems(updatedFooterItems);
                                                }}
                                    >
                                        <FormControlLabel
                                            value={'left'}
                                            control={<Radio color="primary"/>}
                                            label="Align Left"
                                            labelPlacement="start"
                                        />
                                        <FormControlLabel
                                            value={'center'}
                                            control={<Radio color="primary"/>}
                                            label="Alight Center"
                                            labelPlacement="start"
                                        />
                                        <FormControlLabel
                                            value={'right'}
                                            control={<Radio color="primary"/>}
                                            label="Alight Right"
                                            labelPlacement="start"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        </Grid>
                        {
                            footerItem.items.map((item, i) => {
                                return (
                                    <Grid container={true}
                                          justify={'flex-start'}
                                          key={i}
                                          style={{marginTop: 8, marginLeft: 40}}
                                    >
                                        <Grid item xs={2}>
                                            <FormControl >
                                                <InputLabel htmlFor="age-native-simple">Sub Item</InputLabel>
                                                <Select
                                                    native
                                                    name='type'
                                                    variant={'outlined'}
                                                    value={item.type}
                                                    onChange={(e) => {
                                                        const updatedFooterItems = [...footerItems];
                                                        if (e.target.value === 'social-link' ||
                                                            e.target.value === 'link' ||
                                                            e.target.value === 'button') {
                                                            updatedFooterItems[index].items[i] = {
                                                                id: item.id,
                                                                type: e.target.value,
                                                                value: {
                                                                    title: '',
                                                                    value: ''
                                                                }
                                                            }
                                                        }
                                                        if (e.target.value === 'paragraph' ||
                                                            e.target.value === 'heading') {
                                                            updatedFooterItems[index].items[i] = {
                                                                id: item.id,
                                                                type: e.target.value,
                                                                value: ''
                                                            }
                                                        }
                                                        if (e.target.value === 'address') {
                                                            updatedFooterItems[index].items[i] = {
                                                                id: item.id,
                                                                type: e.target.value,
                                                                value: [{
                                                                    title: '',
                                                                    value: ''
                                                                }]
                                                            }
                                                        }
                                                        if (e.target.value === 'image') {
                                                            updatedFooterItems[index].items[i] = {
                                                                id: item.id,
                                                                type: e.target.value,
                                                                value: {
                                                                    link: '',
                                                                    image: GENERAL_SETTINGS.STATIC_URL + state?.poweredByUrl
                                                                }
                                                            }
                                                        }
                                                        setFooterItems(updatedFooterItems);
                                                    }}
                                                >
                                                    <option style={{ display: 'none' }} value=''></option>
                                                    <option value='paragraph'>Paragraph</option>
                                                    <option value='heading'>Heading</option>
                                                    <option value='link'>Link</option>
                                                    <option value='social-link'>Social Link</option>
                                                    <option value='address'>Address</option>
                                                    <option value='image'>Image</option>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={8}>
                                            {
                                                (item.type === 'social-link' || item.type === 'link' ||
                                                    item.type === 'button') && <Grid container={true}
                                                                                     justify={'flex-start'}
                                                                                     spacing={3}
                                                >
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label={'Title'}
                                                            variant="outlined"
                                                            fullWidth
                                                            value={item.value.title}
                                                            onChange={(e) => {
                                                                const updatedFooterItems = [...footerItems];
                                                                updatedFooterItems[index].items[i].value['title'] = e.target.value;
                                                                setFooterItems(updatedFooterItems);
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label={'Link'}
                                                            variant="outlined"
                                                            fullWidth
                                                            value={item.value.value}
                                                            error={(!validator.isURL(item.value.value) && item.value.value) ? true : false}
                                                            onChange={(e) => {
                                                                const updatedFooterItems = [...footerItems];
                                                                updatedFooterItems[index].items[i].value['value'] = e.target.value;
                                                                setFooterItems(updatedFooterItems);
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            }
                                            {
                                                item?.type === 'image' &&
                                                <Grid container justify={'center'} spacing={1} >
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label={'Link'}
                                                            variant="outlined"
                                                            fullWidth
                                                            value={item?.value?.link}
                                                            error={(!validator.isURL(item?.value?.link) && item?.value?.link) ? true : false}
                                                            onChange={(e) => {
                                                                const updatedFooterItems = [...footerItems];
                                                                updatedFooterItems[index].items[i].value['link'] = e.target.value;
                                                                setFooterItems(updatedFooterItems);
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Paper style={{border: `2px solid ${COLORS.secondary}`, pointersEvent: 'none'}}>
                                                            <div style={{width: '100%', height: 200}}>
                                                                <div style={{backgroundImage: `url(${GENERAL_SETTINGS.STATIC_URL + state?.poweredByUrl})`,}} className={classes.imagePreview}></div>
                                                            </div>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            }
                                            {
                                                (item.type === 'paragraph' || item.type === 'heading') && <Grid container={true}
                                                                                                                justify={'flex-start'}
                                                >
                                                    <TextField
                                                        label={'Value'}
                                                        variant="outlined"
                                                        fullWidth
                                                        value={item.value}
                                                        onChange={(e) => {
                                                            const updatedFooterItems = [...footerItems];
                                                            updatedFooterItems[index].items[i].value = e.target.value;
                                                            setFooterItems(updatedFooterItems);
                                                        }}
                                                    />
                                                </Grid>
                                            }
                                            {
                                                item.type === 'address' && <Paper style={{border: `2px solid ${COLORS.secondary}`,
                                                    height: 220,
                                                    overflow: "auto"
                                                }}>
                                                    <Grid container justify={'flex-start'}>
                                                        <Button
                                                            onClick={() => {
                                                                const updatedFooterItems = [...footerItems];
                                                                updatedFooterItems[index].items[i].value.push({
                                                                    title: '',
                                                                    value: '',
                                                                });
                                                                setFooterItems(updatedFooterItems);
                                                            }}
                                                            variant="contained"
                                                            size="small"
                                                            color="primary"
                                                            aria-label="add"
                                                            className={classes.actionButton}
                                                            style={{marginTop: 8}}
                                                        >
                                                            <AddCircleIcon /> ADD
                                                        </Button>
                                                    </Grid>
                                                    {
                                                        item.value.length > 0 &&
                                                        item.value.map((value, addIndex) => {
                                                            return (
                                                                <Grid style={{marginTop: 8, marginBottom: 8}}
                                                                      key={addIndex}
                                                                      container={true}
                                                                      justify={'flex-start'}
                                                                      spacing={3}
                                                                >
                                                                    <Grid item xs={5}>
                                                                        <TextField
                                                                            onChange={(e) => {
                                                                                const updatedFooterItems = [...footerItems];
                                                                                updatedFooterItems[index].items[i].value[addIndex].title = e.target.value
                                                                                setFooterItems(updatedFooterItems);
                                                                            }}
                                                                            label={'Title'}
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            value={value.title}
                                                                            style={{marginLeft: 8}}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={5}>
                                                                        <TextField
                                                                            label={'Link'}
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            value={value.value}
                                                                            error={(!validator.isURL(value.value) && value.value) ? true : false}
                                                                            onChange={(e) => {
                                                                                const updatedFooterItems = [...footerItems];
                                                                                updatedFooterItems[index].items[i].value[addIndex].value = e.target.value
                                                                                setFooterItems(updatedFooterItems);
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={2}>
                                                                        <IconButton
                                                                            aria-label="Delete item"
                                                                            color="primary"
                                                                            onClick={() => {
                                                                                const updatedFooterItems = [...footerItems];
                                                                                updatedFooterItems[index].items[i].value.splice(
                                                                                    addIndex, 1)
                                                                                setFooterItems(updatedFooterItems);
                                                                            }}
                                                                            disabled={item.value.length === 1}
                                                                        >
                                                                            <CancelIcon style={{color: item.value.length === 1 ? '' +
                                                                                    'grey' : 'red'}} />
                                                                        </IconButton>
                                                                    </Grid>
                                                                </Grid>
                                                            )
                                                        })
                                                    }
                                                </Paper>
                                            }
                                        </Grid>
                                        <Grid item xs={2}>
                                            <IconButton
                                                aria-label="Delete item"
                                                color="primary"
                                                onClick={() => {
                                                    const updatedFooterItems = [...footerItems];
                                                    updatedFooterItems[index].items.splice(i, 1);
                                                    setFooterItems(updatedFooterItems);
                                                }}
                                                disabled={footerItem.items.length === 1}
                                            >
                                                <CancelIcon style={{color: footerItem.items.length === 1 ? 'grey' : 'red'}} />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                )
                            })
                        }
                    </Container> : null
                })
            }
            <Grid container
                  direction="row"
                  justify="flex-start"
                  alignItems="flex-start"
                  style={{pointerEvents: isSave ? "none" : "", opacity: isSave ? 0.5 : 1}}
            >
                <div className={classes.actionButtons}>
                    {activeStep !== 0 && (
                        <Button
                            onClick={handleBack}
                            variant="contained"
                            size="small"
                            aria-label="add"
                            className={classes.actionButton}
                        >
                            BACK
                        </Button>
                    )}
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        size="small"
                        color="primary"
                        aria-label="add"
                        className={classes.actionButton}
                        disabled={isNextDisable}
                    >
                        {activeStep === steps.length - 1 && activeStep !== 0 ? 'SAVE' : 'NEXT'}
                    </Button>
                </div>
            </Grid>
        </React.Fragment>
    )
};

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

export default connect(
    mapStateToProps
)(EditEmailFooter)