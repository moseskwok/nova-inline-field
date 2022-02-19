<template>
    <div class="flex">
        <template v-if="field.inlineOnIndex">
            <date-time-picker
                class="w-full form-control form-input form-input-bordered"
                ref="dateTimePicker"
                :dusk="field.attribute"
                :name="field.name"
                :placeholder="field.name"
                :dateFormat="pickerFormat"
                :alt-format="pickerDisplayFormat"
                :value="localizedValue"
                :twelve-hour-time="usesTwelveHourTime"
                :first-day-of-week="firstDayOfWeek"
                :class="errorClasses"
                @change="dateChange"
                :disabled="field.readonly"
            />
        </template>

        <template v-else>
            <span v-if="field.value" class="whitespace-no-wrap">
                {{localizedValue}}
            </span>
            <span v-else>&mdash;</span>
        </template>
    </div>
</template>

<script>
import {
    FormField,
    HandlesValidationErrors,
    InteractsWithDates,
} from 'laravel-nova'

export default {
    mixins: [HandlesValidationErrors, FormField, InteractsWithDates],

    data: () => ({
        localizedValue: ''
    }),

    methods: {
        /*
         * Set the initial value for the field
         */
        setInitialValue() {
            // Set the initial value of the field
            this.value = this.field.value || ''

            // If the field has a value let's convert it from the app's timezone
            // into the user's local time to display in the field
            if (this.value !== '') {
                this.localizedValue = this.fromAppTimezone(this.value)
            }
        },

        /**
         * On save, populate our form data
         */
        fill(formData) {
            formData.append(this.field.attribute, this.value || '')
        },

        /**
         * Update the field's internal value when it's value changes
         */
        handleChange(value) {
            this.value = this.toAppTimezone(value)
        },

        async dateChange(value) {
            this.value = this.toAppTimezone(value)
            if(this.localizedValue!==this.value){
                this.localizedValue = this.value;

                let formData = new FormData();
                formData.append(this.field.attribute, this.value);
                formData.append('_method', 'PUT');

                return Nova.request().post(`/nova-api/${this.resourceName}/${this.resourceId}`, formData)
                    .then(
                        () => {
                            this.$toasted.show(`${this.field.name} updated to "${this.value || 'NULL'}"`, {
                                type: 'success'
                            });
                        });
            }
        }
    },

    computed: {
        firstDayOfWeek() {
            return this.field.firstDayOfWeek || 0
        },

        format() {
            return this.field.format || 'YYYY-MM-DD HH:mm:ss'
        },

        placeholder() {
            return this.field.placeholder || moment().format(this.format)
        },

        pickerFormat() {
            return this.field.pickerFormat || 'Y-m-d H:i:S'
        },

        pickerDisplayFormat() {
            return this.field.pickerDisplayFormat || 'Y-m-d H:i:S'
        },
        resourceId() {
            return this.$parent.resource.id.value;
        },
        fieldId() {
            return `inline-text-field-${this.field.name}-${this.resourceId}`;
        },
    },
}
</script>
