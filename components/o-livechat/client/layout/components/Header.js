import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
// import CropFreeIcon from '@material-ui/icons/CropFree';
import CloseIcon from '@material-ui/icons/Close';

import { COLORS } from "../../../constants/index";

import { connect } from 'react-redux';
import { updateState } from 'state/actions';



const useStyles = makeStyles({
    root: {
        padding: '0 10px',
        textAlign: 'right',
        minWidth: '100%',

    },
    container: {
        padding: '8px 0px',
        borderBottom: `1px solid ${COLORS.borderColor}`
    },
    cropFree: {
        marginRight: '10px',
        color: COLORS.primary,
        cursor: 'pointer',
        fontSize: '22px'
    },
    powerIcon: {
        background: COLORS.errorColor,
        borderRadius: '100%',
        lineHeight: 0,
        color: 'white',
        cursor: 'pointer',
        fontSize: '22px'
    }
});





const Header = (props) => {
    const classes = useStyles();
    const { state, updateState } = props


    const navigate = () => {
        if (!state.initialScreen) {
            updateState(
                'oLiveChat',
                'initialScreen',
                // 1
                0
            )
            //delete it when implmentation is complete
            updateState(
                'oLiveChat',
                'widgetVisibility',
                false
            )
        } else {
            updateState(
                'oLiveChat',
                'initialScreen',
                0
            )
            updateState(
                'oLiveChat',
                'widgetVisibility',
                false
            )
        }
    }

    return (
        <section className={classes.root}>
            <div className={classes.container}>
                {/* <CropFreeIcon

                    className={classes.cropFree}
                /> */}
                <CloseIcon
                    onClick={navigate}
                    className={classes.powerIcon}
                />
            </div>
            {props.children}
        </section>
    )
}


const mapStateToProps = (state) => {
    return {
        state: state.formReducer.oLiveChat,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Header)
