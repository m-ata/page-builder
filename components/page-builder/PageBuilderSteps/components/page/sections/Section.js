import React, {useContext, useEffect, useState} from 'react';
//material imports
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepConnector from '@material-ui/core/StepConnector';
import CreateIcon from '@material-ui/icons/Create';
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Container from "@material-ui/core/Container";
import { makeStyles } from '@material-ui/core/styles'
import Slider from '@material-ui/core/Slider';
import TextField from "@material-ui/core/TextField";
import CategoryIcon from '@material-ui/icons/Category';
import { withStyles } from '@material-ui/core/styles'
import Typography from "@material-ui/core/Typography";
//redux imports
import { connect } from 'react-redux';
//custom imports
import AddSlider from "./slider/AddSlider";
import AddSliderOnly from './slider-only/AddSliderOnly';
import UploadImage from "./image/UploadImage";
import AddParagraph from "./paragraph/AddParagraph";
import WidgetBooking from "components/ibe/widget/booking";
import WrappedMap from "./map/Map";
import AddContactForm from "./contact-form/AddContactForm";
import AddSliderGallery from "./slider-gallery/AddSliderGallery";
import AddCardSlider from "./card-type-slider/AddCardSlider";
import {Insert} from "@webcms/orest";
import {OREST_ENDPOINT} from "../../../../../../model/orest/constants";
import WebCmsGlobal from "../../../../../webcms-global";
import {useRouter} from "next/router";
import {setToState, updateState} from "../../../../../../state/actions";
import {COLORS, froalaConfig} from "../../../constants";
import clsx from "clsx";
import {Checkbox} from "@material-ui/core";
//Froala editor improts
import dynamic from 'next/dynamic';
import AddVideo from './video/AddVideo';
const FroalaEditor = dynamic(
    async () => {
        const values = await Promise.all([
            import('react-froala-wysiwyg'),
            import('froala-editor/js/plugins.pkgd.min'),
            import('froala-editor/js/froala_editor.min'),
            import('froala-editor/js/froala_editor.pkgd.min'),
        ])
        return values[0]
    },
    {
        loading: () => <p>LOADING!!!</p>,
        ssr: false,
    }
)

const useStyles = makeStyles(theme => ({

    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: theme.spacing(2)
    },
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    },
    sliderIDText: {
        marginTop: '-20px'
    },
    disableEvent: {
        pointerEvents: "none",
        opacity: 0.5
    }
}));

const ColorlibConnector =  withStyles({
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
})(StepConnector);

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
        backgroundColor: COLORS?.primary,
        color: '#fff',
    },
}));

const getSectionStepsIcons = (type, isActive, isCompleted, step) => {
    const icon_classes = useColorStepIconStyle()
    let icons = {}
    switch (type) {
        case 'fullcol':
            icons = {
                0: <CategoryIcon className={icon_classes.iconSize} />,
                1: <CreateIcon className={icon_classes.iconSize} />,
            }
            break
        case 'twocol':
            icons = {
                0: <CategoryIcon className={icon_classes.iconSize} />,
                1: <CreateIcon className={icon_classes.iconSize} />,
                2: <CreateIcon className={icon_classes.iconSize} />,
            }
            break
        case 'threecol':
            icons = {
                0: <CategoryIcon className={icon_classes.iconSize} />,
                1: <CreateIcon className={icon_classes.iconSize} />,
                2: <CreateIcon className={icon_classes.iconSize} />,
                3: <CreateIcon className={icon_classes.iconSize} />,
            }
            break
        default:
            icons = {
                0: <CategoryIcon className={icon_classes.iconSize} />,
                1: <CreateIcon className={icon_classes.iconSize} />,
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

const getSectionSteps = (sectionType) => {
    switch (sectionType) {
        case 'fullcol': return ['Type', 'Add Sub Section']
        case 'twocol': return ['Type', 'Add Sub Section', 'Add Sub Section']
        case 'threecol': return ['Type', 'Add Sub Section', 'Add Sub Section', 'Add Sub Section']
    }
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

const SubSection = (props) => {

    const { sectionType, subSections, handleSubSection, activeStep, component, state } = props;
    const [ sectionComponentType, setSectionComponentType ] = component ? useState(component.type) : useState('');
    const [ sectionComponentWidth, setSectionComponentWidth ] = (component) ? useState(component.width) : useState(0);
    const [ sectionComponent, setSectionComponent ] = component ? useState(component) : useState({});
    const [isSliderDisable, setSliderDisable] = useState(false);
    const [consumeWidth, setConsumeWidth] = (component) ? useState(component.width) : useState(0);
    const [subSectionOptions, setSubsectionOptions] = useState([]);
    const steps = getSectionSteps(sectionType);

    const classes = useStyles();

    useEffect(() => {
        switch (state?.type) {
            case 'webPage':
                if (sectionType === 'fullcol') {
                    setSubsectionOptions([{
                        value: 'video',
                        label: 'Video'
                    }, {
                        value: 'slider',
                        label: 'Slider'
                    }, {
                        value: 'sliderOnly',
                        label: 'SliderOnly'
                    }, {
                        value: 'slider-gallery',
                        label: 'Slider Gallery'
                    }, {
                        value: 'card-slider',
                        label: 'Card Slider'
                    }, {
                        value: 'image',
                        label: 'Image'
                    }, {
                        value: 'paragraph',
                        label: 'Text'
                    }, {
                        value: 'widgetbooking',
                        label: 'Booking Engine'
                    }, {
                        value: 'contactForm',
                        label: 'Contact Form'
                    }, {
                        value: 'map',
                        label: 'Map'
                    }]);
                } else {
                    setSubsectionOptions([{
                        value: 'sliderOnly',
                        label: 'SliderOnly'
                    }, {
                        value: 'image',
                        label: 'Image'
                    }, {
                        value: 'paragraph',
                        label: 'Text'
                    }, {
                        value: 'contactForm',
                        label: 'Contact Form'
                    }, {
                        value: 'map',
                        label: 'Map'
                    }]);
                }
                break
            case 'email':
                setSubsectionOptions([ {
                    value: 'image',
                    label: 'Image'
                }, {
                    value: 'paragraph',
                    label: 'Text'
                }]);
                break
            case 'emailOnly':
                setSubsectionOptions([ {
                    value: 'image',
                    label: 'Image'
                }, {
                    value: 'paragraph',
                    label: 'Text'
                }]);
                break
            default:
                setSubsectionOptions([])
        }
    }, [state?.type, sectionType]);

    useEffect(() => {
        if (!component) {
            if (state.type === 'webPage') {
                if (sectionType === 'fullcol') {
                    setSectionComponentType('video');
                } else {
                    setSectionComponentType('sliderOnly');
                }
            }
            if (state.type === 'email' || state.type === 'emailOnly') {
                setSectionComponentType('image');
            }
        }
    }, [sectionType]);

    useEffect(() => {
        (activeStep === steps.length - 1) ? setSliderDisable(true) : setSliderDisable(false);
        if(sectionType === 'fullcol') {
            setSectionComponentWidth(200);
            setConsumeWidth(100)
        }
        if(sectionType === 'twocol') {
            if(activeStep === steps.length - 2) setSectionComponentWidth(50);
            if(activeStep === steps.length - 1) setSectionComponentWidth(100);
        }
        if(sectionType === 'threecol') {
            if(activeStep === steps.length - 3) setSectionComponentWidth(30);
            if(activeStep === steps.length - 2) setSectionComponentWidth(60);
            if(activeStep === steps.length - 1) setSectionComponentWidth(100);
        }
    }, [sectionType, activeStep]);

    useEffect(() => {
        if(subSections.length > 0) {
            let totalConsumeWidth = 0;
            subSections.map((element, index) => {
                if(element?.width && index !== activeStep - 1) {
                    totalConsumeWidth += element.width;
                    setConsumeWidth(totalConsumeWidth);
                }
            });
        }
    }, [subSections, activeStep]);

    useEffect(() => {
        if(sectionComponentType && sectionComponent)
            handleSubSection(sectionComponent);
    }, [ sectionComponent, sectionComponentType]);

    const handleSectionComponent = (component) => {
        const updatedSectionComponent = component;
        updatedSectionComponent.width = sectionComponentWidth - consumeWidth
        updatedSectionComponent.id = `item-${subSections.length + 1}`;
        setSectionComponent(updatedSectionComponent);
    }

    const handleChange = (e, value) => {
        if(value >= consumeWidth+10) {
            setSectionComponentWidth(value);
            const updatedSectionComponent = {...sectionComponent};
            updatedSectionComponent.width = value - consumeWidth;
            setSectionComponent(updatedSectionComponent);
            handleSubSection(updatedSectionComponent);
        }
    }

    const handleNextDisable = (isProceed) => {
        props.handleNextDisable(isProceed);
    }

    const handleSectionComponentType = (e) => {
        setSectionComponentType(e.target.value);
        if(e.target.value === 'widgetbooking') {
            setSectionComponent({
                service: 'hcmwidgetbooking',
                type: 'widgetbooking',
                width: sectionComponentWidth - consumeWidth,
                id: `item-${subSections.length + 1}`
            });
            props.handleNextDisable(false);
        }
        if(e.target.value === 'map') {
            setSectionComponent({
                service: 'map',
                type: 'map',
                width: sectionComponentWidth - consumeWidth,
                id: `item-${subSections.length + 1}`
            });
            props.handleNextDisable(false);
        }
    }

    return(
        <Container>
            <CustomSlider
                marks={marks}
                value={isSliderDisable ? consumeWidth : sectionComponentWidth}
                onChange={handleChange}
                className={isSliderDisable ? classes.disableEvent : ''}
            />
            <FormControl component="fieldset" size={'small'} variant="outlined">
                {
                    subSectionOptions?.length > 0 && <Select
                        value={sectionComponentType}
                        onChange={handleSectionComponentType}
                    >
                        {subSectionOptions.map((option, index) => {
                            return (
                                <MenuItem value={option.value} key={index}>
                                    {option.label}
                                </MenuItem>
                            )
                        })}
                    </Select>
                }
            </FormControl>
            <hr />
            {
                sectionType === 'fullcol' && sectionComponentType === 'slider' &&
                <AddSlider sectionType={sectionType} handleSectionComponent={handleSectionComponent} handleNextDisable={handleNextDisable} />
            }
            {
                sectionComponentType === 'sliderOnly' &&
                <AddSliderOnly handleSectionComponent={handleSectionComponent} handleNextDisable={handleNextDisable} component={sectionComponent} />
            }
            {
                sectionComponentType === 'slider-gallery' &&
                <AddSliderGallery handleSectionComponent={handleSectionComponent} />
            }
            {
                sectionComponentType === 'card-slider' &&
                <AddCardSlider handleSectionComponent={handleSectionComponent} />
            }
            {
                sectionComponentType === 'image' &&
                <UploadImage handleSectionComponent={handleSectionComponent} handleNextDisable={handleNextDisable} component={sectionComponent}/>
            }
            {
                sectionComponentType === 'paragraph' &&
                <AddParagraph handleSectionComponent={handleSectionComponent} handleNextDisable={handleNextDisable} component={sectionComponent}/>
            }
            {
                sectionComponentType === 'widgetbooking' &&
                <Typography component={'div'} style={{pointerEvents: 'none'}}>
                    <WidgetBooking/>
                </Typography>
            }
            {
                sectionComponentType === 'contactForm' &&
                <AddContactForm handleSectionComponent={handleSectionComponent} handleNextDisable={handleNextDisable}/>
            }
            {
                sectionComponentType === 'map' && <WrappedMap
                    googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API_KEY}`}
                    loadingElement={<div style={{ height: `100%` }} />}
                    containerElement={<div style={{ height: `350px`, borderRadius: 10 }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                />
            }
            {
                sectionComponentType === 'video' && <AddVideo handleSectionComponent={handleSectionComponent} />
            }
        </Container>
    )
}

const Section = (props) => {

    const {
        onAddSection,
        state,
    } = props;

    const classes = useStyles();
    const [ activeStep, setActiveStep] = useState(0);
    const [ sectionType, setSectionType ] = useState('fullcol');
    const [steps, setSteps] = useState([]);
    const [sectionComponents, setSectionComponents] = useState([]);
    const [subSections, setSubSections] = useState([]);
    const [subSection, setSubsection] = useState({});
    const [sectionIDExist, setSectionIDExist] = useState(false);
    const [isNextDisabled, setIsNextDisable] = useState(true);
    const [sectionID, setSectionID] = useState('');
    const [localState, setLocalState] = useState({
        hasSectionTitle: false,
        sectionTitle: '',
    });
    const [sectionOrder, setSectionOrder] = useState(1);
    const { hasSectionTitle, sectionTitle } = localState;
    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const router = useRouter();
    const companyId = router.query.companyID;
    const authToken = token || router.query.authToken;
    const sectionTypes = [{
        label: 'Full Section',
        value: 'fullcol'
    }, {
        label: '2 Column Section',
        value: 'twocol'
    }, {
        label: '3 Column Section',
        value: 'threecol'
    }]

    const config = froalaConfig;

    useEffect(() => {
        const components = [];
        for (let i = 0; i < steps.length - 1; i++) {
            components[i] = <SubSection key={i}
                                        handleSubSection={handleSubSection}
                                        subSections={subSections}
                                        activeStep={activeStep}
                                        sectionType={sectionType}
                                        component={subSections[i]}
                                        handleNextDisable={handleNextDisable}
                                        state={state}
            />
        }
        setSectionComponents(components);
    }, [sectionType, subSections, activeStep, subSection]);

    useEffect(() => {
        if (activeStep === steps.length - 1 && subSections.length > 0) {
            const sectionState = {
                id: sectionID.toLowerCase(),
                type: sectionType,
                title: sectionTitle,
                items: subSections
            };
            onAddSection(sectionState, sectionOrder);
        }
    }, [activeStep, subSections]);

    useEffect(() => {
        let temp_subSections = [...subSections];
        if (subSection.width) steps[activeStep] = 'Add SubSection ('+subSection.width+'%)';
        if (activeStep === steps.length - 1) {
            if (subSection) {
                if (Object.keys(subSection).length > 0) {
                    temp_subSections[activeStep - 1] = {...subSection}
                }
            }
            setSubSections(temp_subSections);
        }
    }, [subSection]);

    useEffect(() => {
        setSteps(getSectionSteps(sectionType));
    },[sectionType]);

    useEffect(() => {
        if (state?.type === 'webPage') {
            setSectionOrder(state?.page?.sections?.length + 1);
        }
        if (state?.type === 'email' || state?.type === 'emailOnly') {
            setSectionOrder(state?.email?.body?.length + 1);
        }
    }, [state.type]);

    const handleSubSection = (sub_Section) => {
        setSubsection(sub_Section);
    }

    const handleNextDisable = (isProceed) => {
        setIsNextDisable(isProceed);
    }

    const handleSaveComponent = () => {
        if(subSection.type === 'paragraph') {
            Insert({ // insert paragraph into hcmitemtxt
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMTXT,
                token: authToken,
                data: {
                    itemid: state.hcmItemId,
                    hotelrefno: Number(companyId)
                },
            }).then(res => {
                if(res.status === 200 && res.data.data) {
                    Insert({ // insert textpar
                        apiUrl: GENERAL_SETTINGS.OREST_URL,
                        endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                        token: authToken,
                        data: {
                            itemid: res.data.data.id,
                            itemtext: subSection.service,
                            hotelrefno: Number(companyId)
                        },
                    }).then(res1 => {
                        if (res1.status === 200 && res1.data.data) {
                            handleNextSection({
                                service: "hcmitemtxtpar",
                                type: "paragraph",
                                gid: res1.data.data.gid,
                                width: subSection.width,
                                id: `item-${subSections.length + 1}`,
                                useBgColor: subSection?.useBgColor
                            });
                        }
                    })
                }
            });
        } else {
            handleNextSection(subSection);
        }
    }

    const handleNextSection = (component) => {
        let temp_subSections = [...subSections];
        if (activeStep !== 0) {
            setActiveStep(previousStep => previousStep + 1);
            if (component && Object.keys(component).length > 0) {
                temp_subSections[activeStep - 1] = component
            } else {
                if (subSection && Object.keys(subSection).length > 0) {
                    temp_subSections[activeStep - 1] = {...subSection}
                }
            }
            setSubSections(temp_subSections);
            steps[activeStep] = 'Add SubSection (' + subSection.width + '%)';
            setSubsection({});
            setIsNextDisable(true);
        } else {
            setActiveStep(previousStep => previousStep + 1);
            setIsNextDisable(true);
        }
    }

    const handleBackSection = () => {
        if (activeStep - 1 === 0) {
            setActiveStep(previousStep => previousStep - 1);
            setIsNextDisable(false);
        } else {
            let temp_subSections = [...subSections];
            if (activeStep !== 0) {
                temp_subSections[activeStep - 1] = {...subSection};
                setSubsection({});
                setSubSections(temp_subSections);
                setIsNextDisable(false);
            }
            setActiveStep(previousStep => previousStep - 1);
        }
    }

    const handleSectionID = (event) => {
        if (state.type ==='webPage') {
            if(state?.page?.sections?.length) {
                state.page.sections.map(page => {
                    if(page.id === event.target.value) {
                        setSectionID(event.target.value);
                        setSectionIDExist(true);
                        setIsNextDisable(true);
                        return
                    } else {
                        setSectionID(event.target.value);
                        setSectionIDExist(false);
                        setIsNextDisable(!event.target.value);
                    }
                });
            } else {
                setSectionID(event.target.value);
                setSectionIDExist(false);
                setIsNextDisable(!event.target.value);
            }
        }
        if (state.type === 'email' || state.type === 'emailOnly') {
            if (state?.email?.body?.length) {
                state.email.body.map(body => {
                    if(body.id === event.target.value) {
                        setSectionID(event.target.value);
                        setSectionIDExist(true);
                        setIsNextDisable(true);
                        return
                    } else {
                        setSectionID(event.target.value);
                        setSectionIDExist(false);
                        setIsNextDisable(!event.target.value);
                    }
                });
            } else {
                setSectionID(event.target.value);
                setSectionIDExist(false);
                setIsNextDisable(!event.target.value);
            }
        }
    }


    return (
        <React.Fragment>
            <Stepper activeStep={activeStep} alternativeLabel
                     connector={<ColorlibConnector />}>
                {steps.map((label, index) => {
                    return (
                        <Step key={`step-${index}`}>
                            <StepLabel color="secondary"
                                       StepIconComponent={() => getSectionStepsIcons(sectionType, (activeStep === index), (activeStep > index), index)}
                            >{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            <Container>
                {
                    activeStep === 0 && (
                        <>
                            <Grid container={true} spacing={1} >
                                <Grid item={true} xs={2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                size={'small'}
                                                checked={hasSectionTitle}
                                                onChange={() => setLocalState(prev => ({...prev, hasSectionTitle: !hasSectionTitle,
                                                    sectionTitle: !hasSectionTitle ? sectionTitle : ''}))}
                                                name="title"
                                                color="primary"
                                            />
                                        }
                                        label="Add Title"
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <FormControl fullWidth component="fieldset" size={'small'} variant="outlined">
                                        {
                                            sectionTypes?.length > 0 && <Select
                                                value={sectionType}
                                                onChange={(e) => {
                                                    setSectionType(e.target.value);
                                                    setSubSections([]);
                                                    setIsNextDisable(true);
                                                    setSectionID('');
                                                }}
                                            >
                                                {sectionTypes.map((option, index) => {
                                                    return (
                                                        <MenuItem value={option.value} key={index}>
                                                            {option.label}
                                                        </MenuItem>
                                                    )
                                                })}
                                            </Select>
                                        }
                                    </FormControl>
                                </Grid>
                                <Grid item xs={3}>
                                    <FormControl fullWidth component={'fieldset'}>
                                        <TextField label="Section ID *"
                                                   error={sectionIDExist}
                                                   helperText={sectionIDExist ? "Already Exist" : ""}
                                                   onChange={handleSectionID}
                                                   value={sectionID}
                                                   size={'small'}
                                                   variant={'outlined'}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={2}>
                                    <FormControl fullWidth component={'fieldset'}>
                                        <TextField label="Order"
                                                   inputProps={{ min: 1, max: state.type ==='webPage' ? state?.page?.sections?.length + 1 : state?.email?.body?.length + 1}}
                                                   onChange={(e) => setSectionOrder(e.target.value)}
                                                   value={sectionOrder}
                                                   size={'small'}
                                                   variant={'outlined'}
                                                   type={'number'}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            {
                                hasSectionTitle &&
                                <Grid container={true}>
                                    <Grid item={true} xs={12}>
                                        <FroalaEditor tag="textarea"
                                                      config={config}
                                                      model={sectionTitle}
                                                      onModelChange={(model) => setLocalState(prevState => ({
                                                          ...prevState,
                                                          sectionTitle: model
                                                      }))}/>
                                    </Grid>
                                </Grid>
                            }
                        </>
                    )
                }
                {
                    sectionComponents.map((value, index) => {
                        return (index === activeStep - 1) ? value : null;
                    })
                }
                <Grid container direction="row" justify="flex-start" alignItems="flex-start">
                    <div className={classes.actionButtons}>
                        {/*{*/}
                        {/*    activeStep !== 0 &&*/}
                        {/*    <Button*/}
                        {/*        onClick={handleBackSection}*/}
                        {/*        variant="contained"*/}
                        {/*        size="small"*/}
                        {/*        aria-label="add"*/}
                        {/*        className={classes.actionButton}*/}
                        {/*    >*/}
                        {/*        BACK*/}
                        {/*    </Button>*/}
                        {/*}*/}
                        {
                            activeStep !== steps.length - 1 &&
                            <Button
                                onClick={handleSaveComponent}
                                variant="contained"
                                size="small"
                                color="primary"
                                aria-label="add"
                                className={classes.actionButton}
                                disabled={isNextDisabled}
                            >
                                NEXT
                            </Button>
                        }
                    </div>
                </Grid>
            </Container>
        </React.Fragment>
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
)(Section)
