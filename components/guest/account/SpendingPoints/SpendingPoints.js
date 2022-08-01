import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styles from './style/SpendingPoints.style'
import stylesTabPanel from '../style/TabPanel.style'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { ViewList } from '@webcms/orest'
import { DEFAULT_OREST_TOKEN, isErrorMsg, OREST_ENDPOINT } from '../../../../model/orest/constants'
import useNotifications from '../../../../model/notification/useNotifications'
import WebCmsGlobal from '../../../webcms-global'
import LoadingSpinner from '../../../LoadingSpinner'
import SpendingPointsCard from './SpendingPointsCard'
import Button from '@material-ui/core/Button'
import ExpandMore from '@material-ui/icons/ExpandMore'
import { makeStyles } from '@material-ui/core/styles'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles(styles)
const useStylesTabPanel = makeStyles(stylesTabPanel)

export default function SpendingPoints(props) {
    const { t } = useTranslation()
    const { isWidget } = props
    const classes = useStyles()
    const classesTabPanel = useStylesTabPanel()
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    //redux
    const { showError } = useNotifications()
    const token = useSelector((state) =>
        state.orest.currentUser !== null ? state.orest.currentUser.auth.access_token : DEFAULT_OREST_TOKEN
    )
    const loginfo = useSelector((state) => state.orest.currentUser && state.orest.currentUser.loginfo)

    //state
    const [spendingPoints, setSpendingPoints] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const [isDone, setIsDone] = useState(false)
    const [limit, setLimit] = useState(3)
    const [page, setPage] = useState(0)

    useEffect(() => {
        let active = true
        if (active) {
            if (isLoading) {
                return undefined
            }

            if (loginfo) {
                setIsLoading(true)
                ViewList({
                    apiUrl: GENERAL_SETTINGS.OREST_URL,
                    endpoint: OREST_ENDPOINT.EVENTLOC,
                    token,
                    params: {
                        query: 'isactive:true,islocres:true,isext:false',
                        limit: limit,
                        start: page * limit,
                        hotelrefno: GENERAL_SETTINGS.HOTELREFNO,
                    },
                }).then((r) => {
                    if (active) {
                        if (r.status === 200) {
                            setSpendingPoints([...spendingPoints, ...r.data.data])
                            setIsInitialized(true)
                            setIsLoading(false)
                            if (r.data.count < limit) {
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
            <Grid container justify={'center'}>
                {isInitialized ? (
                    spendingPoints.length > 0 ? (
                        spendingPoints.map((spendingPoint, i) => {
                            return <SpendingPointsCard spendingPoint={spendingPoint} key={i} />
                        })
                    ) : (
                        <Grid item xs={12} className={classesTabPanel.gridItem}>
                            <Typography component="h3" className={classesTabPanel.nothingToShow}>
                                {t('No spending point to show.')}
                            </Typography>
                        </Grid>
                    )
                ) : (
                    <Grid item xs={12} className={classesTabPanel.gridItem}>
                        <LoadingSpinner />
                    </Grid>
                )}

                {spendingPoints.length > 0 && (
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
