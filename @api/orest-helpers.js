
const orestHelpers = {
    useQuery: (query) => {
        let res = ''
        Object.entries(query).map(([key, value]) => {
            res += `${key}:${value},`
        })
        res = res.slice(0, -1)
        return res

    },
    responseSuccess: (response) =>{
        return response.data
    },
    responseError: (response) =>{
        return response.response && response.response.data || response.response
    }
}

module.exports = orestHelpers