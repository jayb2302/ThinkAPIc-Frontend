import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Login from './Login.vue'

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn()
  })
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    logIn: vi.fn(() => Promise.resolve()),
    registerUser: vi.fn(() => Promise.resolve()),
    isAuthenticated: true
  })
}))

vi.mock('@/services/toastService', () => ({
  useAppToast: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('Login.vue', () => {
  const mountLogin = () => {
    return mount(Login, {
      props: { visible: true },
    })
  }

  it('renders login form by default', () => {
    const wrapper = mountLogin()
    expect(wrapper.text()).toContain('Sign-In')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('switches to registration form when toggled', async () => {
    const wrapper = mountLogin()
    await wrapper.find('a').trigger('click') // toggle to register
    expect(wrapper.text()).toContain('Register')
    expect(wrapper.find('#confirm-password').exists()).toBe(true)
  })

  it('emits update:visible when dialog is closed', () => {
    const wrapper = mountLogin()
    wrapper.vm.$emit('update:visible', false)
    expect(wrapper.emitted('update:visible')).toBeTruthy()
  })

})