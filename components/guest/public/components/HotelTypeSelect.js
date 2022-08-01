import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
import useTranslation from 'lib/translations/hooks/useTranslation'
import WebCmsGlobal from 'components/webcms-global'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
    hotelTypeContainer: {
        marginTop: 10,
        marginBottom: 40
    },
    root: {
        maxWidth: 'auto',
    },
    media: {
        height: 350,
    },
    cardActionButtons: {
        marginLeft: 'auto',
        paddingRight: 5
    }
})

const HotelTypeCard = (props) => {
    const classes = useStyles()
    const { thumbnail, title, catId, catCode, onSelect } = props
    const { t } = useTranslation()

    return (
        <Card className={classes.root}>
            <CardActionArea>
                <CardMedia
                    className={classes.media}
                    image={thumbnail}
                    title={title.renderText() || ""}
                />
                <CardContent>
                    <Typography variant='h5' component='h2'>
                        {title.renderText() || ""}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <div className={classes.cardActionButtons}>
                    <Button size='small' color='primary' onClick={()=> onSelect(catId, catCode, title)}>
                        {t('str_seeOffer')}
                    </Button>
                </div>
            </CardActions>
        </Card>
    )
}

const HotelTypeSelect = (props) => {
    const classes = useStyles()
    const { state, setToState } = props
    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    return (
        <div className={classes.hotelTypeContainer}>
            <Grid container spacing={4}>
                {state?.hotelType?.data ? (
                    state.hotelType.data.sort((a, b) => a.orderno - b.orderno).map((item, i) =>
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <HotelTypeCard
                                thumbnail={GENERAL_SETTINGS?.STATIC_URL + item?.url || ''}
                                catId={item?.catid || false}
                                catCode={item?.catcode || false}
                                title={item?.localtitle || item?.title || item?.catdesc || false}
                                onSelect={(id, code, title) => [
                                    setToState('guest', ['hotelType', 'chosenId'], id),
                                    setToState('guest', ['hotelType', 'chosenCode'], code),
                                    setToState('guest', ['hotelType', 'chosenTitle'], title)
                                ]}
                            />
                        </Grid>,
                    )
                ) : null}
            </Grid>
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.guest,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HotelTypeSelect)
