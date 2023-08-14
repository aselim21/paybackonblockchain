/** @type {import('next').NextConfig} */
const nextConfig = {
    env:{
        BLOCKCHAIN_URL: 'http://127.0.0.1:9545/',
        PUBLIC_KEY_PayBack: "0x5178d8654301ab965fbcb031b5c4ed8b3ec598d2",
        PRIVATE_KEY_PayBack: '396a5481b6f3355ab1b4f4797908ecb35a3526bafd77c97999daabbd9881f479',
        CONTRACT_ADDRESS: '0x1D1131D30E9824969Fc3e0959C5E0dA71c6a726D',
    }
}

module.exports = nextConfig
