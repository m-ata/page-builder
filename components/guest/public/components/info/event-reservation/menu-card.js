import React, { useContext } from 'react'
import { connect } from 'react-redux'
import clsx from 'clsx'
import { setToState, updateState } from 'state/actions'
import { makeStyles } from '@material-ui/core/styles'
import ButtonBase from '@material-ui/core/ButtonBase'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import WebCmsGlobal from "../../../../../webcms-global";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        minWidth: 300,
        width: '100%',
        padding: 15,
    },
    image: {
        position: 'relative',
        height: 100,
        [theme.breakpoints.down('xs')]: {
            width: '100% !important', // Overrides inline-style
            height: 100,
        },
        '&:hover, &$focusVisible': {
            zIndex: 1,
            '& $imageBackdrop': {
                opacity: 0.3,
            },
            '& $imageMarked': {
                opacity: 0,
            },
            '& $imageTitle': {
                border: '4px solid currentColor',
            },
        },
    },
    focusVisible: {},
    imageButton: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.common.white,
    },
    imageSrc: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        borderRadius: 10,
        filter: 'blur(3px)',
        '-webkit-filter': 'blur(3px)'
    },
    imageBackdrop: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: theme.palette.common.black,
        opacity: 0.6,
        transition: theme.transitions.create('opacity'),
        borderRadius: 10,
    },
    imageTitle: {
        position: 'relative',
        padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${theme.spacing(1) + 6}px`,
    },
    imageMarked: {
        height: 3,
        width: 18,
        backgroundColor: theme.palette.common.white,
        position: 'absolute',
        bottom: -2,
        left: 'calc(50% - 9px)',
        transition: theme.transitions.create('opacity'),
    },
    active: {
        border: '4px solid currentColor',
    },
    activeDot: {
        '&:after': {
            content: "''",
            width: 10,
            height: 10,
            position: 'absolute',
            borderRadius: '50%',
            backgroundColor: '#4caf50'
        },
    }
}))

const MenuCard = (props) => {
    const classes = useStyles()

    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const { state, selectGroupName, description, imageUrl, onClick, isOnlyProduct } = props
    const checkGuestGroup = state.selectGuestProductList.findIndex((item) => item.groupname === description)
    const isPortal = GENERAL_SETTINGS.ISPORTAL;
    let imageWithStaticUrl = imageUrl

    if(!imageUrl?.includes(GENERAL_SETTINGS.STATIC_URL)) {
        imageWithStaticUrl = GENERAL_SETTINGS.STATIC_URL + imageUrl
    }

    return (
        <Grid item xs={12} sm={isPortal ? selectGroupName ? 12 : 4 : 6} onClick={() => onClick(description)}>
            <ButtonBase
                className={classes.image}
                focusVisibleClassName={classes.focusVisible}
                style={{ width: '100%' }}
            >
                <span className={classes.imageSrc} style={imageWithStaticUrl ? { backgroundImage: `url(${imageWithStaticUrl})` } : {}} />
                <span className={classes.imageBackdrop} />
                <span className={classes.imageButton}>
                    <Typography
                        component="span"
                        variant="subtitle1"
                        color="inherit"
                        className={clsx(classes.imageTitle, {
                            [classes.active]: description === selectGroupName ? true : false,
                            [classes.activeDot]: checkGuestGroup > -1 ? true : false,
                        })}
                    >
                        {description}
                        <span className={classes.imageMarked} />
                    </Typography>
                </span>
            </ButtonBase>
        </Grid>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(MenuCard)
