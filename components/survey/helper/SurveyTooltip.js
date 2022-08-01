import React, {useState, memo} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Grid, Tooltip, IconButton, ClickAwayListener } from '@material-ui/core'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'

const useStyles = makeStyles((theme) => ({
    iconButton: {
        padding:0,
        color:'#afafaf',
        '&:hover': {
            color:theme.palette.primary.main,
        }
    }
}))

function SurveyTooltip(props) {
    const classes = useStyles()
    const { children, title } = props
    const [open, setOpen] = useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    }

    const handleTooltipOpen = () => {
        setOpen(true);
    }

    if(!title){
        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        )
    }

    return (
      <Grid container spacing={1} alignItems="center">
          <Grid item>
              {children}
          </Grid>
          <Grid item>
              <ClickAwayListener onClickAway={handleTooltipClose}>
                  <div>
                      <Tooltip
                          PopperProps={{
                              disablePortal: true,
                          }}
                          onClose={handleTooltipClose}
                          open={open}
                          disableFocusListener
                          disableHoverListener
                          title={<div dangerouslySetInnerHTML={{__html: title.replace(/href/g, "target='_blank' href")}}></div>}
                          arrow
                          interactive
                      >
                          <IconButton color="primary" className={classes.iconButton} onClick={handleTooltipOpen}>
                              <InfoOutlinedIcon />
                          </IconButton>
                      </Tooltip>
                  </div>
              </ClickAwayListener>
          </Grid>
      </Grid>
    )
}

export default memo(SurveyTooltip)