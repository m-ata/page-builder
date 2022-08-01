import React, { useContext, useEffect, memo } from 'react'
import { useSelector } from 'react-redux'
import OnePageSurvey from '../render-types/OnePageSurvey'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import Tab from '@material-ui/core/Tab'
import GroupPerPageSurvey from '../render-types/GroupPerPageSurvey'
import Tabs from '@material-ui/core/Tabs'
import Typography from '@material-ui/core/Typography'
import useSurveyAction from '../../../../model/survey/useSurveyAction'
import SwipeableViews from 'react-swipeable-views'
import { SURVEY_DISPLAY_TYPE_GROUP, SURVEY_DISPLAY_TYPE_QUESTION, SURVEY_DISPLAY_TYPE_ONE_PAGE } from '../../../../model/survey/constants'
import QuestionOption from './Question'
import WebCmsGlobal from '../../../webcms-global'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

const backgroundColors = [
    '#FCB655',
    '#2697D4',
    '#18BA7A',
    '#4666B0',
    '#F16A4B',
    '#67B548',
    '#122D31',
    '#ED323B',
    '#00A79E',
]

function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    }
}

function TabPanel(props) {
    const { children, value, index, ...other } = props
    const classes = useStyles()

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            className={classes.tabPanel}
            {...other}
        >
            {value === index && <React.Fragment>{children}</React.Fragment>}
        </Typography>
    )
}

const MemoizedTabPanel = memo(TabPanel)

function GroupOption(props) {
    const { option, options, optionTyp, index } = props
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    //style
    const classes = useStyles()
    const theme = useTheme()

    //redux
    const { setSurveyPage, setSurveyLastPage, setSurveyGroup, setSurveyLastGroup } = useSurveyAction()
    const surveyIsValid = useSelector((state) => state.survey.isValid)
    const displayType = useSelector((state) => state.survey.displayType)
    const surveyPage = String(useSelector((state) => state.survey.page))
    const surveyGroup = String(useSelector((state) => state.survey.group))
    const defaultExpanded = Number(index) === 1 && (displayType === SURVEY_DISPLAY_TYPE_ONE_PAGE) ? true : false

    //state
    let counter = 0
    const groupLimits = []

    useEffect(() => {
        if (displayType === SURVEY_DISPLAY_TYPE_GROUP) {
            setSurveyLastGroup(options.length)
        } else if (displayType === SURVEY_DISPLAY_TYPE_QUESTION) {
            setSurveyLastGroup(options.length)
        }
    }, [])

    useEffect(() => {
        if (displayType === SURVEY_DISPLAY_TYPE_QUESTION) {
            if (groupLimits && groupLimits[surveyPage] !== undefined) {
                if (Number(surveyGroup) !== setSurveyGroup(groupLimits[surveyPage])) {
                    setSurveyGroup(groupLimits[surveyPage])
                }
            }
        }
    }, [surveyPage])

    useEffect(() => {
        if (displayType === SURVEY_DISPLAY_TYPE_QUESTION) {
            setSurveyLastPage(counter)
        }
    }, [counter])

    const handleChange = (event, newValue) => {
        const value = Number(newValue)

        if (Number(surveyGroup) !== value) {
            setSurveyGroup(value)
        }

        if (displayType === SURVEY_DISPLAY_TYPE_QUESTION) {
            const indexOfFirstQuestionOfGroup = groupLimits.indexOf(value)
            const firstQuestionOfGroup = groupLimits[indexOfFirstQuestionOfGroup]

            setSurveyPage(indexOfFirstQuestionOfGroup)
            if (firstQuestionOfGroup) {
                setSurveyGroup(firstQuestionOfGroup)
            }
        }
    }

    if (displayType === SURVEY_DISPLAY_TYPE_GROUP) {
        return (
            <React.Fragment>
                <Tabs
                    value={surveyGroup}
                    onChange={handleChange}
                    variant={'scrollable'}
                    scrollButtons={'auto'}
                    classes={{
                        root: classes.tabsRoot,
                        indicator: classes.tabsIndicator,
                        flexContainer: classes.tabsFlexContainer,
                        scrollButtons: classes.tabsScrollButtons,
                    }}
                    TabScrollButtonProps={{
                        classes: {
                            root: classes.tabScrollRoot,
                            disabled: classes.tabScrollDisabled,
                        },
                    }}
                    aria-label="menu tabs"
                >
                    {options.map((option, i) => {
                        return (
                            <Tab
                                label={
                                    <SurveyTooltip title={option && option.note || ''}>
                                        <span>{option.langwordtxt || option.description}</span>
                                    </SurveyTooltip>
                                }
                                icon={
                                    option.imageurl && (
                                        <img
                                            src={GENERAL_SETTINGS.STATIC_URL + option.imageurl}
                                            alt={option.langwordtxt || option.description}
                                            className={classes.groupImage}
                                        />
                                    )
                                }
                                {...a11yProps(i)}
                                value={`${i}`}
                                key={i}
                                style={{ backgroundColor: (index % 2 ? theme.palette.primary.main : theme.palette.secondary.main) }}
                                classes={{
                                    root: classes.tabRoot,
                                    wrapper: classes.tabWrapper,
                                    textColorInherit: classes.tabTextColorInherit,
                                    labelIcon: classes.tabLabelIcon,
                                }}
                            />
                        )
                    })}
                </Tabs>
                <SwipeableViews axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={Number(surveyGroup)}>
                    {options.map((option, i) => {
                        return (
                            <MemoizedTabPanel value={surveyGroup} index={String(i)} key={i} dir={theme.direction}>
                                {option.children ? <GroupPerPageSurvey options={option.children} /> : <div />}
                            </MemoizedTabPanel>
                        )
                    })}
                </SwipeableViews>
            </React.Fragment>
        )
    } else if (displayType === SURVEY_DISPLAY_TYPE_QUESTION) {
        return (
            <React.Fragment>
                <Tabs
                    value={surveyGroup}
                    onChange={handleChange}
                    variant={'scrollable'}
                    scrollButtons={'auto'}
                    classes={{
                        root: classes.tabsRoot,
                        indicator: classes.tabsIndicator,
                        flexContainer: classes.tabsFlexContainer,
                        scrollButtons: classes.tabsScrollButtons,
                    }}
                    TabScrollButtonProps={{
                        classes: {
                            root: classes.tabScrollRoot,
                            disabled: classes.tabScrollDisabled,
                        },
                    }}
                    aria-label="menu tabs"
                >
                    {options.map((option, i) => {
                        return (
                            <Tab
                                label={
                                    <SurveyTooltip title={option && option.note || ''}>
                                        <span>{option.langwordtxt || option.description}</span>
                                    </SurveyTooltip>
                                }
                                icon={
                                    option.imageurl && (
                                        <img
                                            src={GENERAL_SETTINGS.STATIC_URL + option.imageurl}
                                            alt={option.langwordtxt || option.description}
                                            className={classes.groupImage}
                                        />
                                    )
                                }
                                {...a11yProps(i)}
                                value={`${i}`}
                                key={i}
                                style={{ backgroundColor: (index % 2 ? theme.palette.primary.main : theme.palette.secondary.main) }}
                                classes={{
                                    root: classes.tabRoot,
                                    wrapper: classes.tabWrapper,
                                    textColorInherit: classes.tabTextColorInherit,
                                    labelIcon: classes.tabLabelIcon,
                                }}
                            />
                        )
                    })}
                </Tabs>
                <SwipeableViews axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={Number(surveyGroup)}>
                    {options.map((option, i) => {
                        return (
                            <MemoizedTabPanel value={surveyGroup} index={String(i)} key={i} dir={theme.direction}>
                                {option.children && option.children.length > 0 ? (
                                    option.children.map((optionChild, j) => {
                                        counter++
                                        groupLimits.push(i)
                                        if (counter === Number(surveyPage) + 1) {
                                            return (
                                                <QuestionOption
                                                    option={optionChild}
                                                    optionTyp={'QUESTION'}
                                                    index={counter}
                                                    key={j}
                                                />
                                            )
                                        }
                                    })
                                ) : (
                                    <div />
                                )}
                            </MemoizedTabPanel>
                        )
                    })}
                </SwipeableViews>
            </React.Fragment>
        )
    } else {
        return (
            <Accordion defaultExpanded={defaultExpanded} className={classes.expansionPanel}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon}  style={{color: (index % 2 ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText)}} />}
                    aria-controls={option.id + '-content'}
                    id={option.id + '-header'}
                    style={{
                        backgroundColor: (index % 2 ? theme.palette.primary.main : theme.palette.secondary.main),
                        opacity: surveyIsValid ? 0.7 : 1,
                    }}
                    className={classes.expansionPanelSummary}
                >
                    {option.imageurl && (
                        <img
                            src={GENERAL_SETTINGS.STATIC_URL + option.imageurl}
                            alt={option.langwordtxt || option.description}
                            className={classes.groupImage}
                        />
                    )}
                    <h3 style={{color: (index % 2 ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText)}} className={classes.groupTitle}>{option.langwordtxt || option.description}</h3>
                </AccordionSummary>
                <AccordionDetails className={classes.expansionPanelDetails}>
                    {option.children && <OnePageSurvey options={option.children} />}
                </AccordionDetails>
            </Accordion>
        )
    }
}

export default memo(GroupOption)
