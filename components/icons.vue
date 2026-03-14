<template>
  <component :is="Icon" v-bind="$attrs" />
</template>
<script setup>
import { h , defineComponent } from "vue";
import {
  ArrowDownWideNarrow,
  ArrowLeft,  
  ArrowRight,
  ArrowDown,
  Award,
  BarChart2,
  BookOpenCheck,
  Calendar,
  Check,
  CirclePlus,
  SquarePen,
  EllipsisVertical,
  Download,
  FileText,
  FunnelPlus,
  HelpCircle,
  Home,
  ImageUp,
  Info,
  Layers,
  LayoutGrid,
  LayoutList,
  Library,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  Tag,
  Trash,
  Upload,
  X,
  Book,
  Users,
  Building2,
} from "lucide-vue-next";

const icons = {
  add: CirclePlus,
  award: Award,
  barChart2: BarChart2,
  bookdetail: EllipsisVertical,
  booktype: FunnelPlus,
  calendar: Calendar,
  check: Check,
  close: X,
  coverup: ImageUp,
  dark: Moon,
  down: ArrowDown,
  download: Download,
  edit: SquarePen,
  fileText: FileText,
  help: HelpCircle,
  home: Home,
  info: Info,
  "layout-grid": LayoutGrid,
  "layout-list": LayoutList,
  layers: Layers,
  left: ArrowLeft,
  library: Library,
  light: Sun,
  menu: Menu,
  plus: Plus,
  readstatus: BookOpenCheck,
  right: ArrowRight,
  search: Search,
  settings: Settings,
  sort: ArrowDownWideNarrow,
  tag: Tag,
  trash: Trash,
  upload: Upload,
  book: Book,
  users: Users,
  building2: Building2,
  alert: HelpCircle, // 不足情報用
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