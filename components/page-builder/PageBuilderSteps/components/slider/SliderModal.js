//import from react
import React, { useState, useEffect} from 'react';
import { connect } from 'react-redux';
//imports from material ui
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from '@material-ui/core/styles';
//custom imports
import AddSlider from "./../page/sections/slider/AddSlider";
import EditSlider from "./../page/sections/slider/EditSlider";
import {setToState, updateState} from "../../../../../state/actions";

const useStyles = makeStyles(theme => ({
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    }
}));

const SliderModal = (props) => {

    const {
        state,
        title,
        type,
        resetRenderDialog,
        updateState
    } = props

    //local states
    const [openModal, setOpenModal] = useState(true);
    const [dialogType, setDialogType ] = useState('');
    const [isDisable, setDisable] = useState(true);
    const [sliderGID, setSliderGID] = useState(state.slider.gid);
    const [sliderTitle, setSliderTitle] = useState(state.slider.title);
    const [sliderDesc, setSliderDesc] = useState(state.slider.description);
    const [sliderCta, setSliderCta] = useState(state.slider.cta);
    const [sliderTextColor, setSliderTextColor] = useState(state.slider.textColor || '#FFFFFF');
    const [sliderButtonColor, setSliderButtonColor] = useState(state.slider.buttonColor || '#FFFFFF');

    const classes = useStyles();

    useEffect(() => {
        handleDialogType();
    }, [type]);

    const handleCancel = () => {
        setOpenModal(false);
        resetRenderDialog();
    }

    const handleDialogType = () => {
        switch (type) {
            case 'add-slider':
                setDialogType(<AddSlider
                    handleApplyDisable={handleApplyDisable}
                    handleSliderValues={handleSliderValues}
                />);
                break;
            case 'edit-slider':
                setDialogType(<EditSlider
                    sliderComponent={state.slider}
                    handleApplyDisable={handleApplyDisable}
                    handleSliderValues={handleSliderValues}
                />);
                break;
        }
    }

    const handleApplyDisable = (isDisabled) => {
        setDisable(isDisabled);
    }

    const handleSliderValues = (title, description, cta, gid, textColor, buttonColor) => {
        setSliderTitle(title);
        setSliderDesc(description);
        setSliderGID(gid);
        setSliderCta(cta);
        setSliderTextColor(textColor);
        setSliderButtonColor(buttonColor);
    }

    const handleApply = () => {
        const updatedSlider = {
            title: sliderTitle,
            description: sliderDesc,
            cta: sliderCta,
            gid: sliderGID,
            textColor: sliderTextColor,
            buttonColor: sliderButtonColor
        }
        updateState('pageBuilder', 'slider', updatedSlider);
        handleCancel();
    }

    return(
        <Dialog
            disableBackdropClick
            disableEnforceFocus
            fullWidth={true}
            maxWidth="md"
            open={openModal}
            onClose={handleCancel}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title" color="secondary"> {title}
                <Divider />
            </DialogTitle>
            <DialogContent style={{marginTop: -24}}>
                <Typography component={'div'} style={{marginTop: 16}}>
                    {
                        dialogType ? dialogType : null
                    }
                </Typography>
                <Divider style={{marginTop: 16}}/>
            </DialogContent>
            <DialogActions>
                <Button
                    className={classes.actionButton}
                    variant="contained"
                    size="small"
                    aria-label="add"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
                <Button
                    className={classes.actionButton}
                    variant="contained"
                    size="small"
                    aria-label="add"
                    color="primary"
                    onClick={handleApply}
                    disabled={isDisable}
                >
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    )
};

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SliderModal);