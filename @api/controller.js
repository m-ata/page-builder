const axios = require('axios')
    , helpers = require('./core/helpers')
    , global = require('./constants/globals.json')
    , orestHelper = require('./orest-helpers')
    , orestEndpoint = require('./constants/orest-endpoints.json')
    , moment = require('moment')
    , getUuid = require('uuid-by-string')
    , useMail = require('./useMail')
    , serverConst = require('../lib/serverConst')
    , requestIp = require('request-ip')
    , geoip = require('geoip-country')
    , creditCardType = require('credit-card-type')
    , useRedis = require('../lib/helpers/useRedis')
    , getHotelAppLang =  require('./core/get-hotel-app-lang')
    , getHotelDateTime = require('./core/get-hotel-datetime')
    , { defaultLocale } = require('../lib/translations/config')
    , { getChildTotals, useTotalPrice } = require('../lib/helpers/useFunction')
    , md5 = require('md5')

const redisSuffixKeys = {
    hotelBookInfo: 'hotelBookInfo',
    agencyData: 'agencyData',
    hotelPaymentType: 'hotelPaymentType',
    instInfo: 'instInfo',
    doPayment: 'doPayment'
}

const getRedisKey = (prefix, serverCacheKey, suffixKey) => {
    return getUuid(String(prefix) + '.' + String(serverCacheKey) + '.' + String(suffixKey.toUpperCase()))
}

const redisCacheTime = {
    doPayment: 900
}

const errorCodes = {
    timeOut: 'timeOut'
}

const controllers = {
    createCacheKey: (req, res, sett) => {
        const cacheKey = getUuid(JSON.stringify(sett) + moment(Date.now()).locale(defaultLocale).format(orestEndpoint.dates.fullDateFormat) + requestIp.getClientIp(req))

        return {
            success: true,
            value: cacheKey.toUpperCase()
        }
    },
    getHotelBookInfoCheck: async (req, res, sett) => {
        let uitoken = req.query.uitoken, startdate = req.query.startdate
        if (!uitoken) {
            return {
                success: false,
                err_msg: 'uitoken_not_select'
            }
        }

        const ipAddress = process.env.USE_IP_ADDRESS || await requestIp.getClientIp(req)
            , geoLocation = await geoip.lookup(ipAddress)
            , ipCountry = geoLocation && geoLocation.country || false

        if (!ipCountry) {
            return {
                success: false,
                err_msg: 'country_not_select'
            }
        }

        const hotelBookInfoCacheKey = getRedisKey(sett.serverCacheKey, uitoken, redisSuffixKeys.hotelBookInfo)
        let hotelBookInfo = await axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelBookInfo),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: Object.assign({
                [`${orestEndpoint.params.countryiso}`]: ipCountry,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            }, startdate ? {
                [`${orestEndpoint.params.startdate}`]: startdate,
            } : {})
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch(() => {
            return false
        })

        const agencyDataCacheKey = getRedisKey(sett.serverCacheKey, uitoken, redisSuffixKeys.agencyData)
        const getAgencyData = hotelBookInfo?.data?.agencyid && await axios({
            url: helpers.getUrl(res, orestEndpoint.api.agencyGetById),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.key}`]: hotelBookInfo.data.agencyid,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            if (response.status === 200 && response.data && response.data.data) {
                return response.data.data
            } else {
                return false
            }
        }).catch(() => {
            return false
        }) || []

        const currencyList = await axios({
            url: helpers.getUrl(res, orestEndpoint.api.currencyRatedList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            if (response.status === 200 && response?.data?.data) {
                return response.data.data.map((item) =>  {
                    return { code: item.code, id: item.id }
                } )
            }else{
                return []
            }
        }).catch(() => {
            return []
        })

        hotelBookInfo = hotelBookInfo.data
        hotelBookInfo.currencyList = currencyList || []
        hotelBookInfo.babyAge = Number(getAgencyData.babyage) || 0
        hotelBookInfo.chd1Age = Number(getAgencyData.chd1age) || 0
        hotelBookInfo.chd2Age = Number(getAgencyData.chd2age) || 0

        try {
            await useRedis.set(hotelBookInfoCacheKey, JSON.stringify(hotelBookInfo))
        } catch (e) {
            return {
                success: false,
                data: [],
                err_msg: 'empty_data',
            }
        }

        try {
            await useRedis.set(agencyDataCacheKey, JSON.stringify(getAgencyData))
        } catch (e) {
            return {
                success: false,
                data: [],
                err_msg: 'empty_data',
            }
        }

        delete hotelBookInfo.currencyid
        delete hotelBookInfo.agencyid
        delete hotelBookInfo.langid
        delete hotelBookInfo.marketid
        delete hotelBookInfo.nationid

        return {
            success: true,
            data: hotelBookInfo,
        }
    },
    getRoomTypeBookList: async (req, res, sett) => {
        const uitoken = req.query.uitoken
            , ipAddress = process.env.USE_IP_ADDRESS || await requestIp.getClientIp(req)
            , geoLocation = await geoip.lookup(ipAddress)
            , ipCountry = geoLocation && geoLocation.country || false

        const hotelBookInfoKey = getRedisKey(sett.serverCacheKey, uitoken, redisSuffixKeys.hotelBookInfo)
        let hotelBookInfoData = await useRedis.getCacheById(hotelBookInfoKey)

        if(!Boolean(hotelBookInfoData)){
            return {
                success: false,
                isocountry: ipCountry || String(ipAddress)
            }
        }else{
            hotelBookInfoData = JSON.parse(hotelBookInfoData)
        }

        let requestParams = {
            ci: req.query.ci,
            co: req.query.co,
            resdate: req.query.resdate,
            pax: req.query.adult,
            chd1: req.query.child,
            totalroom: req.query.totalroom,
            agencyid: hotelBookInfoData.agencyid,
            pricecurrid: hotelBookInfoData.currencyid,
            orsactive: true,
            onlyinfo: true
        }

        if(hotelBookInfoData.marketid){
            requestParams.marketid = hotelBookInfoData.marketid
        }

        if(req.query.pricecurr){
            requestParams.pricecurr = req.query.pricecurr
        }

        if(req.query.refcode){
            requestParams.refcode = req.query.refcode
        }

        if(req.query.clientid){
            requestParams.clientid = req.query.clientid
        }

        const getContMasterList = async () => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.agencyContMasterList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.agencyid}`]: requestParams.agencyid,
                    [`${orestEndpoint.params.langcode}`]: req.query.langcode,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response?.data?.data.length > 0) {
                    return response.data.data
                } else {
                    return []
                }
            }).catch(() => [])
        }

        const checkinDate = moment(requestParams.ci, 'YYYY-MM-DD')
            , checkoutDate = moment(requestParams.co, 'YYYY-MM-DD')
            , totalDay = checkoutDate.diff(checkinDate, 'days')

        const getContractRateList = (roomType, contMasterId = false) => {
           return axios({
                url: helpers.getUrl(res, orestEndpoint.api.contractRateList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: Object.assign({
                    [`${orestEndpoint.params.roomtypeid}`]: roomType.id,
                    [`${orestEndpoint.params.pricecurrid}`]: roomType.pricecurrid,
                    [`${orestEndpoint.params.resdate}`]: requestParams.resdate,
                    [`${orestEndpoint.params.checkin}`]: requestParams.ci,
                    [`${orestEndpoint.params.totalday}`]: totalDay,
                    [`${orestEndpoint.params.refcode}`]: requestParams.refcode || null,
                    [`${orestEndpoint.params.agencyid}`]: requestParams.agencyid,
                    [`${orestEndpoint.params.langid}`]: requestParams.langid || 0,
                    [`${orestEndpoint.params.marketid}`]: requestParams.marketid || 0,
                    [`${orestEndpoint.params.clientid}`]: requestParams.clientid || 0,
                    [`${orestEndpoint.params.listall}`]: orestEndpoint.global.true,
                    [`${orestEndpoint.params.multidisc}`]: orestEndpoint.global.true,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },contMasterId ? {
                    [`${orestEndpoint.params.contmasterid}`]: contMasterId,
                }: {}),
            }).then((response) => {
                if (response?.data?.data.length > 0) {
                    return response.data.data
                } else {
                    return []
                }
            }).catch(() => [])
        }

        const getContractRateListWithContMaster = async (roomType, contMasterList) => {
            let contractRatePriceList = []
            if (contMasterList && contMasterList.length > 0) {
                for (let contMaster of contMasterList) {
                    const contractRateList = await getContractRateList(roomType, contMaster.id)
                    contractRatePriceList.push({
                        id: contMaster.id,
                        description: contMaster?.localdesc || contMaster?.description || '',
                        tagstr: contMaster?.localtagstr || contMaster?.tagstr || '',
                        prices: contractRateList,
                    })
                }
            } else {
                const contractRateList = await getContractRateList(roomType)
                contractRatePriceList.push({
                    id: 0,
                    description: '',
                    prices: contractRateList,
                })
            }
            return contractRatePriceList
        }

        const getContractRateListClone = (roomType) => {
            let newContractRateListClone = []
                , currentDate = checkinDate
            while (currentDate < checkoutDate) {
                newContractRateListClone.push({
                    startdate: moment(currentDate).format('YYYY-MM-DD'),
                    sngrate: roomType.minsngrate,
                    dblrate: roomType.mindblrate,
                    trprate: roomType.mintrprate,
                    quadrate: roomType.minquadrate,
                    extrarate: roomType.minextrarate,
                    extra2rate: roomType.minextra2rate,
                    chdrate : roomType.minchdrate,
                    chd2rate : roomType.minchd2rate,
                    babyrate : roomType.minbabyrate,
                    discdesc: roomType.discdesc,
                    discrate: roomType.discrate,
                    pricecurr: roomType.pricecurr,
                })
                currentDate = moment(currentDate).add(1, 'days')
            }

            return  {
                id: 0,
                description: '',
                prices: newContractRateListClone,
            }
        }

        const getMultiRatePriceList = async (roomTypeList) => {
            const contMasterList = await getContMasterList()
            let newRoomTypeList = []

            for (let roomType of roomTypeList) {
                roomType.priceList = await getContractRateListWithContMaster(roomType, contMasterList)

                if (!(roomType.priceList.length > 0)) {
                    roomType.priceList = getContractRateListClone(roomType)
                }

                newRoomTypeList.push(roomType)
            }

            return newRoomTypeList
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.roomTypeBookList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: Object.assign(requestParams,{
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno)
            }),
        }).then(async (response) => {
            response.data.searchid = getUuid(req.query.ci + req.query.co + req.query.resdate)
            response.data.agency = hotelBookInfoData.agencyid
            response.data.countryiso = ipCountry
            response.data.refcode = requestParams?.refcode || null
            response.data.data = await getMultiRatePriceList(response.data.data)
            const useCacheData = JSON.stringify(response.data)
            await useRedis.set(response.data.searchid, useCacheData)

            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getHotelBookInfo: (req, res) => {
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelBookInfo),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.countryiso}`]: req.query.langcode.toUpperCase(),
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    roomAdd: async (req, res, sett) => {
        const uitoken = req.query.uitoken, contmasterid = req.query.contmasterid
        let responseRoomDatas = [], requestRoomDatas = [], requestChildAgesDatas = [], useResRateData = [], getReservatPatchListData = [], processStatus = true, processMsg = ''

        const hotelBookInfoKey = getRedisKey(sett.serverCacheKey, uitoken, redisSuffixKeys.hotelBookInfo)
        let hotelBookInfoData = await useRedis.getCacheById(hotelBookInfoKey)

        if(!Boolean(hotelBookInfoData)){
            return {
                success: false
            }
        }else{
            hotelBookInfoData = JSON.parse(hotelBookInfoData)
        }

        const agencyDataKey = getRedisKey(sett.serverCacheKey, uitoken, redisSuffixKeys.agencyData)
        let agencyInfo = await useRedis.getCacheById(agencyDataKey)

        if(!Boolean(agencyInfo)){
            return {
                success: false
            }
        }else{
            agencyInfo = JSON.parse(agencyInfo)
        }

        let getCacheRoomTypeListData = await useRedis.getCacheById(req.query.searchid)
        if(!Boolean(getCacheRoomTypeListData)){
            return {
                success: false
            }
        }else{
            getCacheRoomTypeListData = JSON.parse(getCacheRoomTypeListData)
        }

        const agencyChdAges = agencyInfo ? { babyage: agencyInfo.babyage, chd1age: agencyInfo.chd1age, chd2age: agencyInfo.chd2age } : {}

        const getAgencyDataForReservat = (agencyInfo) => {
            return {
                sourceid: agencyInfo.sourceid,
                ressegmentid: agencyInfo.ressegmentid,
                rescountryid: agencyInfo.rescountryid,
                resdefinitid: agencyInfo.resdefinitid,
                paytype: agencyInfo.paytype,
                pricecurrid: agencyInfo.pricecurrid,
                nationid: agencyInfo.nationid,
                needinvoice: agencyInfo.needinvoice,
                marketid: agencyInfo.marketid,
                langid: agencyInfo.langid,
                boardtypeid: agencyInfo.boardtypeid,
                agencysubid: agencyInfo.agencysubid,
            }
        }

        const agencyData = getAgencyDataForReservat(agencyInfo)

        const getResRateData = (roomtypeid, reservno, resdate, incdiscrate = false) => {
            const roomTypeData = getCacheRoomTypeListData?.data?.find(roomType => roomType.id === roomtypeid) || false
                , getContMasterIndex = roomTypeData.priceList.findIndex((contMasterItem) => Number(contMasterItem.id) === Number(contmasterid))
            return roomTypeData.priceList[getContMasterIndex].prices.map((priceItem) => {
                return Object.assign({
                    reservno: reservno,
                    roomtypeid: roomTypeData.id,
                    contractid: priceItem.contractid,
                    rsingle: priceItem.sngrate,
                    rdouble: priceItem.dblrate,
                    rtriple: priceItem.trprate,
                    rquad: priceItem.quadrate,
                    extra: priceItem.extrarate,
                    extra2: priceItem.extra2rate,
                    child: priceItem.chdrate,
                    child2: priceItem.chd2rate,
                    baby: priceItem.babyrate,
                    startdate: priceItem.startdate,
                    hotelrefno: helpers.getSettings(req, res, global.hotelrefno)
                }, incdiscrate ? {
                    discrate: priceItem.discrate,
                } : {})
            })
        }

        const createResRate = (resRateData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.resRateListIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: resRateData
            }).then(() => {
                return true
            }).catch(()=> {
                return false
            })
        }

        const childTotals = getChildTotals(req.query.childages, agencyInfo)

        requestRoomDatas = Array.from({ length: req.query.qty }).map(() => {
            const getNewResRateData = getResRateData(Number(req.query.roomtype), 0, req.query.resdate, true)
            const { discrateTotal } = useTotalPrice(getNewResRateData, Number(req.query.adult), req?.query?.childages || [], agencyChdAges, true)
            return Object.assign(agencyData, {
                orsrefcode: getCacheRoomTypeListData?.refcode || '',
                status: orestEndpoint.params.temporary,
                checkin: req.query.ci,
                checkout: req.query.co,
                totalpax: req.query.adult,
                totalchd1: childTotals.totalChd1,
                totalchd2: childTotals.totalChd2,
                totalbaby: childTotals.totalBaby,
                totalroom: 1,
                resaction: req.query.resaction,
                roomtypeid: req.query.roomtype,
                agencyid: hotelBookInfoData.agencyid,
                discrate: discrateTotal,
                pricecurrid: req.query.pricecurrid || hotelBookInfoData.currencyid,
                hotelrefno: helpers.getSettings(req, res, global.hotelrefno),
            })
        })

        let useSaveReservationList = false
        await axios({
            url: helpers.getUrl(res, orestEndpoint.api.reservatListIns),
            method: orestEndpoint.methods.post,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
            data: requestRoomDatas,
        }).then((r) => {
            if (r.status === 200 && r.data.data.length > 0) {
                useSaveReservationList = r.data.data
            } else {
                processStatus = false
                processMsg = 'str_addRoomError'
            }
        }).catch(()=> {
            processStatus = false
            processMsg = 'str_addRoomError'
        })

        if (processStatus && req.query.childages && req.query.childages.length > 0) {
            await useSaveReservationList.map((reservat) => {
                req.query.childages.map((chd) => {
                    const chdParse = JSON.parse(chd)
                    requestChildAgesDatas.push({
                        chdno: Number(chdParse.ageno),
                        chdage: Number(chdParse.age),
                        reservno: reservat.reservno,
                        hotelrefno: req.query.hotelrefno || res.GENERAL_SETTINGS.HOTELREFNO,
                    })
                })
            })

            await axios({
                url: helpers.getUrl(res, orestEndpoint.api.reschdListIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: requestChildAgesDatas,
            }).then((response) => {
                if (response.status !== 200) {
                    processStatus = false
                    processMsg = 'create_childage_error'
                }
            }).catch(() => {
                processStatus = false
                processMsg = 'create_childage_error'
            })
        }

        if (processStatus) {
            await useSaveReservationList.map((reservat) => {
                const getNewResRateData = getResRateData(reservat.roomtypeid, reservat.reservno, reservat.resdate)
                useResRateData.push(...useResRateData.concat(...getNewResRateData))
                responseRoomDatas.push({
                    checkin: reservat.checkin,
                    checkout: reservat.checkout,
                    reservno: reservat.reservno,
                    roomtypeid: reservat.roomtypeid,
                    totalpax: req.query.adult,
                    totalchd: req.query.child,
                    totalnight: req.query.night,
                    discrate: 0,
                    totalprice: null,
                    roomrate: null,
                    boardrate: null,
                    dailyrate: null,
                    paxrate: null,
                    chdrate: null,
                    subtotal: null,
                    gid: reservat.gid,
                })
            })
        }

        if (processStatus) {
            await createResRate(useResRateData)
        }

        const reservatPatchList = (resPatchListData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.reservatListPatch),
                method: orestEndpoint.methods.patch,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: resPatchListData,
            }).then(() => {
                return true
            }).catch(() => {
                return false
            })
        }

        const createReservatPatchListData = (reservatGid, reservatPirceTotals) => {
            return {
                dailyprice: reservatPirceTotals.dailyrate,
                totalprice: reservatPirceTotals.totalprice,
                subtotal: reservatPirceTotals.subtotal,
                boardrate: reservatPirceTotals.boardrate,
                paxrate: reservatPirceTotals.paxrate,
                chdrate: reservatPirceTotals.chdrate,
                gid: reservatGid
            }
        }

        if (processStatus) {
            for (let reservat of responseRoomDatas) {
                await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.reservatPriceTotals),
                    method: orestEndpoint.methods.put,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.params.reservno}`]: reservat.reservno,
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                }).then((response) => {
                    if (response.status === 200 && response.data.data.totalprice !== null) {
                        const reservatIndex = responseRoomDatas.findIndex((item) => item.reservno === Number(reservat.reservno))
                        if (reservatIndex > -1) {
                            getReservatPatchListData.push(createReservatPatchListData(reservat.gid, response.data.data))
                            responseRoomDatas[reservatIndex].totalprice = response.data.data.totalprice
                            responseRoomDatas[reservatIndex].roomrate = response.data.data.roomrate
                            responseRoomDatas[reservatIndex].boardrate = response.data.data.boardrate
                            responseRoomDatas[reservatIndex].dailyrate = response.data.data.dailyrate
                            responseRoomDatas[reservatIndex].paxrate = response.data.data.paxrate
                            responseRoomDatas[reservatIndex].chdrate = response.data.data.chdrate
                            responseRoomDatas[reservatIndex].subtotal = response.data.data.subtotal
                        }
                    } else {
                        processStatus = false
                        processMsg = 'price_totals_room_error'
                    }
                }).catch(()=> {
                    processStatus = false
                    processMsg = 'price_totals_room_error'
                })
            }
        }

        const isReservatPatchingSuccessful  = await reservatPatchList(getReservatPatchListData)

        if(!isReservatPatchingSuccessful){
            processStatus = false
            processMsg = 'price_totals_upd_error'
        }

        if (processStatus) {
            return {
                success: true,
                msgcode: 'str_addedRoomSuccess',
                searchid: req.query.searchid,
                data: responseRoomDatas,
            }
        } else {
            return {
                success: false,
                msgcode: processMsg,
            }
        }
    },
    roomDelete: async (req, res) => {
        let processStatus, processMsg

        await axios({
            url: helpers.getUrl(res, orestEndpoint.api.reschdListDel),
            method: orestEndpoint.methods.delete,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                    [`${orestEndpoint.params.reservno}`]:  req.query.reservno,
                }),
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            if (response.data.success) {
                processStatus = true
                processMsg = 'child_age_deleted'
            } else {
                processStatus = false
                processMsg = 'child_age_could_not_be_deleted'
            }
        }).catch(() => {
            processStatus = false
            processMsg = 'child_age_could_not_be_deleted'
        })

        await axios({
            url: helpers.getUrl(res, orestEndpoint.api.reservatDel),
            method: orestEndpoint.methods.delete,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.gid}`]: req.query.gid,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            if (response.data.success) {
                processStatus = true
                processMsg = 'room_deleted'
            } else {
                processStatus = false
                processMsg = 'room_could_not_be_deleted'
            }
        }).catch(() => {
            processStatus = false
            processMsg = 'room_could_not_be_deleted'
        })

        return {
            status: processStatus,
            msg: processMsg
        }
    },
    getRoomAttributes: (req, res) => {
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.roomFullRoomAttr),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.gid}`]: req.query.gid,
                [`${orestEndpoint.params.chkonly}`]: orestEndpoint.global.true,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getHotelAppPortalList: (req, res) => {
        let params = {
            [`${orestEndpoint.params.incmembers}`]: orestEndpoint.global.true,
            [`${orestEndpoint.params.inchomesld}`]: orestEndpoint.global.false,
            [`${orestEndpoint.params.incsurvey}`]: orestEndpoint.global.false,
            [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
        }

        if (req.query.catid && req.query.catid !== 'false') {
            params.catid = req.query.catid
        }

        if (req.query.gid && req.query.gid !== 'false') {
            params.gid = req.query.gid
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppPortalList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: params,
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            if(orestHelper.responseError(error).status === 400) {
                return {
                    status: orestHelper.responseError(error).status,
                    data: orestHelper.responseError(error).data,
                    success: false
                }
            }
            return orestHelper.responseError(error)
        })

    },
    getHotelStatsGenSatis: (req, res) => {
        let params = {}

        if (req.query.groupby && req.query.groupby !== 'false') {
            params.groupby = req.query.groupby
        }

        if (req.query.startdate && req.query.startdate !== 'false') {
            params.startdate = req.query.startdate
        }

        if (req.query.enddate && req.query.enddate !== 'false') {
            params.enddate = req.query.enddate
        }

        if (req.query.companyid && req.query.companyid !== 'false') {
            params.companyid = req.query.companyid
        }

        if (req.query.chainid && req.query.ischain && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST ? res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid)) : undefined
            if(hotel) {
                let gid = hotel.gid.toUpperCase() || false
                let accid = hotel.accid || false

                if (gid) {
                    req.query.hoteltoken = gid
                }

                if (accid) {
                    req.query.hotelrefno = accid
                }
            }

        }

        req.query.hotelrefno = Number(req.query.hotelrefno)

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.statsGenSatis),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: params,
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getHotelCommentList: (req, res) => {

        if (req.query.companyid && req.query.companyid !== 'false') {
           params.companyid = req.query.companyid
        }

        if (req.query.chainid && (req.query.ischain && req.query.ischain === 'true' || req.query.isportal && req.query.isportal === 'true') && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST ? res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid)) : undefined
            if(hotel) {
                let gid = hotel.gid.toUpperCase() || false
                let accid = hotel.accid || false

                if (gid) {
                    req.query.hoteltoken = gid
                }

                if (accid) {
                    req.query.hotelrefno = accid
                }
            }
        }

        req.query.hotelrefno = Number(req.query.hotelrefno)
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.surevportransViewList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false
            }
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })

    },
    getHotelFacilityList: (req, res) => {

        let params = {
            [`${orestEndpoint.params.chkonly}`]: orestEndpoint.global.true,
        }

        if (req.query.companyid && req.query.companyid !== 'false') {
            params.companyid = req.query.companyid
        }

        if (req.query.chainid && req.query.ischain && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST ? res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid)) : undefined
            if(hotel) {
                let gid = hotel.gid.toUpperCase() || false
                let accid = hotel.accid || false

                if (gid) {
                    req.query.hoteltoken = gid
                }

                if (accid) {
                    req.query.hotelrefno = accid
                }
            }

        }

        req.query.hotelrefno = Number(req.query.hotelrefno)


        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.companyFullItemfact),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: params,
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getProductsProductList: async (req, res) => {
        let newParams = {}, clienttoken = false, isClientToken = false

        if (req.query.depart) {
            newParams.depart = req.query.depart
        }

        if (req.query.departid) {
            newParams.departid = req.query.departid
        }

        if (req.query.needcon) {
            newParams.needcon = req.query.needcon
        }

        if (req.query.needloy) {
            newParams.needloy = req.query.needloy
        }

        if (req.query.needors) {
            newParams.needors = req.query.needors
        }

        if (req.query.pricecurr) {
            newParams.pricecurr = req.query.pricecurr
        }

        if (req.query.limit) {
            newParams.limit = req.query.limit
        }else {
            newParams.limit = 0
        }

        if (req.query.start) {
            newParams.start = req.query.start
        }

        if(req.query.clienttoken){
            clienttoken = req.query.clienttoken
            isClientToken = true
        }

        if(req.query.langcode){
            newParams.langcode = req.query.langcode
        }

        if (req.query.chainid && req.query.ischain && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST ? res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid)) : undefined

            if(hotel) {
                let gid = hotel.gid.toUpperCase() || false
                let accid = hotel.accid || false

                if(gid){
                    req.query.hoteltoken = gid
                }

                if(accid){
                    req.query.hotelrefno = accid
                }
            }

        }

        req.query.hotelrefno = Number(req.query.hotelrefno)

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.sproductProductList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res, clienttoken, isClientToken),
            params: Object.assign(newParams, {
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            }),
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getPublicFile: (req, res) => {
        const params = {}
        if (req.query.url && req.query.url !== 'false') {
            params.url = req.query.url
        }

        if(params.url) {
            return axios({
                url: params.url,
                method: orestEndpoint.methods.get,
                responseType: 'arraybuffer'
            }).then((response) => {
                return {
                    type: response.headers['content-type'],
                    data: orestHelper.responseSuccess(response)
                }
            }).catch(() => {
              return false
            })
        }
    },
    getProductsOffersList: (req, res, sett) => {
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppHomeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: 'sectype::SECOFFERS',
                [`${orestEndpoint.params.incoffers}`]: orestEndpoint.global.true,
                [`${orestEndpoint.params.inchomesld}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.langcode}`]: req.query.langcode,
                [`${orestEndpoint.global.sort}`]: 'id',
                [`${orestEndpoint.global.hotelrefno}`]: sett.global.HOTELREFNO
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    sendContactEmail: async (req, res) => {
        if (Object.keys(req.body).length > 0) {
            const getReceiverName = async () => {
                return new Promise((resv) => {
                    return axios({
                        url: helpers.getUrl(res, orestEndpoint.api.settIbeFromName),
                        method: orestEndpoint.methods.get,
                        headers: helpers.getHeaders(req, res),
                    }).then((response) => {
                        if (response.status === 200 && response.data.data && response.data.count > 0 && response.data.data.res) {
                            return resv(response.data.data.res)
                        } else {
                            return resv(false)
                        }
                    }).catch(()=>{
                        return resv(false)
                    })
                })
            }
            const getReceiverMail = async () => {
                return new Promise((resv) => {
                    return axios({
                        url: helpers.getUrl(res, orestEndpoint.api.settIbeNotifEmailConfirm),
                        method: orestEndpoint.methods.get,
                        headers: helpers.getHeaders(req, res),
                    }).then((response) => {
                        if (response.status === 200 && response.data.data && response.data.count > 0 && response.data.data.res) {
                            return resv(response.data.data.res)
                        }  else {
                            return resv(false)
                        }
                    }).catch(()=>{
                        return resv(false)
                    })
                })
            }
            const contactData = {
                code: orestEndpoint.templates.cntctInfoEmail,
                sendername: res.REDIS_WEBCMS_DATA.assets.meta.title,
                senderemail:  process.env.MAIL_SENDER_MAIL,
                langcode: 'en',
                subject: req.body.subject,
                receivername: await getReceiverName(),
                receiveremail: await getReceiverMail()
            }
            const sendMailContent = {
                company: req.body.company,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                note: req.body.note,
                mobiletel: req.body.mobiletel,
                acctype: req.body.acctype,
                acctypeLabel: req.body.acctypeLabel,
                companyLabel: req.body.companyLabel,
                firstnameLabel: req.body.firstnameLabel,
                lastnameLabel: req.body.lastnameLabel,
                emailLabel: req.body.emailLabel,
                phoneLabel: req.body.phoneLabel,
                noteLabel: req.body.noteLabel,
            }

            const emailSend = await useMail.send(req, res, contactData, sendMailContent);

            if (emailSend.success) {
                return {
                    success: true,
                    mailsend: true,
                }
            } else {
                return {
                    success: false,
                    mailsend: false,
                    msg: emailSend.msg
                }
            }
        } else {
            return {
                success: false,
                msgcode: 'empty_data',
            }
        }
    },
    getGuestWebHomeList: (req, res) => {
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppHomeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.langcode}`]: req.query.langcode || 'en',
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getHomeSlider: (req, res) => {
        let params = {}
        if (req.query.chainid && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            let gid = hotel.gid.toUpperCase() || false
            let accid = hotel.accid || false

            if (gid) {
                req.query.hoteltoken = gid
            }

            if (accid) {
                req.query.hotelrefno = accid
            }
        }

        if(req.query.clientid) {
            params.clientid = req.query.clientid
        }

        if(req.query.langcode) {
            params.langcode = req.query.langcode
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppHomeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.inchomesld}`]: orestEndpoint.global.true,
                [`${orestEndpoint.params.incoffers}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.incsurvey}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.inchotels}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.langcode}`]: req.query.langcode,
                [`${orestEndpoint.global.sort}`]: 'id',
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                ...params
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getHomeTypes: (req, res) => {
        let params = {}
        if (req.query.chainid && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            let gid = hotel.gid.toUpperCase() || false
            let accid = hotel.accid || false

            if (gid) {
                req.query.hoteltoken = gid
            }

            if (accid) {
                req.query.hotelrefno = accid
            }
        }

        if(req.query.clientid) {
            params.clientid = req.query.clientid
        }

        if(req.query.langcode) {
            params.langcode = req.query.langcode
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppHomeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.inchotels}`]: orestEndpoint.global.true,
                [`${orestEndpoint.params.inchomesld}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.incoffers}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.incsurvey}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.langcode}`]: req.query.langcode,
                [`${orestEndpoint.global.sort}`]: 'id',
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                ...params
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getHomeOffers: (req, res) => {
        let params = {}
        if (req.query.chainid && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            let gid = hotel.gid.toUpperCase() || false
            let accid = hotel.accid || false

            if (gid) {
                req.query.hoteltoken = gid
            }

            if (accid) {
                req.query.hotelrefno = accid
            }
        }

        if(req.query.clientid) {
            params.clientid = req.query.clientid
        }

        if(req.query.langcode) {
            params.langcode = req.query.langcode
        }

        if(req.query.topn) {
            params.topn = req.query.topn
        }

        if(req.query.catcode) {
            params.catcode = req.query.catcode
        }else{
            params.catcode = null
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppHomeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.incoffers}`]: orestEndpoint.global.true,
                [`${orestEndpoint.params.inchotels}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.inchomesld}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.incsurvey}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.langcode}`]: req.query.langcode,
                [`${orestEndpoint.global.sort}`]: 'id',
                [`${orestEndpoint.params.topn}`]: req?.query?.topn || 4,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                ...params
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getGuestWebHomeSlider: (req, res) => {
        if (req.query.chainid && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            let gid = hotel.gid.toUpperCase() || false
            let accid = hotel.accid || false

            if (gid) {
                req.query.hoteltoken = gid
            }

            if (accid) {
                req.query.hotelrefno = accid
            }
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppHomeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: 'sectype::SECHOMESLD',
                [`${orestEndpoint.params.inchomesld}`]: orestEndpoint.global.true,
                [`${orestEndpoint.params.incoffers}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.langcode}`]: req.query.langcode,
                [`${orestEndpoint.global.sort}`]: 'id',
                [`${orestEndpoint.global.limit}`]: 5,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getGuestWebHomeSurvey: (req, res) => {
        const params = {
            [`${orestEndpoint.params.inchomesld}`]: orestEndpoint.global.false,
            [`${orestEndpoint.params.inchotels}`]: orestEndpoint.global.false,
            [`${orestEndpoint.params.incsurvey}`]: orestEndpoint.global.true,
            [`${orestEndpoint.params.incoffers}`]: orestEndpoint.global.false,
            [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
        }

        if(req.query.clientid) {
            params.clientid = req.query.clientid
        }

        if(req.query.limit) {
            params.limit = req.query.limit
        }

        if(req.query.langcode) {
            params.lancode = req.query.langcode
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppHomeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: params,
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getGuestWebHomeOfferSales: (req, res) => {
        let params = {
            [`${orestEndpoint.params.catcode}`]: req.query.catcode,
            [`${orestEndpoint.params.inchomesld}`]: orestEndpoint.global.false,
            [`${orestEndpoint.params.inchotels}`]: orestEndpoint.global.false,
            [`${orestEndpoint.params.incsurvey}`]: orestEndpoint.global.false,
            [`${orestEndpoint.params.incoffers}`]: orestEndpoint.global.true,
            [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
        }

        if(req.query.clientid) {
            params.clientid = req.query.clientid
        }

        if(req.query.limit) {
            params.limit = req.query.limit
        }

        if(req.query.langcode) {
            params.lancode = req.query.langcode
        }


        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppHomeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: params,
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getGuestWebHotelInfo: (req, res, sett) => {
        if (req.query.chainid && req.query.ischain && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            let gid = hotel.gid.toUpperCase() || false
            let accid = hotel.accid || false

            if (gid) {
                req.query.hoteltoken = gid
            }

            if (accid) {
                req.query.hotelrefno = accid
            }
        }

        let params = {
            [`${orestEndpoint.params.langcode}`]: req.query.langcode,
            [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
        }

       if(req.query.catid && req.query.catid !== 'false'){
           params.catid = req.query.catid
           params.query = `catid:${req.query.catid}`
       }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppInfoList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: params
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getGuestWebHotelEventsWeekly: async (req, res) => {

        if (req.query.chainid && req.query.ischain && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = await res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            let gid = await hotel.gid.toUpperCase() || false
            let accid = await hotel.accid || false

            if (gid) {
                req.query.hoteltoken = gid
            }

            if (accid) {
                req.query.hotelrefno = accid
            }
        }

        let weekOfHead = moment().locale(defaultLocale).startOf(orestEndpoint.dates.week).add(1, orestEndpoint.dates.d)
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppEventList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.langcode}`]: req.query.langcode,
                [`${orestEndpoint.params.incstd}`]: orestEndpoint.global.true,
                [`${orestEndpoint.params.incext}`]: orestEndpoint.global.true,
                [`${orestEndpoint.params.startdate}`]: String(moment(weekOfHead).locale(defaultLocale).format(orestEndpoint.dates.orestFullDateFormat)),
                [`${orestEndpoint.params.enddate}`]: String(moment(weekOfHead).locale(defaultLocale).add(orestEndpoint.dates.weekDayInt, orestEndpoint.dates.days).format(orestEndpoint.dates.orestFullDateFormat)),
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getGuestWebHotelEventsNearby: async (req, res) => {
        if (req.query.chainid && req.query.ischain && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = await res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            let gid = await hotel.gid.toUpperCase() || false
            let accid = await hotel.accid || false

            if (gid) {
                req.query.hoteltoken = gid
            }

            if (accid) {
                req.query.hotelrefno = accid
            }
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppEventList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.langcode}`]: req.query.langcode,
                [`${orestEndpoint.params.incstd}`]: orestEndpoint.global.false,
                [`${orestEndpoint.params.incext}`]: orestEndpoint.global.true,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getGuestWebHotelEventsHotel: (req, res) => {
        if (req.query.chainid && req.query.ischain && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            let gid = hotel.gid.toUpperCase() || false
            let accid = hotel.accid || false

            if (gid) {
                req.query.hoteltoken = gid
            }

            if (accid) {
                req.query.hotelrefno = accid
            }
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hotelAppEventList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.langcode}`]: req.query.langcode,
                [`${orestEndpoint.params.incstd}`]: orestEndpoint.global.true,
                [`${orestEndpoint.params.incext}`]: orestEndpoint.global.false,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getGuestWebFaq: (req, res, sett) => {
        if (!req.query.langcode) {
            return {
                success: false,
            }
        }

        if (req.query.chainid && req.query.ischain && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST ? res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid)) : undefined
            if(hotel) {
                let gid = hotel.gid.toUpperCase() || false
                let accid = hotel.accid || false

                if (gid) {
                    req.query.hoteltoken = gid
                }

                if (accid) {
                    req.query.hotelrefno = accid
                }
            }

        }


        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.toolsFileFind),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.code}`]: `${global.guestWeb.faq}`,
                [`${orestEndpoint.params.langcode}`]: `${req.query.langcode}`,
                [`${orestEndpoint.params.contentype}`]: '0000505',
                [`${orestEndpoint.params.masterid}`]:  sett.global.HOTELMID,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
            data: {
                chkhotel: true,
            },
        }).then((response) => {

            let faqData
            if (response.status === 200 && response.data.count > 0) {
                faqData = response.data.data.filedata
                faqData = new Buffer.from(faqData, 'base64').toString('utf-8')
                faqData = JSON.parse(faqData)

                response.data.langcode = response.data.data.langcode
                response.data.data = faqData

            } else {
                response.data.data = false
                response.data.langcode = false
                response.success = false
            }

            return orestHelper.responseSuccess(response)

        }).catch(() => {
            return {
                success: false,
            }
        })
    },
    getHotelContentSlider: async (req, res) => {
        if (!req.query.sliderid) {
            return {
                success: false,
            }
        }

        if(req.query.isportal && req.query.isportal === 'true' || req.query.ischain && req.query.ischain === 'true') {
            let hotel = await res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            if(hotel) {
                req.query.hoteltoken = hotel.gid.toUpperCase()
                req.query.hotelrefno = hotel.accid
            }
        }
        req.query.hotelrefno = Number(req.query.hotelrefno)

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.hcmItemImgViewList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                    [`${orestEndpoint.params.sliderid}`]: req.query.sliderid,
                }),
                [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true,
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch(() => {
            return {
                success: false,
            }
        })
    },
    getHotelContentInfoCountry: async (req, res) => {
        return await new Promise(async (resv) => {
            axios({
                url: helpers.getUrl(res, orestEndpoint.api.countryList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.global.true}`,
                    }),
                    [`${orestEndpoint.global.limit}`]: 1000,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                resv(orestHelper.responseSuccess(response))
            }).catch((error) => {
                resv(orestHelper.responseError(error))
            })
        })
    },
    getHotelContentInfoCity: async (req, res) => {
        return await new Promise(async (resv) => {

            if (!req.body.country) {
                resv({
                    success: false,
                })
            }

            axios({
                url: helpers.getUrl(res, orestEndpoint.api.cityViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.countrydesc}`]: `${req.body.country}`,
                    }),
                    [`${orestEndpoint.global.limit}`]: 1000,
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                resv(orestHelper.responseSuccess(response))
            }).catch((error) => {
                resv(orestHelper.responseError(error))
            })
        })
    },
    getHotelContentInfoTown: async (req, res) => {
        return await new Promise(async (resv) => {

            if (!req.body.city) {
                resv({
                    success: false,
                })
            }

            axios({
                url: helpers.getUrl(res, orestEndpoint.api.townViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.citydesc}`]: `${req.body.city}`,
                    }),
                    [`${orestEndpoint.global.limit}`]: 1000,
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                resv(orestHelper.responseSuccess(response))
            }).catch((error) => {
                resv(orestHelper.responseError(error))
            })
        })
    },
    getHotelContentInfoNation: async (req, res) => {
        return await new Promise(async (resv) => {
            axios({
                url: helpers.getUrl(res, orestEndpoint.api.nationList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.global.true}`,
                    }),
                    [`${orestEndpoint.global.limit}`]: 1000,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                resv(orestHelper.responseSuccess(response))
            }).catch((error) => {
                resv(orestHelper.responseError(error))
            })
        })
    },
    getPhoneInfo: (req, res) => {
        const params = {}
        params.hotelrefno = helpers.getSettings(req, res, global.hotelrefno)
        if(req.query.tel) {
            params.tel = req.query.tel
        }
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.toolsPhoneInfo),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: params
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getHotelContentInfoIdType: async (req, res) => {
        return await new Promise(async (resv) => {
            axios({
                url: helpers.getUrl(res, orestEndpoint.api.idtypeList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.global.true}`,
                    }),
                    [`${orestEndpoint.global.limit}`]: 1000,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                resv(orestHelper.responseSuccess(response))
            }).catch((error) => {
                resv(orestHelper.responseError(error))
            })
        })
    },
    getHotelContentInfoTaxOffice: async (req, res) => {
        return await new Promise(async (resv) => {
            axios({
                url: helpers.getUrl(res, orestEndpoint.api.taxofficeList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.global.true}`,
                    }),
                    [`${orestEndpoint.global.limit}`]: 1000,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                resv(orestHelper.responseSuccess(response))
            }).catch((error) => {
                resv(orestHelper.responseError(error))
            })
        })
    },
    getHotelContentInfoJob: async (req, res) => {
        return await new Promise(async (resv) => {
            axios({
                url: helpers.getUrl(res, orestEndpoint.api.clntjobList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.global.true}`,
                    }),
                    [`${orestEndpoint.global.limit}`]: 1000,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                resv(orestHelper.responseSuccess(response))
            }).catch((error) => {
                resv(orestHelper.responseError(error))
            })
        })
    },
    getHotelContentInfoGender: async (req, res) => {
        return await new Promise(async (resv) => {
            axios({
                url: helpers.getUrl(res, orestEndpoint.api.transtypeViewGender),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                resv(orestHelper.responseSuccess(response))
            }).catch((error) => {
                resv(orestHelper.responseError(error))
            })
        })
    },
    getGuestWebEventLocDetail: (req, res) => {

        if (!req.query.id) {
            return {
                success: false,
            }
        }

        if (req.query.chainid && req.query.ischain && req.query.ischain === 'true' && Number(req.query.hotelrefno) !== Number(req.query.chainid)) {
            let hotel = res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            let gid = hotel.gid.toUpperCase() || false
            let accid = hotel.accid || false

            if (gid) {
                req.query.hoteltoken = gid
            }

            if (accid) {
                req.query.hotelrefno = accid
            }
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.eventlocViewList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                    [`${orestEndpoint.params.id}`]: `${orestEndpoint.operator.matching}${req.query.id}`,
                }),
                [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    getHotelSettCrmRegisterAge: async (req, res) => {
        let maxage = 0, minage = 0

        await axios({
            url: helpers.getUrl(res, orestEndpoint.api.settCrmBonusMaxAge),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            if (response.status === 200 && response.data && response.data.success) {
                maxage = response.data.data.res
            }
        })

        await axios({
            url: helpers.getUrl(res, orestEndpoint.api.settCrmBonusMinAge),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            if (response.status === 200 && response.data && response.data.success) {
                minage = response.data.data.res
            }
        })

        return {
            success: true,
            maxage: maxage,
            minage: minage
        }
    },
    getHotelSettChatEnabled: async (req, res) => {
        return await new Promise(async (resv) => {
            axios({
                url: helpers.getUrl(res, orestEndpoint.api.settGappChatEnabled),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                resv(orestHelper.responseSuccess(response))
            }).catch((error) => {
                resv(orestHelper.responseError(error))
            })
        })
    },
    getPayType: async (req, res) => {
        let paymentMethods = []

        //check pay at hotel
        await axios({
            url: helpers.getUrl(res, orestEndpoint.api.paytypeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                    [`${orestEndpoint.params.iscash}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                    [`${orestEndpoint.params.isorsactive}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                }),
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            if (response.status === 200 && response.data.data.length > 0) {
                paymentMethods.push({
                    paytype: 'str_payAtHotel',
                    iconname: 'business',
                    paytypeid: response.data.data[0].id,
                    orderno: 1,
                })
            }
        })

        //check pay at vpos
        await axios({
            url: helpers.getUrl(res, orestEndpoint.api.paytypeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                    [`${orestEndpoint.params.isccpay}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                    [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                    [`${orestEndpoint.params.isorsactive}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                }),
                [`${orestEndpoint.global.limit}`]: 1,
                [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true
            },
        }).then((response) => {
            if (response.status === 200 && response.data.data.length > 0) {
                paymentMethods.push({
                    paytype: 'str_payAtCC',
                    iconname: 'payment',
                    paytypeid: response.data.data[0].id,
                    orderno: 0,
                })
            }
        })

        let bankIban = []
        await axios({
            url: helpers.getUrl(res, orestEndpoint.api.bankList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                    [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                }),
                [`${orestEndpoint.global.limit}`]: 20,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then(async (response) => {
            if (response.status === 200 && response.data.data.length > 0) {
                await response.data.data.map((item) => {
                    bankIban.push({
                        bankname: item.bankname,
                        bankbranch: item.bankbranch,
                        currencycode: item.currencycode,
                        accountno: item.accountno,
                        iban: item.iban,
                    })
                })
            } else {
                bankIban = false
            }
        })

        //check pay transfer
        if (bankIban.length > 0 && bankIban !== false) {
            await axios({
                url: helpers.getUrl(res, orestEndpoint.api.paytypeList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.istransfer}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                        [`${orestEndpoint.params.isorsactive}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                    }),
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200 && response.data.data.length > 0) {
                    paymentMethods.push({
                        paytype: 'str_payTransfer',
                        iconname: 'account_balance',
                        paytypeid: response.data.data[0].id,
                        orderno: 0,
                    })
                }
            })
        }

        return {
            success: true,
            paytypes: paymentMethods,
            ibans: bankIban,
        }

    },
    userSave: async (req, res, sett) => {
        const getSurveyLocId = () => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.surveyLocWeb),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: sett.global.useHotelRefno,
                },
            }).then((response) => {
                if (response.status === 200 && response.data && response.data.data && response.data.data[0].res) {
                    return response.data.data[0].res
                } else {
                    return false
                }
            })
        }

        const getDataPolicyId = () => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.prvconfDataPolicy),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: sett.global.useHotelRefno
                },
            }).then((response) => {
                if (response.status === 200 && response.data && response.data.data.res) {
                    return response.data.data.res
                } else {
                    return false
                }
            })
        }

        const existedEmail = (email) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientCountSearch),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.email}`]: `${orestEndpoint.operator.containing}${email}`,
                    }),
                    [`${orestEndpoint.global.hotelrefno}`]: sett.global.useHotelRefno,
                },
            }).then((response) => {
                if (response.status === 200 && response.data.data > 0) {
                    return true
                }else{
                    return false
                }
            })
        }

        return new Promise(async (resolve) => {
            if (req.body.email && req.body.firstname && req.body.lastname && (sett.global.hotelSettings.regbirthdate && req.body.birthdate || !sett.global.hotelSettings.reg_birthdate)) {
                const isExistedEmail = await existedEmail(req.body.email)
                if (!isExistedEmail) {
                    await axios({
                        url: helpers.getUrl(res, orestEndpoint.api.clientLoginId),
                        method: orestEndpoint.methods.put,
                        headers: helpers.getHeaders(req, res),
                        params: Object.assign(
                            sett.global.hotelSettings.regbirthdate ?
                                { [`${orestEndpoint.params.birthdate}`]: req.body.birthdate } : {},
                            {
                                [`${orestEndpoint.params.force}`]: orestEndpoint.global.true,
                                [`${orestEndpoint.params.register}`]: orestEndpoint.global.true,
                                [`${orestEndpoint.params.firstname}`]: req.body.firstname,
                                [`${orestEndpoint.params.lastname}`]: req.body.lastname,
                                [`${orestEndpoint.params.email}`]: req.body.email,
                                [`${orestEndpoint.global.hotelrefno}`]: sett.global.useHotelRefno,
                            }),
                    }).then(async (clientLoginIdResponse) => {
                        if (clientLoginIdResponse.status === 200 && clientLoginIdResponse.data && clientLoginIdResponse.data.success && clientLoginIdResponse.data.count > 0) {
                            const clientLoginIdResponseData = clientLoginIdResponse.data.data
                            const locationId = await getSurveyLocId()
                            const dataPolicyId = await getDataPolicyId()

                            await axios({
                                url: helpers.getUrl(res, orestEndpoint.api.prvtransListIns),
                                method: orestEndpoint.methods.post,
                                headers: helpers.getHeaders(req, res),
                                params: {
                                    [`${orestEndpoint.global.hotelrefno}`]: sett.global.useHotelRefno,
                                },
                                data: [{
                                    accid: clientLoginIdResponseData.clientid,
                                    prvconfid: dataPolicyId || null,
                                    isok: true,
                                    locid: locationId,
                                    hotelrefno: sett.global.useHotelRefno,
                                }],
                            })

                            const clientPass = helpers.generatePassword()
                            await axios({
                                url: helpers.getUrl(res, orestEndpoint.api.toolsUserPassword),
                                method: orestEndpoint.methods.put,
                                headers: helpers.getHeaders(req, res),
                                params: {
                                    [`${orestEndpoint.params.email}`]: `${req.body.email}`,
                                    [`${orestEndpoint.params.pass}`]: `${clientPass}`,
                                    [`${orestEndpoint.params.sendmsg}`]: `${orestEndpoint.global.false}`,
                                    [`${orestEndpoint.global.hotelrefno}`]: sett.global.useHotelRefno,
                                },
                            }).then(async (toolsUserPasswordResponse) => {
                                if (toolsUserPasswordResponse.status === 200 && toolsUserPasswordResponse.data && toolsUserPasswordResponse.data.success && toolsUserPasswordResponse.data.count > 0) {
                                    let subjectArray = {
                                        'en': 'You are registered to the survey',
                                        'tr': 'Ankete Kayıt Oldunuz',
                                        'de': 'Sie sind für die Umfrage registriert',
                                        'ru': 'Вы зарегистрированы для участия в опросе',
                                        'mk': 'Пријавени сте на анкетата',
                                        'sq': 'Ju jeni regjistruar në sondazh',
                                        'ar': 'أنت مسجل في الاستطلاع'
                                    }

                                    let surveyLoginUrl = `${res.GENERAL_SETTINGS.BASE_URL}survey/${req.body.surveygid}?email=${req.body.email}&pass=${clientPass}&refurl=`+ encodeURIComponent(`/survey/${req.body.surveygid}?lang=${req.body.langcode || 'en'}`)
                                    let subject = res.REDIS_WEBCMS_DATA.assets.meta.title + ' - ' + (subjectArray[req.body.langcode] || 'New Password')
                                    let sendClient = await useMail.send(req, res, {
                                            code: orestEndpoint.templates.cldSurveyRegisterMailCli,
                                            sendername: res.GENERAL_SETTINGS.hotelSettings.from_name || res.REDIS_WEBCMS_DATA.assets.meta.title,
                                            senderemail: res.GENERAL_SETTINGS.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                                            langcode: req.body.langcode || 'en',
                                            subject: subject,
                                            receivername: (req.body.firstname + ' ' + req.body.lastname),
                                            receiveremail: req.body.email,
                                        },
                                        {
                                            usermail: req.body.email,
                                            userpass: clientPass,
                                            surveyloginurl: surveyLoginUrl,
                                            hotelname: res.REDIS_WEBCMS_DATA.assets.meta.title,
                                        })

                                    if (sendClient) {
                                        resolve({
                                            success: true,
                                        })
                                    } else {
                                        resolve({
                                            success: false
                                        })
                                    }
                                } else {
                                    resolve({
                                        success: false
                                    })
                                }
                            })
                        }
                    }).catch(() => {
                        resolve({
                            success: false
                        })
                    })
                } else {
                    resolve({
                        success: false,
                        error: 'existed_email',
                    })
                }
            } else {
                resolve({
                    success: false,
                    error: 'missing_required',
                })
            }
        })
    },
    hotelEmpRegister: async (req, res, sett) => {

        const chkEmployeeEmailExits = (email) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.employeeEmailExists),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: email
                },
            }).then((response) => {
                if (response.status === 200 &&  response?.data?.data?.res) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const createEmployee = () => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.employeeIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    mobiletel: helpers.mobileTelNoFormat(req.body.mobiletel),
                    city: req.body.city,
                    country: req.body.country,
                    haslogin: true,
                    isactive: true,
                    refcode: 'REGISTERWEB',
                    hotelrefno: sett.global.useHotelRefno,
                }
            }).then((response) => {
                if (response.status === 200 && response?.data?.data) {
                    return response.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const setEmployeePass = (employee, employeePass) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsUserPassword),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: `${employee.email}`,
                    [`${orestEndpoint.params.pass}`]: `${employeePass}`,
                    [`${orestEndpoint.params.sendmsg}`]: `${orestEndpoint.global.false}`,
                    [`${orestEndpoint.global.hotelrefno}`]: sett.global.useHotelRefno,
                },
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const sendEmployeeNotifUser = (employee, employeePass) => {
            let subjectArray = {
                'en': 'You have successfully registered',
                'tr': 'Kayıt işleminiz başarılı',
                'de': 'Sie haben sich erfolgreich registriert',
                'ru': 'Вы успешно зарегистрировались',
                'es': 'Se ha registrado exitosamente',
            }

            let employeeLoginUrl = `${res.GENERAL_SETTINGS.BASE_URL}emp?email=${req.body.email}&pass=${employeePass}&lang=${req.body.langcode || 'en'}`
            let subject = res.REDIS_WEBCMS_DATA.assets.meta.title + ' - ' + (subjectArray[req.body.langcode] || 'New Password')
            return useMail.send(req, res, {
                    code: orestEndpoint.templates.emlNtfEmpRegUsr,
                    sendername: res.GENERAL_SETTINGS.hotelSettings.from_name || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: res.GENERAL_SETTINGS.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    langcode: req.body.langcode || 'en',
                    subject: subject,
                    receivername: (employee.firstname + ' ' + employee.lastname),
                    receiveremail: employee.email,
                },
                {
                    usermail: employee.email,
                    userpass: employeePass,
                    employeeLoginUrl: employeeLoginUrl,
                    hotelname: res.REDIS_WEBCMS_DATA.assets.meta.title,
                },
            )
        }

        if (req.body.firstname && req.body.lastname && req.body.email && req.body.mobiletel && req.body.city && req.body.country ){

            const getEmployeeEmailExits = await chkEmployeeEmailExits(req.body.email)
            if(getEmployeeEmailExits){
                return {
                    success: false,
                    error: 'existed_email',
                }
            }

            const getEmployee = await createEmployee()
            if(!getEmployee){
                return {
                    success: false,
                    error: 'emp_register',
                }
            }

            const employeePass = helpers.generatePassword()
                , getEmployeePass = await setEmployeePass(getEmployee, employeePass)
            if(!getEmployeePass){
                return {
                    success: false,
                    error: 'emp_send_password',
                }
            }

            const getSendEmployeeWelcomeMail = await sendEmployeeNotifUser(getEmployee, employeePass)
            if(!getSendEmployeeWelcomeMail){
                return {
                    success: false,
                    error: 'emp_send_mail',
                }
            }

            return {
                success: true,
                msg: 'Employee registered successfully!',
            }

        }else{
            return {
                success: false,
                error: 'missing_required',
                error_description: 'Required fields are missing!',
            }
        }
    },
    userRegister: async (req, res, sett) => {

        const chkClientEmailExits = (email) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientEmailExists),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: email
                },
            }).then((response) => {
                if (response.status === 200 &&  response?.data?.data?.res) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return null
            })
        }

        const chkClientPhoneExists = (tel) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientPhoneExists),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.tel}`]: helpers.mobileTelNoFormat(tel)
                },
            }).then((response) => {
                if (response.status === 200 &&  response?.data?.data?.res) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return null
            })
        }

        const createClient = () => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: Object.assign(sett.global.hotelSettings.regbirthdate ? { birthdate: req.body.birthdate } : {},
                    {
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        gender: req.body.gender,
                        email: req.body.email,
                        mobiletel: helpers.mobileTelNoFormat(req.body.mobiletel),
                        nationid: req.body.nationid,
                        country: req.body.country,
                        address1: req.body.address1,
                        city: req.body.city,
                        zip: req.body.zip,
                        idtypeid: req.body.idtypeid,
                        idno: req.body.idno,
                        birthplace: req.body.birthplace,
                        title: req.body.title,
                        taxoid: req.body.taxoid,
                        taxnumber: req.body.taxnumber,
                        occupationid: req.body.occupationid,
                        note: req.body.note,
                        isprivate: req.body.isprivate,
                        hotelrefno: sett.global.useHotelRefno,
                    }),
            }).then((response) => {
                if (response.status === 200 && response?.data?.data) {
                    return response.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const createClientLoginId = (client) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientLoginId),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.id}`]: client.id,
                    [`${orestEndpoint.params.datapolicy}`]: `${orestEndpoint.global.true}`,
                    [`${orestEndpoint.params.pref}`]: `${orestEndpoint.global.true}`,
                    [`${orestEndpoint.params.force}`]: `${orestEndpoint.global.true}`,
                },
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const setWelcomeBonus = (client) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.bonustransInsWelcome),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.accid}`]: client.id,
                    [`${orestEndpoint.params.isweb}`]: `${orestEndpoint.global.true}`,
                },
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const clientMergeAll = (client) => {
            let params = {}
            if(client?.firstname){
                params[`${orestEndpoint.params.name}`] = client?.firstname
            }

            if(client?.mobiletel){
                params[`${orestEndpoint.params.tel}`] = client?.mobiletel
            }

            if(client?.email){
                params[`${orestEndpoint.params.email}`] = client?.email
            }

            if(client?.birthdate){
                params[`${orestEndpoint.params.bdate}`] = client?.birthdate
            }

            if(sett?.global?.hotelSettings?.mergeold){
                params[`${orestEndpoint.params.delold}`] = orestEndpoint.global.true
            }

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientMergeAll),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const setClientPass = (client, clientPass) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsUserPassword),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: `${client.email}`,
                    [`${orestEndpoint.params.pass}`]: `${clientPass}`,
                    [`${orestEndpoint.params.sendmsg}`]: `${orestEndpoint.global.false}`,
                    [`${orestEndpoint.global.hotelrefno}`]: sett.global.useHotelRefno,
                },
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const sendClientWelcomeMail = (client, clientPass) => {
            let subjectArray = {
                'en': 'You have successfully registered',
                'tr': 'Kayıt işleminiz başarılı',
                'de': 'Sie haben sich erfolgreich registriert',
                'ru': 'Вы успешно зарегистрировались',
                'es': 'Se ha registrado exitosamente',
                'mk': 'Пријавени сте на анкетата',
                'sq': 'Ju jeni regjistruar në sondazh',
                'ar': 'لقد قمت بالتسجيل بنجاح'
            }

            let guestLoginUrl = `${res.GENERAL_SETTINGS.BASE_URL}guest/login?email=${req.body.email}&pass=${clientPass}&lang=${req.body.langcode || 'en'}`
            let subject = res.REDIS_WEBCMS_DATA.assets.meta.title + ' - ' + (subjectArray[req.body.langcode] || 'New Password')
            return useMail.send(req, res, {
                    code: orestEndpoint.templates.cldGuestWebRegCli,
                    sendername: res.GENERAL_SETTINGS.hotelSettings.from_name || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: res.GENERAL_SETTINGS.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    langcode: req.body.langcode || 'en',
                    subject: subject,
                    receivername: (client.firstname + ' ' + client.lastname),
                    receiveremail: client.email,
                },
                {
                    usermail: client.email,
                    userpass: clientPass,
                    guestloginurl: guestLoginUrl,
                    hotelname: res.REDIS_WEBCMS_DATA.assets.meta.title,
                },
            )
        }

        if (req.body.email && req.body.firstname && req.body.lastname && req.body.mobiletel && (sett.global.hotelSettings.regbirthdate && req.body.birthdate || !sett.global.hotelSettings.reg_birthdate)) {

            const getClientEmailExits = await chkClientEmailExits(req.body.email)
            if (getClientEmailExits) {
                return {
                    success: false,
                    error: 'existed_email',
                }
            } else if (getClientEmailExits === null) {
                return {
                    success: false,
                    error: 'unexpected_problem',
                }
            }

            const getClientMobileTelExits = await chkClientPhoneExists(req.body.mobiletel)
            if (getClientMobileTelExits) {
                return {
                    success: false,
                    error: 'existed_mobiletel',
                }
            } else if (getClientMobileTelExits === null) {
                return {
                    success: false,
                    error: 'unexpected_problem',
                }
            }

            const getClient = await createClient()
            if(!getClient){
                return {
                    success: false,
                    error: 'client_register',
                }
            }

            await clientMergeAll(getClient)

            const getClientLoginId = await createClientLoginId(getClient)
            if(!getClientLoginId){
                return {
                    success: false,
                    error: 'client_loginid',
                }
            }

            const getWelcomeBonus = await setWelcomeBonus(getClient)
            if(!getWelcomeBonus){
                return {
                    success: false,
                    error: 'client_welcomebonus',
                }
            }

            const clientPass = helpers.generatePassword()
            const getClientPass = await setClientPass(getClient, clientPass)
            if(!getClientPass){
                return {
                    success: false,
                    error: 'client_send_password',
                }
            }

            const getSendClientWelcomeMail = await sendClientWelcomeMail(getClient, clientPass)
            if(!getSendClientWelcomeMail){
                return {
                    success: false,
                    error: 'client_send_mail',
                }
            }

            return {
                success: true,
                bonus: true,
                msg: 'Client registered successfully!',
            }

        }else{
            return {
                success: false,
                error: 'missing_required',
                error_description: 'Required fields are missing!',
            }
        }
    },
    userUpdate: async (req, res, sett) => {

        let isRequire = req.body.email && req.body.firstname && req.body.lastname && req.body.birthdate

        if (req.body.clienthotelrefno && Number(req.query.hotelrefno) !== Number(req.body.clienthotelrefno)) {
            let hotel = res.PRIVATE_CHAIN_LIST ? res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.body.clienthotelrefno)) : undefined
            if(hotel) {
                let gid = hotel.gid.toUpperCase() || false
                let accid = hotel.accid || false

                if (gid) {
                    req.query.hoteltoken = gid
                }

                if (accid) {
                    req.query.hotelrefno = accid
                }
            }
        }

        if (isRequire) {
            const getSurveyLocId = () => {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.surveyLocWeb),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: req.body.clienthotelrefno || sett.global.useHotelRefno,
                    },
                }).then((response) => {
                    if (response.status === 200 && response.data && response.data.data && response.data.data[0].res) {
                        return response.data.data[0].res
                    } else {
                        return false
                    }
                })
            }

            const getDataPolicyId = () => {
               return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.prvconfDataPolicy),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: req.body.clienthotelrefno || sett.global.useHotelRefno,
                    },
                }).then((response) => {
                   if (response.status === 200 && response.data && response.data.data.res) {
                       return response.data.data.res
                   } else {
                       return false
                   }
                }).catch(()=> {
                    return false
                })
            }

            const getDataPrefId = () => {
               return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.prvconfPref),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: req.body.clienthotelrefno || sett.global.useHotelRefno,
                    },
                }).then((response) => {
                   if (response.status === 200 && response.data && response.data.data.res) {
                       return response.data.data.res
                   } else {
                       return false
                   }
                }).catch(()=> {
                    return false
                })
            }

            return new Promise(async (resolve) => {
                await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.clientPatch, req.body.refgid),
                    method: orestEndpoint.methods.patch,
                    headers: helpers.getHeaders(req, res, req.body.updatetoken, true),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: req.body.clienthotelrefno || sett.global.useHotelRefno,
                    },
                    data: {
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        birthdate: req.body.birthdate,
                        gender: req.body.gender,
                        email: req.body.email,
                        mobiletel: helpers.mobileTelNoFormat(req.body.mobiletel),
                        nationid: req.body.nationid,
                        country: req.body.country,
                        address1: req.body.address1,
                        city: req.body.city,
                        zip: req.body.zip,
                    },
                }).then(async (response) => {
                    if (response.status === 200 && response.data && response.data.success && response.data.count > 0) {
                        const locationId = await getSurveyLocId()
                        const dataPolicyId = await getDataPolicyId()

                        let prvListData = [
                            {
                                accid: req.body.refid,
                                prvconfid: dataPolicyId || null,
                                isok: true,
                                locid: locationId,
                                hotelrefno: req.body.clienthotelrefno || sett.global.useHotelRefno,
                            }
                        ]

                        if(req.body.location !== "survey"){
                           const dataPrefId = await getDataPrefId()
                           prvListData.push({
                               accid: req.body.refid,
                               prvconfid: dataPrefId,
                               isok: true,
                               locid: locationId,
                               hotelrefno: req.body.clienthotelrefno || sett.global.useHotelRefno,
                           })
                        }

                        axios({
                            url: helpers.getUrl(res, orestEndpoint.api.prvtransListIns),
                            method: orestEndpoint.methods.post,
                            headers: helpers.getHeaders(req, res),
                            params: {
                                [`${orestEndpoint.global.hotelrefno}`]: req.body.clienthotelrefno || sett.global.useHotelRefno,
                            },
                            data: prvListData,
                        }).then((prvTransListInsResponse) => {
                            if (prvTransListInsResponse.status === 200 && prvTransListInsResponse.data && prvTransListInsResponse.data.success && prvTransListInsResponse.data.count > 0) {
                                resolve({
                                    success: true
                                })
                            } else {
                                resolve({
                                    success: false
                                })
                            }
                        }).catch(()=> {
                            resolve({
                                success: false
                            })
                        })

                    } else {
                        resolve({
                            success: false,
                        })
                    }
                }).catch(()=> {
                    resolve({
                        success: false,
                        msg: 'client_duplicate_mail',
                    })
                })
            })
        }
    },
    userForgotPassword: async (req, res, sett) => {
        const noClient = req?.body?.noclient || false

        if (!req?.body?.email) {
            return {
                success: false,
                error: 'missing_required',
                error_description: 'Required fields are missing!',
            }
        }

        const clientPass = helpers.generatePassword()

        const getClientEmailExists = (email) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientEmailExists),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: email
                },
            }).then((response) => {
                if (response.status === 200 &&  response?.data?.data?.res) {
                    return response.data.data.id
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getEmployeeEmailExists = (email) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.employeeEmailExists),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: email,
                },
            }).then((response) => {
                if (response.status === 200 &&  response?.data?.data?.res) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const createLoginId = (clientID) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientLoginId),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.id}`]: `${clientID}`,
                    [`${orestEndpoint.params.force}`]: `${orestEndpoint.global.true}`,
                },
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const setWelcomeBonus = (clientID) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.bonustransInsWelcome),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.accid}`]:`${clientID}`,
                    [`${orestEndpoint.params.isweb}`]: `${orestEndpoint.global.true}`,
                },
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const setClientNewPass = (clientEmail, clientPass) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsUserPassword),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: `${clientEmail}`,
                    [`${orestEndpoint.params.pass}`]: `${clientPass}`,
                    [`${orestEndpoint.params.sendmsg}`]: `${orestEndpoint.global.false}`,
                    [`${orestEndpoint.global.hotelrefno}`]: sett.global.HOTELREFNO,
                },
            }).then((response) => {
                if (response.status === 200) {
                    return true
                }else{
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const sendPasswordMail = (clientPass) => {
            let subjectArray = {
                "tr": "Yeni Şifre",
                "de": "Neues Kennwort",
                "ru": "новый пароль",
                "mk": "нова лозинка",
                "sq": "Fjalëkalim i ri",
                "ar": "كلمة السر الجديدة"
            }

            let loginUrl = ""
            if(req.body.surveygid){
                loginUrl = `${res.GENERAL_SETTINGS.BASE_URL}survey/${req.body.surveygid}?email=${req.body.email}&pass=${clientPass}&refurl=`+ encodeURIComponent(`/survey/${req.body.surveygid}?lang=${req.body.langcode || 'en'}`)
            }
            let subject = res.REDIS_WEBCMS_DATA.assets.meta.title + ' - ' + (subjectArray[req.body.langcode] || 'New Password')
            return useMail.send(req, res, {
                    code: orestEndpoint.templates.cldPasswordSendMailCli,
                    sendername: sett.global.hotelSettings.from_name || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: sett.global.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    langcode: req.body.langcode || 'en',
                    subject: subject,
                    receivername: req.body.email,
                    receiveremail: req.body.email,
                },
                {
                    userpass: clientPass,
                    hotelname: res.REDIS_WEBCMS_DATA.assets.meta.title,
                    loginUrl: loginUrl
                }
            )
        }

        const clientEmailExists = await getClientEmailExists(req.body.email)
        if(!clientEmailExists && !noClient){
            return {
                success: false,
                error: 'no_client',
            }
        }

        const employeeEmailExists = await getEmployeeEmailExists(req.body.email)
        if(!employeeEmailExists && !noClient){
            await createLoginId(clientEmailExists)
            await setWelcomeBonus(clientEmailExists)
        }

        const getClientNewPass = await setClientNewPass(req.body.email, clientPass)
        if(!getClientNewPass){
            return {
                success: false,
                error: 'no_update',
            }
        }

        const getSendPasswordMail = await sendPasswordMail(clientPass)
        if(getSendPasswordMail){
            return {
                success: true
            }
        }else{
            return {
                success: false,
                error: 'no_send',
            }
        }
    },
    setHotelSelect: async (req, res) => {

        //check pay at hotel
        await axios({
            url: helpers.getUrl(res, orestEndpoint.api.paytypeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                    [`${orestEndpoint.params.iscash}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                    [`${orestEndpoint.params.isorsactive}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                }),
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            if (response.status === 200 && response.data.data.length > 0) {
                paymentMethods.push({
                    paytype: 'str_payAtHotel',
                    iconname: 'business',
                    paytypeid: response.data.data[0].id,
                    orderno: 1,
                })
            }
        })

        return {
            success: true,
            paytypes: paymentMethods,
            ibans: bankIban,
        }

    },
    getHotelSurvey: async (req, res) => {

        const getSurveyLocId = (hotelrefno, isGapp) => {
            return axios({
                url: helpers.getUrl(res, isGapp ? orestEndpoint.api.surveyLocApp : orestEndpoint.api.surveyLocWeb),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: hotelrefno,
                },
            }).then((response) => {
                if (response.status === 200 && response.data && response.data.data && response.data.data[0].res) {
                    return response.data.data[0].res
                } else {
                    return false
                }
            })
        }

        const getSurveyFromGid = async (generalSettings, token, gid, portalToken, portalRefNo) => {
            let redisData = null
                , lastUpdateTime = null

            //get survey from cache
            redisData = await useRedis.getCacheById(global.survey.redisPrefixSurvey + gid)

            //parse redis data
            if (redisData && redisData.length > 0) {
                redisData = JSON.parse(Object(redisData))
            }

            //get survey last update time
            if (redisData && redisData.survey) {
                lastUpdateTime = await getSurveyLastUpdateTime(generalSettings, token, redisData.survey, portalToken && portalToken, portalRefNo && portalRefNo)
            }

            if (redisData && redisData.survey && redisData.lastupd === lastUpdateTime) {
                return redisData.survey
            } else {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.surveyList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res,portalToken ? portalToken : res.OREST_CACHE_TOKEN),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.gid}`]: `${orestEndpoint.operator.matching}${gid}`,
                        }),
                        [`${orestEndpoint.global.limit}`]: 1,
                        [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true
                     },
                }).then(async (r) => {
                    if (r.status === 200 && r.data && r.data.count > 0) {
                        const data = r.data.data[0]
                        await useRedis.set(global.survey.redisPrefixSurvey + gid, JSON.stringify({
                            survey: data,
                            lastupd: lastUpdateTime,
                        }))
                        return data
                    } else {
                        return null
                    }
                }).catch(() => {
                    return null
                })
            }
        }

        const getSurveyTransFromGid = (generalSettings, token, transGid, checkParams, portalToken, portalRefNo) => {
            if (transGid) {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.surveyTransList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res, portalToken ? portalToken : null),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.gid}`]: `${transGid}`,
                        }),
                        [`${orestEndpoint.global.limit}`]: 1,
                        [`${orestEndpoint.global.hotelrefno}`]: portalRefNo ? portalRefNo : checkParams.hotelrefno,
                    },
                }).then((r1) => {
                    if (r1.status === 200) {
                        if (r1.data && r1.data.count > 0) {
                            return r1.data.data[0]
                        } else {
                            return null
                        }
                    } else {
                        return null
                    }
                }).catch(() => {
                    return null
                })
            } else {
                return null
            }
        }

        const getSurveyTrans = (generalSettings, token, survey, checkParams, portalToken, portalRefNo, nonWeb,  client, employee) => {
            if (survey && (client || employee)) {

                let
                    useQuery = {}
                    , useDateCheck = false
                    , useUser = client || employee

                useQuery[orestEndpoint.params.clientid] = useUser.id
                useQuery[orestEndpoint.params.surveyid] = survey.id

                if(checkParams.locId && !nonWeb){
                    useQuery[orestEndpoint.params.locationid] = checkParams.locId
                }

                if(checkParams.reservNo){
                    useQuery[orestEndpoint.params.reservno] = checkParams.reservNo
                }

                if(survey.startdate && survey.enddate){
                    useDateCheck = `${orestEndpoint.params.transdate}>:${survey.startdate},${orestEndpoint.params.transdate}<:${survey.enddate}`
                }

                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.surveyTransList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res, portalToken ? portalToken : token),
                    params: {
                        [`${orestEndpoint.global.query}`]: `${orestHelper.useQuery(useQuery)}${ useDateCheck ? ',' + useDateCheck : ''}`,
                        [`${orestEndpoint.global.limit}`]: 1,
                        [`${orestEndpoint.global.hotelrefno}`]: portalRefNo ? portalRefNo : checkParams.hotelrefno,
                        [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true
                    },
                }).then((surveyTransListResponse) => {
                    if (surveyTransListResponse.status === 200) {
                        if (surveyTransListResponse.data && surveyTransListResponse.data.count > 0) {
                            return surveyTransListResponse.data.data[0]
                        } else {
                            return []
                        }
                    } else {
                        return null
                    }
                }).catch(()=> {
                    return null
                })
            } else {
                return null
            }
        }

        const getClientFromGid = (generalSettings, token, gid) => {
            if (gid) {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.clientGetGid),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res, res.OREST_CACHE_TOKEN, false),
                    params: {
                        [`${orestEndpoint.params.gid}`]: gid,
                        [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true
                    },
                }).then((clientGetGidResponse) => {
                    if (clientGetGidResponse?.data?.data) {
                        return clientGetGidResponse?.data?.data || null
                    } else {
                        return null
                    }
                }).catch(() => {
                    return null
                })
            } else {
                return null
            }
        }

        const getEmployeeFromGid = (generalSettings, token, gid) => {
            if (gid) {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.employeeGet),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res, res.OREST_CACHE_TOKEN, false),
                    params: {
                        [`${orestEndpoint.params.gid}`]: gid,
                        [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true
                    },
                }).then((employeeGetGidResponse) => {
                    if (employeeGetGidResponse?.data?.data) {
                        return employeeGetGidResponse?.data?.data || null
                    } else {
                        return null
                    }
                }).catch(() => {
                    return null
                })
            } else {
                return null
            }
        }

        const getSurveyTranslateMerge = async (surveyTree, translateList, langcode) => {
            let fromLang = String(res.GENERAL_SETTINGS.hotelLocalLangGCode.toLowerCase()),
                toLang = String(langcode.toLowerCase())
            if (fromLang === toLang) {
                return surveyTree
            }

            //Todo: Method POST olarak değiştirilecek, QM anketi sonrasında.
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsTranslateList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.fromgcode}`]: fromLang,
                    [`${orestEndpoint.params.togcode}`]: toLang,
                },
                data: translateList,
            }).then((translateResponse) => {
                if (translateResponse.status === 200 && translateResponse.data && translateResponse.data.count > 0) {
                    Object.keys(translateResponse.data.data).forEach((key) => {
                        let treeIndex = surveyTree.findIndex(item => Number(item.langwordindex) === Number(key))
                        if (treeIndex !== -1) {
                            surveyTree[treeIndex].langwordtxt = translateResponse.data.data[key].res
                        }
                    })
                    return surveyTree
                }
            }).catch(() => {
                return null
            })
        }

        const getSurveyTree = (generalSettings, token, surveyId, langcode, portalToken) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.surveyTreeViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res, portalToken ? portalToken : res.OREST_CACHE_TOKEN),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.surveyid}`]: `${orestEndpoint.operator.matching}${surveyId}`,
                        [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.global.true}`,
                    }),
                    [`${orestEndpoint.global.sort}`]: orestEndpoint.params.itemindex,
                    [`${orestEndpoint.global.limit}`]: 1500,
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true,
                 },
            }).then(async (surveyTreeResponse) => {
                if (surveyTreeResponse.status === 200 && surveyTreeResponse.data && surveyTreeResponse.data.count > 0) {
                    let translateWords = []
                    let surveyTreeIndex = 0
                    Object.keys(surveyTreeResponse.data.data).forEach(function(key) {
                        if (surveyTreeResponse.data.data[key].langwordcode) {
                            translateWords.push(surveyTreeResponse.data.data[key].langwordcode)
                            surveyTreeResponse.data.data[key].langwordindex = surveyTreeIndex
                            surveyTreeIndex++
                        }
                    })

                    if (translateWords.length > 0) {
                        return await getSurveyTranslateMerge(surveyTreeResponse.data.data, translateWords, langcode)
                    } else {
                        return surveyTreeResponse.data.data
                    }

                } else {
                    return null
                }
            }).catch(() => {
                return null
            })
        }

        const getStdOptions = (generalSettings, token, survey, langcode, portalToken) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.surveyTreeStdOptions),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res, portalToken ? portalToken : token),
                params: {
                    [`${orestEndpoint.params.surveyid}`]: survey.id,
                    [`${orestEndpoint.params.incstd}`]: orestEndpoint.global.true,
                    [`${orestEndpoint.params.incnonstd}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.sort}`]: orestEndpoint.params.itemindex,
                },
            }).then(async (surveyStdOptionsResponse) => {
                if (surveyStdOptionsResponse.status === 200 && surveyStdOptionsResponse?.data?.data) {
                    let translateWords = []
                    let surveyTreeIndex = 0
                    Object.keys(surveyStdOptionsResponse.data.data).forEach(function(key) {
                        if (surveyStdOptionsResponse.data.data[key].langwordcode) {
                            translateWords.push(surveyStdOptionsResponse.data.data[key].langwordcode)
                            surveyStdOptionsResponse.data.data[key].langwordindex = surveyTreeIndex
                            surveyTreeIndex++
                        }
                    })

                    if (translateWords.length > 0) {
                        return await getSurveyTranslateMerge(surveyStdOptionsResponse.data.data, translateWords, langcode)
                    } else {
                        return surveyStdOptionsResponse.data.data
                    }

                } else {
                    return null
                }
            }).catch(() => {
                return null
            })
        }

        const getNonStdOptions = (generalSettings, token, survey, langcode) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.surveyNonStdOptions),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.surveyid}`]: survey.id,
                    [`${orestEndpoint.global.sort}`]: orestEndpoint.params.itemindex,
                    [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true,
                },
            }).then(async (surveyNonStdOptionsResponse) => {
                if (surveyNonStdOptionsResponse.status === 200 && surveyNonStdOptionsResponse?.data?.data) {

                    let translateWords = []
                    let surveyTreeIndex = 0
                    Object.keys(surveyNonStdOptionsResponse.data.data).forEach(function(key) {
                        if (surveyNonStdOptionsResponse.data.data[key].langwordcode) {
                            translateWords.push(surveyNonStdOptionsResponse.data.data[key].langwordcode)
                            surveyNonStdOptionsResponse.data.data[key].langwordindex = surveyTreeIndex
                            surveyTreeIndex++
                        }
                    })

                    if (translateWords.length > 0) {
                        return await getSurveyTranslateMerge(surveyNonStdOptionsResponse.data.data, translateWords, langcode)
                    } else {
                        return surveyNonStdOptionsResponse.data.data
                    }
                } else {
                    return null
                }
            }).catch(() => {
                return null
            })
        }

        const getSurveyLastUpdateTime = (generalSettings, token, survey, portalToken, portalRefNo) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.surveyLastupd),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res, portalToken ? portalToken : token),
                params: {
                    [`${orestEndpoint.params.id}`]: survey.id,
                    [`${orestEndpoint.global.hotelrefno}`]: portalRefNo ? portalRefNo : helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((r) => {
                if (r.status === 200 && r.data.data && r.data.count > 0 && r.data.data.res) {
                    return r.data.data.res
                } else {
                    return null
                }
            }).catch(() => {
                return null
            })
        }

        const getSurveyThankYouFile = ({mid, langCode}) => {
            let useParams = new URLSearchParams()
            useParams.append(orestEndpoint.params.code,orestEndpoint.templates.pages.surveyThankYou)
            useParams.append(orestEndpoint.params.masterid, mid)
            useParams.append(orestEndpoint.params.langcode, langCode)
            useParams.append(orestEndpoint.params.contentype, orestEndpoint.contentType.html)
            useParams.append(orestEndpoint.global.hotelrefno, helpers.getSettings(req, res, global.hotelrefno))

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsFileFind),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: useParams,
            }).then((thankYouFileResponse) => {
                if (thankYouFileResponse.status === 200 && thankYouFileResponse.data?.data?.filedata) {
                    return thankYouFileResponse.data?.data?.filedata
                } else {
                    return null
                }
            }).catch(() => {
                return null
            })
        }

        const getRequiredSurveyTreeFields = (object) => {
            return {
                typ: object.typ,
                description: object.description,
                id: object.id,
                parentid: object.parentid,
                itemindex: object.itemindex,
                hasnote: object.hasnote,
                hasfile: object.hasfile,
                isreq: object.isreq,
                itemlabelvisible: object.itemlabelvisible,
                note: object.note,
                customvalue: object.customvalue,
                refqsid: object.refqsid,
                imageurl: object.imageurl,
                langwordcode: object.langwordcode,
                langwordtxt: object.langwordtxt || '',
                answeralign: object.answeralign,
                children: null,
            }
        }

        const getRequiredSurveyAnswerFields = (object) => {
            return {
                id: object.id,
                parentid: object.questionid,
                questionid: object.questionid,
                answerid: object.answerid,
                typ: object.typ,
                answernote: object.answernote,
                align: object.align,
                answeralign: object.answeralign,
                valuetext: object.valuetext,
                valuelongtext: object.valuelongtext,
                valueint: object.valueint,
                valuefloat: object.valuefloat,
                valuedate: object.valuedate,
                valuetime: object.valuetime,
            }
        }

        const makeTree = (arr) => {
            let arrMap = new Map(arr.map((item) => [item.id, item]))
            let tree = []

            for (let i = 0; i < arr.length; i++) {
                let item = arr[i]

                if (item.parentid !== null) {
                    let parentItem = arrMap.get(item.parentid)

                    if (parentItem) {
                        let { children } = parentItem

                        if (children) {
                            parentItem.children.push(item)
                        } else {
                            parentItem.children = [item]
                        }
                    }
                } else {
                    tree.push(item)
                }
            }

            return tree
        }

        const renderQuestions = async (generalSettings, token, survey, surveyTree, langcode, portalToken) => {
            let stdOptions = await getStdOptions(generalSettings, token, survey, langcode, portalToken)
                , nonStdOptions = await getNonStdOptions(generalSettings, token, survey, langcode, portalToken)
                , surveyTreeArray = surveyTree
                , data1 = []
                , data2 = []
                , allSurveyTree = []
                , data4 = []
                , onlyQuestions = []

            if (surveyTreeArray && surveyTreeArray.length > 0) {
                //add STD and NONSTD Options
                surveyTreeArray.map((treeObject) => {
                    data1.push(treeObject)

                    if (treeObject.typ === 'QUESTION' || treeObject.typ === 'SUBQUESTION') {
                        let gotAnyOption = false
                        surveyTreeArray.map((x) => {
                            if (treeObject.id === x.parentid) {
                                gotAnyOption = true
                            }
                        })

                        if (!gotAnyOption) {
                            if (treeObject.refqsid) {
                                nonStdOptions &&
                                nonStdOptions.length > 0 &&
                                nonStdOptions.map((dataNonStdOption) => {
                                    if (dataNonStdOption.parentid === treeObject.refqsid) {
                                        data1.push({ ...dataNonStdOption, parentid: treeObject.id })
                                    }
                                })
                            } else {
                                stdOptions &&
                                stdOptions.length > 0 &&
                                stdOptions.map((dataStdOption) => {
                                    data1.push({ ...dataStdOption, parentid: treeObject.id })
                                })
                            }
                        }
                    }
                })

                //simplify objects
                data1.map((surveyTreeObject) => {
                    data2.push(getRequiredSurveyTreeFields(surveyTreeObject))
                    data4.push(getRequiredSurveyTreeFields(surveyTreeObject))
                })

                if(data4.length > 0) {
                    for(let i = 0; i < data4.length; i ++) {
                        if(data4[i]?.typ === 'QUESTION') {
                            data4[i].parentid = null
                        }
                    }
                }
                //make tree
                allSurveyTree = makeTree(data2)
                onlyQuestions = makeTree(data4.filter(e => e.typ !== 'SURVEY' && e.typ !== 'GROUP'))
            }

            return {allSurveyTree, onlyQuestions}
        }

        const getOldAnswers = (generalSettings, token, transId, portalToken) => {
            if (transId) {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.surveyAnswerList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res, portalToken ? portalToken : token),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.transid}`]: `${orestEndpoint.operator.matching}${transId}`,
                        }),
                        [`${orestEndpoint.global.limit}`]: 1000,
                        [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true,
                    },
                }).then((surveyAnswerListResponse) => {
                    if (surveyAnswerListResponse.status === 200 && surveyAnswerListResponse.data.count > 0) {
                        let oldAnswerArray = []
                        const resData = surveyAnswerListResponse.data.data
                        resData.map((answer) => {
                            oldAnswerArray.push(getRequiredSurveyAnswerFields(answer))
                        })
                        return oldAnswerArray
                    } else if (surveyAnswerListResponse.data.count === 0) {
                        return []
                    } else {
                        return null
                    }
                }).catch(() => {
                    return null
                })
            } else {
                return null
            }
        }

        const renderSurvey = async (generalSettings, token, survey, langcode, portalToken, portalRefNo) => {
            //get surveytree from cache
            let
                lastUpdateTime = await getSurveyLastUpdateTime(generalSettings, token, survey, portalToken, portalRefNo, Number(req.query.surveyrefno))
                , redisData = await useRedis.getCacheById(global.survey.redisPrefixSurveyTree + survey.gid + langcode)

            //parse redis data
            if (redisData && redisData.length > 0) {
                redisData = JSON.parse(Object(redisData))
            }

            if (redisData && redisData.allSurveyTree && redisData.lastupd === lastUpdateTime) {
                return redisData
            } else {
                let surveyTree = await getSurveyTree(generalSettings, res.OREST_CACHE_TOKEN, survey.id, langcode, portalToken)
                if (surveyTree) {
                    const renderedQuestions = await renderQuestions(generalSettings, res.OREST_CACHE_TOKEN, survey, surveyTree, langcode, portalToken)
                    await useRedis.set(global.survey.redisPrefixSurveyTree + survey.gid + langcode, JSON.stringify({
                        allSurveyTree: renderedQuestions?.allSurveyTree,
                        onlyQuestions: renderedQuestions?.onlyQuestions,
                        lastupd: lastUpdateTime,
                    }))
                    return renderedQuestions
                } else {
                    return null
                }
            }
        }

        const generalSettings = res.GENERAL_SETTINGS
        let token = res.OREST_CACHE_TOKEN
            , portalRefNo = (req?.query?.portalrefno && req?.query?.portalrefno !== 'true') ? req.query.portalrefno : false
            , portalToken = (req?.query?.isportal === 'true') ? res.OREST_CACHE_TOKEN : false

        if (req.query.isportal && req.query.isportal === 'true' && req.query.portalrefno && req.query.portalrefno !== 'true') {
            let hotel = await res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.portalrefno))
            if (hotel) {
                portalToken = await hotel.gid.toUpperCase() || portalToken
            }
        }

        if (req.query.ischain && req.query.ischain === 'true' && Number(generalSettings.HOTELREFNO) !== Number(req.query.chainid)) {
            let hotel = await res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            token = await hotel.gid.toUpperCase() || token
            let gid = await hotel.gid.toUpperCase() || false
                , accid = await hotel.accid || false

            if (gid) {
                req.query.hoteltoken = gid
            }

            if (accid) {
                req.query.hotelrefno = accid
            }
        } else {
            req.query.hoteltoken = token
            req.query.hotelrefno = generalSettings.HOTELREFNO
        }

        const surveyGid = req.body.survey
            , clientGid = req.body.client
            , employeeGid = req.body.employee
            , transGid = req.body.trans
            , langcode = req.body.langcode
            , nonWeb = req.body.nonWeb
            , isGapp = req.query.isgapp === 'true'

        let survey = null
            , client = null
            , employee = null
            , surveyTrans = null
            , renderedSurvey = null
            , oldAnswers = []
            , checkParams = {
            surveyId: null,
            locId: null,
            clientId: req.body.clientid,
            reservNo: req.body.reservno !== 'false' ? req.body.reservno : false,
            hotelrefno: false,
        }

        if ((surveyGid && (clientGid || employeeGid)) || transGid) {
            survey = await getSurveyFromGid(generalSettings, token, surveyGid, portalToken, portalRefNo)

            checkParams.surveyId = survey.id
            checkParams.locId = await getSurveyLocId(checkParams?.hotelrefno || survey.hotelrefno, isGapp)

            if (survey.startdate) {
                const today = moment().locale(defaultLocale)
                    , startdate = moment(survey.startdate)
                    , diffDate = today.diff(startdate, 'days')

                if (0 > diffDate) {
                    return {
                        error: 'survey_not_yet_in_use',
                    }
                }
            }

            if (survey.enddate) {
                const today = moment().locale(defaultLocale)
                const enddate = moment(survey.enddate)
                let diffDate = enddate.diff(today, 'days')

                if (0 > diffDate) {
                    return {
                        error: 'survey_has_been_expired',
                    }
                }
            }

            if (survey && survey.id) {
                checkParams.hotelrefno = req.query.hotelrefno
                if (transGid) {
                    surveyTrans = await getSurveyTransFromGid(generalSettings, token, transGid, checkParams, portalToken, portalRefNo)
                } else {
                    if (clientGid) {
                        client = await getClientFromGid(generalSettings, token, clientGid)
                    } else {
                        employee = await getEmployeeFromGid(generalSettings, token, employeeGid)
                    }

                    if (client || employee) {
                        surveyTrans = await getSurveyTrans(generalSettings, token, survey, checkParams, portalToken, portalRefNo, nonWeb, client, employee)
                    } else {
                        return {
                            error: 'search_survey_client',
                            error_description: 'No matching client!',
                        }
                    }
                }

                if (surveyTrans && surveyTrans?.id){
                    oldAnswers = await getOldAnswers(generalSettings, token, surveyTrans && surveyTrans.id, portalToken)
                }else{
                    surveyTrans = null
                }

                renderedSurvey = await renderSurvey(generalSettings, token, survey, langcode, portalToken, portalRefNo)

                const surveyThankYouFile = await getSurveyThankYouFile({ mid: survey.mid, langCode: langcode })
                if (renderedSurvey?.allSurveyTree || renderedSurvey?.onlyQuestions) {
                    return {
                        answers: oldAnswers,
                        survey: renderedSurvey?.allSurveyTree,
                        onlyQuestions: renderedSurvey?.onlyQuestions,
                        trans: surveyTrans && surveyTrans?.gid || null,
                        isvalid: surveyTrans && surveyTrans?.isvalid || false,
                        disptype: survey?.disptype || 0,
                        bgcolor: survey?.bgcolor || false,
                        lang: langcode,
                        thankYouFile: surveyThankYouFile,
                    }
                } else if (oldAnswers === null) {
                    return {
                        error: 'search_survey_old_answers',
                        error_description: 'There was a problem getting old answers!',
                    }
                } else {
                    return {
                        error: 'search_survey_tree',
                        error_description: 'No survey question!',
                    }
                }
            } else {
                return {
                    error: 'no_survey',
                    error_description: 'No survey!',
                }
            }
        } else {
            return {
                error: 'missing_required',
                error_description: 'Required fields are missing!',
            }
        }
    },
    saveHotelSurvey:async (req, res, sett) => {

        const getClientFromGid = (token, gid) => {
            if (gid) {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.clientGetGid),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res, res.OREST_CACHE_TOKEN, false),
                    params: {
                        [`${orestEndpoint.params.gid}`]: gid,
                        [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true
                    },
                }).then((clientGetGidResponse) => {
                    if (clientGetGidResponse?.data?.data) {
                        return clientGetGidResponse?.data?.data || null
                    } else {
                        return null
                    }
                }).catch(() => {
                    return null
                })
            } else {
                return null
            }
        }

        const getEmployeeFromGid = (token, gid) => {
            if (gid) {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.employeeGet),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res, res.OREST_CACHE_TOKEN, false),
                    params: {
                        [`${orestEndpoint.params.gid}`]: gid,
                        [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true
                    },
                }).then((employeeGetGidResponse) => {
                    if (employeeGetGidResponse?.data?.data) {
                        return employeeGetGidResponse?.data?.data || null
                    } else {
                        return null
                    }
                }).catch(() => {
                    return null
                })
            } else {
                return null
            }
        }

        const getSurveyLocId = (hotelrefno, isGapp) => {
            return axios({
                url: helpers.getUrl(res, isGapp ? orestEndpoint.api.surveyLocApp : orestEndpoint.api.surveyLocWeb),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: hotelrefno,
                },
            }).then((response) => {
                if (response.status === 200 && response.data && response.data.data && response.data.data[0].res) {
                    return response.data.data[0].res
                } else {
                    return false
                }
            })
        }

        const getSurvey = (token, surveyGid, portalToken) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.surveyGet),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res, portalToken ? portalToken : res.OREST_CACHE_TOKEN, false),
                params: {
                    [`${orestEndpoint.params.gid}`]: surveyGid.toLowerCase(),
                    [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true,
                },
            }).then((surveyGetResponse) => {
                if (surveyGetResponse.status === 200 && surveyGetResponse.data?.data) {
                    return surveyGetResponse.data.data
                } else {
                    return null
                }
            }).catch(() => {
                return null
            })
        }

        const getSurveyTrans = (token, transGid, portalToken) => {
            if (transGid) {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.surveyTransViewList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res, portalToken ? portalToken : false),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.gid}`]: transGid,
                        }),
                        [`${orestEndpoint.global.limit}`]: 1,
                        [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                        [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true,
                    },
                }).then((r) => {
                    if (r.status === 200 && r.data.count > 0) {
                        return r.data.data[0]
                    } else {
                        return null
                    }
                }).catch(() => {
                    return null
                })
            } else {
                return null
            }
        }

        const createSurveyTrans = (surveyid, reservno, userid, firstname, lastname, email, locationid, hotelrefno) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.surveyTransIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res, portalToken ? portalToken : false),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: {
                    clientid: userid,
                    reservno: reservno || 0,
                    surveyid: surveyid,
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    locationid: locationid || null,
                    isactive: true,
                    hotelrefno: hotelrefno,
                },
            }).then((surveyTransInsResponse) => {
                if (surveyTransInsResponse.status === 200) {
                    return surveyTransInsResponse.data.data
                } else {
                    return null
                }
            }).catch(() => {
                return null
            })
        }

        const sendConfirmationEmail = async (surveyGid, surveyTrans) => {
            const langcode = req.query.langcode || 'en'
            let subjectArray = {
                'en': 'Approve Survey',
                'tr': 'Anketi Onaylayın',
                'de': 'Umfrage Genehmigen',
                'ru': 'Утвердить опрос',
                'mk': 'Одобрување на анкетата',
                'sq': 'Miratimi i anketës',
                'ar': 'الموافقة على الاستبيان',
            }

            let subject = surveyTrans.surveydesc + ' - ' + (subjectArray[req.body.langcode] || 'Approve Survey')

            if (surveyTrans.email) {
                const sendSurveyMail = await useMail.send(req, res, {
                        code: orestEndpoint.templates.cldSurveyConfMailCli,
                        sendername: sett.global.hotelSettings.from_name || sett.webSiteData.assets.meta.title,
                        senderemail: sett.global.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                        langcode: langcode,
                        subject: subject,
                        receivername: `${surveyTrans.firstname} ${surveyTrans.lastname}`,
                        receiveremail: surveyTrans.email,
                    },
                    {
                        confirmationLink: `${sett.global.BASE_URL}survey/${surveyGid}/confirm?refgid=${surveyTrans.gid}&refmid=${surveyTrans.mid}&hotelrefno=${surveyTrans.hotelrefno}&lang=${req.body.langcode || 'en'}`,
                        continueLink: `${sett.global.BASE_URL}survey/${surveyGid}?refurl=` + encodeURIComponent(`/survey/${surveyGid}?refid=${surveyTrans.clientid}&refgid=${surveyTrans.gid}&hotelrefno=${surveyTrans.hotelrefno}&lang=${req.body.langcode || 'en'}`),
                        hotelname: sett.global.hotelSettings.from_name || sett.webSiteData.assets.meta.title || surveyTrans.hotelname,
                        confirmationNumber: surveyTrans.id,
                    },
                )

                return sendSurveyMail.success
            }
        }

        const updateSurveyTrans = (token, surveyTrans, sendClientMail, reservNo, surveyLocId, portalRefNo, portalToken, onlyAnswer) => {
            const isOnlyAnswer = onlyAnswer && onlyAnswer === 'true'
            const today = moment(Date.now()).locale(defaultLocale).format(orestEndpoint.dates.orestFullDateFormat)
            let patchData = {}
            patchData.transdate = today
            patchData.isactive = true
            patchData.gid = surveyTrans.gid
            patchData.locationid = surveyLocId

            if (reservNo) {
                patchData.reservno = reservNo
            }

            if (!sendClientMail && !isOnlyAnswer) {
                patchData.isvalid = true
            }

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.surveyTransListPatch),
                method: orestEndpoint.methods.patch,
                headers: helpers.getHeaders(req, res, portalToken ? portalToken : token),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: portalRefNo ? portalRefNo : helpers.getSettings(req, res, global.hotelrefno),
                },
                data: [patchData],
            }).then((res) => {
                if (res.status === 200) {
                    return true
                }
            }).catch(() => {
                return false
            })
        }

        const generalSettings = res.GENERAL_SETTINGS
        let token = res.OREST_CACHE_TOKEN
            , portalRefNo = (req?.query?.portalrefno && req?.query?.portalrefno !== 'true') ? req.query.portalrefno : false
            , portalToken = (req?.query?.isportal === 'true') ? res.OREST_CACHE_TOKEN : false

        if (req.query.isportal && req.query.isportal === 'true' && req.query.portalrefno && req.query.portalrefno !== 'true') {
            portalRefNo = req.query.portalrefno
            let hotel = await res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.portalrefno))
            if (hotel) {
                portalToken = await hotel.gid.toUpperCase() || portalToken
            }
        }

        if (req.query.ischain && req.query.ischain === 'true' && Number(generalSettings.HOTELREFNO) !== Number(req.query.chainid)) {
            let hotel = await res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
            token = await hotel.gid.toUpperCase() || token
            let gid = await hotel.gid.toUpperCase() || false
                , accid = await hotel.accid || false

            if (gid) {
                req.query.hoteltoken = gid
            }

            if (accid) {
                req.query.hotelrefno = accid
            }
        } else {
            req.query.hoteltoken = token
            req.query.hotelrefno = generalSettings.HOTELREFNO
        }

        let surveyGid = req.query.survey
            , transGid = req.query.trans
            , surveyAnswers = req.body
            , reservNo = req.query.reservno !== 'false' ? req.query.reservno : false
            , isGapp = req.query.isgapp === 'true'
            , client = req?.query?.client || false
            , employee = req?.query?.employee || false

        let oldAnswers = []
            , newAnswers = []

        let surveyTrans = await getSurveyTrans(token, transGid, portalToken)
        if (surveyTrans && surveyTrans.isvalid) {
            return {
                success: false,
                error: 'confirmed_survey_trans',
                error_description: 'Survey already confirmed!',
            }
        }

        const survey = await getSurvey(token, surveyGid, portalToken, Number(req.query.surveyrefno))
            , sendClientMail = survey.sendclientmail || false
            , surveyLocId = await getSurveyLocId(survey.hotelrefno || req.query.surveyrefno, isGapp)

        const surveyUser = client ? await getClientFromGid(token, client) : await getEmployeeFromGid(token, employee)
        if(!transGid){
            surveyTrans = await createSurveyTrans(survey.id, reservNo, surveyUser.id, surveyUser.firstname, surveyUser.lastname, surveyUser.email, surveyLocId, survey.hotelrefno)
            transGid = surveyTrans.gid
        }

        if (surveyGid && transGid && surveyTrans && Array.isArray(surveyAnswers) && surveyAnswers.length > 0) {
            let answerIds = []
                , surveyAnswersFinalData = []
            //get answerId's to delete old answers
            surveyAnswers.map((answer) => {
                answerIds.push(answer.questionid)
                surveyAnswersFinalData.push({
                    ...answer,
                    transid: surveyTrans.id,
                    hotelrefno: surveyTrans.hotelrefno,
                })
            })
            if (answerIds.length > 0) {
                //remove duplicate ids
                answerIds = Array.from(new Set(answerIds))

                //get old answers to delete later
                await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.surveyAnswerList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res, portalToken ? portalToken : token),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.transid}`]: `${orestEndpoint.operator.matching}${surveyTrans.id}`,
                        }),
                        [`${orestEndpoint.global.field}`]: orestEndpoint.params.questionid,
                        [`${orestEndpoint.global.text}`]: answerIds.toString(),
                        [`${orestEndpoint.global.limit}`]: 1000,
                        [`${orestEndpoint.global.hotelrefno}`]: portalRefNo ? portalRefNo : surveyTrans.hotelrefno,
                    },
                }).then(async (res) => {
                    if (res.status === 200 && res.data.data.length > 0) {
                        const resData = res.data.data
                        resData.map((oldAnswer) => {
                            oldAnswers.push({ gid: oldAnswer.gid })
                        })
                    }
                }).catch(() => {
                    return false
                })
            }

            //delete old answers
            if (oldAnswers.length > 0) {
                await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.surveyAnswerListDel),
                    method: orestEndpoint.methods.delete,
                    headers: helpers.getHeaders(req, res, portalToken ? portalToken : token),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: portalRefNo ? portalRefNo : surveyTrans.hotelrefno,
                    },
                    data: oldAnswers,
                }).then(() => {
                    return true
                }).catch(() => {
                    return false
                })
            }

            //insert new answers
            const isNewAnswersInserted = await axios({
                url: helpers.getUrl(res, orestEndpoint.api.surveyAnswerListIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res, portalToken ? portalToken : token),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: portalRefNo ? portalRefNo : surveyTrans.hotelrefno,
                },
                data: surveyAnswersFinalData,
            }).then((surveyAnswerListInsResponse) => {
                if (surveyAnswerListInsResponse.status === 200 && surveyAnswerListInsResponse?.data?.success) {
                    if (surveyAnswerListInsResponse.data.data && surveyAnswerListInsResponse.data.data.length > 0) {
                        newAnswers = surveyAnswerListInsResponse.data.data
                        //update surveytrans transdate as today
                        updateSurveyTrans(token, surveyTrans, sendClientMail, reservNo, surveyLocId, portalRefNo, portalToken, req.query?.onlyAnswer)
                    }
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })

            //send confirmation email
            if (sendClientMail && surveyTrans) {
                await sendConfirmationEmail(surveyGid, surveyTrans)
            }

            if (isNewAnswersInserted) {
                return {
                    success: true,
                    answers: newAnswers,
                    email: surveyTrans.email,
                    sendmail: sendClientMail,
                    confirmationNumber: surveyTrans.id,
                }
            } else {
                return {
                    success: false,
                    sendmail: false,
                    error: 'survey_save_fail',
                    error_description: 'Survey save failed!',
                }
            }
        } else if (!surveyGid) {
            return {
                success: false,
                sendmail: false,
                error: 'missing_survey_gid',
                error_description: 'Survey gid param missing!',
            }
        } else {
            return {
                success: false,
                sendmail: false,
                error: 'no_survey_answer',
                error_description: 'There is no survey answer!',
            }
        }

    },
    confirmHotelSurvey: async (req, res) => {

        function getSurveyTrans(generalSettings, token, transGid, transMid) {
            if (transGid && transMid) {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.surveyTransViewList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res, token),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.gid}`]: `${orestEndpoint.operator.matching}${transGid}`,
                            [`${orestEndpoint.params.mid}`]: `${orestEndpoint.operator.matching}${transMid}`,
                        }),
                        [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                        [`${orestEndpoint.global.limit}`]: 1
                    },
                }).then((r) => {
                    if (r.status === 200 && r.data.count > 0) {
                        return r.data.data[0]
                    } else {
                        return null
                    }
                })
            } else {
                return null
            }
        }

        function setValidSurveyTrans(generalSettings, token, transGid) {
            if (transGid) {

                let patchData = {}
                patchData.isvalid = true
                patchData.gid = transGid

                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.surveyTransListPatch),
                    method: orestEndpoint.methods.patch,
                    headers: helpers.getHeaders(req, res, token),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                    data: [patchData],
                }).then((r) => {
                    if (r.status === 200 && r.data.count > 0) {
                        return true
                    } else {
                        return false
                    }
                })
            } else {
                return false
            }
        }

        return await new Promise(async (resv) => {

            const generalSettings = res.GENERAL_SETTINGS
            let token = res.OREST_CACHE_TOKEN
            let portalRefNo = (req?.query?.portalrefno && req?.query?.portalrefno !== 'true') ? req.query.portalrefno : false
            let portalToken = (req?.query?.isportal === 'true') ? res.OREST_CACHE_TOKEN : false

            if(req.query.isportal && req.query.isportal === 'true' && req.query.portalrefno) {
                let hotel = await res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.portalrefno))
                if(hotel) {
                    let gid = await hotel.gid.toUpperCase()

                    if(gid){
                        portalToken = await hotel.gid.toUpperCase()
                    }
                }
            }

            if (req.query.ischain && req.query.ischain === 'true' && Number(generalSettings.HOTELREFNO) !== Number(req.query.chainid)) {
                let hotel = await res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(req.query.chainid))
                token = await hotel.gid.toUpperCase() || token
                let gid = await hotel.gid.toUpperCase() || false
                let accid = await hotel.accid || false

                if (gid) {
                    req.query.hoteltoken = gid

                }

                if (accid) {
                    req.query.hotelrefno = accid
                }
            } else {
                req.query.hoteltoken = token
                req.query.hotelrefno = generalSettings.HOTELREFNO
            }

            const surveyGid = req.body.survey
            const transGid = req.body.trans
            const transMid = req.body.mid

            let surveyTrans = null
            let surveyTransValidated = false

            if (surveyGid && transGid && transMid) {
                surveyTrans = await getSurveyTrans(generalSettings, token, transGid, transMid)

                if (surveyTrans && !surveyTrans.isvalid) {
                    surveyTransValidated = await setValidSurveyTrans(generalSettings, token, transGid)
                } else if (!surveyTrans) {
                    return resv({
                        success: false,
                        error: 'no_survey_trans',
                        error_description: 'No matching survey trans!',
                    })
                } else {
                    return resv({
                        success: false,
                        error: 'survey_already_confirmed',
                        error_description: 'Survey already confirmed!',
                    })
                }

                if (surveyTransValidated) {
                    return resv({ success: true, confirmationNumber: surveyTrans.id })
                } else {
                    return resv({
                        success: false,
                        error: 'survey_confirm_fail',
                        error_description: 'Survey not confirmed!',
                    })
                }
            } else if (!surveyGid) {
                return resv({
                    success: false,
                    error: 'missing_survey_gid',
                    error_description: 'Survey gid param missing!',
                })
            } else if (!transGid) {
                return resv({
                    success: false,
                    error: 'missing_survey_trans',
                    error_description: 'Survey trans param missing!',
                })
            } else if (!transMid) {
                return resv({
                    success: false,
                    error: 'missing_survey_trans',
                    error_description: 'Survey trans mid param missing!',
                })
            } else {
                return resv({
                    success: false,
                    error: 'no_survey_answer',
                    error_description: 'There is no survey answer!',
                })
            }
        })
    },
    hotelCacheGet: async (req, res) => {
        return await new Promise(async (resv) => {
            if (req.query.cachekey) {
                let redisData
                redisData = await useRedis.getCacheById(req.query.cachekey)
                if (redisData) {
                    resv({
                        success: true,
                        data: JSON.parse(redisData),
                    })
                } else {
                    resv({
                        success: false,
                    })
                }
            } else {
                resv({
                    success: false,
                })
            }

        })
    },
    hotelCacheGetAll: async (req, res) => {
        return await new Promise(async (resv) => {

            if (req.body.cachekeys.length > 0) {
                let redisData, parsedRedisData = []
                redisData = await useRedis.getAllCacheById(req.body.cachekeys)
                if (redisData) {
                    redisData.map((data) => {
                        parsedRedisData.push({
                            data: JSON.parse(data.data),
                            cachekey: data.cachekey,
                        })
                    })

                    resv({
                        success: true,
                        data: parsedRedisData,
                    })

                } else {
                    resv({
                        success: false,
                        data: [],
                    })
                }
            } else {
                resv({
                    success: false,
                })
            }
        })
    },
    hotelCacheIns: async (req, res) => {
        return await new Promise(async (resv) => {

            if (req.body && Object.keys(req.body).length > 0) {
                const jsonDataStr = JSON.stringify(req.body)
                let jsonDataCacheKey
                if (req.query.cachekey) {
                    let redisData = await useRedis.getCacheById(req.query.cachekey)
                    if (redisData) {
                        resv({
                            success: false,
                        })
                    } else {
                        jsonDataCacheKey = req.query.cachekey
                    }
                } else {
                    jsonDataCacheKey = getUuid(jsonDataStr)
                }

                if (jsonDataCacheKey) {
                    await useRedis.set(jsonDataCacheKey, jsonDataStr)
                }

                resv({
                    success: true,
                    cachekey: jsonDataCacheKey,
                    data: req.body,
                })
            } else {
                resv({
                    success: false,
                })
            }

        })
    },
    hotelCacheUpd: async (req, res) => {
        return await new Promise(async (resv) => {
            if (req.body && Object.keys(req.body).length > 0) {
                const jsonDataStr = JSON.stringify(req.body)
                let jsonDataCacheKey
                if (req.query.cachekey) {
                    let redisData = await useRedis.getCacheById(req.query.cachekey)
                    if (redisData) {
                        jsonDataCacheKey = req.query.cachekey
                    } else {
                        resv({
                            success: false,
                        })
                    }
                } else {
                    resv({
                        success: false,
                    })
                }

                if (jsonDataCacheKey) {
                    await useRedis.set(jsonDataCacheKey, jsonDataStr)
                }

                resv({
                    success: true,
                    cachekey: jsonDataCacheKey,
                    data: req.body,
                })
            } else {
                resv({
                    success: false,
                })
            }

        })
    },
    hotelCacheDel: async (req, res) => {

        return await new Promise(async (resv) => {
            if (req.query.cachekey) {
                let redisData
                redisData = await useRedis.getCacheById(req.query.cachekey)
                if (redisData) {
                    useRedis.del(req.query.cachekey)
                    resv({
                        success: true,
                    })
                } else {
                    resv({
                        success: false,
                    })
                }
            } else {
                resv({
                    success: false,
                })
            }

        })
    },
    hotelContentImageList: async (req, res) => {
        return await new Promise(async (resv) => {
            if (req.body.gid) {
                return await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.hcmItemImgViewList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.gid}`]: `${orestEndpoint.operator.matching}${req.body.gid}`,
                        }),
                        [`${orestEndpoint.global.sort}`]: orestEndpoint.params.orderno,
                        [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                }).then((response) => {
                    if (response.status === 200) {
                        resv({
                            success: true,
                            data: response.data.data,
                        })
                    } else {
                        resv({
                            success: false,
                        })
                    }
                })
            } else {
                resv({
                    success: false,
                })
            }

        })
    },
    hotelContentText: async (req, res) => {
        return await new Promise(async (resv) => {
            if (req.body.gid) {
                return await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.hcmItemTxtParViewList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.gid}`]: `${orestEndpoint.operator.matching}${req.body.gid}`,
                        }),
                        [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                }).then((response) => {
                    if (response.status === 200) {
                        resv({
                            success: true,
                            data: response.data.data,
                        })
                    } else {
                        resv({
                            success: false,
                        })
                    }
                })
            } else {
                resv({
                    success: false,
                })
            }
        })
    },
    hotelContentLangList: async (req, res) => {
        return await new Promise(async (resv) => {
            return await axios({
                url: helpers.getUrl(res, orestEndpoint.api.ralangViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200) {
                    resv({
                        success: true,
                        data: response.data.data,
                    })
                } else {
                    resv({
                        success: false,
                    })
                }
            })
        })
    },
    hotelContentDefaultLang: (req, res) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.settLangLocal),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
            }).then((response) => {
                if (response.status === 200) {
                    return {
                        success: true,
                        data: response.data.data,
                    }
                } else {
                    return {
                        success: false,
                    }
                }
            }).catch(()=> {
                return {
                    success: false,
                }
            })
    },
    hotelAirportList: (req, res) => {
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.airporthotelViewList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
            }
        }).then((response) => {
            if (response.status === 200) {
                return {
                    success: true,
                    data: response.data.data,
                }
            } else {
                return {
                    success: false,
                }
            }
        }).catch(()=> {
            return {
                success: false,
            }
        })
    },
    hotelVehicleList: (req, res) => {
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.vehicleViewList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                    [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.global.true}`,
                }),
                [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false
            }
        }).then((response) => {
            if (response.status === 200) {
                return {
                    success: true,
                    data: response.data.data,
                }
            } else {
                return {
                    success: false,
                }
            }
        }).catch(()=> {
            return {
                success: false,
            }
        })
    },
    hotelFlyTransferPriceCalc: async (req, res) => {
        const request = req.body,
            airportid = request.airportid,
            flydate = request.flydate,
            vehicleid = request.vehicleid,
            isreturn = request.isreturn

        const getFlyTransferPriceCalc = (params) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.flyTransferPriceCalc),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params
            }).then((flyTransferPriceCalcResponse) => {
                if (flyTransferPriceCalcResponse.status === 200 && flyTransferPriceCalcResponse?.data?.data) {
                    return flyTransferPriceCalcResponse.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getFlyTransferPriceCalcParams = () => {
            if (isreturn) {
                return {
                    arportid: 0,
                    deportid: airportid,
                    departdate: flydate,
                    vehicleid: vehicleid,
                }
            } else {
                return {
                    deportid: 0,
                    arportid: airportid,
                    arrivaldate: flydate,
                    vehicleid: vehicleid,
                }
            }
        }

        const flyTransferPriceCalcParams = getFlyTransferPriceCalcParams()
        const flyTransferPriceCalc = await getFlyTransferPriceCalc(flyTransferPriceCalcParams)
        if(!flyTransferPriceCalc){
            return {
                success: false,
            }
        }

        return {
            success: true,
            data: flyTransferPriceCalc,
        }
    },
    getAccTransType: async (req, res) => {
        return await new Promise(async (resv) => {
            return await axios({
                url: helpers.getUrl(res, orestEndpoint.api.accTransType),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200) {
                    resv({
                        success: true,
                        data: response.data.data,
                    })
                } else {
                    resv({
                        success: false,
                    })
                }
            })
        })
    },
    getReceiver: async (req, res) => {
        return await new Promise(async (resv) => {
            return await axios({
                url: helpers.getUrl(res, orestEndpoint.api.hotelLicContact),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200) {
                    resv({
                        success: true,
                        data: response.data.data,
                    })
                } else {
                    resv({
                        success: false,
                    })
                }
            })
        })
    },
    getClientGrpWeb: async (req, res) => {
        return await new Promise(async (resv) => {
            return await axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientGrpWeb),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200) {
                    resv({
                        success: true,
                        data: response.data.data,
                    })
                } else {
                    resv({
                        success: false,
                    })
                }
            })
        })
    },
    pBookSave: async (req, res) => {
        return await new Promise(async (resv) => {
            let usepBookData = false
            let pBookData = {}

            pBookData.refcode = req.body.refcode
            pBookData.firstname = req.body.firstname
            pBookData.lastname = req.body.lastname
            pBookData.workemail = req.body.workemail
            pBookData.mobiletel = helpers.mobileTelNoFormat(req.body.mobiletel)
            pBookData.groupid = req.body.groupid

            await axios({
                url: helpers.getUrl(res, orestEndpoint.api.pBookIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: pBookData,
            }).then((r) => {
                if (r.status === 200) {
                    usepBookData = r.data.data
                } else {
                    resv({
                        success: false,
                        status: r.status,
                        error: r.data,
                        msgcode: 'invalid_data_error',
                    })
                }
            })

            resv({
                success: true,
                msgcode: 'success',
                data: usepBookData,
            })

        })
    },
    saleCallSave: async (req, res) => {
        return await new Promise(async (resv) => {

            let useSaleCallData = false
            let saleCallData = {}

            saleCallData.agencyid = req.body.agencyid
            saleCallData.salesnote = req.body.salesnote

            await axios({
                url: helpers.getUrl(res, orestEndpoint.api.saleCallIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: saleCallData,
            }).then((r) => {
                if (r.status === 200) {
                    useSaleCallData = r.data.data
                } else {
                    resv({
                        success: false,
                        status: r.status,
                        error: r.data,
                        msgcode: 'invalid_data_error',
                    })
                }
            })

            resv({
                success: true,
                msgcode: 'success',
                data: useSaleCallData,
            })

        })
    },
    hotelContentSliderList: async (req, res) => {
        return await new Promise(async (resv) => {
            return await axios({
                url: helpers.getUrl(res, orestEndpoint.api.hcmItemImgViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.sliderid}`]: `${orestEndpoint.operator.matching}${req.body.sliderid}`,
                    }),
                    [`${orestEndpoint.global.sort}`]: orestEndpoint.params.orderno,
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200) {
                    resv({
                        success: true,
                        data: response.data.data,
                    })
                } else {
                    resv({
                        success: false,
                    })
                }
            })
        })
    },
    hotelContentSliderView: async (req, res) => {
        return await new Promise(async (resv) => {
            return await axios({
                url: helpers.getUrl(res, orestEndpoint.api.hcmItemSldViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.gid}`]: `${orestEndpoint.operator.matching}${req.body.gid}`,
                    }),
                    [`${orestEndpoint.global.sort}`]: orestEndpoint.params.orderno,
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200) {
                    resv({
                        success: true,
                        data: response.data.data,
                    })
                } else {
                    resv({
                        success: false,
                    })
                }
            })
        })
    },
    hotelSelfRegisterSearch: async (req, res) => {
        return await new Promise(async (resv) => {

            let hotelListDatas = []
            let useHotelList = false

            if (req.query.name && req.query.name.length > 2) {
                return await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.agencyList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.code}`]: `${req.query.name}`,
                        }),
                        [`${orestEndpoint.global.sort}`]: orestEndpoint.params.code,
                        [`${orestEndpoint.global.limit}`]: 5,
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                }).then((data) => {
                    if (data.status === 200) {
                        useHotelList = data.data.data

                        for (let hotel of useHotelList) {
                            hotelListDatas.push({
                                id: hotel.id,
                                code: hotel.code,
                                codestrid: hotel.codestrid,
                                isactive: hotel.isactive,
                                town: hotel.town,
                                city: hotel.city,
                                rescountrycode: hotel.rescountrycode,
                            })
                        }

                        resv({
                            success: true,
                            msgcode: 'hotel_search_success',
                            data: hotelListDatas,
                        })

                    } else {
                        resv({
                            success: false,
                            msgcode: 'hotel_search_error',
                        })
                    }
                })

            }
        })
    },
    propertySave: async (req, res) => {
        const
            registerType = req.body.registerType,
            brandCode = req.body.brand,
            agencyData = {
                code: req.body.propertyName,
                contact: req.body.fullName,
                email: req.body.email.toLowerCase(),
                web: '',
                description: req.body.propertyName,
                tel: req.body.phone,
                country: req.body.country,
                rescountryid: req.body.countryid,
                targetroom: req.body.numberOfRooms,
                isactive: false,
                xcode: 'REGISTERWEB',
            }

        const toolsEmailExists = (email) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsEmailExists),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: email
                },
            }).then((toolsEmailExistsResponse) => {
                if (toolsEmailExistsResponse.status === 200 && toolsEmailExistsResponse?.data?.data?.res) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const createAgency = (agencyData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.agencyIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: agencyData,
            }).then((agencyInsResponse) => {
                if (agencyInsResponse.status === 200 && agencyInsResponse?.data?.data) {
                    return agencyInsResponse.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const sendExistsNotificationForHotech = (propertyCode, propertyContact, propertyTargetRoom, propertyEmail, propertyPhone, registerType, brandCode) =>{
            return useMail.send(req, res,
                {
                    code: orestEndpoint.templates.tryCloudNtfForExists,
                    langcode: 'en',
                    sendername: res.REDIS_WEBCMS_DATA.assets.meta.title || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: global.emails.hotechFrom || process.env.MAIL_SENDER_MAIL,
                    subject: 'This user already exists - Try For Free',
                    receivername: res.REDIS_WEBCMS_DATA.assets.meta.title,
                    receiveremail: global.emails.hotechSales,
                },{
                    brandName: brandCode.toUpperCase(),
                    registerType: registerType.toUpperCase(),
                    propertyCode: propertyCode,
                    propertyTargetRoom: propertyTargetRoom,
                    contactName: propertyContact,
                    contactEmail: propertyEmail,
                    contactPhone: propertyPhone
                }
            )
        }

        const sendNotificationForHotech = (propertyCode, propertyId, propertyContact, propertyPhone, propertyEmail, registerType, brandCode) =>{
            return useMail.send(req, res,
                {
                    code: orestEndpoint.templates.tryCloudRegistrationStarted,
                    langcode: 'en',
                    sendername: res.REDIS_WEBCMS_DATA.assets.meta.title || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: global.emails.hotechFrom || process.env.MAIL_SENDER_MAIL,
                    subject: `#${propertyId} - Registration Started at Try For Free`,
                    receivername: res.REDIS_WEBCMS_DATA.assets.meta.title,
                    receiveremail: global.emails.hotechSales,
                },{
                    brandName: brandCode.toUpperCase(),
                    registerType: registerType.toUpperCase(),
                    propertyId: propertyId,
                    propertyCode: propertyCode,
                    contactName: propertyContact,
                    contactEmail: propertyEmail,
                    contactPhone: propertyPhone
                }
            )
        }

        const getToolsEmailExists = await toolsEmailExists(agencyData.email)
        if(getToolsEmailExists){
            await sendExistsNotificationForHotech(agencyData.code, agencyData.contact, agencyData.targetroom, agencyData.email, agencyData.tel, registerType, brandCode)

            return {
                success: false
            }
        }

        const getAgency = await createAgency(agencyData)
        if(getAgency){
            const retrunData = {
                propertyContact: getAgency.contact.toUpperCase(),
                propertyId: getAgency.id,
                propertyMid: getAgency.mid,
                propertyCode: getAgency.code,
                propertyEmail: getAgency.email,
                propertyGid: getAgency.gid,
                propertyPhone: getAgency.tel.replace('00', '+'),
                propertyCountryCode: getAgency.country,
                propertyTargetRoom: getAgency.targetroom
            }

            const isSendNotificationForHotech = await sendNotificationForHotech(retrunData.propertyCode, retrunData.propertyId, retrunData.propertyContact, retrunData.propertyPhone, retrunData.propertyEmail, registerType, brandCode)
            if(!isSendNotificationForHotech){
                return {
                    success: false
                }
            }

            return {
                success: true,
                data: retrunData
            }
        }

        return {
            success: false
        }
    },
    propertyAddressSave: async (req, res) => {

        const
            location = req.body.location,
            masterId = req.body.masterid,
            agencyAddressData = {
                country: req.body.country,
                rescountryid: req.body.countryid || '',
                city: req.body.city,
                town: req.body.town,
                zip: req.body.zip,
                address1: req.body.address1,
                address2: req.body.address2,
                gid: req.query.gid,
            }

        const saveAddress = (agencyAddressData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.agencyListPatch),
                method: orestEndpoint.methods.patch,
                headers: helpers.getHeaders(req, res),
                data: [agencyAddressData],
            }).then((agencyInsResponse) => {
                if (agencyInsResponse.status === 200 && agencyInsResponse?.data?.data) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const saveGeoLocation = (lat, lng, masterId) =>{
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.geolocIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: {
                    lat: lat,
                    lng: lng,
                    masterid: masterId,
                },
            }).then((geolocInsResponse) => {
                if (geolocInsResponse.status === 200 && geolocInsResponse?.data?.data) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getAgency = await saveAddress(agencyAddressData)
        if(location?.lat && location?.lng){
            await saveGeoLocation(location.lat, location.lng, masterId)
        }

        if(getAgency){
            return {
                success: true,
            }
        }

        return {
            success: false
        }
    },
    propertyModuleList: async (req, res) => {
        const
            brandCode = req.query.brand,
            brandCodeForAmonra = 'amonra',
            brandCodeForHotech = 'hotech',
            brandCodeForGueest = 'gueest',
            productTypeForAmonra = 'CLOUDRA',
            productTypeForHotech = 'CLOUDOO',
            productTypeCode = brandCode === brandCodeForAmonra ? productTypeForAmonra : productTypeForHotech,
            marketCode = req.query.market,
            marketCodeForTr = 'tr',
            marketCodeForEn = 'en',
            marketCurrency = {
                tr: {
                    code: 'TL',
                    id: 1
                },
                en: {
                    code: 'USD',
                    id: 2
                },
            }

        if (brandCode !== brandCodeForHotech && brandCode !== brandCodeForAmonra && brandCode !== brandCodeForGueest) {
            return {
                success: false,
            }
        }

        if (marketCode !== marketCodeForTr && marketCode !== marketCodeForEn) {
            return {
                success: false,
            }
        }

        const getProductList = (brandCode, priceCurr) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.sproductProductList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.depart}`]: brandCode,
                    [`${orestEndpoint.params.pricecurr}`]: priceCurr,
                    [`${orestEndpoint.params.needors}`]: orestEndpoint.global.true,
                    [`${orestEndpoint.params.needloy}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.params.needcon}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((sproductViewListResponse) => {
                if (sproductViewListResponse.status === 200 && sproductViewListResponse?.data?.data) {
                    return sproductViewListResponse.data.data
                }else{
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const createProductList = (productList, priceCurr) => {
            let newProductList = []
            productList.map((product) => {
                if (product.pricecurr === priceCurr && product.saleprice > 0) {
                    newProductList.push({
                        id: product.id,
                        title: product.description,
                        description: product.cooktext,
                        minprice: product.minprice,
                        saleprice: product.saleprice,
                        pricecurr: product.pricecurr,
                        imageurl: product.imageurl,
                        orderno: product.orderno,
                        ispp: product.ispp,
                        gid: product.gid
                    })
                }
            })

            return newProductList
        }

        let productList = await getProductList(productTypeCode, marketCurrency[marketCode].code)
        if(!productList){
            return {
                success: false,
            }
        }
        productList = createProductList(productList, marketCurrency[marketCode].code)

        return {
            success: true,
            data: productList,
            currencyInfo: marketCurrency[marketCode]
        }
    },
    propertyModuleAdd: async (req, res, sett) => {
        let transType = '7020270',
            needInvoice = true,
            receiptNo = 'SALE',
            propertyCode = req.query.propertyCode || false,
            transId = req.query.transId === 'false' ? false : req.query.transId,
            transMid = false,
            moduleId = req.query.moduleId || false,
            qty = req.query.qty || false,
            currencyId = req.query.currencyId || false,
            useTypeIsDemo = req.query.registerType === 'demo',
            brandCode = req.query.brand,
            brandCodeForAmonra = 'amonra',
            brandCodeForHotech = 'hotech',
            brandCodeForGueest = 'gueest',
            productTypeForAmonra = 'CLOUDRA',
            productTypeForHotech = 'CLOUDOO',
            productTypeCode = brandCode === brandCodeForAmonra ? productTypeForAmonra : productTypeForHotech,
            marketCode = req.query.market,
            marketCodeForTr = 'tr',
            marketCodeForEn = 'en',
            marketCurrency = {
                tr: {
                    code: 'TL',
                    id: 1
                },
                en: {
                    code: 'USD',
                    id: 2
                },
            }

        if (brandCode !== brandCodeForHotech && brandCode !== brandCodeForAmonra && brandCode !== brandCodeForGueest) {
            return {
                success: false,
            }
        }

        if (marketCode !== marketCodeForTr && marketCode !== marketCodeForEn) {
            return {
                success: false,
            }
        }

        if (useTypeIsDemo) {
            needInvoice = false
            receiptNo = 'DEMO'
        }

        const createSpTrans = () => {
            const spTransParams = {
                acc: propertyCode,
                department: productTypeCode,
                receiptno: receiptNo,
                transtype: transType,
                pricecurr: marketCurrency[marketCode].code,
                needinvoice: needInvoice,
                xcode: 'REGISTERWEB',
                hotelrefno: sett.global.HOTELREFNO
            }

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.sptransInsCode),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: spTransParams,
            }).then((sptransInsCodeResponse) => {
                if (sptransInsCodeResponse.status === 200 && sptransInsCodeResponse?.data?.data) {
                    return sptransInsCodeResponse.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const createSptLine = (transId) =>{
            const sptLineParams = {
                transno: transId,
                productid: moduleId,
                pricecurrid: currencyId,
                amount: qty,
                depart: productTypeCode,
            }

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.sptransInsline),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: sptLineParams,
            }).then((sptransInslineResponse) => {
                if (sptransInslineResponse.status === 200 && sptransInslineResponse?.data?.data) {
                    return sptransInslineResponse.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const updateSpTransTotal = (transId) =>{
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.sptransUpdateTotals),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    transno: transId,
                },
            }).then((sptransUpdateTotals) => {
                if (sptransUpdateTotals.status === 200 ) {
                    return sptransUpdateTotals.data.data
                }else{
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        if(!transId){
            const getSpTrans = await createSpTrans()
            transId = getSpTrans.res
            transMid = getSpTrans.mid
            if(!transId){
                return {
                    success: false
                }
            }
        }

        const getSptLine = await createSptLine(transId)
        if(!getSptLine){
            return {
                success: false
            }
        }

        const getSpTransTotal = await updateSpTransTotal(transId)
        if(!getSpTransTotal){
            return {
                success: false
            }
        }

        return {
            success: true,
            transid: transId,
            transmid: transMid,
            transgid: getSpTransTotal.gid,
            linegid: getSptLine.gid,
            nettotal: getSpTransTotal.nettotal || 0,
            currency: getSpTransTotal.pricecurr
        }
    },
    propertyModuleUpdate: async (req, res) => {
        let
            transId = req.query.transId === 'false' ? false : req.query.transId,
            lineGid = req.query.lineGid || false,
            qty = req.query.qty || false

        const patchSptLine = (lineGid) =>{
            const sptLineData = [{
                gid: lineGid,
                amount: qty
            }]

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.sptlineListPatch),
                method: orestEndpoint.methods.patch,
                headers: helpers.getHeaders(req, res),
                data: sptLineData
            }).then((sptlineListPatchResponse) => {
                if (sptlineListPatchResponse.status === 200 && sptlineListPatchResponse?.data?.data) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const updateSpTransTotal = (transId) =>{
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.sptransUpdateTotals),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    transno: transId,
                },
            }).then((sptransUpdateTotals) => {
                if (sptransUpdateTotals.status === 200 ) {
                    return sptransUpdateTotals.data.data
                }else{
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        if(!transId){
            return {
                success: false,
            }
        }

        const getSptLine = await patchSptLine(lineGid)
        if(!getSptLine){
            return {
                success: false,
            }
        }

        const getSpTransTotal = await updateSpTransTotal(transId)
        if(!getSpTransTotal){
            return {
                success: false,
            }
        }

        return {
            success: true,
            transid: transId,
            nettotal: getSpTransTotal.nettotal || 0,
            currency: getSpTransTotal.pricecurr
        }
    },
    propertyModuleRemove: async (req, res) => {
        let
            transId = req.query.transId === 'false' ? false : req.query.transId,
            lineGid = req.query.lineGid || false

        const removeSptLine = (lineGid) =>{
            const sptLineData = {
                gid: lineGid,
            }

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.sptlineDel),
                method: orestEndpoint.methods.delete,
                headers: helpers.getHeaders(req, res),
                params: sptLineData,
            }).then((sptlineDelResponse) => {
                if (sptlineDelResponse.status === 200 && sptlineDelResponse.data.success) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const updateSpTransTotal = (transId) =>{
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.sptransUpdateTotals),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    transno: transId,
                },
            }).then((sptransUpdateTotals) => {
                if (sptransUpdateTotals.status === 200 ) {
                    return sptransUpdateTotals.data.data
                }else{
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        if(!transId){
            return {
                success: false,
            }
        }

        const delSptLine = await removeSptLine(lineGid)
        if(!delSptLine){
            return {
                success: false,
            }
        }

        const getSpTransTotal = await updateSpTransTotal(transId)
        if(!getSpTransTotal){
            return {
                success: false,
            }
        }

        return {
            success: true,
            transid: transId,
            nettotal: getSpTransTotal.nettotal || 0,
            currency: getSpTransTotal.pricecurr
        }
    },
    propertyConfirm: async (req, res) => {
        const
            propertyId = Number(req.query.propertyId) || false,
            propertyCode = req.query.propertyCode || false,
            propertyEmail = req.query.propertyEmail || false,
            propertyContact = req.query.propertyContact || false,
            propertyPhone = req.query.propertyPhone || false,
            transId = req.query.transId === 'false' ? false : req.query.transId,
            registerType =  req.query.registerType,
            useTypeIsDemo = registerType === 'demo',
            brandCode = req.query.brand,
            brandCodeForAmonra = 'amonra',
            brandCodeForHotech = 'hotech',
            brandCodeForGueest = 'gueest',
            langCode = req.query.lang

        //For Use Demo
        const hotelRegDemoLoginChk = (transno) =>{
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.hotelRegDemoLoginChk),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.transno}`]: transno
                },
            }).then((hotelRegDemoLoginChkResponse) => {
                if (hotelRegDemoLoginChkResponse.status === 200) {
                   return true
                }else{
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        //Todo: Demo hotel gid.
        const setPasswordToUser = (email) =>{
            const newPassword = helpers.generatePassword()
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsUserPassword),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: email,
                    [`${orestEndpoint.params.pass}`]: newPassword,
                    [`${orestEndpoint.params.sendmsg}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: orestEndpoint.global.demoHotelRefNo
                },
            }).then((toolsUserPasswordResponse) => {
                if (toolsUserPasswordResponse.status === 200) {
                    return newPassword
                }else{
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const sendWelcomeMailForDemo = (propertyContact, propertyEmail, getPassword, lang = 'en') => {
            const subjectForLangs = {
                "en": "Welcome to Hotech 🎉",
                "tr": "Hotech'e hoş geldiniz 🎉"
            }

            return useMail.send(req, res, {
                    code: orestEndpoint.templates.tryCloudWelcomeForDemo,
                    langcode: subjectForLangs[lang] ? lang : lang,
                    sendername: res.REDIS_WEBCMS_DATA.assets.meta.title || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: global.emails.hotechFrom || process.env.MAIL_SENDER_MAIL,
                    subject: subjectForLangs[lang] ? subjectForLangs[lang] : subjectForLangs['en'],
                    receivername: res.REDIS_WEBCMS_DATA.assets.meta.title,
                    receiveremail: global.emails.hotechSales,
                },
                {
                    contactName: propertyContact,
                    contactEmail: propertyEmail,
                    contactPass: getPassword
            })
        }

        const sendWelcomeMailForBuyNow = (propertyContact, propertyEmail, lang = 'en') => {
            const subjectForLangs = {
                "en": "Welcome to Hotech 🎉",
                "tr": "Hotech'e hoş geldiniz 🎉"
            }

            return useMail.send(req, res, {
                code: orestEndpoint.templates.tryCloudWelcomeForBuyNow,
                langcode: subjectForLangs[lang] ? lang : lang,
                sendername: res.REDIS_WEBCMS_DATA.assets.meta.title || res.REDIS_WEBCMS_DATA.assets.meta.title,
                senderemail: global.emails.hotechFrom || process.env.MAIL_SENDER_MAIL,
                subject: subjectForLangs[lang] ? subjectForLangs[lang] : subjectForLangs['en'],
                receivername: res.REDIS_WEBCMS_DATA.assets.meta.title,
                receiveremail: global.emails.hotechSales,
            }, {
                contactName: propertyContact,
                contactEmail: propertyEmail,
            })
        }

        const sendNotificationForHotech = (propertyCode, propertyId, propertyContact, propertyPhone, propertyEmail, registerType, brandCode) =>{
            return useMail.send(req, res,
                {
                    code: orestEndpoint.templates.tryCloudRegistrationCompleted,
                    langcode: 'en',
                    sendername: res.REDIS_WEBCMS_DATA.assets.meta.title || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: global.emails.hotechFrom || process.env.MAIL_SENDER_MAIL,
                    subject: `#${propertyId} - Registration Completed at Try For Free`,
                    receivername: res.REDIS_WEBCMS_DATA.assets.meta.title,
                    receiveremail: global.emails.hotechSales,
                },{
                    brandName: brandCode.toUpperCase(),
                    registerType: registerType.toUpperCase(),
                    propertyId: propertyId,
                    propertyCode: propertyCode,
                    contactName: propertyContact,
                    contactEmail: propertyEmail,
                    contactPhone: propertyPhone
                }
            )
        }

        if(useTypeIsDemo){
            const getDemoLoginChk = await hotelRegDemoLoginChk(transId)
            if(!getDemoLoginChk){
                return {
                    success: false
                }
            }

            const getPassword = await setPasswordToUser(propertyEmail)
            if(!getPassword){
                return {
                    success: false
                }
            }

            const isSendWelcomeMailForDemo = await sendWelcomeMailForDemo(propertyContact, propertyEmail, getPassword, langCode)
            if(!isSendWelcomeMailForDemo){
                return {
                    success: false
                }
            }

        }else{
            const isSendWelcomeMailForBuyNow = await sendWelcomeMailForBuyNow(propertyContact, propertyEmail, langCode)
            if(!isSendWelcomeMailForBuyNow){
                return {
                    success: false
                }
            }
        }

        const isSendNotificationForHotech = await sendNotificationForHotech(propertyCode, propertyId, propertyContact, propertyPhone, propertyEmail, registerType, brandCode)
        if(!isSendNotificationForHotech){
            return {
                success: false
            }
        }

        return {
            success: true
        }
    },
    propertyAltPayRequest: async (req, res) => {
        const
            propertyId = Number(req.query.propertyId) || false,
            propertyCode = req.query.propertyCode || false,
            propertyEmail = req.query.propertyEmail || false,
            propertyContact = req.query.propertyContact || false,
            propertyPhone = req.query.propertyPhone || false,
            transId = req.query.transId === 'false' ? false : req.query.transId,
            registerType =  req.query.registerType,
            useTypeIsDemo = registerType === 'demo',
            brandCode = req.query.brand

        const sendNotificationForHotech = (propertyCode, propertyId, propertyContact, propertyEmail, registerType, brandCode) =>{
            return useMail.send(req, res,
                {
                    code: orestEndpoint.templates.tryCloudNtfAltPayReq,
                    langcode: 'en',
                    sendername: res.REDIS_WEBCMS_DATA.assets.meta.title || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: global.emails.hotechFrom || process.env.MAIL_SENDER_MAIL,
                    subject: 'Request For Payment With An Alternative Method',
                    receivername: res.REDIS_WEBCMS_DATA.assets.meta.title,
                    receiveremail: global.emails.hotechSales,
                },{
                    brandName: brandCode.toUpperCase(),
                    registerType: registerType.toUpperCase(),
                    propertyId: propertyId,
                    propertyCode: propertyCode,
                    contactName: propertyContact,
                    contactEmail: propertyEmail,
                    contactPhone: propertyPhone
                }
            )
        }

        const isSendNotificationForHotech = await sendNotificationForHotech(propertyCode, propertyId, propertyContact, propertyEmail, registerType, brandCode)
        if(!isSendNotificationForHotech){
            return {
                success: false
            }
        }

        return {
            success: true
        }
    },
    hotelSelfRegisterSave: async (req, res) => {

        let useHotelData = false
        let cacheToken = false
        let hotelData = {}

        hotelData.code = req.body.code
        hotelData.contact = req.body.contact
        hotelData.email = req.body.email
        hotelData.description = req.body.description
        hotelData.tel = req.body.tel
        hotelData.web = req.body.web ? req.body.web : ''
        hotelData.country = req.body.country
        hotelData.rescountryid = req.body.countryid
        hotelData.targetroom = req.body.targetroom
        hotelData.isactive = false
        hotelData.xcode = 'REGISTERWEB'

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.agencyIns),
            method: orestEndpoint.methods.post,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
            data: hotelData,
        }).then((reponse) => {
            if (reponse.status === 200) {
                useHotelData = reponse.data.data
                cacheToken = getUuid(String(reponse.data.data.id))
                return {
                    success: true,
                    msgcode: 'success',
                    token: cacheToken,
                    notifytoken: getUuid(cacheToken + String(new Date().toJSON().slice(0, 10).replace(/-/g, '/'))),
                    data: useHotelData,
                }
            } else {
                return {
                    success: false,
                    status: reponse.status,
                    error: reponse.data,
                    msgcode: 'invalid_data_error',
                }
            }
        }).catch(() => {
            return {
                success: false,
                status: 400,
                error: 'invalid_data_error',
                msgcode: 'invalid_data_error',
            }
        })
    },
    hotelSelfRegisterNotify: async (req, res) => {
        return await new Promise(async (resv) => {
            let token = req.query.token
            let notifytoken = getUuid(token + String(new Date().toJSON().slice(0, 10).replace(/-/g, '/')))

            if (Object.keys(req.body).length > 0 && notifytoken === req.query.notifytoken) {

                let sendHotech = await useMail.send(req, res,
                    {
                        code:  orestEndpoint.templates.hotechRegisterHotel,
                        langcode: 'en',
                        sendername: res.REDIS_WEBCMS_DATA.assets.meta.title || res.REDIS_WEBCMS_DATA.assets.meta.title,
                        senderemail: global.emails.hotechFrom || process.env.MAIL_SENDER_MAIL,
                        subject: 'A new request via CMS Register',
                        receivername: res.REDIS_WEBCMS_DATA.assets.meta.title,
                        receiveremail: global.emails.hotechSales,
                    },
                    {
                        hotelid: req.body.id,
                        hotelname: req.body.code,
                        email: req.body.email,
                        contact: req.body.contact,
                        tel: req.body.tel,
                        browser: req.body.browser,
                    },
                )

                if (sendHotech) {
                    resv({
                        success: true,
                    })
                } else {
                    resv({
                        success: false,
                    })
                }


            } else {
                resv({
                    success: false,
                })
            }
        })
    },
    hotelSelfRegisterSend: async (req, res) => {
        return await new Promise(async (resv) => {
            if (Object.keys(req.query).length > 0) {

                let sendHotech = await useMail.send(req, res, {
                        code: orestEndpoint.templates.hotechRegisterContact,
                        langcode: 'en',
                        sendername: res.REDIS_WEBCMS_DATA.assets.meta.title || res.REDIS_WEBCMS_DATA.assets.meta.title,
                        senderemail: global.emails.hotechFrom || process.env.MAIL_SENDER_MAIL,
                        subject: 'A new contact request via CMS Register',
                        receivername: res.REDIS_WEBCMS_DATA.assets.meta.title,
                        receiveremail: global.emails.hotechSales,
                    },
                    {
                        hotelname: req.query.hotelname,
                        email: req.query.email,
                        tel: req.query.tel,
                    }
                )

                if (!sendHotech) {
                    resv({
                        success: false,
                        msgcode: 'mailSendError',
                    })
                } else {
                    resv({
                        success: true,
                        msgcode: 'mailIsSend',
                    })
                }

            } else {
                resv({
                    success: false,
                })
            }
        })
    },
    hotelSelfRegisterView: async (req, res) => {
        return await new Promise(async (resv) => {

            let useHotelData = false
            if (Object.keys(req.body).length > 0) {

                let cacheToken = getUuid(String(req.body.id))
                if (req.query.token && cacheToken === req.query.token) {

                    return await axios({
                        url: helpers.getUrl(res, orestEndpoint.api.agencyList),
                        method: orestEndpoint.methods.get,
                        headers: helpers.getHeaders(req, res),
                        params: {
                            [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                                [`${orestEndpoint.params.id}`]: `${orestEndpoint.operator.matching}${req.body.id}`,
                            }),
                            [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                        },
                    }).then((data) => {
                        if (data.status === 200) {
                            useHotelData = data.data.data[0]

                            resv({
                                success: true,
                                msgcode: 'hotel_view_success',
                                data: useHotelData,
                            })

                        } else {
                            resv({
                                success: false,
                                msgcode: 'hotel_view_error',
                            })
                        }
                    })

                } else {
                    resv({
                        success: false,
                        msgcode: 'hotel_invalid',
                    })
                }
            } else {
                resv({
                    success: false,
                    msgcode: 'data_invalid',
                })
            }

        })
    },
    hotelSelfRegisterAddressUpd: async (req, res) => {
        return await new Promise(async (resv) => {

            let cacheToken = getUuid(String(req.query.id))
            if (req.query.token && cacheToken === req.query.token) {
                let requestBody = req.body
                requestBody.gid = req.query.gid

                return await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.agencyListPatch),
                    method: orestEndpoint.methods.patch,
                    headers: helpers.getHeaders(req, res),
                    data: [requestBody],
                }).then((r2) => {
                    if (r2.status === 200) {
                        resv({
                            success: true,
                            msgcode: 'address_update_success',
                            data: r2.data,
                        })
                    } else {
                        resv({
                            success: false,
                            msgcode: 'invalid_update_error',
                        })
                    }
                })
            } else {
                resv({
                    success: false,
                    msgcode: 'data_invalid',
                })
            }

        })
    },
    hotelSelfRegisterAddressGeolocSave: async (req, res) => {
        return await new Promise(async (resv) => {
            if (req.body.lat && req.body.lng && req.body.masterid) {
                await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.agencyList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.mid}`]: `${orestEndpoint.operator.matching}${req.body.masterid}`,
                        }),
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                }).then((data) => {
                    if (data.status === 200 && !data.data.data.length > 0) {
                        resv({
                            success: false,
                            msgcode: 'invalid_hotel_error',
                        })
                    }
                })

                return await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.geolocIns),
                    method: orestEndpoint.methods.post,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                    data: {
                        lat: Number(req.body.lat),
                        lng: Number(req.body.lng),
                        masterid: Number(req.body.masterid),
                    },
                }).then((r) => {
                    if (r.status === 200 && r.data.count > 0) {
                        resv({
                            success: true,
                            msgcode: 'hotel_geoloc_success',
                        })
                    } else {
                        resv({
                            success: false,
                            msgcode: 'invalid_save_error',
                        })
                    }
                })
            } else {
                resv({
                    success: false,
                    msgcode: 'invalid_data_error',
                })
            }
        })
    },
    hotelSelfRegisterAddressGeolocUpd: async (req, res) => {
        return await new Promise(async (resv) => {

            if (req.body.lat && req.body.lng && req.body.masterid) {
                let geolocGid = false
                await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.geolocViewList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.masterid}`]: `${orestEndpoint.operator.matching}${req.body.masterid}`,
                        }),
                        [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                }).then((r) => {
                    if (r.status === 200 && !r.data.count > 0) {
                        resv({
                            success: false,
                            msgcode: 'invalid_record_error',
                        })
                    } else {
                        geolocGid = r.data.data[0].gid
                    }
                })
                if (geolocGid) {

                    let patchData = {}
                    patchData.lat = Number(req.body.lat)
                    patchData.lng = Number(req.body.lng)
                    patchData.gid = geolocGid

                    return await axios({
                        url: helpers.getUrl(res, orestEndpoint.api.geolocListPatch),
                        method: orestEndpoint.methods.patch,
                        headers: helpers.getHeaders(req, res),
                        data: [patchData],
                    }).then((r2) => {
                        if (r2.status === 200 && r2.data.count > 0) {
                            resv({
                                success: true,
                                msgcode: 'hotel_geoloc_success',
                            })
                        } else {
                            resv({
                                success: false,
                                msgcode: 'invalid_update_error',
                            })
                        }
                    })

                } else {
                    resv({
                        success: false,
                        msgcode: 'invalid_data_error',
                    })
                }
            } else {
                resv({
                    success: false,
                    msgcode: 'invalid_data_error',
                })
            }

        })
    },
    hotelSelfRegisterProductsView: async (req, res) => {
        return await new Promise(async (resv) => {

            let productData = []
            let currencyCode = ''
            const brandName = req.query.brand

            let brandCode = 'CLOUDOO'
            if (brandName === 'amonra') {
                brandCode = 'CLOUDRA'
            }

            return await axios({
                url: helpers.getUrl(res, orestEndpoint.api.sproductViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.spgroupdesc}`]: `${orestEndpoint.operator.containing}CLOUD`,
                        [`${orestEndpoint.params.producttypecode}`]: `${orestEndpoint.operator.matching}${brandCode}`,
                        [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                    }),
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((r2) => {
                if (r2.status === 200) {
                    r2.data.data.map((product) => {
                        if (product.saleprice > 0) {
                            if (!currencyCode) {
                                currencyCode = product.currency
                            }

                            productData.push({
                                spgroupdesc: product.spgroupdesc,
                                id: product.id,
                                mid: product.mid,
                                salegroupid: product.salegroupid,
                                description: product.description,
                                product_description: product.cooktext,
                                gid: product.gid,
                                ischecked: false,
                                qtyamount: 0,
                                saleprice: product.saleprice,
                                currency: product.currency,
                                currencyid: product.currencyid,
                                qty: product.qty,
                                qtyid: product.qtyid,
                                taxrate: product.taxrate,
                                orderno: product.orderno,
                                ispp: product.ispp,
                            })
                        }
                    })

                    resv({
                        success: true,
                        msgcode: 'products_success',
                        data: productData,
                        currency: currencyCode ? currencyCode : 'USD',
                    })

                } else {
                    resv({
                        success: false,
                        msgcode: 'products_list_error',
                    })
                }
            })

        })
    },
    hotelSelfRegisterProductsSave: async (req, res) => {
        return await new Promise(async (resv) => {

            let cacheToken = getUuid(String(req.query.id))
            if (req.query.token && cacheToken === req.query.token) {
                let transType = '7020270' //offers
                let needInvoice = true
                let sendMsg = false
                let receiptNo = 'SALE'
                let hotelRefno = 999999

                if (req.query.usetype === 'demo') {
                    needInvoice = false
                    receiptNo = 'DEMO'
                    hotelRefno = 999984
                }

                let spTransData = {}
                spTransData.accid = req.query.id
                spTransData.pricecurrid = req.query.currencyid
                spTransData.transtype = transType
                spTransData.needinvoice = needInvoice
                spTransData.receiptno = receiptNo
                spTransData.xcode = 'REGISTERWEB'
                spTransData.hotelrefno = res.GENERAL_SETTINGS.HOTELREFNO

                let spTransNo = false
                await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.sptransIns),
                    method: orestEndpoint.methods.post,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                    data: spTransData,
                }).then((r) => {
                    if (r.status === 200) {
                        spTransNo = r.data.data.transno
                    } else {
                        resv({
                            success: false,
                            errordetail: r.data,
                            msgcode: 'invalid_data_error',
                        })
                    }
                })

                for (let module of req.body) {
                    let sptLineData = {
                        transno: spTransNo,
                        accid: req.query.id,
                        productid: module.id,
                        pricecurrid: module.currencyid,
                        amount: module.qtyamount,
                    }

                    await axios({
                        url: helpers.getUrl(res, orestEndpoint.api.sptransInsline),
                        method: orestEndpoint.methods.post,
                        headers: helpers.getHeaders(req, res),
                        params: sptLineData,
                    }).then((r) => {
                        if (r.status !== 200) {
                            resv({
                                success: false,
                                error: r.data,
                                send_data: sptLineData,
                                msgcode: 'product_add_error',
                            })
                        }
                    })
                }

                if (req.query.discountid > 0) {
                    let useSalesDiscountList = false
                    await axios({
                        url: helpers.getUrl(res, orestEndpoint.api.salediscViewList),
                        method: orestEndpoint.methods.get,
                        headers: helpers.getHeaders(req, res),
                        params: {
                            [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                                [`${orestEndpoint.params.id}`]: `${orestEndpoint.operator.matching}${req.query.discountid}`,
                            }),
                            [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                            [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                        },
                    }).then((data) => {
                        if (data.status === 200) {
                            useSalesDiscountList = data.data.data[0]
                        } else {
                            resv({
                                success: false,
                                msgcode: 'discounts_error',
                            })
                        }
                    })

                    if (Object.keys(useSalesDiscountList).length > 0) {
                        await axios({
                            url: helpers.getUrl(res, orestEndpoint.api.spsalediscIns),
                            method: orestEndpoint.methods.post,
                            headers: helpers.getHeaders(req, res),
                            params: {
                                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                            },
                            data: {
                                transno: spTransNo,
                                salediscid: req.query.discountid,
                                discrate: useSalesDiscountList.discrate,
                            },
                        }).then((r) => {
                            if (r.status !== 200) {
                                resv({
                                    success: false,
                                    msgcode: 'discount_add_error',
                                })
                            }
                        })
                    }
                }

                await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.sptransUpdateTotals),
                    method: orestEndpoint.methods.put,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        transno: spTransNo,
                    },
                }).then((r) => {
                    if (r.status !== 200) {
                        resv({
                            success: false,
                            msgcode: 'price_add_error',
                        })
                    }
                })

                await axios({
                    url: helpers.getUrl(res, orestEndpoint.api.hotelRegDemoLoginChk),
                    method: orestEndpoint.methods.post,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.params.transno}`]: spTransNo
                    },
                })

                /*await axios({
                        url: helpers.getUrl(res, orestEndpoint.api.toolsUserPassword),
                        method: orestEndpoint.methods.put,
                        headers: helpers.getHeaders(req, res),
                        params: {
                            [`${orestEndpoint.params.email}`]: req.query.email,
                            [`${orestEndpoint.params.sendmsg}`]: orestEndpoint.global.true,
                            [`${orestEndpoint.global.hotelrefno}`]: hotelRefno,
                        },
                    }).then((r) => {
                        if (r.status === 200) {
                            sendMsg = true
                        }
                    })*/

                resv({
                    success: true,
                    msgcode: '',
                    sendmsg: true, //sendMsg,
                    referno: req.query.id,
                    transno: spTransNo,
                })

            } else {
                resv({
                    success: false,
                    msgcode: 'data_invalid',
                })
            }

        })
    },
    hotelSelfRegisterProductsDisc: async (req, res) => {
        return await new Promise(async (resv) => {

            let salesDiscountDatas = []
            let useSalesDiscountList = false

            await axios({
                url: helpers.getUrl(res, orestEndpoint.api.salediscViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((data) => {
                if (data.status === 200) {
                    useSalesDiscountList = data.data.data
                } else {
                    resv({
                        success: false,
                        msgcode: 'discounts_error',
                    })
                }
            })

            await useSalesDiscountList.map((discount) => {
                salesDiscountDatas.push({
                    id: discount.id,
                    code: discount.code,
                    description: discount.description,
                    gid: discount.gid,
                    ischecked: false,
                    discrate: discount.discrate,
                })
            })

            resv({
                success: true,
                msgcode: 'discounts_success',
                data: salesDiscountDatas,
            })

        })
    },
    getValidationEmail: async (req, res) => {
        return await new Promise(async (resv) => {

            if (!req.query.email) {
                resv({
                    success: false,
                })
            }

            return await axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsValidateEmail),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: req.query.email,
                    [`${orestEndpoint.params.verify}`]: orestEndpoint.global.true,
                },
            }).then((response) => {
                resv(orestHelper.responseSuccess(response))
            }).catch((error) => {
                resv(orestHelper.responseError(error))
            })
        })
    },
    getHotelContentImagePath: async (req, res) => {
        return await new Promise(async (resv) => {

            if (!req.query.code) {
                resv({
                    success: false,
                })
            }

            if (!req.query.masterid) {
                resv({
                    success: false,
                })
            }

            return await axios({
                url: helpers.getUrl(res, orestEndpoint.api.rafileViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.code}`]: `${orestEndpoint.operator.matching}${req.query.code}`,
                        [`${orestEndpoint.params.masterid}`]: `${orestEndpoint.operator.matching}${req.query.masterid}`,
                        [`${orestEndpoint.params.isorsactive}`]: `${orestEndpoint.global.true}`,
                    }),
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                },
            }).then((response) => {

                if (response && response.data && response.data.data.length > 0) {
                    response.data.data = response.data.data[0].url.replace('/var/otello', '').replace('/public', '')
                } else {
                    response.success = false
                    response.data.data = false
                }

                resv(orestHelper.responseSuccess(response))

            }).catch((error) => {
                resv(orestHelper.responseError(error))
            })
        })
    },
    hotelContentFileList: (req, res) => {
        if (!req.query.masterid) {
            return {
                success: false,
            }
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.rafileViewList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                    [`${orestEndpoint.params.masterid}`]: `${orestEndpoint.operator.matching}${req.query.masterid}`,
                    [`${orestEndpoint.params.isorsactive}`]: `${orestEndpoint.global.true}`,
                    [`${orestEndpoint.params.langcode}`]: `${req.query.langcode}`
                }),
                [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true
            },
        }).then((response) => {
            if (response && response.data && response.data.data.length > 0) {
                let newFileList = []
                response.data.data.filter(item => item.contentype === "0000535" || item.contentype === "0000510").map((fileItem) => {
                    newFileList.push({
                        id: fileItem.id,
                        code: fileItem.code,
                        description: fileItem.description,
                        mid: fileItem.mid,
                        filetype: fileItem.filetype,
                        fileurl: fileItem?.url.replace('/var/otello', '').replace('/public', '') || false,
                        isPreview: fileItem.contentype === "0000510" ? true : false || false
                    })
                })

                response.data.data = newFileList
            } else {
                response.success = false
                response.data.data = false
            }

            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    setPay: async (infoPay) => {

        const formatCcNo = (ccno) => {
            return ccno.replace(/\s/g, '')
        }

        const formatExpDate = (date) => {
            const fullDate = date.split("/")
            const month = fullDate[0]
            const year = fullDate[1].slice(-2)
            return month + year
        }

        const formatIpAddress = (ipaddress) => {
            if(ipaddress === "::1"){
                return "0.0.0.0"
            }
            return ipaddress
        }

        const orderIdGenerator = (number) =>{
            return number + moment(Date.now()).locale(defaultLocale).format('hhmmss')
        }

        return new Promise((resv) => {

            let paymentServiceUrl = serverConst.CLOUD_PAYMENT_SERVICE_URL
            if(process.env.NODE_ENV !== 'production'){
                paymentServiceUrl = serverConst.DEV_PAYMENT_SERVICE_URL
            }

            return axios({
                url: paymentServiceUrl,
                method: orestEndpoint.methods.post,
                headers: {
                    Authorization: `Bearer ${infoPay.token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                params: {
                    [`${orestEndpoint.params.ccno}`]: formatCcNo(infoPay.cardNumber),
                    [`${orestEndpoint.params.cvc}`]: infoPay.cardCvc,
                    [`${orestEndpoint.params.expdate}`]: formatExpDate(infoPay.cardExpiry),
                    [`${orestEndpoint.params.orderid}`]: orderIdGenerator(infoPay.reservno || infoPay.transno),
                    [`${orestEndpoint.params.amount}`]: infoPay.paybalance,
                    [`${orestEndpoint.params.currencycode}`]: infoPay.currency,
                    [`${orestEndpoint.params.emailaddress}`]: infoPay.email,
                    [`${orestEndpoint.params.hotelgid}`]: infoPay.token,
                    [`${orestEndpoint.params.webkey}`]:  infoPay.webkey,
                    [`${orestEndpoint.params.ipaddress}`]: formatIpAddress(infoPay.ipaddress),
                },
            }).then((response) => {
                resv(response.data)
            }).catch((error) => {
                resv(error.message)
            })
        })
    },
    getHotelPayment: async (req, res) => {

        const getPayInfo = async (gid) => {
            return new Promise((resv) => {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.allaccInfoPay),
                    method: orestEndpoint.methods.put,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.params.gid}`]: gid,
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                }).then((response) => {
                        if (response.status === 200 && response.data.data.length > 0) {
                            let infoPay = response.data.data[0]
                            infoPay.success = true
                            resv(infoPay)
                        } else {
                            resv({ success: false })
                        }
                    },
                ).catch(() => {
                    resv({ success: false })
                })
            })
        }

        const getCCPayTypeId = async () => {
            return new Promise((resv) => {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.paytypeList),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${orestEndpoint.params.isccpay}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                            [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                            [`${orestEndpoint.params.isorsactive}`]: `${orestEndpoint.operator.matching}${orestEndpoint.global.true}`,
                        }),
                        [`${orestEndpoint.global.limit}`]: 1,
                        [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true
                    },
                }).then((response) => {
                    if (response.status === 200 && response.data.data.length > 0) {
                        resv(response.data.data[0].id)
                    } else {
                        resv(false)
                    }
                }).catch(()=>{
                    resv(false)
                })
            })
        }

        const getFolioNo = async (reftable, queryValue) => {

            let apiEndpoint, queryParam
            if(reftable === 'FOLIO'){
                apiEndpoint = orestEndpoint.api.folioList
                queryParam = orestEndpoint.params.mid
            }else{
                apiEndpoint = orestEndpoint.api.foltransList
                queryParam = orestEndpoint.params.transno
            }

            return new Promise((resv) => {
                return axios({
                    url: helpers.getUrl(res, apiEndpoint),
                    method: orestEndpoint.methods.get,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                            [`${queryParam}`]: `${orestEndpoint.operator.matching}${queryValue}`
                        }),
                        [`${orestEndpoint.global.limit}`]: 1,
                        [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true
                    },
                }).then((response) => {
                    if (response.status === 200 && response.data.data.length > 0) {
                        resv(response.data.data[0].foliono)
                    } else {
                        resv(false)
                    }
                }).catch((error)=>{
                    resv(false)
                })
            })
        }

        const saveCCPayTrans = async (savePayData) => {
            return new Promise((resv) => {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.ccpaytransIns),
                    method: orestEndpoint.methods.post,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                    data: {
                        accid: savePayData.accid,
                        ispaid: savePayData.transid ? true : false,
                        balancetotal: savePayData.paybalance,
                        paytotal: savePayData.transid ? savePayData.paybalance : 0,
                        //excrate: payData.excrate,
                        //currcredit: payData.paybalance,
                        //currencyid: payData.currencyid,
                        transdate: savePayData.transdate,
                        transtime: savePayData.transtime,
                        hotelrefno: helpers.getSettings(req, res, global.hotelrefno)
                    },
                }).then((response) => {
                    if (response.status === 200) {
                        resv(response.data.data.id)
                    } else {
                        resv(false)
                    }
                }).catch((error)=>{
                    resv(false)
                })
            })
        }

        const saveResPayTrans = async (payData) => {
            return new Promise((resv) => {
               return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.respaytransIns),
                    method: orestEndpoint.methods.post,
                    headers: helpers.getHeaders(req, res),
                   params: {
                       [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                   },
                   data: {
                        reservno: payData.reservno,
                        receiptno: payData.transid,
                        masterid: payData.refmid,
                        ccpayid: payData.ccpaytransid,
                        excrate: payData.excrate,
                        currcredit: payData.paybalance,
                        currencyid: payData.currencyid,
                        paytypeid: payData.cctypepayid,
                        paydate: payData.transdate,
                        transdate: payData.transdate,
                        transtime: payData.transtime,
                        hotelrefno: helpers.getSettings(req, res, global.hotelrefno)
                    },
                }).then((response) => {
                   if (response.status === 200) {
                       resv(true)
                   } else {
                       resv(false)
                   }
                }).catch((error)=>{
                   resv(false)
                })
            })
        }

        const saveAccTrans = async (payData) => {
            return new Promise((resv) => {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.acctransIns),
                    method: orestEndpoint.methods.post,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                    data: {
                        accid: payData.accid,
                        receiptno: payData.transid,
                        masterid: payData.refmid,
                        ccpayid: payData.ccpaytransid,
                        excrate: payData.excrate,
                        currcredit: payData.paybalance,
                        currencyid: payData.currencyid,
                        bankid: payData.bankid,
                        paydate: payData.transdate,
                        transdate: payData.transdate,
                        transtime: payData.transtime,
                        ispaid: orestEndpoint.global.true,
                        hotelrefno: helpers.getSettings(req, res, global.hotelrefno)
                    },
                }).then((response) => {
                    if (response.status === 200) {
                        resv(true)
                    } else {
                        resv(false)
                    }
                }).catch((error)=>{
                    resv(false)
                })
            })
        }

        const saveFolTrans = async (payData) => {
            return new Promise((resv) => {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.foltransIns),
                    method: orestEndpoint.methods.post,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                    data: {
                        foliono: payData.foliono,
                        receiptno: payData.transid,
                        masterid: payData.refmid,
                        ccpayid: payData.ccpaytransid,
                        excrate: payData.excrate,
                        currcredit: payData.paybalance,
                        currencyid: payData.currencyid,
                        transdate: payData.transdate,
                        transtime: payData.transtime,
                        hotelrefno: helpers.getSettings(req, res, global.hotelrefno)
                    },
                }).then((response) => {
                    if (response.status === 200) {
                        resv(true)
                    } else {
                        resv(false)
                    }
                }).catch((error)=>{
                    resv(false)
                })
            })
        }

        const reftableToStr = (tableName) =>{
            let val
            switch (tableName) {
                case 'RESERVAT':
                    val = "Reservation";
                    break;
                case 'ACCTRANS':
                    val = "Company";
                    break;
                case 'FOLIO':
                    val = "Folio";
                    break;
                case 'FOLTRANS':
                    val = "Folio Trans";
                    break;
            }

            return val
        }

        return await new Promise(async (resv) => {

            const getIbeNotifEmailEpay = async () => {
                return new Promise((resv) => {
                    return axios({
                        url: helpers.getUrl(res, orestEndpoint.api.settIbeNotifEmailEpay),
                        method: orestEndpoint.methods.get,
                        headers: helpers.getHeaders(req, res),
                    }).then((response) => {
                        if (response.status === 200 && response.data.data && response.data.count > 0 && response.data.data.res) {
                            return resv(response.data.data.res)
                        }  else {
                            return resv(false)
                        }
                    }).catch(()=>{
                        return resv(false)
                    })
                })
            }
            const getInfoPayData = await getPayInfo(req.body.gid)

            let responseMsg, errorMsg = false
            if(getInfoPayData.success === true){
                let infoPay = {
                    cardNumber: req.body.cardNumber,
                    cardCvc: req.body.cardCvc,
                    cardExpiry: req.body.cardExpiry,
                    reservno: getInfoPayData.reservno || null,
                    transno: getInfoPayData.transno || null,
                    paybalance: getInfoPayData.paybalance,
                    currency: getInfoPayData.currency,
                    email: getInfoPayData.email,
                    token: res.OREST_CACHE_TOKEN,
                    webkey: res.GENERAL_SETTINGS.WEBKEY,
                    ipaddress: requestIp.getClientIp(req)
                }

                const getPayInfo = await controllers.setPay(infoPay)
                const transdate = moment(Date.now()).locale(defaultLocale).format(orestEndpoint.dates.orestFullDateFormat)
                const transtime = moment(Date.now()).locale(defaultLocale).format(orestEndpoint.dates.fullTimeFormat)

                let savePayData = {
                    bankid: getPayInfo.bankid,
                    accid: getInfoPayData.accid,
                    transid: getPayInfo.transid,
                    orderid: getPayInfo.orderid,
                    reservno: getInfoPayData.reservno || false,
                    transno: getInfoPayData.transno || false,
                    refmid: getInfoPayData.refmid,
                    paybalance: getPayInfo.paycurrinfo && getPayInfo.paycurrinfo.res || getInfoPayData.paybalance,
                    currencyid: getPayInfo.paycurrinfo && getPayInfo.paycurrinfo.currid || getInfoPayData.currencyid,
                    excrate: getPayInfo.paycurrinfo && getPayInfo.paycurrinfo.excrate || 1,
                    transdate: transdate,
                    transtime: transtime,
                    reftablename: getInfoPayData.reftablename
                }

                let ccPayTransId = await saveCCPayTrans(savePayData)
                savePayData.ccpaytransid = ccPayTransId

                if(getPayInfo.success === true){

                    const ccPayTypeId = await getCCPayTypeId()
                    savePayData.cctypepayid = ccPayTypeId

                    let getSavePay
                    if(savePayData.reftablename === 'RESERVAT'){
                        getSavePay = await saveResPayTrans(savePayData)
                    }else if(savePayData.reftablename === 'ACCTRANS'){
                        getSavePay = await saveAccTrans(savePayData)
                    }else{
                        let folioNo =  await getFolioNo(savePayData.reftablename, getInfoPayData.transno || savePayData.refmid)
                        savePayData.foliono = folioNo
                        getSavePay = await saveFolTrans(savePayData)
                    }

                    if(getSavePay === true){

                        const getIbeFromName = async () => {
                            return new Promise((resv) => {
                                return axios({
                                    url: helpers.getUrl(res, orestEndpoint.api.settIbeFromName),
                                    method: orestEndpoint.methods.get,
                                    headers: helpers.getHeaders(req, res),
                                }).then((response) => {
                                    if (response.status === 200 && response.data.data && response.data.count > 0 && response.data.data.res) {
                                        return resv(response.data.data.res)
                                    } else {
                                        return resv(false)
                                    }
                                }).catch(()=>{
                                    return resv(false)
                                })
                            })
                        }
                        const getIbeFromEmail = async () => {
                            return new Promise((resv) => {
                                return axios({
                                    url: helpers.getUrl(res, orestEndpoint.api.settIbeFromEmail),
                                    method: orestEndpoint.methods.get,
                                    headers: helpers.getHeaders(req, res),
                                }).then((response) => {
                                    if (response.status === 200 && response.data.data && response.data.count > 0 && response.data.data.res) {
                                        return resv(response.data.data.res)
                                    }  else {
                                        return resv(false)
                                    }
                                }).catch(()=>{
                                    return resv(false)
                                })
                            })
                        }

                        const ibeFromName = await getIbeFromName()
                        const ibeFromMail = await getIbeFromEmail()
                        const ibeNotifEmailEpay = await getIbeNotifEmailEpay()

                        await axios({
                            url: res.GENERAL_SETTINGS.BASE_URL + 'api/ors/send/mail',
                            method: 'post',
                            params: {
                                hoteltoken: req.body.hoteltoken || res.OREST_CACHE_TOKEN,
                                hotelrefno: req.body.hotelrefno || res.GENERAL_SETTINGS.HOTELREFNO,
                            },
                            data: {
                                to: ibeNotifEmailEpay,
                                from: process.env.MAIL_SENDER_MAIL,
                                fromname: res.REDIS_WEBCMS_DATA.assets.meta.title,
                                templatecode: orestEndpoint.templates.cldEpaymentConfMailHtl,
                                langcode: 'en',
                                content: {
                                    invoicetitle: getInfoPayData.invtitle,
                                    invoicemail: getInfoPayData.email,
                                    invoiceno: getInfoPayData.reservno || getInfoPayData.transno,
                                    invoicetype: reftableToStr(getInfoPayData.reftablename),
                                    invoicetransid: getPayInfo.transid,
                                    invoictotalpayment: getInfoPayData.paybalance,
                                    invoicepaymentcurrency: getInfoPayData.currency
                                },
                            },
                        })

                        await axios({
                            url: res.GENERAL_SETTINGS.BASE_URL + 'api/ors/send/mail',
                            method: 'post',
                            params: {
                                hoteltoken: req.body.hoteltoken || res.OREST_CACHE_TOKEN,
                                hotelrefno: req.body.hotelrefno || res.GENERAL_SETTINGS.HOTELREFNO,
                            },
                            data: {
                                to: getInfoPayData.email,
                                from: ibeFromMail || process.env.MAIL_SENDER_MAIL,
                                fromname: ibeFromName || res.REDIS_WEBCMS_DATA.assets.meta.title,
                                templatecode: orestEndpoint.templates.cldEpaymentConfMailCli,
                                langcode: 'en',
                                content: {
                                    invoicetitle: getInfoPayData.invtitle,
                                    invoicemail: getInfoPayData.email,
                                    invoiceno: getInfoPayData.reservno || getInfoPayData.transno,
                                    invoicetype: reftableToStr(getInfoPayData.reftablename),
                                    invoicetransid: getPayInfo.transid,
                                    invoictotalpayment: getInfoPayData.paybalance,
                                    invoicepaymentcurrency: getInfoPayData.currency
                                },
                            },
                        })

                       return resv({
                            success: true,
                            msg: 'payment_success',
                            transid: getPayInfo.transid,
                            mail: getInfoPayData.email
                        })

                    }else{

                        responseMsg = {
                            success: true,
                            msg: 'payment_success',
                            transid: getPayInfo.transid,
                            mail: getInfoPayData.email
                        }

                        errorMsg = {
                            step: 'Payment Save',
                            stepmessage: 'The payment transaction has been made but not posted.',
                            stepdetails: JSON.stringify(savePayData)
                        }
                    }
                }else{

                    responseMsg = {
                        success: false,
                        msg: 'payment_transaction',
                        errormsg: getPayInfo.message
                    }

                    infoPay.cardNumber = helpers.creditCardMask(infoPay.cardNumber)
                    delete infoPay.cardCvc
                    delete infoPay.cardExpiry
                    delete infoPay.token
                    delete infoPay.webkey

                    errorMsg = {
                        step: 'Payment Transaction',
                        stepmessage: 'Bank Message: ' + getPayInfo.message,
                        stepdetails: JSON.stringify(infoPay)
                    }
                }
            }

            if (errorMsg) {
                const ibeNotifEmailEpay = await getIbeNotifEmailEpay()
                await axios({
                    url: res.GENERAL_SETTINGS.BASE_URL + 'api/ors/send/mail',
                    method: 'post',
                    params: {
                        hoteltoken: req.body.hoteltoken || res.OREST_CACHE_TOKEN,
                        hotelrefno: req.body.hotelrefno || res.GENERAL_SETTINGS.HOTELREFNO,
                    },
                    data: {
                        to: ibeNotifEmailEpay,
                        from: process.env.MAIL_SENDER_MAIL,
                        fromname: res.REDIS_WEBCMS_DATA.assets.meta.title,
                        templatecode: orestEndpoint.templates.cldEpaymentErrMailHtl,
                        langcode: 'en',
                        content: {
                            invoicetitle: getInfoPayData.invtitle,
                            invoicemail: getInfoPayData.email,
                            invoiceno: getInfoPayData.reservno || getInfoPayData.transno,
                            invoicetype: reftableToStr(getInfoPayData.reftablename),
                            invoictotalpayment: getInfoPayData.paybalance,
                            invoicepaymentcurrency: getInfoPayData.currency,
                            step: errorMsg.step,
                            stepmessage: errorMsg.stepmessage,
                            stepdetails: errorMsg.stepdetails,
                        },
                    },
                })
            }

            return resv(responseMsg)
        })
    },
    getHotelCheckPayment: async (req, res) => {
        return await new Promise(async (resv) => {

            const getPayInfo = async (gid) => {
                return new Promise((resv) => {
                    return axios({
                        url: helpers.getUrl(res, orestEndpoint.api.allaccInfoPay),
                        method: orestEndpoint.methods.put,
                        headers: helpers.getHeaders(req, res),
                        params: {
                            [`${orestEndpoint.params.gid}`]: gid,
                            [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                        },
                    }).then((response) => {
                            if (response.status === 200 && response.data.data.length > 0) {
                                let infoPay = response.data.data[0]
                                infoPay.success = true
                                resv(infoPay)
                            } else {
                                resv({ success: false })
                            }
                        },
                    ).catch((error) => {
                        resv({ success: false })
                    })
                })
            }

            const getBankPosId = async (ccno) => {
                return new Promise((resv) => {
                    return axios({
                        url: helpers.getUrl(res, orestEndpoint.api.ccardPayInfo),
                        method: orestEndpoint.methods.get,
                        headers: helpers.getHeaders(req, res),
                        params: {
                            [`${orestEndpoint.params.ccno}`]: `${ccno}`,
                            [`${orestEndpoint.global.force}`]: orestEndpoint.global.true
                        },
                    }).then((response) => {
                        if (response.status === 200 && response.data.data.length > 0) {
                            resv(response.data.data[0].bankposid)
                        } else {
                            resv(false)
                        }
                    }).catch(() => {
                        resv(false)
                    })
                })
            }

            let payInfo = await getPayInfo(req.body.gid)
            let bankPosId = await getBankPosId(req.body.cardNumber)

            const formatPrice = (amount, decimalCount = 2, decimal = ".", thousands = ",") => {
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
            }

            return await axios({
                url: helpers.getUrl(res, orestEndpoint.api.ccardPayCurr),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.amount}`]: `${payInfo.paybalance}`,
                    [`${orestEndpoint.params.currcode}`]: `${payInfo.currency}`,
                    [`${orestEndpoint.params.bincode}`]: `${req.body.cardNumber.slice(0, 6)}`,
                    [`${orestEndpoint.params.cctypecode}`]: `${req.body.cardType || ''}`,
                    [`${orestEndpoint.params.bankposid}`]: `${bankPosId}`,
                },
            }).then((response) => {
                if (response.status === 200 && response.data.data.length > 0) {
                    let responseData = response.data.data[0]
                    resv({
                        success: true,
                        payamount: formatPrice(responseData.res),
                        paycurr: responseData.currcode,
                        refid: req.body.cardNumber.slice(0, 6)
                    })
                } else {
                    resv({
                        success: false,
                    })
                }
            })
        })
    },
    getHotelPaymentType: async (req, res, sett) => {
        let uitoken = req.query.uitoken
            , bankIban = false
            , useTransferPay = false

        const makePaymentTypes = (paymentTypes) => {
            return paymentTypes.map((paymentType)=> {
                if(paymentType.isccpay && paymentType.iscredit){
                    return {
                        id: paymentType.id,
                        mid: paymentType.mid,
                        description: 'str_payByCreditDebitCard',
                        index: 1,
                        isdef: paymentType.isdef,
                        isccpay: true,
                        iscash: false,
                        istransfer: false,
                        ismailorder: false
                    }
                }else if(paymentType.iscash){
                    return {
                        id: paymentType.id,
                        mid: paymentType.mid,
                        description: 'str_payAtTheHotel',
                        index: 2,
                        isdef: paymentType.isdef,
                        isccpay: false,
                        iscash: true,
                        istransfer: false,
                        ismailorder: false
                    }
                }else if(paymentType.istransfer){
                    useTransferPay = true
                    return {
                        id: paymentType.id,
                        mid: paymentType.mid,
                        description: 'str_payByWireTransfer',
                        index: 3,
                        isdef: paymentType.isdef,
                        isccpay: false,
                        iscash: false,
                        istransfer: true,
                        ismailorder: false
                    }
                }else if(paymentType.isccpay && !paymentType.iscredit){
                    return {
                        id: paymentType.id,
                        mid: paymentType.mid,
                        description: 'str_mailOrder',
                        index: 4,
                        isdef: paymentType.isdef,
                        isccpay: false,
                        iscash: false,
                        istransfer: false,
                        ismailorder: true
                    }
                }
            })
        }

        const paymentTypes = await axios({
            url: helpers.getUrl(res, orestEndpoint.api.paytypeList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                    [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.global.true}`,
                    [`${orestEndpoint.params.isorsactive}`]: `${orestEndpoint.global.true}`,
                }),
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            if (response.status === 200 && response.data.data.length > 0) {
                return makePaymentTypes(response.data.data)
            } else {
                return false
            }
        }).catch(() => {
            return false
        })

        if (useTransferPay) {
            bankIban = await axios({
                url: helpers.getUrl(res, orestEndpoint.api.bankViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: `bankbranchid:notnull,isactive:true,iban!"",isself:true`,
                    [`${orestEndpoint.global.limit}`]: 6,
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then( (response) => {
                if (response.status === 200 && response.data.data.length > 0) {
                    return response.data.data.map((item) => {
                        return {
                            id: item.id,
                            bankname: item.bankname,
                            bankbranch: item.bankbranch,
                            currencycode: item.currencycode,
                            accountno: item.accountno,
                            iban: item.iban,
                            mid: item.mid,
                        }
                    })
                } else {
                    return []
                }
            }).catch(()=> {
                return []
            })
        }

        const filteredPaymentTypes = paymentTypes && paymentTypes.filter(function (el) {
            return el != null;
        }) || []

        const cacheKey = getRedisKey(sett.serverCacheKey, uitoken, redisSuffixKeys.hotelPaymentType)
        try {
            await useRedis.set(cacheKey, JSON.stringify(filteredPaymentTypes))
        }catch (e) {
            return {
                paymentypes: [],
                bankiban: []
            }
        }

        return {
            paymentypes: filteredPaymentTypes,
            bankiban: bankIban
        }
    },
    hotelNotifWarnMsg: async (req, res) => {
        const
            mid = req.query.mid,
            langcode = req.query.langcode

        const getRanoteViewList = (mid, langcode) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.ranoteViewList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.masterid}`]: mid,
                        [`${orestEndpoint.params.gcode}`]: langcode,
                    }),
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                },
            }).then((response) => {
                if (response.status === 200 && response.data.data.length > 0) {
                    return response.data.data[0]
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getWarnMsg = await getRanoteViewList(mid, langcode)
        if(!getWarnMsg){
            return {
                success: false
            }
        }

        return {
            success: true,
            data: {
                warning: getWarnMsg.note || ''
            }
        }
    },
    getGuestEmailValid: async (req, res) => {
        const email = req.body.email

        if (!email) {
            return {
                success: false,
                isValid: false
            }
        }

        const getValidateEmail = (email) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsValidateEmail),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: email,
                    [`${orestEndpoint.params.verify}`]: orestEndpoint.global.true,
                },
            }).then((response) => {
                return !(response.data.data && response.data.data.verificationStatuses[0] && response.data.data.verificationStatuses[0].statusType === 'RED')
            }).catch(() => {
                return false
            })
        }

        const isClientEmailExits = (email) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientEmailExists),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: email
                },
            }).then((response) => {
                return response.data && response.data.data.res
            }).catch(() => {
                return false
            })
        }

        let validateEmail = await getValidateEmail(email)
        const clientEmailExits = await isClientEmailExits(email)

        return {
            success: true,
            validation: validateEmail || false,
            exits: clientEmailExits || false,
        }
    },
    hotelBookInfoConfirm: async (req, res, sett) => {

        const request = req.body,
            langcode = request.langcode,
            uitoken = request.uitoken,
            reservations = request.selectedRooms,
            isGroup = reservations && reservations.length > 1,
            contactInfo = request.contactInfo,
            paymentType = request.paymentType,
            clientPassword = request.clientPassword === 'false' ? false : request.clientPassword,
            isCcPay = request.isCcPay,
            isMailOrder = request.isMailOrder,
            ccInfo = request.ccInfo,
            nowDate = Date.now(),
            resDate = moment(nowDate).locale(defaultLocale).format(orestEndpoint.dates.orestFullDateFormat),
            clienttoken = request.clienttoken,
            continueWithoutClientRecord = request?.continueWithoutClientRecord || false,
            flyTransferReq = request.flyTransfer,
            flyTransferReturnReq = request.flyTransferReturn

        let clientId = request.clientID,
            groupReservNo = 0,
            groupReservGid = false,
            updateDataFoReservations = false,
            reservationsInfo = false,
            reservationTotalPrice = 0,
            reservationCurrencyId = '',
            otherGuestInformation = false

        //The booking info information recorded for the relevant guest is getting from redis
        const hotelBookInfoKey = getRedisKey(sett.serverCacheKey, uitoken, redisSuffixKeys.hotelBookInfo)
        let hotelBookInfo = await useRedis.getCacheById(hotelBookInfoKey)

        if (!Boolean(hotelBookInfo)) {
            return {
                success: false,
                msgcode: errorCodes.timeOut,
            }
        } else {
            hotelBookInfo = JSON.parse(hotelBookInfo)
        }

        //The payment type info information recorded for the relevant guest is getting from redis
        const hotelPaymentTypeKey = getRedisKey(sett.serverCacheKey, uitoken, redisSuffixKeys.hotelPaymentType)
        let hotelPaymentType = await useRedis.getCacheById(hotelPaymentTypeKey)

        if (!Boolean(hotelPaymentType)) {
            return {
                success: false,
                msgcode: errorCodes.timeOut,
            }
        } else {
            hotelPaymentType = JSON.parse(hotelPaymentType)
        }

        const filterHotelPaymentType = hotelPaymentType.filter((item) => item[paymentType])
        if(!(filterHotelPaymentType.length > 0)){
            return {
                success: false,
                msgcode: 'invalid_payment_type',
            }
        }

        const getHotelAdvPayDesc = (paymentType) => {
            switch (paymentType) {
                case 'isccpay':
                    return 'Pay by Credit/Debit Card'
                case 'iscash':
                    return 'Pay at the Hotel'
                case 'istransfer':
                    return `Pay by Wire Transfer`
                case 'ismailorder':
                    return 'Pay by Mail-Order'
                default:
                    return '-'
            }
        }

        const reservationInfos = (reservations) => {
            let totalPax = 0, totalChd = 0
            reservations.map((item) => {
                totalPax = totalPax + Number(item.totalpax)
                totalChd = totalChd + Number(item.totalchd)
            })

            return {
                totalPax: totalPax,
                totalChd: totalChd
            }
        }

        const getSurveyLocId = () => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.surveyLocWeb),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200 && response.data && response.data.data && response.data.data[0].res) {
                    return response.data.data[0].res
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getDataPolicyId = () => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.prvconfDataPolicy),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200 && response.data && response.data.data.res) {
                    return response.data.data.res
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getDataPrefId = () => {
           return axios({
                url: helpers.getUrl(res, orestEndpoint.api.prvconfPref),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
               if (response.status === 200 && response.data && response.data.data.res) {
                   return response.data.data.res
               } else {

                   return false
               }
            }).catch(() => {
               return false
           })
        }

        const generateGuestsPermissionsData = async (guestsData) => {
            const locationId = await getSurveyLocId()
            const dataPolicyId = await getDataPolicyId()
            const dataPrefId = await getDataPrefId()

            let guestsPermissionsData = []
            guestsData.map((client) => {
                guestsPermissionsData.push({
                    accid: client.id,
                    prvconfid: dataPolicyId || null,
                    isok: true,
                    locid: locationId,
                    hotelrefno: helpers.getSettings(req, res, global.hotelrefno)
                }, {
                    accid: client.id,
                    prvconfid: dataPrefId || null,
                    isok: true,
                    locid: locationId,
                    hotelrefno: helpers.getSettings(req, res, global.hotelrefno)
                })
            })

            return guestsPermissionsData
        }

        const savePermissionsForGuest = (guestsPermissionsData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.prvtransListIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: guestsPermissionsData,
            }).then(() => {
                return true
            }).catch(() => {
                return false
            })
        }

        const getGuestInfoData = (clientID) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientGetById),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res, clienttoken, true),
                params: {
                    [`${orestEndpoint.params.key}`]: clientID,
                    [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true
                }
            }).then((response) => {
                if (response.status === 200) {
                    return response.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const generateGuestsData = (reservations) => {
            return new Promise((resolve) => {
                let requestClientsDatas = []
                //create array to record clients in the reservation
                reservations.map((room, roomIndex) => {
                    room.guestList.map((pax, paxIndex) => {
                        if (clientId && roomIndex !== 0 && paxIndex === 0 || !clientId && paxIndex === 0) {
                            const defClientData =  {
                                firstname: pax.firstName.value,
                                lastname: pax.lastName.value,
                                email: pax.mail.value,
                                birthdate: pax.birthDate.value,
                                mobiletel: helpers.mobileTelNoFormat(pax.phone.value),
                                healthcode: pax.healthcode.value,
                                hotelrefno: helpers.getSettings(req, res, global.hotelrefno),
                            }

                            requestClientsDatas.push(defClientData)
                        }
                    })
                })
                resolve(requestClientsDatas)
            })
        }

        const createNewGuests = (clientsData) => {
            let useClientMail = ''
            if (continueWithoutClientRecord) {
                useClientMail = clientsData[0].email
                clientsData[0].email = null
            }

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientListIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: clientsData,
            }).then((response) => {
                if (response.status === 200) {
                    if (continueWithoutClientRecord) {
                        response.data.data[0].email = useClientMail
                    }
                    return response.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const createUserForContactGuest = (clientID) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.clientLoginId),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.id}`]: `${clientID}`,
                    [`${orestEndpoint.params.force}`]: `${orestEndpoint.global.true}`,
                },
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const setPasswordToUser = (email, password) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsUserPassword),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.email}`]: email,
                    [`${orestEndpoint.params.pass}`]: password,
                    [`${orestEndpoint.params.sendmsg}`]: `${orestEndpoint.global.false}`,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getContactTypeForIbeCcPayId = () => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.contacTypeList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                        [`${orestEndpoint.params.ispay}`]: `${orestEndpoint.global.true}`,
                        [`${orestEndpoint.params.isemail}`]: `${orestEndpoint.global.true}`,
                        [`${orestEndpoint.params.isactive}`]: `${orestEndpoint.global.true}`,
                    }),
                },
            }).then((response) => {
                if (response?.data?.data[0]?.id) {
                    return response.data.data[0].id
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const generateContactTypeData = (guestDetails, reservationDetails, contacTypeId) => {
            return {
                clientid: guestDetails.id,
                fullname: guestDetails.fullname,
                email: guestDetails.email,
                mobiletel: guestDetails.mobiletel,
                contacttypeid: contacTypeId,
                masterid: guestDetails.mid
            }
        }

        const createNewContact = (clientsData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.contactIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: clientsData,
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const createGroupReservation = (contact, reservations, agencyId) => {
            const reservationInfoData = reservationInfos(reservations)

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.resmasterIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: {
                    status: isCcPay ? 'T' : 'A',
                    contact: (contact.firstName.value + ' ' + contact.lastName.value),
                    totalpax: reservationInfoData.totalPax,
                    totalchd: reservationInfoData.totalChd,
                    resdate: resDate,
                    checkin: reservations[0].checkin,
                    checkout: reservations[0].checkout,
                    agencyid: agencyId,
                    advpaynote: getHotelAdvPayDesc(paymentType),
                    hotelrefno: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200) {
                    return {
                        reservno: response.data.data.reservno,
                        gid: response.data.data.gid
                    }
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const updateGroupReservationPrice = (reservationTotalPrice, reservationCurrencyId, groupReservGid) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.resmasterListPatch),
                method: orestEndpoint.methods.patch,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: [{
                    subtotal: reservationTotalPrice,
                    pricecurrid: reservationCurrencyId || hotelBookInfo.currencyid,
                    excrate: 1,
                    gid: groupReservGid,
                }],
            }).then((response) => {
                return response.status === 200;
            }).catch(() => {
                return false
            })
        }

        const generateUpdateDataFoReservations = (guestsData, reservations, groupReservNo) => {
            return new Promise((resolve) => {
                let requestRoomPatchDatas = []
                reservations.map((room, roomIndex) => {
                    requestRoomPatchDatas.push({
                        status: isCcPay ? 'T' : 'A',
                        resmasterno: groupReservNo,
                        clientid: guestsData[roomIndex].id,
                        firstname: guestsData[roomIndex].firstname,
                        lastname: guestsData[roomIndex].lastname,
                        birthdate: guestsData[roomIndex].birthdate,
                        email:  guestsData[roomIndex].email,
                        gid: room.gid,
                        note: room.guestList[0].note.value || '',
                        agencyid: hotelBookInfo.agencyid,
                        advpaynote: !groupReservNo && getHotelAdvPayDesc(paymentType) || '',
                        hotelrefno: helpers.getSettings(req, res, global.hotelrefno),
                    })
                })
                resolve(requestRoomPatchDatas)
            })
        }

        const updateReservations = (reservatData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.reservatListPatch),
                method: orestEndpoint.methods.patch,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: reservatData,
            }).then((response) => {
                if (response.status === 200 && response.data.success) {
                    return response.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const generateOtherGuestInformation = (reservations) => {
            return new Promise((resolve) => {
                let requestResNameDatas = []
                //create array to record other guests in the reservation
                reservations.map((room) => {
                    room.guestList.map((pax, paxIndex) => {
                        let paxNo = paxIndex + 1
                        if (paxNo > 1) {
                            requestResNameDatas.push({
                                reservno: room.reservno,
                                firstname: pax.firstName.value,
                                lastname: pax.lastName.value,
                                email: pax.mail.value,
                                birthdate: pax.birthDate.value,
                                paxno: paxNo,
                                isactive: orestEndpoint.global.true,
                                hotelrefno: helpers.getSettings(req, res, global.hotelrefno),
                            })
                        }
                    })
                })
                resolve(requestResNameDatas)
            })
        }

        const saveOtherGuestInformation = (resNameData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.resnameListIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: resNameData,
            }).then((response) => {
                return response.status === 200;
            }).catch(() => {
                return false
            })
        }

        const getReservationTotalPrice = (reservationsInfo) => {
            return new Promise((resolve) => {
                let totalPrice = 0
                reservationsInfo.map((item) => {
                    totalPrice = totalPrice + item.totalprice
                })
                resolve(totalPrice)
            })
        }

        const getReservationCurrencyId = (reservationsInfo) => {
            return new Promise((resolve) => {
                reservationsInfo.map((item) => {
                    if(item.pricecurrid){
                        resolve(item.pricecurrid)
                    }
                })
            })
        }

        const generateCcardData = (clientId, ccInfo) => {
            const parseDate = ccInfo.cardExpiry.split("/")
            const month = parseDate[0]
            const year = parseDate[1].slice(-2)
            const fullDate = `20${year}-${month}-01`

            return {
                accid: clientId,
                crcardcvc: ccInfo.cardCvc.replace(/\s/g, ''),
                crcardexpiredate: fullDate,
                crcardexpiremonth: month,
                crcardexpireyear: year,
                crcardholder: ccInfo.cardOwner,
                crcardno: ccInfo.cardNumber.replace(/\s/g, ''),
            }
        }

        const setCcardInfo = (cCardData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.cCardIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: cCardData
            }).then((response) => {
                return response.status === 200;
            }).catch(() => {
                return false
            })
        }

        const sendAReservationConfirmationMailToTheGuest = (data, flyTransferDataset) => {
            let params = new URLSearchParams()
            params.append(orestEndpoint.params.gid, data.gid)
            params.append(orestEndpoint.params['file.query'], `code::${data.templateCodeForCli},langcode:${data.guestlangcode}`)
            params.append(orestEndpoint.params.sendername, data.sendername)
            params.append(orestEndpoint.params.senderemail, data.senderemail)
            params.append(orestEndpoint.params.subject, data.guestsubject)
            params.append(orestEndpoint.params.receivername, data.receivername)
            params.append(orestEndpoint.params.receiveremail, data.receiveremail)
            params.append(orestEndpoint.global.sort, 'hotelrefno-')
            params.append(orestEndpoint.global.allhotels, orestEndpoint.global.true)
            params.append(orestEndpoint.params.outputtype, orestEndpoint.fileType.html)
            const dataSet = JSON.stringify({
                dataset: Object.assign({
                    guestLoginUrl: data.guestLoginUrl,
                }, Object.keys(flyTransferDataset).length > 0 ? {
                    flyTransfer: JSON.stringify(flyTransferDataset),
                } : {}),
            })

            return axios({
                url: helpers.getUrl(res, data.isgroup ? orestEndpoint.api.resmasterEmailForm : orestEndpoint.api.reservatEmailForm),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: params,
                data: dataSet
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const sendAReservationConfirmationMailToTheHotel = (data, flyTransferDataset) => {
            let params = new URLSearchParams()
            params.append(orestEndpoint.params.gid, data.gid)
            params.append(orestEndpoint.params['file.query'], `code::${data.templateCodeForHtl},langcode:${data.hotellangcode}`)
            params.append(orestEndpoint.params.sendername, data.sendername)
            params.append(orestEndpoint.params.senderemail, data.senderemail)
            params.append(orestEndpoint.params.subject, data.hotelsubject)
            params.append(orestEndpoint.params.receivername, data.sendername)
            if (data.hotelreceiveremail.includes(',')) {
                data.hotelreceiveremail.split(/\s*,\s*/).forEach((recEmail) => {
                    params.append(orestEndpoint.params.receiveremail, recEmail)
                })
            } else {
                params.append(orestEndpoint.params.receiveremail, data.hotelreceiveremail)
            }
            params.append(orestEndpoint.global.sort, 'hotelrefno-')
            params.append(orestEndpoint.global.allhotels, orestEndpoint.global.true)
            params.append(orestEndpoint.params.outputtype, orestEndpoint.fileType.html)

            const dataSet = flyTransferDataset ? JSON.stringify({
                dataset: {
                    flyTransfer: JSON.stringify(flyTransferDataset),
                }
            }) : false

            return axios({
                url: helpers.getUrl(res, data.isgroup ? orestEndpoint.api.resmasterEmailForm : orestEndpoint.api.reservatEmailForm),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: params,
                data: dataSet
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getFlyTransferPriceCalcParams = ({flyTransfer}) => {
            if (flyTransfer.isreturn) {
                return {
                    arportid: 0,
                    deportid: flyTransfer.airportid,
                    departdate: flyTransfer.flydate,
                    vehicleid: flyTransfer.vehicleid,
                }
            } else {
                return {
                    deportid: 0,
                    arportid: flyTransfer.airportid,
                    arrivaldate: flyTransfer.flydate,
                    vehicleid: flyTransfer.vehicleid,
                }
            }
        }

        const getFlyTransferPriceCalc = (params) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.flyTransferPriceCalc),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params
            }).then((flyTransferPriceCalcResponse) => {
                if (flyTransferPriceCalcResponse.status === 200 && flyTransferPriceCalcResponse?.data?.data) {
                    return flyTransferPriceCalcResponse.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const generateFlyTransferData = ({ reservation, flyTransfer, flyTransferPrice, paymentType }) => {
            return {
                reservno: reservation.reservno,
                totalpax: reservation.totalpax,
                totalchd: reservation. totalchd,
                airportid: flyTransfer.airportid,
                airline: flyTransfer.airline,
                flydate: flyTransfer.flydate,
                flytime: flyTransfer.flytime,
                flightno: flyTransfer.flightno,
                vehicleid: flyTransfer.vehicleid,
                note: flyTransfer.note,
                isdepart: flyTransfer.isreturn,
                totalprice: flyTransferPrice.res,
                pricecurrid: flyTransferPrice.pricecurrid,
                advpaynote: getHotelAdvPayDesc(paymentType),
                hotelrefno: helpers.getSettings(req, res, global.hotelrefno)
            }
        }

        const createFlyTransfer = (data) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.flytransferIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data
            }).then((flytransferInsResponse) => {
                if (flytransferInsResponse.status === 200 && flytransferInsResponse?.data?.data) {
                    return flytransferInsResponse.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getFlyTransferInfo = (gid) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.flytransferViewGet),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.gid}`]: gid,
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200 && response.data.success) {
                    return response.data && response.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        let guestsData = [], guestInfoData
        //A client record is created with guest information with Contact Info.
        const guestsInsData = await generateGuestsData(reservations)

        if(guestsInsData){
            guestsData = await createNewGuests(guestsInsData)
        }

        if (clientId) {
            guestInfoData = await getGuestInfoData(clientId)
            if(guestsData && guestsData.length > 0){
                guestsData = [guestInfoData].concat(guestsData)
            }else{
                guestsData = guestsData.concat(guestInfoData)
            }
        }

        //If there is more than one reservation, a group reservation record is created.
        if (isGroup) {
            const getGroupReservation = await createGroupReservation(contactInfo, reservations, hotelBookInfo.agencyid)
            groupReservNo = getGroupReservation.reservno
            groupReservGid = getGroupReservation.gid
        }

        //Guest information and reservation records are merged.
        updateDataFoReservations = await generateUpdateDataFoReservations(guestsData, reservations, groupReservNo)
        reservationsInfo = await updateReservations(updateDataFoReservations)
        reservationTotalPrice = await getReservationTotalPrice(reservationsInfo)
        reservationCurrencyId = await getReservationCurrencyId(reservationsInfo)

        //If other guests are present, it is saved.
        otherGuestInformation = await generateOtherGuestInformation(reservations)
        if (otherGuestInformation && otherGuestInformation.length > 0) {
            await saveOtherGuestInformation(otherGuestInformation)
        }

        if(isGroup){
            await updateGroupReservationPrice(reservationTotalPrice, reservationCurrencyId, groupReservGid)
        }

        if(isMailOrder && ccInfo){
            const cCardData = generateCcardData(guestsData[0].id, ccInfo)
            await setCcardInfo(cCardData)
        }

        //Save guest permissions
        const guestsPermissionsData = await generateGuestsPermissionsData(guestsData)
        await savePermissionsForGuest(guestsPermissionsData)

        //Create login user for guest
        if(!clientId && clientPassword){
            await createUserForContactGuest(guestsData[0].id)
            await setPasswordToUser(guestsData[0].email, clientPassword)
        }

        if(continueWithoutClientRecord){
            const contactTypeForIbeCcPayId = await getContactTypeForIbeCcPayId()
            const contactData = await generateContactTypeData(guestsData[0], reservationsInfo[0], contactTypeForIbeCcPayId)
            await createNewContact(contactData)
        }

        let flyTransferDataset = {}
        if(flyTransferReq){
            const flyTransferPriceCalcParams = getFlyTransferPriceCalcParams({flyTransfer: flyTransferReq})
            const flyTransferPrice = await getFlyTransferPriceCalc(flyTransferPriceCalcParams)

            const flyTransferData = generateFlyTransferData({ reservation: reservationsInfo[0], flyTransfer: flyTransferReq, flyTransferPrice: flyTransferPrice, paymentType: paymentType })
            const flyTransfer = await createFlyTransfer(flyTransferData)
            const flyTransferInfo = await getFlyTransferInfo(flyTransfer.gid)
            flyTransferDataset.arrival = {'airport': flyTransferInfo.airport, 'date': flyTransferInfo.flydate, 'time': flyTransferInfo.flytime, 'price': flyTransferInfo.totalprice, 'currency': flyTransferInfo.pricecurrcode}
        }

        if(flyTransferReturnReq){
            const flyTransferPriceCalcParams = getFlyTransferPriceCalcParams({flyTransfer: flyTransferReturnReq})
            const flyTransferPrice = await getFlyTransferPriceCalc(flyTransferPriceCalcParams)

            const flyTransferData = generateFlyTransferData({ reservation: reservationsInfo[0], flyTransfer: flyTransferReturnReq, flyTransferPrice: flyTransferPrice, paymentType: paymentType })
            const flyTransfer = await createFlyTransfer(flyTransferData)
            const flyTransferInfo = await getFlyTransferInfo(flyTransfer.gid)
            flyTransferDataset.deport = {'airport': flyTransferInfo.airport, 'date': flyTransferInfo.flydate, 'time': flyTransferInfo.flytime, 'price': flyTransferInfo.totalprice, 'currency': flyTransferInfo.pricecurrcode}
        }

        const getGuestLoginUrl = (guestsData, clientPass) => {
            if(clientPass){
                return `${res.GENERAL_SETTINGS.BASE_URL}guest/login?email=${guestsData.email}&pass=${clientPass}&lang=${req.body.langcode || 'en'}`
            }
            return `${res.GENERAL_SETTINGS.BASE_URL}guest/login?lang=${req.body.langcode || 'en'}`
        }

        if(!isCcPay){
            //If it is not payment by credit card, confirmation e-mails are sent.
            //Because when there is a credit card, the payment service is activated and if the payment process is successful, a confirmation mail is sent after the payment record.
            const generateEmailData = () => {
                const useHotelLangCode = sett.global.hotelLocalLangGCode || 'en'
                const useLangCode = langcode || 'en'
                const reservNo = Boolean(groupReservNo) ? groupReservNo : reservations[0].reservno
                let subjectArray = {
                    'en': `New Reservation Notification - #${reservNo}`,
                    'tr': `Yeni Rezervasyon Bildirimi - #${reservNo}`,
                    'de': `Neue Reservierungsbenachrichtigung - #${reservNo}`,
                    'ru': `Уведомление о новом бронировании - #${reservNo}`,
                    'es': `Notificación de nueva reserva - #${reservNo}`,
                    'mk': `Известување за нова резервација - #${reservNo}`,
                    'sq': `Njoftim për Rezervim të Ri - #${reservNo}`,
                    'ar': "إشعار حجز جديد"
                }

                return {
                    isgroup: !!isGroup,
                    gid: isGroup ? groupReservGid : reservations[0].gid,
                    templateCodeForCli: isGroup ? orestEndpoint.templates.cldIbeConfMailGrpCli : orestEndpoint.templates.cldIbeConfMailSngCli,
                    templateCodeForHtl: isGroup ?  orestEndpoint.templates.cldIbeConfMailGrpHtl : orestEndpoint.templates.cldIbeConfMailSngHtl,
                    guestlangcode: useLangCode,
                    guestsubject: subjectArray[useLangCode],
                    hotellangcode: useHotelLangCode,
                    hotelsubject: subjectArray[useHotelLangCode],
                    sendername: sett.global.hotelSettings.from_name || sett.webSiteData.assets.meta.title,
                    senderemail: sett.global.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    receivername: guestsData[0].fullname,
                    receiveremail: guestsData[0].email,
                    hotelreceiveremail: sett.global.hotelSettings.notifemail_conf,
                    guestLoginUrl: getGuestLoginUrl(guestsData[0], clientPassword)
                }
            }

            //Send confirmation emails for Guest and Hotel
            const emailData = generateEmailData()
            await sendAReservationConfirmationMailToTheHotel(emailData, flyTransferDataset)
            await sendAReservationConfirmationMailToTheGuest(emailData, flyTransferDataset)
        }

        return {
            success: true,
            payGid: isCcPay ? isGroup ? groupReservGid : reservations[0].gid : false,
            reservno: Boolean(groupReservNo) ? groupReservNo : reservations[0].reservno,
            isGroupReservation: Boolean(groupReservNo),
        }

    },
    getPaymentInstallment: async (req, res, sett) => {
        let gid = req.query.gid, ccno = req.query.ccno
        if(!gid){
            return {
                success: false,
                processMsg: 'gid_empty'
            }
        }

        if(!ccno){
            return {
                success: false,
                processMsg: 'ccno_empty'
            }
        }

        const getPaymentDetails = (gid) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.allaccInfoPay),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.gid}`]: gid,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200 && response.data.success) {
                    return response.data && response.data.data && response.data.data[0]
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getPaymentInstallment = async (ccno, payBalance, currency) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.ccardPayPaymentList),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.ccno}`]: ccno,
                    [`${orestEndpoint.params.payment}`]: payBalance,
                    [`${orestEndpoint.global.sort}`]: 'intrate-',
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response?.data?.data) {
                    return response.data.data.map((instData, indexId) => {
                        return {
                            currency: currency,
                            instcount: instData.instcount,
                            ccinstid: instData?.ccinstid || indexId,
                            instamountfrt: helpers.formatMoney(instData.instamount),
                            totalamountfrt: helpers.formatMoney(instData.totalamount),
                            instamount: instData.instamount,
                            totalamount: instData.totalamount
                        }
                    })
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const paymentDetails = await getPaymentDetails(gid)
        if(!paymentDetails){
            return {
                success: false,
                processMsg: 'payment_details_empty'
            }
        }

        const installmentInformation = await getPaymentInstallment(ccno, paymentDetails.paybalance, paymentDetails.currency)
        if(!installmentInformation){
            return {
                success: false,
                processMsg: 'installment_information_empty'
            }
        }

        const cacheKey = getRedisKey(sett.serverCacheKey, (gid + ccno + paymentDetails.paybalance + paymentDetails.currency), redisSuffixKeys.instInfo)
            , installmentInformationResultStr = JSON.stringify(installmentInformation)
        await useRedis.set(cacheKey, installmentInformationResultStr)
        await useRedis.expire(cacheKey, redisCacheTime.doPayment)

        return {
            success: true,
            gid: gid,
            instGid: cacheKey,
            installmentInformation: installmentInformation
        }
    },
    getPaymentInformation: async (req, res) => {
        let gid = req.query.gid, isReservation = false
        if(!gid){
            return {
                success: false,
                processMsg: 'gid_empty'
            }
        }

        const getPaymentDetails = (gid) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.allaccInfoPay),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.gid}`]: gid,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200 && response.data.success) {
                    return response.data && response.data.data && response.data.data[0]
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getReservatInfo = (gid) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.reservatViewGet),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.gid}`]: gid,
                    [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200 && response.data.success) {
                    return response.data && response.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getAllAccInfo = (accid) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.allaccInfo),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.accid}`]: accid,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200 && response.data.success) {
                    return response.data && response.data.data[0]
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getInvoiceInformation = async (paymentDetails) => {
            if(paymentDetails.reftablename === 'RESERVAT' || paymentDetails.reftablename === 'RESNAME'){
                isReservation = true
                return await getReservatInfo(paymentDetails.refgid)
            }else{
                return await getAllAccInfo(paymentDetails.accid)
            }
        }

        const paymentDetails = await getPaymentDetails(gid)
        if(!paymentDetails){
            return {
                success: false,
                processMsg: 'payment_details_empty'
            }
        }

        const invoiceInformation = await getInvoiceInformation(paymentDetails)
        if(!invoiceInformation){
            return {
                success: false,
                processMsg: 'invoice_information_empty'
            }
        }

        const paymentDetailsFilter = {
            invtitle: paymentDetails.invtitle,
            reftablename: paymentDetails.reftablename,
            refid: paymentDetails.refid,
            reservno: paymentDetails.reservno,
            transno: paymentDetails.transno,
            foliono: paymentDetails.foliono,
            paybalance: paymentDetails.paybalance,
            currency: paymentDetails.currency,
            email: paymentDetails.email,
        }

        const invoiceInformationFilter = {
            fullname: invoiceInformation.fullname,
            resdate: invoiceInformation.resdate,
            checkin: invoiceInformation.checkin,
            checkout: invoiceInformation.checkout,
            totalpax: invoiceInformation.totalpax,
            totalchd1: invoiceInformation.totalchd1,
            totalchd2: invoiceInformation.totalchd2,
            totalprice: invoiceInformation.totalprice,
            boardtypedesc: invoiceInformation.boardtypedesc,
            pricecurrcode: invoiceInformation.pricecurrcode,
        }

        return {
            success: true,
            gid: gid,
            isReservation: isReservation,
            paymentDetails: paymentDetailsFilter,
            invoiceInformation: invoiceInformationFilter
        }
    },
    doPayment: async (req, res, sett) => {
        let gid = req.query.gid,
            paymentRange = Number(req.query.paymentRange) === 1 && 11 || 1,
            ccInfo = req.body
        const useHotelDateTime = await getHotelDateTime(req, res) || false,
              transdate = useHotelDateTime?.workdate || moment(Date.now()).locale(defaultLocale).format(orestEndpoint.dates.orestFullDateFormat),
              transtime = useHotelDateTime?.worktime || moment(Date.now()).locale(defaultLocale).format(orestEndpoint.dates.fullTimeFormat)

        const getTransactionProvider = (tableName) => {
            switch (tableName) {
                case 'RESNAME':
                    return 'Sub Reservation'
                case 'RESERVAT':
                    return 'Reservation'
                case 'RESMASTER':
                    return 'Group Reservation'
                case 'ACCTRANS':
                    return 'Company'
                case 'FOLIO':
                    return 'Folio'
                case 'FOLTRANS':
                    return 'Folio Trans'
                case 'SPTRANS':
                    return 'Offers'
                case 'INVOICE':
                    return 'Invoice'
                default:
                    return 'Undefined'
            }
        }

        const getPaymentDetails = (gid) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.allaccInfoPay),
                method: orestEndpoint.methods.put,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.gid}`]: gid,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200 && response.data.success) {
                    return response.data && response.data.data && response.data.data[0]
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const createCCPayTrans = (insData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.ccpaytransIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: {
                    balancetotal: insData.balancetotal * paymentRange,
                    currid: insData.currid,
                    accid: insData.accid,
                    isdone: false,
                    transdate: insData.transdate,
                    transtime: insData.transtime,
                    masterid: insData.masterid,
                    instcount: insData.instcount,
                    hotelrefno: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200) {
                    return response.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const paymentDetails = await getPaymentDetails(gid)
        if (!paymentDetails) {
            return {
                success: false,
                processMsg: 'payment_details_empty',
            }
        }

        const installmentCacheKey = getRedisKey(sett.serverCacheKey, (gid + ccInfo.cardNumber + paymentDetails.paybalance + paymentDetails.currency), redisSuffixKeys.instInfo)
            , installmentInformationResultStr = await useRedis.getCacheById(installmentCacheKey) || false
            , installmentInformationResult = installmentInformationResultStr && JSON.parse(installmentInformationResultStr) || false

        let installmentData = { totalamount: false, currency: false, instcount: false }
        if(ccInfo?.ccInstId && installmentInformationResult && installmentInformationResult.length > 1){
            const getInstInfo = installmentInformationResult.find(instInfo => String(instInfo.ccinstid) === String(ccInfo.ccInstId))
            if(getInstInfo){
                installmentData.totalamount = getInstInfo.totalamount
                installmentData.currency = getInstInfo.currency
                installmentData.instcount = getInstInfo.instcount
            }
        }else{
            installmentData.totalamount = paymentDetails.paybalance
            installmentData.currency = paymentDetails.currency
            installmentData.instcount = 0
        }

        const generateErrorMailData = (paymentDetails, errorMsg) => {
            return {
                transactiondate: errorMsg.timestamp || '-',
                invoicetitle: paymentDetails.invtitle || '-',
                invoicemail: paymentDetails.email || '-',
                refno: paymentDetails.refid || paymentDetails.reservno || paymentDetails.transno || paymentDetails.foliono || '',
                reftype: getTransactionProvider(paymentDetails.reftablename),
                errormsg: errorMsg.message || '-',
                paymentprovider: errorMsg.path || '-',
            }
        }

        const paymentTransactionErrorNotificationForHotel = (emailData) => {
            return useMail.send(req, res, {
                    code: orestEndpoint.templates.cldEpaymentErrMailHtl,
                    sendername: res.GENERAL_SETTINGS.hotelSettings.from_name || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: res.GENERAL_SETTINGS.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    langcode: req.body.langcode || 'en',
                    subject: 'An error occurred during the payment transaction',
                    receivername: res.GENERAL_SETTINGS.hotelSettings.from_name || sett.REDIS_WEBCMS_DATA.assets.meta.title,
                    receiveremail: res.GENERAL_SETTINGS.hotelSettings.notifemail_epay,
                }, emailData,
            )
        }

        const generateDoPaymentData = (ccInfo, paymentDetails, getCCPayTrans, installmentData) => {
            return {
                cardholder: encodeURIComponent(ccInfo.cardOwner),
                ccno: ccInfo.cardNumber.replace(/\s/g, ''),
                expdate: ccInfo.cardExpiry.substring(0, 2) + ccInfo.cardExpiry.slice(-2),
                cvc: ccInfo.cardCvc.substring(0, 4),
                cctype: ccInfo.cardNumber && creditCardType(ccInfo.cardNumber.replace(/\s/g, ''))[0].type.toUpperCase() || '',
                amount: installmentData?.totalamount || paymentDetails.paybalance * paymentRange,
                currency: installmentData?.currency || paymentDetails.currency,
                email: paymentDetails.email,
                orderid: getCCPayTrans.id,
                instcount: installmentData?.instcount || 0,
                ip: requestIp.getClientIp(req) === '::1' ? '0.0.0.0' : requestIp.getClientIp(req),
                hotelrefno: sett.global.HOTELREFNO
            }
        }

        const doPayment = (doPaymentData) => {
            if (res.GENERAL_SETTINGS.OREST_URL.includes('beta')) {
                res.GENERAL_SETTINGS.OREST_URL = serverConst.CLOUD_OREST_URL
            }

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.ms.epayPay),
                headers: helpers.getHeaders(req, res),
                method: orestEndpoint.methods.post,
                params: doPaymentData,
            }).then((response) => {
                if (response.status === 200 && response.data.success) {
                    return response.data && response.data
                } else {
                    return false
                }
            }).catch((error) => {
                let errorMsg = error && error.response && error.response.data && error.response.data.message || false,
                    newError = {}
                if (errorMsg) {
                    errorMsg = errorMsg.match(/\[(.*?)\]/gm)
                    if(errorMsg && helpers.strIsJson(errorMsg[0])){
                        errorMsg = errorMsg && JSON.parse(errorMsg[0])[0] || false
                    }else{
                        errorMsg = false
                    }
                }

                newError.data = errorMsg
                newError.success = false
                return newError
            })
        }

        const getCCPayTrans = await createCCPayTrans({
            accid: paymentDetails.accid,
            balancetotal: installmentData?.totalamount || paymentDetails.paybalance * paymentRange,
            currid: paymentDetails.currencyid,
            transdate: transdate,
            transtime: transtime,
            masterid: paymentDetails.refmid,
            instcount: installmentData?.instcount || 0
        })

        const doPaymentData = generateDoPaymentData(ccInfo, paymentDetails, getCCPayTrans, installmentData)
        const doPaymentResult = await doPayment(doPaymentData)

        if (!doPaymentResult.success) {
            const emailData = generateErrorMailData(paymentDetails, doPaymentResult.data)
            await paymentTransactionErrorNotificationForHotel(emailData)

            return {
                success: false,
                processMsg: 'payment_transaction_was_not_made',
            }
        }

        const doPaymentResultStr = JSON.stringify(Object.assign(doPaymentResult, doPaymentData, paymentDetails, {doOrderId: getCCPayTrans.id}))
        const cacheKey = getRedisKey(sett.serverCacheKey, getCCPayTrans.gid, redisSuffixKeys.doPayment)
        await useRedis.set(cacheKey, doPaymentResultStr)
        await useRedis.expire(cacheKey, redisCacheTime.doPayment)

        return {
            success: true,
            redirecturl: doPaymentResult.redirecturl,
            transactionid: getCCPayTrans.gid
        }
    },
    savePayment: async (req, res, sett) => {
        const
            useHotelDateTime = await getHotelDateTime(req, res) || false,
            reservationGid = req.query.reservationGid,
            isgroup = req.query.isgroup !== 'false',
            isfail = req.query.isfail !== 'false',
            reservationUpdate = req.query.reservationUpdate,
            transactionid = req.query.transactionid,
            orderid = req.query.orderid,
            reftype = req.query.reftype,
            refno = req.query.refno,
            transdate = useHotelDateTime?.workdate || moment(Date.now()).locale(defaultLocale).format(orestEndpoint.dates.orestFullDateFormat),
            transtime = useHotelDateTime?.worktime || moment(Date.now()).locale(defaultLocale).format(orestEndpoint.dates.fullTimeFormat),
            useHotelLangCode = sett.global.hotelLocalLangGCode || 'en',
            useLangCode = req.query.langcode || 'en',
            clientPassword = req.query.clientPassword === 'false' ? false : req.query.clientPassword,
            sendNotification =  req.query.sendNotification !== 'false'

        //Auxiliary Functions
        const getReservationListToBeUpdated = (isgroup, reservno) => {
            let reservationCheckQueryApiPath
            if (isgroup) {
                reservationCheckQueryApiPath = orestEndpoint.api.reservatListGetResmasterNo
            } else {
                reservationCheckQueryApiPath = orestEndpoint.api.reservatListGetReservNo
            }

            return axios({
                url: helpers.getUrl(res, reservationCheckQueryApiPath),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: [reservno],
            }).then((response) => {
                if (response.status === 200 && response.data.success) {
                    return response.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }
            , updateGroupReservationsForStatus = (updateData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.resmasterListPatch),
                method: orestEndpoint.methods.patch,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: updateData,
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }
            , updateReservationsForStatus = (updateData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.reservatListPatch),
                method: orestEndpoint.methods.patch,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
                data: updateData,
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }
            , generateUpdateDataFoGroupReservation = (gid) => {
            return [
                {
                    status: 'A',
                    gid: gid,
                },
            ]
        }
            , generateUpdateDataFoReservations = (reservations) => {
            return new Promise((resolve) => {
                let requestRoomPatchDatas = []
                reservations.map((room) => {
                    let roomItem = {
                        clientid: room.clientid,
                        status: 'A',
                        gid: room.gid,
                        email: room.email,
                        firstname: room.firstname,
                        lastname: room.lastname,
                        hotelrefno: helpers.getSettings(req, res, global.hotelrefno),
                    }

                    requestRoomPatchDatas.push(roomItem)
                })
                resolve(requestRoomPatchDatas)
            })
        }
            , savePaymentTrans = (paymentData, payInfoData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.allaccSavePay),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    refgid: payInfoData.refgid,
                    ccpaygid: transactionid,
                    receiptno: paymentData.orderid,
                    excrate: paymentData.excrate,
                    currcredit: paymentData.payamount,
                    currencyid: paymentData.paycurrid,
                    instcount: payInfoData.instcount,
                    paydate: transdate,
                    transdate: transdate,
                    bankposid: payInfoData.bankposid,
                    iscash: orestEndpoint.global.false,
                    isccard: orestEndpoint.global.true,
                    isonline: orestEndpoint.global.true,
                    hotelrefno: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                return !!(response.status === 200 && response?.data?.data)
            }).catch(() => {
                return false
            })
        }
            , getTransactionProvider = (tableName, accTypeDesc) => {
            switch (tableName) {
                case 'RESNAME':
                    return 'Sub Reservation'
                case 'RESERVAT':
                    return 'Reservation'
                case 'RESMASTER':
                    return 'Group Reservation'
                case 'ACCTRANS':
                    return 'Company'
                case 'FOLIO':
                    return 'Folio'
                case 'FOLTRANS':
                    return 'Folio Trans'
                case 'INVOICE':
                    return 'Invoice'
                case 'SPTRANS':
                    return 'Offers'
                default:
                    return accTypeDesc
            }
        }
            , generateEmailData = (data, bankNameCode) => {
            return {
                hotelname: res.REDIS_WEBCMS_DATA.assets.meta.title || '',
                transactiondate: (moment(transdate).locale(defaultLocale).format(orestEndpoint.dates.fullDotDateFormat) + ' ' + transtime) || '',
                invoicetitle: data.invtitle || '-',
                invoicemail: data.email || '-',
                refno: data?.reftablename === 'INVOICE' && data?.transno ? data.transno : data.refid || data.reservno || data.transno || data.foliono || data.aptid || data.accid,
                reftype: getTransactionProvider(data.reftablename, data.acctypedesc) || '-',
                invoicetotal: helpers.formatMoney(data.paycurrinfo.payamount),
                invoicecurrency: data.paycurrinfo.paycurrcode,
                invoiceorderno: `#${data.orderid} - Bank Ref. No: #${orderid}`,
                exchangerate: helpers.formatMoney(data.paycurrinfo.excrate || 1, 4),
                exchangeratesource: data.paycurrinfo.ratetypecode || '-',
                totalpayment: helpers.formatMoney(data.paycurrinfo.res),
                paymentcurrency: data.paycurrinfo.currcode,
                banknamecode: bankNameCode,
            }
        }
            , paymentTransactionvNotificationForHotel = (emailData, subjectArray) => {
            return useMail.send(req, res, {
                    code: orestEndpoint.templates.cldEpaymentConfMailHtl,
                    sendername: res.GENERAL_SETTINGS.hotelSettings.from_name || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: res.GENERAL_SETTINGS.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    langcode: useHotelLangCode,
                    subject: subjectArray[useHotelLangCode],
                    receivername: res.GENERAL_SETTINGS.hotelSettings.from_name || sett.REDIS_WEBCMS_DATA.assets.meta.title,
                    receiveremail: res.GENERAL_SETTINGS.hotelSettings.notifemail_epay,
                }, emailData,
            )
        }
            , paymentTransactionvNotificationForClient = (emailData, subjectArray) => {
            return useMail.send(req, res, {
                    code: orestEndpoint.templates.cldEpaymentConfMailCli,
                    sendername: res.GENERAL_SETTINGS.hotelSettings.from_name || sett.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: res.GENERAL_SETTINGS.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    langcode: useLangCode,
                    subject: subjectArray[useLangCode],
                    receivername: payInfoData.invtitle || '',
                    receiveremail: payInfoData.email,
                }, emailData,
            )
        }
            , paymentTransactionNotSavedNotificationForHotel = (emailData, errorSubjectArray) => {
            return useMail.send(req, res, {
                    code: orestEndpoint.templates.cldEpaymentConfNotSavedMailHtl,
                    sendername: res.GENERAL_SETTINGS.hotelSettings.from_name || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: res.GENERAL_SETTINGS.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    langcode: 'en',
                    subject: errorSubjectArray[useHotelLangCode],
                    receivername: res.GENERAL_SETTINGS.hotelSettings.from_name || sett.REDIS_WEBCMS_DATA.assets.meta.title,
                    receiveremail: res.GENERAL_SETTINGS.hotelSettings.notifemail_epay,
                }, emailData,
            )
        }
            , paymentTransactionFailNotificationForHotel = (emailData, errorSubjectArray) => {
            return useMail.send(req, res, {
                    code: orestEndpoint.templates.cldEpaymentFailMailHtl,
                    sendername: res.GENERAL_SETTINGS.hotelSettings.from_name || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: res.GENERAL_SETTINGS.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    langcode: 'en',
                    subject: errorSubjectArray[useHotelLangCode],
                    receivername: res.GENERAL_SETTINGS.hotelSettings.from_name || sett.REDIS_WEBCMS_DATA.assets.meta.title,
                    receiveremail: res.GENERAL_SETTINGS.hotelSettings.notifemail_epay,
                }, emailData,
            )
        }
            , paymentTransactionSessionTimeOutNotificationForHotel = (emailData, errorSubjectArray) => {
            return useMail.send(req, res, {
                    code: orestEndpoint.templates.cldEpaymentConfSessionTimeoutMailHtl,
                    sendername: res.GENERAL_SETTINGS.hotelSettings.from_name || res.REDIS_WEBCMS_DATA.assets.meta.title,
                    senderemail: res.GENERAL_SETTINGS.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    langcode: 'en',
                    subject: errorSubjectArray[useHotelLangCode],
                    receivername: res.GENERAL_SETTINGS.hotelSettings.from_name || sett.REDIS_WEBCMS_DATA.assets.meta.title,
                    receiveremail: res.GENERAL_SETTINGS.hotelSettings.notifemail_epay,
                }, emailData,
            )
        }
            , getBankNameCode = (payInfoData) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.bankNameGetById),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.key}`]: payInfoData.bankid,
                },
            }).then((response) => {
                if (response.status === 200 && response?.data?.data) {
                    return response.data.data.code || ''
                } else {
                    return ''
                }
            }).catch(() => {
                return ''
            })
        }

        //Save Transaction
        const cacheKey = getRedisKey(sett.serverCacheKey, transactionid, redisSuffixKeys.doPayment)
        let payInfoData = await useRedis.getCacheById(cacheKey) || false
        payInfoData = payInfoData && JSON.parse(payInfoData) || false

        const refCode = payInfoData.doOrderId
        let errorSubjectArray = {
            'en': `Payment Transaction Done But Not Saved - #${refCode}`,
            'tr': `Ödeme İşlemi Tamamlandı Ama Kaydedilmedi - #${refCode}`,
            'de': `Zahlungstransaktion Abgeschlossen, Aber Nicht Gespeichert - #${refCode}`,
            'ru': `Платежная операция выполнена, но не сохранена - #${refCode}`,
            'es': `Transacción de pago realizada pero no guardada - #${refCode}`
        }

        if (!payInfoData) {
            const emailData = {
                refno: refno,
                reftype: getTransactionProvider(reftype),
                invoiceorderno: `#${payInfoData.doOrderId && payInfoData.doOrderId || "-"} / Bank Ref. No: #${orderid && orderid || "-"}`,
            }

            if(sendNotification){
                await paymentTransactionSessionTimeOutNotificationForHotel(emailData, errorSubjectArray)
            }

            //delete session
            if(cacheKey){
                await useRedis.del(cacheKey)
            }

            return {
                success: false,
                cachekey: cacheKey,
                processMsg: 'payment_transaction_completed_but_not_posted',
            }
        }

        if(isfail){
            const refCode = payInfoData.doOrderId
            let errorTdSubjectArray = {
                'en': `3D Sms Doğrulaması Başarısız - #${refCode}`,
                'tr': `3D Sms Verification Failed - #${refCode}`,
                'de': `3D-SMS-Verifizierung fehlgeschlagen - #${refCode}`,
                'ru': `Подтверждение 3D Sms не удалось - #${refCode}`,
                'es': `Error de verificación de SMS 3D - #${refCode}`,
            }

            const emailTdData = {
                refno: refno,
                reftype: getTransactionProvider(reftype),
                invoiceorderno: `#${payInfoData.doOrderId && payInfoData.doOrderId || "-"}`,
            }

            if(sendNotification) {
                await paymentTransactionFailNotificationForHotel(emailTdData, errorTdSubjectArray)
            }

            //delete session
            if(cacheKey){
                await useRedis.del(cacheKey)
            }

            return {
                success: true,
                cachekey: cacheKey,
                processMsg: 'payment_fail',
            }
        }

        let paymentData = {
            bankid: payInfoData.bankid || false,
            accid: payInfoData.accid || false,
            transid: payInfoData.transid || false,
            orderid: orderid || false,
            reservno: payInfoData.reservno || false,
            transno: payInfoData.transno || false,
            aptid: payInfoData.aptid || false,
            foliono: payInfoData.foliono || false,
            refmid: payInfoData?.refmid || payInfoData?.mid || false,
            payamount: payInfoData?.paycurrinfo?.payamount || false,
            paycurrid: payInfoData?.paycurrinfo?.paycurrid || false,
            paybalance: payInfoData?.paycurrinfo?.res || false,
            currencyid: payInfoData?.paycurrinfo?.currid || false,
            excrate: payInfoData?.paycurrinfo?.excrate || 1,
            transdate: transdate || false,
            transtime: transtime || false,
            reftablename: payInfoData.reftablename || false,
        }

        if(reservationUpdate){
            const reservationListToBeUpdated = await getReservationListToBeUpdated(isgroup, refno)
                , updateDataFoReservations = await generateUpdateDataFoReservations(reservationListToBeUpdated)
            await updateReservationsForStatus(updateDataFoReservations)

            if(updateDataFoReservations && updateDataFoReservations.length > 0){
                //If it is a group reservation, get the client ID number from the first reservation.
                const firstReservationData =  updateDataFoReservations && updateDataFoReservations.sort((a,b) => a.reservno - b.reservno)[0] || false
                paymentData.accid = firstReservationData?.clientid || paymentData.accid
                payInfoData.invtitle = firstReservationData?.firstname + ' ' + firstReservationData?.lastname || payInfoData.invtitle
                payInfoData.email = firstReservationData?.email || payInfoData.email
            }

            if(isgroup){
               const updateDataFoGroupReservation = generateUpdateDataFoGroupReservation(reservationGid)
               await updateGroupReservationsForStatus(updateDataFoGroupReservation)
            }

            const sendAReservationConfirmationMailToTheGuest = (data) => {
                let params = new URLSearchParams()
                params.append(orestEndpoint.params.gid, data.gid)
                params.append(orestEndpoint.params['file.query'], `code::${data.templateCodeForCli},langcode:${data.guestlangcode}`)
                params.append(orestEndpoint.params.sendername, data.sendername)
                params.append(orestEndpoint.params.senderemail, data.senderemail)
                params.append(orestEndpoint.params.subject, data.guestsubject)
                params.append(orestEndpoint.params.receivername, data.receivername)
                params.append(orestEndpoint.params.receiveremail, data.receiveremail)
                params.append(orestEndpoint.global.sort, 'hotelrefno-')
                params.append(orestEndpoint.global.allhotels, orestEndpoint.global.true)
                params.append(orestEndpoint.params.outputtype, orestEndpoint.fileType.html)
                let dataSet = JSON.stringify({
                    dataset: {
                        guestLoginUrl: data.guestLoginUrl
                    },
                })

                return axios({
                    url: helpers.getUrl(res, data.isgroup ? orestEndpoint.api.resmasterEmailForm : orestEndpoint.api.reservatEmailForm),
                    method: orestEndpoint.methods.post,
                    headers: helpers.getHeaders(req, res),
                    params: params,
                    data: dataSet
                }).then((response) => {
                    if (response.status === 200) {
                        return true
                    } else {
                        return false
                    }
                }).catch(() => {
                    return false
                })
            }
                , sendAReservationConfirmationMailToTheHotel = (data) => {
                let params = new URLSearchParams()
                params.append(orestEndpoint.params.gid, data.gid)
                params.append(orestEndpoint.params['file.query'], `code::${data.templateCodeForHtl},langcode:${data.hotellangcode}`)
                params.append(orestEndpoint.params.sendername, data.sendername)
                params.append(orestEndpoint.params.senderemail, data.senderemail)
                params.append(orestEndpoint.params.subject, data.hotelsubject)
                params.append(orestEndpoint.params.receivername, data.sendername)
                if (data.hotelreceiveremail.includes(',')) {
                    data.hotelreceiveremail.split(/\s*,\s*/).forEach((recEmail) => {
                        params.append(orestEndpoint.params.receiveremail, recEmail)
                    })
                } else {
                    params.append(orestEndpoint.params.receiveremail, data.hotelreceiveremail)
                }
                params.append(orestEndpoint.global.sort, 'hotelrefno-')
                params.append(orestEndpoint.global.allhotels, orestEndpoint.global.true)
                params.append(orestEndpoint.params.outputtype, orestEndpoint.fileType.html)

                return axios({
                    url: helpers.getUrl(res, data.isgroup ? orestEndpoint.api.resmasterEmailForm : orestEndpoint.api.reservatEmailForm),
                    method: orestEndpoint.methods.post,
                    headers: helpers.getHeaders(req, res),
                    params: params
                }).then((response) => {
                    if (response.status === 200) {
                        return true
                    } else {
                        return false
                    }
                }).catch(() => {
                    return false
                })
            }
                , getGuestLoginUrl = (email, clientPass) => {
                if(clientPass){
                    return `${res.GENERAL_SETTINGS.BASE_URL}guest/login?email=${email}&pass=${clientPass}&lang=${useLangCode || 'en'}`
                }
                return `${res.GENERAL_SETTINGS.BASE_URL}guest/login?lang=${useLangCode || 'en'}`
            }
                , generateEmailData = () => {
                const reservNo = paymentData.reservno
                let subjectArray = {
                    'en': `New Reservation Notification - #${reservNo}`,
                    'tr': `Yeni Rezervasyon Bildirimi - #${reservNo}`,
                    'de': `Neue Reservierungsbenachrichtigung - #${reservNo}`,
                    'ru': `Уведомление о новом бронировании - #${reservNo}`,
                    'es': `Notificación de nueva reserva - #${reservNo}`,
                    'mk': `Известување за нова резервација - #${reservNo}`,
                    'sq': `Njoftim për Rezervim të Ri - #${reservNo}`,
                    'ar': "إشعار حجز جديد"
                }

                return {
                    isgroup: isgroup,
                    gid: payInfoData.refgid,
                    templateCodeForCli: isgroup ? orestEndpoint.templates.cldIbeConfMailGrpCli : orestEndpoint.templates.cldIbeConfMailSngCli,
                    templateCodeForHtl: isgroup ?  orestEndpoint.templates.cldIbeConfMailGrpHtl : orestEndpoint.templates.cldIbeConfMailSngHtl,
                    guestlangcode: useLangCode,
                    guestsubject: subjectArray[useLangCode],
                    hotellangcode: useHotelLangCode,
                    hotelsubject: subjectArray[useHotelLangCode],
                    sendername: sett.global.hotelSettings.from_name || sett.webSiteData.assets.meta.title,
                    senderemail: sett.global.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    receivername: payInfoData.invtitle,
                    receiveremail: payInfoData.email,
                    hotelreceiveremail: sett.global.hotelSettings.notifemail_conf,
                    guestLoginUrl: getGuestLoginUrl(payInfoData.email, clientPassword)
                }
            }

            //Send confirmation emails for Guest and Hotel
            const emailData = generateEmailData()
            if(sendNotification){
                await sendAReservationConfirmationMailToTheHotel(emailData)
                await sendAReservationConfirmationMailToTheGuest(emailData)
            }
        }

        const isPaymentTransactionRecorded = await savePaymentTrans(paymentData, payInfoData)
            , getBankCode = await getBankNameCode(payInfoData)
            , emailData = generateEmailData(payInfoData, getBankCode)

        let subjectArray = {
            'en': `New Payment Transaction - #${refCode}`,
            'tr': `Yeni Ödeme İşlemi - #${refCode}`,
            'de': `Neuer Zahlungsvorgang - #${refCode}`,
            'ru': `Новая платежная операция - #${refCode}`,
            'es': `Nueva transacción de pago - #${refCode}`,
            'mk': `Нова платежна трансакција - #${refCode}`,
            'sq': `Transaksioni i ri i pagesës - #${refCode}`,
            'ar': 'معاملة دفع جديدة'
        }

        if(sendNotification){
            if(isPaymentTransactionRecorded){
                await paymentTransactionvNotificationForHotel(emailData, subjectArray)
                await paymentTransactionvNotificationForClient(emailData, subjectArray)
            }else{
                await paymentTransactionNotSavedNotificationForHotel(emailData, errorSubjectArray)
            }
        }

        //delete session
        if(cacheKey){
            await useRedis.del(cacheKey)
        }

        return {
            success: true
        }
    },
    checkPaymentVPos: async (req, res) => {
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.paytypeVPos),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            if (response.status === 200 && response?.data?.data?.res) {
                return {
                    success: Boolean(response.data.data.res)
                }
            } else {
                return {
                    success: false
                }
            }
        }).catch(() => {
            return {
                success: false
            }
        })
    },
    getHotelAppLanguage: async (req, res) => {
        if(!req.query.langcode){
            return {
                success: false,
                data: []
            }
        }

        const hotelLanguageList = await getHotelAppLang(req, res, req.query.langcode)

        return {
            success: true,
            data: hotelLanguageList
        }

    },
    hotelSendCheckinNotification: async (req, res, sett) => {
        const
            clientFullName = req.query.clientfullname,
            clientEmail = req.query.clientemail,
            refcode = req.query.refcode,
            refgid = req.query.refgid,
            reservno = req.query.reservno,
            langcode = req.query.langcode,
            hotelrefno = req.query.hotelrefno

        if (String(sett.HOTELREFNO)!==String(hotelrefno)) {
            let hotel = res.PRIVATE_CHAIN_LIST ? res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(hotelrefno)) : false
            if(hotel) {
                let gid = hotel.gid.toUpperCase() || false
                let accid = hotel.accid || false

                if(gid){
                    req.query.hoteltoken = gid
                }

                if(accid){
                    req.query.hotelrefno = accid
                }
            }
        }

        const getEmailSettings = (code, hotelrefno) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.msgTemplateGetByCode),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    code: code,
                    hotelrefno: hotelrefno,
                },
            }).then((response) => {
                if (response?.data?.data) {
                    return response.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const generateEmailData = async (hotelrefno) => {
            const useHotelLangCode = sett?.global?.hotelLocalLangGCode || 'en'
            const useLangCode = langcode || 'en'
            let subjectArray = {
                'en': `Guest Check-In Notification - #${reservno}`,
                'tr': `Misafir Check-In Bildirimi - #${reservno}`,
                'de': `Benachrichtigung zum Check-in für Gäste - #${reservno}`,
                'ru': `Уведомление о регистрации гостей - #${reservno}`,
                'es': `Külaliste sisseregistreerimise teade - #${reservno}`,
            }

            let guestSubjectArray = {
                'en': `Your Checkin Has Been Successfully - #${reservno}`,
                'tr': `Check-in İşleminiz Başarıyla Gerçekleştirildi - #${reservno}`,
                'de': `Ihr Checkin war erfolgreich - #${reservno}`,
                'ru': `Ваша регистрация прошла успешно - #${reservno}`,
                'es': `Su registrarse ha sido exitoso - #${reservno}`,
                'mk': `Вашето пријавување е успешно - #${reservno}`,
                'sq': `Regjistrimi juaj ka qenë me sukses - #${reservno}`,
                'ar': 'تم تسجيل الوصول الخاص بك بنجاح'
            }

            const emailSettings = await getEmailSettings(orestEndpoint.templates.emlNtfUpdCinHtl, hotelrefno)
            return {
                gid: refgid,
                templateCodeForCli: orestEndpoint.templates.emlNtfUpdCinCli,
                templateCodeForHtl: orestEndpoint.templates.emlNtfUpdCinHtl,
                guestlangcode: useLangCode,
                guestsubject: guestSubjectArray[useLangCode],
                hotellangcode: useHotelLangCode,
                hotelsubject: subjectArray[useHotelLangCode],
                sendername:  sett.global.hotelSettings.from_name || sett.webSiteData.assets.meta.title,
                senderemail:  sett.global.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                hotelreceiveremail: emailSettings?.replytoemail || sett.global.hotelSettings.notifemail_conf || false,
                receivername: clientFullName,
                receiveremail: clientEmail
            }
        }

        const sendCheckinNotificationForHotel = (data) => {
            let params = new URLSearchParams()
            params.append(orestEndpoint.params['file.query'], `code::${data.templateCodeForHtl},langcode:${data.hotellangcode}`)
            params.append(orestEndpoint.params.sendername, data.sendername)
            params.append(orestEndpoint.params.senderemail, data.senderemail)
            params.append(orestEndpoint.params.subject, data.hotelsubject)
            params.append(orestEndpoint.params.receivername, data.sendername)
            params.append(orestEndpoint.params.receiveremail, data.hotelreceiveremail)
            params.append(orestEndpoint.global.sort, 'hotelrefno-')
            params.append(orestEndpoint.params.report.masterentity, refcode)
            params.append(orestEndpoint.params.report.gid, refgid)
            params.append(orestEndpoint.params.report.incsysinfo, orestEndpoint.global.true)

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsTemplateRafileProcessReportEmail),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: params
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const sendCheckinNotificationForClient = (data) => {
            let params = new URLSearchParams()
            params.append(orestEndpoint.params['file.query'], `code::${data.templateCodeForCli},langcode:${data.guestlangcode}`)
            params.append(orestEndpoint.params.sendername, data.sendername)
            params.append(orestEndpoint.params.senderemail, data.senderemail)
            params.append(orestEndpoint.params.subject, data.guestsubject)
            params.append(orestEndpoint.params.receivername, data.receivername)
            params.append(orestEndpoint.params.receiveremail, data.receiveremail)
            params.append(orestEndpoint.global.sort, 'hotelrefno-')
            params.append(orestEndpoint.params.report.masterentity, refcode)
            params.append(orestEndpoint.params.report.gid, refgid)
            params.append(orestEndpoint.params.report.incsysinfo, orestEndpoint.global.true)

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsTemplateRafileProcessReportEmail),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: params
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        //Send reservation checkin notify emails for Guest and Hotel
        const emailData = await generateEmailData(hotelrefno)
        const sendclient = await sendCheckinNotificationForClient(emailData)
        const sendhotel = await sendCheckinNotificationForHotel(emailData)

        return {
            success: sendclient && sendhotel || false,
            sendclient: sendclient,
            sendhotel: sendhotel
        }
    },
    hotelSendGuestChangeNotify: async (req, res, sett) => {
        const
            clientId = req.query.clientid,
            reftyp = req.query.reftyp,
            reftemp = req.query.reftemp,
            refgid = req.query.refgid,
            hotelrefno = req.query.hotelrefno,
            notifyValues = req.body || false

        if (String(sett.HOTELREFNO)!==String(hotelrefno)) {
            let hotel = res.PRIVATE_CHAIN_LIST ? res.PRIVATE_CHAIN_LIST.find(hotel => Number(hotel.accid) === Number(hotelrefno)) : false
            if(hotel) {
                let gid = hotel.gid.toUpperCase() || false
                let accid = hotel.accid || false

                if(gid){
                    req.query.hoteltoken = gid
                }

                if(accid){
                    req.query.hotelrefno = accid
                }
            }
        }

        const getEmailSettings = (code, hotelrefno) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.msgTemplateGetByCode),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    code: code,
                    hotelrefno: hotelrefno,
                },
            }).then((response) => {
                if (response?.data?.data) {
                    return response.data.data
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const generateEmailData = async (hotelrefno) => {
            const useHotelLangCode = sett?.global?.hotelLocalLangGCode || 'en'

            let subjectArray = {
                'en': `Guest New Transaction Notification - #${clientId}`,
                'tr': `Misafir Yeni İşlem Bildirimi - #${clientId}`,
                'de': `Gast Benachrichtigung über neue Transaktion - #${clientId}`,
                'ru': `Уведомление о новой транзакции гостя - #${clientId}`,
                'es': `Külalise uus tehinguteatis - #${clientId}`,
            }

            const useNotifyTemplate = {
                'client': {
                    'upd': orestEndpoint.templates.emlNtf.client
                },
                'clntcomm': {
                    'upd': orestEndpoint.templates.emlNtf.clntcomm
                },
                'tstrans': {
                    'upd': orestEndpoint.templates.emlNtf.tstrans
                },
                'clientrem': {
                    'upd': orestEndpoint.templates.emlNtf.clientrem
                },
                'posmain': {
                    'upd': orestEndpoint.templates.emlNtf.posmain
                },
                'surveytrans': {
                    'upd': orestEndpoint.templates.emlNtf.surveytrans
                },
                'resevent': {
                    'upd': orestEndpoint.templates.emlNtf.resevent,
                    'cnl': orestEndpoint.templates.emlNtf.resevent_cnl
                },
                'reservat': {
                    'cnl': orestEndpoint.templates.emlNtf.reservat_cnl
                },
            }

            if (useNotifyTemplate[reftemp][reftyp]) {
                const emailSettings = await getEmailSettings(useNotifyTemplate[reftemp][reftyp], hotelrefno)
                return {
                    gid: refgid,
                    templateCodeForHtl: useNotifyTemplate[reftemp][reftyp],
                    hotellangcode: useHotelLangCode,
                    hotelsubject: subjectArray[useHotelLangCode],
                    sendername: sett.global.hotelSettings.from_name || sett.webSiteData.assets.meta.title,
                    senderemail: sett.global.hotelSettings.from_email || process.env.MAIL_SENDER_MAIL,
                    hotelreceiveremail: emailSettings?.replytoemail || sett.global.hotelSettings.notifemail_conf || false,
                }
            }
        }

        const sendCheckinNotificationForHotel = (item) => {
            let params = new URLSearchParams()
            params.append(orestEndpoint.params['file.query'], `code::${item.templateCodeForHtl},langcode:${item.hotellangcode}`)
            params.append(orestEndpoint.params.sendername, item.sendername)
            params.append(orestEndpoint.params.senderemail, item.senderemail)
            params.append(orestEndpoint.params.subject, item.hotelsubject)
            params.append(orestEndpoint.params.receivername, item.sendername)
            params.append(orestEndpoint.params.receiveremail, item.hotelreceiveremail)
            params.append(orestEndpoint.params.report.masterentity, 'client')
            params.append(orestEndpoint.params.report.gid, refgid)
            params.append(orestEndpoint.params.report.incsysinfo, orestEndpoint.global.true)
            params.append(orestEndpoint.global.sort, 'hotelrefno-')
            let data = JSON.stringify({
                dataset: notifyValues,
            })

            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.toolsTemplateRafileProcessReportEmail),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: params,
                data: data
            }).then((response) => {
                if (response.status === 200) {
                    return true
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const emailData = await generateEmailData(hotelrefno)
        if(!emailData?.hotelreceiveremail){
            return {
                success: false,
                msg: 'no_mail_recipient'
            }
        }

        const isSendCheckinNotificationForHotel = await sendCheckinNotificationForHotel(emailData)
        return {
            success: isSendCheckinNotificationForHotel || false,
        }
    },
    hotelDateTime: async (req, res) => {
        const useHotelDateTime = await getHotelDateTime(req, res)
        if(useHotelDateTime){
            return {
                success: true,
                data: {
                    workdate: useHotelDateTime.workdate,
                    worktime: useHotelDateTime.worktime,
                    localdt: useHotelDateTime.localdt,
                    serverdt: useHotelDateTime.serverdt
                }
            }
        }else {
            return {
                success: false,
            }
        }
    },
    guestProductSave: async (req, res, sett) => {
        const
            reservno = req.query.reservno,
            hotelrefno = req.query.hotelrefno,
            productList = req.body

    },
    posmainInsline: (req, res, sett) => {
        let params = {}

        if (req.query.tableno) {
            params.tableno = req.query.tableno
        }
        if (req.query.roomno) {
            params.roomno = req.query.roomno
        }

        if (req.query.depart) {
            params.depart = req.query.depart
        }

        if (req.query.isclosed) {
            params.isclosed = req.query.isclosed
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.posmainInsline),
            method: orestEndpoint.methods.post,
            headers: helpers.getHeaders(req, res),
            params: {
                ...params,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })

    },
    poslineInsList: (req, res) => {
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.poslineListIns),
            method: orestEndpoint.methods.post,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
            data: req.body
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    posmainPaySave:(req, res) => {
        let payNote = ""
        const refPay = Number(req.query.refpay)
        if(refPay === 0){
            payNote = "*Guest made the payment by credit card."
        } else if(refPay === 1){
            payNote = "*Guest wants the order to be sent to the room."
        } else if(refPay === 2){
            payNote = "*Guest wants to pay in cash."
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.posmainListPatch),
            method: orestEndpoint.methods.patch,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
            data: [{
                note: payNote,
                gid: req.query.refgid
            }]
        }).then(() => {
            return true
        }).catch(() => {
            return false
        })
    },
    posmainViewList: (req, res) => {
        let query = {}

        if(req.query.transno) {
            query.transno = req.query.transno 
        }
      
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.posmainViewList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                query: orestHelper.useQuery({
                    [`${orestEndpoint.params.transno}`]: query.transno,
                }),
                chkselfish: false,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    spropsViewList: (req, res) => {
        let query = {}

        if (req.query.productcodeid) {
            query.productcodeid = req.query.productcodeid
        }

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.spropsViewList),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.query}`]: orestHelper.useQuery({
                    productcodeid: query.productcodeid,
                }),
                [`${orestEndpoint.global.chkselfish}`]: false,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    spropsListIns: (req, res) => {      
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.spropsListIns),
            method: orestEndpoint.methods.post,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
            data: req.body
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    hotelSettFolioCash: (req, res) => {
        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.settFolioCash),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
        }).then((response) => {
            return orestHelper.responseSuccess(response)
        }).catch((error) => {
            return orestHelper.responseError(error)
        })
    },
    setBrowserInfo: async (req, res, sett) => {
        if (sett.global.BASE_URL.includes(req.headers.origin)) {
            const getLogTransId = async () => {
                const ipAddress = process.env.USE_IP_ADDRESS || await requestIp.getClientIp(req)
                const transDate = moment(Date.now()).locale(defaultLocale).format(orestEndpoint.dates.orestFullDateFormat)
                const cacheKey = getRedisKey(sett.serverCacheKey, (ipAddress + ' ' + transDate), redisSuffixKeys.hotelBookInfo)
                const logTransId = await useRedis.getCacheById(cacheKey)
                if (logTransId) {
                    return logTransId
                }

                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.logTransIns),
                    method: orestEndpoint.methods.post,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                    data: {
                        appname: 'WebCMS',
                        appver: req.query.ver,
                        ipaddress: ipAddress,
                        hotelrefno: sett.HOTELREFNO
                    }
                }).then(async (response) => {
                    if (response.status === 200 && response.data?.data) {
                        await useRedis.set(cacheKey, String(response.data.data.id))
                        return response.data.data.id
                    } else {
                        return false
                    }
                }).catch(() => {
                    return false
                })
            }
            const setPageLog = (logTransId, logData) => {
                return axios({
                    url: helpers.getUrl(res, orestEndpoint.api.pageLogIns),
                    method: orestEndpoint.methods.post,
                    headers: helpers.getHeaders(req, res),
                    params: {
                        [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                    },
                    data: {
                        logid: logTransId,
                        brdesc: logData.brdesc,
                        brlang: logData.brlang,
                        brver: logData.brver,
                        ckenabled: logData.ckenabled,
                        devicetype: logData.devicetype,
                        pagelang: logData.pagelang,
                        pagesize: logData.pagesize,
                        url: logData.url,
                        islogin: logData.islogin,
                        loginrefid: logData.loginrefid,
                        loginrefcode: logData.loginrefcode
                    }
                }).then(async (response) => {
                    if (response.status === 200 && response.data?.data) {
                        return true
                    } else {
                        return false
                    }
                }).catch(() => {
                    return false
                })
            }
            const logTransId = await getLogTransId()

            if (req?.body?.value) {
                const logData = JSON.parse(Buffer.from(req.body.value, 'base64').toString('utf-8'))
                await setPageLog(logTransId, logData)
                return {
                    success: true
                }
            } else {
                return {
                    success: false
                }
            }
        }else{
            return {
                success: false,
                msg: 'bad_req'
            }
        }
    },
    getHotelReviewsTa: async (req, res) => {
        const
            reservationGid = req.query.gid,
            browserDesc = req.query.browserdesc || "",
            deviceDesc = req.query.devicedesc || "",
            lang = req.query.lang || "en"

        const getHotelTripAdvisorId = () => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.settCrmTaId),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200 && response.data && response.data.success) {
                    return response.data.data.res
                }else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getSurveyLocId = () => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.surveyLocWeb),
                method: orestEndpoint.methods.get,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200 && response?.data?.data[0]?.res) {
                    return response.data.data[0].res
                } else {
                    return false
                }
            })
        }

        const getTripAdvisorData = (tripAdvisorId, reservationGid, browserDesc, deviceDesc, surveyLocId, langCode) => {
            return axios({
                url: helpers.getUrl(res, orestEndpoint.api.reservatRevtransIns),
                method: orestEndpoint.methods.post,
                headers: helpers.getHeaders(req, res),
                params: {
                    [`${orestEndpoint.params.gid}`]: reservationGid,
                    [`${orestEndpoint.params.browserdesc}`]: browserDesc,
                    [`${orestEndpoint.params.devicedesc}`]: deviceDesc,
                    [`${orestEndpoint.params.surveylocid}`]: surveyLocId,
                    [`${orestEndpoint.params.langcode}`]: langCode,
                    [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
                },
            }).then((response) => {
                if (response.status === 200) {
                    const reservatRevTransData = response.data.data
                    return {
                        locationId: tripAdvisorId,
                        email: reservatRevTransData.email || false,
                        stayMonth: moment(reservatRevTransData.checkin, orestEndpoint.dates.orestFullDateFormat).format(orestEndpoint.dates.fullMonth),
                        stayYear: moment(reservatRevTransData.checkin, orestEndpoint.dates.orestFullDateFormat).format(orestEndpoint.dates.fullYear),
                        firstName: reservatRevTransData.firstname,
                        lastName: reservatRevTransData.lastname,
                        bookingId: reservatRevTransData.reservno,
                        hgrreservno: reservatRevTransData.reservno,
                        hgrhotelrefno:  helpers.getSettings(req, res, global.hotelrefno),
                        hgrhotelname: reservatRevTransData.hotelname,
                        hgrrevid: reservatRevTransData.surevportansid,
                    }
                } else {
                    return false
                }
            }).catch(() => {
                return false
            })
        }

        const getTripAdvisorDataStr = (tripAdvisorData) => {
            return helpers.encodeDataToURL(tripAdvisorData)
        }

        const getTripAdvisorDataStrKey = (tripAdvisorDataStr) => {
            return serverConst.TRIPADVISOR_SECURE_KEY + tripAdvisorDataStr
        }

        const getTripAdvisorMD5Str = (tripAdvisorDataStrKey) => {
            return md5(tripAdvisorDataStrKey)
        }

        const getTripAdvisorStrHex = (tripAdvisorMD5Str, tripAdvisorDataStr) => {
            return tripAdvisorMD5Str + helpers.bin2hex(tripAdvisorDataStr)
        }

        const getTripAdvisorDataUrl = (tripAdvisorId, tripAdvisorStrHex) => {
            return {
                display: true,
                locationId: tripAdvisorId,
                lang: lang,
                partnerId: serverConst.TRIPADVISOR_PARTNER_ID,
                data: tripAdvisorStrHex
            }
        }

        const getTripAdvisorUrlParams = (tripAdvisorDataUrl) => {
            return helpers.encodeDataToURL(tripAdvisorDataUrl)
        }

        const createTripAdvisorFrameUrl = (tripAdvisorFrameUrl, tripAdvisorUrlParams) => {
            return `${tripAdvisorFrameUrl}?${tripAdvisorUrlParams}`
        }

        const tripAdvisorId = await getHotelTripAdvisorId()
        if(!tripAdvisorId){
            return {
                success: false,
                errmsg: 'taid_not_available'
            }
        }

        const surveyLocId = await getSurveyLocId()
        if(!surveyLocId){
            return {
                success: false,
                errmsg: 'surveylocid_not_available'
            }
        }

        const tripAdvisorData = await getTripAdvisorData(tripAdvisorId, reservationGid, browserDesc, deviceDesc, surveyLocId, lang)

        if(!tripAdvisorData){
            return {
                success: false,
                errmsg: 'ta_data_not_available'
            }
        }else if(!tripAdvisorData.email){
            return {
                success: false,
                errmsg: 'email_not_available'
            }
        }

        const tripAdvisorDataStr = getTripAdvisorDataStr(tripAdvisorData)
            , tripAdvisorDataStrKey = getTripAdvisorDataStrKey(tripAdvisorDataStr)
            , tripAdvisorMD5Str = getTripAdvisorMD5Str(tripAdvisorDataStrKey)
            , tripAdvisorStrHex = getTripAdvisorStrHex(tripAdvisorMD5Str, tripAdvisorDataStr)
            , tripAdvisorDataUrl = getTripAdvisorDataUrl(tripAdvisorId, tripAdvisorStrHex)
            , tripAdvisorUrlParams = getTripAdvisorUrlParams(tripAdvisorDataUrl)
            , tripAdvisorFrameUrl = createTripAdvisorFrameUrl(serverConst.TRIPADVISOR_FRAME_URL, tripAdvisorUrlParams)

        return {
            success: true,
            taFrameUrl: tripAdvisorFrameUrl,
        }
    },
    getHotelClientInfo: (req, res) => {
        const
            clientGid = req.query.gid

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.clientGetGid),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.gid}`]: clientGid,
                [`${orestEndpoint.global.chkselfish}`]: orestEndpoint.global.false,
                [`${orestEndpoint.global.allhotels}`]: orestEndpoint.global.true,
            },
        }).then((clientGetGidResponse) => {
            if (clientGetGidResponse?.data?.data) {
                return {
                    success: true,
                    data: clientGetGidResponse?.data?.data || null
                }
            } else {
                return {
                    success: false,
                    data: null
                }
            }
        }).catch(() => {
            return {
                success: false,
                data: null
            }
        })
    },
    getHotelReservationInfo: (req, res) => {
        const
            clientId = req.query.id

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.clientReservno),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.clientid}`]: clientId,
                [`${orestEndpoint.params.isgapp}`]: orestEndpoint.global.false,
            },
        }).then((clientReservnoResponse) => {
            if (clientReservnoResponse?.data?.data) {
                return {
                    success: true,
                    data: clientReservnoResponse?.data?.data || null
                }
            } else {
                return {
                    success: false,
                    data: null
                }
            }
        }).catch(() => {
            return {
                success: false,
                data: null
            }
        })
    },
    getHotelTempGuestInfo: (req, res) => {
        const
            clientGid = req.query.clientGid

        return axios({
            url: helpers.getUrl(res, orestEndpoint.api.clientGetGid),
            method: orestEndpoint.methods.get,
            headers: helpers.getHeaders(req, res),
            params: {
                [`${orestEndpoint.params.gid}`]: clientGid,
                [`${orestEndpoint.global.hotelrefno}`]: helpers.getSettings(req, res, global.hotelrefno),
            },
        }).then((clientGetGidResponse) => {
            if (clientGetGidResponse?.data?.data) {
                return {
                    success: true,
                    data: clientGetGidResponse?.data?.data || null
                }
            } else {
                return {
                    success: false,
                    data: null
                }
            }
        }).catch(() => {
            return {
                success: false,
                data: null
            }
        })
    },
}

module.exports = controllers