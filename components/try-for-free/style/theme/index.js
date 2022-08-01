import { createMuiTheme } from '@material-ui/core/styles'

export const fieldOptions = {
    size: 'small',
    variant: 'filled',
    fullWidth: true,
}

const hotech = {
    palette: {
        primary: {
            main: '#66bb6a',
            light: '#98ee99',
            dark: '#338a3e',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#4caf50',
            light: '#80e27e',
            dark: '#087f23',
            contrastText: '#ffffff',
        },
    },
}

const amonra = {
    palette: {
        primary: {
            main: '#128a7f',
            light: '#18bbad',
            dark: '#0f756c',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#009387',
            light: '#02b9aa',
            dark: '#02776c',
            contrastText: '#ffffff',
        },
    },
}

const gueest = {
    palette: {
        primary: {
            main: '#3D9BE9',
            light: '#49a7f8',
            dark: '#114773',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#208ce5',
            light: '#2795f5',
            dark: '#074373',
            contrastText: '#ffffff',
        },
    },
}

const getTheme = (theme) => {
    return createMuiTheme(theme)
}

export const brands = {
    hotech: 'hotech',
    amorna: 'amonra',
    gueest: 'gueest'
}

export const getBrand = (brand) => {
    switch (brand) {
        case brands.amorna:
            return brands.amorna
        case brands.gueest:
            return brands.gueest
        default:
            return brands.hotech
    }
}

export const createTheme = (brand) => {
    switch (brand) {
        case brands.amorna:
            return getTheme(amonra)
        case brands.gueest:
            return getTheme(gueest)
        default:
            return getTheme(hotech)
    }
}

export const registerTypes = {
    demo: 'demo',
    buynow: 'buynow'
}