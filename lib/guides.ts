export type GuideStatus =
  | "available"
  | "busy"
  | "offline";

export type GuideAccountStatus =
  | "pending"
  | "approved"
  | "rejected";

export type Guide = {
  id: string;

  name: string;
  phone: string;
  photo: string;

  languages: string[];
  specialties: string[];

  status: GuideStatus;

  accountStatus: GuideAccountStatus;

  rejectionReason?: string;

  approvedAt?: string;
  approvedBy?: string;

  rating: number;
  totalTrips: number;

  createdAt: string;
};

export const GUIDE_STORAGE_KEY =
  "funtravel_guides";
export const GUIDE_SESSION_KEY =
  "funtravel_guide_session";

export const defaultGuides: Guide[] = [
  {
    id: "GUI-001",

    name: "Lalu Fajar",

    phone: "081234567891",

    photo: "",

    languages: [
      "Bahasa Indonesia",
      "English",
    ],

    specialties: [
      "Budaya",
      "Pantai",
      "Mandalika",
    ],

    status: "available",

    accountStatus: "approved",

    approvedAt:
      "2026-01-02T08:00:00.000Z",

    approvedBy: "ADMIN",

    rating: 4.9,

    totalTrips: 87,

    createdAt:
      "2026-01-02T08:00:00.000Z",
  },

  {
    id: "GUI-002",

    name: "Maya",

    phone: "081298765433",

    photo: "",

    languages: [
      "Bahasa Indonesia",
      "English",
    ],

    specialties: [
      "Gili",
      "Snorkeling",
      "Pantai",
    ],

    status: "available",

    accountStatus: "approved",

    approvedAt:
      "2026-01-07T08:00:00.000Z",

    approvedBy: "ADMIN",

    rating: 4.8,

    totalTrips: 72,

    createdAt:
      "2026-01-07T08:00:00.000Z",
  },

  {
    id: "GUI-003",

    name: "Rian",

    phone: "082112223334",

    photo: "",

    languages: [
      "Bahasa Indonesia",
    ],

    specialties: [
      "Alam",
      "Gunung",
      "Desa Wisata",
    ],

    status: "offline",

    accountStatus: "approved",

    approvedAt:
      "2026-01-12T08:00:00.000Z",

    approvedBy: "ADMIN",

    rating: 4.9,

    totalTrips: 103,

    createdAt:
      "2026-01-12T08:00:00.000Z",
  },
];

/* =========================================================
   GET GUIDES
========================================================= */

export function getGuides(): Guide[] {
  if (typeof window === "undefined") {
    return defaultGuides;
  }

  try {
    const data =
      localStorage.getItem(
        GUIDE_STORAGE_KEY
      );

    /*
     * Belum ada data sama sekali.
     */
    if (!data) {
      localStorage.setItem(
        GUIDE_STORAGE_KEY,
        JSON.stringify(
          defaultGuides
        )
      );

      return defaultGuides;
    }

    const parsed =
      JSON.parse(data);

    /*
     * Data rusak / bukan array.
     */
    if (!Array.isArray(parsed)) {
      localStorage.setItem(
        GUIDE_STORAGE_KEY,
        JSON.stringify(
          defaultGuides
        )
      );

      return defaultGuides;
    }

    /*
     * Normalisasi data guide.
     *
     * Guide lama yang belum mempunyai
     * accountStatus dianggap sebagai
     * guide lama yang sudah disetujui.
     */
    const normalizedGuides =
      parsed.map(
        (
          guide: Partial<Guide>,
          index: number
        ) => {
          const defaultGuide =
            defaultGuides.find(
              (item) =>
                item.id ===
                guide.id
            ) ||
            defaultGuides[index] ||
            defaultGuides[0];

          /*
           * Guide bawaan sistem
           * dianggap approved.
           *
           * Guide baru dari register
           * tanpa accountStatus akan
           * dianggap pending.
           */
          const isDefaultGuide =
            defaultGuides.some(
              (item) =>
                item.id ===
                guide.id
            );

          let accountStatus:
            GuideAccountStatus;

          if (
            guide.accountStatus ===
              "approved" ||
            guide.accountStatus ===
              "rejected" ||
            guide.accountStatus ===
              "pending"
          ) {
            accountStatus =
              guide.accountStatus;
          } else {
            accountStatus =
              isDefaultGuide
                ? "approved"
                : "pending";
          }

          /*
           * Pastikan status operasional
           * hanya mempunyai 3 nilai valid.
           */
          const status =
            guide.status ===
                "available" ||
            guide.status ===
              "busy" ||
            guide.status ===
              "offline"
              ? guide.status
              : "offline";

          /*
           * Guide yang belum disetujui
           * tidak boleh online.
           */
          const normalizedStatus =
            accountStatus ===
              "approved"
              ? status
              : "offline";

          return {
            ...defaultGuide,

            ...guide,

            id:
              guide.id ||
              defaultGuide.id,

            name:
              guide.name ||
              defaultGuide.name,

            phone:
              guide.phone ||
              defaultGuide.phone,

            photo:
              guide.photo ??
              defaultGuide.photo,

            languages:
              Array.isArray(
                guide.languages
              )
                ? guide.languages
                : defaultGuide.languages,

            specialties:
              Array.isArray(
                guide.specialties
              )
                ? guide.specialties
                : defaultGuide.specialties,

            status:
              normalizedStatus,

            accountStatus,

            rejectionReason:
              guide.rejectionReason,

            approvedAt:
              guide.approvedAt,

            approvedBy:
              guide.approvedBy,

            rating:
              typeof guide.rating ===
                "number" &&
              Number.isFinite(
                guide.rating
              )
                ? guide.rating
                : defaultGuide.rating,

            totalTrips:
              typeof guide.totalTrips ===
                "number" &&
              Number.isFinite(
                guide.totalTrips
              )
                ? guide.totalTrips
                : defaultGuide.totalTrips,

            createdAt:
              guide.createdAt ||
              defaultGuide.createdAt,
          };
        }
      );

    /*
     * Simpan hasil normalisasi
     * supaya struktur localStorage
     * selalu konsisten.
     */
    localStorage.setItem(
      GUIDE_STORAGE_KEY,
      JSON.stringify(
        normalizedGuides
      )
    );

    return normalizedGuides;
  } catch (error) {
    console.error(
      "Gagal membaca data guide:",
      error
    );

    localStorage.setItem(
      GUIDE_STORAGE_KEY,
      JSON.stringify(
        defaultGuides
      )
    );

    return defaultGuides;
  }
}

/* =========================================================
   SAVE GUIDE
========================================================= */

export function saveGuide(
  guide: Guide
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const guides =
    getGuides();

  const existingIndex =
    guides.findIndex(
      (item) =>
        item.id ===
        guide.id
    );

  if (
    existingIndex >= 0
  ) {
    guides[
      existingIndex
    ] = guide;
  } else {
    guides.push(guide);
  }

  localStorage.setItem(
    GUIDE_STORAGE_KEY,
    JSON.stringify(
      guides
    )
  );
}

/* =========================================================
   UPDATE GUIDE
========================================================= */

export function updateGuide(
  id: string,
  updates: Partial<Guide>
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const guides =
    getGuides();

  const updated =
    guides.map(
      (guide) =>
        guide.id === id
          ? {
              ...guide,
              ...updates,
            }
          : guide
    );

  localStorage.setItem(
    GUIDE_STORAGE_KEY,
    JSON.stringify(
      updated
    )
  );
}

/* =========================================================
   GET GUIDE BY ID
========================================================= */

export function getGuideById(
  id: string
): Guide | undefined {
  return getGuides().find(
    (guide) =>
      guide.id === id
  );
}

/* =========================================================
   GET GUIDE BY PHONE
========================================================= */

export function getGuideByPhone(
  phone: string
): Guide | undefined {
  const normalized =
    phone.replace(
      /\D/g,
      ""
    );

  return getGuides().find(
    (guide) =>
      guide.phone.replace(
        /\D/g,
        ""
      ) === normalized
  );
}

/* =========================================================
   DELETE GUIDE
========================================================= */

export function deleteGuide(
  id: string
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const guides =
    getGuides();

  const updated =
    guides.filter(
      (guide) =>
        guide.id !== id
    );

  localStorage.setItem(
    GUIDE_STORAGE_KEY,
    JSON.stringify(
      updated
    )
  );
}

/* =========================================================
   STATUS OPERASIONAL
========================================================= */

/*
 * Guide menjadi Available.
 *
 * Hanya guide yang sudah disetujui
 * yang boleh menjadi available.
 */
export function setGuideAvailable(
  id: string
) {
  const guide =
    getGuideById(id);

  if (!guide) {
    return;
  }

  if (
    guide.accountStatus !==
    "approved"
  ) {
    updateGuide(id, {
      status: "offline",
    });

    return;
  }

  updateGuide(id, {
    status: "available",
  });
}

/*
 * Guide menjadi Busy.
 */
export function setGuideBusy(
  id: string
) {
  const guide =
    getGuideById(id);

  if (!guide) {
    return;
  }

  if (
    guide.accountStatus !==
    "approved"
  ) {
    updateGuide(id, {
      status: "offline",
    });

    return;
  }

  updateGuide(id, {
    status: "busy",
  });
}

/*
 * Guide menjadi Offline.
 */
export function setGuideOffline(
  id: string
) {
  updateGuide(id, {
    status: "offline",
  });
}

/* =========================================================
   APPROVAL ADMIN
========================================================= */

/*
 * ADMIN MENGAPPROVE GUIDE
 */
export function approveGuide(
  id: string,
  approvedBy = "ADMIN"
) {
  updateGuide(id, {
    accountStatus:
      "approved",

    status:
      "available",

    rejectionReason:
      "",

    approvedAt:
      new Date().toISOString(),

    approvedBy,
  });
}

/*
 * ADMIN MENOLAK GUIDE
 */
export function rejectGuide(
  id: string,
  rejectionReason = ""
) {
  updateGuide(id, {
    accountStatus:
      "rejected",

    status:
      "offline",

    rejectionReason,

    approvedAt:
      undefined,

    approvedBy:
      undefined,
  });
}

/*
 * KEMBALIKAN GUIDE KE PENDING
 */
export function resetGuideApproval(
  id: string
) {
  updateGuide(id, {
    accountStatus:
      "pending",

    status:
      "offline",

    rejectionReason:
      "",

    approvedAt:
      undefined,

    approvedBy:
      undefined,
  });
}

/* =========================================================
   CEK APAKAH GUIDE BOLEH MENERIMA ORDER
========================================================= */

export function canGuideReceiveOrders(
  guide: Guide
): boolean {
  return (
    guide.accountStatus ===
      "approved" &&
    guide.status ===
      "available"
  );
}