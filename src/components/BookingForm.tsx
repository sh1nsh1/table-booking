"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
} from "react";
import type {
  BookingField,
  BookingFormData,
  BookingStatus,
  FormErrors,
} from "@/types/booking";
import {
  SIMULATED_DELAY_MS,
  TIME_SLOTS,
  formatPhone,
  todayISO,
  validateDate,
  validateForm,
  validateGuests,
  validateName,
  validatePhone,
  validateTime,
} from "@/lib/validation";
import "./BookingForm.css";

interface BookingFormProps {
  onBooked: (data: BookingFormData) => void;
}

const GUEST_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

const EMPTY_FORM = { name: "", phone: "", date: "", time: "", guests: "" };

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={htmlFor} className="field__label">
        {label}
      </label>
      {children}
      {/* Слот под ошибку рендерится всегда, чтобы её появление не сдвигало форму. */}
      <p
        id={`${htmlFor}-error`}
        role="alert"
        aria-hidden={error === undefined}
        className="field__error"
      >
        {error ?? ""}
      </p>
    </div>
  );
}

/** Индекс в отформатированной строке сразу после цифры с порядковым номером digitCount. */
function caretIndexAfter(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      seen += 1;
      if (seen === digitCount) return i + 1;
    }
  }
  return formatted.length;
}

export default function BookingForm({ onBooked }: BookingFormProps) {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<BookingStatus>("idle");
  const [pending, setPending] = useState<BookingFormData | null>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status !== "loading" || pending === null) return;
    const timer = setTimeout(() => {
      setStatus("success");
      onBooked(pending);
    }, SIMULATED_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, pending, onBooked]);

  const isLoading = status === "loading";

  const controlClass = (hasError: boolean) =>
    hasError ? "field__control field__control--invalid" : "field__control";

  function setField(field: BookingField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function setFieldError(field: BookingField, error: string | null) {
    setErrors((prev) => {
      const next = { ...prev };
      if (error === null) delete next[field];
      else next[field] = error;
      return next;
    });
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const caretPos = input.selectionStart ?? input.value.length;
    const digitsBeforeCaret = input.value
      .slice(0, caretPos)
      .replace(/\D/g, "").length;

    const formatted = formatPhone(input.value);

    const insertedDigits =
      formatted.replace(/\D/g, "").length - input.value.replace(/\D/g, "").length;

    setField("phone", formatted);

    requestAnimationFrame(() => {
      const el = phoneInputRef.current;
      if (el === null) return;
      const nextCaret = caretIndexAfter(formatted, digitsBeforeCaret + insertedDigits);
      el.setSelectionRange(nextCaret, nextCaret);
    });
  }

  const handleSubmit: FormSubmitHandler = (event) => {
    event.preventDefault();
    if (isLoading) return;

    const data: BookingFormData = {
      name: values.name.trim(),
      phone: values.phone,
      date: values.date,
      time: values.time,
      guests: Number(values.guests),
    };

    const validationErrors = validateForm(data);
    setErrors(validationErrors);

    const firstErrorField = (Object.keys(validationErrors) as BookingField[])[0];
    if (firstErrorField !== undefined) {
      document.getElementById(`booking-${firstErrorField}`)?.focus();
      return;
    }

    setPending(data);
    setStatus("loading");
  };

  return (
    <section className="form-card">
      <header className="form-card__header">
        <p className="form-card__overline">Онлайн-бронирование</p>
        <h1 className="form-card__title">Бронирование столика</h1>
        <p className="form-card__subtitle">
          Заполните форму — мы подтвердим бронь в течение пары минут.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isLoading}
        className="form"
      >
        <Field label="Имя гостя" htmlFor="booking-name" error={errors.name}>
          <input
            id="booking-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Иван Иванов"
            value={values.name}
            disabled={isLoading}
            onChange={(event) => setField("name", event.target.value)}
            onBlur={() => setFieldError("name", validateName(values.name))}
            aria-invalid={errors.name !== undefined}
            className={controlClass(errors.name !== undefined)}
          />
        </Field>

        <Field label="Телефон" htmlFor="booking-phone" error={errors.phone}>
          <input
            ref={phoneInputRef}
            id="booking-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 (999) 123-45-67"
            maxLength={18}
            value={values.phone}
            disabled={isLoading}
            onChange={handlePhoneChange}
            onBlur={() => setFieldError("phone", validatePhone(values.phone))}
            aria-invalid={errors.phone !== undefined}
            className={controlClass(errors.phone !== undefined)}
          />
        </Field>

        <div className="form__row">
          <Field label="Дата" htmlFor="booking-date" error={errors.date}>
            <input
              id="booking-date"
              name="date"
              type="date"
              min={todayISO()}
              value={values.date}
              disabled={isLoading}
              onChange={(event) => setField("date", event.target.value)}
              onBlur={() => setFieldError("date", validateDate(values.date))}
              aria-invalid={errors.date !== undefined}
              className={controlClass(errors.date !== undefined)}
            />
          </Field>

          <Field label="Время" htmlFor="booking-time" error={errors.time}>
            <select
              id="booking-time"
              name="time"
              value={values.time}
              disabled={isLoading}
              onChange={(event) => setField("time", event.target.value)}
              onBlur={() => setFieldError("time", validateTime(values.time))}
              aria-invalid={errors.time !== undefined}
              className={controlClass(errors.time !== undefined)}
            >
              <option value="">Выберите время</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Количество гостей" htmlFor="booking-guests" error={errors.guests}>
          <select
            id="booking-guests"
            name="guests"
            value={values.guests}
            disabled={isLoading}
            onChange={(event) => setField("guests", event.target.value)}
            onBlur={() => setFieldError("guests", validateGuests(values.guests))}
            aria-invalid={errors.guests !== undefined}
            className={controlClass(errors.guests !== undefined)}
          >
            <option value="">Выберите количество</option>
            {GUEST_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </Field>

        <button type="submit" disabled={isLoading} className="button">
          {isLoading ? (
            <>
              <span aria-hidden="true" className="spinner" />
              Бронирую…
            </>
          ) : (
            "Забронировать столик"
          )}
        </button>
      </form>
    </section>
  );
}
