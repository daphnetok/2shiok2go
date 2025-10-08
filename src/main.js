import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// icons
import { library } from '@fortawesome/fontawesome-svg-core';  // Import the FontAwesome library
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';  // Import the FontAwesomeIcon component
import { fas } from '@fortawesome/free-solid-svg-icons';  // Import solid icons

// Add the icons you want to use to the library
library.add(fas);

const app = createApp(App)

// Register FontAwesomeIcon globally
app.component('font-awesome-icon', FontAwesomeIcon);

app.use(createPinia())
app.use(router)

app.mount('#app')


