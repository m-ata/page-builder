import React from 'react';
//mui imports
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import {makeStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
//custom imports
import {COLORS} from "../../constants";

const useStyles = makeStyles(theme => ({
    emailText: {
        color: COLORS?.secondary,
        marginLeft: theme.spacing(1),
        marginTop: theme.spacing(2),
    },
}));

const Index = () => {

    const classes = useStyles();
    return (
        <Container>
            <Grid container>
                <Grid item xs={6}>
                    <Typography className={classes.emailText} variant="h4">
                        Email
                    </Typography>
                </Grid>
            </Grid>
        </Container>
    )
}

export default Index;