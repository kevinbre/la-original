/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'placeholder.co',
      'jumboargentina.vtexassets.com',
      'carrefourar.vtexassets.com',
      'ardiaprod.vtexassets.com',
      'www.brancastore.com.ar',
      'masonlineprod.vtexassets.com',
      'static.cotodigital3.com.ar',
      'diaonline.supermercadosdia.com.ar',
      'diastoreprod.vtexassets.com',
      'acdn-us.mitiendanube.com',
      'vinodelacava.com',
      'vinotecaligier.com',
      'adv-almacendevinos.com.ar',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
}

module.exports = nextConfig
