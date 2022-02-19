<template>
    <div class="flex">
        <template v-if="field.inlineOnIndex">
            <input
                :dusk="field.attribute"
                :name="field.name"
                :id="fieldId"
                class="w-full form-control form-input form-input-bordered"
                :class="errorClasses"
                :value="formattedDate"
                autocomplete="off"
                maxlength="10"
                ref="datePicker"
                type="text"
                :placeholder="field.name"
                @focus="openCalendar"
                @focusout="dateChange"
                @blur="closeEdit"
                :disabled="field.readonly"
            />

        </template>

        <template v-else>
            <span v-if="field.value" class="whitespace-no-wrap">
                {{formattedDate }}
            </span>
            <span v-else>&mdash;</span>
        </template>
    </div>
</template>

<script>
import moment from "moment";
import flatpickr from 'flatpickr';
import 'flatpickr/dist/themes/airbnb.css';
import { FormField, HandlesValidationErrors } from 'laravel-nova';
export default {
    mixins: [FormField, HandlesValidationErrors],

    props: ['resourceName', 'field'],

    data: () => ({
        flatpickr: null,
        isValidDate: true,
        localizedValue: ''
    }),
    computed: {
        resourceId() {
            return this.$parent.resource.id.value;
        },
        fieldId() {
            return `inline-text-field-${this.field.name}-${this.resourceId}`;
        },
        formattedDate() {
            if (this.field.format) {
                return moment(this.field.value).format(this.field.format);
            }
            if (moment(this.field.value).isValid()){
                return moment(this.field.value).format("YYYY-MM-DD");
            }
            return '';
        },
    },
    mounted() {
        this.field.value = this.field.value || '';
        if (this.field.value !== '') {
            this.localizedValue = this.timezoneAdjustments ? this.fromAppTimezone(this.field.value) : this.field.value;
        }
    },
    methods: {
        closeEdit() {
            this.field.value = this.field.value || '';
        },
        openCalendar() {
            this.$nextTick(() => {
                this.flatpickr = flatpickr(this.$refs.datePicker, {
                    allowInput: true,
                });
            });
        },
        dateChange(e) {
            this.isValidDate = this.checkValidDate(e.target.value);
            this.field.value = e.target.value;
            if (this.isValidDate) {
                if(this.localizedValue!==this.field.value){
                    this.localizedValue = this.field.value;

                    let formData = new FormData();
                    formData.append(this.field.attribute, e.target.value);
                    formData.append('_method', 'PUT');

                    return Nova.request().post(`/nova-api/${this.resourceName}/${this.resourceId}`, formData)
                        .then(
                            () => {
                                this.$toasted.show(`${this.field.name} updated to "${e.target.value || 'NULL'}"`, {
                                    type: 'success'
                                });
                            })
                        .catch(
                            (error) => {
                                this.$toasted.show(`Error ${error.response.status}: ${error.response.statusText}`, {
                                    type: 'error'
                                });
                            }
                        );
                }
            } else {
                this.$toasted.show(`${e.target.name} ${e.target.value} is not valid ('YYYY-MM-DD')`, {
                    type: 'error'
                });
            }
        },
        checkValidDate(date) {
            if (date.length === 0) {
                return true;
            }
            if (date.length !== 10) {
                return false;
            }
            if (moment(date, 'YYYY-MM-DD').isValid()) {
                return true;
            }
            return false;
        },
        closeDatePicker() {
            this.flatpickr.close();
        },
    },
    beforeDestroy() {
        if (this.flatpickr) {
            this.flatpickr.destroy();
        }
    },
}
</script>

