import React, { useState } from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import {makeStyles} from "@material-ui/core/styles";
import dynamic from "next/dynamic";
import {COLORS, froalaConfig} from "../../../../constants";

// import FroalaEditor from 'react-froala-wysiwyg' dynamic;
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
);

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


const TextEditor = (props) => {

    const { data, handleCancelTextEditor, handleSaveTextEditor } = props;
    const [state, setState] = useState({
        openModal: true,
        model: data
    });
    const config = {...froalaConfig, charCounterMax: 500};

    const { openModal, model } = state;

    const classes = useStyle();

    const handleCancel = () => {
        handleCancelTextEditor();
        setState(prev => ({...prev, openModal: false}));
    }

    const handleSave = () => {
        handleSaveTextEditor(model);
        setState(prev => ({...prev, openModal: false}));
    }


    return (
        <Dialog disableBackdropClick disableEnforceFocus fullWidth={true} maxWidth="lg" open={openModal}
                onClose={handleCancel} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title" style={{color: COLORS.secondary}}> {'Text Editor'}
                <hr />
            </DialogTitle>

            <DialogContent>
                <FroalaEditor
                    tag="textarea"
                    config={config}
                    model={model}
                    onModelChange={(m) => {setState(prev => ({...prev, model: m}))}}
                />
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
                    onClick={handleSave}
                    className={classes.actionButton}
                    variant="contained"
                    size="small"
                    aria-label="add"
                    color="primary"
                    // disabled={!isSave}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default TextEditor;