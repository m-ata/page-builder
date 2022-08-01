import React,{useState, useEffect} from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import useTranslation from 'lib/translations/hooks/useTranslation'
import RoomAttrList from './roomattr'

const RoomTypeFeatures = (props) => {
    const { t } = useTranslation()
    const { open, onClose, roomGid} = props

    return (
        <React.Fragment>
            <Dialog
                open={open}
                onClose={()=> onClose(false)}
                aria-labelledby="alert-dialog-features-title"
                aria-describedby="alert-dialog-features-description"
                maxWidth={"lg"}
                fullWidth
                PaperProps={{
                    style:{
                        width: '100%',
                        height: '100%'
                    }
                }}
            >
                <DialogTitle>{t('str_roomFeatures')}</DialogTitle>
                <DialogContent dividers style={{ overflow: 'hidden' }}>
                    <RoomAttrList roomGid={roomGid}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=> onClose(false)} color="primary">
                        {t('str_close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    )
}

export default RoomTypeFeatures