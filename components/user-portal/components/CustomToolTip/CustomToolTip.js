import { withStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'

export const CustomToolTip = withStyles({
    tooltip: {
        padding:"10px",
        color: "#4D4F5C",
        backgroundColor: "#F5F6FA",
        fontSize:"13px",
        border:"1px solid #4D4F5C",
        borderRadius:"8px",
        maxWidth: '500px'
    }
})(Tooltip)