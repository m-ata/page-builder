//react imports
import React, {useEffect} from 'react';
//redux imports
import { connect } from 'react-redux';
//custom imports
import EmailHeader from "../../components/email/header/EmailHeader";
import EmailFooter from "../../components/email/footer/EmailFooter";
import Image from "../../components/page/sections/image/Image";
import Paragraph from "../../components/page/sections/paragraph/Paragraph";
//material ui imports
import {Container, Typography, Grid} from "@material-ui/core";
import {updateState} from "../../../../../state/actions";

const EmailPreview = (props) => {
    const {
        state,
        updateState
    } = props;

    useEffect(() => {
        const seen = new Set();
        const filteredArr = state.translatedLanguages.filter(el => {
            const duplicate = seen.has(el.id);
            seen.add(el.id);
            return !duplicate;
        });
        updateState('pageBuilder', 'translatedLanguages', filteredArr)
    }, []);

    return (
        <Container>
            <Typography component={'div'}>
                {
                    state.langCode === state.defaultLang &&
                    Object.keys(state.email.header).length > 0 &&
                    <EmailHeader
                        tpl={state.email.header.tpl}
                        items={state.email.header.items}
                    />
                }
                {
                    state.langCode !== state.defaultLang &&
                    Object.keys(state.email.header).length > 0 &&
                    <EmailHeader
                        tpl={state.email.header.tpl}
                        items={state.langsFile.header[state.langCode].items}
                    />
                }
            </Typography>
            <Typography component={'div'}>
                {
                    state?.langCode !== state?.defaultLang &&
                    state?.langsFile?.body?.[state.langCode]?.items?.length > 0 &&
                    state.langsFile.body[state.langCode].items.map((item, index) => {
                        return (
                                <Grid container spacing={3} key={index} style={{marginTop: 4}}>
                                    {
                                        item?.items?.length > 0 && item.items.map((subItem, i) => {
                                            return (
                                                <Grid item
                                                      style={{width: state?.email?.body[index]?.items[i]?.width + '%'}}
                                                      key={i}
                                                >
                                                    {
                                                        ('image' in subItem) &&
                                                        <Image
                                                            imageComponent={state?.email?.body[index]?.items[i]}
                                                            otherLangsImage={subItem.image}
                                                        />
                                                    }
                                                    {
                                                        ('text' in subItem) &&
                                                            <div
                                                                style={{backgroundColor: state?.email?.body[index]?.items[i]?.useBgColor ? state?.assets?.colors?.message?.main : 'white', height: '100%'}}
                                                            >
                                                                <Paragraph
                                                                    paragraph={subItem.text}
                                                                />
                                                            </div>
                                                    }
                                                </Grid>
                                            )
                                        })
                                    }
                                </Grid>
                        )
                    })
                }
                {
                    state?.langCode === state?.defaultLang && state?.email?.body?.length > 0 &&
                    state.email.body.map((body, index) => {
                        return (
                            <Grid container spacing={1} key={index} style={{marginTop: 4}}>
                                {
                                    body?.items?.length > 0 && body.items.map((item, i) => {
                                        return (
                                            <Grid
                                                item
                                                style={{width: item.width + '%'}} key={i}
                                            >
                                                {
                                                    item?.type === 'image' &&
                                                    <Image imageComponent={item} />
                                                }
                                                {
                                                    item?.type === 'paragraph' &&
                                                    <div
                                                        style={{backgroundColor: item?.useBgColor ? state?.assets?.colors?.message?.main : 'white', height: '100%'}}
                                                    >
                                                        <Paragraph paragraph={item} />
                                                    </div>
                                                }
                                            </Grid>
                                        )
                                    })
                                }
                            </Grid>
                        )
                    })
                }
            </Typography>
            <Typography component={'div'} style={{marginTop: 4}}>
                {
                    state.langCode === state.defaultLang &&
                    Object.keys(state.email.footer).length > 0 &&
                    <EmailFooter
                        items={state.email.footer.items}
                    />
                }
                {
                    state.langCode && state.langCode !== state.defaultLang &&
                    state?.langsFile?.footer?.[state.langCode]?.items &&
                    <EmailFooter items={state.langsFile.footer[state.langCode].items} />
                }
            </Typography>

        </Container>
    )
};

const mapStateToProps = state => {
    return {
        state: state.formReducer.pageBuilder
    }
};

const mapDispatchToProps = dispatch => ({
    updateState: (stateType, stateName, value) => dispatch(updateState(stateType, stateName, value)),
});

export default connect(
    mapStateToProps, mapDispatchToProps
)(EmailPreview)