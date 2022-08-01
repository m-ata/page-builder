import React from 'react';
import styles from '../../../../assets/jss/components/dashboardTimeline.style';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(styles)

function DashboardTimeline(){
    const classes = useStyles();
    
    return(
        <React.Fragment>
            <Typography className={classes.mainTitle}>Timeline</Typography>
            <Grid container>
               <Grid item>
               </Grid>
            </Grid>
        </React.Fragment>
    );
    
}


const mapStateToProps = (state) => {
    return {
        state: state.formReducer.userPortal,
    }
}

export default connect(mapStateToProps, null)(DashboardTimeline)