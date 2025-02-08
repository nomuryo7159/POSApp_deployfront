require('dotenv').config()
/** @type {import('next').NextConfig} */
const nextConfig = {
    serverRuntimeConfig: {
        port: process.env.PORT || 3000, // Azure では `process.env.PORT` を使用
    },
    env: {
        // Reference a variable that was defined in the .env file and make it available at Build Time
        API_ENDPOINT: process.env.API_ENDPOINT,
      },
}

module.exports = nextConfig
