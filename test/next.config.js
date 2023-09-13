/** @type {import('next').NextConfig} */
const nextConfig = {
    env:{
        BLOCKCHAIN_URL: 'http://127.0.0.1:9545/',
        // BLOCKCHAIN_URL: "https://goerli.infura.io/v3/b3733ea818e64a02a10be4e27b09d732",
        PUBLIC_KEY_PayBack: "0x358AaE4923FF466F70ed16eEdc348ac0306d8bf4",
        PRIVATE_KEY_PayBack: '396a5481b6f3355ab1b4f4797908ecb35a3526bafd77c97999daabbd9881f479',
        PUBLIC_KEY_Partner1: "0xeed4e440b4b4e170737b7c803173afcd9a08a1c3",
        PRIVATE_KEY_Partner1: '301bec3a22c3dde250bb977bbff1b544ea12acc75ba8dbdba6b25ef62314d4b7',
        PUBLIC_KEY_Partner2: "0x4a2a9a297c8a3b9fc58c22ea93bf3ff95db956fe",
        PRIVATE_KEY_Partner2: 'd557f3f226e0f053bcf462eb3c99bb36f494194d4761bac7cd98030683ac2fc6',
        CONTRACT_ADDRESS: '0xB633B1ed4C572aA71C2320D4f7b30623De002042',
    }
}

module.exports = nextConfig
