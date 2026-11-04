import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import { isFixtureOutDir } from './src/lib/firmware.mjs';

function outDir() {
  const v = process.env.ASTRO_OUT_DIR;
  if (!v) return './dist';
  if (!isFixtureOutDir(v)) throw new Error('ASTRO_OUT_DIR must match ^dist-[a-z]+$');
  return `./${v}`;
}

export default defineConfig({
  site: 'https://docs.canimal.io',
  trailingSlash: 'always',
  // Only the fixture browser builds set this; the real site always builds to dist/.
  outDir: outDir(),
  integrations: [starlight({
    title: 'Canimal Systems Documentation',
    description: 'Documentation for Canimal Systems',
    credits: true,
    // Keep long examples readable without an unfocusable horizontal scroll region.
    // Wrapping changes presentation only; copied code retains its original lines.
    expressiveCode: { defaultProps: { wrap: true } },
    logo: { src: './public/assets/img/brandmark.png', replacesTitle: false },
    favicon: '/assets/img/favicon.ico',
    sidebar: [
      { label: 'Overview', link: '/' },
      { label: 'CAN-USB', items: [
        { label: 'Datasheet', link: '/products/can_to_usb/can_to_usb_specs/' },
        { label: 'User guide', link: '/products/can_to_usb/can_to_usb_guide/' },
        { label: 'Firmware', link: '/products/can_to_usb/firmware/' },
      ] },
    ],
    customCss: ['./src/styles/custom.css'],
    components: { Footer: './src/components/Footer.astro' },
  })],
});
