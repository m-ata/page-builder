export const initializePage = () => {
    return {
        metatags: {
            title: '',
            lang: 'en',
            dir: 'ltr',
        },
        style: {
            fontname: 'default',
        },
        colors: {
            primary: {
                color1: '',
                color2: '',
                color3: '',
            },
            secondary: {
                color1: '',
                color2: '',
                color3: '',
            },
            semantic: {
                color1: '',
                color2: '',
                color3: '',
                color4: '',
            },
            neutral: {
                color1: '',
                color2: '',
                color3: '',
            },
        },
        main: {
            header: {},
            sections: [],
            footer: {},
        },
    }
}
export const initializeStdJson = () => {
    return {
        meta: {
            title: 'Demo Hotel',
            defaultLang: 'en',
            dir: 'ltr',
        },
        style: {
            fontname: 'default',
        },
        assets: {
            header_logo: '',
            footer_logo: '',
            favicon: '',
        },
        header: {
            gid: {
                default: '',
                langs: {},
            },
        },
        footer: {
            gid: {
                default: '',
                langs: {},
            },
        },
        colors: {},
        pages: [],
    }
}
