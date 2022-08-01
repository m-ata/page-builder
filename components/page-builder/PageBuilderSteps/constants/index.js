//color
export const COLORS = {
    primary: '#0F4571',
    secondary: '#269DD4',
    contrastText: '#fff',
    backButton: '#CCCCCC'
};
//cache key
export const WEBCMS_DATA = "WEBCMS.DATA.";
//font names
export const FONT_NAME = [
    'Arial',
    'Roboto',
    'Times New Roman',
    'Courier',
    'Verdana',
    'Georgia',
    'Impact',
    'Oswald',
    'Montserrat'
];

export const PB_OPTIONS = [{
    code: 'webPage',
    description: 'WEBPAGE'
}, {
    code: 'website',
    description: 'WEBSITE'
}, {
    code: 'email',
    description: 'EMAIL'
}]

export const emailWidth = [600, 700, 800];

export const DELETE_SUCCESS = 'Deleted successfully';
export const SAVED_SUCCESS = 'Saved successfully';
export const UPDATE_SUCCESS = 'Updated successfully';
export const UPLOAD_SUCCESS = 'Uploaded successfully';
export const DATA_EMPTY = 'File Data is not available';

export const PERCENTAGE_VALUES = [{value: 10, label: '0.1'}, {value: 20, label: '0.2'}, { value: 30, label: '0.3'},
    {value: 40, label: '0.4'}, {value: 50, label: '0.5'}, {value: 60, label: '0.6'}, {value: 70, label: '0.7'},
    {value: 80, label: '0.8'}, { value: 90, label: '0.9'}, { value: 100, label: '1.0'}];

export const froalaConfig = {
    placeholderText: 'Edit Your Content Here!',
    charCounterCount: true,
    key: 'YNB3fJ3B7A7C6D6E3A-9UJHAEFZMUJOYGYQEa1c1ZJg1RAeF5C4C3D3E2C2C6D6D4B3==',
    heightMin: 250,
    pluginsEnabled: [
        'align',
        'charCounter',
        'codeBeautifier',
        'codeView',
        'colors',
        'draggable',
        'embedly',
        'emoticons',
        'entities',
        'file',
        'fontFamily',
        'fontSize',
        'fullscreen',
        'image',
        'imageManager',
        'inlineStyle',
        'lineBreaker',
        'link',
        'lists',
        'paragraphFormat',
        'paragraphStyle',
        'quickInsert',
        'quote',
        'save',
        'table',
        'url',
        'video',
        'wordPaste',
        'html'
    ],
    fontFamily: {
        'Arial,Helvetica,sans-serif': 'Arial',
        "Roboto,sans-serif": 'Roboto',
        "'Times New Roman',Times,serif": 'Times New Roman',
        "'Courier Prime', monospace;": "Courier",
        'Verdana,Geneva,sans-serif': 'Verdana',
        'Georgia,serif': 'Georgia',
        'Impact,Charcoal,sans-serif': 'Impact',
        "Oswald,sans-serif": 'Oswald',
        "Montserrat,sans-serif": 'Montserrat',
    },
    toolbarButtons: {
        // Key represents the more button from the toolbar.
        moreText: {
            buttons: [
                'bold',
                'italic',
                'fontFamily',
                'underline',
                'strikeThrough',
                'subscript',
                'superscript',
                'fontSize',
                'textColor',
                'backgroundColor',
                'inlineClass',
                'inlineStyle',
                'clearFormatting',
            ],
            align: 'left',
        },
        moreParagraph: {
            buttons: [
                'alignLeft',
                'alignCenter',
                'formatOLSimple',
                'alignRight',
                'alignJustify',
                'formatOL',
                'formatUL',
                'paragraphFormat',
                'paragraphStyle',
                'lineHeight',
                'outdent',
                'indent',
                'quote',
            ],
            align: 'left',
            buttonsVisible: 1,
        },

        moreRich: {
            buttons: [
                'insertLink',
                'insertImage',
                'insertVideo',
                'insertTable',
                'emoticons',
                'fontAwesome',
                'specialCharacters',
                'embedly',
                'insertFile',
                'insertHR',
            ],
            align: 'left',
            buttonsVisible: 1,
        },
        moreMisc: {
            buttons: ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
            align: 'right',
            buttonsVisible: 1,
        },
    },
    htmlRemoveTags: ['style']
}

export const horizontalAlignments = [{
    text: 'Left',
    value: '0000190'
}, {
    text: 'Center',
    value: '0000192'
}, {
    text: 'Right',
    value: '0000194'
}];

export const verticalAlignments = [{
    text: 'Top',
    value: '0000180'
}, {
    text: 'Center',
    value: '0000182'
}, {
    text: 'Bottom',
    value: '0000184'
}];