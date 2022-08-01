import { ADD_TO_STATE, DELETE_FROM_STATE, PUSH_TO_STATE, SET_TO_STATE, UPDATESTATE, RESET_STATE } from '../constants'

export const resetState = () => {
    return (dispatch) => {
        dispatch({
            type: RESET_STATE
        })
    }
}

export const updateState = (stateType, stateName, value) => {
    return (dispatch) => {
        dispatch({
            type: UPDATESTATE,
            payload: {
                stateType,
                stateName,
                value,
            },
        })
    }
}

export const setToState = (stateType, stateName, value) => {
    return (dispatch) => {
        dispatch({
            type: SET_TO_STATE,
            payload: {
                stateType,
                stateName,
                value,
            },
        })
    }
}

export const pushToState = (stateType, stateName, value) => {
    return (dispatch) => {
        dispatch({
            type: PUSH_TO_STATE,
            payload: {
                stateType,
                stateName,
                value,
            },
        })
    }
}

export const deleteFromState = (stateType, stateName, value) => {
    return (dispatch) => {
        dispatch({
            type: DELETE_FROM_STATE,
            payload: {
                stateType,
                stateName,
                value,
            },
        })
    }
}

export const addToState = (stateType, stateName, value) => {
    return (dispatch) => {
        dispatch({
            type: ADD_TO_STATE,
            payload: {
                stateType,
                stateName,
                value,
            },
        })
    }
}
