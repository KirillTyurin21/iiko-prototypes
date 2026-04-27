import { Injectable, inject } from '@angular/core';
import { StorageService } from '@/shared/storage.service';
import {
  Organization,
  Store,
  WbPayCredentials,
  TerminalInfo,
  PluginState,
  PaymentRecord,
  PaymentStep,
  CredentialInput,
} from './types';
import {
  MOCK_ORGANIZATIONS,
  MOCK_CREDENTIALS,
  MOCK_PAYMENT_HISTORY,
} from './data/mock-data';

@Injectable({ providedIn: 'root' })
export class WbPayStateService {
  private storage = inject(StorageService);

  organizations: Organization[] = [];
  credentials: WbPayCredentials[] = [];
  paymentHistory: PaymentRecord[] = [];
  pluginState: PluginState = 'not-configured';
  activeTerminalId = 'term-1';
  lastGeneratedQrData = '';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    this.organizations = this.storage.load(
      'wb-pay',
      'organizations',
      JSON.parse(JSON.stringify(MOCK_ORGANIZATIONS))
    );
    this.credentials = this.storage.load(
      'wb-pay',
      'credentials',
      JSON.parse(JSON.stringify(MOCK_CREDENTIALS))
    );
    this.paymentHistory = this.storage.load(
      'wb-pay',
      'paymentHistory',
      JSON.parse(JSON.stringify(MOCK_PAYMENT_HISTORY))
    );
    this.pluginState = this.storage.load('wb-pay', 'pluginState', 'not-configured');
    this.activeTerminalId = this.storage.load('wb-pay', 'activeTerminalId', 'term-1');
    this.lastGeneratedQrData = this.storage.load('wb-pay', 'lastQr', '');

    this.syncPluginState();
  }

  private persist(): void {
    this.storage.save('wb-pay', 'organizations', this.organizations);
    this.storage.save('wb-pay', 'credentials', this.credentials);
    this.storage.save('wb-pay', 'paymentHistory', this.paymentHistory);
    this.storage.save('wb-pay', 'pluginState', this.pluginState);
    this.storage.save('wb-pay', 'activeTerminalId', this.activeTerminalId);
    this.storage.save('wb-pay', 'lastQr', this.lastGeneratedQrData);
  }

  private syncPluginState(): void {
    const activeTerminal = this.findTerminal(this.activeTerminalId);
    if (!activeTerminal) {
      this.pluginState = 'not-configured';
      return;
    }
    const store = this.findStoreByTerminalId(this.activeTerminalId);
    if (!store) {
      this.pluginState = 'not-configured';
      return;
    }
    const cred = this.credentials.find(c => c.storeId === store.id);
    this.pluginState = cred && cred.status === 'configured' ? 'configured' : 'not-configured';
  }

  // === HELPERS ===

  getAllStores(): Store[] {
    const stores: Store[] = [];
    for (const org of this.organizations) {
      stores.push(...org.stores);
    }
    return stores;
  }

  findStore(storeId: string): Store | undefined {
    for (const org of this.organizations) {
      const store = org.stores.find(s => s.id === storeId);
      if (store) return store;
    }
    return undefined;
  }

  findTerminal(terminalId: string): TerminalInfo | undefined {
    for (const org of this.organizations) {
      for (const store of org.stores) {
        const term = store.terminals.find(t => t.id === terminalId);
        if (term) return term;
      }
    }
    return undefined;
  }

  findStoreByTerminalId(terminalId: string): Store | undefined {
    for (const org of this.organizations) {
      for (const store of org.stores) {
        if (store.terminals.some(t => t.id === terminalId)) return store;
      }
    }
    return undefined;
  }

  getCredentialsForStore(storeId: string): WbPayCredentials | undefined {
    return this.credentials.find(c => c.storeId === storeId);
  }

  getConfiguredStoresCount(): number {
    return this.credentials.filter(c => c.status === 'configured').length;
  }

  getTotalStoresCount(): number {
    return this.getAllStores().length;
  }

  // === WEB (Admin) METHODS ===

  saveCredentials(storeId: string, input: CredentialInput): void {
    const store = this.findStore(storeId);
    if (!store) return;

    const now = new Date().toISOString();
    const existingIdx = this.credentials.findIndex(c => c.storeId === storeId);

    const cred: WbPayCredentials = {
      id: existingIdx >= 0 ? this.credentials[existingIdx].id : 'cred-' + Date.now(),
      storeId,
      storeName: store.name,
      terminalId: input.terminalId,
      jwtToken: input.jwtToken,
      privateKeyPem: input.privateKeyPem,
      revision: Date.now(),
      status: 'configured',
      createdAt: existingIdx >= 0 ? this.credentials[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      this.credentials[existingIdx] = cred;
    } else {
      this.credentials.push(cred);
    }

    // Update store status
    this.updateStoreStatus(storeId, 'configured');

    // Update terminal credentials
    for (const t of store.terminals) {
      t.credentialsApplied = true;
      t.configSource = 'transport';
      t.lastSeen = now;
    }

    this.syncPluginState();
    this.persist();
  }

  deleteCredentials(storeId: string): void {
    this.credentials = this.credentials.filter(c => c.storeId !== storeId);
    this.updateStoreStatus(storeId, 'not-configured');

    const store = this.findStore(storeId);
    if (store) {
      for (const t of store.terminals) {
        t.credentialsApplied = false;
        t.configSource = 'none';
      }
    }

    this.syncPluginState();
    this.persist();
  }

  generateQrData(storeId: string): string {
    const cred = this.getCredentialsForStore(storeId);
    if (!cred) return '';
    const payload = {
      terminal_id: cred.terminalId,
      jwt: cred.jwtToken.substring(0, 20) + '...',
      pem: 'PRIVATE_KEY_HASH',
      revision: cred.revision,
    };
    this.lastGeneratedQrData = btoa(JSON.stringify(payload));
    this.persist();
    return this.lastGeneratedQrData;
  }

  private updateStoreStatus(storeId: string, status: 'configured' | 'not-configured' | 'error'): void {
    for (const org of this.organizations) {
      for (const store of org.stores) {
        if (store.id === storeId) {
          store.credentialsStatus = status;
        }
      }
    }
  }

  // === FRONT (Plugin) METHODS ===

  isPluginConfigured(): boolean {
    return this.pluginState === 'configured' || this.pluginState === 'active';
  }

  getActiveCredentials(): WbPayCredentials | null {
    const store = this.findStoreByTerminalId(this.activeTerminalId);
    if (!store) return null;
    return this.getCredentialsForStore(store.id) ?? null;
  }

  addPaymentRecord(record: PaymentRecord): void {
    this.paymentHistory = [record, ...this.paymentHistory];
    this.persist();
  }

  updatePaymentStatus(paymentId: string, status: PaymentRecord['status']): void {
    this.paymentHistory = this.paymentHistory.map(p =>
      p.id === paymentId ? { ...p, status } : p
    );
    this.persist();
  }

  getSucceededPayments(): PaymentRecord[] {
    return this.paymentHistory.filter(p => p.status === 'succeeded');
  }

  applyTransportPush(): boolean {
    const hasAnyCredentials = this.credentials.some(c => c.status === 'configured');
    if (!hasAnyCredentials) return false;

    this.pluginState = 'configured';
    const terminal = this.findTerminal(this.activeTerminalId);
    if (terminal) {
      terminal.credentialsApplied = true;
      terminal.configSource = 'transport';
      terminal.lastSeen = new Date().toISOString();
    }
    this.persist();
    return true;
  }

  applyQrSetup(): boolean {
    if (!this.lastGeneratedQrData) return false;
    this.pluginState = 'configured';
    const terminal = this.findTerminal(this.activeTerminalId);
    if (terminal) {
      terminal.credentialsApplied = true;
      terminal.configSource = 'qr';
      terminal.lastSeen = new Date().toISOString();
    }
    this.persist();
    return true;
  }

  applyManualSetup(): void {
    this.pluginState = 'configured';
    const terminal = this.findTerminal(this.activeTerminalId);
    if (terminal) {
      terminal.credentialsApplied = true;
      terminal.configSource = 'manual';
      terminal.lastSeen = new Date().toISOString();
    }
    this.persist();
  }

  resetPluginState(): void {
    this.pluginState = 'not-configured';
    const terminal = this.findTerminal(this.activeTerminalId);
    if (terminal) {
      terminal.credentialsApplied = false;
      terminal.configSource = 'none';
    }
    this.persist();
  }
}
