import React, {useState, useEffect} from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Divider } from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import AddCategory from "../category/AddCategory";
import AddQA from "../qa/AddQA";
import EditQA from "../qa/EditQA";
import EditCategory from "../category/EditCategory";

const useStyles = makeStyles(theme => ({
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    }
}));

const FAQ_Dialog = (props) => {

    const {  resetDialog, type, onAddCategory, onAddQA, onEditQA, onEditCategory, state } = props
    //local state
    const [isDialogOpen, setIsDialogOpen] = useState(true);
    const [dialogTitle, setDialogTitle] = useState('');
    const [obj, setObj] = useState({});
    const classes = useStyles();

    useEffect(() => {
        switch (type) {
            case 'add-category':
                setDialogTitle('Add Category');
                break;
            case 'add-qa':
                setDialogTitle('Add Q&A');
                break;
            case 'edit-qa':
                setDialogTitle('Edit Q&A');
                break;
            case 'edit-category':
                setDialogTitle('Edit Category');
                break;
            default:
                setDialogTitle('');
        }
    }, [type]);

    const handleCancel = () => {
        setIsDialogOpen(false);
        resetDialog();
    }

    const onAdd = (value) => {
        setObj(value);
    }

    const handleApply = () => {
        switch (type) {
            case 'add-category':
                onAddCategory(obj);
                break;
            case 'add-qa':
                onAddQA(obj);
                break;
            case 'edit-qa':
                onEditQA(obj);
                break;
            case 'edit-category':
                onEditCategory(obj);
                break;
            default:
                setObj({});
        }
        setIsDialogOpen(false);
        resetDialog();
    }

    return (
        <Dialog disableBackdropClick disableEnforceFocus fullWidth={true} maxWidth="md" open={isDialogOpen}
                onClose={handleCancel} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title" color="secondary">
                { dialogTitle }
                <Divider />
            </DialogTitle>
            <DialogContent style={{marginTop: -24}}>
                {
                    type && type === 'add-category' && <AddCategory onAddCategory={onAdd} />
                }
                {
                    type && type === 'add-qa' && <AddQA onAddQA={onAdd} />
                }
                {
                    type && type === 'edit-qa' && <EditQA qaValue={state} onEditQA={onAdd} />
                }
                {
                    type && type === 'edit-category' && <EditCategory categoryValue={state} onEditCategory={onAdd}  />
                }
                <Divider />
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
                    disabled={Object.keys(obj).length === 0}
                >
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    )
}
export default FAQ_Dialog;