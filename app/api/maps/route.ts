import { NextRequest, NextResponse } from "next/server";

// ============================================================
// TYPE
// ============================================================

type GeocodeResult = {
  lat: string;
  lon: string;
  display_name: string;
};

type Coordinates = {
  latitude: number;
  longitude: number;
  displayName: string;
};

// ============================================================
// POST
// POST /api/maps
//
// Fungsi:
// - Mencari koordinat pickup
// - Mencari koordinat tujuan
// - Menggunakan koordinat dari peta jika tersedia
// - Menghitung rute menggunakan OSRM
// ============================================================

export async function POST(
  request: NextRequest
) {
  try {
    // ========================================================
    // BACA REQUEST
    // ========================================================

    const body = await request.json();

    // ========================================================
    // DATA TEXT
    // ========================================================

    const pickup = String(
      body.pickup || ""
    ).trim();

    const destination = String(
      body.destination || ""
    ).trim();

    // ========================================================
    // DATA KOORDINAT PICKUP
    // ========================================================

    const pickupLatitude =
      toNumber(
        body.pickupLatitude
      );

    const pickupLongitude =
      toNumber(
        body.pickupLongitude
      );

    // ========================================================
    // DATA KOORDINAT TUJUAN
    // ========================================================

    const destinationLatitude =
      toNumber(
        body.destinationLatitude
      );

    const destinationLongitude =
      toNumber(
        body.destinationLongitude
      );

    // ========================================================
    // VALIDASI PICKUP
    // ========================================================

    if (
      !pickup &&
      !hasCompleteCoordinates(
        pickupLatitude,
        pickupLongitude
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Lokasi pickup wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // VALIDASI DESTINATION
    // ========================================================

    if (
      !destination &&
      !hasCompleteCoordinates(
        destinationLatitude,
        destinationLongitude
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Lokasi tujuan wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // VALIDASI KOORDINAT PICKUP
    // ========================================================

    if (
      (pickupLatitude !== null ||
        pickupLongitude !== null) &&
      !hasCompleteCoordinates(
        pickupLatitude,
        pickupLongitude
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Koordinat pickup tidak lengkap.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // VALIDASI KOORDINAT TUJUAN
    // ========================================================

    if (
      (destinationLatitude !== null ||
        destinationLongitude !== null) &&
      !hasCompleteCoordinates(
        destinationLatitude,
        destinationLongitude
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Koordinat tujuan tidak lengkap.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // VALIDASI RANGE KOORDINAT PICKUP
    // ========================================================

    if (
      pickupLatitude !== null &&
      pickupLongitude !== null &&
      !isValidCoordinates(
        pickupLatitude,
        pickupLongitude
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Koordinat pickup tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // VALIDASI RANGE KOORDINAT TUJUAN
    // ========================================================

    if (
      destinationLatitude !== null &&
      destinationLongitude !== null &&
      !isValidCoordinates(
        destinationLatitude,
        destinationLongitude
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Koordinat tujuan tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // VARIABLE KOORDINAT
    // ========================================================

    let pickupCoordinates:
      | Coordinates
      | null = null;

    let destinationCoordinates:
      | Coordinates
      | null = null;

    // ========================================================
    // PICKUP
    // ========================================================

    if (
      pickupLatitude !== null &&
      pickupLongitude !== null
    ) {
      // ------------------------------------------------------
      // CUSTOMER MEMILIH PICKUP DARI PETA
      // ------------------------------------------------------

      pickupCoordinates = {
        latitude:
          pickupLatitude,

        longitude:
          pickupLongitude,

        displayName:
          pickup ||
          "Lokasi pickup yang dipilih",
      };
    } else {
      // ------------------------------------------------------
      // CUSTOMER MENGETIK PICKUP MANUAL
      // ------------------------------------------------------

      const result =
        await geocode(pickup);

      if (!result) {
        return NextResponse.json(
          {
            error:
              `Lokasi pickup "${pickup}" tidak ditemukan.`,
          },
          {
            status: 404,
          }
        );
      }

      const latitude =
        Number(result.lat);

      const longitude =
        Number(result.lon);

      if (
        !isValidCoordinates(
          latitude,
          longitude
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Koordinat pickup hasil pencarian tidak valid.",
          },
          {
            status: 502,
          }
        );
      }

      pickupCoordinates = {
        latitude,
        longitude,
        displayName:
          result.display_name,
      };
    }

    // ========================================================
    // DESTINATION
    // ========================================================

    if (
      destinationLatitude !== null &&
      destinationLongitude !== null
    ) {
      // ------------------------------------------------------
      // CUSTOMER MEMILIH TUJUAN DARI PETA
      // ------------------------------------------------------

      destinationCoordinates = {
        latitude:
          destinationLatitude,

        longitude:
          destinationLongitude,

        displayName:
          destination ||
          "Lokasi tujuan yang dipilih",
      };
    } else {
      // ------------------------------------------------------
      // CUSTOMER MEMILIH TUJUAN DARI DROPDOWN / TEXT
      // ------------------------------------------------------

      const result =
        await geocode(
          destination
        );

      if (!result) {
        return NextResponse.json(
          {
            error:
              `Lokasi tujuan "${destination}" tidak ditemukan.`,
          },
          {
            status: 404,
          }
        );
      }

      const latitude =
        Number(result.lat);

      const longitude =
        Number(result.lon);

      if (
        !isValidCoordinates(
          latitude,
          longitude
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Koordinat tujuan hasil pencarian tidak valid.",
          },
          {
            status: 502,
          }
        );
      }

      destinationCoordinates = {
        latitude,
        longitude,
        displayName:
          result.display_name,
      };
    }

    // ========================================================
    // PASTIKAN KOORDINAT TERSEDIA
    // ========================================================

    if (
      !pickupCoordinates ||
      !destinationCoordinates
    ) {
      return NextResponse.json(
        {
          error:
            "Koordinat perjalanan tidak tersedia.",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================================
    // OSRM ROUTING
    // ========================================================

    const coordinates = [
      `${pickupCoordinates.longitude},${pickupCoordinates.latitude}`,

      `${destinationCoordinates.longitude},${destinationCoordinates.latitude}`,
    ].join(";");

    // --------------------------------------------------------
    // OSRM URL
    // --------------------------------------------------------

    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/${coordinates}` +
      `?overview=false&steps=false`;

    // --------------------------------------------------------
    // REQUEST OSRM
    // --------------------------------------------------------

    const routeResponse =
      await fetch(
        osrmUrl,
        {
          headers: {
            "User-Agent":
              "FunTravel/1.0",
            Accept:
              "application/json",
          },

          cache: "no-store",
        }
      );

    // ========================================================
    // CEK RESPONSE OSRM
    // ========================================================

    if (!routeResponse.ok) {
      console.error(
        "OSRM ERROR:",
        routeResponse.status,
        routeResponse.statusText
      );

      return NextResponse.json(
        {
          error:
            "Gagal mendapatkan rute dari OpenStreetMap.",
        },
        {
          status: 502,
        }
      );
    }

    // ========================================================
    // PARSE OSRM
    // ========================================================

    const routeData =
      await routeResponse.json();

    // ========================================================
    // CEK ROUTE
    // ========================================================

    if (
      routeData.code !==
        undefined &&
      routeData.code !==
        "Ok"
    ) {
      return NextResponse.json(
        {
          error:
            "Rute tidak dapat ditemukan untuk lokasi tersebut.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      !routeData.routes ||
      !Array.isArray(
        routeData.routes
      ) ||
      routeData.routes.length === 0 ||
      !routeData.routes[0]
    ) {
      return NextResponse.json(
        {
          error:
            "Rute tidak ditemukan untuk lokasi tersebut.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // ROUTE PERTAMA
    // ========================================================

    const route =
      routeData.routes[0];

    // ========================================================
    // DISTANCE
    // ========================================================

    const distanceMeters =
      Number(
        route.distance || 0
      );

    // ========================================================
    // DURATION
    // ========================================================

    const durationSeconds =
      Number(
        route.duration || 0
      );

    // ========================================================
    // VALIDASI HASIL ROUTE
    // ========================================================

    if (
      !Number.isFinite(
        distanceMeters
      ) ||
      !Number.isFinite(
        durationSeconds
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Data jarak atau waktu dari layanan rute tidak valid.",
        },
        {
          status: 502,
        }
      );
    }

    // ========================================================
    // KM
    // ========================================================

    const distanceKm =
      distanceMeters / 1000;

    // ========================================================
    // FORMAT JARAK
    // ========================================================

    let distanceText: string;

    if (distanceKm < 1) {
      distanceText =
        `${Math.round(
          distanceMeters
        )} m`;
    } else {
      distanceText =
        `${distanceKm.toFixed(
          1
        )} km`;
    }

    // ========================================================
    // MENIT
    // ========================================================

    const durationMinutes =
      Math.round(
        durationSeconds / 60
      );

    // ========================================================
    // FORMAT WAKTU
    // ========================================================

    let durationText: string;

    if (
      durationMinutes < 60
    ) {
      durationText =
        `${durationMinutes} menit`;
    } else {
      const hours =
        Math.floor(
          durationMinutes / 60
        );

      const minutes =
        durationMinutes % 60;

      durationText =
        minutes === 0
          ? `${hours} jam`
          : `${hours} jam ${minutes} menit`;
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      // ======================================================
      // PICKUP
      // ======================================================

      pickup: {
        name:
          pickupCoordinates.displayName,

        latitude:
          pickupCoordinates.latitude,

        longitude:
          pickupCoordinates.longitude,
      },

      // ======================================================
      // DESTINATION
      // ======================================================

      destination: {
        name:
          destinationCoordinates.displayName,

        latitude:
          destinationCoordinates.latitude,

        longitude:
          destinationCoordinates.longitude,
      },

      // ======================================================
      // DISTANCE
      // ======================================================

      distanceMeters,

      distanceKm:
        Number(
          distanceKm.toFixed(2)
        ),

      distance:
        distanceText,

      // ======================================================
      // DURATION
      // ======================================================

      durationSeconds,

      durationMinutes,

      duration:
        durationText,
    });
  } catch (error) {
    // ========================================================
    // GLOBAL ERROR
    // ========================================================

    console.error(
      "MAPS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan saat menghitung rute.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// GET
//
// GET /api/maps?lat=...&lon=...
//
// Digunakan untuk:
// koordinat peta -> nama/alamat lokasi
// ============================================================

export async function GET(
  request: NextRequest
) {
  try {
    // ========================================================
    // QUERY PARAMETER
    // ========================================================

    const {
      searchParams,
    } = new URL(
      request.url
    );

    const latitude =
      toNumber(
        searchParams.get("lat")
      );

    const longitude =
      toNumber(
        searchParams.get("lon")
      );

    // ========================================================
    // VALIDASI
    // ========================================================

    if (
      latitude === null ||
      longitude === null
    ) {
      return NextResponse.json(
        {
          error:
            "Latitude dan longitude wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // VALIDASI RANGE
    // ========================================================

    if (
      !isValidCoordinates(
        latitude,
        longitude
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Latitude atau longitude tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // NOMINATIM REVERSE GEOCODING
    // ========================================================

    const url =
      `https://nominatim.openstreetmap.org/reverse` +
      `?format=jsonv2` +
      `&lat=${latitude}` +
      `&lon=${longitude}` +
      `&zoom=18` +
      `&addressdetails=1`;

    // ========================================================
    // REQUEST
    // ========================================================

    const response =
      await fetch(
        url,
        {
          headers: {
            "User-Agent":
              "FunTravel/1.0",
            Accept:
              "application/json",
          },

          cache: "no-store",
        }
      );

    // ========================================================
    // CEK RESPONSE
    // ========================================================

    if (!response.ok) {
      console.error(
        "NOMINATIM REVERSE ERROR:",
        response.status,
        response.statusText
      );

      return NextResponse.json(
        {
          error:
            "Gagal mendapatkan nama lokasi.",
        },
        {
          status: 502,
        }
      );
    }

    // ========================================================
    // PARSE DATA
    // ========================================================

    const data =
      await response.json();

    // ========================================================
    // RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,

      display_name:
        data.display_name ||
        "Lokasi dipilih di peta",

      latitude,

      longitude,
    });
  } catch (error) {
    // ========================================================
    // ERROR
    // ========================================================

    console.error(
      "REVERSE GEOCODE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan saat mencari nama lokasi.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// GEOCODING
//
// Text/alamat -> latitude + longitude
//
// Contoh:
// "Bandara Lombok"
// "Kuta Mandalika"
// "Tanjung Aan"
// ============================================================

async function geocode(
  query: string
): Promise<GeocodeResult | null> {
  // ========================================================
  // VALIDASI QUERY
  // ========================================================

  if (!query.trim()) {
    return null;
  }

  // ========================================================
  // TAMBAHKAN INDONESIA
  // ========================================================

  const searchQuery =
    `${query}, Indonesia`;

  // ========================================================
  // NOMINATIM SEARCH URL
  // ========================================================

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?format=jsonv2` +
    `&q=${encodeURIComponent(
      searchQuery
    )}` +
    `&limit=1` +
    `&countrycodes=id`;

  // ========================================================
  // REQUEST NOMINATIM
  // ========================================================

  const response =
    await fetch(
      url,
      {
        headers: {
          "User-Agent":
            "FunTravel/1.0",
          Accept:
            "application/json",
        },

        cache: "no-store",
      }
    );

  // ========================================================
  // CEK RESPONSE
  // ========================================================

  if (!response.ok) {
    console.error(
      "NOMINATIM SEARCH ERROR:",
      response.status,
      response.statusText
    );

    return null;
  }

  // ========================================================
  // PARSE DATA
  // ========================================================

  const data =
    (await response.json()) as GeocodeResult[];

  // ========================================================
  // TIDAK DITEMUKAN
  // ========================================================

  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    return null;
  }

  // ========================================================
  // HASIL PERTAMA
  // ========================================================

  return data[0];
}

// ============================================================
// CONVERT VALUE TO NUMBER
// ============================================================

function toNumber(
  value: unknown
): number | null {
  // ========================================================
  // NULL / UNDEFINED / EMPTY
  // ========================================================

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  // ========================================================
  // CONVERT
  // ========================================================

  const number =
    Number(value);

  // ========================================================
  // VALIDATE
  // ========================================================

  if (
    !Number.isFinite(number)
  ) {
    return null;
  }

  return number;
}

// ============================================================
// CEK APAKAH KOORDINAT LENGKAP
// ============================================================

function hasCompleteCoordinates(
  latitude: number | null,
  longitude: number | null
): boolean {
  return (
    latitude !== null &&
    longitude !== null
  );
}

// ============================================================
// VALIDASI RANGE KOORDINAT
//
// Latitude:
// -90 sampai 90
//
// Longitude:
// -180 sampai 180
// ============================================================

function isValidCoordinates(
  latitude: number,
  longitude: number
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}