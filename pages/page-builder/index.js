//import from react
import React, { useContext, useEffect, useState } from 'react'
//import from redux
import { connect } from 'react-redux'
//material import
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
//custom imports
import PageBuilderStepper from '../../components/page-builder/PageBuilderStepper'
import { COLORS } from '../../components/page-builder/PageBuilderSteps/constants'
import { ViewList } from '@webcms/orest'
import WebCmsGlobal from 'components/webcms-global'
import { useRouter } from 'next/router'
import { OREST_ENDPOINT } from '../../model/orest/constants'
import { updateState } from '../../state/actions'

const useStyles = makeStyles((theme) => ({
    codeText: {
        color: COLORS?.secondary,
        float: 'right',
        marginRight: theme.spacing(2),
        marginTop: theme.spacing(2),
    },
    paageBuilderTypeText: {
        color: COLORS?.secondary,
        marginLeft: theme.spacing(3),
        marginTop: theme.spacing(2),
    },
}))

const Index = (props) => {
    const { state, updateState } = props

    const [pbType, setPbType] = useState('')

    const router = useRouter()
    const token = router?.query?.authToken
    const companyId = router?.query?.companyID
    const { GENERAL_SETTINGS } = useContext(WebCmsGlobal)

    const cls = useStyles()

    useEffect(() => {
        ViewList({
            apiUrl: GENERAL_SETTINGS.OREST_URL,
            endpoint: OREST_ENDPOINT.HCMITEM,
            token: token,
            params: {
                limit: 1,
                hotelrefno: Number(companyId),
            },
        }).then((res1) => {
            if (res1.status === 200 && res1.data.data.length > 0) {
                updateState('pageBuilder', 'hcmItemId', res1.data.data[0].id)
            }
        })
    }, [])

    useEffect(() => {
        if (state.type === 'webPage')
            setPbType('WEB PAGE');
        else if (state.type === 'website')
            setPbType('WEBSITE');
        else if (state.type === 'email' || state.type === 'emailOnly')
            setPbType('EMAIL');
        else if (state.type === 'assets' || state.type === 'assetOnly')
            setPbType('Assets')
        else if (state.type === 'faqOnly')
            setPbType("FAQ's");
        else setPbType('')
    }, [state.type])

    return (
        <React.Fragment >
            <Card style={{height: '100vh', overflow: 'auto'}}>
                <Container>
                    <Grid container direction="row" justify="flex-start">
                        <Grid item xs={6}>
                            <Typography data-testid={'pb-type'} className={cls.paageBuilderTypeText} variant="h4">
                                {pbType}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography className={cls.codeText} variant={'h6'}>
                                {state.code}
                            </Typography>
                        </Grid>
                    </Grid>
                    <PageBuilderStepper />
                </Container>
            </Card>
        </React.Fragment>
    )
}

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.pageBuilder,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Index)
