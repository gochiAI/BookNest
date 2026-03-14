import { ref } from 'vue';

export const isOpen = ref(false);

export const openDrawer = () => {
  isOpen.value = true;
};

export const closeDrawer = () => {
  isOpen.value = false;
};