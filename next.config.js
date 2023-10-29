/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn-icons-png.flaticon.com']
  },
  webpack: config => {
    config.resolve.alias.canvas = false

    return config
  }
  //   experimental: {
  //     serverComponentsExternalPackages: ['sharp', 'onnxruntime-node']
  //   }
}

module.exports = nextConfig
