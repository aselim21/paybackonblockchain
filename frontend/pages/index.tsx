import {
  AppBar,
  Box,
  Typography,
  Button,
  CssBaseline,
  Grid,
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
          <Button variant="contained" sx={{ bgcolor: "#002C7D", py: 2, width: "50%" }} href="payback-admin" target="_blank" autoFocus>
            Payback Admin
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} sx={{ mt: 2 }}>
          <Button variant="contained" sx={{ bgcolor: "#003eb0", py: 2, width: "50%" }} href='payback' target="_blank" autoFocus>
            Payback (public)
          </Button>
        </Grid>
        <Grid item xs={12} sm={12} sx={{ mt: 2 }}>
          <Button variant="contained" sx={{ bgcolor: "#ee161f", py: 2, width: "50%" }} href='kaufland' target="_blank" autoFocus>
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
        <Typography variant="h6">Public Keys</Typography>
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
        <Typography variant="h6">Private Keys</Typography>
        <Typography variant="body1">
          (0) 396a5481b6f3355ab1b4f4797908ecb35a3526bafd77c97999daabbd9881f479 <br />
          (1) 301bec3a22c3dde250bb977bbff1b544ea12acc75ba8dbdba6b25ef62314d4b7 <br />
          (2) d557f3f226e0f053bcf462eb3c99bb36f494194d4761bac7cd98030683ac2fc6 <br />
          (3) f432e4fd02ea9e5c8a08ac2d6cbb8fa2d6005391b5ec3df8e4f25a9585b81cd0 <br />
          (4) 5a04ad57374d2b5d717e12d7cc67e6f377a01be1339a5d2f8a2b68f4d12f02fb <br />
          (5) 16d5ce2f416fd70768a2e1c1d8f1b3d5a9dc675b888b2ec49e87a7a7a45841ea <br />
          (6) 5f2e06afcd949a3aae5eab958ed1fbe507eb3bb979d8dabaebe0bfbd4d2e5cdf <br />
          (7) dd4d7ba8f2bc0e2c829ff613929759557b1a7b05d8417b9a46b563f461316e9c <br />
          (8) 64dd510852685a1dad2c80a2f1f70295c1f93f390ccdfe7a22cca906a40af86b <br />
          (9) b8d083e1da86521ae31351769faea47b49a39b44c5074c52db59818c6a762665 <br />
        </Typography>
      </Box>
      <Copyright />
    </>
  )
}