import { createI18n } from 'vue-i18n';
import ptBR from './pt-BR.json';
import en from './en.json';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'pt-BR',
  fallbackLocale: 'pt-BR',
  messages: {
    'pt-BR': ptBR,
    'en': en
  }
});

export default i18n;
