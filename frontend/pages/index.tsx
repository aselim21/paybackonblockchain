import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  CssBaseline,
  Grid,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,

} from '@mui/material';
import Copyright from "./components/Copyright";

export default function Home() {
  return (
    <>
      <CssBaseline />
      <AppBar position="static" sx={{ bgcolor: "#003eb0" }}>
        <Typography variant="h2" sx={{ color: "white", alignSelf: "center", my: 2 }}>Payback on Blockchain</Typography>
      </AppBar>

      <Grid container spacing={2} sx={{ my: 10, textAlign: "center" }}>
        <Grid item xs={12} sm={12} >
          <Button variant="contained" sx={{ bgcolor: "#002C7D", py: 2, width: "50%" }} onClick={event => window.location.href = 'payback-admin'} autoFocus>
            Payback Admin
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} sx={{ mt: 2 }}>
          <Button variant="contained" sx={{ bgcolor: "#003eb0", py: 2, width: "50%" }} onClick={event => window.location.href = 'payback'} autoFocus>
            Payback (public)
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} sx={{ mt: 2 }}>
          <Button variant="contained" sx={{ bgcolor: "#ee161f", py: 2, width: "50%" }} onClick={event => window.location.href = 'kaufland'} autoFocus>
            Kaufland (Partner)
          </Button>
        </Grid>
      </Grid>
      <Box sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5">Accounts for testing purposes:</Typography>
        <Typography variant="body1">
          (0) 0x358aae4923ff466f70ed16eedc348ac0306d8bf4 <br />
          (1) 0xeed4e440b4b4e170737b7c803173afcd9a08a1c3 <br />
          (2) 0x4a2a9a297c8a3b9fc58c22ea93bf3ff95db956fe <br />
          (3) 0x24660fe3d9dece8fff3b64ce548b4565157936a2 <br />
          (4) 0xf8a00bb5aaaa4e781ba99e3b3832d1a66eb002ea <br />
          (5) 0x5be309e4e9d26231931d43d8d3ddee140339d933 <br />
          (6) 0xc474d3441a4c203c316e729123dc4f15a05098a4 <br />
          (7) 0x76702dbe4c79868e3bec377a03ed3e923aacc352 <br />
          (8) 0x60c13ce2090581ab3411a9d5c8d933f388eba537 <br />
          (9) 0x93a6cbd8331b53e5276a86237bace339fc91e439 <br />
        </Typography>
      </Box>
      <Copyright />
    </>
  )
}