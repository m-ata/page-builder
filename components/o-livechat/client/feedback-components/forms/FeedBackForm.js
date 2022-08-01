import React from 'react';
import Typography from '@material-ui/core/Typography';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import { makeStyles } from '@material-ui/core/styles';
import { COLORS } from '../../../constants';
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles({
    root: {
        padding: '40px 30px 0 30px',
        minHeight: '100%'
    },
    formHeader: {
        color: COLORS.backgroundDark,
        fontSize: '20px',
        marginBottom: '60px'
    },
    textAreaCaption: {
        fontSize: '12px',
        color: COLORS.secondaryDark,
        marginBottom: '5px'
    }
});



const FeedBackForm = ({ formHeader, handleChange }) => {
    const { t } = useTranslation()
    const classes = useStyles();
    return (
        <section className={classes.root}>
            <Typography variant="h5"
                className={classes.formHeader}>
                {formHeader}
            </Typography>
            <Typography
                variant="caption"
                className={classes.textAreaCaption}
                display="block"
            >

                {t('str_yourAnswer')}
            </Typography>
            <TextareaAutosize
                onChange={handleChange}
                aria-label="minimum height"
                rowsMin={6}
                rowsMax={6}
                style={{
                    minWidth: '100%',
                    resize: 'none',
                    border: '1px solid #cccccc',
                    borderRadius: '5px',
                    background: '#FAFAFA'
                }}
            />
        </section>
    )
};


export default FeedBackForm;

