const pathRedirection = (ctx) => {
    const { req, res } = ctx
    const pathList = res?.GENERAL_SETTINGS?.WEBCMS_PATH_REDIRECT || false
    const pathName = req?._parsedUrl?.pathname || false
    const newPathName = pathList && pathList.find(item => item.oldpath === pathName)?.newpath || false

    if (pathList && pathName && newPathName) {
        res.setHeader('location', newPathName)
        res.statusCode = 301
        res.end()
        return { props: {} }
    }

    return false
}

module.exports = {
    pathRedirection,
}