import type { BookingFormData, FormErrors } from "@/types/booking";

/** Слоты бронирования: с 12:00 до 22:00 с шагом 1 час. */
export const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => `${12 + i}:00`);

/** Имитация задержки ответа сервера при отправке формы. */
export const SIMULATED_DELAY_MS = 1500;

/** Сегодняшняя дата в формате YYYY-MM-DD (локальный часовой пояс). */
export function todayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateName(value: string): string | null {
  const name = value.trim();
  if (!name) return "Укажите имя гостя";
  if (name.length < 2) return "Имя должно содержать минимум 2 символа";
  return null;
}

/**
 * Форматирует телефон в вид +7 (XXX) XXX-XX-XX.
 * Первую цифру 8 заменяет на 7; если номер введён без кода страны
 * (первая цифра не 7 и не 8), автоматически подставляет +7.
 */
export function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits === "") return "";

  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  } else if (!digits.startsWith("7")) {
    digits = `7${digits}`;
  }

  digits = digits.slice(0, 11);

  if (digits.length <= 1) return "+7";

  let formatted = `+7 (${digits.slice(1, 4)}`;
  if (digits.length >= 4) formatted += ")";
  if (digits.length >= 5) formatted += ` ${digits.slice(4, 7)}`;
  if (digits.length >= 8) formatted += `-${digits.slice(7, 9)}`;
  if (digits.length >= 10) formatted += `-${digits.slice(9, 11)}`;
  return formatted;
}

export function validatePhone(value: string): string | null {
  // Убираем пробелы, скобки и дефисы — оставляем только цифры.
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && (digits[0] === "7" || digits[0] === "8")) {
    return null;
  }
  return "Введите +7XXXXXXXXXX или 8XXXXXXXXXX";
}

export function validateDate(value: string): string | null {
  if (!value) return "Укажите дату";
  if (value < todayISO()) return "Дата не может быть раньше сегодня";
  return null;
}

export function validateTime(value: string): string | null {
  if (!value) return "Выберите время";
  if (!TIME_SLOTS.includes(value)) return "Выберите доступный слот бронирования";
  return null;
}

export function validateGuests(value: string): string | null {
  const guests = Number(value);
  if (value.trim() === "" || !Number.isInteger(guests)) {
    return "Укажите количество гостей";
  }
  if (guests < 1 || guests > 12) {
    return "Количество гостей должно быть от 1 до 12";
  }
  return null;
}

/** Валидация всей формы при отправке. */
export function validateForm(data: BookingFormData): FormErrors {
  const errors: FormErrors = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;

  const dateError = validateDate(data.date);
  if (dateError) errors.date = dateError;

  const timeError = validateTime(data.time);
  if (timeError) errors.time = timeError;

  const guestsError = validateGuests(String(data.guests));
  if (guestsError) errors.guests = guestsError;

  return errors;
}
