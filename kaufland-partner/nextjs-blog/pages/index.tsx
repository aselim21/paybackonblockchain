import Head from 'next/head';
// import { Header } from "../components/Header";
// import { Footer } from "../components/Footer";
// import { Welcome } from "../components/Welcome";
// import theme from "../utils/theme";
// import { ThemeProvider, CssBaseline } from "@mui/material";
import { ShoppingCart } from "../components/ShoppingCart";

export default function Home() {
    return (
        <>
            <Head>
                <title>{process.env.APP_NAME}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>



            <main>

                <ShoppingCart />


            </main>



        </>
    )
}