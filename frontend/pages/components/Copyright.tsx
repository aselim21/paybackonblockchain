import {
    Typography,
    Link
} from '@mui/material';

export default function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://github.com/aselim21/paybackonblockchain">
                Achelia Selim
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}