import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import <%= name.capital %>Component from './<%= name.kebab %>.vue';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      '<%= name.lower %>': {
        title: '<%= name.capital %>'
      }
    }
  }
});

describe('<%= name.capital %>Component', () => {
  function createWrapper(options = {}) {
    return mount(<%= name.capital %>Component, {
      global: {
        plugins: [i18n]
      },
      ...options
    });
  }

  it('should render the component', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('.<%= name.kebab %>-component').exists()).toBe(true);
  });

  it('should display the title', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('h2').text()).toBe('<%= name.capital %>');
  });

  it('should render slot content', () => {
    const wrapper = createWrapper({
      slots: {
        default: '<p>Slot content</p>'
      }
    });
    expect(wrapper.find('p').text()).toBe('Slot content');
  });
});
