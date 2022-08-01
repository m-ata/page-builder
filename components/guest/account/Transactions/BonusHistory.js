import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import { ViewList } from '@webcms/orest'
import {
    DEFAULT_OREST_TOKEN,
    findStatusColor,
    isErrorMsg,
    OREST_ENDPOINT,
    renderReservStatus,
} from 'model/orest/constants'
import WebCmsGlobal from 'components/webcms-global'
import useNotifications from 'model/notification/useNotifications'
import useTranslation from 'lib/translations/hooks/useTranslation'
import MaterialTable from 'material-table'
import moment from 'moment'
import { formatPrice } from '@webcms-globals/helpers'
import CustomTable from '../../../CustomTable'
import MTableColumnSettings from '../../../MTableColumnSettings'
import TableColumnText from '../../../TableColumnText'

export default function BonusHistory(props) {
    const { isWidget } = props
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)
    const { t } = useTranslation()

    //redux
    const { showError } = useNotifications()
    const token = useSelector((state) => state?.orest?.currentUser?.auth?.access_token || false)
    const clientBase = useSelector((state) => state?.orest?.state?.client || false)

    //state
    const [bonusTrans, setBonusTrans] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        let active = true
        if (active) {
            if (isLoading) {
                return undefined
            }

            if (clientBase.id) {
                getBonusTransListData(active)
            } else {
                setIsLoading(false)
            }
        }

        return () => {
            active = false
        }
    }, [])

    const getBonusTransListData = (active) => {
        setIsLoading(true)
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.BONUSTRANS,
            token,
            params: {
                query: `accid:${clientBase.id}`,
                chkselfish: false,
                allhotels: true
            },
        }).then((r) => {
            if (active) {
                if (r.status === 200) {
                    setBonusTrans(r.data.data)
                    setIsLoading(false)
                } else {
                    const retErr = isErrorMsg(r)
                    showError(retErr.errorMsg)
                    setIsLoading(false)
                }
            }
        })
    }

    const [columns, setColumns] = useState([
        {
            title: t('str_winDate'),
            field: 'transdate',
            render: props => props.transdate && moment(props.transdate, 'YYYY-MM-DD').format('ddd, MMM DD, YYYY'),
            cellStyle: {
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                minWidth: 250,
            },
            hidden: false,
        },
        {
            title: t('str_hotel'),
            field: 'hotelname',
            cellStyle: {
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                minWidth: 300,
            },
            hidden: false,
        },
        {
            title: t('str_description'),
            field: 'bonustpldesc',
            hidden: false,
            cellStyle: {
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                minWidth: 400,
            },
        },
        {
            title: t('str_stay'),
            field: 'grosstotal',
            render: props => props.grosstotal && formatPrice(props.grosstotal),
            hidden: false,
        },
        {
            title: t('str_balance'),
            field: 'bonustotal',
            render: props => props.bonustotal && formatPrice(props.bonustotal),
            hidden: false,
        },
    ])

    return (
        <React.Fragment>
            <Container maxWidth="md">
                <Grid container justify={'center'}>
                    <Grid item xs={12}>
                        <CustomTable
                            onRefresh={() => getBonusTransListData(true)}
                            loading={isLoading}
                            getColumns={columns}
                            getRows={bonusTrans}
                            filterComponentAlign={'right'}
                            filterComponent={
                                <React.Fragment>
                                    <Grid container spacing={3} alignItems={'center'}>
                                        <Grid item xs={12} sm={true}>
                                            <MTableColumnSettings tableId="bonusHistory" columns={columns} setColumns={setColumns}/>
                                        </Grid>
                                    </Grid>
                                </React.Fragment>
                            }
                        />
                    </Grid>
                </Grid>
            </Container>
        </React.Fragment>
    )
}
