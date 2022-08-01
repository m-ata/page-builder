import React from 'react';
import {connect} from 'react-redux';
import styles from '../../../assets/jss/cloud-wiki/components/wikiWrapper.style'
import { resetState } from '../../../state/actions';
import WikiHeader from '../WikiHeader/WikiHeader';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(styles);


function CloudWikiWrapper(props){
    const classes = useStyles(props);
    
    const { children, resetState } = props;
    
    
    return(
        <div>
            <WikiHeader />
            <main className={classes.main}>
                <div className={classes.appBarSpace}/>
                <div className={classes.childWrapper}>
                    <Container className={classes.container}>
                        <Grid container>
                            <Grid item xs={12}>
                                {children}
                            </Grid>
                        </Grid>
                    </Container>
                </div>
            </main>
        </div>
    );
    
}

const mapDispatchToProps = (dispatch) => ({
    resetState: () => dispatch(resetState()),
})

const mapStateToProps = state => {
    return {
        state: state.formReducer.cloudWiki,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CloudWikiWrapper)