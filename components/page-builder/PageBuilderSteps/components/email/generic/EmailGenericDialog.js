//import from react
import React, { useState, useEffect} from 'react';
//imports from material ui
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import {makeStyles} from '@material-ui/core/styles';
//custom imports
import EmailHeaderTemplates from "../header/EmailHeaderTemplates";
import EmailFooterTemplates from "../footer/EmailFooterTemplates";
import EditEmailFooter from "../footer/EditEmailFooter";
import EditEmailHeader from "../header/EditEmailHeader";
import AddEmailSection from "../body/AddEmailSection";

const useStyles = makeStyles(theme => ({
    actionButton: {
        marginLeft: theme.spacing(1),
        borderRadius: 20,
    }
}));

const EmailGenericDialog = (props) => {

    const {
        type,
        title,
        resetRenderDialog,
        onSelectHeader,
        onSelectFooter,
        onAddEmailSection
    } = props;

    //local states
    const [openModal, setOpenModal] = useState(true);
    const [dialogType, setDialogType ] = useState('');
    const [header, setHeader] = useState({});
    const [footer, setFooter] = useState({});
    const [body, setBody] = useState({});
    const [sectionOrder, setSectionOrder] = useState(null);

    const classes = useStyles();

    useEffect(() => {
        handleDialogType();
    }, [type]);

    const handleDialogType = () => {
        switch (type) {
            case 'add-header' :
                setDialogType(<EmailHeaderTemplates onSelectHeader={handleSelectedHeader} />);
                break;
            case 'add-footer':
                setDialogType(<EmailFooterTemplates onSelectFooter={handleSelectedFooter} />);
                break;
            case 'add-section' :
                setDialogType(<AddEmailSection onAddBody={handleSelectedBody} />);
                break;
            case 'edit-footer' :
                setDialogType(<EditEmailFooter onEditFooter={handleSelectedFooter} />);
                break;
            case 'edit-header' :
                setDialogType(<EditEmailHeader onEditHeader={handleSelectedHeader} />);
                break;
            default:
                setDialogType('');
        }
    }

    const handleCancel = () => {
        setOpenModal(false);
        resetRenderDialog();
    }

    const handleSelectedHeader = (header) => {
        setHeader(header);
    }

    const handleSelectedFooter = (footer) => {
        setFooter(footer);
    }

    const handleSelectedBody = (body, order) => {
        setBody(body);
        setSectionOrder(order);
    }

    const handleApply = () => {
        switch (type) {
            case 'add-header':
                onSelectHeader(header);
                break;
            case 'add-footer':
                onSelectFooter(footer);
                break;
            case 'add-section':
                onAddEmailSection(body, sectionOrder);
                break;
            case 'edit-footer':
                onSelectFooter(footer);
                break;
            case 'edit-header':
                onSelectHeader(header);
                break;
            default:
                return;
        }
        handleCancel();
    }

    const handleApplyDiabled = () => {
        if (type === 'add-header' || type === 'edit-header') {
            if (Object.keys(header).length > 0) return true;
            else return false;
        } else if (type === 'add-footer' || type === 'edit-footer') {
            if (Object.keys(footer).length > 0) return true;
            else return false;
        } else if (type === 'add-section') {
            if (body && Object.keys(body).length > 0) {
                if (body.type === 'fullcol') {
                    if (body.items && body.items.length > 0 && body.items[0] && body.items[0].service) {
                        return true;
                    }
                } else if (body.type === 'twocol') {
                    if (body.items && body.items.length > 0 && body.items[1] &&
                        body.items[1].service) {
                        return true;
                    }
                } else if (body.type === 'threecol') {
                    if (body.items && body.items.length > 0 && body.items[2] &&
                        body.items[2].service) {
                        return true;
                    }
                }
            }
            else return false;
        } else {
            return true
        }
    }

    return (
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
                {
                    dialogType ? dialogType : null
                }
                <Divider style={{marginTop: 16}} />
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
                    disabled={!handleApplyDiabled()}
                >
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    )
};

export default EmailGenericDialog;