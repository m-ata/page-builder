import { ADD_TO_STATE, DELETE_FROM_STATE, initialState, PUSH_TO_STATE, SET_TO_STATE, UPDATESTATE, RESET_STATE } from '../constants'
import update from 'react-addons-update'

const FormReducer = (state = initialState, action) => {
    switch (action.type) {
        case RESET_STATE:
            return initialState
        case UPDATESTATE:
            return update(state, {
                [action.payload.stateType]: {
                    [action.payload.stateName]: { $set: action.payload.value },
                },
            })
        case SET_TO_STATE:
            if (action.payload.stateName.length === 1) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: { $set: action.payload.value },
                    },
                })
            } else if (action.payload.stateName.length === 2) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: { $set: action.payload.value },
                        },
                    },
                })
            } else if (action.payload.stateName.length === 3) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: {
                                [action.payload.stateName[2]]: { $set: action.payload.value },
                            },
                        },
                    },
                })
            } else if (action.payload.stateName.length === 4) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: {
                                [action.payload.stateName[2]]: {
                                    [action.payload.stateName[3]]: { $set: action.payload.value },
                                },
                            },
                        },
                    },
                })
            } else if (action.payload.stateName.length === 5) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: {
                                [action.payload.stateName[2]]: {
                                    [action.payload.stateName[3]]: {
                                        [action.payload.stateName[4]]: { $set: action.payload.value },
                                    },
                                },
                            },
                        },
                    },
                })
            } else if (action.payload.stateName.length === 6) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: {
                                [action.payload.stateName[2]]: {
                                    [action.payload.stateName[3]]: {
                                        [action.payload.stateName[4]]: {
                                            [action.payload.stateName[5]]: { $set: action.payload.value },
                                        },
                                    },
                                },
                            },
                        },
                    },
                })
            } else if (action.payload.stateName.length === 7) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: {
                                [action.payload.stateName[2]]: {
                                    [action.payload.stateName[3]]: {
                                        [action.payload.stateName[4]]: {
                                            [action.payload.stateName[5]]: {
                                                [action.payload.stateName[6]]: { $set: action.payload.value },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                })
            }
        case PUSH_TO_STATE:
            if (action.payload.stateName.length === 1) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: { $push: action.payload.value },
                    },
                })
            } else if (action.payload.stateName.length === 2) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: { $push: action.payload.value },
                        },
                    },
                })
            } else if (action.payload.stateName.length === 3) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: {
                                [action.payload.stateName[2]]: { $push: action.payload.value },
                            },
                        },
                    },
                })
            } else if (action.payload.stateName.length === 4) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: {
                                [action.payload.stateName[2]]: {
                                    [action.payload.stateName[3]]: { $push: action.payload.value },
                                },
                            },
                        },
                    },
                })
            }
        case DELETE_FROM_STATE:
            if (action.payload.stateName.length === 1) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            $splice: [[[action.payload.value[0]], [action.payload.value[1]]]],
                        },
                    },
                })
            } else if (action.payload.stateName.length === 2) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: {
                                $splice: [[[action.payload.value[0]], [action.payload.value[1]]]],
                            },
                        },
                    },
                })
            } else if (action.payload.stateName.length === 3) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: {
                                [action.payload.stateName[2]]: {
                                    $splice: [[[action.payload.value[0]], [action.payload.value[1]]]],
                                },
                            },
                        },
                    },
                })
            } else if (action.payload.stateName.length === 4) {
                return update(state, {
                    [action.payload.stateType]: {
                        [action.payload.stateName[0]]: {
                            [action.payload.stateName[1]]: {
                                [action.payload.stateName[2]]: {
                                    [action.payload.stateName[3]]: {
                                        $splice: [[[action.payload.value[0]], [action.payload.value[1]]]],
                                    },
                                },
                            },
                        },
                    },
                })
            }
        case ADD_TO_STATE:
            if (action.payload.stateName.length === 1) {
                return {
                    ...state, //copy state
                    [action.payload.stateType]: {
                        ...state[action.payload.stateType], //copy stateType
                        [action.payload.stateName[0]]: action.payload.value,
                    },
                }
            } else if (action.payload.stateName.length === 2) {
                return {
                    ...state, //copy state
                    [action.payload.stateType]: {
                        ...state[action.payload.stateType], //copy stateType
                        [action.payload.stateName[0]]: {
                            ...state[action.payload.stateType][action.payload.stateName[0]], //copy 0
                            [action.payload.stateName[1]]: action.payload.value,
                        },
                    },
                }
            } else if (action.payload.stateName.length === 3) {
                return {
                    ...state, //copy state
                    [action.payload.stateType]: {
                        ...state[action.payload.stateType], //copy stateType
                        [action.payload.stateName[0]]: {
                            ...state[action.payload.stateType][action.payload.stateName[0]], //copy 0
                            [action.payload.stateName[1]]: {
                                ...state[action.payload.stateType][action.payload.stateName[0]][
                                    action.payload.stateName[1]
                                ], //copy 1
                                [action.payload.stateName[2]]: action.payload.value,
                            },
                        },
                    },
                }
            } else if (action.payload.stateName.length === 4) {
                return {
                    ...state, //copy state
                    [action.payload.stateType]: {
                        ...state[action.payload.stateType], //copy stateType
                        [action.payload.stateName[0]]: {
                            ...state[action.payload.stateType][action.payload.stateName[0]], //copy 0
                            [action.payload.stateName[1]]: {
                                ...state[action.payload.stateType][action.payload.stateName[0]][
                                    action.payload.stateName[1]
                                ], //copy 1
                                [action.payload.stateName[2]]: {
                                    ...state[action.payload.stateType][action.payload.stateName[0]][
                                        action.payload.stateName[1]
                                    ][action.payload.stateName[2]], //copy 2
                                    [action.payload.stateName[3]]: action.payload.value,
                                },
                            },
                        },
                    },
                }
            }
        default:
            return state
    }
}

export default FormReducer
