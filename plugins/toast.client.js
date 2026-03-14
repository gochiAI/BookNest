import VueToastification from 'vue-toastification';
import 'vue-toastification/dist/index.css';

export default defineNuxtPlugin((nuxtApp) => {
  const toastModule = VueToastification || {};
  const Toast = toastModule.default || toastModule;
  const POSITION = toastModule.POSITION || {};
  const useToast = toastModule.useToast;

  nuxtApp.vueApp.use(Toast, {
    position: POSITION.BOTTOM_RIGHT || 'bottom-right',
    transition: 'Vue-Toastification__fade',
    toastClassName: 'top-toast'
  });

  return {
    provide: {
      toast: typeof useToast === 'function'
        ? useToast()
        : nuxtApp.vueApp.config.globalProperties.$toast
    }
  }
});
