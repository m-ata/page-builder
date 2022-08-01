import React, {useContext, useEffect, useState} from 'react';
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
import CreateIcon from '@material-ui/icons/Create';
import CancelIcon from '@material-ui/icons/Cancel';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { withStyles } from '@material-ui/core/styles'
//constants
import {COLORS} from "../../../constants";

import clsx from "clsx";
import validator from 'validator';
import WebCmsGlobal from "components/webcms-global";
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
    previewStyle: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center ',
        width: '100%',
        height: '100%',
    },
    disableEvents: {
        pointerEvents: "none",
        opacity: 0.5
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

const EditEmailHeader = (props) => {

    const {
        state,
        onEditHeader
    } = props;

    const [activeStep, setActiveStep] = useState(0);
    const [itemsCount, setItemsCount] = useState(state.email.header.items.length);
    const [steps, setSteps] = useState([]);
    const [headerItems, setHeaderItems] = useState(state.email.header.items);
    const [otherLangHeaderItems, setOtherLangHeaderItems] = useState([]);
    const [isSave, setIsSave] = useState(false);
    const [isNextDisable, setIsNextDisable] = useState(false);
    const [bgColor, setBgColor] = useState(state?.email?.header?.backgroundColor);
    const [textColor, setTextColor] = useState(state?.email?.header?.textColor);

    const {GENERAL_SETTINGS} = useContext(WebCmsGlobal);
    const classes = useStyle();

    useEffect(() => {
        //set header items for other languages
        if (Object.keys(state.langsFile).length > 0 && state.langsFile.header && state.langsFile.header[state.langCode]) {
            setOtherLangHeaderItems([...state.langsFile.header[state.langCode].items]);
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

        if (itemsCount < headerItems.length) {
            const updatedHeaderItems = [...headerItems];
            updatedHeaderItems.length = itemsCount;
            setHeaderItems(updatedHeaderItems);
        }
        if (itemsCount > headerItems.length) {
            for (let i = 0; i < itemsCount; i++) {
                if (!headerItems[i]) {
                    headerItems.push({
                        id: `item-${headerItems.length + 1}`,
                        alignment: 'left',
                        type: 'logo',
                        value: {
                            title: '',
                            link: GENERAL_SETTINGS.STATIC_URL + state.logoUrl
                        }
                    })
                }
            }
        }

    }, [itemsCount]);

    const handleItemCountChange = (event) => {
        if (!event.target.value) {
            setItemsCount(1);
        } else {
            if (Number(event.target.value) > 5) setIsNextDisable(true);
            else setIsNextDisable(false);
            setItemsCount(Number(event.target.value));
        }
    }

    const handleBack = () => {
        setActiveStep(previousStep => previousStep - 1);
    };

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            setIsSave(true);
            if (state.langCode === state.defaultLang) {
                onEditHeader({
                    tpl: state.email.header.tpl,
                    backgroundColor: bgColor,
                    textColor: textColor,
                    items: headerItems
                });
            } else {
                onEditHeader({
                    items: otherLangHeaderItems
                });
            }
        } else {
            setActiveStep(previousStep => previousStep + 1);
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
                            inputProps={{ min: "1", max: "3", step: "1" }}
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
                            style={{width: 100, marginLeft: 8, marginTop: 8}}
                        />
                    </Grid>
                    <Grid item xs={2} style={{marginTop: 8}}>
                        <Typography component={'span'} className={classes.itemCountTxt}>
                            Text :
                        </Typography>

                    </Grid>
                    <Grid item xs={2}>
                        <InputColor
                            onChange={(color) => setTextColor(color.hex)}
                            placement="right"
                            initialValue={textColor}
                            style={{width: 100, marginLeft: 8, marginTop: 8}}
                        />
                    </Grid>
                </Grid>
            }
            {
                activeStep > 0 && otherLangHeaderItems && state.langCode !== state.defaultLang &&
                otherLangHeaderItems.length > 0 &&
                otherLangHeaderItems.map((item, index) => {
                        return(activeStep - 1 === index) ? <Container key={index}
                                                                      style={{height: 350,
                                                                          overflow: "auto",
                                                                          pointerEvents: isSave ? "none" : "",
                                                                          opacity: isSave ? 0.5 : 1
                                                                      }}
                        >
                            <Grid container
                                  justify="flex-start"
                                  style={{marginTop: 8}}
                            >
                                <Grid item xs={4}>
                                    <FormControl
                                        fullWidth
                                        disabled
                                    >
                                        <InputLabel htmlFor="age-native-simple">Sub Item</InputLabel>
                                        <Select
                                            native
                                            name='type'
                                            variant={'outlined'}
                                            value={headerItems[index].type}
                                        >
                                            <option style={{ display: 'none' }} value=''></option>
                                            <option value='logo'>Logo</option>
                                            <option value='link'>Link</option>
                                            <option value='social-link'>Social Link</option>
                                        </Select>
                                    </FormControl>
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
                                            value={headerItems[index].alignment}
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
                            <Grid container
                                  justify="center"
                                  style={{marginTop: 16}}
                            >
                                {
                                    headerItems[index].type === 'logo' && <Paper style={{
                                        height: 250,
                                        width: 500,
                                        overflow: "auto",
                                        border: '2px solid silver',
                                    }}
                                                                                 className={classes.disableEvents}
                                    >
                                        <div
                                            className={classes.previewStyle}
                                            style={{
                                                backgroundImage: `url(${
                                                    GENERAL_SETTINGS.STATIC_URL + state.logoUrl
                                                })`,
                                            }}
                                        >

                                        </div>

                                    </Paper>
                                }
                                {
                                    (headerItems[index].type === 'link' || headerItems[index].type === 'social-link') &&
                                    <Paper style={{
                                        height: 250,
                                        minWidth: 600,
                                        overflow: "auto",
                                        border: '2px solid silver',
                                    }}>
                                        <Grid container
                                              justify="flex-end"
                                              style={{marginTop: 8}}
                                        >
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="primary"
                                                aria-label="add"
                                                className={classes.actionButton}
                                                style={{marginRight: 24}}
                                                disabled
                                            >
                                                <AddCircleIcon /> ADD
                                            </Button>
                                        </Grid>
                                        {
                                            item.value.length > 0 &&
                                            item.value.map((item, i) => {
                                                return(
                                                    <Grid container
                                                          justify={'flex-start'}
                                                          spacing={2}
                                                          style={{marginTop: 8}}
                                                          key={i}
                                                    >
                                                        <Grid item xs={5}>
                                                            <TextField
                                                                label={'Title'}
                                                                variant="outlined"
                                                                fullWidth
                                                                value={item.value}
                                                                style={{marginLeft: 24}}
                                                                onChange={(e) => {
                                                                    const updatedHeaderItems = [...otherLangHeaderItems];
                                                                    updatedHeaderItems[index].value[i].value = e.target.value;
                                                                    setOtherLangHeaderItems(updatedHeaderItems);
                                                                }}
                                                                disabled={headerItems[index].type === 'social-link'}
                                                            />
                                                        </Grid>
                                                        <Grid
                                                            item
                                                            xs={5}
                                                        >
                                                            <TextField
                                                                label={'Link'}
                                                                variant="outlined"
                                                                fullWidth
                                                                value={headerItems[index].value[i].link}
                                                                style={{marginLeft: 24}}
                                                                disabled
                                                            />
                                                        </Grid>
                                                        <Grid item xs={2}>
                                                            <IconButton
                                                                aria-label="Delete item"
                                                                color="primary"
                                                                className={classes.disableEvents}
                                                                style={{marginLeft: 16}}
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
                        </Container> : null
                    })
            }
            {
                activeStep > 0 && state.langCode === state.defaultLang &&
                headerItems.length > 0 && headerItems.map((headerItem, index) => {
                    return (activeStep - 1 === index) ? <Container key={index}
                        style={{height: 350,
                            overflow: "auto",
                            pointerEvents: isSave ? "none" : "",
                            opacity: isSave ? 0.5 : 1
                        }}
                    >
                        <Grid container
                              justify="flex-start"
                              style={{marginTop: 8}}
                        >
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="age-native-simple">Sub Item</InputLabel>
                                    <Select
                                        native
                                        name='type'
                                        variant={'outlined'}
                                        value={headerItem.type}
                                        onChange={(e) => {
                                            const updatedHeaderItems = [...headerItems];
                                            if (e.target.value === 'social-link' ||
                                                e.target.value === 'link') {
                                                updatedHeaderItems[index] = {
                                                    id: headerItem.id,
                                                    alignment: headerItem.alignment,
                                                    type: e.target.value,
                                                    value: [
                                                        {
                                                            title: '',
                                                            link: ''
                                                        }
                                                    ]
                                                }
                                            }
                                            if (e.target.value === 'logo') {
                                                updatedHeaderItems[index] = {
                                                    id: headerItem.id,
                                                    alignment: headerItem.alignment,
                                                    type: e.target.value,
                                                    value: {
                                                        title: '',
                                                        link: GENERAL_SETTINGS.STATIC_URL + state.logoUrl
                                                    }
                                                }
                                            }
                                            setHeaderItems(updatedHeaderItems);
                                        }}
                                        disabled={state.langCode !== state.defaultLang}
                                    >
                                        <option style={{ display: 'none' }} value=''></option>
                                        <option value='logo'>Logo</option>
                                        <option value='link'>Link</option>
                                        <option value='social-link'>Social Link</option>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={8}>
                                <FormControl
                                    component="fieldset"
                                    style={{float: "right"}}
                                    disabled={state.langCode !== state.defaultLang}
                                >
                                    <RadioGroup
                                        aria-label="footeritem"
                                        row
                                        name="footer-item"
                                        value={headerItem.alignment}
                                        onChange={(e) => {
                                            const updatedHeaderItems = [...headerItems];
                                            updatedHeaderItems[index].alignment = e.target.value;
                                            setHeaderItems(updatedHeaderItems);
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
                        <Grid container
                              justify="center"
                              style={{marginTop: 16}}
                              >
                            {
                                headerItem.type === 'logo' && <Paper style={{
                                                                    height: 250,
                                                                    width: 500,
                                                                    overflow: "auto",
                                                                    border: '2px solid silver',
                                                                    }}
                                                                     className={state.langCode !== state.defaultLang ? classes.disableEvents : ''}
                                >
                                    <div
                                        className={classes.previewStyle}
                                        style={{
                                            backgroundImage: `url(${
                                                GENERAL_SETTINGS.STATIC_URL + state.logoUrl
                                            })`,
                                        }}
                                    >

                                    </div>

                                </Paper>
                            }
                            {
                                (headerItem.type === 'link' || headerItem.type === 'social-link') && <Paper style={{
                                    height: 250,
                                    minWidth: 600,
                                    overflow: "auto",
                                    border: '2px solid silver',
                                }}
                                >
                                    <Grid container
                                          justify="flex-end"
                                          style={{marginTop: 8}}
                                          >
                                        <Button
                                            onClick={() => {
                                                const updatedHeaderItems = [...headerItems];
                                                updatedHeaderItems[index].value.push({
                                                    title: '',
                                                    link: '',
                                                });
                                                setHeaderItems(updatedHeaderItems);
                                            }}
                                            variant="contained"
                                            size="small"
                                            color="primary"
                                            aria-label="add"
                                            className={classes.actionButton}
                                            style={{marginRight: 24}}
                                            disabled={state.langCode !== state.defaultLang}
                                        >
                                            <AddCircleIcon /> ADD
                                        </Button>
                                    </Grid>
                                    {
                                        headerItem.value.length > 0 &&
                                        headerItem.value.map((item, i) => {
                                            return(
                                                <Grid container
                                                      justify={'flex-start'}
                                                      spacing={2}
                                                      style={{marginTop: 8}}
                                                      key={i}
                                                >
                                                    <Grid item xs={5}>
                                                        <TextField
                                                            label={'Title'}
                                                            variant="outlined"
                                                            fullWidth
                                                            value={item.title}
                                                            style={{marginLeft: 24}}
                                                            onChange={(e) => {
                                                                const updatedHeaderItems = [...headerItems];
                                                                updatedHeaderItems[index].value[i].title = e.target.value;
                                                                setHeaderItems(updatedHeaderItems);
                                                            }}
                                                            disabled={headerItem.type === 'social-link'}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={5}>
                                                        <TextField
                                                            label={'Link'}
                                                            variant="outlined"
                                                            fullWidth
                                                            value={item.link}
                                                            style={{marginLeft: 24}}
                                                            error={(!validator.isURL(item.link) && item.link) ? true : false}
                                                            onChange={(e) => {
                                                                const updatedHeaderItems = [...headerItems];
                                                                updatedHeaderItems[index].value[i].link = e.target.value;
                                                                setHeaderItems(updatedHeaderItems);
                                                            }}
                                                            disabled={state.langCode !== state.defaultLang}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <IconButton
                                                            aria-label="Delete item"
                                                            color="primary"
                                                            className={state.langCode !== state.defaultLang ? classes.disableEvents : ''}
                                                            style={{marginLeft: 16}}
                                                            disabled={headerItem.value.length === 1}
                                                            onClick={() => {
                                                                const updatedHeaderItems = [...headerItems];
                                                                updatedHeaderItems[index].value.splice(
                                                                    i, 1)
                                                                setHeaderItems(updatedHeaderItems);
                                                            }}
                                                        >
                                                            <CancelIcon style={{color: headerItem.value.length === 1 ? '' +
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
)(EditEmailHeader)