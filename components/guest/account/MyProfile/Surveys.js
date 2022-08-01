import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import styles from './style/Surveys.style'
import stylesTabPanel from '../style/TabPanel.style'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { ViewList } from '@webcms/orest'
import { DEFAULT_OREST_TOKEN, isErrorMsg, OREST_ENDPOINT } from '../../../../model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import useNotifications from '../../../../model/notification/useNotifications'
import LoadingSpinner from '../../../LoadingSpinner'
import SurveyCard from './SurveyCard'
import { makeStyles } from '@material-ui/core/styles'
import TabHeader from '../../../layout/components/TabHeader'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import ExpandMore from '@material-ui/icons/ExpandMore'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

export default function Surveys(props) {
    const { isWidget, limit, loadMore } = props
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()

    const { t } = useTranslation()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    //redux
    const { showError } = useNotifications()
    const token = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    )
    const changeHotelRefNo = useSelector((state) => state?.formReducer?.guest?.changeHotelRefno || null)
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)
    const isPortal = GENERAL_SETTINGS.ISPORTAL;
    let hotelRefno = isPortal ? changeHotelRefNo : loginfo && loginfo.hotelrefno || GENERAL_SETTINGS.HOTELREFNO

    //state
    const [surveys, setSurveys] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const [isDone, setIsDone] = useState(false)
    const [defaultLimit, setLimit] = useState(1)
    const [page, setPage] = useState(0)

    useEffect(() => {
        let active = true
        if (active) {
            if (isLoading) {
                return undefined
            }

            if (loginfo) {
                setIsLoading(true)
                axios({
                    url: `${GENERAL_SETTINGS.OREST_URL}/survey/view/list?query=isactive:true,isweb:true,istemplate:false,isstd:false&limit=${limit || defaultLimit}&start=${page * (limit || defaultLimit)}&sort=insdatetime-&allhotels=true&chkselfish=false&field=hotelrefno&text=${hotelRefno}&text=${GENERAL_SETTINGS.HOTELREFNO}`,
                    method: 'get',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }).then((r) => {
                    if (active) {
                        if (r.status === 200) {
                            setSurveys([...surveys, ...r.data.data])
                            setIsInitialized(true)
                            setIsLoading(false)
                            if (r.data.count < (limit || defaultLimit)) {
                                setIsDone(true)
                            }
                        } else {
                            const retErr = isErrorMsg(r)
                            showError(retErr.errorMsg)
                            setIsInitialized(true)
                            setIsLoading(false)
                        }
                    }
                })
            } else {
                setIsInitialized(true)
            }
        }

        return () => {
            active = false
        }
    }, [page])

    function handleShowMore() {
        setPage(page + 1)
    }

    return (
        <React.Fragment>
            <TabHeader title={t('str_survey')} />
            <Grid container justify={'center'}>
                {isInitialized ? (
                    surveys.length > 0 ? (
                        surveys.map((survey, i) => {
                            return <SurveyCard survey={survey} key={i} />
                        })
                    ) : (
                        <Grid item xs={12} className={classesTabPanel.gridItem}>
                            <Typography component="h3" className={classesTabPanel.nothingToShow}>
                                {t('str_noSurveyFound')}
                            </Typography>
                        </Grid>
                    )
                ) : (
                    <Grid item xs={12} className={classesTabPanel.gridItem}>
                        <LoadingSpinner />
                    </Grid>
                )}

                {loadMore && surveys.length > 0 && (
                    <Grid item xs={12} className={classesTabPanel.gridItem}>
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            !isDone && (
                                <Grid container direction={'row'} justify={'center'} alignItems={'center'}>
                                    <Grid item>
                                        <Button onClick={handleShowMore}>
                                            <Typography variant="h5" className={classesTabPanel.showMoreText}>
                                                {t('str_showMore')}
                                            </Typography>
                                            <ExpandMore className={classesTabPanel.showMoreIcon} />
                                        </Button>
                                    </Grid>
                                </Grid>
                            )
                        )}
                    </Grid>
                )}
            </Grid>
        </React.Fragment>
    )
}

Surveys.propTypes = {
    isWidget: PropTypes.bool,
    limit: PropTypes.number,
    loadMore: PropTypes.bool,
}
