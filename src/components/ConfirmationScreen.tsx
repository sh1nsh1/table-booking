"use client";

import type { BookingFormData } from "@/types/booking";
import { formatPhone } from "@/lib/validation";
import "./ConfirmationScreen.css";

interface ConfirmationScreenProps {
  booking: BookingFormData;
  onBookAnother: () => void;
}

function pluralGuests(count: number): string {
  if (count === 1) return "1 гость";
  if (count >= 2 && count <= 4) return `${count} гостя`;
  return `${count} гостей`;
}

/** "2026-08-10" → "10 августа 2026 г." */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ConfirmationScreen({
  booking,
  onBookAnother,
}: ConfirmationScreenProps) {
  const details: Array<{ label: string; value: string }> = [
    { label: "Имя", value: booking.name },
    { label: "Телефон", value: formatPhone(booking.phone) },
    { label: "Дата", value: formatDate(booking.date) },
    { label: "Время", value: booking.time },
    { label: "Количество гостей", value: pluralGuests(booking.guests) },
  ];

  return (
    <section className="confirmation">
      <div className="confirmation__icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="confirmation__title">Бронирование подтверждено</h1>
      <p className="confirmation__lead">
        {booking.name}, ждём вас {formatDate(booking.date)} в {booking.time}.
      </p>

      <dl className="confirmation__details">
        {details.map((detail) => (
          <div key={detail.label} className="confirmation__row">
            <dt className="confirmation__label">{detail.label}</dt>
            <dd className="confirmation__value">{detail.value}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={onBookAnother}
        className="button confirmation__button"
      >
        Забронировать ещё
      </button>
    </section>
  );
}
