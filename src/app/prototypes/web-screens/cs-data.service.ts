import { Injectable } from '@angular/core';
import { CSControl, CSTheme, Hint, CSTerminal, Campaign } from './cs-types';
import { CS_CONTROLS, CS_THEMES, CS_HINTS, CS_TERMINALS, CS_CAMPAIGNS } from './data/cs-mock-data';

/**
 * Сервис общего состояния Customer Screen.
 * Все экраны читают/пишут данные через него — изменения видны между разделами.
 */
@Injectable({ providedIn: 'root' })
export class CsDataService {
  controls: CSControl[] = JSON.parse(JSON.stringify(CS_CONTROLS));
  themes: CSTheme[] = JSON.parse(JSON.stringify(CS_THEMES));
  hints: Hint[] = JSON.parse(JSON.stringify(CS_HINTS));
  terminals: CSTerminal[] = JSON.parse(JSON.stringify(CS_TERMINALS));
  campaigns: Campaign[] = JSON.parse(JSON.stringify(CS_CAMPAIGNS));

  private nextControlId = 7;
  private nextThemeId = 4;
  private nextHintId = 6;

  // ─── Контролы ──────────────────────────────

  addControl(control: Omit<CSControl, 'id'>): CSControl {
    const newControl: CSControl = { ...control, id: this.nextControlId++ } as CSControl;
    this.controls = [...this.controls, newControl];
    return newControl;
  }

  updateControl(control: CSControl): void {
    this.controls = this.controls.map(c => c.id === control.id ? { ...control } : c);
  }

  deleteControl(id: number): void {
    this.controls = this.controls.filter(c => c.id !== id);
    // Очистить ссылки в подсказках
    this.hints = this.hints.map(h => h.controlId === id ? { ...h, controlId: null } : h);
  }

  // ─── Темы ──────────────────────────────────

  addTheme(theme: Omit<CSTheme, 'id'>): CSTheme {
    const newTheme: CSTheme = { ...theme, id: this.nextThemeId++ } as CSTheme;
    this.themes = [...this.themes, newTheme];
    return newTheme;
  }

  updateTheme(theme: CSTheme): void {
    this.themes = this.themes.map(t => t.id === theme.id ? { ...theme } : t);
  }

  deleteTheme(id: number): void {
    this.themes = this.themes.filter(t => t.id !== id);
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
    return copy;
  }

  // ─── Подсказки ─────────────────────────────

  addHint(hint: Omit<Hint, 'id'>): Hint {
    const newHint: Hint = { ...hint, id: this.nextHintId++ } as Hint;
    this.hints = [...this.hints, newHint];
    return newHint;
  }

  updateHint(hint: Hint): void {
    this.hints = this.hints.map(h => h.id === hint.id ? { ...hint } : h);
  }

  deleteHint(id: number): void {
    this.hints = this.hints.filter(h => h.id !== id);
    // Каскадное удаление назначений
    this.terminals = this.terminals.map(t => ({
      ...t,
      hints: t.hints.filter(hId => hId !== id),
    }));
  }

  // ─── Терминалы ─────────────────────────────

  updateTerminals(terminals: CSTerminal[]): void {
    this.terminals = [...terminals];
  }

  toggleHintAssignment(terminalId: number, hintId: number): void {
    this.terminals = this.terminals.map(t => {
      if (t.id !== terminalId) return t;
      const has = t.hints.includes(hintId);
      return { ...t, hints: has ? t.hints.filter(id => id !== hintId) : [...t.hints, hintId] };
    });
  }

  toggleCampaignAssignment(terminalId: number, campaignId: number): void {
    this.terminals = this.terminals.map(t => {
      if (t.id !== terminalId) return t;
      const has = t.campaigns.includes(campaignId);
      return { ...t, campaigns: has ? t.campaigns.filter(id => id !== campaignId) : [...t.campaigns, campaignId] };
    });
  }
}
