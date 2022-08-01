import React, {useContext, useState} from 'react';
//material imports
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import {makeStyles} from '@material-ui/core/styles';
//custom imports
import Section from './Section';
import {Insert} from "@webcms/orest";
import {OREST_ENDPOINT} from "../../../../../../model/orest/constants";

import { connect } from 'react-redux';
import WebCmsGlobal from "../../../../../webcms-global";
import {useRouter} from "next/router";

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

const AddSection = (props) => {

    const { resetRender, state } = props

    const [openModal, setOpenModal] = useState(true);
    const [section, setSection ] = useState('');
    const [sectionOrder, setSectionOrder] = useState(null);

    const classes = useStyles();

    const {GENERAL_SETTINGS, token} = useContext(WebCmsGlobal);
    const router = useRouter();
    const companyId = router.query.companyID;
    const authToken = token || router.query.authToken;

    const onAddSection = (section, sectionOrder) => {
        setSection(section);
        setSectionOrder(sectionOrder);
    }

    const handleApply = () => {
        if (section.items[section.items.length - 1].type === 'paragraph') {
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
                            itemtext: section.items[section.items.length - 1].service,
                            hotelrefno: Number(companyId)
                        },
                    }).then(res1 => {
                        if (res1.status === 200 && res1.data.data) {
                            const updatedSection = {...section};

                            updatedSection.items[updatedSection.items.length - 1] = {
                                service: "hcmitemtxtpar",
                                type: "paragraph",
                                gid: res1.data.data.gid,
                                width: updatedSection.items[updatedSection.items.length - 1].width,
                                id: `item-${section.items.length}`,
                                useBgColor: updatedSection?.items[updatedSection.items.length - 1]?.useBgColor
                            }
                            props.onAddSection(updatedSection, sectionOrder);
                            resetRender();
                            setOpenModal(false);
                        }
                    })
                }
            });
        } else {
            props.onAddSection(section, sectionOrder);
            resetRender();
            setOpenModal(false);
        }
    }

    const handleCancel = () => {
        setOpenModal(false);
        resetRender();
    }

    const handleApplyDisable = () => {
        if (Object.keys(section).length > 0) {
            if (section.items.length > 0)
                return false;
        }
        return true;
    }
        return (
            <Dialog
                disableBackdropClick
                disableEnforceFocus
                fullWidth={true}
                maxWidth="md"
                open={openModal}
                onClose={handleCancel}
                aria-labelledby="add-section-dialog"
            >
                <DialogTitle
                    color="primary"
                > Add Section
                    <hr/>
                </DialogTitle>
                <DialogContent>
                    <Section onAddSection={onAddSection} />
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

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

export default connect(
    mapStateToProps,
)(AddSection);
