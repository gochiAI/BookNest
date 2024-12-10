import Toast, { useToast, POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, {
    position: POSITION.BOTTOM_RIGHT,
    transition: 'Vue-Toastification__fade',
    toastClassName: 'top-toast'
  });

  return {
    provide: {
      toast: useToast()
    }
  }
});
