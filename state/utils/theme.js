import { createMuiTheme } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue'

const theme = createMuiTheme({
    typography: {
        fontFamily: ["'Lato'", 'sans-serif'].join(','),
    },
    palette: {
        primary: blue,
        secondary: blue,
    },
})

export default theme
