import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconsModule } from '@/shared/icons.module';
import {
  UiButtonComponent,
  UiModalComponent,
  UiConfirmDialogComponent,
  UiAlertComponent,
  UiInputComponent,
  UiSelectComponent,
  SelectOption,
} from '@/components/ui';
import { Robot } from '../types';
import { MOCK_ROBOTS } from '../data/mock-data';
import { StorageService } from '@/shared/storage.service';
import { PuduPrototypeComponent } from '../pudu-prototype.component';

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
    UiInputComponent,
    UiSelectComponent,
  ],
  template: `
    <!-- SUBHEADER (v1.4: breadcrumb + back button) -->
    <div class="border-b border-gray-200 bg-white px-6 py-4 shrink-0">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Назад к списку ресторанов"
            (click)="goBack()"
          >
            <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
            <span>Назад к списку ресторанов</span>
          </button>
        </div>
        <ui-button variant="primary" size="sm" iconName="plus" (click)="openAddModal()" aria-label="Добавить нового робота">
          Добавить робота
        </ui-button>
      </div>
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-sm mt-2" aria-label="Breadcrumb">
        <a class="text-gray-400 hover:text-blue-600 hover:underline cursor-pointer transition-colors" (click)="goBack()">Настройки PUDU</a>
        <lucide-icon name="chevron-right" [size]="14" class="text-gray-300"></lucide-icon>
        <span class="text-gray-400">{{ parent.selectedRestaurant?.restaurant_name || 'Ресторан' }}</span>
        <lucide-icon name="chevron-right" [size]="14" class="text-gray-300"></lucide-icon>
        <span class="text-gray-900 font-medium">Роботы PUDU</span>
      </nav>
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
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Отображаемое имя робота. Заполняется автоматически при регистрации из NE, можно отредактировать">Имя робота</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Серийный номер робота в системе PUDU. Неизменяемый, задаётся при регистрации">ID робота</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Текущий статус подключения робота к облаку PUDU. online — робот доступен, offline — нет связи, ошибка — сбой подключения">Статус</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Название активной карты зала робота в системе PUDU. Настраивается инженером NE при установке">Активная карта</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Поведение робота после завершения задачи: ожидает новую задачу или переходит в маркетинговый круиз">Действие после задачи</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let robot of robots; let i = index; let last = last"
              class="hover:bg-gray-50 transition-colors"
              [class.border-b]="!last"
              [class.border-gray-200]="!last"
            >
              <td class="px-4 py-3 text-sm text-gray-900">{{ robot.name }}</td>
              <td class="px-4 py-3 font-mono text-sm text-gray-600">{{ robot.id }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1.5">
                  <lucide-icon
                    *ngIf="robot.connection_status === 'online'"
                    name="check-circle-2"
                    [size]="16"
                    class="text-green-600"
                    title="Робот подключён к облаку PUDU и доступен для задач"
                  ></lucide-icon>
                  <lucide-icon
                    *ngIf="robot.connection_status === 'offline'"
                    name="circle"
                    [size]="16"
                    class="text-gray-300"
                    title="Робот не подключён к облаку PUDU"
                  ></lucide-icon>
                  <lucide-icon
                    *ngIf="robot.connection_status === 'error'"
                    name="alert-circle"
                    [size]="16"
                    class="text-orange-500"
                    title="Ошибка подключения к облаку PUDU"
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
              <td class="px-4 py-3">
                <ui-select
                  [options]="afterActionOptions"
                  [value]="robot.after_action"
                  [fullWidth]="false"
                  (valueChange)="onAfterActionChange(robot, $event)"
                  [attr.aria-label]="'Действие после задачи для робота ' + robot.name"
                ></ui-select>
              </td>
              <td class="px-4 py-3 text-right">
                <ui-button
                  variant="ghost"
                  size="sm"
                  iconName="trash-2"
                  (click)="confirmDelete(robot)"
                  class="text-red-500 hover:text-red-700"
                  [attr.aria-label]="'Удалить робота ' + robot.name"
                ></ui-button>
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

        <!-- ID робота -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ID робота <span class="text-red-500">*</span>
          </label>
          <ui-input
            [(value)]="newRobotId"
            placeholder="Серийный номер PUDU"
            hint="Серийный номер робота из системы PUDU"
            [error]="formErrors['id']"
            (valueChange)="validateId()"
          ></ui-input>
        </div>

        <!-- Имя робота -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Имя робота
          </label>
          <ui-input
            [(value)]="newRobotName"
            placeholder="Например: BellaBot-01"
            hint="Имя робота для идентификации. Загружается автоматически из системы NE при регистрации. Можно изменить при необходимости"
            [error]="formErrors['name']"
            maxlength="64"
          ></ui-input>
        </div>

        <!-- Error alert -->
        <ui-alert
          *ngIf="registrationError"
          variant="error"
          [title]="registrationError"
          [dismissible]="true"
          (dismissed)="registrationError = ''"
        ></ui-alert>
      </div>

      <div modalFooter class="flex items-center justify-end gap-3">
        <ui-button variant="ghost" (click)="closeAddModal()" aria-label="Отменить регистрацию">Отмена</ui-button>
        <ui-button
          variant="primary"
          [disabled]="!isFormValid() || isRegistering"
          [loading]="isRegistering"
          (click)="registerRobot()"
          aria-label="Зарегистрировать робота"
        >
          Зарегистрировать
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
  private router = inject(Router);
  parent = inject(PuduPrototypeComponent);

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
  newRobotId = '';
  newRobotName = '';

  // --- After-action select options ---
  afterActionOptions: SelectOption[] = [
    { value: 'idle', label: 'Режим ожидания' },
    { value: 'marketing', label: 'Маркетинг' },
  ];

  // --- Toasts ---
  toasts: { id: number; title: string }[] = [];
  private toastId = 0;

  // --- Lifecycle ---
  ngOnInit(): void {
    setTimeout(() => {
      this.robots = this.storage.load<Robot[]>(
        'pudu-admin',
        'robots',
        MOCK_ROBOTS.map(r => ({ ...r })),
      );
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

  // --- After-action inline change ---
  onAfterActionChange(robot: Robot, value: string): void {
    robot.after_action = value as Robot['after_action'];
    this.persistRobots();
    this.showToast('Настройка робота обновлена');
  }

  // --- Delete flow ---
  confirmDelete(robot: Robot): void {
    this.robotToDelete = robot;
    this.deleteMessage = `Удалить робота «${robot.name}»? Все настройки маппинга для этого робота будут потеряны.`;
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

  // --- Add modal flow ---
  openAddModal(): void {
    this.newRobotId = '';
    this.newRobotName = '';
    this.formErrors = {};
    this.registrationError = '';
    this.isRegistering = false;
    this.addModalOpen = true;
  }

  closeAddModal(): void {
    this.addModalOpen = false;
  }

  validateId(): void {
    const id = this.newRobotId.trim();
    if (!id) {
      this.formErrors['id'] = '';
      this.registrationError = '';
      return;
    }
    if (id === 'PD000ERROR') {
      this.registrationError =
        'Робот не найден в системе PUDU. Обратитесь к специалистам NE для добавления робота в магазин';
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
    const id = this.newRobotId.trim();
    if (!id) return false;
    if (id === 'PD000ERROR') return false;
    if (this.robots.some(r => r.id === id)) return false;
    if (this.formErrors['id']) return false;
    if (this.registrationError) return false;
    if (this.newRobotName.trim().length > 64) return false;
    return true;
  }

  registerRobot(): void {
    if (!this.isFormValid()) return;
    this.isRegistering = true;

    setTimeout(() => {
      const name = this.newRobotName.trim() || 'BellaBot';
      const robot: Robot = {
        id: this.newRobotId.trim(),
        name,
        connection_status: 'online',
        active_map_name: '—',
        after_action: 'idle',
      };
      this.robots = [...this.robots, robot];
      this.persistRobots();
      this.isRegistering = false;
      this.addModalOpen = false;
      this.showToast('Робот успешно зарегистрирован');
    }, 1500);
  }

  // --- Navigation ---
  goBack(): void {
    this.parent.clearRestaurantContext();
    this.router.navigate(['/prototype/pudu-admin']);
  }

  // --- Helpers ---
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
