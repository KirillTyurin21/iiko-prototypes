export interface SidebarMenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

export interface SidebarSection {
  title: string;
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
