import React, {useContext, useEffect} from 'react';
//material imports
import { makeStyles } from '@material-ui/core/styles';
import {
    Card,
    Container,
    Grid,
    Typography,
    FormControl,
    Select,
    MenuItem,
    TextField,
    Checkbox,
    FormGroup,
    FormControlLabel,
    Button,
    TextareaAutosize
} from "@material-ui/core";
//redux imports
import { connect } from "react-redux";
import {setToState, updateState} from "../../../../../state/actions";
//import color picker
import InputColor from 'react-input-color';
//import constants
import {COLORS, FONT_NAME} from "../../constants";
import {useRouter} from "next/router";
import {ViewList} from "@webcms/orest";
import {OREST_ENDPOINT} from "../../../../../model/orest/constants";
import WebCmsGlobal from "../../../../webcms-global";

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    colorBlock: {
        margin: theme.spacing(3),
        marginLeft: theme.spacing(5)
    },
    paperBlock: {
        marginTop: 4,
    },
    fontDropdown: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1)
    },
    defaultBtn: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        borderRadius: 20,
        float: "right"
    },
    block: {
        border: '1px solid silver',
        borderRadius: 5,
        minHeight: 40,
        margin: theme.spacing(1)
    },
    colorText: {
        marginLeft: 4
    },
    colorSubHeading: {
        color: COLORS?.secondary,
        margin: 12,
    }
}));

const Style = (props) => {

    const {
        state,
        setToState,
        updateState
    } = props

    const classes = useStyles();
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const router = useRouter();
    const companyId = router?.query?.companyID;
    const authToken = token || router.query.authToken;

    useEffect(() => {
        if (router.query.assetOnly) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.RAFILE,
                token: authToken,
                params: {
                    query: `code:HCMASSET`,
                    hotelrefno: Number(companyId),
                },
            }).then(async (res) => {
                if (res.data && res.data.data && res.data.data.length > 0) {
                    const assetsData = JSON.parse(Buffer.from(res.data.data[0].filedata, 'base64').toString('utf-8'));
                    if (!assetsData?.colors?.slider) {
                        assetsData.colors['slider'] = {
                            main: '',
                            light: '',
                            dark: '',
                            contrastText: '',
                        }
                    }
                    updateState('pageBuilder', 'assets', assetsData)

                }
            })
        }
    }, []);

    const handleColors = (colorType, colorSubType, color) => {
        const isColorValid = hexColorValid(color);
        if (isColorValid) {
            setToState('pageBuilder', ['assets', 'colors', colorType, colorSubType], color);
        } else {
            setToState('pageBuilder', ['assets', 'colors', colorType, colorSubType], '#ffffff');
        }
    }

    const hexColorValid = (color) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

    const handleFontChange = (event, font) => {
        if(font === 'bold' || font === 'italic') {
            setToState('pageBuilder', ['assets', 'font', font], !state?.assets?.font[font]);
        } else if (font === 'size') {
            setToState('pageBuilder', ['assets', 'font', font], Number(event.target.value));
        }else {
            setToState('pageBuilder', ['assets', 'font', font], event.target.value);
        }
    }

    const handleDefaultColors = () => {
        const colors = {
            primary: {
                main: '#45bfcf',
                light: '#4a90e2',
                dark: '#616466',
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#ffffff',
                light: '#ededed',
                dark: '#a7a9a9',
                contrastText: '#ffffff',
            },
            message: {
                main: '#4a90e2',
                light: '#4a90e2',
                dark: '#4a90e2',
                contrastText: '#ffffff',
            },
            button: {
                main: '#45bfcf',
                light: '#4a90e2',
                dark: '#616466',
                contrastText: '#ffffff',
            },
            slider: {
                main: '#45bfcf',
                light: '#a7a9a9',
                dark: '#616466',
                contrastText: '#ffffff',
            },
        }
        setToState('pageBuilder', ['assets', 'colors'], colors);
    }

    return (
        <Container>
            <Grid container={true} justify={'flex-end'} >
                <Grid item xs={4}>
                    <Typography component={'h6'} variant={'h6'} style={{color: COLORS?.secondary}} >Select Colors</Typography>
                </Grid>
                <Grid item xs={4}>
                    <Button
                        onClick={handleDefaultColors}
                        variant="contained"
                        size="small"
                        color="primary"
                        aria-label="add"
                        className={classes.defaultBtn}
                    >
                        DEFAULT
                    </Button>
                </Grid>
                <Grid item xs={4}>
                    <Typography component={'h6'} variant={'h6'} style={{color: COLORS?.secondary, marginLeft: 8}}>Select Font</Typography>
                </Grid>
            </Grid>
            <Grid container justify={'center'} className={classes.root} spacing={2}>
                <Grid item xs={8}>
                    <Card variant={'outlined'} >
                        <Grid container >
                            <Grid item xs={2}>
                                <Typography component={'h6'} variant={'h6'} className={classes.colorSubHeading}>Primary</Typography>
                            </Grid>
                            <Grid item xs={10}>
                                <Typography component={'div'} className={classes.block}>
                                    <Grid container spacing={2} justify={'space-between'} alignItems={'center'}>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Main</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('primary', 'main', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.primary?.main ? state.assets.colors.primary.main :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Light</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('primary', 'light', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.primary?.light ? state.assets.colors.primary.light :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Dark</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('primary', 'dark', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.primary?.dark ? state.assets.colors.primary.dark :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Text</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('primary', 'contrastText', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.primary?.contrastText ? state.assets.colors.primary.contrastText :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                    </Grid>
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container >
                            <Grid item xs={2}>
                                <Typography component={'h6'} variant={'h6'} className={classes.colorSubHeading}>Secondary</Typography>
                            </Grid>
                            <Grid item xs={10}>
                                <Typography component={'div'} className={classes.block}>
                                    <Grid container spacing={2} justify={'space-between'} alignItems={'center'}>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Main</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('secondary', 'main', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.secondary?.main ? state.assets.colors.secondary.main :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Light</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('secondary', 'light', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.secondary?.light ? state.assets.colors.secondary.light :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Dark</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('secondary', 'dark', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.secondary?.dark ? state.assets.colors.secondary.dark :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Text</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('secondary', 'contrastText', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.secondary?.contrastText ? state.assets.colors.secondary.contrastText :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                    </Grid>
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container >
                            <Grid item xs={2}>
                                <Typography component={'h6'} variant={'h6'} className={classes.colorSubHeading}>Button</Typography>
                            </Grid>
                            <Grid item xs={10}>
                                <Typography component={'div'} className={classes.block}>
                                    <Grid container spacing={2} justify={'space-between'} alignItems={'center'}>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Main</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('button', 'main', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.button?.main ? state.assets.colors.button.main :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Light</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('button', 'light', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.button?.light ? state.assets.colors.button.light :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Dark</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('button', 'dark', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.button?.dark ? state.assets.colors.button.dark :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Text</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('button', 'contrastText', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.button?.contrastText ? state.assets.colors.button.contrastText :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                    </Grid>
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container >
                            <Grid item xs={2}>
                                <Typography component={'h6'} variant={'h6'} className={classes.colorSubHeading}>Message</Typography>
                            </Grid>
                            <Grid item xs={10}>
                                <Typography component={'div'} className={classes.block}>
                                    <Grid container spacing={2} justify={'space-between'} alignItems={'center'}>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Main</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('message', 'main', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.message?.main ? state.assets.colors.message.main :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Light</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('message', 'light', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.message?.light ? state.assets.colors.message.light :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Dark</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('message', 'dark', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.message?.dark ? state.assets.colors.message.dark :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Text</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('message', 'contrastText', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.message?.contrastText ? state.assets.colors.message.contrastText :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                    </Grid>
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container >
                            <Grid item xs={2}>
                                <Typography component={'h6'} variant={'h6'} className={classes.colorSubHeading}>Slider</Typography>
                            </Grid>
                            <Grid item xs={10}>
                                <Typography component={'div'} className={classes.block}>
                                    <Grid container spacing={2} justify={'space-between'} alignItems={'center'}>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Main</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('slider', 'main', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.slider?.main ? state.assets.colors.slider.main :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Light</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('slider', 'light', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.slider?.light ? state.assets.colors.slider.light :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Dark</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('slider', 'dark', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.slider?.dark ? state.assets.colors.slider.dark :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Typography component={'span'} className={classes.colorText}>Text</Typography>
                                        </Grid>
                                        <Grid item xs={2}>
                                            <InputColor
                                                onChange={(color) => handleColors('slider', 'contrastText', color.hex)}
                                                placement="right"
                                                initialValue={state?.assets?.colors?.slider?.contrastText ? state.assets.colors.slider.contrastText :'#FFFFFF'}
                                                style={{width: 80, marginTop: 6}}
                                            />
                                        </Grid>
                                    </Grid>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
                <Grid item xs={4}>
                    <Card variant={'outlined'}>
                        <Grid container justify={'flex-start'}  >
                            <Grid item xs={6}>
                                <Typography component={'h6'} variant={'h6'} style={{margin: 4, color: COLORS?.secondary}}>
                                    Font Name
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography component={'h6'} variant={'h6'} style={{margin: 4, color: COLORS.secondary}}>
                                    Font Size
                                </Typography>
                            </Grid>
                        </Grid>
                        <Grid container justify={'flex-start'} spacing={1}>
                            <Grid item xs={6}>
                                <FormControl
                                    variant="outlined"
                                    className={classes.fontDropdown}
                                    size={'small'}
                                    fullWidth
                                >
                                    <Select
                                        value={state.assets.font.name}
                                        style={{marginRight: 8}}
                                        onChange={(e) => handleFontChange(e, 'name')}
                                    >
                                        {
                                            FONT_NAME.map((font, index) => {
                                                return (<MenuItem value={font} key={index} > {font} </MenuItem>)
                                            })
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl
                                    fullWidth
                                    size={'small'}
                                >
                                <TextField
                                    id="font-size"
                                    type="number"
                                    variant="outlined"
                                    value={state.assets.font.size}
                                    inputProps={{ min: "10", max: "40", step: "1" }}
                                    onChange={(e) => handleFontChange(e, 'size')}
                                    size={'small'}
                                    style={{marginRight: 8}}
                                />
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container justify={'flex-start'}  >
                            <FormGroup row style={{marginLeft: 8, paddingTop: 8}}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={state.assets.font.bold}
                                            onChange={(e) => handleFontChange(e, 'bold')}
                                            name="bold"
                                            color="primary"
                                        />
                                    }
                                    label="Bold"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={state.assets.font.italic}
                                            onChange={(e) => handleFontChange(e, 'italic')}
                                            name="checkedB"
                                            color="primary"
                                        />
                                    }
                                    label="Italic"
                                />
                            </FormGroup>
                        </Grid>
                        <Grid container justify={'flex-start'} >
                            <Grid item xs={12}>

                                <FormControl fullWidth>
                                    <TextareaAutosize
                                        variant={'outlined'}
                                        style={{
                                            fontFamily: state.assets.font.name,
                                            fontSize: Number(state.assets.font.size),
                                            fontWeight: state.assets.font.bold ? "bold" : '',
                                            fontStyle: state.assets.font.italic ? "italic" : '',
                                            marginTop: '4px !important',
                                            marginLeft: 8,
                                            marginRight: 8,
                                            marginBottom: 8,
                                            overflow: 'auto',
                                            height: 133
                                        }}
                                        placeholder="Please write text here to test font .."
                                        rows={5}
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );

}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
}

const mapDispatchToProps = dispatch => ({
    setToState: (stateType, stateName, value) => dispatch(setToState(stateType, stateName, value)),
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Style)
