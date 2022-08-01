const fieldOptions = {
    size: {
        button: 'medium',
        textField: 'medium',
    },
    variant: {
        button: 'outlined',
        textField: 'filled',
    },
    fullWidth: {
        button: false,
        textField: true,
    },
    dateFormatForView: 'DD/MM/YYYY',
}

const fieldTypes = {
    text: 'text',
    email: 'email',
    date: 'date',
    select: 'select',
    tel: 'tel',
    trid: 'trid',
    sign: 'sign',
    upload: 'upload',
}

export {
    fieldTypes,
    fieldOptions
}