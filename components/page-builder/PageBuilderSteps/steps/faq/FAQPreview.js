import React, {useEffect, useState} from 'react';
import {Container, AppBar, Tab, Tabs, Typography, Box, Accordion, AccordionSummary, AccordionDetails} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import {COLORS} from "../../constants";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    scrollable: {
        height: 800,
        overflow: 'auto'
    },
    activeTab: {
        backgroundColor: 'white',
        color: 'silver',
        borderRadius: 10,
        marginTop: 4,
    },
    defaultTab: {
        backgroundColor: 'silver',
        color: 'gray',
        borderRadius: 10,
        marginTop: 4,
    }
}));

const defaultProps = {
    bgcolor: 'background.paper',
    border: 1,
    borderColor: 'silver',
}

const a11yProps = (index) => {
    return {
        id: `${index}`,
        'aria-controls': `category-${index}`,
    };
}

const FAQPreview = (props) => {

    const { state } = props;
    //local state
    const [activeTab, setActiveTab] = useState(state.faq[0].id);
    const [qa, setQa] = useState(null);
    const classes = useStyles();

    useEffect(() => {
        let updatedQA = [];
        if (activeTab) {
            updatedQA = state.faq.find(x => x.id === activeTab);
            updatedQA && updatedQA.items && setQa(updatedQA.items);
        }
    }, [activeTab]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    }

    return (
        <Container className={classes.root}>
            <AppBar position="static">
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    aria-label="faq tabs"
                    variant="scrollable"
                    TabIndicatorProps={{style: {display: 'none'}}}
                >
                    {
                        state.faq && state.faq.length > 0 && state.faq.map((value, index) => {
                            return (
                                <Tab
                                    className={activeTab === value.id ? classes.activeTab : classes.defaultTab}
                                    style={{marginLeft: index === 0 ? 0 : 4}}
                                    value={value.id}
                                    label={value.text}
                                    wrapped
                                    {...a11yProps(value.id)}
                                    key={value.id}
                                />
                            )
                        })
                    }
                </Tabs>
            </AppBar>
            <Box {...defaultProps} >
                <Typography component={'div'} className={classes.scrollable} >
                    {
                        qa && qa.length > 0 && qa.map((value, i) => {
                            return (
                                <Accordion key={`qa-${i}`} style={{backgroundColor: COLORS.backButton, marginTop: i !== 0 && 8}} >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                    >
                                        <div dangerouslySetInnerHTML={{__html: value.text}} ></div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div dangerouslySetInnerHTML={{__html: value.items[0].text}} ></div>
                                    </AccordionDetails>
                                </Accordion>
                            )
                        })
                    }
                </Typography>
            </Box>
        </Container>
    )

}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

export default connect(mapStateToProps)(FAQPreview);