function Index() {}

Index.getInitialProps = async ctx => {
    if (ctx.res) {
        const newPath = ctx.req.originalUrl.replace('/booking', '/booking/rooms')
        ctx.res.writeHead(302, { Location: newPath });
        ctx.res.end();
    }
    return {};
}

export default Index