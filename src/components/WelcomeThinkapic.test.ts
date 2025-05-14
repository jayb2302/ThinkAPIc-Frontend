import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomeThinkapic from './WelcomeThinkapic.vue'

describe('WelcomeThinkapic.vue', () => {
  it('renders the welcome message', () => {
    const wrapper = mount(WelcomeThinkapic, {
      props: { msg: 'Welcome to Thinkapic' }
    })

    expect(wrapper.text()).toContain('Welcome to Thinkapic')
    expect(wrapper.text()).toContain('Practice with quizzes and exercises')
  })

  it('emits open-login when button is clicked', async () => {
    const wrapper = mount(WelcomeThinkapic, {
      props: { msg: 'Test' }
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted()).toHaveProperty('open-login')
  })
})