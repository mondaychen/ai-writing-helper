import globalConfig from '@extension/tailwindcss-config';
import type { Config } from 'tailwindcss';

export default {
  content: ['lib/**/*.tsx', 'app/**/*.tsx'],
  presets: [globalConfig],
} satisfies Config;
