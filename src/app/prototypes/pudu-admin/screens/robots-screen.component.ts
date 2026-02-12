import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@/shared/icons.module';
import {
  UiButtonComponent,
  UiModalComponent,
  UiConfirmDialogComponent,
  UiAlertComponent,
  UiBadgeComponent,
  UiInputComponent,
  UiSelectComponent,
  SelectOption,
} from '@/components/ui';
import { Robot } from '../types';
import { MOCK_ROBOTS } from '../data/mock-data';
import { StorageService } from '@/shared/storage.service';

@Component({
  selector: 'app-robots-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconsModule,
    UiButtonComponent,
    UiModalComponent,
    UiConfirmDialogComponent,
    UiAlertComponent,
    UiBadgeComponent,
    UiInputComponent,
    UiSelectComponent,
  ],
  template: `
    <!-- SUBHEADER -->
    <div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0 flex items-center justify-between">
      <h1 class="text-lg font-semibold text-gray-900">Роботы PUDU</h1>
      <ui-button variant="primary" size="sm" iconName="plus" (click)="openAddModal()">
        Добавить робота
      </ui-button>
    </div>

    <!-- CONTENT -->
    <div class="bg-gray-50 p-6 flex-1 overflow-y-auto">

      <!-- LOADING -->
      <div *ngIf="isLoading" class="flex items-center justify-center h-64">
        <lucide-icon name="loader-2" [size]="32" class="animate-spin text-gray-400"></lucide-icon>
      </div>

      <!-- EMPTY STATE -->
      <div *ngIf="!isLoading && robots.length === 0" class="flex items-center justify-center h-64">
        <p class="text-gray-400 text-sm text-center max-w-sm">
          Роботы не зарегистрированы. Нажмите «Добавить робота» для начала работы
        </p>
      </div>

      <!-- TABLE -->
      <div *ngIf="!isLoading && robots.length > 0" class="animate-fade-in">
        <table class="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя робота</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID робота</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Регион</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Активная карта</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let robot of robots; let last = last"
              class="hover:bg-gray-50 transition-colors"
              [class.border-b]="!last"
              [class.border-gray-200]="!last"
            >
              <td class="px-4 py-3 text-sm text-gray-900">{{ robot.name }}</td>
              <td class="px-4 py-3 font-mono text-sm text-gray-600">{{ robot.id }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ robot.server_region }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1.5">
                  <lucide-icon
                    *ngIf="robot.connection_status === 'online'"
                    name="check-circle-2"
                    [size]="16"
                    class="text-green-600"
                  ></lucide-icon>
                  <lucide-icon
                    *ngIf="robot.connection_status === 'offline'"
                    name="circle"
                    [size]="16"
                    class="text-gray-300"
                  ></lucide-icon>
                  <lucide-icon
                    *ngIf="robot.connection_status === 'error'"
                    name="alert-circle"
                    [size]="16"
                    class="text-orange-500"
                  ></lucide-icon>
                  <span class="text-sm" [ngClass]="{
                    'text-green-700': robot.connection_status === 'online',
                    'text-gray-500': robot.connection_status === 'offline',
                    'text-orange-600': robot.connection_status === 'error'
                  }">
                    {{ statusLabel(robot.connection_status) }}
                  </span>
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ robot.active_map_name }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <ui-button variant="ghost" size="sm" iconName="file-edit" (click)="openEditModal(robot)">
                    Редактировать
                  </ui-button>
                  <ui-button variant="ghost" size="sm" iconName="trash-2" (click)="confirmDelete(robot)"
                    class="text-red-500 hover:text-red-700">
                    Удалить
                  </ui-button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DELETE CONFIRM DIALOG -->
    <ui-confirm-dialog
      [open]="deleteDialogOpen"
      title="Удалить робота"
      [message]="deleteMessage"
      confirmText="Удалить"
      cancelText="Отмена"
      variant="danger"
      (confirmed)="deleteRobot()"
      (cancelled)="deleteDialogOpen = false"
    ></ui-confirm-dialog>

    <!-- ADD ROBOT MODAL -->
    <ui-modal [open]="addModalOpen" title="Регистрация робота" size="md" (modalClose)="closeAddModal()">
      <div class="space-y-4">

        <!-- Регион сервера -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Регион сервера <span class="text-red-500">*</span>
          </label>
          <ui-select
            [options]="regionOptions"
            [(value)]="newRobot.server_region"
            placeholder="Выберите регион"
          ></ui-select>
        </div>

        <!-- Имя робота -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Имя робота <span class="text-red-500">*</span>
          </label>
          <ui-input
            [(value)]="newRobot.name"
            placeholder="Например: BellaBot-01"
            hint="Произвольное имя для идентификации робота (например, BellaBot-01)"
            [error]="formErrors['name']"
          ></ui-input>
        </div>

        <!-- ID робота -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ID робота <span class="text-red-500">*</span>
          </label>
          <ui-input
            [(value)]="newRobot.id"
            placeholder="Серийный номер PUDU"
            hint="Серийный номер робота из системы PUDU"
            [error]="formErrors['id']"
            (valueChange)="validateId()"
          ></ui-input>
        </div>

        <!-- Секретный ключ -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Секретный ключ <span class="text-red-500">*</span>
          </label>
          <ui-input
            type="password"
            [(value)]="newRobot.secret_key"
            placeholder="Ключ API"
            hint="Ключ доступа к API PUDU (предоставляется NE)"
            [error]="formErrors['secret_key']"
          ></ui-input>
        </div>

        <!-- Error alert -->
        <ui-alert
          *ngIf="registrationError"
          variant="error"
          [title]="registrationError"
          [dismissible]="true"
        ></ui-alert>
      </div>

      <div modalFooter class="flex items-center justify-end gap-3">
        <ui-button variant="ghost" (click)="closeAddModal()">Отмена</ui-button>
        <ui-button
          variant="primary"
          [disabled]="!isFormValid() || isRegistering"
          [loading]="isRegistering"
          (click)="registerRobot()"
        >
          Зарегистрировать
        </ui-button>
      </div>
    </ui-modal>

    <!-- EDIT ROBOT MODAL -->
    <ui-modal [open]="editModalOpen" title="Редактирование робота" size="md" (modalClose)="closeEditModal()">
      <div class="space-y-4">

        <!-- Регион сервера -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Регион сервера <span class="text-red-500">*</span>
          </label>
          <ui-select
            [options]="regionOptions"
            [(value)]="editRobot.server_region"
            placeholder="Выберите регион"
          ></ui-select>
        </div>

        <!-- Имя робота -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Имя робота <span class="text-red-500">*</span>
          </label>
          <ui-input
            [(value)]="editRobot.name"
            placeholder="Например: BellaBot-01"
            hint="Произвольное имя для идентификации робота (например, BellaBot-01)"
            [error]="editFormErrors['name']"
          ></ui-input>
        </div>

        <!-- ID робота -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ID робота <span class="text-red-500">*</span>
          </label>
          <ui-input
            [(value)]="editRobot.id"
            placeholder="Серийный номер PUDU"
            hint="Серийный номер робота из системы PUDU"
            [error]="editFormErrors['id']"
            (valueChange)="validateEditId()"
          ></ui-input>
        </div>

        <!-- Секретный ключ -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Секретный ключ <span class="text-red-500">*</span>
          </label>
          <ui-input
            type="password"
            [(value)]="editRobot.secret_key"
            placeholder="Ключ API"
            hint="Ключ доступа к API PUDU (предоставляется NE)"
            [error]="editFormErrors['secret_key']"
          ></ui-input>
        </div>

        <!-- Error alert -->
        <ui-alert
          *ngIf="editError"
          variant="error"
          [title]="editError"
          [dismissible]="true"
        ></ui-alert>
      </div>

      <div modalFooter class="flex items-center justify-end gap-3">
        <ui-button variant="ghost" (click)="closeEditModal()">Отмена</ui-button>
        <ui-button
          variant="primary"
          [disabled]="!isEditFormValid() || isSavingEdit"
          [loading]="isSavingEdit"
          (click)="saveEditedRobot()"
        >
          Сохранить
        </ui-button>
      </div>
    </ui-modal>

    <!-- TOASTS -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let t of toasts"
        class="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-lg min-w-[300px] animate-slide-up"
      >
        <p class="text-sm font-medium text-gray-900">{{ t.title }}</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
  `],
})
export class RobotsScreenComponent implements OnInit {
  private storage = inject(StorageService);

  // --- Robot list state ---
  robots: Robot[] = [];
  isLoading = true;

  // --- Delete dialog state ---
  deleteDialogOpen = false;
  deleteMessage = '';
  private robotToDelete: Robot | null = null;

  // --- Add modal state ---
  addModalOpen = false;
  isRegistering = false;
  registrationError = '';
  formErrors: Record<string, string> = {};

  newRobot = this.emptyRobot();

  regionOptions: SelectOption[] = [
    { value: 'EU', label: 'EU' },
    { value: 'ASIA', label: 'ASIA' },
  ];

  // --- Toasts ---
  toasts: { id: number; title: string }[] = [];
  private toastId = 0;

  // --- Lifecycle ---
  ngOnInit(): void {
    // Simulate loading delay
    setTimeout(() => {
      this.robots = this.storage.load('pudu-admin', 'robots', MOCK_ROBOTS.map(r => ({ ...r })));
      this.isLoading = false;
    }, 1000);
  }

  // --- Status helpers ---
  statusLabel(status: Robot['connection_status']): string {
    switch (status) {
      case 'online': return 'В сети';
      case 'offline': return 'Не в сети';
      case 'error': return 'Ошибка';
    }
  }

  // --- Delete flow ---
  confirmDelete(robot: Robot): void {
    this.robotToDelete = robot;
    this.deleteMessage = `Удалить робота ${robot.name}? Все настройки маппинга для этого робота будут потеряны.`;
    this.deleteDialogOpen = true;
  }

  deleteRobot(): void {
    if (!this.robotToDelete) return;
    const name = this.robotToDelete.name;
    this.robots = this.robots.filter(r => r.id !== this.robotToDelete!.id);
    this.persistRobots();
    this.deleteDialogOpen = false;
    this.robotToDelete = null;
    this.showToast(`Робот «${name}» удалён`);
  }

  // --- Edit modal state ---
  editModalOpen = false;
  isSavingEdit = false;
  editError = '';
  editFormErrors: Record<string, string> = {};
  editRobot = this.emptyRobot();
  private editOriginalId = '';

  // --- Edit modal flow ---
  openEditModal(robot: Robot): void {
    this.editRobot = {
      server_region: robot.server_region,
      name: robot.name,
      id: robot.id,
      secret_key: robot.secret_key,
    };
    this.editOriginalId = robot.id;
    this.editFormErrors = {};
    this.editError = '';
    this.isSavingEdit = false;
    this.editModalOpen = true;
  }

  closeEditModal(): void {
    this.editModalOpen = false;
  }

  validateEditId(): void {
    const id = this.editRobot.id.trim();
    if (!id) { this.editFormErrors['id'] = ''; this.editError = ''; return; }
    if (id === 'PD000ERROR') {
      this.editError = 'Робот не найден в системе PUDU. Обратитесь к специалистам NE для добавления робота в магазин';
      this.editFormErrors['id'] = '';
      return;
    }
    if (id !== this.editOriginalId && this.robots.some(r => r.id === id)) {
      this.editFormErrors['id'] = 'Робот с таким ID уже зарегистрирован';
      this.editError = '';
      return;
    }
    this.editFormErrors['id'] = '';
    this.editError = '';
  }

  isEditFormValid(): boolean {
    const r = this.editRobot;
    if (!r.server_region || !r.name.trim() || !r.id.trim() || !r.secret_key.trim()) return false;
    if (r.name.trim().length > 64) return false;
    if (r.id.trim() === 'PD000ERROR') return false;
    if (r.id.trim() !== this.editOriginalId && this.robots.some(x => x.id === r.id.trim())) return false;
    if (this.editFormErrors['id']) return false;
    if (this.editError) return false;
    return true;
  }

  saveEditedRobot(): void {
    if (!this.isEditFormValid()) return;
    this.isSavingEdit = true;

    setTimeout(() => {
      this.robots = this.robots.map(r => {
        if (r.id !== this.editOriginalId) return r;
        return {
          ...r,
          id: this.editRobot.id.trim(),
          name: this.editRobot.name.trim(),
          server_region: this.editRobot.server_region as 'EU' | 'ASIA',
          secret_key: this.editRobot.secret_key.trim(),
        };
      });
      this.persistRobots();
      this.isSavingEdit = false;
      this.editModalOpen = false;
      this.showToast('Данные робота сохранены');
    }, 1500);
  }

  // --- Add modal flow ---
  openAddModal(): void {
    this.newRobot = this.emptyRobot();
    this.formErrors = {};
    this.registrationError = '';
    this.isRegistering = false;
    this.addModalOpen = true;
  }

  closeAddModal(): void {
    this.addModalOpen = false;
  }

  validateId(): void {
    const id = this.newRobot.id.trim();
    if (!id) {
      this.formErrors['id'] = '';
      this.registrationError = '';
      return;
    }
    if (id === 'PD000ERROR') {
      this.registrationError = 'Робот не найден в системе PUDU. Обратитесь к специалистам NE для добавления робота в магазин';
      this.formErrors['id'] = '';
      return;
    }
    if (this.robots.some(r => r.id === id)) {
      this.formErrors['id'] = 'Робот с таким ID уже зарегистрирован';
      this.registrationError = '';
      return;
    }
    this.formErrors['id'] = '';
    this.registrationError = '';
  }

  isFormValid(): boolean {
    const r = this.newRobot;
    if (!r.server_region || !r.name.trim() || !r.id.trim() || !r.secret_key.trim()) {
      return false;
    }
    if (r.name.trim().length > 64) return false;
    if (r.id.trim() === 'PD000ERROR') return false;
    if (this.robots.some(x => x.id === r.id.trim())) return false;
    if (this.formErrors['id']) return false;
    if (this.registrationError) return false;
    return true;
  }

  registerRobot(): void {
    if (!this.isFormValid()) return;
    this.isRegistering = true;

    setTimeout(() => {
      const robot: Robot = {
        id: this.newRobot.id.trim(),
        name: this.newRobot.name.trim(),
        server_region: this.newRobot.server_region as 'EU' | 'ASIA',
        secret_key: this.newRobot.secret_key.trim(),
        connection_status: 'online',
        active_map_name: '—',
      };
      this.robots = [...this.robots, robot];
      this.persistRobots();
      this.isRegistering = false;
      this.addModalOpen = false;
      this.showToast('Робот успешно зарегистрирован');
    }, 1500);
  }

  // --- Helpers ---
  private emptyRobot() {
    return {
      server_region: 'EU',
      name: '',
      id: '',
      secret_key: '',
    };
  }

  private persistRobots(): void {
    this.storage.save('pudu-admin', 'robots', this.robots);
  }

  private showToast(title: string): void {
    const id = ++this.toastId;
    this.toasts.push({ id, title });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  }
}
