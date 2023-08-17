// import { Vue } from 'vue'
import * as Vue from 'vue'
import App from './App.vue'
// import router from './router';

// const app = Vue(App)
// // Make sure to _use_ the router instance to make the
// // whole app router-aware.
// app.use(router)

// app.mount('#app')

// Vue(App).use(router).mount('#app')
// Vue(App).mount('#app')


new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');