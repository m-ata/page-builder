import React,{useState, useEffect} from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import LoadingSpinner from 'components/LoadingSpinner'
import Button from '@material-ui/core/Button'
import { useRouter } from 'next/router'
import useTranslation from 'lib/translations/hooks/useTranslation'

const RoomTypeSliderFrame = (props) => {
    const router = useRouter()
    const token = router.query.authToken
    const companyId = router.query.companyID
    const { t } = useTranslation()
    const { open, onClose, masterid} = props
    const [sliderFrameUrl, setSliderFrameUrl] = useState(false)
    const [frameIsDisplay, setFrameIsDisplay] = useState(false)

    useEffect(() => {
        let active = true
        if (active && open && masterid) {
            console.log(masterid)
            setSliderFrameUrl(window.location.protocol + '//' + window.location.host + '/page-builder?' + `isOweb=1&companyID=${companyId}&authToken=${token}&sliderOnly=true&masterid=${masterid}`)
        }

        return () => {
            active = false
        }
    }, [open, masterid])


    return (
        <React.Fragment>
            <Dialog
                open={open}
                onClose={()=> onClose(false)}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
                maxWidth={"lg"}
                fullWidth
                PaperProps={{
                    style:{
                        width: '100%',
                        height: '100%'
                    }
                }}
            >
                <DialogContent dividers style={{ overflow: 'hidden' }}>
                {!frameIsDisplay && (<LoadingSpinner style={{marginTop: '20%'}} size={60}/>)}
                <iframe
                    onLoadCapture={()=> setFrameIsDisplay(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        display: frameIsDisplay ? 'block' : 'none'
                    }} src={sliderFrameUrl} frameBorder="0" allowFullScreen></iframe>
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

export default RoomTypeSliderFrame