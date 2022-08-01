import React, {useState, useEffect} from 'react';
import { Container, Typography, Button, Grid, Box } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles';
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
    editIcon: {
        cursor: 'pointer',
        color: COLORS?.secondary,
        float: 'right',
        marginTop: -32,
        marginRight: 8
    }
}));

const defaultProps = {
    bgcolor: 'silver',
    m: 2,
    border: 2,
    borderColor: 'gray',
    borderRadius: 5,
}

const EditQA = (props) => {

    const { qaValue, onEditQA } = props;
    //local states
    const classes = useStyles();
    const [question, setQuestion] = useState('');
    const [tmpQuestion, setTmpQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [tmpAnswer, setTmpAnswer] = useState('');
    const [type, setType] = useState('');

    useEffect(() => {
        if (qaValue) {
            if (qaValue.text) {
                setQuestion(qaValue.text);
                setTmpQuestion(qaValue.text);
            }
            if (qaValue.items && qaValue.items.length > 0 && qaValue.items[0] && qaValue.items[0].text  ) {
                setAnswer(qaValue.items[0].text);
                setTmpAnswer(qaValue.items[0].text);
            }
        }
    }, [qaValue]);

    useEffect(() => {
        if (question && answer && qaValue && Object.keys(qaValue).length > 0) {
            onEditQA({
                id: qaValue.id,
                type: qaValue.type,
                text: question,
                items: [{
                    id: qaValue.items[0].id,
                    type: qaValue.items[0].type,
                    text: answer
                }]
            })
        }
    }, [question, answer]);

    const onChangeText = (text) => {
        if (type === 'question') {
            setTmpQuestion(text);
        } else {
            setTmpAnswer(text);
        }
    }

    const handleSave = () => {
        type === 'question' ? setQuestion(tmpQuestion) : setAnswer(tmpAnswer);
        setType('');
    }

    return (
        <Container style={{minHeight: 200}}>
            <Grid container>
                <Grid item xs={12}>
                    {
                        question && <>
                            <Typography component={'h5'} variant={'h5'} style={{color: 'silver', marginLeft: 16, marginTop: 16}} >
                                Question
                            </Typography>
                            <Box {...defaultProps}>
                                <div dangerouslySetInnerHTML={{__html: question}} ></div>
                                <EditIcon className={classes.editIcon} onClick={() => {
                                    setType('question');
                                }} />
                            </Box>
                        </>
                    }
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={12}>
                    {
                        answer && <>
                            <Typography component={'h5'} variant={'h5'} style={{color: 'silver', marginLeft: 16}} >
                                Answer
                            </Typography>
                            <Box {...defaultProps} style={{height: 100, overflow: 'auto'}} >
                                <div dangerouslySetInnerHTML={{__html: answer}}></div>
                                <EditIcon className={classes.editIcon} onClick={() => {
                                    setType('answer');
                                }} />
                            </Box>
                        </>
                    }
                </Grid>
            </Grid>
            {
                type && <Typography component={'div'} style={{marginTop: 16, marginBottom: 16}}>
                    <AddText model={type ? (type === 'question' ? tmpQuestion : tmpAnswer) : ''} onChangeModel={onChangeText} />
                    <Button
                        className={classes.actionButton}
                        variant="contained"
                        size="small"
                        color="primary"
                        aria-label="add"
                        onClick={handleSave}
                        disabled={!tmpQuestion || !tmpAnswer}
                    >
                        SAVE

                    </Button>
                </Typography>
            }
        </Container>
    )
}

export default EditQA;