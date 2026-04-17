import { NgModule } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  LayoutDashboard,
  Puzzle,
  ChevronLeft,
  ChevronRight,
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
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  List,
  FileEdit,
  Settings,
  BarChart3,
  KeyRound,
  // Web Screens prototype
  Menu,
  Bell,
  User,
  Monitor,
  MonitorSmartphone,
  Palette,
  Sliders,
  MonitorPlay,
  // Theme editor & controls
  Pencil,
  Copy,
  Image,
  Type,
  Megaphone,
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
} from 'lucide-angular';

/**
 * Модуль иконок Lucide.
 * Зарегистрируй все используемые иконки здесь.
 * Импортируй в любой standalone-компонент: `imports: [IconsModule]`
 * Использование в шаблоне: `<lucide-icon name="plus" [size]="18"></lucide-icon>`
 */
const icons = {
  LayoutDashboard,
  Puzzle,
  ChevronLeft,
  ChevronRight,
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
  X,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  List,
  FileEdit,
  Settings,
  BarChart3,
  // Web Screens prototype
  Menu,
  Bell,
  User,
  Monitor,
  MonitorSmartphone,
  Palette,
  Sliders,
  MonitorPlay,
  // Theme editor & controls
  Pencil,
  Copy,
  Image,
  Type,
  Megaphone,
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
};

@NgModule({
  imports: [LucideAngularModule.pick(icons)],
  exports: [LucideAngularModule],
})
export class IconsModule {}
