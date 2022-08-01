import React, {useState} from 'react';
import { Container, Typography, Button, Grid, Box } from "@material-ui/core";
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import AddText from "./AddText";
import {COLORS} from "../../../constants";

const useStyles = makeStyles(() => ({
    cursorPointer: {
        cursor: 'pointer',
        color: 'silver',
        marginTop: 16
    },
    actionButton: {
        borderRadius: 20,
        marginBottom: 16,
        backgroundColor: COLORS?.secondary,
        marginTop: 16
    },
    answerIcon: {
        cursor: 'pointer',
        color: COLORS?.secondary,
        float: 'right',
        marginTop: -32
    }
}));

const defaultProps = {
    bgcolor: 'silver',
    m: 2,
    border: 2,
    borderColor: 'gray',
    borderRadius: 5,
}

const AddQA = (props) => {

    const { state, onAddQA } = props
    const classes = useStyles();
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [type, setType] = useState('');
    const [isQuestionSave, setQuestionSave] = useState(false);
    const [isAnswerSave, setAnswerSave] = useState(false);

    const onChangeText = (text) => {
        if (type === 'question') {
            setQuestion(text);
        } else {
            setAnswer(text);
        }
    }

    const handleSave = () => {
        if (question && answer) {
            const index = state.faq.indexOf(state.faq.find(x => x.id === state.faqActiveTab));
            onAddQA({
                id: `question-${state.faq[index].items.length}`,
                type: 'question',
                text: question,
                items: [{
                    id: 'answer-0',
                    type: 'answer',
                    text: answer
                }]
            })
        }
        type === 'question' ? setQuestionSave(true) : setAnswerSave(true);
        setType('');
    }

    return (
        <Container style={{minHeight: 200}}>
            <Grid container>
                <Grid item xs={12}>
                    {
                        (isQuestionSave && question) && <>
                                <Typography component={'h5'} variant={'h5'} style={{color: 'silver', marginLeft: 16, marginTop: 16}} >
                                    Question
                                </Typography>
                                <Box {...defaultProps}>
                                    <div dangerouslySetInnerHTML={{__html: question}} ></div>
                                    {
                                        !isAnswerSave && <QuestionAnswerIcon className={classes.answerIcon} onClick={() => {
                                            setType('answer');
                                        }} />
                                    }
                                </Box>
                            </>
                    }
                    {
                        !isQuestionSave && <Typography
                            component={'h6'}
                            variant={'h6'}
                            className={classes.cursorPointer}
                            onClick={() => setType('question')}
                        > + Add Question
                        </Typography>
                    }
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={12}>
                    {
                        (isAnswerSave && answer) && <>
                            <Typography component={'h5'} variant={'h5'} style={{color: 'silver', marginLeft: 16}} >
                                Answer
                            </Typography>
                                <Box {...defaultProps} style={{height: 100, overflow: 'auto'}} >
                                    <div dangerouslySetInnerHTML={{__html: answer}}></div>
                                </Box>
                        </>
                    }
                </Grid>
            </Grid>
            {
                type && <Typography component={'div'} style={{marginTop: 16, marginBottom: 16}}>
                    <AddText model={type ? (type === 'question' ? question : answer) : ''} onChangeModel={onChangeText} />
                    <Button
                        className={classes.actionButton}
                        variant="contained"
                        size="small"
                        color="primary"
                        aria-label="add"
                        onClick={handleSave}
                    >
                        SAVE

                    </Button>
                </Typography>
            }
        </Container>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

export default connect (mapStateToProps)(AddQA);