"use client";

import { useState } from "react";
import BookingForm from "@/components/BookingForm";
import ConfirmationScreen from "@/components/ConfirmationScreen";
import type { BookingFormData } from "@/types/booking";
import "./page.css";

export default function Home() {
  const [booking, setBooking] = useState<BookingFormData | null>(null);

  return (
    <main className="page">
      <div className="page__container">
        {booking === null ? (
          <BookingForm onBooked={setBooking} />
        ) : (
          <ConfirmationScreen booking={booking} onBookAnother={() => setBooking(null)} />
        )}
      </div>
    </main>
  );
}
