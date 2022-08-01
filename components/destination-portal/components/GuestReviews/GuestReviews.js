import React, {useEffect, useState, useRef} from "react";
import {makeStyles} from '@material-ui/core/styles'
import {CustomToolTip} from "../../../user-portal/components/CustomToolTip/CustomToolTip";
import {
    Avatar,
    Card,
    CardContent,
    Grid,
    Typography,
    Button
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import moment from 'moment'
import ScoreBox from "../ScoreBox/ScoreBox";
import useTranslation from "../../../../lib/translations/hooks/useTranslation";

const useStyles = makeStyles((theme) => ({
    commentLine: {
        minHeight: '72px',
        height: '72px',
        maxHeight: '72px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        transition:' max-height 0.25s ease-out -webkit-line-clamp 0.25s ease-out',
        '-webkit-line-clamp': 3,
        '-webkit-box-orient': "vertical",
        '-webkit-transition': 'max-height 0.25s ease-out -webkit-line-clamp 0.25s ease-out',
        '-moz-transition': 'max-height 0.25s ease-out -webkit-line-clamp 0.25s ease-out',
        '-o-transition': 'max-height 0.25s ease-out'
    },
    commentLineFull: {
        minHeight: 'auto',
        height: 'auto',
        maxHeight: '100%',
    },
    clientName: {
        textAlign: "center",
        paddingTop: "4px",
        textTransform: "capitalize",
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
}))

function GuestReviews(props) {
    const classes = useStyles();

    //props
    const { review, index, page } = props

    //context
    const { t } = useTranslation();

    //state
    const [isCommentNoteOverFlow, setIsCommentNoteOverFlow] = useState(false);
    const [isClientNameOverflow, setIsClientNameOverflow] = useState(false);
    const [isShowAll, setIsShowAll] = useState(false);
    const [initialValue, setInitialValue] = useState(false);


    //ref
    let commentRef = null;
    let clientNameRef = null



    const handleRef = (element) => {
        commentRef = element
        setIsCommentNoteOverFlow(element?.offsetHeight < element?.scrollHeight)
    }

    const handleClientNameRef = (element) => {
        clientNameRef = element
        setIsClientNameOverflow(element?.offsetWidth < element?.scrollWidth)
    }

   const handleShowAll = () => {
        setIsShowAll(!isShowAll)
       setInitialValue(true);
   }

   useEffect(() => {
       setIsShowAll(false);
       setInitialValue(false);
   }, [page])


    return(
        <Card key={index} style={{backgroundColor: "#EBEBEB"}}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'end'}}>
                            <Typography style={{textAlign: 'right', paddingRight: '8px'}}>{`${moment(review?.transdate).format('DD.MM.YYYY')} / ${moment(review?.transtime, "HH:mm:ss").format("HH:mm")}`}</Typography>
                            <ScoreBox score={review?.totalscore}/>
                        </div>
                    </Grid>
                    <Grid item xs={3}>
                        <Avatar style={{margin:"auto"}}>{review?.clientname?.charAt(0) || ''}</Avatar>
                        {
                            isClientNameOverflow ? (
                                <CustomToolTip title={review?.clientname}>
                                    <Typography className={classes.clientName} ref={handleClientNameRef}>{review?.clientname?.toLowerCase() || ''}</Typography>
                                </CustomToolTip>
                            ) : (
                                <Typography className={classes.clientName} ref={handleClientNameRef}>{review?.clientname?.toLowerCase() || ''}</Typography>
                            )
                        }
                    </Grid>
                    <Grid item xs={9} style={{minHeight: '120px'}}>
                        <Typography id={`page-${page}.note-${index}`} ref={handleRef} className={isShowAll ? classes.commentLineFull : classes.commentLine}>{review?.revnote || ''}</Typography>
                        {
                            isCommentNoteOverFlow || initialValue ? (
                                <div style={{textAlign: 'center'}}>
                                    <Button variant={'outlined'} onClick={handleShowAll} endIcon={isShowAll ? <ExpandLessIcon/> : <ExpandMoreIcon />} style={{textTransform: 'none'}}>{isShowAll ? t('str_hide') : t('str_showAll')}</Button>
                                </div>
                            ) : null
                        }
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default GuestReviews;