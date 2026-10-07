export type BookingService =
  | "driver"
  | "guide"
  | "package";

export type BookingStatus =
  | "pending"
  | "driver_accepted"
  | "guide_accepted"
  | "confirmed"
  | "ongoing"
  | "completed"
  | "cancelled";

export type DriverInfo = {
  id?: string;
  name: string;
  phone: string;
  vehicle: string;
  plateNumber?: string;
  photo: string;
  status: "pending" | "assigned" | "accepted";
  acceptedAt?: string;
};

export type GuideInfo = {
  id?: string;
  name: string;
  phone: string;
  photo: string;
  languages?: string[];
  specialties?: string[];
  status: "pending" | "assigned" | "accepted";
  acceptedAt?: string;
};

export type BookingOrder = {
  id: string;

  // ============================================================
  // IDENTITAS CUSTOMER
  // ============================================================

  userId?: string;
  userEmail?: string;

  // ============================================================
  // DETAIL BOOKING
  // ============================================================

  service: BookingService;

  destinationId?: string;
  destinationName: string;

  pickup: string;

  pickupLatitude?: number;
  pickupLongitude?: number;

  destinationLatitude?: number;
  destinationLongitude?: number;

  passengers: number;

  name: string;
  phone: string;

  date?: string;
  time?: string;

  notes?: string;

  vehicle?: string;
  vehiclePrice?: number;

  packageName?: string;
  packagePrice?: number;

  distance?: string;
  duration?: string;

  totalPrice: number;

  // ============================================================
  // STATUS
  // ============================================================

  status: BookingStatus;

  // ============================================================
  // DRIVER
  // ============================================================

  driverId?: string;
  driverAcceptedAt?: string;
  driver?: DriverInfo;

  // ============================================================
  // GUIDE
  // ============================================================

  guideId?: string;
  guideAcceptedAt?: string;
  guide?: GuideInfo;

  // ============================================================
  // WAKTU
  // ============================================================

  createdAt: string;
};

export const BOOKING_STORAGE_KEY =
  "funtravel_bookings";

// ============================================================
// AMBIL SEMUA BOOKING
// ============================================================

export function getBookings(): BookingOrder[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data = localStorage.getItem(
      BOOKING_STORAGE_KEY
    );

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error(
      "Gagal membaca data booking:",
      error
    );

    return [];
  }
}

// ============================================================
// AMBIL BOOKING MILIK CUSTOMER
// ============================================================

export function getCustomerBookings(
  userId?: string,
  userEmail?: string
): BookingOrder[] {
  const bookings = getBookings();

  if (!userId && !userEmail) {
    return [];
  }

  const normalizedEmail =
    userEmail?.trim().toLowerCase() || "";

  return bookings.filter((booking) => {
    // Prioritas utama: userId
    if (
      userId &&
      booking.userId &&
      booking.userId === userId
    ) {
      return true;
    }

    // Fallback untuk booking lama yang hanya punya email
    if (
      normalizedEmail &&
      booking.userEmail &&
      booking.userEmail
        .trim()
        .toLowerCase() === normalizedEmail
    ) {
      return true;
    }

    return false;
  });
}

// ============================================================
// SIMPAN BOOKING
// ============================================================

export function saveBooking(
  order: BookingOrder
) {
  if (typeof window === "undefined") {
    return;
  }

  const bookings = getBookings();

  bookings.unshift(order);

  localStorage.setItem(
    BOOKING_STORAGE_KEY,
    JSON.stringify(bookings)
  );
}

// ============================================================
// UPDATE BOOKING
// ============================================================

export function updateBooking(
  id: string,
  updates: Partial<BookingOrder>
) {
  if (typeof window === "undefined") {
    return;
  }

  const bookings = getBookings();

  const updated = bookings.map((booking) =>
    booking.id === id
      ? {
          ...booking,
          ...updates,
        }
      : booking
  );

  localStorage.setItem(
    BOOKING_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

// ============================================================
// HAPUS BOOKING
// ============================================================

export function deleteBooking(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  const bookings = getBookings();

  const updated = bookings.filter(
    (booking) => booking.id !== id
  );

  localStorage.setItem(
    BOOKING_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

// ============================================================
// FORMAT RUPIAH
// ============================================================

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}