import { ref } from 'vue';

export const isVisible = ref(false);

export const openModal = () => {
  isVisible.value = true;
};

export const closeModal = () => {
  isVisible.value = false;
};