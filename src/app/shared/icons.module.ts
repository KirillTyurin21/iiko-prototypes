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
  // Pudu Admin prototype
  RefreshCw,
  Loader2,
  Circle,
  Wallet,
  // Pudu Admin Panel
  Bot,
  MapPin,
  XCircle,
  // POS dialogs
  WifiOff,
  ShieldAlert,
  CreditCard,
  // PUDU POS plugin
  Utensils,
  Package,
  Radio,
  Printer,
  QrCode,
  // Access control
  Lock,
  LogOut,
  Eye,
  EyeOff,
  // Reset button
  RotateCcw,
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
  // Pudu Admin prototype
  RefreshCw,
  Loader2,
  Circle,
  Wallet,
  // Pudu Admin Panel
  Bot,
  MapPin,
  XCircle,
  // POS dialogs
  WifiOff,
  ShieldAlert,
  CreditCard,
  // PUDU POS plugin
  Utensils,
  Package,
  Radio,
  Printer,
  QrCode,
  // Access control
  Lock,
  LogOut,
  Eye,
  EyeOff,
  // Reset button
  RotateCcw,
};

@NgModule({
  imports: [LucideAngularModule.pick(icons)],
  exports: [LucideAngularModule],
})
export class IconsModule {}
