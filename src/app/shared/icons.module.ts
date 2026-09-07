import { NgModule } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  LayoutDashboard,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Trash2,
  Search,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  BadgeCheck,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  List,
  FileEdit,
  Settings,
  BarChart3,
  KeyRound,
  // MenuList & dish selector
  CheckSquare,
  ImageOff,
  // Web Screens prototype
  Menu,
  Bell,
  User,
  Monitor,
  MonitorSmartphone,
  Computer,
  Palette,
  Sliders,
  MonitorPlay,
  // Theme editor & controls
  Pencil,
  Copy,
  Clipboard,
  Image,
  Type,
  Megaphone,
  MessageSquare,
  Film,
  Lightbulb,
  MousePointerClick,
  AlignLeft,
  AlignCenter,
  AlignRight,
  // Eagle Admin prototype
  RefreshCw,
  Loader2,
  Circle,
  Wallet,
  // Eagle Admin Panel
  Bot,
  MapPin,
  XCircle,
  // POS dialogs
  WifiOff,
  ShieldAlert,
  CreditCard,
  // Eagle POS plugin
  Utensils,
  Package,
  Radio,
  Printer,
  QrCode,
  Octagon,
  // Eagle catalog (v1.2)
  Receipt,
  Workflow,
  LayoutGrid,
  SprayCan,
  Clock,
  MapPinOff,
  // Eagle send_dish v1.3
  ChefHat,
  Repeat,
  Zap,
  // Eagle v1.4 fire-and-forget + robot status
  Send,
  Activity,
  // Access control
  Lock,
  LogOut,
  Eye,
  EyeOff,
  // Reset button
  RotateCcw,
  // Changelog
  ScrollText,
  // Rename / confirm inline edit
  Check,
  // Eagle v1.8: plugins menu
  Terminal,
  // Eagle v1.10: registration
  TimerOff,
  // Neptune
  ScanLine,
  Star,
  Gift,
  Users,
  // Demo Wizard
  Wand2,
  Camera,
  Upload,
  // Comet OAuth onboarding
  LogIn,
  UserPlus,
  Building2,
  FileCheck,
  Key,
  PanelRightOpen,
  // Hints anatomy panel
  Maximize2,
  BookOpen,
  Columns,
  Rows,
  // Hints button variants
  ShoppingCart,
  // Web screens sidebar v2
  Volume2,
  LayoutList,
  PlusCircle,
  // Arrivals theme editor
  Folder,
  File,
  Home,
  // Arrivals price element
  Tag,
  // Neptune v2 catalog
  Hash,
  ShieldOff,
  UserX,
  ServerOff,
  ToggleLeft,
  Database,
  // Neptune v3 TTL / API console / context
  Timer,
  Code2,
  Coffee,
  // Aurora prototype
  Smartphone,
  DownloadCloud,
  ArrowLeftRight,
  Square,
  Store,
  Play,
  Download,
  // Sound generation
  Mic,
  FileAudio,
  // Arrivals area emulation
  Pause,
  // Inspector vertical alignment
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  // External consent prototype
  Plug,
  ShieldCheck,
  Inbox,
  Undo2,
  CheckCircle,
  // POS Terminal shell
  Wrench,
  Power,
  Mail,
  // POS Orders module
  Truck,
  Minus,
  MinusSquare,
  Banknote,
  ChevronsUp,
  MoreVertical,
  Filter,
  CalendarCheck,
  Ban,
  // Sparrow notifications
  BellRing,
  // Sparrow backend panel
  Shuffle,
  // Price element tree
  Ruler,
  // Element grouping accordion
  Layers,
  Paintbrush,
  // Variant switcher (cs-terminals)
  PanelRight,
  ChevronsDownUp,
  // Atlas prototype
  Unplug,
  UtensilsCrossed,
  Percent,
  // Web screens campaigns
  FilePlus2,
  FolderPlus,
  Signpost,
  GripVertical,
  Calendar,
  ArrowUp,
  ArrowDown,
  FolderOpen,
  // Arrivals theme editor toolbar
  Magnet,
} from 'lucide-angular';

/**
 * РњРѕРґСѓР»СЊ РёРєРѕРЅРѕРє Lucide.
 * Р—Р°СЂРµРіРёСЃС‚СЂРёСЂСѓР№ РІСЃРµ РёСЃРїРѕР»СЊР·СѓРµРјС‹Рµ РёРєРѕРЅРєРё Р·РґРµСЃСЊ.
 * РРјРїРѕСЂС‚РёСЂСѓР№ РІ Р»СЋР±РѕР№ standalone-РєРѕРјРїРѕРЅРµРЅС‚: `imports: [IconsModule]`
 * РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ РІ С€Р°Р±Р»РѕРЅРµ: `<lucide-icon name="plus" [size]="18"></lucide-icon>`
 */
const icons = {
  LayoutDashboard,
  Puzzle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Trash2,
  Search,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  BadgeCheck,
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  List,
  FileEdit,
  Settings,
  BarChart3,
  CheckSquare,
  ImageOff,
  // Web Screens prototype
  Menu,
  Bell,
  User,
  Monitor,
  MonitorSmartphone,
  Computer,
  Palette,
  Sliders,
  MonitorPlay,
  // Theme editor & controls
  Pencil,
  Copy,
  Clipboard,
  Image,
  Type,
  Megaphone,
  MessageSquare,
  Film,
  Lightbulb,
  MousePointerClick,
  AlignLeft,
  AlignCenter,
  AlignRight,
  // Eagle Admin prototype
  RefreshCw,
  Loader2,
  Circle,
  Wallet,
  // Eagle Admin Panel
  Bot,
  MapPin,
  XCircle,
  // POS dialogs
  WifiOff,
  ShieldAlert,
  CreditCard,
  // Eagle POS plugin
  Utensils,
  Package,
  Radio,
  Printer,
  QrCode,
  Octagon,
  // Eagle catalog (v1.2)
  Receipt,
  Workflow,
  LayoutGrid,
  SprayCan,
  Clock,
  MapPinOff,
  // Eagle send_dish v1.3
  ChefHat,
  Repeat,
  Zap,
  // Eagle v1.4 fire-and-forget + robot status
  Send,
  Activity,
  // Access control
  Lock,
  LogOut,
  Eye,
  EyeOff,
  KeyRound,
  // Reset button
  RotateCcw,
  // Changelog
  ScrollText,
  // Rename / confirm inline edit
  Check,
  // Eagle v1.8: plugins menu
  Terminal,
  // Eagle v1.10: registration
  TimerOff,
  // Neptune
  ScanLine,
  Star,
  Gift,
  Users,
  // Demo Wizard
  Wand2,
  Camera,
  Upload,
  // Comet OAuth onboarding
  LogIn,
  UserPlus,
  Building2,
  FileCheck,
  Key,
  PanelRightOpen,
  // Hints anatomy panel
  Maximize2,
  BookOpen,
  Columns,
  Rows,
  // Hints button variants
  ShoppingCart,
  // Web screens sidebar v2
  Volume2,
  LayoutList,
  PlusCircle,
  // Arrivals theme editor
  Folder,
  File,
  Home,
  // Arrivals price element
  Tag,
  // Neptune v2 catalog
  Hash,
  ShieldOff,
  UserX,
  ServerOff,
  ToggleLeft,
  Database,
  // Neptune v3 TTL / API console / context
  Timer,
  Code2,
  Coffee,
  // Aurora prototype
  Smartphone,
  DownloadCloud,
  ArrowLeftRight,
  Square,
  Store,
  Play,
  Download,
  // Sound generation
  Mic,
  FileAudio,
  // Arrivals area emulation
  Pause,
  // Inspector vertical alignment
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  // External consent prototype
  Plug,
  Unplug,
  ShieldCheck,
  Inbox,
  Undo2,
  CheckCircle,
  // POS Terminal shell
  Wrench,
  Power,
  Mail,
  // POS Orders module
  Truck,
  Minus,
  MinusSquare,
  Banknote,
  ChevronsUp,
  MoreVertical,
  Filter,
  CalendarCheck,
  Ban,
  UtensilsCrossed,
  Percent,
  // Sparrow notifications
  BellRing,
  // Sparrow backend panel
  Shuffle,
  // Price element tree
  Ruler,
  // Element grouping accordion
  Layers,
  Paintbrush,
  // Variant switcher (cs-terminals)
  PanelRight,
  ChevronsDownUp,
  // Web screens campaigns
  FilePlus2,
  FolderPlus,
  Signpost,
  GripVertical,
  Calendar,
  ArrowUp,
  ArrowDown,
  FolderOpen,
  // Arrivals theme editor toolbar
  Magnet,
};

@NgModule({
  imports: [LucideAngularModule.pick(icons)],
  exports: [LucideAngularModule],
})
export class IconsModule {}
