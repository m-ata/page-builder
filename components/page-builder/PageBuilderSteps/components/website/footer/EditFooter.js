import React, {useState, useEffect, useContext} from 'react';
import {TextField, Button, Container, Grid, FormControl, RadioGroup,
    FormControlLabel, Radio, InputLabel, Select, Stepper, Step, StepLabel, StepConnector, Paper} from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import ReceiptIcon from '@material-ui/icons/Receipt';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from "@material-ui/icons/Cancel";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import {makeStyles} from '@material-ui/core/styles';
import ReactDropzone from 'react-dropzone'

import { connect } from 'react-redux';
import {COLORS, UPLOAD_SUCCESS} from "../../../constants";
import clsx from "clsx";
import validator from "validator";
import WebCmsGlobal from "components/webcms-global"
import { withStyles } from '@material-ui/core/styles'
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import {Upload, ViewList} from "@webcms/orest";
import {useRouter} from "next/router";
import {toast} from "react-toastify";
import {OREST_ENDPOINT} from "../../../../../../model/orest/constants";

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
    imagePreview: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: "center",
        height: 200,
        width: '100%',
        cursor: 'pointer',
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
            backgroundColor: COLORS?.primary,
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

const getColumnStepsIcons = (itemCount, isActive, isCompleted, step) =>  {
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

const EditFooter = (props) => {

    const { state, onEditFooter } = props;
    const classes = useStyles();
    const [rowNumber, setRowNumber] = useState(state.website.footer.items.length);
    const [activeRowStep, setActiveRowStep] = useState(0);
    const [activeColumnStep, setActiveColumnStep] = useState(0);
    const [rowSteps, setRowSteps] = useState([]);
    const [columnSteps, setColumnSteps] = useState([]);
    const [footerItems, setFooterItems] = useState(state.website.footer.items);
    const [otherLangFooterItems, setOtherLangFooterItems] = useState([]);
    const [colNumber, setColNumber] = useState(0);
    const [webPages, setWebPages] = useState([]);

    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const router = useRouter();
    const companyId = router.query.companyID;
    const authToken = token || router.query.authToken;

    useEffect(() => {
        //set header items for other languages
        if (Object.keys(state.langsFile).length > 0 &&
            state.langsFile.footer &&
            state.langsFile.footer[state.langCode]) {
            setOtherLangFooterItems([...state.langsFile.footer[state.langCode].items]);
        }
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
            if (res.status === 200 && res.data.data) {
                if (state?.footerOnly) {
                    setWebPages(res?.data?.data);
                } else {
                    let updatedWebPages = [];
                    if (state.website.pages.length > 0) {
                        state.website.pages.map(page => {
                            const webPage = res.data.data.find(x => x.gid === page.gid);
                            if (webPage) {
                                updatedWebPages.push(webPage);
                            }
                        });
                        setWebPages(updatedWebPages);
                    }
                }

            }
        })
    }, []);

    useEffect(() => {
        console.log('Web pages --> ', webPages);
    }, [webPages]);

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
        if (rowNumber < footerItems.length) {
            const updatedFooterItems = [...footerItems];
            updatedFooterItems.length = rowNumber;
            setFooterItems(updatedFooterItems);
        }
        if (rowNumber > footerItems.length) {
            for (let i = 0; i < rowNumber; i++) {
                if (!footerItems[i]) {
                    footerItems.push({
                        id: `row-${footerItems.length + 1}`,
                        items: [{
                            id: 'item-1',
                            alignment: 'left',
                            value: [{
                                id: 'value-1',
                                type: 'paragraph',
                                value: ''
                            }]
                        }]
                    })
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
            }
        }
        setColumnSteps(updatedColSteps);
        if (activeRowStep !== 0) {
            if (colNumber < footerItems[activeRowStep - 1].items.length) {
                const updatedFooterItems = [...footerItems];
                updatedFooterItems[activeRowStep - 1].items.length = colNumber;
                setFooterItems(updatedFooterItems);
            }
            if (colNumber > footerItems[activeRowStep - 1].items.length) {
                for (let i = 0; i < colNumber; i++) {
                    if (!footerItems[activeRowStep - 1].items[i]) {
                        footerItems[activeRowStep - 1].items.push({
                            id: 'item-' + i+1,
                            alignment: 'left',
                            value: [
                                {
                                    id: 'value-1',
                                    type: 'paragraph',
                                    value: ''
                                }
                            ]
                        });
                    }
                }
            }
        }

    }, [colNumber]);

    useEffect(() => {
        if (activeRowStep === rowSteps.length - 1) {
            if (state.langCode === state.defaultLang) {
                onEditFooter({
                    tpl: state.website.footer.tpl,
                    items: footerItems
                });
            } else {
                onEditFooter({
                    items: otherLangFooterItems
                });
            }
        }
    }, [activeRowStep, footerItems])

    const handleNextRow = () => {
        setActiveRowStep(previousStep => previousStep + 1);
        setActiveColumnStep(0);
        setColNumber(state.website.footer.items[activeRowStep].items.length);
    }

    const handleBackRow = () => {
        setActiveRowStep(previousStep => previousStep - 1);
        activeRowStep > 1 && setColNumber(state.website.footer.items[activeRowStep - 2].items.length);
    }

    const handleNextColumn = () => {
        setActiveColumnStep(previousStep => previousStep + 1);
    }

    const handleBackColumn = () => {
        setActiveColumnStep(previousStep => previousStep - 1);
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
                        placeholder={'Enter Number of rows here ..'}
                        value={rowNumber}
                        onChange={(e) => setRowNumber(parseInt(e.target.value))}
                        variant={"outlined"}
                        type="number"
                        inputProps={{min: "1", max: "3", step: "1"}}
                        style={{minWidth: 200, marginLeft: 32}}
                    />
                </Grid>
            }
            {
                activeRowStep !== 0 &&
                <Container>
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
                                            >
                                                {label}
                                            </StepLabel>
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
                                    inputProps={{min: "1", max: "5", step: "1"}}
                                    style={{minWidth: 200, marginLeft: 32}}
                                />
                            </Grid>
                        }
                        {
                            activeColumnStep > 0 && state.langCode !== state.defaultLang &&
                            otherLangFooterItems.length > 0 &&
                            otherLangFooterItems[activeRowStep - 1].items.map((item, index) => {
                                return (activeColumnStep - 1 === index) ?
                                    <Container key={index}>
                                        <Grid container={true}>
                                            <Grid item={true} xs={4}>
                                                <Button
                                                    onClick={() => {
                                                        const updatedFooterItems = [...footerItems];
                                                        updatedFooterItems[activeRowStep - 1].items[index].value.push({
                                                            id: `value-${index + 1}`,
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
                                                        value={footerItems[activeRowStep - 1].items[index].alignment}
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
                                                                disabled
                                                            >
                                                                <ArrowDownwardIcon />
                                                            </IconButton>
                                                            <IconButton
                                                                aria-label="Delete item"
                                                                color="primary"
                                                                disabled
                                                            >
                                                                <ArrowUpwardIcon />
                                                            </IconButton>
                                                            <FormControl disabled={true} >
                                                                <InputLabel htmlFor="age-native-simple">Sub Item</InputLabel>
                                                                <Select
                                                                    native
                                                                    name='type'
                                                                    variant={'outlined'}
                                                                    value={footerItems[activeRowStep - 1].items[index].value[i].type}
                                                                >
                                                                    <option style={{ display: 'none' }} value=''></option>
                                                                    <option value='paragraph'>Paragraph</option>
                                                                    <option value='logo'>Logo</option>
                                                                    <option value='heading'>Heading</option>
                                                                    <option value='link'>Link</option>
                                                                    <option value='internal-link'>Internal</option>
                                                                    <option value='social-link'>Social Link</option>
                                                                    <option value='button'>Button</option>
                                                                    <option value='address'>Address</option>
                                                                    <option value='phone'>Phone </option>
                                                                    <option value='email'>Email</option>
                                                                    <option value='image'>Image</option>
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={8}>
                                                            {
                                                                footerItems[activeRowStep - 1].items[index].value[i].type === 'logo' &&
                                                                <Paper style={{border: `2px solid ${COLORS?.secondary}`, opacity: 0.5}}>
                                                                    <Grid container={true} justify={'center'}>
                                                                        <Grid item={true}>
                                                                            <div
                                                                                style={{
                                                                                    backgroundImage: `url(${
                                                                                        GENERAL_SETTINGS.STATIC_URL + state.altLogoUrl
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
                                                                footerItems[activeRowStep - 1].items[index].value[i].type === 'image' &&
                                                                <Grid container justify={'center'} spacing={1}>
                                                                    <Grid item xs={6}>
                                                                        <TextField
                                                                            label={'Link'}
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            value={footerItems[activeRowStep - 1].items[index].value[i].value.link}
                                                                            disabled
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <Paper style={{border: `2px solid ${COLORS?.secondary}`}} className={classes.disabledEvent}>
                                                                            <ReactDropzone
                                                                                accept={'image/png,image/jpg,image/jpeg'}
                                                                                acceptedFile
                                                                            >
                                                                                {({ getRootProps, getInputProps }) => (
                                                                                    <section>
                                                                                        <div {...getRootProps()} style={{ width: '100%', height: 200 }}>
                                                                                            <input {...getInputProps()} />
                                                                                            {
                                                                                                val.value ? <div
                                                                                                    style={{
                                                                                                        backgroundImage: `url(${
                                                                                                            GENERAL_SETTINGS.STATIC_URL + val.value?.image
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
                                                                (footerItems[activeRowStep - 1].items[index].value[i].type === 'social-link' ||
                                                                    footerItems[activeRowStep - 1].items[index].value[i].type === 'link' ||
                                                                    footerItems[activeRowStep - 1].items[index].value[i].type === 'button') &&
                                                                <Grid container={true}
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
                                                                                const updatedFooterItems = [...otherLangFooterItems];
                                                                                updatedFooterItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                                setOtherLangFooterItems(updatedFooterItems);
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <TextField
                                                                            label={'Link'}
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            value={footerItems[activeRowStep - 1].items[index].value[i].value.value}
                                                                            disabled={true}
                                                                        />
                                                                    </Grid>
                                                                </Grid>
                                                            }
                                                            {
                                                                footerItems[activeRowStep - 1].items[index].value[i].type === 'internal-link' &&
                                                                <Grid container={true} justify={'flex-start'} spacing={3}>
                                                                    <Grid item xs={6}>
                                                                        <TextField
                                                                            label={'Title'}
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            value={val.value}
                                                                            onChange={(e) => {
                                                                                const updatedFooterItems = [...otherLangFooterItems];
                                                                                updatedFooterItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                                setOtherLangFooterItems(updatedFooterItems);
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <FormControl fullWidth disabled={true}>
                                                                            <InputLabel shrink={!!val.value.value} style={{marginLeft: 16}}>
                                                                                Web Page
                                                                            </InputLabel>
                                                                            <Select
                                                                                native
                                                                                value={footerItems[activeRowStep - 1].items[index].value[i].value.value}
                                                                                variant={"outlined"}
                                                                                onChange={(e) => {
                                                                                    const updatedFooterItems = [...footerItems];
                                                                                    updatedFooterItems[activeRowStep - 1].items[index].value[i].value['value'] = e.target.value;
                                                                                    setFooterItems(updatedFooterItems);
                                                                                }}>
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
                                                                footerItems[activeRowStep - 1].items[index].value[i].type === 'address' &&
                                                                <Grid container={true}
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
                                                                                const updatedFooterItems = [...otherLangFooterItems];
                                                                                updatedFooterItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                                setOtherLangFooterItems(updatedFooterItems);
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                    <Grid item xs={6}>
                                                                        <TextField
                                                                            label={'Link'}
                                                                            variant="outlined"
                                                                            fullWidth
                                                                            value={footerItems[activeRowStep - 1].items[index].value[i].value.value}
                                                                            disabled={true}
                                                                        />
                                                                    </Grid>
                                                                </Grid>
                                                            }
                                                            {
                                                                (footerItems[activeRowStep - 1].items[index].value[i].type === 'paragraph' ||
                                                                    footerItems[activeRowStep - 1].items[index].value[i].type === 'heading') &&
                                                                <Grid container={true} justify={'flex-start'}>
                                                                    <TextField
                                                                        label={'Value'}
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        value={val.value}
                                                                        onChange={(e) => {
                                                                            const updatedFooterItems = [...otherLangFooterItems];
                                                                            updatedFooterItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                            setOtherLangFooterItems(updatedFooterItems);
                                                                        }}
                                                                    />
                                                                </Grid>
                                                            }
                                                            {
                                                                footerItems[activeRowStep - 1].items[index].value[i].type === 'email' && <TextField
                                                                    label={'Value'}
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    value={val.value}
                                                                    onChange={(e) => {
                                                                        const updatedFooterItems = [...otherLangFooterItems];
                                                                        updatedFooterItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                        setOtherLangFooterItems(updatedFooterItems);
                                                                    }}
                                                                />
                                                            }
                                                            {
                                                                footerItems[activeRowStep - 1].items[index].value[i].type === 'phone' && <TextField
                                                                    label={'Value'}
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    value={val.value}
                                                                    disabled={true}
                                                                />
                                                            }
                                                        </Grid>
                                                        <Grid item xs={1}>
                                                            <IconButton
                                                                aria-label="Delete item"
                                                                color="primary"
                                                                onClick={() => {
                                                                    const updatedFooterItems = [...footerItems];
                                                                    updatedFooterItems[activeRowStep - 1].items[index].value.splice(i, 1);
                                                                    setFooterItems(updatedFooterItems);
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
                        {
                            activeColumnStep > 0 && state.langCode === state.defaultLang &&
                            footerItems.length > 0 && footerItems[activeRowStep - 1].items.map((item, index) => {
                                return (activeColumnStep - 1 === index) ? <Container key={index}>
                                    <Grid container={true}>
                                        <Grid item={true} xs={4}>
                                            <Button
                                                onClick={() => {
                                                    const updatedFooterItems = [...footerItems];
                                                    updatedFooterItems[activeRowStep - 1].items[index].value.push({
                                                        id: `value-${index + 1}`,
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
                                                    value={item.alignment}
                                                    onChange={(e) => {
                                                        const updatedFooterItems = [...footerItems];
                                                        updatedFooterItems[activeRowStep - 1].items[index].alignment = e.target.value;
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
                                        item.value.length > 0 && item.value.map((val, i) => {
                                            return(
                                                <Grid container={true} key={i} style={{marginTop: 8}}>
                                                    <Grid item xs={3}>
                                                        <IconButton
                                                            aria-label="Delete item"
                                                            color="primary"
                                                            onClick={() => {
                                                                const updatedFooterItems = [...footerItems];
                                                                const tmp = updatedFooterItems[activeRowStep - 1].items[index].value[i+1]
                                                                updatedFooterItems[activeRowStep - 1].items[index].value[i+1] = updatedFooterItems[activeRowStep - 1].items[index].value[i]
                                                                updatedFooterItems[activeRowStep - 1].items[index].value[i] = tmp;
                                                                setFooterItems(updatedFooterItems);
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
                                                                const updatedFooterItems = [...footerItems];
                                                                const tmp = updatedFooterItems[activeRowStep - 1].items[index].value[i-1]
                                                                updatedFooterItems[activeRowStep - 1].items[index].value[i-1] = updatedFooterItems[activeRowStep - 1].items[index].value[i]
                                                                updatedFooterItems[activeRowStep - 1].items[index].value[i] = tmp;
                                                                setFooterItems(updatedFooterItems);
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
                                                                    const updatedFooterItems = [...footerItems];
                                                                    if (e.target.value === 'social-link' ||
                                                                        e.target.value === 'link' ||
                                                                        e.target.value === 'button' || e.target.value === 'address'
                                                                        || e.target.value === 'internal-link') {
                                                                        updatedFooterItems[activeRowStep - 1].items[index].value[i] = {
                                                                            id: val.id,
                                                                            type: e.target.value,
                                                                            value: {
                                                                                title: '',
                                                                                value: ''
                                                                            }
                                                                        }
                                                                    }
                                                                    if (e.target.value === 'paragraph' ||
                                                                        e.target.value === 'heading' ||
                                                                        e.target.value === 'phone' || e.target.value === 'email') {
                                                                        updatedFooterItems[activeRowStep - 1].items[index].value[i] = {
                                                                            id: val.id,
                                                                            type: e.target.value,
                                                                            value: ''
                                                                        }
                                                                    }
                                                                    if (e.target.value === 'logo') {
                                                                        updatedFooterItems[activeRowStep - 1].items[index].value[i] = {
                                                                            id: val.id,
                                                                            type: e.target.value,
                                                                            value: state.altLogoUrl
                                                                        }
                                                                    }
                                                                    if (e.target.value === 'image') {
                                                                        updatedFooterItems[activeRowStep - 1].items[index].value[i] = {
                                                                            id: val.id,
                                                                            type: e.target.value,
                                                                            value: {
                                                                                link: '',
                                                                                image: ''
                                                                            }
                                                                        }
                                                                    }
                                                                    setFooterItems(updatedFooterItems);
                                                                }}
                                                            >
                                                                <option style={{ display: 'none' }} value=''></option>
                                                                <option value='paragraph'>Paragraph</option>
                                                                <option value='logo'>Logo</option>
                                                                <option value='heading'>Heading</option>
                                                                <option value='link'>Link</option>
                                                                <option value='internal-link'>Internal Link</option>
                                                                <option value='social-link'>Social Link</option>
                                                                <option value='button'>Button</option>
                                                                <option value='address'>Address</option>
                                                                <option value='phone'>Phone </option>
                                                                <option value='email'>Email</option>
                                                                <option value='image'>Image</option>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={8}>
                                                        {
                                                            val.type === 'logo' &&
                                                            <Paper style={{border: `2px solid ${COLORS?.secondary}`}}>
                                                                <Grid container={true} justify={'center'}>
                                                                    <Grid item={true}>
                                                                        <div
                                                                            style={{
                                                                                backgroundImage: `url(${
                                                                                    GENERAL_SETTINGS.STATIC_URL + state.altLogoUrl
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
                                                            val.type === 'image' &&
                                                            <Grid container justify={'center'} spacing={1} >
                                                                <Grid item xs={6}>
                                                                    <TextField
                                                                        label={'Link'}
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        value={val.value.link}
                                                                        error={!!(!validator.isURL(val.value.link) && val.value.link)}
                                                                        onChange={(e) => {
                                                                            const updatedFooterItems = [...footerItems];
                                                                            updatedFooterItems[activeRowStep - 1].items[index].value[i].value['link'] = e.target.value;
                                                                            setFooterItems(updatedFooterItems);
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Paper
                                                                        style={{border: `2px solid ${COLORS?.secondary}`}}>
                                                                        <ReactDropzone
                                                                            onDrop={(e) => {
                                                                                Upload({
                                                                                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                                                                                    token: authToken,
                                                                                    params: {
                                                                                        masterid: state.hotelMid,
                                                                                        code: `FOOTER-IMAGE-${Math.floor(Math.random() * (1000 - 100) + 100) / 100}`,
                                                                                        orsactive: true,
                                                                                        hotelrefno: companyId,
                                                                                    },
                                                                                    files: e,
                                                                                }).then(res => {
                                                                                    if (res.status === 200 && res.data && res.data.data) {
                                                                                        let url = res.data.data.url.replace('/var/otello', '').replace('/public', '');
                                                                                        const updatedFooterItems = [...footerItems];
                                                                                        updatedFooterItems[activeRowStep - 1].items[index].value[i].value.image = url;
                                                                                        setFooterItems(updatedFooterItems);
                                                                                        toast.success(UPLOAD_SUCCESS, {
                                                                                            position: toast.POSITION.TOP_RIGHT,
                                                                                        })
                                                                                    }
                                                                                })
                                                                            }}
                                                                            accept={'image/png,image/jpg,image/jpeg'}
                                                                            acceptedFile
                                                                        >
                                                                            {({getRootProps, getInputProps}) => (
                                                                                <section>
                                                                                    <div {...getRootProps()} style={{
                                                                                        width: '100%',
                                                                                        height: 200,
                                                                                    }}>
                                                                                        <input {...getInputProps()} />
                                                                                        {
                                                                                            val.value.image ? <div
                                                                                                style={{
                                                                                                    backgroundImage: `url(${
                                                                                                        GENERAL_SETTINGS.STATIC_URL + val.value.image
                                                                                                    })`,
                                                                                                }}
                                                                                                className={classes.imagePreview}
                                                                                            ></div> : <CloudUploadIcon className={classes.icon}/>
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
                                                            (val.type === 'social-link' || val.type === 'link' ||
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
                                                                            const updatedFooterItems = [...footerItems];
                                                                            updatedFooterItems[activeRowStep - 1].items[index].value[i].value['title'] = e.target.value;
                                                                            setFooterItems(updatedFooterItems);
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
                                                                            const updatedFooterItems = [...footerItems];
                                                                            updatedFooterItems[activeRowStep - 1].items[index].value[i].value['value'] = e.target.value;
                                                                            setFooterItems(updatedFooterItems);
                                                                        }}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        }
                                                        {
                                                            (val.type === 'paragraph' || val.type === 'heading') &&
                                                            <Grid container={true} justify={'flex-start'}>
                                                                <TextField
                                                                    label={'Value'}
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    value={val.value}
                                                                    onChange={(e) => {
                                                                        const updatedFooterItems = [...footerItems];
                                                                        updatedFooterItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                        setFooterItems(updatedFooterItems);
                                                                    }}
                                                                />
                                                            </Grid>
                                                        }
                                                        {
                                                            val.type === 'email' && <TextField
                                                                label={'Value'}
                                                                variant="outlined"
                                                                fullWidth
                                                                value={val.value}
                                                                onChange={(e) => {
                                                                    const updatedFooterItems = [...footerItems];
                                                                    updatedFooterItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                    setFooterItems(updatedFooterItems);
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
                                                                onChange={(e) => {
                                                                    const updatedFooterItems = [...footerItems];
                                                                    updatedFooterItems[activeRowStep - 1].items[index].value[i].value = e.target.value;
                                                                    setFooterItems(updatedFooterItems);
                                                                }}
                                                                error={(val.value && validator.isMobilePhone(val.value) === false) ? true : false}
                                                            />
                                                        }
                                                        {
                                                            val.type === 'internal-link' &&
                                                            <Grid container={true} justify={'flex-start'} spacing={3}>
                                                                <Grid item xs={6}>
                                                                    <TextField
                                                                        label={'Title'}
                                                                        variant="outlined"
                                                                        fullWidth
                                                                        value={val.value.title}
                                                                        onChange={(e) => {
                                                                            const updatedFooterItems = [...footerItems];
                                                                            updatedFooterItems[activeRowStep - 1].items[index].value[i].value['title'] = e.target.value;
                                                                            setFooterItems(updatedFooterItems);
                                                                        }}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <FormControl fullWidth disabled={state.langCode !== state.defaultLang}>
                                                                        <InputLabel shrink={val.value.value ? true : false} style={{marginLeft: 16}}>
                                                                            Web Page
                                                                        </InputLabel>
                                                                        <Select
                                                                            native
                                                                            value={val.value.value}
                                                                            variant={"outlined"}
                                                                            onChange={(e) => {
                                                                                const updatedFooterItems = [...footerItems];
                                                                                updatedFooterItems[activeRowStep - 1].items[index].value[i].value['value'] = e.target.value;
                                                                                setFooterItems(updatedFooterItems);
                                                                            }}>
                                                                            <option style={{ display: 'none' }} value=''></option>
                                                                            {
                                                                                webPages.length > 0 && webPages.map((page, index) => {
                                                                                    console.log('page ---> ', page);
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
                                                    </Grid>
                                                    <Grid item xs={1}>
                                                        <IconButton
                                                            aria-label="Delete item"
                                                            color="primary"
                                                            onClick={() => {
                                                                const updatedFooterItems = [...footerItems];
                                                                updatedFooterItems[activeRowStep - 1].items[index].value.splice(i, 1);
                                                                setFooterItems(updatedFooterItems);
                                                            }}
                                                            disabled={item.value.length === 1}
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
                                        // disabled={handleNextDisable() ? true : false}
                                    >
                                        NEXT
                                    </Button>
                                }
                            </div>
                        </Grid>
                    </Paper>
                </Container>
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
)(EditFooter);