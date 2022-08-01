import React, {memo} from 'react'
import { useSelector } from 'react-redux'
import OnePageSurvey from '../render-types/OnePageSurvey'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import { makeStyles } from '@material-ui/core/styles'
import styles from '../../style/SurveyOptions.style'
import SurveyTooltip from 'components/survey/helper/SurveyTooltip'

const useStyles = makeStyles(styles)

function SubGroupOption(props) {
    const { option, optionTyp } = props

    //style
    const classes = useStyles()

    //redux
    const surveyIsValid = useSelector((state) => state.survey.isValid)

    return (
        <Accordion defaultExpanded={true} className={classes.expansionPanel}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
                aria-controls={option.id + '-content'}
                id={option.id + '-header'}
                className={classes.expansionPanelSummary}
            >
                {option.imageurl && (
                    <img
                        src={GENERAL_SETTINGS.STATIC_URL + option.imageurl}
                        alt={option.langwordtxt || option.description}
                        className={classes.groupImage}
                    />
                )}
                <SurveyTooltip title={option && option.note || ''}>
                    <h3 className={classes.groupTitle}>{option.langwordtxt || option.description}</h3>
                </SurveyTooltip>
            </AccordionSummary>
            <AccordionDetails className={classes.expansionPanelDetails}>
                {option.children && <OnePageSurvey options={option.children} />}
            </AccordionDetails>
        </Accordion>
    )
}

export default memo(SubGroupOption)