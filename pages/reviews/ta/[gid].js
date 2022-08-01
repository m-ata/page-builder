//React And Redux
import React, { useContext, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { setToState, updateState } from 'state/actions'
//Library
import axios from 'axios'
import { LocaleContext } from 'lib/translations/context/LocaleContext'
//Material-Ui
import { makeStyles } from '@material-ui/core/styles'
import { Box, Container, Paper } from '@material-ui/core'
//Styles
import styles from 'components/epay/epay.style'
import ReviewsLayout from 'components/layout/containers/ReviewsLayout'
import LoadingSpinner from 'components/LoadingSpinner'
import { getBrowser, getDeviceType } from 'lib/helpers/useFunction'

const useStyles = makeStyles(styles)

const TaReviewsPage = (props) => {
    const { gid } = props
        , { locale } = useContext(LocaleContext)
        , classes = useStyles()
        , [isTaFrameLoad, setIsTaFrameLoad] = useState(false)
        , [pageData, setPageData] = useState(false)
        , [fetchLang, setFetchLang] = useState(null)

    useEffect(() => {
        if(locale !== fetchLang)
            fetchReviewsInformationData()
    }, [locale])

    async function fetchReviewsInformationData() {
        await axios({
            url: 'api/hotel/reviews/ta',
            method: 'post',
            params: {
                gid: gid,
                lang: locale,
                browserdesc: getBrowser().name,
                devicedesc: getDeviceType()
            },
        }).then((response) => {
            if (response.status === 200 && response.data.success) {
                const data = response.data && response.data
                setPageData(data && data || null)
                setFetchLang(locale)
            } else {
                setPageData(null)
                setFetchLang(locale)
            }
        }).catch(() => {
            setPageData(null)
            setFetchLang(locale)
        })
    }

    return (
            <ReviewsLayout>
                <Container maxWidth="md" className={classes.wrapper}>
                    <Paper className={classes.paperBottomWrap}>
                        <Box p={3}>
                            {!isTaFrameLoad ?
                                <div style={{ height: 300, position: 'relative' }}>
                                    <LoadingSpinner size={40} style={{ position: 'absolute', top: '40%', left: '50%' }}/>
                                </div>
                                : null
                            }
                            {pageData ? <iframe
                                onLoad={() => setIsTaFrameLoad(true)}
                                allowpaymentrequest="false"
                                target="self"
                                src={pageData.taFrameUrl}
                                style={{
                                    width: '100%',
                                    minHeight: '1050px',
                                    height: '100%',
                                    border: '0px',
                                    display: isTaFrameLoad ? "block": "none"
                                }}
                            /> : null}
                        </Box>
                    </Paper>
                </Container>
            </ReviewsLayout>
    )
}

export const getServerSideProps = async (ctx) => {
    const { query } = ctx
    const gid = await query.gid

    return {
        props: {
            gid: gid && gid.toLowerCase() || ""
        }
    }
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

export default connect(mapStateToProps, mapDispatchToProps)(TaReviewsPage)
