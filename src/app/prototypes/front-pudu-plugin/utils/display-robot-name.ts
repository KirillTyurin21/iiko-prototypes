/**
 * v1.5 (I2): Утилиты для форматирования двойного имени робота.
 * Показывает оба имени (системное NE + пользовательский alias), если alias задан и отличается.
 *
 * Источник: SPEC-003 v1.13, раздел 2.4.6 — функция display_robot_name
 */

/**
 * Формирует отображаемое имя робота (однострочное).
 *
 * @param ne_name - Системное имя из NE / PUDU Cloud (например, "BellaBot-1")
 * @param alias - Пользовательский alias из iiko Web (ConfigManager). null если не задан
 * @param robot_id - Серийный номер робота (fallback)
 * @returns Форматированная строка для показа в UI
 *
 * Примеры:
 *   displayRobotName("BellaBot-1", "Белла Зал 1")       → "Белла Зал 1 (BellaBot-1)"
 *   displayRobotName("BellaBot-1", "BellaBot-1")         → "BellaBot-1"
 *   displayRobotName("BellaBot-1", null)                  → "BellaBot-1"
 *   displayRobotName(null, "Белла Зал 1", "PD20240600")  → "Белла Зал 1"
 *   displayRobotName(null, null, "PD2024060012")           → "PD2024060012"
 */
export function displayRobotName(
  ne_name: string | null,
  alias: string | null,
  robot_id?: string
): string {
  if (alias && ne_name && alias !== ne_name) {
    return `${alias} (${ne_name})`;
  }
  if (ne_name) return ne_name;
  if (alias) return alias;
  return robot_id ?? 'Неизвестный робот';
}

/**
 * Для двустрочного отображения в таблицах (П1, П7).
 * Возвращает объект {primary, secondary}:
 *   primary — основное имя (alias или ne_name)
 *   secondary — системное имя NE (если alias отличается), иначе null
 */
export function displayRobotNameDual(
  ne_name: string | null,
  alias: string | null,
  robot_id?: string
): { primary: string; secondary: string | null } {
  if (alias && ne_name && alias !== ne_name) {
    return { primary: alias, secondary: ne_name };
  }
  if (ne_name) return { primary: ne_name, secondary: null };
  if (alias) return { primary: alias, secondary: null };
  return { primary: robot_id ?? 'Неизвестный робот', secondary: null };
}
