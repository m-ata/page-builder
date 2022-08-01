import React from 'react'
import {setToState} from "../../../../../../state/actions";
import {connect} from "react-redux";
import { Grid, Typography} from '@material-ui/core'
import useTranslation from "../../../../../../lib/translations/hooks/useTranslation";
import {makeStyles} from "@material-ui/core/styles";
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        backgroundColor: '#9CD294',
        padding: '8px 16px',
        borderRadius: '4px'
    },
    iconRoot: {
        width: '2.5em',
        height: '2.5em',
        color: '#4CAD63'
    },
    gridRoot: {
        textAlign: 'center'
    }
}))

function ConfirmStep(props) {
    const classes = useStyles()
    const { state } = props

    const { t } = useTranslation()



    return(
        <React.Fragment>
            <div className={classes.root}>
                <Grid container spacing={1} alignItems={'center'} justify={'center'}>
                    <Grid item xs={12} className={classes.gridRoot}>
                        <CheckCircleOutlineRoundedIcon className={classes.iconRoot} />
                    </Grid>
                    <Grid item xs={12} className={classes.gridRoot}>
                        <Typography>{t('str_transHashtag') + state.requestNumber}</Typography>
                        <Typography>{t('str_yourRequestHasBeenForwardedToOurTeamTheyWillPerformTheChecksAndContactYouAsSoonAsPossible')}</Typography>
                    </Grid>
                </Grid>
            </div>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest.myRequest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmStep)