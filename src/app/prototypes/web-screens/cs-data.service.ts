import { Injectable, inject } from '@angular/core';
import { CSControl, CSTheme, Hint, CSTerminal, Campaign } from './cs-types';
import { CS_CONTROLS, CS_THEMES, CS_HINTS, CS_TERMINALS, CS_CAMPAIGNS } from './data/cs-mock-data';
import { StorageService } from '@/shared/storage.service';

/**
 * Сервис общего состояния Customer Screen.
 * Все экраны читают/пишут данные через него — изменения видны между разделами.
 */
@Injectable({ providedIn: 'root' })
export class CsDataService {
  private storage = inject(StorageService);

  controls: CSControl[] = [];
  themes: CSTheme[] = [];
  hints: Hint[] = [];
  terminals: CSTerminal[] = [];
  campaigns: Campaign[] = [];

  private nextControlId = 7;
  private nextThemeId = 4;
  private nextHintId = 6;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const defaultControls = JSON.parse(JSON.stringify(CS_CONTROLS));
    const defaultThemes = JSON.parse(JSON.stringify(CS_THEMES));
    const defaultHints = JSON.parse(JSON.stringify(CS_HINTS));
    const defaultTerminals = JSON.parse(JSON.stringify(CS_TERMINALS));
    const defaultCampaigns = JSON.parse(JSON.stringify(CS_CAMPAIGNS));

    this.controls = this.storage.load('web-screens', 'controls', defaultControls);
    this.themes = this.storage.load('web-screens', 'themes', defaultThemes);
    this.hints = this.storage.load('web-screens', 'hints', defaultHints);
    this.terminals = this.storage.load('web-screens', 'terminals', defaultTerminals);
    this.campaigns = this.storage.load('web-screens', 'campaigns', defaultCampaigns);

    this.nextControlId = this.storage.load('web-screens', 'nextControlId', 7);
    this.nextThemeId = this.storage.load('web-screens', 'nextThemeId', 4);
    this.nextHintId = this.storage.load('web-screens', 'nextHintId', 6);
  }

  private persist(): void {
    this.storage.save('web-screens', 'controls', this.controls);
    this.storage.save('web-screens', 'themes', this.themes);
    this.storage.save('web-screens', 'hints', this.hints);
    this.storage.save('web-screens', 'terminals', this.terminals);
    this.storage.save('web-screens', 'campaigns', this.campaigns);
    this.storage.save('web-screens', 'nextControlId', this.nextControlId);
    this.storage.save('web-screens', 'nextThemeId', this.nextThemeId);
    this.storage.save('web-screens', 'nextHintId', this.nextHintId);
  }

  // ─── Контролы ──────────────────────────────

  addControl(control: Omit<CSControl, 'id'>): CSControl {
    const newControl: CSControl = { ...control, id: this.nextControlId++ } as CSControl;
    this.controls = [...this.controls, newControl];
    this.persist();
    return newControl;
  }

  updateControl(control: CSControl): void {
    this.controls = this.controls.map(c => c.id === control.id ? { ...control } : c);
    this.persist();
  }

  deleteControl(id: number): void {
    this.controls = this.controls.filter(c => c.id !== id);
    // Очистить ссылки в подсказках
    this.hints = this.hints.map(h => h.controlId === id ? { ...h, controlId: null } : h);
    this.persist();
  }

  // ─── Темы ──────────────────────────────────

  addTheme(theme: Omit<CSTheme, 'id'>): CSTheme {
    const newTheme: CSTheme = { ...theme, id: this.nextThemeId++ } as CSTheme;
    this.themes = [...this.themes, newTheme];
    this.persist();
    return newTheme;
  }

  updateTheme(theme: CSTheme): void {
    this.themes = this.themes.map(t => t.id === theme.id ? { ...theme } : t);
    this.persist();
  }

  deleteTheme(id: number): void {
    this.themes = this.themes.filter(t => t.id !== id);
    this.persist();
  }

  duplicateTheme(id: number): CSTheme | null {
    const source = this.themes.find(t => t.id === id);
    if (!source) return null;
    const copy: CSTheme = {
      ...JSON.parse(JSON.stringify(source)),
      id: this.nextThemeId++,
      name: source.name + ' (копия)',
      updatedAt: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    this.themes = [...this.themes, copy];
    this.persist();
    return copy;
  }

  // ─── Подсказки ─────────────────────────────

  addHint(hint: Omit<Hint, 'id'>): Hint {
    const newHint: Hint = { ...hint, id: this.nextHintId++ } as Hint;
    this.hints = [...this.hints, newHint];
    this.persist();
    return newHint;
  }

  updateHint(hint: Hint): void {
    this.hints = this.hints.map(h => h.id === hint.id ? { ...hint } : h);
    this.persist();
  }

  deleteHint(id: number): void {
    this.hints = this.hints.filter(h => h.id !== id);
    // Каскадное удаление назначений
    this.terminals = this.terminals.map(t => ({
      ...t,
      hints: t.hints.filter(hId => hId !== id),
    }));
    this.persist();
  }

  // ─── Терминалы ─────────────────────────────

  updateTerminals(terminals: CSTerminal[]): void {
    this.terminals = [...terminals];
    this.persist();
  }

  toggleHintAssignment(terminalId: number, hintId: number): void {
    this.terminals = this.terminals.map(t => {
      if (t.id !== terminalId) return t;
      const has = t.hints.includes(hintId);
      return { ...t, hints: has ? t.hints.filter(id => id !== hintId) : [...t.hints, hintId] };
    });
    this.persist();
  }

  toggleCampaignAssignment(terminalId: number, campaignId: number): void {
    this.terminals = this.terminals.map(t => {
      if (t.id !== terminalId) return t;
      const has = t.campaigns.includes(campaignId);
      return { ...t, campaigns: has ? t.campaigns.filter(id => id !== campaignId) : [...t.campaigns, campaignId] };
    });
    this.persist();
  }
}
