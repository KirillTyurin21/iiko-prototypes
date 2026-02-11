import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  UiButtonComponent,
  UiCardComponent,
  UiCardTitleComponent,
  UiInputComponent,
  UiTextareaComponent,
  UiSelectComponent,
  UiCheckboxComponent,
  UiToggleComponent,
  UiModalComponent,
  UiBreadcrumbsComponent,
  UiAlertComponent,
  UiDividerComponent,
} from '@/components/ui/index';
import { IconsModule } from '@/shared/icons.module';

@Component({
  selector: 'app-demo-form-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiButtonComponent,
    UiCardComponent,
    UiCardTitleComponent,
    UiInputComponent,
    UiTextareaComponent,
    UiSelectComponent,
    UiCheckboxComponent,
    UiToggleComponent,
    UiModalComponent,
    UiBreadcrumbsComponent,
    UiAlertComponent,
    UiDividerComponent,
    IconsModule,
  ],
  template: `
    <div class="max-w-2xl">
      <ui-breadcrumbs [items]="breadcrumbs"></ui-breadcrumbs>

      <div class="mt-4 mb-6">
        <h2 class="text-xl font-medium text-text-primary">Создание элемента</h2>
        <p class="text-sm text-text-secondary mt-1">Заполните форму и нажмите «Сохранить».</p>
      </div>

      <form (ngSubmit)="handleSubmit()">
        <ui-card padding="lg">
          <ui-card-title>Основная информация</ui-card-title>
          <div class="mt-4 space-y-4">
            <ui-input label="Наименование" placeholder="Введите наименование..." [(value)]="name" [error]="errors['name']"></ui-input>

            <div class="grid grid-cols-2 gap-4">
              <ui-select label="Категория" [(value)]="category" placeholder="Выберите..." [error]="errors['category']"
                [options]="categoryOptions"></ui-select>
              <ui-input label="Цена, ₽" placeholder="0" type="number" [(value)]="price" [error]="errors['price']"></ui-input>
            </div>

            <ui-textarea label="Описание" placeholder="Краткое описание элемента..." [(value)]="description" hint="Необязательное поле"></ui-textarea>

            <ui-divider></ui-divider>

            <div class="space-y-3">
              <ui-toggle label="Активен" [checked]="isActive" (checkedChange)="isActive = $event"></ui-toggle>
              <ui-checkbox label="Опубликовать на сайте" [checked]="isPublished" (checkedChange)="isPublished = $event"></ui-checkbox>
            </div>

            <ui-alert *ngIf="hasErrors" variant="error" title="Ошибка валидации">
              Заполните все обязательные поля корректно.
            </ui-alert>
          </div>
        </ui-card>

        <div class="mt-4 flex items-center justify-between">
          <ui-button type="button" variant="ghost" iconName="arrow-left" (click)="goBack()">Назад</ui-button>
          <ui-button type="submit" variant="primary" iconName="save">Сохранить</ui-button>
        </div>
      </form>

      <ui-modal [open]="successModal" (modalClose)="successModal = false" title="Готово" size="sm">
        <div class="flex flex-col items-center py-4">
          <lucide-icon name="check-circle-2" [size]="48" class="text-app-success mb-3"></lucide-icon>
          <p class="text-text-primary font-medium">Элемент успешно создан!</p>
          <p class="text-sm text-text-secondary mt-1">{{ name }} — {{ price }} ₽</p>
        </div>
        <div modalFooter>
          <ui-button variant="primary" (click)="onSuccess()">Вернуться на главный экран</ui-button>
        </div>
      </ui-modal>
    </div>
  `,
})
export class DemoFormScreenComponent {
  private router = inject(Router);

  name = '';
  category = '';
  price = '';
  description = '';
  isActive = true;
  isPublished = false;
  errors: Record<string, string> = {};
  successModal = false;

  categoryOptions = [
    { value: 'pizza', label: 'Пицца' },
    { value: 'salads', label: 'Салаты' },
    { value: 'soups', label: 'Супы' },
    { value: 'drinks', label: 'Напитки' },
    { value: 'desserts', label: 'Десерты' },
  ];

  breadcrumbs = [
    { label: 'Демо-прототип', onClick: () => this.goBack() },
    { label: 'Форма ввода' },
  ];

  get hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  validate(): boolean {
    this.errors = {};

    if (!this.name.trim()) {
      this.errors['name'] = 'Введите наименование';
    }
    if (!this.category) {
      this.errors['category'] = 'Выберите категорию';
    }
    const priceNum = Number(this.price);
    if (!this.price || isNaN(priceNum) || priceNum <= 0) {
      this.errors['price'] = 'Введите корректную цену';
    }

    return Object.keys(this.errors).length === 0;
  }

  handleSubmit(): void {
    if (this.validate()) {
      this.successModal = true;
    }
  }

  goBack(): void {
    this.router.navigate(['/prototype/demo']);
  }

  onSuccess(): void {
    this.successModal = false;
    this.goBack();
  }
}
