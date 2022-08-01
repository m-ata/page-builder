import { Patch } from '@webcms/orest'
import { OREST_ENDPOINT } from 'model/orest/constants'

export const _newHcmImgOrderUtil = async (apiUrl, token, itemState, updateState) => {
    if (itemState.length > 0) {
        const asyncChangeOrderNo = (item, callback) => {
            Patch({
                apiUrl: apiUrl,
                endpoint: OREST_ENDPOINT.HCMITEMIMG,
                token: token,
                gid: item.hcmItemImgGid,
                data: {
                    orderno: item.hcmItemImgOrderNo,
                },
            }).then((r1) => {
                if (r1.status === 200) {
                    callback()
                } else {
                    callback()
                }
            })
        }

        let requests = itemState.map((item) => {
            return new Promise((resolve) => {
                asyncChangeOrderNo(item, resolve)
            })
        })

        await Promise.all(requests).then(() => {
            updateState('registerStepper', 'photosNewOrderList', [])
        })
    }
}
