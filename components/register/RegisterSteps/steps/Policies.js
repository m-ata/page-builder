import React from 'react'
import { connect } from 'react-redux'
import { updateState } from '../../../../state/actions'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import MuiExpansionPanel from '@material-ui/core/Accordion'
import MuiExpansionPanelSummary from '@material-ui/core/AccordionSummary'
import MuiExpansionPanelDetails from '@material-ui/core/AccordionDetails'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import useTranslation from 'lib/translations/hooks/useTranslation'
import { withStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        '& > *': {
            margin: theme.spacing(1),
            width: theme.spacing(16),
            height: theme.spacing(16),
        },
    },
    welcomeWrapper: {
        maxWidth: 1259,
        width: '100%',
        height: 685,
        padding: 20,
    },
    welcomeToH3: {
        color: '#0F4571',
        fontSize: '6.5rem',
        fontWeight: 600,
        textAlign: 'right',
    },
    vimaH3: {
        color: '#269DD4',
        fontSize: '10.5rem',
        fontWeight: 600,
    },
    fieldset: {
        width: '100%',
        marginTop: theme.spacing(2),
    },
    legends: {
        paddingTop: theme.spacing(2),
        fontSize: '1.1rem',
    },
    txtfiled: {
        marginTop: theme.spacing(1.5),
        maxWidth: 350,
        width: '100%',
    },
}))

const Accordion = withStyles({
    root: {
        border: '1px solid rgba(0, 0, 0, .125)',
        marginTop: 8,
        boxShadow: 'none',
        borderRadius: 5,
        '&:not(:last-child)': {
            marginBottom: 8,
        },
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            marginTop: 8,
            marginBottom: 0,
        },
    },
    expanded: {},
})(MuiExpansionPanel)

const AccordionSummary = withStyles({
    root: {
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        marginBottom: -1,
        minHeight: 40,
        '&$expanded': {
            minHeight: 40,
        },
    },
    content: {
        '&$expanded': {
            margin: '0',
        },
    },
    expanded: {},
})(MuiExpansionPanelSummary)

const AccordionDetails = withStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiExpansionPanelDetails)

const Policies = (props) => {
    const { t } = useTranslation()
    const { state, updateState } = props

    const cls = useStyles()

    const InputChange = (e) => {
        updateState('data', e.target.id, e.target.value)
    }

    const [expanded, setExpanded] = React.useState('panel1')

    const handleChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false)
    }
    const handleXChange = () => {}

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={12}>
                    <div>
                        <Accordion square expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1d-content"
                                id="panel1d-header"
                            >
                                <Typography>{t('str_timing')}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <FormControl style={{ width: '300px' }}>
                                            <InputLabel id="demo-simple-select-label">
                                                {t('str_freeCancellationTime')}
                                            </InputLabel>
                                            <Select labelId="demo-simple-select-label" id="demo-simple-select">
                                                <MenuItem value={10}>14 days before arrival</MenuItem>
                                                <MenuItem value={20}>15 days before arrival</MenuItem>
                                                <MenuItem value={30}>16 days before arrival</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        6 {t('str_arrival')}
                                    </Grid>
                                    <Grid item xs={6}>
                                        6 {t('str_departure')}
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion square expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel2d-content"
                                id="panel2d-header"
                            >
                                <Typography>{t('str_propertyRules')}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>{t('str_test2')}</Typography>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion square expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel3d-content"
                                id="panel3d-header"
                            >
                                <Typography>{t('str_detailsToKnow')}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography>{t('str_test2')}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    </div>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

/*
Policies.getInitialProps = (ctx) => {

}
*/

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.data,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Policies)
