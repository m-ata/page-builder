import {decode} from 'html-entities'
import * as base from './base'
import { transliterate } from 'transliteration'

export const isTrue = (value) => {
    return value === base.isTrue
}

export const isFalse = (value) => {
    return value === base.isFalse
}

export const isNull = (value) => {
    return value === base.isNull
}

export const isEmpty = (val) => {
    return val === "" || val === null
}

export const capitalizeWord = (value) => {
    return value && value[0].toUpperCase() + value.slice(1) || value
}

export const makeArrayWithComma = (value) => {
    if(value){
        return value.replaceAll(/\s/g,'').split(',')
    }
    return false
}

export const objectTransliterate = (obj, keys) => {
    if(obj && keys){
        Object.keys(obj).forEach((key) => {
            if(keys.includes(key)){
                obj[key] = transliterate(obj[key])
            }
        })
    }
    return obj
}

export const objectMapper = (obj1 = {}, obj2 = {}, mandatoryFields = []) => {
    let newObj1 = obj1
    Object.keys(newObj1).forEach((key) => {
        const value = obj2[key]
        if (value || mandatoryFields.includes(key)) {
            newObj1 = {
                ...newObj1,
                [key]: {
                    ...newObj1[key],
                    value: value,
                    isRequired: mandatoryFields.includes(key)
                },
            }
        }
    })
    return newObj1
}

export const objectValueEqualizer = ({obj1 = {}}) => {
    let newObjData = {}
    Object.keys(obj1).map((key) => {
        const newObj1 = obj1[key]
        if(newObj1.isBase){
            if(typeof newObj1.value === 'object' && newObj1.value){
                newObjData[newObj1.key] = newObj1.value[newObj1.defValKey] || ''
            }else {
                newObjData[newObj1.key] = newObj1.value || ''
            }
        }
    })
    return newObjData
}

export const objectDifferences = ({obj1 = {}, obj2 = {}, labelKeys = {}, translate = false, langcode = false}) => {
    let newObj = []
    Object.keys(obj1).map((key) => {
        if(obj1[key] !== obj2[key] && obj1[key] !== undefined && obj1[key] !== null && obj2[key] !== undefined && obj2[key] !== null){
            newObj.push({
                label: translate(labelKeys[key].label, false, langcode),
                newval: obj1[key],
                oldval: obj2[key]
            })
        }
    })
    return newObj
}

String.prototype.removeHtmlTag = function() {
    return decode(this.replace(/<[^>]*>?/gm, '')) || this
}

String.prototype.htmlEntityToText = function() {
    let txt = document.createElement('textarea')
    txt.innerHTML = this
    return txt.value
}

String.prototype.renderText = function() {
    return this && this.removeHtmlTag().htmlEntityToText() || ""
}

String.prototype.removeAllSpace = function() {
    return this.replaceAll(/\s/g, '') || this
}

String.prototype.textOnly = function() {
    return this.removeHtmlTag().removeAllSpace() || this
}

String.prototype.isLangCode = function() {
    return  /^[a-z]+(?:\.[a-z]+)*$/gm.test(this) || false
}

export const decimalColorToHexCode = (number) =>{
    //converts to a integer
    let intnumber = number - 0;

    // isolate the colors - really not necessary
    let red, green, blue;

    // needed since toString does not zero fill on left
    let template = "#000000";

    // in the MS Windows world RGB colors
    // are 0xBBGGRR because of the way Intel chips store bytes
    red = (intnumber&0x0000ff) << 16;
    green = intnumber&0x00ff00;
    blue = (intnumber&0xff0000) >>> 16;

    // mask out each color and reverse the order
    intnumber = red|green|blue;

    // toString converts a number to a hexstring
    let HTMLcolor = intnumber.toString(16);

    //template adds # for standard HTML #RRGGBB
    HTMLcolor = template.substring(0,7 - HTMLcolor.length) + HTMLcolor;

    return HTMLcolor;
}

export const formatPrice = (amount, decimalCount = 2, decimal = ".", thousands = ",") => {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;

        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
        console.log(e)
    }
};