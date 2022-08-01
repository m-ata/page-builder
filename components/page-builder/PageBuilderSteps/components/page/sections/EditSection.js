import React, { useContext, useEffect, useState } from 'react';
//material imports
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import TextField from "@material-ui/core/TextField";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import StepConnector from '@material-ui/core/StepConnector';
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Slider from '@material-ui/core/Slider';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import CategoryIcon from '@material-ui/icons/Category';
import CreateIcon from '@material-ui/icons/Create';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from "@material-ui/core/Typography";
//import toast
import { toast } from "react-toastify";
//custom imports
import EditSlider from "./slider/EditSlider";
import EditImage from "./image/EditImage";
import EditParagraph from "./paragraph/EditParagrapgh";
import WidgetBooking from "components/ibe/widget/booking";
import EditContactForm from "./contact-form/EditContactForm";
import EditSliderOnly from './slider-only/EditSectionOnly';
import Alert from "./AlertDialog";
import EditSliderGallery from "./slider-gallery/EditSliderGallery";
import WrappedMap from "./map/Map";
//redux import
import { connect } from 'react-redux';
import { setToState } from "../../../../../../state/actions";
//integration related imports
import axios from "axios";
import WebCmsGlobal from "../../../../../webcms-global";
import {
    isErrorMsg,
    OREST_ENDPOINT,
    REQUEST_METHOD_CONST
} from "../../../../../../model/orest/constants";
import { Delete, Insert, Patch, UseOrest, ViewList } from "@webcms/orest";
import {COLORS, DELETE_SUCCESS, froalaConfig} from "../../../constants";
import { useRouter } from "next/router";
import clsx from "clsx";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
//Froala editor improts
import dynamic from 'next/dynamic';
import EditCardSlider from "./card-type-slider/EditCardSlider";
import EditVideo from './video/EditVideo';
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

const useStyle = makeStyles(theme => ({
    disableSlider: {
        pointerEvents: "none",
        opacity: 0.5
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: theme.spacing(2)
    },
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    },
}))

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
            backgroundColor: COLORS.primary,
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
        backgroundColor: COLORS?.secondary,
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

const marks = [{ value: 0, label: '0' }, { value: 10, label: '10%' }, { value: 20, label: '20%' }, { value: 30, label: '30%' },
{ value: 40, label: '40%' }, { value: 50, label: '50%' }, { value: 60, label: '60' }, { value: 70, label: '70%' },
{ value: 80, label: '80%' }, { value: 90, label: '90%' }, { value: 100, label: '100%' },];

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
})(Slider);

const EditSection = (props) => {

    const {
        dialogTitle,
        section,
        isDialogOpen,
        state,
        onEditSection,
        resetRender,
        setToState,
        otherLangSection
    } = props;

    const [openModal, setOpenModal] = useState(isDialogOpen);
    const [activeStep, setActiveStep] = useState(0);
    const [sectionType, setSectionType] = useState(section.type);
    const [alertType, setAlertType] = useState('');
    const [steps, setSteps] = useState([]);
    const [consumeWidth, setConsumeWidth] = useState(0);
    const [editedSection, setEditedSection] = useState(section);
    const [isAlertDialog, setAlertDialog] = useState(false);
    const [tmp_sectionType, setTempSectionType] = useState('');
    const [isSave, setSave] = useState(false);
    const [components, setComponents] = useState(section.items);
    const [sectionID, setSectionID] = useState(section.id);
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [newComponent, setNewComponent] = useState(null);
    const [isNextDisable, setNextDisable] = useState(false);
    const [subSectionOptions, setSubsectionOptions] = useState([]);
    const [hasSectionTitle, setHasSectionTitle] = useState(false);
    const [sectionTitle, setSectionTitle] = useState('');
    let index = state.page.sections.indexOf(editedSection);
    const sectionTypes = [{
        label: 'Full Section',
        value: 'fullcol'
    }, {
        label: '2 Column Section',
        value: 'twocol'
    }, {
        label: '3 Column Section',
        value: 'threecol'
    }];
    const [sectionOrder, setSectionOrder] = useState(index + 1 || 1);

    const router = useRouter();
    const companyId = router.query.companyID;
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    const classes = useStyle();

    const config = froalaConfig;

    useEffect(() => {
        if (section?.title) {
            setHasSectionTitle(true);
            state?.langCode === state?.defaultLang ? setSectionTitle(section.title) : setSectionTitle(otherLangSection?.title);
        }
    }, [section]);

    useEffect(() => {
        if (sectionType === 'fullcol') {
            setSteps(['Type', `Sub Section 1 (${editedSection?.items[0]?.width}%)`]);
        } else if (sectionType === 'twocol') {
            setSteps(['Type', `Sub Section 1 (${editedSection?.items[0]?.width}%)`, `Sub Section 2 (${editedSection?.items[1]?.width}%)`]);
        } else {
            setSteps(['Type', `Sub Section 1 (${editedSection?.items[0]?.width}%)`, `Sub Section 2 (${editedSection?.items[1]?.width}%)`, `Sub Section 3 (${editedSection?.items[2]?.width}%)`]);
        }
    }, [sectionType]);

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
                    },{
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
        handleNextComponentWidth();
    }, [editedSection, activeStep]);

    const handleComponents = (data) => {
        const updatedComponents = [...components];
        updatedComponents[activeStep - 1] = data;
        setComponents(updatedComponents);
    }

    const handleDisable = (isDisable) => {
        setNextDisable(isDisable);
    }

    const setModalType = (component, index) => {
        switch (component.type) {
            case 'video': 
                return <EditVideo handleCmponent={handleComponents} videoComponent={component} />
            case 'slider':
                return (
                    state.langCode === state.defaultLang ? <EditSlider
                        sliderComponent={component}
                        handleDisable={handleDisable}
                        sectionID={sectionID}
                        handleCmponent={handleComponents}
                    /> : <EditSlider
                            sliderComponent={component}
                            handleDisable={handleDisable}
                            sectionID={sectionID}
                            otherLangSlider={otherLangSection.subItems[index]}
                            handleCmponent={handleComponents}
                        />
                )
            case 'card-slider' :
                return state.langCode === state.defaultLang ?
                    <EditCardSlider cardSlider={component}
                                    handleCmponent={handleComponents} /> :
                    <EditCardSlider cardSlider={component}
                                    handleCmponent={handleComponents}
                                    langCardSlider={otherLangSection.subItems[index]} />
            case 'slider-gallery':
                return state.langCode === state.defaultLang ?
                    <EditSliderGallery sliderGallery={component}
                                       handleCmponent={handleComponents} /> :
                    <EditSliderGallery sliderGallery={component}
                                       langSliderGallery={otherLangSection.subItems[index]}
                                       handleCmponent={handleComponents}
                    />
            case 'sliderOnly':
                return (
                    <EditSliderOnly
                        sliderOnlyCmp={component}
                        handleComponent={handleComponents}
                        langCode={state.langCode}
                        defaultCode={state.defaultLang}
                    />
                )
            case 'image':
                return (
                    state.langCode === state.defaultLang ? <EditImage
                        imageComponent={component}
                        handleCmponent={handleComponents}
                        handleDisable={handleDisable}
                    /> : <EditImage
                            imageComponent={component}
                            handleCmponent={handleComponents}
                            otherLangImage={otherLangSection.subItems[index]}
                            handleDisable={handleDisable}
                        />
                )
            case 'paragraph':
                return (
                    state.langCode === state.defaultLang ? <EditParagraph
                        paragraphComponent={component}
                        handleCmponent={handleComponents}
                        handleDisable={handleDisable}
                    /> : <EditParagraph
                            paragraphComponent={component}
                            handleCmponent={handleComponents}
                            otherLangParagraph={otherLangSection.subItems[index]}
                            handleDisable={handleDisable}
                        />
                )
            case 'widgetbooking':
                return <Typography component={'div'} style={{pointerEvents: 'none'}}>
                    <WidgetBooking/>
                </Typography>
            case 'contactForm':
                return (
                    state.langCode === state.defaultLang ? <EditContactForm
                        handleComponent={handleComponents}
                        contactFormComponent={component}
                    /> : <EditContactForm
                            handleComponent={handleComponents}
                            contactFormComponent={component}
                            otherLangContactForm={otherLangSection.subItems[index]}
                        />
                )
            case 'map':
                return <WrappedMap handleCmponent={handleComponents}
                                   langCode={state.langCode}
                                   defaultCode={state.defaultLang}
                                   googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API_KEY}`}
                                   loadingElement={<div style={{height: `100%`}}/>}
                                   containerElement={<div style={{height: `350px`, borderRadius: 10}}/>}
                                   mapElement={<div style={{height: `100%`}}/>}
                />
        }
    }

    const handleCancel = () => {
        setOpenModal(false);
        resetRender();
    }

    const handleApply = () => {
        if (isSave) {
            const newSection = {
                id: sectionID.toLowerCase(),
                type: sectionType,
                title: sectionTitle,
                items: components
            }
            onEditSection(newSection, index, sectionOrder);
            resetRender();
            setOpenModal(false);
        }
    }

    const handleNextSection = () => {

        if (activeStep === steps.length - 1) {
            setSave(true);
            state.langCode === state.defaultLang && components.map(component => {
                if (component.type === 'paragraph') {
                    if (component.gid) {
                        ViewList({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                            token: authToken,
                            params: {
                                query: `gid:${component.gid}`,
                                hotelrefno:  Number(companyId)
                            }
                        }).then(res => {
                            if (res.status === 200 && res?.data?.data?.length) {
                                Patch({ // update into rafile
                                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                                    endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                                    token: authToken,
                                    gid: component.gid,
                                    params: {
                                        hotelrefno: Number(companyId)
                                    },
                                    data: {
                                        itemid: res.data.data[0]?.itemid,
                                        itemtext: component.service,
                                    },
                                }).then(res1 => {
                                    if (res1.status === 200 && res1.data.data) {
                                        component.service = 'hcmitemtxtpar'
                                    } else {
                                        const retErr = isErrorMsg(res1);
                                        toast.error(retErr.errorMsg, {
                                            position: toast.POSITION.TOP_RIGHT
                                        });
                                    }
                                })
                            } else {
                                const retErr = isErrorMsg(res);
                                toast.error(retErr.errorMsg, {
                                    position: toast.POSITION.TOP_RIGHT
                                });
                            }
                        })
                    } else {
                        Insert({ // insert paragraph into hcmitemtxt
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.HCMITEMTXT,
                            token: authToken,
                            data: {
                                itemid: state.hcmItemId,
                                hotelrefno: Number(companyId)
                            },
                        }).then(res => {
                            if (res.status === 200 && res.data.data) {
                                Insert({ // insert textpar
                                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                                    endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                                    token: authToken,
                                    data: {
                                        itemid: res.data.data.id,
                                        itemtext: component.service,
                                        hotelrefno: Number(companyId)
                                    },
                                }).then(res1 => {
                                    if (res1.status === 200 && res1.data.data) {
                                        component.service = 'hcmitemtxtpar';
                                        component.gid = res1.data.data.gid;
                                    }
                                })
                            }
                        });
                    }
                }
            })
        } else {
            setActiveStep(previousStep => previousStep + 1);
        }
    }

    const handleBackSection = () => {
        setActiveStep(previousStep => previousStep - 1);
    }

    const handleNextComponentWidth = () => {
        let totalConsumeWidth = 0;
        editedSection.items.map((component, index) => {
            if (index <= activeStep - 1) {
                totalConsumeWidth += component.width;
            }
        })
        setConsumeWidth(totalConsumeWidth);
    }

    const handleComponentWidthChange = (e, value) => {
        setConsumeWidth(value);
    }

    const handleSectionType = (event) => {
        setAlertType('section');
        setAlertDialog(true);
        setTempSectionType(event.target.value);
    }

    const handleComponentType = (event, component) => {
        if (section.type !== sectionType) {
            const updatedSections = state.page.sections;
            const componentIndex = updatedSections[index].items.indexOf(component);
            component.service = handleComponentService(event.target.value);
            component.type = event.target.value;
            if (event.target.value === 'contactForm') {
                component.gid = [
                    {
                        id: 'label-1',
                        type: 'refcode',
                        label: 'Type',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-2',
                        type: 'company',
                        label: 'Company Name',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-3',
                        type: 'firstname',
                        label: 'First Name',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-4',
                        type: 'lastname',
                        label: 'Last Name',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-5',
                        type: 'workemail',
                        label: 'Email',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-6',
                        type: 'mobiletel',
                        label: 'Phone',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-7',
                        type: 'salesnote',
                        label: 'Message',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-8',
                        type: 'recaptcha',
                        label: '',
                        isActive: true,
                        isEditMode: false
                    }
                ]
            }
            updatedSections[index].items[componentIndex] = component;
            setEditedSection(updatedSections[index]);
            setToState('pageBuilder', ['page', 'sections'], updatedSections);
        } else {
            setAlertType('component');
            setAlertDialog(true);
            setSelectedComponent(component);
            handleNewComponent(event.target.value, component);
        }
    }

    const handleComponentService = (componentType) => {
        let type = '';
        switch (componentType) {
            case 'slider':
                type = 'hcmitemsld';
                break;
            case 'sliderOnly':
                type = 'eventloc';
                break
            case 'image':
                type = 'hcmitemimg';
                break;
            case 'widgetbooking':
                type = 'widgetbooking';
                break;
            case 'paragraph':
                type = 'hcmitemtxtpar';
                break;
            case 'contactForm':
                type = 'pbook';
                break;
            case 'map':
                type = 'map';
                break;
            default:
                type = ''
        }
        return type;
    }

    const handleNewComponent = (componenttype, component) => {
        if (componenttype === 'slider') {
            setNewComponent({
                gid: '',
                service: 'hcmitemsld',
                type: componenttype,
                width: component.width
            })
        }
        if (componenttype === 'slider-gallery') {
            setNewComponent({
                gid: '',
                service: 'hcmitemsld',
                type: componenttype,
                width: component.width
            })
        }
        if (componenttype === 'sliderOnly') {
            setNewComponent({
                masterid: '',
                service: 'eventloc',
                type: componenttype,
                width: component.width
            })
        }
        if (componenttype === 'image') {
            setNewComponent({
                gid: '',
                service: 'hcmitemimg',
                type: componenttype,
                width: component.width
            });
        }
        if (componenttype === 'paragraph') {
            setNewComponent({
                gid: '',
                service: 'hcmitemtxtpar',
                type: componenttype,
                width: component.width
            })
        }
        if (componenttype === 'widgetbooking') {
            setNewComponent({
                service: 'hcmwidgetbooking',
                type: 'widgetbooking',
                width: component.width
            });
        }
        if (componenttype === 'contactForm') {
            setNewComponent({
                service: 'pbook',
                type: 'contactForm',
                width: component.width,
                gid: [
                    {
                        id: 'label-1',
                        type: 'refcode',
                        label: 'Type',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-2',
                        type: 'company',
                        label: 'Company Name',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-3',
                        type: 'firstname',
                        label: 'First Name',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-4',
                        type: 'lastname',
                        label: 'Last Name',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-5',
                        type: 'workemail',
                        label: 'Email',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-6',
                        type: 'mobiletel',
                        label: 'Phone',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-7',
                        type: 'salesnote',
                        label: 'Message',
                        isActive: true,
                        isEditMode: false
                    }, {
                        id: 'label-8',
                        type: 'recaptcha',
                        label: '',
                        isActive: true,
                        isEditMode: false
                    }
                ]
            });
        }
        if (componenttype === 'map') {
            setNewComponent({
                service: 'map',
                type: 'map',
                width: component.width
            });
        }
    }

    const handleAlertActionChange = (isDelete) => {
        if (isDelete) {
            if (alertType === 'section') {
                handleDeleteSection();
            }
            if (alertType === 'component') {
                handleComponentDelete();
            }
        }
        setAlertDialog(false);
    }

    const handleDeleteSection = async () => {
        const selectedSection = state.page.sections[index]
        let req = []
        for (let component of selectedSection.items) {
            if (component.type === 'slider' || component.type === 'slider-gallery') {
                const REQUEST_OPTIONS_VIEWLIST_HCMITEMSLD = {
                    url: GENERAL_SETTINGS.OREST_URL + '/hcmitemsld/view/list',
                    method: 'get',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        query: `gid:${component.gid}`,
                        hotelrefno: Number(companyId),
                    },
                }
                const slider = await deleteSlider(REQUEST_OPTIONS_VIEWLIST_HCMITEMSLD, component.gid)
                req.push(slider)
            }
            if (component.type === 'image') {
                const REQUEST_OPTIONS_DELETE_HCMITEMIMG = {
                    url:
                        GENERAL_SETTINGS.OREST_URL +
                        OREST_ENDPOINT.SLASH +
                        OREST_ENDPOINT.HCMITEMIMG +
                        OREST_ENDPOINT.SLASH +
                        'del/' +
                        component.gid,
                    method: REQUEST_METHOD_CONST.DELETE,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        hotelrefno: Number(companyId),
                    },
                }
                const image = await deleteImage(REQUEST_OPTIONS_DELETE_HCMITEMIMG)
                req.push(image)
            }
            if (component.type === 'paragraph') {
                const REQUEST_OPTIONS_DELETE_HCMITEMTXTPAR = {
                    url:
                        GENERAL_SETTINGS.OREST_URL +
                        OREST_ENDPOINT.SLASH +
                        OREST_ENDPOINT.HCMITEMTXTPAR +
                        OREST_ENDPOINT.SLASH +
                        'del/' +
                        component.gid,
                    method: REQUEST_METHOD_CONST.DELETE,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        hotelrefno: Number(companyId),
                    },
                }
                const paragrapgh = await deleteParagraph(REQUEST_OPTIONS_DELETE_HCMITEMTXTPAR)
                req.push(paragrapgh)
            }
            if (component.type === 'widgetbooking') {
                const booking = await deleteReadyUsedComponent();
                req.push(booking);
            }
            if (component.type === 'contactForm') {
                const contact = await deleteReadyUsedComponent();
                req.push(contact);
            }
            if (component.type === 'map') {
                const map = await deleteReadyUsedComponent();
                req.push(map);
            }
            if (component.type === 'sliderOnly') {
                const sliderOnly = await deleteReadyUsedComponent();
                req.push(sliderOnly);
            }
        }
        await Promise.all(req).then(async (res) => {
            let isSuccess = true
            await res.map((r) => {
                if (r.status !== 200) {
                    isSuccess = false
                }
            })
            if (isSuccess) {
                setSectionType(tmp_sectionType);
                handleResetSection();
                toast.success(DELETE_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT,
                })
            } else {
                toast.error('Something went wrong', {
                    position: toast.POSITION.TOP_RIGHT,
                })
            }
        })
    }

    const handleResetSection = () => {

        const index = state.page.sections.indexOf(section);
        const updateSections = state.page.sections;
        let newSection = {};
        let initialComponents = []
        switch (tmp_sectionType) {
            case 'fullcol':
                initialComponents = [{
                    id: 'item-1',
                    service: 'hcmitemsld',
                    type: 'slider',
                    gid: '',
                    width: 100
                }]
                newSection = {
                    id: section.id,
                    type: tmp_sectionType,
                    items: initialComponents
                }
                break;
            case 'twocol':
                [50, 50].map((value, i) => {
                    initialComponents.push({
                        id: 'item-' + (i + 1),
                        service: 'hcmitemimg',
                        type: 'image',
                        gid: '',
                        width: value
                    });
                })
                newSection = {
                    id: section.id,
                    type: tmp_sectionType,
                    items: initialComponents
                }
                break;
            case 'threecol':
                [30, 30, 40].map((value, i) => {
                    initialComponents.push({
                        id: 'item-' + (i + 1),
                        service: 'hcmitemimg',
                        type: 'image',
                        gid: '',
                        width: value
                    });
                })
                newSection = {
                    id: section.id,
                    type: tmp_sectionType,
                    items: initialComponents
                }
                break;
        }
        setComponents(initialComponents);
        setEditedSection(newSection);
        updateSections[index] = newSection;
        setToState('pageBuilder', ['page', 'sections'], updateSections);
    }

    const handleComponentDelete = () => {
        const updatedSection = { ...editedSection };
        const updatedSections = state.page.sections;
        const componentIndex = updatedSection.items.indexOf(selectedComponent);
        updatedSection.items[componentIndex] = newComponent;
        if (state.code.toLowerCase() === 'new page') {
            if (selectedComponent.type === 'slider' || selectedComponent.type === 'slider-gallery') {
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMIMG,
                    token: authToken,
                    params: {
                        query: `sliderid:${selectedComponent.gid}`,
                        sort: 'orderno',
                        hotelrefno: Number(companyId)
                    }
                }).then(async res => {
                    if (res.status === 200) {
                        let componentData = [];
                        await res.data.data.map(async (data) => {
                            componentData.push(data);
                        });
                        const data = [];
                        for (let gid in componentData) {
                            data.push({ gid: componentData[gid].gid })
                        }
                        UseOrest({
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.HCMITEMIMG + '/' + OREST_ENDPOINT.LIST + '/' + OREST_ENDPOINT.DEL,
                            token: authToken,
                            method: REQUEST_METHOD_CONST.DELETE,
                            data: data,
                            params: {
                                hotelrefno: Number(companyId)
                            },
                        }).then(response => {
                            if (response.status === 200) {
                                Delete({
                                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                                    endpoint: OREST_ENDPOINT.HCMITEMSLD,
                                    token: authToken,
                                    gid: selectedComponent.gid,
                                    params: {
                                        hotelrefno: Number(companyId)
                                    }
                                }).then(res => {
                                    if (res.status === 200) {
                                        setEditedSection(updatedSection);
                                        setComponents(updatedSection.items);
                                        updatedSections[index] = updatedSection;
                                        setToState('pageBuilder', ['page', 'sections'], updatedSections);
                                        toast.success(DELETE_SUCCESS, {
                                            position: toast.POSITION.TOP_RIGHT
                                        });
                                    } else {
                                        const retErr = isErrorMsg(res);
                                        toast.error(retErr.errorMsg, {
                                            position: toast.POSITION.TOP_RIGHT
                                        });
                                    }
                                })
                            }
                        });

                    } else {
                        console.log(res);
                    }
                });
            } else if (selectedComponent.type === 'image') {
                Delete({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMIMG,
                    token: authToken,
                    gid: selectedComponent.gid,
                    params: {
                        hotelrefno: Number(companyId)
                    }
                }).then(res => {
                    if (res.status === 200) {
                        toast.success(DELETE_SUCCESS, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setEditedSection(updatedSection);
                        setComponents(updatedSection.items);
                        updatedSections[index] = updatedSection;
                        setToState('pageBuilder', ['page', 'sections'], updatedSections);
                    } else {
                        const retErr = isErrorMsg(res);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
            } else if (selectedComponent.type === 'paragraph') {
                Delete({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                    token: authToken,
                    gid: selectedComponent.gid,
                    params: {
                        hotelrefno: Number(companyId)
                    }
                }).then(res => {
                    if (res.status === 200) {
                        toast.success(DELETE_SUCCESS, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setEditedSection(updatedSection);
                        setComponents(updatedSection.items);
                        updatedSections[index] = updatedSection;
                        setToState('pageBuilder', ['page', 'sections'], updatedSections);
                    } else {
                        const retErr = isErrorMsg(res);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
            } else {
                setEditedSection(updatedSection);
                setComponents(updatedSection.items);
                updatedSections[index] = updatedSection;
                setToState('pageBuilder', ['page', 'sections'], updatedSections);
                toast.success(DELETE_SUCCESS, {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        } else {
            setEditedSection(updatedSection);
            setComponents(updatedSection.items);
            updatedSections[index] = updatedSection;
            setToState('pageBuilder', ['page', 'sections'], updatedSections);
        }
    }

    const deleteImage = async (header) => {
        return new Promise(async (resv) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.success) {
                        resv(response)
                    } else {
                        const retErr = isErrorMsg(response);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const deleteSlider = async (header, sliderGID) => {
        return new Promise(async (resv) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data) {
                        const REQUEST_OPTIONS_VIEWLIST_HCMITEMIMG = {
                            url: GENERAL_SETTINGS.OREST_URL + '/hcmitemimg/view/list',
                            method: 'get',
                            headers: {
                                Authorization: `Bearer ${authToken}`,
                                'Content-Type': 'application/json',
                            },
                            params: {
                                query: `sliderid:${response.data.data[0].id}`,
                                chkselfish: false,
                                hotelrefno: Number(companyId),
                            },
                        }
                        return await axios(REQUEST_OPTIONS_VIEWLIST_HCMITEMIMG).then(async (res) => {
                            let gids = []
                            let data = []
                            await res.data.data.map((d) => {
                                data.push(d)
                            })
                            for (let gid in data) {
                                gids.push({ gid: data[gid].gid })
                            }
                            const REQUEST_OPTIONS_DELETE_HCMITEMIMG = {
                                url:
                                    GENERAL_SETTINGS.OREST_URL +
                                    OREST_ENDPOINT.SLASH +
                                    OREST_ENDPOINT.HCMITEMIMG +
                                    OREST_ENDPOINT.SLASH +
                                    OREST_ENDPOINT.LIST +
                                    OREST_ENDPOINT.SLASH +
                                    OREST_ENDPOINT.DEL,
                                method: REQUEST_METHOD_CONST.DELETE,
                                headers: {
                                    Authorization: `Bearer ${authToken}`,
                                    'Content-Type': 'application/json',
                                },
                                data: gids,
                            }
                            return await axios(REQUEST_OPTIONS_DELETE_HCMITEMIMG).then(async (response1) => {
                                if (response1.status === 200 && response1.data && response1.data.success) {
                                    const REQUEST_OPTIONS_DELETE_HCMITEMSLD = {
                                        url:
                                            GENERAL_SETTINGS.OREST_URL +
                                            OREST_ENDPOINT.SLASH +
                                            OREST_ENDPOINT.HCMITEMSLD +
                                            OREST_ENDPOINT.SLASH +
                                            'del/' +
                                            sliderGID,
                                        method: REQUEST_METHOD_CONST.DELETE,
                                        headers: {
                                            Authorization: `Bearer ${authToken}`,
                                            'Content-Type': 'application/json',
                                        },
                                        params: {
                                            hotelrefno: Number(companyId),
                                        },
                                    }
                                    return await axios(REQUEST_OPTIONS_DELETE_HCMITEMSLD).then(async (response2) => {
                                        if (response2.status === 200 && response2.data && response2.data.success) {
                                            resv(response2)
                                        } else {
                                            const retErr = isErrorMsg(response2);
                                            toast.error(retErr.errorMsg, {
                                                position: toast.POSITION.TOP_RIGHT
                                            });
                                        }
                                    })
                                } else {
                                    const retErr = isErrorMsg(response1);
                                    toast.error(retErr.errorMsg, {
                                        position: toast.POSITION.TOP_RIGHT
                                    });
                                }
                            })
                        })
                    } else {
                        const retErr = isErrorMsg(response);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const deleteParagraph = async (header) => {
        return new Promise(async (resv) => {
            return await axios(header)
                .then(async (response) => {
                    if (response.status === 200 && response.data && response.data.success) {
                        resv(response)
                    } else {
                        const retErr = isErrorMsg(response);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
                .catch((error) => {
                    console.log(error)
                    resv(error.response || { status: 0 })
                })
        })
    }

    const deleteReadyUsedComponent = async () => {
        return new Promise(async (resv) => {
            resv({
                status: 200,
                msg: 'delete successfully',
            })
        })
    }

    const handleSectionID = (event) => {
        setSectionID(event.target.value);
        if (state?.type === 'webPage') {
            if (state?.page?.sections?.length) {
                setNextDisable(state.page.sections.some((section, sectionIndex ) => {
                    return (section.id === event.target.value && sectionIndex !== index)
                }));
            }
        }
    }

    return (
        <Dialog disableBackdropClick disableEnforceFocus fullWidth={true} maxWidth="md" open={openModal}
            onClose={handleCancel} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title" color="secondary"> {dialogTitle}
                <hr />
            </DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} alternativeLabel
                connector={<ColorlibConnector/>}
                >
                    {steps.map((label, index) => {
                        return (
                            <Step key={`step-${index}`}>
                                <StepLabel
                                    color="secondary"
                                    StepIconComponent={() => getSectionStepsIcons(sectionType, (activeStep === index), (activeStep > index), index)}>
                                    {label}
                                </StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                <Container className={isSave ? classes.disableSlider : ''}>
                    {
                        activeStep === 0 && (
                            <>
                                <Grid container={true} spacing={1}>
                                    <Grid item={true} xs={2}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size={'small'}
                                                    checked={hasSectionTitle}
                                                    onChange={() => {
                                                          setHasSectionTitle(!hasSectionTitle);
                                                        !hasSectionTitle ? setSectionTitle(sectionTitle) : setSectionTitle('')
                                                    }}
                                                    name="title"
                                                    color="primary"
                                                />
                                            }
                                            label="Add Title"
                                        />
                                    </Grid>
                                    <Grid item xs={5}>
                                        <FormControl disabled={state.langCode !== state.defaultLang} fullWidth component="fieldset" size={'small'} variant="outlined">
                                            {
                                                sectionTypes?.length > 0 && <Select
                                                    value={sectionType}
                                                    onChange={handleSectionType}
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
                                            <TextField
                                                label="Section ID *" value={sectionID}
                                                disabled={state.langCode !== state.defaultLang}
                                                onChange={handleSectionID}
                                                helperText={isNextDisable ? "Already Exist" : ""}
                                                error={isNextDisable}
                                                variant={'outlined'}
                                                size={'small'}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <FormControl fullWidth component={'fieldset'}>
                                            <TextField label="Order"
                                                       inputProps={{ min: 1, max: state?.page?.sections?.length + 1 }}
                                                       onChange={(e) => setSectionOrder(e.target.value)}
                                                       disabled={state.langCode !== state.defaultLang}
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
                                                          onModelChange={(model) => setSectionTitle(model)}/>
                                        </Grid>
                                    </Grid>
                                }
                            </>
                        )
                    }
                    {
                        state?.page?.sections[index]?.items?.length > 0 &&
                        state.page.sections[index].items.map((value, i) => {
                            return (i === activeStep - 1) ? (
                                <div key={i}>
                                    <span className={state.langCode !== state.defaultLang ? classes.disableSlider : ''}>
                                        <CustomSlider
                                            marks={marks}
                                            value={consumeWidth}
                                            onChange={handleComponentWidthChange}
                                            className={activeStep === steps.length - 1 ? classes.disableSlider : ''}
                                        />
                                    </span>
                                    <FormControl
                                        component="fieldset"
                                        size={'small'}
                                        variant={'outlined'}
                                        disabled={state.langCode !== state.defaultLang}
                                    >
                                        {
                                            subSectionOptions?.length > 0 && <Select
                                                value={value.type}
                                                onChange={(e) => {
                                                    handleComponentType(e, value);
                                                }}
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
                                        setModalType(value, i)
                                    }
                                </div>
                            ) : null
                        })
                    }
                    <Grid container direction="row" justify="flex-start" alignItems="flex-start">
                        <div className={classes.actionButtons}>
                            {
                                activeStep !== 0 && (<Button
                                    onClick={handleBackSection}
                                    variant="contained"
                                    size="small"
                                    aria-label="add"
                                    className={classes.actionButton}
                                >
                                    BACK
                                </Button>)
                            }
                            <Button
                                onClick={handleNextSection}
                                variant="contained"
                                size="small"
                                color="primary"
                                aria-label="add"
                                className={classes.actionButton}
                                disabled={isNextDisable}
                            >
                                {activeStep === steps.length - 1 ? 'SAVE' : 'NEXT'}
                            </Button>
                        </div>
                    </Grid>
                </Container>
                {
                    isAlertDialog && <Alert handleAlert={handleAlertActionChange} alertType={alertType} />
                }
            </DialogContent>
            <DialogActions>
                <Button
                    className={classes.actionButton}
                    onClick={handleCancel}
                    variant="contained"
                    size="small"
                    aria-label="add"
                >
                    Cancel
                    </Button>
                <Button
                    onClick={handleApply}
                    className={classes.actionButton}
                    variant="contained"
                    size="small"
                    aria-label="add"
                    color="primary"
                    disabled={!isSave}
                >
                    Apply
                    </Button>
            </DialogActions>
        </Dialog>
    )
}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditSection);
