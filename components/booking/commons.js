import React, { useContext } from 'react'
import WebCmsGlobal from 'components/webcms-global'
import booking from '../ibe/widget/booking'

const bookingStepCodes = {
    rooms: 'rooms',
    addons: 'addons',
    details: 'details',
    preview: 'preview',
    confirm: 'confirm'
}

const bookingSteps = [
    {
        code: bookingStepCodes.rooms,
        label: 'str_rooms',
    },
    {
        code: bookingStepCodes.addons,
        label: 'str_addOns',
    },
    {
        code: bookingStepCodes.details,
        label: 'str_guestDetails',
    },
    {
        code: bookingStepCodes.preview,
        label: 'str_preview',
    },
    {
        code: bookingStepCodes.confirm,
        label: 'str_confirmation',
    },
]

function getBookingSteps(bookingSteps, addOns) {
    if (!addOns) {
        return bookingSteps.filter(step => step.code !== bookingStepCodes.addons)
    } else {
        return bookingSteps
    }
}

module.exports = {
    getBookingSteps,
    bookingSteps,
    bookingStepCodes
}