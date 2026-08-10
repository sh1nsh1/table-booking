export interface BookingFormData {
  name: string;
  phone: string;
  /** Дата в формате YYYY-MM-DD (значение из input type="date"). */
  date: string;
  /** Время — один из слотов: 12:00 … 22:00. */
  time: string;
  guests: number;
}

/** Состояние отправки формы. */
export type BookingStatus = "idle" | "loading" | "success";

export type BookingField = keyof BookingFormData;

/** Ошибки валидации: ключ — поле, значение — текст ошибки. */
export type FormErrors = Partial<Record<BookingField, string>>;
