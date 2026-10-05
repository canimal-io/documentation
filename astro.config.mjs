import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://docs.canimal.io',
  trailingSlash: 'always',
  integrations: [starlight({
    title: 'Canimal Systems Documentation',
    description: 'Documentation for Canimal Systems',
    credits: true,
    logo: { src: './public/assets/img/brandmark.png', replacesTitle: false },
    favicon: '/assets/img/favicon.ico',
    sidebar: [
      { label: 'Overview', link: '/' },
      { label: 'CAN-USB', items: [
        { label: 'Datasheet', link: '/products/can_to_usb/can_to_usb_specs/' },
        { label: 'User guide', link: '/products/can_to_usb/can_to_usb_guide/' },
      ] },
    ],
    customCss: ['./src/styles/custom.css'],
    components: { Footer: './src/components/Footer.astro' },
  })],
});
