import React, {useState, useEffect} from 'react';
//material imports
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import {makeStyles} from '@material-ui/core/styles';
//custom imports
import AddPage from '../pages/AddPage';
import HeaderTemplates from "./../header/HeaderTemplates";
import FooterTemplates from "./../footer/FooterTemplates";
import EditHeader from "./../header/EditHeader";
import EditFooter from "./../footer/EditFooter";

const useStyles = makeStyles(theme => ({
    actionButtons: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: theme.spacing(2)
    },
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    }
}));

const WebsiteGenericDialog = (props) => {

    const {
        type,
        dialogTitle,
        isDialogOpen,
        resetRender,
        footerType,
        headerType,
        selectedHeader,
        onSelectFooter,
    } = props

    const [openModal, setOpenModal] = useState(isDialogOpen);
    const [dialogType, setDialogType ] = useState('');
    const [header, setHeader ] = useState('');
    const [footer, setFooter ] = useState('');
    const [pages, setPages ] = useState([]);
    const [editedHeader, setEditiedHeader ] = useState('');
    const [editedFooter, setEditedFooter ] = useState('');

    const classes = useStyles();

    useEffect(() => {
        setModalType(type)
    }, [type])

    const onSelectHeader = (header) => {
        setHeader(header);
    }

    const onSelectedFooter = (footer) => {
        setFooter(footer);
    }

    const onAddPage = (page) => {
        setPages(page);
    }

    const onEditFooter = (footer) => {
        setEditedFooter(footer);
    }

    const onEditHeader = (header) => {
        setEditiedHeader(header);
    }

    const setModalType = (type) => {
        switch (type) {
            case 'header':
                setDialogType(<HeaderTemplates onSelectHeader={onSelectHeader} />)
                break;
            case 'edit-header':
                setDialogType(<EditHeader headerType={headerType} onEditHeader={onEditHeader} />)
                break;
            case 'footer':
                setDialogType(<FooterTemplates onSelectedFooter={onSelectedFooter} />)
                break;
            case 'page':
                setDialogType(<AddPage onAddPage={onAddPage} />)
                break;
            case 'edit-footer':
                setDialogType(<EditFooter footerType={footerType} onEditFooter={onEditFooter} />)
                break;
        }
    }

    const handleApply = () => {
        if (type === 'header') {
            selectedHeader(header);
        } else if (type === 'edit-header') {
            props.onEditHeader(editedHeader);
        } else if (type === 'footer') {
            onSelectFooter(footer);
        } else if (type === 'page') {
            props.onAddPage(pages);
        } else if (type === 'edit-footer') {
            props.onEditFooter(editedFooter);
        }
        resetRender();
        setOpenModal(false);
    }

    const handleCancel = () => {
        setOpenModal(false);
        resetRender();
    }

    const handleApplyDisable = () => {
        if (Object.keys(header).length > 0 || Object.keys(editedHeader).length > 0 || Object.keys(editedFooter).length > 0 ||
            Object.keys(footer).length > 0)
            return false;
        if (pages.length > 0) {
            return false;
        }
        return true;
    }
        return (
            <Dialog disableBackdropClick disableEnforceFocus fullWidth={true} maxWidth="lg" open={openModal}
                    onClose={handleCancel} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title" color="secondary"> {dialogTitle}
                    <hr/>
                </DialogTitle>
                <DialogContent style={{marginTop: -24}}>
                    {
                        dialogType ? dialogType : null
                    }
                    <hr />
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
                        disabled={handleApplyDisable() ? true : false}
                    >
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
        )
}

export default WebsiteGenericDialog;
