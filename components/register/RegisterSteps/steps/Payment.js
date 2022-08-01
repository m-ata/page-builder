import React from 'react'
import { connect } from 'react-redux'
import { updateState } from '../../../../state/actions'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import useTranslation from 'lib/translations/hooks/useTranslation'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        '& > *': {
            margin: theme.spacing(1),
            width: theme.spacing(16),
            height: theme.spacing(16),
        },
    },
    welcomeWrapper: {
        maxWidth: 1259,
        width: '100%',
        height: 685,
        padding: 20,
    },
    welcomeToH3: {
        color: '#0F4571',
        fontSize: '6.5rem',
        fontWeight: 600,
        textAlign: 'right',
    },
    vimaH3: {
        color: '#269DD4',
        fontSize: '10.5rem',
        fontWeight: 600,
    },
    fieldset: {
        width: '100%',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    legends: {
        paddingTop: theme.spacing(2),
        fontSize: '1.1rem',
    },
    txtfiled: {
        marginTop: theme.spacing(1.5),
        maxWidth: 350,
        width: '100%',
    },
    roomField: {
        marginTop: theme.spacing(1.5),
        maxWidth: 120,
        width: '100%',
    },
    option: {
        fontSize: 15,
        '& > span': {
            marginRight: 10,
            fontSize: 18,
        },
    },
}))

const Photos = (props) => {
    const { state, updateState } = props
    const { t } = useTranslation()

    const cls = useStyles()

    const InputChange = (e) => {
        updateState('data', e.target.id, e.target.value)
    }

    return (
        <React.Fragment>
            <Grid container>
                <Grid item xs={6}>
                    <FormControl component="fieldset" className={cls.fieldset}>
                        <FormLabel component="legend" className={cls.legends}>
                            {' '}
                            {t('str_vatTaxSettings')}
                        </FormLabel>
                        <RadioGroup aria-label="SettingsVAT" name="SettingsVAT">
                            <FormControlLabel
                                value={'Default'}
                                control={<Radio />}
                                label="Default (18.5 % is usually excluded in your location)"
                            />
                            <FormControlLabel value={'NoVAT'} control={<Radio />} label="I don’t need to pay VAT" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl component="fieldset" className={cls.fieldset}>
                        <FormLabel component="legend" className={cls.legends}>
                            {' '}
                            {t('str_cityTax')}
                        </FormLabel>
                        <RadioGroup aria-label="CityTax" name="CityTax">
                            <FormControlLabel value={'NoCityTax'} control={<Radio />} label="No city tax" />
                            <FormControlLabel value={'YesCityTax'} control={<Radio />} label="City tax applies" />
                        </RadioGroup>
                    </FormControl>
                    <TextField className={cls.roomField} type="number" id="bedrooms" label="City Tax" />
                </Grid>
                <Grid item xs={6}>
                    <FormControl component="fieldset" className={cls.fieldset}>
                        <FormLabel component="legend" className={cls.legends}>
                            {' '}
                            {t('str_howYouWantPayment')}
                        </FormLabel>
                        <RadioGroup aria-label="PaymentMethod" name="PaymentMethod">
                            <FormControlLabel value={'InCheckut'} control={<Radio />} label="In check out" />
                            <FormControlLabel value={'InBooking'} control={<Radio />} label="In booking" />
                            <FormControlLabel
                                value={'HalfCheckoutAndBooking'}
                                control={<Radio />}
                                label="Half in booking, half in checkout"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl component="fieldset" className={cls.fieldset}>
                        <FormLabel component="legend" className={cls.legends}>
                            {' '}
                            {t('str_paymentOptions')}
                        </FormLabel>
                        <RadioGroup aria-label="PaymentOptions" name="PaymentOptions">
                            <FormControlLabel value={'CreditCard'} control={<Radio />} label="Credit Card" />
                            <FormControlLabel value={'Cash'} control={<Radio />} label="Cash" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

/*Photos.getInitialProps = (ctx) => {

}*/

const mapStateToProps = (state) => {
    return {
        state: state.formReducer.registerStepper,
    }
}

const mapDispatchToProps = (dispatch) => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Photos)
