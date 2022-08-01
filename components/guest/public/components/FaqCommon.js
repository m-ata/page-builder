import React, { useState, useEffect, useContext } from 'react'
import { connect, useSelector } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import LoadingSpinner from 'components/LoadingSpinner'

function TabPanel(props) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
}

function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    }
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    question: {
        '& p':{
            margin: 0
        }
    }
}))

const FaqCommon = (props) => {
    const classes = useStyles()
    const { state, setToState } = props
    const { GENERAL_SETTINGS, locale } = useContext(WebCmsGlobal)
    const [isLoading, setIsLoading] = useState(false)
    const [value, setValue] = useState(0)
    const { t } = useTranslation()

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    return (
        <React.Fragment>
            {state.hotelFaq.data === false ? (
                <LoadingSpinner size={50} />
            ) : state.hotelFaq.data === null ? (
                <Typography variant="h6" align="center" gutterBottom>
                    {t('str_noDefaultRecord')}
                </Typography>
            ) : (
                <div className={classes.root}>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                            scrollButtons="auto"
                            aria-label="scrollable auto tabs example"
                        >
                            {state.hotelFaq.data &&
                            state.hotelFaq.data.length > 0 &&
                            state.hotelFaq.data.map((category, i) => {
                                return <Tab label={category.text} key={i} {...a11yProps(i)} />
                            })}
                        </Tabs>
                    </AppBar>
                    {state.hotelFaq.data && state.hotelFaq.data.length > 0 && state.hotelFaq.data.map((category, categoryKey) => {
                        return (
                            <TabPanel value={value} index={categoryKey} key={categoryKey}>
                                {category.items && category.items.length > 0 && category.items.map((faqItem, itemKey) => {
                                    return (
                                        <Accordion key={itemKey}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Typography className={classes.heading}>
                                                    <div className={classes.question} dangerouslySetInnerHTML={{__html: faqItem.text}}/>
                                                </Typography>
                                            </AccordionSummary>
                                            {faqItem.items && faqItem.items.length > 0 && faqItem.items.map((answer, answerKey) => {
                                                return (
                                                    <AccordionDetails key={answerKey}>
                                                        <Typography variant="body2" gutterBottom>
                                                            <div dangerouslySetInnerHTML={{__html: answer.text}}/>
                                                        </Typography>
                                                    </AccordionDetails>
                                                )
                                            })}
                                        </Accordion>
                                    )
                                })}
                            </TabPanel>
                        )
                    })}
                </div>
            )}
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(FaqCommon)
