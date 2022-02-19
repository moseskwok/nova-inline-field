Nova.booting((Vue, router, store) => {
    Vue.component('index-nova-inline-field', require('./components/IndexField'))
    Vue.component('detail-nova-inline-field', require('./components/DetailField'))
    Vue.component('form-nova-inline-field', require('./components/FormField'))

    Vue.component('index-inline-date', require('./components/InlineDate/IndexField'))
    Vue.component('detail-inline-date', require('./components/InlineDate/DetailField'))
    Vue.component('form-inline-date', require('./components/InlineDate/FormField'))

    Vue.component('index-inline-datetime', require('./components/InlineDateTime/IndexField'))
    Vue.component('detail-inline-datetime', require('./components/InlineDateTime/DetailField'))
    Vue.component('form-inline-datetime', require('./components/InlineDateTime/FormField'))
})
