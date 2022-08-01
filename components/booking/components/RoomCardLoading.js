import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { CircularProgress, Paper, Box, Grid } from '@material-ui/core'
import Skeleton from '@material-ui/lab/Skeleton'


const useStyles = makeStyles(() => ({
    root: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'start',
    },
    paper: {
      marginBottom: 20,
      minHeight: 290,
      backgroundColor: '#fff',
      border: '1px solid #dadadd',
     borderRadius: 6,
    },
    wrapper: {
        position: 'relative',
    },
    buttonProgress: {
        color: 'green',
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
}))

const RoomCardSkeleton = () =>{
    const classes = useStyles()
    return (
        <Paper variant='outlined' square className={classes.paper}>
            <Box p={3}>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Skeleton variant='rect' style={{width: '100%', height: 240}} />
                    </Grid>
                    <Grid item xs={8}>
                        <Skeleton variant='text' style={{width: '100%', height: 40}}/>
                        <Skeleton animation="wave" />
                        <Skeleton animation="wave" />
                        <Skeleton animation="wave" />
                        <Skeleton animation="wave" />
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    )
}

export default function RoomCardLoading( { length= 4 }) {
    return (
        <React.Fragment>
            {Array.from({ length: length }).map((i, itemKey) => {
                return (
                    <RoomCardSkeleton key={itemKey}/>
                )
            })}
        </React.Fragment>
    )
}