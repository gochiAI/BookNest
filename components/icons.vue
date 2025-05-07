<template>
  <component :is="Icon" v-bind="$attrs" />
</template>
<script setup>
import { h } from "vue";
import {
  ArrowDownWideNarrow,
  BookOpenCheck,
  Check,
  CirclePlus,
  Edit,
  EllipsisVertical,
  FunnelPlus,
  HelpCircle,
  Home,
  LayoutGrid,
  LayoutList,
  Moon,
  Search,
  Settings,
  Sun,
  X,
} from "lucide-vue-next";

const icons = {
  add: CirclePlus,
  bookdetail: EllipsisVertical,
  booktype: FunnelPlus,
  check: Check,
  close: X,
  dark: Moon,
  edit: Edit,
  help: HelpCircle,
  home: Home,
  "layout-grid": LayoutGrid,
  "layout-list": LayoutList,
  light: Sun,
  readstatus: BookOpenCheck,
  search: Search,
  settings: Settings,
  sort: ArrowDownWideNarrow,

};

/**
 * アイコンを動的にレンダリングするコンポーネント
 */
const Icon = defineComponent({
  name: "Icon",
  props: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: [String, Number],
      default: 24,
    },
    color: {
      type: String,
      default: "currentColor",
    },
  },
  setup(props) {
    return () => {
      const IconComponent = icons[props.name];
      return h(IconComponent, {
        width: props.size,
        height: props.size,
        color: props.color,
      });
    };
  },
});


</script>