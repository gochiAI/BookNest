<template>
  <component :is="Icon" v-bind="$attrs" />
</template>
<script setup>
import { h , defineComponent } from "vue";
import {
  ArrowDownWideNarrow,
  ArrowLeft,  
  ArrowRight,
  BookOpenCheck,
  Check,
  CirclePlus,
  SquarePen,
  EllipsisVertical,
  FunnelPlus,
  HelpCircle,
  Home,
  ImageUp,
  LayoutGrid,
  LayoutList,
  Library,
  Moon,
  Search,
  Settings,
  Sun,
  Trash,
  X,
} from "lucide-vue-next";

const icons = {
  add: CirclePlus,
  bookdetail: EllipsisVertical,
  booktype: FunnelPlus,
  check: Check,
  close: X,
  coverup: ImageUp,
  dark: Moon,
  edit: SquarePen ,
  help: HelpCircle,
  home: Home,
  "layout-grid": LayoutGrid,
  "layout-list": LayoutList,
  left: ArrowLeft,
  library: Library,
  light: Sun,
  readstatus: BookOpenCheck,
  right:ArrowRight ,
  search: Search,
  settings: Settings,
  sort: ArrowDownWideNarrow,
  trash: Trash,

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