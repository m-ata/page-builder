import { TextField, Tooltip, Checkbox } from '@material-ui/core'
import useTranslation from 'lib/translations/hooks/useTranslation'


const TextFilter = (props) => {
    const { label, onChange, onCheck, checked, value } = props
    const { t } = useTranslation()

    return (
        <TextField
            id={label}
            label={label}
            variant="outlined"
            size="small"
            value={value}
            onChange={(e)=> onChange(e)}
            InputProps={{
                endAdornment:
                    <Tooltip title={t('str_useExactMatch')}>
                        <Checkbox checked={checked} onChange={()=> onCheck()} inputProps={{ 'aria-label': 'primary checkbox' }} />
                    </Tooltip>

            }}
        />
    )
}

export default TextFilter