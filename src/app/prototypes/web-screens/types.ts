export interface SidebarMenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

export interface SidebarSection {
  title: string;
  icon?: string;
  route?: string;
  items: SidebarMenuItem[];
}

export interface CustomerScreenDisplay {
  id: number;
  name: string;
  description: string;
  resolution: string;
  orientation: 'landscape' | 'portrait';
  status: 'active' | 'inactive';
  theme: string;
  terminal: string;
}

export interface ScreenTheme {
  id: number;
  name: string;
  type: 'customer-screen' | 'arrivals';
  previewUrl?: string;
  isDefault: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface ScreenControl {
  id: number;
  name: string;
  type: string;
  description: string;
}

export interface ArrivalTerminal {
  id: number;
  name: string;
  location: string;
  status: 'online' | 'offline';
  ip: string;
  lastSync: string;
}

/* ── Arrivals Theme Editor ── */

export interface ArrivalsThemeListItem {
  id: number;
  name: string;
  itemType: 'folder' | 'theme';
  resolution?: string;
  createdBy?: string;
}

export type ArrivalsElementType =
  | 'area'
  | 'ad-block'
  | 'text'
  | 'image'
  | 'rectangle'
  | 'popup'
  | 'current-time'
  | 'counter'
  | 'price';

export interface ArrivalsThemeElement {
  id: string;
  type: ArrivalsElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  // Text
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontBold?: boolean;
  fontItalic?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  // Counter (REST data source)
  dataSourceUrl?: string;
  httpMethod?: string;
  headers?: string;
  timeout?: number;
  authType?: string;
  pollInterval?: number;
  // Image
  imageUrl?: string;
  // Price (product binding)
  productId?: string;
  productName?: string;
  sizeId?: string | null;
  sizeName?: string;
}

/* ── Product Catalog (for Price element navigator) ── */

export interface ProductSize {
  id: string;
  name: string;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  isGroup: boolean;
  hasChildren?: boolean;
  sizes?: ProductSize[];
}

export interface ArrivalsTheme {
  id: number;
  name: string;
  resolution: string;
  screenMode: string;
  elements: ArrivalsThemeElement[];
}
