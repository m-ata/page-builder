import React, { useContext, useEffect, useState } from 'react'
import {connect} from "react-redux";
import dynamic from 'next/dynamic'
import Container from '@material-ui/core/Container'

// import FroalaEditor from 'react-froala-wysiwyg' dynamic;
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

import { ViewList } from '@webcms/orest'
import { OREST_ENDPOINT } from '../../../../../../../model/orest/constants'
import { useRouter } from 'next/router'
import WebCmsGlobal from '../../../../../../webcms-global'
import {Checkbox, FormControlLabel} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {froalaConfig} from "../../../../constants";

const EditParagraph = (props) => {

    const { paragraphComponent, handleCmponent, state, otherLangParagraph, handleDisable } = props

    const [model, setModel] = useState('');
    const [useBgColor, setUseBgColor] = useState(false);
    const config = froalaConfig;

    const router = useRouter();
    const companyId = router.query.companyID;
    const { GENERAL_SETTINGS, token } = useContext(WebCmsGlobal);
    const authToken = token || router.query.authToken;

    useEffect(() => {
        if (paragraphComponent?.gid) {
            ViewList({
                apiUrl: GENERAL_SETTINGS.OREST_URL,
                endpoint: OREST_ENDPOINT.HCMITEMTXTPAR,
                token: authToken,
                params: {
                    query: `gid:${paragraphComponent.gid}`,
                    hotelrefno: Number(companyId),
                },
            }).then((res) => {
                if (res.status === 200 && res.data.data.length > 0) {
                    if (state.langCode === state.defaultLang) {
                        setModel(res.data.data[0].itemtext)
                    } else {
                        setModel(otherLangParagraph.text);
                    }

                }
            })
        }
        paragraphComponent?.useBgColor && setUseBgColor(paragraphComponent.useBgColor);
    }, [paragraphComponent, otherLangParagraph]);

    useEffect(() => {
        model ? handleDisable(false) : handleDisable(true);
        if (state.langCode === state.defaultLang) {
            handleCmponent({
                service: model,
                type: paragraphComponent.type,
                gid: paragraphComponent.gid,
                width: paragraphComponent.width,
                id: paragraphComponent.id,
                useBgColor: useBgColor
            });
        } else {
            handleCmponent({
                text: model
            })
        }
    }, [model, useBgColor]);

    const handleModelChange = (model) => {
        setModel(model)
    }

    return (
        <Container>
            <Typography component={'div'}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={useBgColor}
                            onChange={() => setUseBgColor(!useBgColor)}
                            name="background-color"
                            color="primary"
                            style={{float: 'right'}}
                        />
                    }
                    label="Background Color"
                    disabled={state?.langCode !== state?.defaultLang}
                />
            </Typography>
            <FroalaEditor
                tag="textarea"
                config={config}
                model={model}
                onModelChange={handleModelChange}
            />
        </Container>
    )
}

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

export default connect(mapStateToProps)(EditParagraph)
