import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import MobileStepper from '@material-ui/core/MobileStepper'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import { connect } from 'react-redux'
import { updateState } from '../../../../../state/actions'
import BedRoom from './Room'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: '100%',
        flexGrow: 1,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        paddingTop: theme.spacing(2),
        paddingLeft: theme.spacing(4),
        backgroundColor: theme.palette.background.default,
    },
    img: {
        height: 255,
        maxWidth: 400,
        overflow: 'hidden',
        display: 'block',
        width: '100%',
    },
}))

const RoomIdentifier = (props) => {
    const { roomType, activeBedType } = props
    const { t } = useTranslation()

    const classes = useStyles()
    const theme = useTheme()
    const [activeStep, setActiveStep] = useState(0)
    const maxSteps = roomType.totalroom

    useEffect(() => {
        setActiveStep(0) //reset active step
    }, [activeBedType.ind])

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const createBedRoom = (a, roomType) => {
        let BedRooms = []
        for (let i = 0; i < a; i++) {
            BedRooms.push(
                <BedRoom
                    key={i}
                    activeStep={activeStep}
                    room={roomType.rooms ? roomType.rooms[i] : null}
                    itemStep={i}
                />
            )
        }
        return BedRooms
    }

    return (
        <React.Fragment>
            <div className={classes.root}>
                <Paper square elevation={0} className={classes.header}>
                    {createBedRoom(maxSteps, roomType)}
                </Paper>
                <MobileStepper
                    steps={maxSteps}
                    position="static"
                    variant="text"
                    activeStep={activeStep}
                    nextButton={
                        <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
                            {t('str_next')}
                            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                        </Button>
                    }
                    backButton={
                        <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                            {t('str_back')}
                        </Button>
                    }
                />
            </div>
        </React.Fragment>
    )
}

RoomIdentifier.propTypes = {
    roomType: PropTypes.string,
    activeBedType: PropTypes.string,
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(RoomIdentifier)
