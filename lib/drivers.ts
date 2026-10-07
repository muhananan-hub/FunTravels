export type DriverStatus =
  | "available"
  | "busy"
  | "offline";

export type DriverAccountStatus =
  | "pending"
  | "approved"
  | "rejected";

export type Driver = {
  id: string;

  // Data akun
  name: string;
  phone: string;
  photo: string;

  // Data kendaraan
  vehicle: string;
  plateNumber: string;

  // Status operasional
  status: DriverStatus;

  // Status persetujuan akun oleh admin
  accountStatus: DriverAccountStatus;

  // Informasi penolakan / persetujuan
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;

  // Statistik
  rating: number;
  totalTrips: number;

  createdAt: string;
};

export const DRIVER_STORAGE_KEY =
  "funtravel_drivers";

export const DRIVER_SESSION_KEY =
  "funtravel_driver_session";

/*
|--------------------------------------------------------------------------
| DRIVER DEMO
|--------------------------------------------------------------------------
| Driver bawaan dianggap sudah disetujui agar bisa langsung digunakan
| untuk testing sistem.
*/

export const defaultDrivers: Driver[] = [
  {
    id: "DRV-001",
    name: "Ahmad",
    phone: "081234567890",
    photo: "",
    vehicle: "Toyota Avanza",
    plateNumber: "DR 1234 XX",

    status: "available",

    accountStatus: "approved",

    approvedAt:
      "2026-01-01T08:00:00.000Z",

    approvedBy: "ADMIN",

    rating: 4.9,
    totalTrips: 128,

    createdAt:
      "2026-01-01T08:00:00.000Z",
  },

  {
    id: "DRV-002",
    name: "Budi",
    phone: "081298765432",
    photo: "",
    vehicle: "Toyota Innova",
    plateNumber: "DR 5678 AB",

    status: "available",

    accountStatus: "approved",

    approvedAt:
      "2026-01-05T08:00:00.000Z",

    approvedBy: "ADMIN",

    rating: 4.8,
    totalTrips: 96,

    createdAt:
      "2026-01-05T08:00:00.000Z",
  },

  {
    id: "DRV-003",
    name: "Rizal",
    phone: "082112223333",
    photo: "",
    vehicle: "Toyota Hiace",
    plateNumber: "DR 9012 CD",

    status: "offline",

    accountStatus: "approved",

    approvedAt:
      "2026-01-10T08:00:00.000Z",

    approvedBy: "ADMIN",

    rating: 4.9,
    totalTrips: 174,

    createdAt:
      "2026-01-10T08:00:00.000Z",
  },
];

/*
|--------------------------------------------------------------------------
| GET DRIVERS
|--------------------------------------------------------------------------
*/

export function getDrivers(): Driver[] {
  if (typeof window === "undefined") {
    return defaultDrivers;
  }

  try {
    const data =
      localStorage.getItem(
        DRIVER_STORAGE_KEY
      );

    /*
     * Belum ada data sama sekali
     */
    if (!data) {
      localStorage.setItem(
        DRIVER_STORAGE_KEY,
        JSON.stringify(defaultDrivers)
      );

      return defaultDrivers;
    }

    const parsed = JSON.parse(data);

    /*
     * Data rusak / bukan array
     */
    if (
      !Array.isArray(parsed) ||
      parsed.length === 0
    ) {
      localStorage.setItem(
        DRIVER_STORAGE_KEY,
        JSON.stringify(defaultDrivers)
      );

      return defaultDrivers;
    }

    /*
     * Normalisasi data lama.
     *
     * Ini penting supaya data localStorage versi sebelumnya
     * tetap kompatibel setelah field accountStatus ditambahkan.
     */
    const normalizedDrivers =
      parsed.map(
        (
          driver: Partial<Driver>,
          index: number
        ) => {
          const defaultDriver =
            defaultDrivers.find(
              (item) =>
                item.id === driver.id
            ) ||
            defaultDrivers[index] ||
            defaultDrivers[0];

          /*
           * Driver bawaan yang belum mempunyai accountStatus
           * dianggap approved.
           *
           * Driver baru yang tidak dikenal dianggap pending.
           */
          const fallbackAccountStatus =
            defaultDrivers.some(
              (item) =>
                item.id === driver.id
            )
              ? "approved"
              : "pending";

          const accountStatus =
            driver.accountStatus ===
                "approved" ||
            driver.accountStatus ===
                "rejected" ||
            driver.accountStatus ===
                "pending"
              ? driver.accountStatus
              : fallbackAccountStatus;

          const status =
            driver.status ===
                "available" ||
            driver.status === "busy" ||
            driver.status === "offline"
              ? driver.status
              : "offline";

          /*
           * Driver yang belum disetujui tidak boleh berstatus
           * available/busy sebagai driver aktif.
           */
          const normalizedStatus =
            accountStatus === "approved"
              ? status
              : "offline";

          return {
            ...defaultDriver,
            ...driver,

            id:
              driver.id ||
              defaultDriver.id,

            name:
              driver.name ||
              defaultDriver.name,

            phone:
              driver.phone ||
              defaultDriver.phone,

            photo:
              driver.photo ??
              defaultDriver.photo,

            vehicle:
              driver.vehicle ||
              defaultDriver.vehicle,

            plateNumber:
              driver.plateNumber ||
              defaultDriver.plateNumber,

            status:
              normalizedStatus,

            accountStatus,

            rejectionReason:
              driver.rejectionReason,

            approvedAt:
              driver.approvedAt,

            approvedBy:
              driver.approvedBy,

            rating:
              typeof driver.rating ===
                "number" &&
              Number.isFinite(
                driver.rating
              )
                ? driver.rating
                : defaultDriver.rating,

            totalTrips:
              typeof driver.totalTrips ===
                "number" &&
              Number.isFinite(
                driver.totalTrips
              )
                ? driver.totalTrips
                : defaultDriver.totalTrips,

            createdAt:
              driver.createdAt ||
              defaultDriver.createdAt,
          };
        }
      );

    localStorage.setItem(
      DRIVER_STORAGE_KEY,
      JSON.stringify(
        normalizedDrivers
      )
    );

    return normalizedDrivers;
  } catch (error) {
    console.error(
      "Gagal membaca data driver:",
      error
    );

    localStorage.setItem(
      DRIVER_STORAGE_KEY,
      JSON.stringify(defaultDrivers)
    );

    return defaultDrivers;
  }
}

/*
|--------------------------------------------------------------------------
| SAVE DRIVER
|--------------------------------------------------------------------------
*/

export function saveDriver(
  driver: Driver
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const drivers =
    getDrivers();

  const existingIndex =
    drivers.findIndex(
      (item) =>
        item.id === driver.id
    );

  if (existingIndex >= 0) {
    drivers[existingIndex] =
      driver;
  } else {
    drivers.push(driver);
  }

  localStorage.setItem(
    DRIVER_STORAGE_KEY,
    JSON.stringify(drivers)
  );
}

/*
|--------------------------------------------------------------------------
| UPDATE DRIVER
|--------------------------------------------------------------------------
*/

export function updateDriver(
  id: string,
  updates: Partial<Driver>
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const drivers =
    getDrivers();

  const updated =
    drivers.map(
      (driver) =>
        driver.id === id
          ? {
              ...driver,
              ...updates,
            }
          : driver
    );

  localStorage.setItem(
    DRIVER_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

/*
|--------------------------------------------------------------------------
| GET DRIVER BY ID
|--------------------------------------------------------------------------
*/

export function getDriverById(
  id: string
): Driver | undefined {
  return getDrivers().find(
    (driver) =>
      driver.id === id
  );
}

/*
|--------------------------------------------------------------------------
| GET DRIVER BY PHONE
|--------------------------------------------------------------------------
*/

export function getDriverByPhone(
  phone: string
): Driver | undefined {
  const normalized =
    phone.replace(/\D/g, "");

  return getDrivers().find(
    (driver) =>
      driver.phone.replace(/\D/g, "") ===
      normalized
  );
}

/*
|--------------------------------------------------------------------------
| DELETE DRIVER
|--------------------------------------------------------------------------
*/

export function deleteDriver(
  id: string
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const drivers =
    getDrivers();

  const updated =
    drivers.filter(
      (driver) =>
        driver.id !== id
    );

  localStorage.setItem(
    DRIVER_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

/*
|--------------------------------------------------------------------------
| DRIVER OPERATIONAL STATUS
|--------------------------------------------------------------------------
*/

export function setDriverAvailable(
  id: string
) {
  const driver =
    getDriverById(id);

  if (!driver) return;

  /*
   * Hanya driver yang sudah disetujui
   * yang boleh menjadi available.
   */
  if (
    driver.accountStatus !==
    "approved"
  ) {
    updateDriver(id, {
      status: "offline",
    });

    return;
  }

  updateDriver(id, {
    status: "available",
  });
}

export function setDriverBusy(
  id: string
) {
  const driver =
    getDriverById(id);

  if (!driver) return;

  /*
   * Driver belum approved tidak boleh busy.
   */
  if (
    driver.accountStatus !==
    "approved"
  ) {
    updateDriver(id, {
      status: "offline",
    });

    return;
  }

  updateDriver(id, {
    status: "busy",
  });
}

export function setDriverOffline(
  id: string
) {
  updateDriver(id, {
    status: "offline",
  });
}

/*
|--------------------------------------------------------------------------
| APPROVAL SYSTEM
|--------------------------------------------------------------------------
*/

/*
 * Admin menyetujui driver.
 */
export function approveDriver(
  id: string,
  approvedBy = "ADMIN"
) {
  updateDriver(id, {
    accountStatus: "approved",
    status: "available",
    rejectionReason: "",
    approvedAt:
      new Date().toISOString(),
    approvedBy,
  });
}

/*
 * Admin menolak driver.
 */
export function rejectDriver(
  id: string,
  rejectionReason = ""
) {
  updateDriver(id, {
    accountStatus: "rejected",
    status: "offline",
    rejectionReason,
    approvedAt: undefined,
    approvedBy: undefined,
  });
}

/*
 * Admin mengembalikan driver rejected
 * menjadi pending untuk proses review ulang.
 */
export function resetDriverApproval(
  id: string
) {
  updateDriver(id, {
    accountStatus: "pending",
    status: "offline",
    rejectionReason: "",
    approvedAt: undefined,
    approvedBy: undefined,
  });
}

/*
|--------------------------------------------------------------------------
| CHECK DRIVER ELIGIBILITY
|--------------------------------------------------------------------------
*/

export function canDriverReceiveOrders(
  driver: Driver
): boolean {
  return (
    driver.accountStatus ===
      "approved" &&
    driver.status === "available"
  );
}