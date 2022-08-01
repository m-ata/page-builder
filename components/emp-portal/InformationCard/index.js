import React from "react";
import {
    Grid,
    Typography,
    Paper
} from "@material-ui/core";
import clsx from "clsx";
import {makeStyles} from "@material-ui/core/styles";
import AlignToCenter from "../../AlignToCenter";
import LoadingSpinner from "../../LoadingSpinner";

const useStyles = makeStyles(theme => ({
    subText: {
        fontSize: "14px",
        fontWeight: "600",
    },
    textColor: {
        color: theme.palette.text.main
    },
}))

function InformationCard(props) {
    const classes = useStyles();

    const { data, isArray, array, renderNested, elevation, disablePadding, name, isLoading } = props


    return(
        <Paper elevation={parseInt(elevation) <= 0 ? 0 : 2} style={{position: 'relative'}}>
            {
                isLoading && (
                    <AlignToCenter backgroundColor={'rgb(0,0,0,0.1)'}>
                        <LoadingSpinner size={24}/>
                    </AlignToCenter>
                )
            }
            <div style={{ padding: disablePadding ? 0 : '24px 32px'}}>
                {
                    isArray ? (
                        array.length > 0 ? (
                            array.map((arrayItem,arrayIndex) => (
                                <React.Fragment>
                                    <Grid container spacing={2} key={`${name || 'info'}-container-${arrayIndex}`}>
                                        {
                                            data && data.map((item,index) => (
                                                <Grid item key={`info-grid-${index}`} {...item.gridProps}>
                                                    <Typography className={clsx(classes.subText, classes.textColor)} style={{opacity: ".7"}}>
                                                        {item?.title || ''}
                                                    </Typography>
                                                    <Typography className={classes.subText}>
                                                        {arrayItem[item.field] || ''}
                                                    </Typography>
                                                </Grid>
                                            ))
                                        }
                                    </Grid>
                                    {
                                        arrayIndex < array.length - 1 && (
                                            <div style={{paddingBottom: '32px'}}/>
                                        )
                                    }
                                    {renderNested && (
                                        <div style={{paddingTop: '32px'}}>
                                            {renderNested}
                                        </div>
                                    )}
                                </React.Fragment>

                            ))
                            ) : (
                            <React.Fragment>
                                <Grid container spacing={2}>
                                    {
                                        data && data.map((item,index) => (
                                            <Grid item key={`info-grid-${index}`} {...item.gridProps}>
                                                <Typography className={clsx(classes.subText, classes.textColor)} style={{opacity: ".7"}}>
                                                    {item?.title || ''}
                                                </Typography>
                                                <Typography className={classes.subText}>
                                                    {''}
                                                </Typography>
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                                <div style={{paddingBottom: '32px'}}/>
                                {renderNested && (
                                    <div style={{paddingTop: '32px'}}>
                                        {renderNested}
                                    </div>
                                )}
                            </React.Fragment>
                        )
                    ) : (
                        <Grid container spacing={2}>
                            {
                                data && data.map((item,index) => (
                                    <Grid item key={`info-grid-${index}`} {...item.gridProps}>
                                        <Typography className={clsx(classes.subText, classes.textColor)} style={{opacity: ".7"}}>
                                            {item?.title || ''}
                                        </Typography>
                                        <Typography className={classes.subText}>
                                            {item?.value || ''}
                                        </Typography>
                                    </Grid>
                                ))
                            }
                        </Grid>
                    )
                }
            </div>
        </Paper>

    )
}

export default InformationCard;