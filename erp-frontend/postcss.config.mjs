/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // تغییر مهم: استفاده از پکیج جدید
    '@tailwindcss/postcss': {}, 
    autoprefixer: {},
  },
};

export default config;