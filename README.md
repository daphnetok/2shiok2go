# 2shiok2go_vue

This template should help get you started developing with Vue 3 in Vite.   

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Links

Cloud-hosted link: https://test-25bd6.web.app/

Git repo: https://github.com/daphnetok/2shiok2go

### Test Accounts

Buyer (seasoned user): 
  email: 'buyer@smu.com'
  password: '12345678'

Buyer (new user):
  email: 'new@smu.com'
  password: '12345678'

Hawker (seasoned user):
  email: 'chicken@smu.com'
  password: '12345678'

Hawker (new user):
  email: 'fishball@smu.com'
  password: '12345678'

### API Keys

Google Maps API
  1. Go to Google Cloud Console
  2. Create a new project or select existing
  3. Enable APIs: Maps JavaScript API, Places API, Geocoding API
  4. Create credentials (API Key)
  5. Add to .env as VITE_GOOGLE_MAPS_API_KEY

Google Gemini AI API
  1. Go to Google AI Studio
  2. Create API key
  3. Add to .env as VITE_GEMINI_API_KEY