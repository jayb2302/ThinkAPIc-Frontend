import { config } from '@vue/test-utils'

config.global.stubs = {
  Card: {
    template: '<div><slot name="title" /><slot name="content" /></div>'
  },
  Dialog: {
    props: ['visible'],
    emits: ['update:visible'],
    template: `
      <div v-if="visible">
        <slot name="container" :closeCallback="() => $emit('update:visible', false)" />
      </div>
    `
  },
  InputText: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<input type="email" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
  },
  Password: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<input type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
  },
  FloatLabel: {
    template: '<div><slot /><slot name="label" /></div>'
  },
  Button: {
    props: ['label'],
    template: '<button :aria-label="label" @click="$emit(\'click\')">{{ label }}</button>'
  },
  Divider: {
    template: '<hr />'
  },
  Toast: {
    template: '<div />'
  }
}