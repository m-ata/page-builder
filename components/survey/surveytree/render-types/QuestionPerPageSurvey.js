import React, {memo} from 'react'
import RadioOption from '../options/Radio'
import NoteOption from '../options/Note'
import TextAreaOption from '../options/TextArea'
import ColorOption from '../options/Color'
import PrivacyInfoOption from '../options/PrivacyInfo'
import TimeOption from '../options/Time'
import CounterOption from '../options/Counter'
import CurrencyOption from '../options/Currency'
import TextOption from '../options/Text'
import SpinEditOption from '../options/SpinEdit'
import SelectOption from '../options/Select'
import ScoreOption from '../options/Score'
import DateOption from '../options/Date'
import SubQuestionOption from '../options/SubQuestion'
import CheckOption from '../options/Check'
import GroupOption from '../options/Group'
import SurveyOption from '../options/Survey'
import SubGroupOption from '../options/SubGroup'
import QuestionOption from '../options/Question'

function getOnlySameTypes(typ, options) {
    const onlySameTypes = []
    options.map((x) => {
        if (x.typ === typ) {
            onlySameTypes.push(x)
        }
    })
    return onlySameTypes
}

function QuestionPerPageSurvey(props) {
    const { options, index, displayType, isHorzintal } = props

    let state = {
        survey: { typ: 'SURVEY' },
        subGroup: { typ: 'SUBGROUP' },
        question: { typ: 'QUESTION' },
        note: { typ: 'NOTE' },
        subQuestion: { typ: 'SUBQUESTION' },
        date: { typ: 'DATE' },
        score: { typ: 'SCORE' },
        spinEdit: { typ: 'SPINEDIT' },
        text: { typ: 'TEXT' },
        textArea: { typ: 'TEXTAREA' },
        currencyEdit: { typ: 'CURRENCYEDIT' },
        counter: { typ: 'COUNTER' },
        time: { typ: 'TIME' },
        privacyInfo: { typ: 'PRIVACY-INFO' },
        color: { typ: 'COLOR' },
        //<--- GROUPED OPTIONS--->
        group: { typ: 'GROUP', isRendered: false },
        check: { typ: 'CHECK', isRendered: false },
        selectOption: { typ: 'SELECT-OPTION', isRendered: false },
        radio: { typ: 'RADIO', isRendered: false },
    }

    return options.map((option, i) => {
        //calculate index numbers
        let indexValue
        if (index) {
            if (option.typ === state.question.typ || option.typ === state.subQuestion.typ) {
                indexValue = String(index) + '.' + String(i + 1)
            } else {
                indexValue = String(index)
            }
        } else {
            indexValue = String(i + 1)
        }

        if (option.typ === state.survey.typ) {
            return <SurveyOption option={option} optionTyp={state.survey.typ} index={indexValue} key={i} />
        } else if (option.typ === state.subGroup.typ) {
            return <SubGroupOption option={option} optionTyp={state.subGroup.typ} index={indexValue} key={i} />
        } else if (option.typ === state.question.typ) {
            return <QuestionOption option={option} optionTyp={state.question.typ} index={indexValue} key={i} />
        } else if (option.typ === state.note.typ) {
            return <NoteOption option={option} optionTyp={state.note.typ} index={indexValue} key={i} />
        } else if (option.typ === state.subQuestion.typ) {
            return <SubQuestionOption option={option} optionTyp={state.subQuestion.typ} index={indexValue} key={i} />
        } else if (option.typ === state.date.typ) {
            return <DateOption option={option} optionTyp={state.date.typ} index={indexValue} key={i} />
        } else if (option.typ === state.score.typ) {
            return <ScoreOption option={option} optionTyp={state.score.typ} index={indexValue} key={i} />
        } else if (option.typ === state.text.typ) {
            return <TextOption option={option} optionTyp={state.text.typ} index={indexValue} key={i} />
        } else if (option.typ === state.textArea.typ) {
            return <TextAreaOption option={option} optionTyp={state.textArea.typ} index={indexValue} key={i} />
        } else if (option.typ === state.currencyEdit.typ) {
            return <CurrencyOption option={option} optionTyp={state.currencyEdit.typ} index={indexValue} key={i} />
        } else if (option.typ === state.time.typ) {
            return <TimeOption option={option} optionTyp={state.time.typ} index={indexValue} key={i} />
        } else if (option.typ === state.privacyInfo.typ) {
            return <PrivacyInfoOption option={option} optionTyp={state.privacyInfo.typ} index={indexValue} key={i} />
        } else if (option.typ === state.color.typ) {
            return <ColorOption option={option} optionTyp={state.color.typ} index={indexValue} key={i} />
        } else if (option.typ === state.spinEdit.typ) {
            return <SpinEditOption option={option} optionTyp={state.spinEdit.typ} index={indexValue} key={i} />
        } else if (option.typ === state.counter.typ) {
            return <CounterOption option={option} optionTyp={state.counter.typ} index={indexValue} key={i} />
            //<--- GROUPED OPTIONS--->
        } else if (option.typ === state.group.typ && !state.group.isRendered) {
            state = {
                ...state,
                group: { ...state.group, isRendered: true },
            }
            return (
                <GroupOption
                    options={getOnlySameTypes(state.group.typ, options)}
                    optionTyp={state.group.typ}
                    index={indexValue}
                    key={i}
                />
            )
        } else if (option.typ === state.check.typ && !state.check.isRendered) {
            state = {
                ...state,
                check: { ...state.check, isRendered: true },
            }
            return (
                <CheckOption
                    isHorzintal={isHorzintal}
                    options={getOnlySameTypes(state.check.typ, options)}
                    optionTyp={state.check.typ}
                    index={indexValue}
                    key={i}
                />
            )
        } else if (option.typ === state.selectOption.typ && !state.selectOption.isRendered) {
            state = {
                ...state,
                selectOption: { ...state.selectOption, isRendered: true },
            }
            return (
                <SelectOption
                    options={getOnlySameTypes(state.selectOption.typ, options)}
                    optionTyp={state.selectOption.typ}
                    index={indexValue}
                    key={i}
                />
            )
        } else if (option.typ === state.radio.typ && !state.radio.isRendered) {
            state = {
                ...state,
                radio: { ...state.radio, isRendered: true },
            }
            return (
                <RadioOption
                    isHorzintal={isHorzintal}
                    options={getOnlySameTypes(state.radio.typ, options)}
                    optionTyp={state.radio.typ}
                    index={indexValue}
                    key={i}
                />
            )
        }
    })
}

export default memo(QuestionPerPageSurvey)
