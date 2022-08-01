import React, {useContext, useEffect, useState} from 'react';
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
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Grid from "@material-ui/core/Grid";
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';
import {useRouter} from "next/router";
import { withStyles } from '@material-ui/core/styles'
//import toast
import {toast} from "react-toastify";
//custom imports
import EditImage from "../../page/sections/image/EditImage";
import EditParagraph from "../../page/sections/paragraph/EditParagrapgh";
import Alert from "../../page/sections/AlertDialog";
//redux import
import { connect } from 'react-redux';
import {setToState} from "../../../../../../state/actions";
//integration related imports
import axios from "axios";
import WebCmsGlobal from "../../../../../webcms-global";
import {
    isErrorMsg,
    OREST_ENDPOINT,
    REQUEST_METHOD_CONST
} from "../../../../../../model/orest/constants";
import {Delete, Insert, Patch} from "@webcms/orest";
import {DELETE_SUCCESS} from "../../../constants";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

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

const EditEmailSection = (props) => {

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
    const [ activeStep, setActiveStep] = useState(0);
    const [ sectionType, setSectionType ] = useState(section.type);
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
    const [isNextDisable, setNextDisable] = useState(false)
    let index = state.email.body.indexOf(editedSection);
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
    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    const classes = useStyle();

    useEffect(() => {
        if(sectionType === 'fullcol') {
            setSteps(['Type', 'Sub Section 1']);
        } else if(sectionType === 'twocol') {
            setSteps(['Type', 'Sub Section 1', 'Sub Section 2']);
        } else {
            setSteps(['Type', 'Sub Section 1', 'Sub Section 2', 'Sub Section 3']);
        }
    }, [sectionType]);

    useEffect(() => {
        handleNextComponentWidth();
    }, [editedSection, activeStep]);

    const handleComponents = (data) => {
        const updatedComponents = [...components];
        updatedComponents[activeStep - 1] = data;
        setComponents(updatedComponents);
    }

    const handleDisable = (isDisabled) => {
        setNextDisable(isDisabled);
    }

    const setModalType = (component, index) => {
        switch (component.type) {
            case 'image':
                return (
                    state.langCode === state.defaultLang ? <EditImage
                        imageComponent={component}
                        handleCmponent={handleComponents}
                        handleDisable={handleDisable}
                    /> : <EditImage
                        imageComponent={component}
                        handleCmponent={handleComponents}
                        otherLangImage={otherLangSection[index]}
                        handleDisable={handleDisable}
                    />
                )
            case 'paragraph':
                return (
                    state.langCode === state.defaultLang ?
                        <EditParagraph
                            paragraphComponent={component}
                            handleCmponent={handleComponents}
                            handleDisable={handleDisable}
                        /> :
                        <EditParagraph
                            paragraphComponent={component}
                            handleCmponent={handleComponents}
                            otherLangParagraph={otherLangSection[index]}
                            handleDisable={handleDisable}
                        />
                )
        }
    }

    const handleCancel = () => {
        setOpenModal(false);
        props.resetRender();
    }

    const handleApply = () => {
        if(isSave) {
            const newSection = {
                id: sectionID.toLowerCase(),
                type: sectionType,
                items: components
            }
            onEditSection(newSection, index, sectionOrder);
            resetRender();
            setOpenModal(false);
        }
    }

    const handleNextSection = () => {

        if(activeStep === steps.length - 1) {
            setSave(true);
            components.map(component => {
                if (component.type === 'paragraph') {
                    if (component.gid) {
                        Patch({ // update into rafile
                            apiUrl: GENERAL_SETTINGS.OREST_URL,
                            endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                            token: authToken,
                            gid: component.gid,
                            data: {
                                itemtext: component.service,
                                hotelrefno: Number(companyId)
                            },
                        }).then(res => {
                            if (res.status === 200 && res.data.data) {
                                component.service = 'hcmitemtxtpar'
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
                            if(res.status === 200 && res.data.data) {
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
        if(section.type !== sectionType) {
            const updatedSections = state.email.body;
            const componentIndex = updatedSections[index].items.indexOf(component);
            component.service = handleComponentService(event.target.value);
            component.type = event.target.value;
            updatedSections[index].items[componentIndex] = component;
            setEditedSection(updatedSections[index]);
            setToState('pageBuilder', ['email', 'body'], updatedSections);
        } else {
            setAlertType('component');
            setAlertDialog(true);
            setSelectedComponent(component);
            handleNewComponent(event.target.value);
        }
    }

    const handleComponentService = (componentType) => {
        if(componentType === 'slider') {
            return 'hcmitemsld'
        } else if(componentType === 'image') {
            return 'hcmitemimg'
        } else if(componentType === 'widgetbooking') {
            return 'widgetbooking'
        } else if(componentType === 'paragraph') {
            return 'hcmitemtxtpar'
        } else return null;
    }

    const handleNewComponent = (componenttype) => {
        if(componenttype === 'slider' ) {
            setNewComponent({
                gid: '',
                service: 'hcmitemsld',
                type: componenttype,
                width: 100
            })
        }
        if(componenttype === 'image' ) {
            setNewComponent({
                gid: '',
                service: 'hcmitemimg',
                type: componenttype,
                width: 100
            });
        }
        if(componenttype === 'paragraph' ) {
            setNewComponent({
                gid: '',
                service: 'hcmitemtxtpar',
                type: componenttype,
                width: 100
            })
        }
        if(componenttype === 'widgetbooking' ) {
            setNewComponent({
                service: '',
                type: 'widgetbooking',
                width: 100
            });
        }
    }

    const handleAlertActionChange = (isDelete) => {
        if(isDelete) {
            if(alertType === 'section') {
                handleDeleteSection();
            }
            if(alertType === 'component') {
                handleComponentDelete();
            }
        }
        setAlertDialog(false);
    }

    const handleDeleteSection = async () => {
        const selectedSection = state.email.body[index]
        let req = []
        for (let component of selectedSection.items) {
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

        const index = state.email.body.indexOf(section);
        const updateSections =  state.email.body;
        let newSection ={};
        let initialComponents = []
        switch (tmp_sectionType) {
            case 'fullcol':
                initialComponents = [{
                    id: 'item-1',
                    service: '',
                    type: '',
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
                [50,50].map((value, i) => {
                    initialComponents.push({
                        id: 'item-'+ (i+1),
                        service: '',
                        type: '',
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
                [30,30,40].map((value, i) => {
                    initialComponents.push({
                        id: 'item-'+ (i+1),
                        service: '',
                        type: '',
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
        setEditedSection(newSection);
        updateSections[index]= newSection;
        setToState('pageBuilder', ['email', 'body'], updateSections);
    }

    const handleComponentDelete = () => {
        const updatedSection = {...section};
        const updatedSections = state.email.body;
        const componentIndex = updatedSection.items.indexOf(selectedComponent);
        updatedSection.items[componentIndex] = newComponent;
        if(state.code.toLowerCase() === 'new page') {
             if(selectedComponent.type === 'image') {
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
                        toast.success('Image deleted successfully', {
                            position: toast.POSITION.TOP_RIGHT
                        });
                        setEditedSection(updatedSection);
                        updatedSections[index] = updatedSection;
                        setToState('pageBuilder', ['email', 'body'], updatedSections);
                    } else {
                        const retErr = isErrorMsg(res);
                        toast.error(retErr.errorMsg, {
                            position: toast.POSITION.TOP_RIGHT
                        });
                    }
                })
             }
             if(selectedComponent.type === 'paragraph') {
                setEditedSection(updatedSection);
                updatedSections[index] = updatedSection;
                setToState('pageBuilder', ['email', 'body'], updatedSections);
                toast.success('Text deleted successfully', {
                    position: toast.POSITION.TOP_RIGHT
                });
            }
        } else {
            setEditedSection(updatedSection);
            updatedSections[index] = updatedSection;
            setToState('pageBuilder', ['email', 'body'], updatedSections);
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

    const handleSectionID = (event) => {
        setSectionID(event.target.value);
        if (state.type === 'email' || state.type === 'emailOnly') {
            if (state?.email?.body?.length) {
                setNextDisable(state.email.body.some((section, sectionIndex ) => {
                    return (section.id === event.target.value && sectionIndex !== index)
                }));
            }
        }
    }

    return(
        <Dialog disableBackdropClick disableEnforceFocus fullWidth={true} maxWidth="md" open={openModal}
                onClose={handleCancel} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title" color="secondary"> {dialogTitle}
                <hr/>
            </DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep} alternativeLabel
                    // connector={<ColorlibConnector/>}
                >
                    {steps.map((label, index) => {
                        return (
                            <Step key={`step-${index}`}>
                                <StepLabel color="secondary"
                                    // StepIconComponent={() => getStepsIcons(index, (pageStep === index), (pageStep > index), pageBuilderType)}
                                >{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                <Container className={isSave ? classes.disableSlider : ''}>
                    {
                        activeStep === 0 && (
                            <Grid container={true} justify={'center'} spacing={6} >
                                <Grid item xs={8}>
                                    <FormControl disabled={state.langCode !== state.defaultLang} fullWidth component="fieldset" size={'small'} variant="outlined">
                                        {
                                            sectionTypes?.length > 0 &&
                                            <Select value={sectionType} onChange={handleSectionType}>
                                                {sectionTypes.map((option, index) => {
                                                    return (
                                                        <MenuItem disabled={sectionType !== option.value} value={option.value} key={index}>
                                                            {option.label}
                                                        </MenuItem>
                                                    )
                                                })}
                                            </Select>
                                        }
                                    </FormControl>
                                </Grid>
                                <Grid item xs={2}>
                                    <FormControl component={'fieldset'}>
                                        <TextField
                                            disabled={state.langCode !== state.defaultLang}
                                            label="Section ID *" value={sectionID}
                                            onChange={handleSectionID}
                                            error={isNextDisable}
                                            helperText={isNextDisable ? 'Already Exist' : ''}
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

                        )
                    }
                    {
                        state.email.body.length > 0 && state.email.body[index] &&
                        state.email.body[index].items &&
                        state.email.body[index].items.map((value, i) => {
                            return (i === activeStep - 1) ? (
                                <div key={i}>
                                    <CustomSlider
                                        // className={classes.disableSlider}
                                        marks={marks}
                                        value={consumeWidth}
                                        onChange={handleComponentWidthChange}
                                        style={{pointerEvents: 'none', opacity: 0.5}}
                                    />
                                    <FormControl
                                        component="fieldset"
                                    >
                                        <RadioGroup aria-label="component" name="component" row value={value.type}
                                                    onChange={(e) => {
                                                        handleComponentType(e, value);
                                                    }}>
                                            <FormControlLabel
                                                value="image"
                                                control={<Radio color={'primary'}/>}
                                                label="Image"
                                                disabled={value.type !== 'image'}
                                            />
                                            <FormControlLabel
                                                value="paragraph"
                                                control={<Radio color={'primary'}/>}
                                                label="Text"
                                                disabled={value.type !== 'paragraph'}
                                            />
                                        </RadioGroup>
                                    </FormControl>
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
                                { activeStep === steps.length - 1 ? 'SAVE' : 'NEXT' }
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
)(EditEmailSection);
