import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PuduPosDialogComponent } from '../pos-dialog.component';
import { IconsModule } from '@/shared/icons.module';
import { AvailableRobot } from '../../types';
import { displayRobotNameDual } from '../../utils/display-robot-name';

/** М18: Быстрый просмотр статусов роботов (robot_status) — П7 */
@Component({
  selector: 'pudu-robot-status',
  standalone: true,
  imports: [CommonModule, PuduPosDialogComponent, IconsModule, DatePipe],
  template: `
    <pudu-pos-dialog [open]="open" maxWidth="lg" (dialogClose)="onClose.emit()">
      <div class="space-y-4">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-normal text-[#b8c959] text-center mb-2">{{ title }}</h2>
          <p class="text-base text-center text-gray-300 mb-6">{{ subtitle }}</p>
        </div>

        <!-- Таблица роботов (read-only) -->
        <div *ngIf="!loading && !error && sortedRobots.length > 0"
             class="bg-[#2d2d2d] rounded overflow-hidden mb-4">
          <!-- Заголовок таблицы -->
          <div class="grid grid-cols-4 gap-2 px-4 py-2 border-b border-gray-600">
            <span class="text-xs text-gray-400 font-medium">Имя робота</span>
            <span class="text-xs text-gray-400 font-medium">ID</span>
            <span class="text-xs text-gray-400 font-medium">Статус</span>
            <span class="text-xs text-gray-400 font-medium">Текущая задача</span>
          </div>

          <!-- Строки роботов (read-only) -->
          <div *ngFor="let robot of sortedRobots"
               class="grid grid-cols-4 gap-2 px-4 py-3 border-b border-gray-600/30">
            <!-- Имя робота -->
            <div class="flex flex-col">
              <span class="text-sm font-medium"
                    [ngClass]="robot.status === 'offline' ? 'text-gray-500' : 'text-white'">
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
            <!-- Текущая задача -->
            <span class="text-sm"
                  [ngClass]="robot.current_task ? 'text-gray-300' : 'text-gray-500'">
              {{ robot.current_task?.task_type || '—' }}
              <span *ngIf="robot.current_task?.target_point" class="text-gray-500">
                → {{ formatPointName(robot.current_task!.target_point) }}
              </span>
            </span>
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

        <!-- Метка обновления + кнопка -->
        <div *ngIf="!error" class="flex items-center justify-between mb-6">
          <span class="text-xs text-gray-400">
            Последнее обновление: {{ lastRefresh | date:'HH:mm:ss' }}
          </span>
          <button (click)="onRefresh.emit()" [disabled]="loading"
                  class="flex items-center gap-1.5 text-sm text-[#b8c959] hover:underline disabled:opacity-40 transition-colors"
                  aria-label="Обновить статусы роботов">
            <lucide-icon name="refresh-cw" [size]="14"
                         [ngClass]="loading ? 'animate-spin' : ''"></lucide-icon>
            Обновить
          </button>
        </div>

        <!-- Загрузка -->
        <div *ngIf="loading"
             class="flex items-center justify-center gap-2 py-4">
          <lucide-icon name="loader-2" [size]="20" class="text-gray-400 animate-spin"></lucide-icon>
          <span class="text-sm text-gray-400">Обновление...</span>
        </div>

        <!-- Ошибка загрузки -->
        <div *ngIf="error"
             class="flex flex-col items-center text-center space-y-3 py-8">
          <div class="rounded-full bg-red-500/20 p-6">
            <lucide-icon name="alert-circle" [size]="48" class="text-red-400"></lucide-icon>
          </div>
          <p class="text-sm text-gray-300">Не удалось загрузить статусы роботов.</p>
          <button (click)="onRefresh.emit()"
                  class="text-sm text-[#b8c959] hover:underline"
                  aria-label="Повторить загрузку статусов роботов">
            Повторить
          </button>
        </div>

        <!-- Footer: кнопки -->
        <div class="space-y-2">
          <!-- Кнопка «Продолжить» (только в режиме выбора робота) -->
          <button *ngIf="proceedLabel" (click)="onProceed.emit()"
            class="w-full h-14 bg-[#b8c959] text-black hover:bg-[#c8d96a] border-none rounded font-medium transition-colors"
            [attr.aria-label]="proceedLabel">
            {{ proceedLabel }}
          </button>
          <button (click)="onClose.emit()"
            class="w-full h-14 bg-[#1a1a1a] text-white hover:bg-[#252525] border-none rounded font-medium transition-colors"
            aria-label="Закрыть окно статусов роботов">
            Закрыть
          </button>
        </div>
      </div>
    </pudu-pos-dialog>
  `,
})
export class RobotStatusComponent {
  @Input() open = false;
  @Input() robots: AvailableRobot[] = [];
  @Input() loading = false;
  @Input() error = false;
  @Input() lastRefresh: Date = new Date();
  @Input() title: string = 'Статус роботов';
  @Input() subtitle: string = 'Текущее состояние всех роботов ресторана';
  @Input() proceedLabel: string | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onRefresh = new EventEmitter<void>();
  @Output() onProceed = new EventEmitter<void>();

  get sortedRobots(): AvailableRobot[] {
    const order: Record<string, number> = { free: 0, busy: 1, offline: 2 };
    return [...this.robots].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  }

  dualName(robot: AvailableRobot): { primary: string; secondary: string | null } {
    return displayRobotNameDual(robot.ne_name, robot.alias, robot.robot_id);
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
}
