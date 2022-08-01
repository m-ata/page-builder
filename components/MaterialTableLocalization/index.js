import React from "react";
import useTranslation from "../../lib/translations/hooks/useTranslation";


export default function MaterialTableLocalization() {
    const { t } = useTranslation();

    return {
        body: {
            emptyDataSourceMessage: t('str_noRecordsToDisplay'),
            addTooltip: t('str_add'),
            deleteTooltip: t('str_delete'),
            editTooltip: t('str_edit'),
            filterRow: {
                filterTooltip: t('str_filter')
            },
            editRow: {
                deleteText: t('str_confirmDeleteRecord'),
                cancelTooltip: t('str_cancel'),
                saveTooltip: t('str_save')
            }
        },
        toolbar: {
            searchTooltip: t('str_search'),
            searchPlaceholder: t('str_search')
        },
        pagination: {
            labelRowsSelect: t('str_line'),
            labelDisplayedRows: t('str_labelDisplayedRows'),
            firstTooltip: t('str_firstPage'),
            previousTooltip: t('str_previousPage'),
            nextTooltip: t('str_nextPage'),
            lastTooltip: t('str_lastPage')
        }
    }
}