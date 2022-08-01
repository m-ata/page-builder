import React, {useState, useEffect, useContext} from 'react';
//material imports
import {makeStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Grid from "@material-ui/core/Grid";
import CreateIcon from '@material-ui/icons/Create';
import StepConnector from '@material-ui/core/StepConnector';
import ReceiptIcon from "@material-ui/icons/Receipt";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import validator from "validator";
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from "@material-ui/icons/Cancel";
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import Slider from '@material-ui/core/Slider';
import { withStyles } from '@material-ui/core/styles'

import { connect } from 'react-redux';
import clsx from "clsx";
import {COLORS} from "../../../constants";
import WebCmsGlobal from "../../../../../webcms-global";
import {ViewList} from "@webcms/orest";
import {OREST_ENDPOINT} from "../../../../../../model/orest/constants";
import {useRouter} from "next/router";

const useStyles = makeStyles(theme => ({
    root: {
        '& .MuiTextField-root': {
            margin: theme.spacing(1),
            width: 200,
        },
        disabledDiv: {
            pointerEvents: "none",
            opacity: 0.5
        }
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    },
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    },
    disabledEvent: {
        pointerEvents: "none",
        opacity: 0.5
    },
    icon: {
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        opacity: 0.3,
    },
    columnCard: {
        height: 400,
        overflow: 'auto',
        border: `3px solid ${COLORS.secondary}`
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
        backgroundColor: COLORS?.secondary,
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    },
    completed: {
        backgroundColor: COLORS?.primary,
        color: '#fff',
    },
}));

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

const getRowStepsIcons = (itemCount, isActive, isCompleted, step) => {
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
        default:
            icons = {
                0: <ReceiptIcon className={icon_classes.iconSize} />,
                1: <CreateIcon className={icon_classes.iconSize} />,
                2: <CreateIcon className={icon_classes.iconSize} />,
                3: <CreateIcon className={icon_classes.iconSize} />,
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

const getColumnStepsIcons = (itemCount, isActive, isCompleted, step) => {
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
            break
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

const marks = [{value: 0, label: '0'}, {value: 10, label: '10%'}, {value: 20, label: '20%'}, { value: 30, label: '30%'},
    {value: 40, label: '40%'}, {value: 50, label: '50%'}, {value: 60, label: '60'}, {value: 70, label: '70%'},
    {value: 80, label: '80%'}, { value: 90, label: '90%'}, {value: 100, label: '100%'},];

const iOSBoxShadow =
    '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

const CustomSlider = withStyles({
    root: {
        // color: COLORS.primary,
        height: 2,
        padding: '15px 0',
    },
    thumb: {
        height: 28,
        width: 28,
        backgroundColor: '#fff',
        boxShadow: iOSBoxShadow,
        marginTop: -14,
        marginLeft: -14,
        '&:focus, &:hover, &$active': {
            boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                boxShadow: iOSBoxShadow,
            },
        },
    },
    active: {},
    valueLabel: {
        left: 'calc(-50% + 11px)',
        top: -22,
        '& *': {
            background: 'transparent',
            color: '#000',
        },
    },
    track: {
        height: 2,
    },
    rail: {
        height: 2,
        opacity: 0.5,
        backgroundColor: '#bfbfbf',
    },
    mark: {
        backgroundColor: '#bfbfbf',
        height: 8,
        width: 1,
        marginTop: -3,
    },
    markActive: {
        opacity: 1,
        backgroundColor: 'currentColor',
    },
})(Slider)

const EditHeader = (props) => {

    const { state, onEditHeader } = props;
    const classes = useStyles();
    //local states
    const [rowNumber, setRowNumber] = useState(state.website.header.items.length);
    const [colNumber, setColNumber] = useState(0);
    const [rowSteps, setRowSteps] = useState([]);
    const [columnSteps, setColumnSteps] = useState([]);
    const [activeRowStep, setActiveRowStep] = useState(0);
    const [activeColumnStep, setActiveColumnStep] = useState(0);
    const [headerItems, setHeaderItems] = useState([...state.website.header.items]);
    const [otherLangHeaderItems, setOtherLangHeaderItems] = useState([]);
    const [webPages, setWebPages] = useState([]);
    const [consumeWidth, setConsumeWidth] = useState(0);
    const [sliderWidth, setSliderWidth] = useState(0);
    const [activeColumnWidth, setActiveColumnWidth] = useState(0);
    const options = [
        {
            id: 'option-1',
            code: 'external-link',
            description: 'External Link'
        },
        {
            id: 'option-2',
            code: 'internal-link',
            description: 'Internal Link'
        },
        {
            id: 'option-3',
            code: 'social-link',
            description: 'Social Link'
        },
        {
            id: 'option-4',
            code: 'logo',
            description: 'Logo'
        },
        {
            id: 'option-5',
            code: 'address',
            description: 'Address'
        },
        {
            id: 'option-6',
            code: 'phone',
            description: 'Phone'
        },
        {
            id: 'option-7',
            code: 'email',
            description: 'Email'
        },
        {
            id: 'option-8',
            code: 'button',
            description: 'Button'
        },
    ]

    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
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
                let updatedWebPages = [];
                if (state.website.pages.length > 0) {
                    state.website.pages.map(page => {
                        const webPage = res.data.data.find(x => x.gid === page.gid);
                        if (webPage) {
                            updatedWebPages.push(webPage);
                        }
                    });
                }
                setWebPages(updatedWebPages);
            }
        })
        //set header items for other languages
        if (Object.keys(state.langsFile).length > 0 && state.langsFile.header && state.langsFile.header[state.langCode]) {
            setOtherLangHeaderItems([...state.langsFile.header[state.langCode].items]);
        }
    }, []);

    useEffect(() => {
        let updatedRowsSteps = [];
        for (let i = 0; i <= rowNumber; i ++) {
            if (i === 0) {
                updatedRowsSteps.push('No of Rows');
            } else {
                updatedRowsSteps.push('Row ' + i);
            }
        }
        setRowSteps(updatedRowsSteps);
        if (rowNumber < headerItems.length) {
            const updatedHeaderItems = [...headerItems];
            updatedHeaderItems.length = rowNumber;
            setHeaderItems(updatedHeaderItems);
        }
        if (rowNumber > headerItems.length) {
            const updatedItems = headerItems;
            for (let i = 0; i < rowNumber; i++) {
                if (!updatedItems[i]) {
                    updatedItems.push({
                        id: `row-${headerItems.length + 1}`,
                        items: [{
                            id: 'item-1',
                            alignment: 'left',
                            value: [{
                                id: 'value-1',
                                type: 'external-link',
                                value: {
                                    title: '',
                                    value: ''
                                }
                            }]
                        }]
                    });
                    setHeaderItems(updatedItems);
                }
            }
        }
    }, [rowNumber]);

    useEffect(() => {
        let updatedColSteps = [];
        for (let i = 0; i <= colNumber; i ++) {
            if (i === 0) {
                updatedColSteps.push('No of Columns');
            } else {
                updatedColSteps.push('Column ' + i);
                // + '(' + headerItems[activeRowStep - 1]?.items[i - 1]?.width + '%)'
            }
        }
        setColumnSteps(updatedColSteps);
        if (activeRowStep !== 0) {
            if (colNumber < headerItems[activeRowStep - 1].items.length) {
                const updatedHeaderItems = [...headerItems];
                updatedHeaderItems[activeRowStep - 1].items.length = colNumber;
                setHeaderItems(updatedHeaderItems);
            }
            if (colNumber > headerItems[activeRowStep - 1].items.length) {
                const updatedItems = [...headerItems];
                for (let i = 0; i < colNumber; i++) {
                    if (!updatedItems[activeRowStep - 1].items[i]) {
                        updatedItems[activeRowStep - 1].items.push({
                            id: 'item-' + i+1,
                            alignment: 'left',
                            width: 10,
                            value: [
                                {
                                    id: 'value-1',
                                    type: 'external-link',
                                    value: {
                                        title: '',
                                        value: ''
                                    }
                                }
                            ]
                        });
                        setHeaderItems(updatedItems);
                    }
                }
            }
        }
    }, [colNumber]);

    useEffect(() => {
        if (activeRowStep === rowSteps.length - 1) {
            if (state.langCode === state.defaultLang) {
                onEditHeader({
                    tpl: state.website.header.tpl,
                    items: headerItems
                });
            } else {
                onEditHeader({
                    items: otherLangHeaderItems
                });
            }
        }
    }, [activeRowStep, headerItems])

    const handleNextRow = () => {
        setActiveRowStep(previousStep => previousStep + 1);
        setActiveColumnStep(0);
        setColNumber(headerItems[activeRowStep].items.length);
        setConsumeWidth(0);
    }

    const handleBackRow = () => {
        setActiveRowStep(previousStep => previousStep - 1);
        activeRowStep > 1 && setColNumber(state.website.header.items[activeRowStep - 2].items.length);
        setConsumeWidth(0);
    }

    const handleNextColumn = () => {
        const updatedHeaderItems = [...headerItems];
        setActiveColumnStep(previousStep => previousStep + 1);
        if (updatedHeaderItems[activeRowStep - 1]?.items[activeColumnStep - 1]?.width)
            updatedHeaderItems[activeRowStep - 1].items[activeColumnStep - 1].width = activeColumnWidth;
        if (colNumber === activeColumnStep + 1) {
            let lastColWidth = 0;
            for (let j = 0; j < updatedHeaderItems[activeRowStep - 1]?.items?.length - 1; j++) {
                lastColWidth = lastColWidth + updatedHeaderItems[activeRowStep - 1]?.items[j]?.width;
            }
            setActiveColumnWidth(100 - lastColWidth);
            updatedHeaderItems[activeRowStep - 1].items[activeColumnStep].width = 100 - lastColWidth;
            setSliderWidth(100);
        } else {
            let tmpWidth = 0;
            for (let i = 0; i < headerItems[activeRowStep - 1]?.items?.length; i++) {
                if (i <= activeColumnStep - 1) {
                    tmpWidth = tmpWidth + updatedHeaderItems[activeRowStep - 1]?.items[i]?.width;
                }
            }
            const totalWidth = tmpWidth + updatedHeaderItems[activeRowStep - 1]?.items[activeColumnStep]?.width;
            setActiveColumnWidth(updatedHeaderItems[activeRowStep - 1]?.items[activeColumnStep]?.width)
            setSliderWidth(totalWidth);
            setConsumeWidth(tmpWidth);
        }
        setHeaderItems(updatedHeaderItems);
    }

    const handleBackColumn = () => {
        setActiveColumnStep(previousStep => previousStep - 1);
        let tmpWidth = 0;
        for (let i = 0; i < headerItems[activeRowStep - 1]?.items?.length; i++) {
            if (i < activeColumnStep - 2) {
                tmpWidth = tmpWidth + headerItems[activeRowStep - 1]?.items[activeColumnStep - 2]?.width;
            }
        }
        const totalWidth = tmpWidth + headerItems[activeRowStep - 1]?.items[activeColumnStep - 2]?.width;
        setSliderWidth(totalWidth);
        setConsumeWidth(tmpWidth);
        setActiveColumnWidth(headerItems[activeRowStep - 1]?.items[activeColumnStep - 2]?.width)
    }

    return (
        <React.Fragment>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <IconButton
                    aria-label="Back"
                    color="primary"
                    disabled={activeRowStep === 0}
                    onClick={handleBackRow}
                >
                    <ArrowBackIosIcon  />
                </IconButton>
                <Stepper style={{width: '100%'}} activeStep={activeRowStep} connector={<ColorlibConnector />}>
                    {
                        rowSteps.map((label, index) => {
                            return (
                                <Step key={label} >
                                    <StepLabel
                                        color="secondary"
                                        StepIconComponent={() =>
                                            getRowStepsIcons(rowSteps,
                                                activeRowStep === index, activeRowStep > index,
                                                index
                                            )
                                        }
                                    >
                                        {label}
                                    </StepLabel>
                                </Step>
                            )
                        })
                    }
                </Stepper>
                <IconButton
                    aria-label="Back"
                    color="primary"
                    disabled={activeRowStep === rowSteps.length - 1 }
                    onClick={handleNextRow}
                >
                    <ArrowForwardIosIcon  />
                </IconButton>
            </div>
            {
                activeRowStep === 0 &&
                <Grid container={true}>
                    <TextField
                        label={'Number of Rows'}
                        value={rowNumber}
                        onChange={(e) => setRowNumber(parseInt(e.target.value))}
                        variant={"outlined"}
                        type="number"
                        inputProps={{min: "1", max: "3", step: "1"}}
                        style={{minWidth: 200, marginLeft: 32}}
                        disabled={state.langCode !== state.defaultLang}
                    />
                </Grid>
            }
            {
                activeRowStep !== 0 &&
                <Paper className={classes.columnCard}>
                    <Stepper activeStep={activeColumnStep} connector={<ColorlibConnector />}>
                        {
                            columnSteps.map((label, index) => {
                                return (
                                    <Step key={label} >
                                        <StepLabel
                                            color="secondary"
                                            StepIconComponent={() =>
                                                getColumnStepsIcons(columnSteps,
                                                    activeColumnStep === index, activeColumnStep > index,
                                                    index
                                                )
                                            }
                                        > {label} </StepLabel>
                                    </Step>
                                )
                            })
                        }
                    </Stepper>
                    {
                        activeColumnStep === 0 &&
                        <Grid container={true}>
                            <TextField
                                label={'Number of Columns'}
                                value={colNumber}
                                onChange={(e) => setColNumber(parseInt(e.target.value))}
                                variant={"outlined"}
                                type="number"
                                inputProps={{min: "1", max: "3", step: "1"}}
                                style={{minWidth: 200, marginLeft: 32}}
                                disabled={state.langCode !== state.defaultLang}
                            />
                        </Grid>
                    }
                    {
                        activeColumnStep > 0 && state.langCode !== state.defaultLang &&
                        otherLangHeaderItems.length > 0 &&
                        otherLangHeaderItems[activeRowStep - 1].items.map((item, index) => {
                            return (activeColumnStep - 1 === index) ?
                                <Container key={index}>
                                    <Grid container={true}>
                                        <Grid item={true} xs={4}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="primary"
                                                aria-label="add"
                                                className={classes.actionButton}
                                                disabled={true}
                                            >
                                                <AddCircleIcon /> ADD
                                            </Button>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <FormControl
                                                component="fieldset"
                                                style={{float: "right"}}
                                                disabled={true}
                                            >
                                                <RadioGroup
                                                    aria-label="footeritem"
                                                    row
                                                    name="footer-item"
                                                    value={headerItems[activeRowStep - 1].items[index].alignment}
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
                                        item.value.length > 0 && item.value.map((val, i) => {
                                            return(
                                                <Grid container={true} key={i} style={{marginTop: 8}}>
                                                    <Grid item xs={2}>
                                                        <FormControl disabled={state.langCode !== state.defaultLang}>
                                                            <InputLabel htmlFor="age-native-simple">Sub Item</InputLabel>
                                                            <Select
                                                                native
                                                                name='type'
                                                                variant={'outlined'}
                                                                value={headerItems[activeRowStep - 1].items[index].value[i].type}
                                                            >
                                                                <option style={{ display: 'none' }} value=''></option>
                                                                {
                                                                    options.length > 0 && options.map(option => {
                                                                        return(
                                                                            <option key={option.id} value={option.code} >
                                                                                {option.description}
                                                                            </option>
                                                                        )
                                                                    })
                                                                }
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={8}>
                                                        {
                                                            headerItems[activeRowStep - 1].items[index].value[i].type === 'logo' &&
                                                            <Paper style={{border: `2px solid ${COLORS.secondary}`}}
                                                                   className={state.langCode !== state.defaultLang ? classes.disabledEvent : ''}
                                                            >
                                                                <Grid container={true} justify={'center'}>
                                                                    <Grid item={true}>
                                                                        <div
                                                                            style={{
                                                                                backgroundImage: `url(${
                                                                                    GENERAL_SETTINGS.STATIC_URL + state.logoUrl
                                                                                })`,
                                                                                backgroundSize: 'contain',
                                                                                backgroundRepeat: 'no-repeat',
                                                                                backgroundPosition: "center",
                                                                                height: 200,
                                                                                width: 200,
                                                                                marginTop: 16
                                                                            }}
                                                                        ></div>
                                                                    </Grid>
                                                                </Grid>
                                                            </Paper>
                                                        }
                                                        {
                                                            (headerItems[activeRowStep - 1].items[index].value[i].type === 'social-link' ||
                                                                headerItems[activeRowStep - 1].items[index].value[i].type === 'external-link' ||
                                                                headerItems[activeRowStep - 1].items[index].value[i].type === 'address' ||
                                                                headerItems[activeRowStep - 1].items[index].value[i].type === 'button') && <Grid container={true}
                                                                                                                                                  justify={'flex-start'}
                                                                                                                                                  spacing={3}
                                                            >
                                                                <Grid item xs={6}>
                                                                    <TextField
                                                                        label={'Title'}
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        value={val.value}
                                                                        onChange={(e) => {
                                                                            const updatedHeaderItems = [...otherLangHeaderItems];
                                                                            updatedHeaderItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                            setOtherLangHeaderItems(updatedHeaderItems);
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <TextField
                                                                        label={'Link'}
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        value={headerItems[activeRowStep - 1].items[index].value[i].value.value}
                                                                        disabled={true}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        }
                                                        {
                                                            headerItems[activeRowStep - 1].items[index].value[i].type === 'internal-link' && <Grid container={true}
                                                                                                                                                   justify={'flex-start'}
                                                                                                                                                   spacing={3}
                                                            >
                                                                <Grid item xs={6}>
                                                                    <TextField
                                                                        label={'Title'}
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        value={val.value}
                                                                        onChange={(e) => {
                                                                            const updatedHeaderItems = [...otherLangHeaderItems];
                                                                            updatedHeaderItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                            setOtherLangHeaderItems(updatedHeaderItems);
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <FormControl fullWidth disabled>
                                                                        <InputLabel
                                                                            shrink={headerItems[activeRowStep - 1].items[index].value[i].value.value ? true : false}
                                                                            style={{marginLeft: 16}}
                                                                        >
                                                                            Web Page
                                                                        </InputLabel>
                                                                        <Select
                                                                            native
                                                                            value={headerItems[activeRowStep - 1].items[index].value[i].value.value}
                                                                            variant={"outlined"}
                                                                            onChange={(e) => {
                                                                                const updatedHeaderItems = [...headerItems];
                                                                                updatedHeaderItems[activeRowStep - 1].items[index].value[i].value['value'] = e.target.value;
                                                                                setHeaderItems(updatedHeaderItems);
                                                                            }}
                                                                        >
                                                                            <option style={{ display: 'none' }} value=''></option>
                                                                            {
                                                                                webPages.length > 0 && webPages.map((page, index) => {
                                                                                    return (
                                                                                        <option value={page.gid} key={index}> { page.code } </option>
                                                                                    )
                                                                                })
                                                                            }
                                                                        </Select>
                                                                    </FormControl>
                                                                </Grid>
                                                            </Grid>
                                                        }
                                                        {
                                                            headerItems[activeRowStep - 1].items[index].value[i].type === 'email' && <TextField
                                                                label={'Value'}
                                                                variant="outlined"
                                                                fullWidth
                                                                value={headerItems[activeRowStep - 1].items[index].value[i].value}
                                                                disabled={true}
                                                            />
                                                        }
                                                        {
                                                            headerItems[activeRowStep - 1].items[index].value[i].type === 'phone' && <TextField
                                                                label={'Value'}
                                                                variant="outlined"
                                                                fullWidth
                                                                value={val.value}
                                                                disabled={true}
                                                            />
                                                        }
                                                    </Grid>
                                                </Grid>
                                            )
                                        })
                                    }
                                </Container> : null
                        })
                    }
                    {
                        activeColumnStep > 0 && state.langCode === state.defaultLang &&
                        headerItems.length > 0 && headerItems[activeRowStep - 1].items.map((item, index) => {
                            return (activeColumnStep - 1 === index) ? <Container key={index}>
                                <CustomSlider
                                    marks={marks}
                                    value={sliderWidth}
                                    className={headerItems[activeRowStep - 1].items?.length - 1 === index ? classes.disabledEvent : ''}
                                    onChange={(e, value) => {
                                        if (value > consumeWidth) {
                                            setActiveColumnWidth(value - consumeWidth);
                                            setSliderWidth(value);
                                        }
                                    }}
                                />
                                <Grid container={true}>
                                    <Grid item={true} xs={4}>
                                        <Button
                                            onClick={() => {
                                                const updatedHeaderItems = [...headerItems];
                                                const updatedOtherHeaderItems = [...otherLangHeaderItems];
                                                updatedHeaderItems[activeRowStep - 1].items[index].value.push({
                                                    id: `value-${index + 1}`,
                                                    type: 'external-link',
                                                    value: {
                                                        title: '',
                                                        value: ''
                                                    }
                                                });
                                                setHeaderItems(updatedHeaderItems);
                                                if (updatedOtherHeaderItems && updatedOtherHeaderItems.length > 0 &&
                                                    updatedOtherHeaderItems[activeRowStep - 1] &&
                                                    updatedOtherHeaderItems[activeRowStep - 1].items &&
                                                    updatedOtherHeaderItems[activeRowStep - 1].items.length > 0 &&
                                                    updatedOtherHeaderItems[activeRowStep - 1].items[index] &&
                                                    updatedOtherHeaderItems[activeRowStep - 1].items[index].value) {
                                                    updatedOtherHeaderItems[activeRowStep - 1].items[index].value.push({
                                                        value: ''
                                                    })
                                                    setOtherLangHeaderItems(updatedOtherHeaderItems);
                                                }
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
                                                value={item.alignment}
                                                onChange={(e) => {
                                                    const updatedHeaderItems = [...headerItems];
                                                    updatedHeaderItems[activeRowStep - 1].items[index].alignment = e.target.value;
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
                                {
                                    item.value.length > 0 && item.value.map((val, i) => {
                                        return(
                                            <Grid container={true} key={i} style={{marginTop: 8}}>
                                                <Grid item xs={3}>
                                                    <IconButton
                                                        aria-label="Delete item"
                                                        color="primary"
                                                        onClick={() => {
                                                            const updatedHeaderItems = [...headerItems];
                                                            const tmp = updatedHeaderItems[activeRowStep - 1].items[index].value[i+1]
                                                            updatedHeaderItems[activeRowStep - 1].items[index].value[i+1] = updatedHeaderItems[activeRowStep - 1].items[index].value[i]
                                                            updatedHeaderItems[activeRowStep - 1].items[index].value[i] = tmp;
                                                            setHeaderItems(updatedHeaderItems);
                                                        }}
                                                        disabled={item.value.length === 1 || i === item.value.length - 1}
                                                        style={{outline: 'none'}}
                                                    >
                                                        <ArrowDownwardIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        aria-label="Delete item"
                                                        color="primary"
                                                        onClick={() => {
                                                            const updatedHeaderItems = [...headerItems];
                                                            const tmp = updatedHeaderItems[activeRowStep - 1].items[index].value[i-1]
                                                            updatedHeaderItems[activeRowStep - 1].items[index].value[i-1] = updatedHeaderItems[activeRowStep - 1].items[index].value[i]
                                                            updatedHeaderItems[activeRowStep - 1].items[index].value[i] = tmp;
                                                            setHeaderItems(updatedHeaderItems);
                                                        }}
                                                        disabled={item.value.length === 1 || i === 0}
                                                        style={{outline: 'none'}}
                                                    >
                                                        <ArrowUpwardIcon />
                                                    </IconButton>
                                                    <FormControl>
                                                        <InputLabel htmlFor="age-native-simple">Sub Item</InputLabel>
                                                        <Select
                                                            native
                                                            name='type'
                                                            variant={'outlined'}
                                                            value={val.type}
                                                            onChange={(e) => {
                                                                const updatedHeaderItems = [...headerItems];
                                                                if (e.target.value === 'social-link' ||
                                                                    e.target.value === 'external-link' ||
                                                                    e.target.value === 'internal-link' ||
                                                                    e.target.value === 'button' ||
                                                                    e.target.value === 'address') {
                                                                    updatedHeaderItems[activeRowStep - 1].items[index].value[i] = {
                                                                        id: val.id,
                                                                        type: e.target.value,
                                                                        value: {
                                                                            title: '',
                                                                            value: ''
                                                                        }
                                                                    }
                                                                }
                                                                if (e.target.value === 'phone' || e.target.value === 'email') {
                                                                    updatedHeaderItems[activeRowStep - 1].items[index].value[i] = {
                                                                        id: val.id,
                                                                        type: e.target.value,
                                                                        value: ''
                                                                    }
                                                                }
                                                                if (e.target.value === 'logo') {
                                                                    updatedHeaderItems[activeRowStep - 1].items[index].value[i] = {
                                                                        id: val.id,
                                                                        type: e.target.value,
                                                                        value: state.logoUrl
                                                                    }
                                                                }
                                                                setHeaderItems(updatedHeaderItems);
                                                            }}
                                                        >
                                                            <option style={{ display: 'none' }} value=''></option>
                                                            {
                                                                options.length > 0 && options.map(option => {
                                                                    return(
                                                                        <option key={option.id} value={option.code} >
                                                                            {option.description}
                                                                        </option>
                                                                    )
                                                                })
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={8}>
                                                    {
                                                        val.type === 'logo' &&
                                                        <Paper style={{border: `2px solid ${COLORS.secondary}`}}
                                                               className={state.langCode !== state.defaultLang ? classes.disabledEvent : ''}
                                                        >
                                                            <Grid container={true} justify={'center'}>
                                                                <Grid item={true}>
                                                                    <div
                                                                        style={{
                                                                            backgroundImage: `url(${
                                                                                GENERAL_SETTINGS.STATIC_URL + state.logoUrl
                                                                            })`,
                                                                            backgroundSize: 'contain',
                                                                            backgroundRepeat: 'no-repeat',
                                                                            backgroundPosition: "center",
                                                                            height: 200,
                                                                            width: 200,
                                                                            marginTop: 16
                                                                        }}
                                                                    ></div>
                                                                </Grid>
                                                            </Grid>
                                                        </Paper>
                                                    }
                                                    {
                                                        (val.type === 'social-link' || val.type === 'external-link' ||
                                                            val.type === 'button' || val.type === 'address') && <Grid container={true}
                                                                                                                      justify={'flex-start'}
                                                                                                                      spacing={3}
                                                        >
                                                            <Grid item xs={6}>
                                                                <TextField
                                                                    label={'Title'}
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    value={val.value.title}
                                                                    onChange={(e) => {
                                                                        const updatedHeaderItems = [...headerItems];
                                                                        updatedHeaderItems[activeRowStep - 1].items[index].value[i].value['title'] = e.target.value;
                                                                        setHeaderItems(updatedHeaderItems);
                                                                    }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <TextField
                                                                    label={'Link'}
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    value={val.value.value}
                                                                    error={(!validator.isURL(val.value.value) && val.value.value) ? true : false}
                                                                    onChange={(e) => {
                                                                        const updatedHeaderItems = [...headerItems];
                                                                        updatedHeaderItems[activeRowStep - 1].items[index].value[i].value['value'] = e.target.value;
                                                                        setHeaderItems(updatedHeaderItems);
                                                                    }}
                                                                    disabled={state.langCode !== state.defaultLang}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        val.type === 'internal-link' && <Grid container={true}
                                                                                              justify={'flex-start'}
                                                                                              spacing={3}
                                                        >
                                                            <Grid item xs={6}>
                                                                <TextField
                                                                    label={'Title'}
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    value={val.value.title}
                                                                    onChange={(e) => {
                                                                        const updatedHeaderItems = [...headerItems];
                                                                        updatedHeaderItems[activeRowStep - 1].items[index].value[i].value['title'] = e.target.value;
                                                                        setHeaderItems(updatedHeaderItems);
                                                                    }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={6}>
                                                                <FormControl fullWidth disabled={state.langCode !== state.defaultLang}>
                                                                    <InputLabel
                                                                        shrink={val.value.value ? true : false}
                                                                        style={{marginLeft: 16}}
                                                                    >
                                                                        Web Page
                                                                    </InputLabel>
                                                                    <Select
                                                                        native
                                                                        value={val.value.value}
                                                                        variant={"outlined"}
                                                                        onChange={(e) => {
                                                                            const updatedHeaderItems = [...headerItems];
                                                                            updatedHeaderItems[activeRowStep - 1].items[index].value[i].value['value'] = e.target.value;
                                                                            setHeaderItems(updatedHeaderItems);
                                                                        }}
                                                                    >
                                                                        <option style={{ display: 'none' }} value=''></option>
                                                                        {
                                                                            webPages.length > 0 && webPages.map((page, index) => {
                                                                                return (
                                                                                    <option value={page.gid} key={index}> { page.code } </option>
                                                                                )
                                                                            })
                                                                        }
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>
                                                        </Grid>
                                                    }
                                                    {
                                                        val.type === 'email' && <TextField
                                                            label={'Value'}
                                                            variant="outlined"
                                                            fullWidth
                                                            value={val.value}
                                                            disabled={state.langCode !== state.defaultLang}
                                                            onChange={(e) => {
                                                                const updatedHeaderItems = [...headerItems];
                                                                updatedHeaderItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                setHeaderItems(updatedHeaderItems);
                                                            }}
                                                            error={(val.value && validator.isEmail(val.value) === false) ? true : false}
                                                        />
                                                    }
                                                    {
                                                        val.type === 'phone' && <TextField
                                                            label={'Value'}
                                                            variant="outlined"
                                                            fullWidth
                                                            value={val.value}
                                                            disabled={state.langCode !== state.defaultLang}
                                                            onChange={(e) => {
                                                                const updatedHeaderItems = [...headerItems];
                                                                updatedHeaderItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                setHeaderItems(updatedHeaderItems);
                                                            }}
                                                            error={(val.value && validator.isMobilePhone(val.value) === false) ? true : false}
                                                        />
                                                    }
                                                </Grid>
                                                <Grid item xs={1}>
                                                    <IconButton
                                                        aria-label="Delete item"
                                                        color="primary"
                                                        onClick={() => {
                                                            const updatedHeaderItems = [...headerItems];
                                                            updatedHeaderItems[activeRowStep - 1].items[index].value.splice(i, 1);
                                                            setHeaderItems(updatedHeaderItems);
                                                        }}
                                                        disabled={item.value.length === 1}
                                                        className={state.langCode !== state.defaultLang ? classes.disabledEvent : ''}
                                                    >
                                                        <CancelIcon style={{color: item.value.length === 1 ? 'grey' : 'red'}} />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        )
                                    })
                                }
                            </Container> : null
                        })
                    }
                    <Grid container direction="row" justify="flex-start" alignItems="flex-start">
                        <div className={classes.actionButtons}>
                            {
                                activeColumnStep !== 0 &&
                                <Button
                                    onClick={handleBackColumn}
                                    variant="contained"
                                    size="small"
                                    aria-label="add"
                                    className={classes.actionButton}
                                    style={{marginRight: 8}}
                                >
                                    BACK
                                </Button>
                            }
                            {
                                activeColumnStep !== columnSteps.length - 1 && <Button
                                    onClick={handleNextColumn}
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    aria-label="add"
                                    className={classes.actionButton}
                                    style={{marginRight: 24}}
                                >
                                    NEXT
                                </Button>
                            }
                        </div>
                    </Grid>
                </Paper>
            }

        </React.Fragment>
    )
}
const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
}

export default connect(
    mapStateToProps,
)(EditHeader)
