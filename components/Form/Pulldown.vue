<template>
  <div class="px-2 py-3">
    <label class="hidden lg:block" :for="id">{{ label }}</label>
    <div class="py-2">
      <Button class="block lg:hidden" v-if="iconName" :iconName="iconName" :iconSize="'24px'" type="icon" @click="toggleMenu" />
      <div class="relative">
        <div class="w-44 h-9 px-[5px] py-[5px] rounded-md border-2 hidden lg:block" @click="toggleMenu">
          {{ selectedLabel }}
        </div>
        <ul v-if="isMenuOpen" class="absolute bg-white border border-gray-300 rounded mt-1 w-44 z-10" ref="menu">
          <li v-for="option in options" :key="option.value" @click="selectOption(option)" class="px-4 py-2 hover:bg-gray-200 cursor-pointer">
            {{ option.label }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Button from '../Childs/Button.vue';

export default {
  components: {
    Button
  },
  props: {
    iconName: {
      type: String,
      required: false
    },
    label: {
      type: String,
      required: true
    },
    options: {
      type: Array,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isMenuOpen: false,
      selectedLabel: this.options.length > 0 ? this.options[0].label : ''
    };
  },
  methods: {
    toggleMenu(event) {
      event.stopPropagation();
      this.isMenuOpen = !this.isMenuOpen;
    },
    selectOption(option) {
      this.selectedLabel = option.label;
      this.isMenuOpen = false;
      this.$emit('input', option.value);
    },
    handleClickOutside(event) {
      if (this.$refs.menu && !this.$refs.menu.contains(event.target)) {
        this.isMenuOpen = false;
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  }
}
</script>