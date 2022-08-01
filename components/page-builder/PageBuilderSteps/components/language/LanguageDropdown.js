import React, { useEffect, useState, memo } from 'react'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import { useSelector } from 'react-redux'

const LanguageDropdown = memo((props) => {
    const { handleChange, langID } = props

    const state = useSelector((state) => state?.formReducer?.pageBuilder)

    const [localState, setLocalState] = useState({
        languages: state?.languages,
        selectedLang: '',
    })

    const { languages, selectedLang } = localState

    useEffect(() => {
        languages &&
            languages.length > 0 &&
            languages.map((lang) => {
                if (lang.id === parseInt(langID)) {
                    setLocalState((prevState) => ({ ...prevState, selectedLang: lang }))
                    handleChange(lang)
                }
            })
    }, [])

    const handleLanguageChange = (e) => {
        setLocalState((prevState) => ({ ...prevState, selectedLang: e.target.value }))
        handleChange(e.target.value)
    }

    return (
        <FormControl variant="outlined" style={{ float: 'right', marginBottom: 8 }} size={'small'}>
            {languages && languages.length > 0 && (
                <Select value={selectedLang} onChange={handleLanguageChange} label="Language">
                    {languages.map((lang, index) => {
                        return (
                            <MenuItem value={lang} key={index}>
                                {' '}
                                {lang.description}{' '}
                            </MenuItem>
                        )
                    })}
                </Select>
            )}
        </FormControl>
    )
})

export default LanguageDropdown
