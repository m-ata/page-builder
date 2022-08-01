import React, {useState} from "react";
import dynamic from 'next/dynamic'
import {froalaConfig} from "../../../constants";

const FroalaEditor = dynamic(
    async () => {
        const values = await Promise.all([
            import('react-froala-wysiwyg'),
            import('froala-editor/js/plugins.pkgd.min'),
            import('froala-editor/js/froala_editor.min'),
            import('froala-editor/js/froala_editor.pkgd.min'),
        ])
        return values[0]
    },
    {
        loading: () => <p>LOADING!!!</p>,
        ssr: false,
    }
);

const AddText = (props) => {

    const { model, onChangeModel } = props
    const [text, setText] = useState(model);
    const config = froalaConfig;

    const handleTextChange = (text) => {
        setText(text);
        onChangeModel(text);
    }

    return <FroalaEditor tag={'textarea'} config={config} model={text} onModelChange={handleTextChange} />
}

export default AddText;