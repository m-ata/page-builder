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

export function setSurveyAnswer(trans, questionId, answerId, value) {
    return {
        type: SET_SURVEY_ANSWER,
        payload: {
            trans,
            questionId,
            answerId,
            value,
        },
    }
}

export function setSurveyAnswerMulti(trans, questionId, answerId, value) {
    return {
        type: SET_SURVEY_ANSWER_MULTI,
        payload: {
            trans,
            questionId,
            answerId,
            value,
        },
    }
}

export function deleteSurveyAnswer(trans, questionId, answerId) {
    return {
        type: DELETE_SURVEY_ANSWER,
        payload: {
            trans,
            questionId,
            answerId,
        },
    }
}

export function resetSurveyAnswers() {
    return { type: RESET_SURVEY_ANSWERS }
}

export function setSurveyFiles(trans, optionId, value) {
    return {
        type: SET_SURVEY_FILES,
        payload: {
            trans,
            optionId,
            value,
        },
    }
}

export function resetSurveyFiles() {
    return { type: RESET_SURVEY_FILES }
}

export function setSurveyTrans(value) {
    return {
        type: SET_SURVEY_TRANS,
        payload: {
            value,
        },
    }
}

export function setSurveyIsValid(value) {
    return {
        type: SET_SURVEY_IS_VALID,
        payload: {
            value,
        },
    }
}

export function setSurveyDisplayType(value) {
    return {
        type: SET_SURVEY_DISPLAY_TYPE,
        payload: {
            value,
        },
    }
}

export function setSurveyPage(value) {
    return {
        type: SET_SURVEY_PAGE,
        payload: {
            value,
        },
    }
}

export function setSurveyLastPage(value) {
    return {
        type: SET_SURVEY_LAST_PAGE,
        payload: {
            value,
        },
    }
}

export function setSurveyGroup(value) {
    return {
        type: SET_SURVEY_GROUP,
        payload: {
            value,
        },
    }
}

export function setSurveyLastGroup(value) {
    return {
        type: SET_SURVEY_LAST_GROUP,
        payload: {
            value,
        },
    }
}

export function setSurveyBgColor(value) {
    return {
        type: SET_SURVEY_BGCOLOR,
        payload: {
            value,
        },
    }
}

export function setSurveyThankYouFile(value) {
    return {
        type: SET_SURVEY_THANKYOU_FILE,
        payload: {
            value,
        },
    }
}

export function setSurveyInfo(value) {
    return {
        type: SET_SURVEY_INFO,
        payload: {
            value,
        },
    }
}