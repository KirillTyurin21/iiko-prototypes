import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';
import { AvailableRobot } from '../../types';
import { displayRobotName, displayRobotNameDual } from '../../utils/display-robot-name';

/** М17: Выбор робота (robot_select) — П1 */
@Component({
  selector: 'pudu-robot-select',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="lg" (dialogClose)="onCancel.emit()">
      <div class="space-y-4">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">Выбор робота</h2>
          <p class="text-base text-center text-gray-300 mb-6">Выберите робота для маркетингового круиза</p>
        </div>

        <!-- Таблица роботов -->
        <div *ngIf="!loading && !error && sortedRobots.length > 0"
             class="bg-[#2d2d2d] rounded overflow-hidden mb-4">
          <!-- Заголовок таблицы -->
          <div class="grid grid-cols-4 gap-2 px-4 py-2 border-b border-gray-600">
            <span class="text-xs text-gray-400 font-medium">Имя робота</span>
            <span class="text-xs text-gray-400 font-medium">ID</span>
            <span class="text-xs text-gray-400 font-medium">Статус</span>
            <span class="text-xs text-gray-400 font-medium">Задача</span>
          </div>

          <!-- Строки роботов -->
          <div *ngFor="let robot of sortedRobots"
               (click)="robot.status !== 'offline' && selectRobot(robot)"
               [ngClass]="{
                 'hover:bg-[#252525] cursor-pointer': robot.status !== 'offline',
                 'opacity-40 cursor-not-allowed': robot.status === 'offline',
                 'bg-[#b8c959]/10 border-l-2 border-[#b8c959]': selectedRobot?.robot_id === robot.robot_id
               }"
               class="grid grid-cols-4 gap-2 px-4 py-3 border-b border-gray-600/30 transition-colors">
            <!-- Имя робота -->
            <div class="flex flex-col">
              <span class="text-sm font-medium"
                    [ngClass]="{
                      'text-gray-500': robot.status === 'offline',
                      'text-gray-400': robot.status === 'busy',
                      'text-white': robot.status === 'free'
                    }">
                {{ dualName(robot).primary }}
              </span>
              <span *ngIf="dualName(robot).secondary" class="text-xs text-gray-400">
                {{ dualName(robot).secondary }}
              </span>
            </div>
            <!-- ID (обрезанный) -->
            <span class="text-sm text-gray-400 truncate" [title]="robot.robot_id">
              {{ robot.robot_id.length > 12 ? (robot.robot_id | slice:0:12) + '...' : robot.robot_id }}
            </span>
            <!-- Статус с цветовым индикатором -->
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full"
                    [ngClass]="{
                      'bg-green-500': robot.status === 'free',
                      'bg-orange-500': robot.status === 'busy',
                      'bg-gray-500': robot.status === 'offline'
                    }"></span>
              <span class="text-sm"
                    [ngClass]="{
                      'text-green-400': robot.status === 'free',
                      'text-orange-400': robot.status === 'busy',
                      'text-gray-500': robot.status === 'offline'
                    }">
                {{ robot.status === 'free' ? 'Свободен' : robot.status === 'busy' ? 'Занят' : 'Оффлайн' }}
              </span>
            </div>
            <!-- Задача -->
            <span class="text-sm"
                  [ngClass]="robot.current_task ? 'text-gray-300' : 'text-gray-500'">
              {{ robot.current_task?.task_type || '—' }}
              <span *ngIf="robot.current_task?.target_point" class="text-gray-500">
                → {{ formatPointName(robot.current_task!.target_point) }}
              </span>
            </span>
          </div>
        </div>

        <!-- Индикатор выбранного робота -->
        <p *ngIf="selectedRobot" class="text-sm text-[#b8c959] text-center mb-4">
          Выбрано: <span class="font-medium">{{ displayName(selectedRobot!) }}</span>
        </p>

        <!-- Предупреждение: робот занят -->
        <div *ngIf="selectedRobot?.status === 'busy'"
             class="flex gap-3 bg-orange-500/20 border border-orange-500/40 rounded p-4 mb-4">
          <lucide-icon name="alert-circle" [size]="20" class="shrink-0 text-orange-400 mt-0.5"></lucide-icon>
          <div>
            <p class="text-sm text-white font-medium mb-1">Робот занят</p>
            <p class="text-sm text-gray-300">Задача будет поставлена в очередь и выполнена после завершения текущей.</p>
          </div>
        </div>

        <!-- Пустое состояние: нет роботов -->
        <div *ngIf="sortedRobots.length === 0 && !loading && !error"
             class="flex flex-col items-center text-center space-y-3 py-8">
          <div class="rounded-full bg-gray-600/30 p-6">
            <lucide-icon name="bot" [size]="48" class="text-gray-400"></lucide-icon>
          </div>
          <p class="text-sm text-gray-300">Нет зарегистрированных роботов.</p>
          <p class="text-xs text-gray-400">Настройте роботов в <span class="text-[#b8c959]">iiko Web → Роботы PUDU</span>.</p>
        </div>

        <!-- Пустое состояние: все offline -->
        <div *ngIf="sortedRobots.length > 0 && allRobotsOffline && !loading"
             class="flex gap-3 bg-orange-500/20 border border-orange-500/40 rounded p-4 mb-4">
          <lucide-icon name="wifi-off" [size]="20" class="shrink-0 text-orange-400 mt-0.5"></lucide-icon>
          <p class="text-sm text-gray-300">Нет доступных роботов. Все роботы offline.</p>
        </div>

        <!-- Ошибка загрузки -->
        <div *ngIf="error"
             class="flex flex-col items-center text-center space-y-3 py-8">
          <div class="rounded-full bg-red-500/20 p-6">
            <lucide-icon name="alert-circle" [size]="48" class="text-red-400"></lucide-icon>
          </div>
          <p class="text-sm text-gray-300">Не удалось загрузить список роботов.</p>
          <button (click)="onRetry.emit()" class="text-sm text-[#b8c959] hover:underline">Повторить</button>
        </div>

        <!-- Загрузка -->
        <div *ngIf="loading"
             class="flex flex-col items-center text-center space-y-3 py-8">
          <lucide-icon name="loader-2" [size]="48" class="text-gray-400 animate-spin"></lucide-icon>
          <p class="text-sm text-gray-400">Загрузка списка роботов...</p>
        </div>

        <!-- Footer -->
        <div class="grid grid-cols-2 gap-3 mt-6">
          <button (click)="onCancel.emit()"
            class="h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
            aria-label="Отмена выбора робота">
            Отмена
          </button>
          <button (click)="confirmSelection()"
            [disabled]="!selectedRobot || selectedRobot.status === 'offline'"
            [ngClass]="!selectedRobot || selectedRobot.status === 'offline'
              ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#252525]'"
            class="h-14 bg-[#1a1a1a] text-white border-none rounded font-medium transition-colors"
            aria-label="Подтвердить выбор робота">
            Выбрать
          </button>
        </div>
      </div>
    </pudu-pos-dialog>
  `,
})
export class RobotSelectComponent {
  @Input() open = false;
  @Input() robots: AvailableRobot[] = [];
  @Input() loading = false;
  @Input() error = false;
  @Output() onCancel = new EventEmitter<void>();
  @Output() onSelect = new EventEmitter<AvailableRobot>();
  @Output() onRetry = new EventEmitter<void>();

  selectedRobot: AvailableRobot | null = null;

  get sortedRobots(): AvailableRobot[] {
    const order: Record<string, number> = { free: 0, busy: 1, offline: 2 };
    return [...this.robots].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  }

  get allRobotsOffline(): boolean {
    return this.robots.length > 0 && this.robots.every(r => r.status === 'offline');
  }

  displayName(robot: AvailableRobot): string {
    return displayRobotName(robot.ne_name, robot.alias, robot.robot_id);
  }

  dualName(robot: AvailableRobot): { primary: string; secondary: string | null } {
    return displayRobotNameDual(robot.ne_name, robot.alias, robot.robot_id);
  }

  selectRobot(robot: AvailableRobot): void {
    if (robot.status === 'offline') return;
    this.selectedRobot = robot;
  }

  formatPointName(raw: string): string {
    if (raw.startsWith('TABLE_')) return 'С.' + raw.replace('TABLE_', '');
    if (raw === 'KITCHEN') return 'Кухня';
    if (raw === 'CHARGE') return 'Зарядка';
    if (raw === 'WASHING') return 'Мойка';
    if (raw === 'HOST') return 'Хостес';
    if (raw.startsWith('CRUISE_')) return 'Круиз ' + raw.replace('CRUISE_', '');
    return raw;
  }

  confirmSelection(): void {
    if (!this.selectedRobot || this.selectedRobot.status === 'offline') return;
    this.onSelect.emit(this.selectedRobot);
  }
}
