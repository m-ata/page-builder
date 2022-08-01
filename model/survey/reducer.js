import { combineReducers } from 'redux'
import {
    DELETE_SURVEY_ANSWER,
    RESET_SURVEY_ANSWERS,
    RESET_SURVEY_FILES,
    SET_SURVEY_ANSWER,
    SET_SURVEY_ANSWER_MULTI, SET_SURVEY_BGCOLOR,
    SET_SURVEY_DISPLAY_TYPE,
    SET_SURVEY_FILES,
    SET_SURVEY_GROUP,
    SET_SURVEY_IS_VALID,
    SET_SURVEY_LAST_GROUP,
    SET_SURVEY_LAST_PAGE,
    SET_SURVEY_PAGE, SET_SURVEY_THANKYOU_FILE,
    SET_SURVEY_TRANS,
    SET_SURVEY_INFO
} from './actionTypes'

function answers(state = {}, action) {
    switch (action.type) {
        case SET_SURVEY_ANSWER:
            if (state[action.payload.trans] && state[action.payload.trans][action.payload.questionId]) {
                //deletion of user answers of the same typ
                Object.keys(state[action.payload.trans][action.payload.questionId]).map((k) => {
                    if (
                        action.payload.value &&
                        state[action.payload.trans][action.payload.questionId][k] &&
                        action.payload.value.typ === state[action.payload.trans][action.payload.questionId][k].typ
                    ) {
                        delete state[action.payload.trans][action.payload.questionId][k]
                    }
                })
                return {
                    ...state,
                    [action.payload.trans]: {
                        ...state[action.payload.trans],
                        [action.payload.questionId]: {
                            ...state[action.payload.trans][action.payload.questionId],
                            [action.payload.answerId]: action.payload.value,
                        },
                    },
                }
            } else {
                return {
                    ...state,
                    [action.payload.trans]: {
                        ...state[action.payload.trans],
                        [action.payload.questionId]: {
                            [action.payload.answerId]: action.payload.value,
                        },
                    },
                }
            }
        case SET_SURVEY_ANSWER_MULTI:
            if (state[action.payload.trans] && state[action.payload.trans][action.payload.questionId]) {
                return {
                    ...state,
                    [action.payload.trans]: {
                        ...state[action.payload.trans],
                        [action.payload.questionId]: {
                            ...state[action.payload.trans][action.payload.questionId],
                            [action.payload.answerId]: action.payload.value,
                        },
                    },
                }
            } else {
                return {
                    ...state,
                    [action.payload.trans]: {
                        ...state[action.payload.trans],
                        [action.payload.questionId]: {
                            [action.payload.answerId]: action.payload.value,
                        },
                    },
                }
            }
        case DELETE_SURVEY_ANSWER:
            if (
                state[action.payload.trans] &&
                state[action.payload.trans][action.payload.questionId] &&
                state[action.payload.trans][action.payload.questionId][action.payload.answerId]
            ) {
                delete state[action.payload.trans][action.payload.questionId][action.payload.answerId]
            }
            return state
        case RESET_SURVEY_ANSWERS:
            return {}
        default:
            return state
    }
}

function files(state = {}, action) {
    switch (action.type) {
        case SET_SURVEY_FILES:
            return {
                ...state,
                [action.payload.trans]: {
                    ...state[action.payload.trans],
                    [action.payload.optionId]: action.payload.value,
                },
            }
        case RESET_SURVEY_FILES:
            return {}
        default:
            return state
    }
}

function trans(state = null, action) {
    switch (action.type) {
        case SET_SURVEY_TRANS:
            return action.payload.value
        default:
            return state
    }
}

function isValid(state = false, action) {
    switch (action.type) {
        case SET_SURVEY_IS_VALID:
            return action.payload.value
        default:
            return state
    }
}

function displayType(state = 0, action) {
    switch (action.type) {
        case SET_SURVEY_DISPLAY_TYPE:
            return action.payload.value
        default:
            return state
    }
}

function page(state = 0, action) {
    switch (action.type) {
        case SET_SURVEY_PAGE:
            return action.payload.value
        default:
            return state
    }
}

function lastPage(state = 0, action) {
    switch (action.type) {
        case SET_SURVEY_LAST_PAGE:
            return action.payload.value
        default:
            return state
    }
}

function group(state = 0, action) {
    switch (action.type) {
        case SET_SURVEY_GROUP:
            return action.payload.value
        default:
            return state
    }
}

function lastGroup(state = 0, action) {
    switch (action.type) {
        case SET_SURVEY_LAST_GROUP:
            return action.payload.value
        default:
            return state
    }
}

function bgColor(state = false, action) {
    switch (action.type) {
        case SET_SURVEY_BGCOLOR:
            return action.payload.value
        default:
            return state
    }
}

function thankYouFile(state = false, action) {
    switch (action.type) {
        case SET_SURVEY_THANKYOU_FILE:
            return action.payload.value
        default:
            return state
    }
}

function surveyInfo(state = false, action) {
    switch (action.type) {
        case SET_SURVEY_INFO:
            return action.payload.value
        default:
            return state
    }
}

const survey = combineReducers({
    answers,
    files,
    trans,
    isValid,
    displayType,
    page,
    lastPage,
    group,
    lastGroup,
    bgColor,
    thankYouFile,
    surveyInfo
})

export default survey
