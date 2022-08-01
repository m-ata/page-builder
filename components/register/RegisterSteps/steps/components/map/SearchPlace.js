import React from 'react'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import parse from 'autosuggest-highlight/parse'
import throttle from 'lodash/throttle'

const autocompleteService = { current: null }

const useStyles = makeStyles((theme) => ({
    icon: {
        color: theme?.palette?.text?.secondary,
        marginRight: theme.spacing(2),
    },
}))

const SearchPlace = (props) => {
    const { mapInstance, setMapInstance, mapApi, setMapApi } = props
    const classes = useStyles()
    const [inputValue, setInputValue] = React.useState('')
    const [options, setOptions] = React.useState([])

    const handleChange = (event) => {
        setInputValue(event.target.value)
    }

    const fetch = React.useMemo(
        () =>
            throttle((input, callback) => {
                autocompleteService.current.getPlacePredictions(input, callback)
            }, 300),
        []
    )

    React.useEffect(() => {
        let active = true

        if (!autocompleteService.current) {
            autocompleteService.current = new mapApi.places.AutocompleteService()
        }

        if (!autocompleteService.current) {
            return undefined
        }

        if (inputValue === '') {
            setOptions([])
            return undefined
        }

        fetch({ input: inputValue }, (results) => {
            if (active) {
                setOptions(results || [])
            }
        })

        return () => {
            active = false
        }
    }, [inputValue, fetch])

    const handleOnChange = (e, option) => {
        if (option) {
            console.log(option)
        }
    }

    return (
        <Autocomplete
            id="google-map-demo"
            onChange={(e, option) => handleOnChange(e, option)}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
            filterOptions={(x) => x}
            options={options}
            autoComplete
            includeInputInList
            freeSolo
            disableOpenOnFocus
            onSelect={(e) => {
                console.log(e)
            }}
            renderInput={(params) => (
                <TextField {...params} fullWidth autoFocus label="Search Place" onChange={handleChange} />
            )}
            renderOption={(option) => {
                const matches = option.structured_formatting.main_text_matched_substrings
                const parts = parse(
                    option.structured_formatting.main_text,
                    matches.map((match) => [match.offset, match.offset + match.length])
                )

                return (
                    <Grid container alignItems="center">
                        <Grid item>
                            <LocationOnIcon className={classes.icon} />
                        </Grid>
                        <Grid item xs>
                            {parts.map((part, index) => (
                                <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                                    {part.text}
                                </span>
                            ))}
                            <Typography variant="body2" color="textSecondary">
                                {option.structured_formatting.secondary_text}
                            </Typography>
                        </Grid>
                    </Grid>
                )
            }}
        />
    )
}

export default SearchPlace
