// ============================================================
// FUNTRAVEL - CUSTOMER USERS
// ============================================================

export type CustomerUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export const USER_STORAGE_KEY =
  "funtravel_users";

// ============================================================
// GET ALL CUSTOMERS
// ============================================================

export function getUsers(): CustomerUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data =
      localStorage.getItem(
        USER_STORAGE_KEY
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
      "Gagal membaca data customer:",
      error
    );

    return [];
  }
}

// ============================================================
// GET CUSTOMER BY EMAIL
// ============================================================

export function getUserByEmail(
  email: string
): CustomerUser | undefined {
  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    return undefined;
  }

  const users = getUsers();

  return users.find(
    (user) =>
      user.email.trim().toLowerCase() ===
      normalizedEmail
  );
}

// ============================================================
// GET CUSTOMER BY ID
// ============================================================

export function getUserById(
  id: string
): CustomerUser | undefined {
  if (!id) {
    return undefined;
  }

  const users = getUsers();

  return users.find(
    (user) => user.id === id
  );
}

// ============================================================
// ADD CUSTOMER
// ============================================================

export function addUser(
  user: CustomerUser
): CustomerUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const users = getUsers();

    // --------------------------------------------------------
    // NORMALISASI EMAIL
    // --------------------------------------------------------

    const normalizedEmail =
      user.email.trim().toLowerCase();

    // --------------------------------------------------------
    // CEK EMAIL DUPLIKAT
    // --------------------------------------------------------

    const existingUser =
      users.find(
        (item) =>
          item.email.trim().toLowerCase() ===
          normalizedEmail
      );

    if (existingUser) {
      return null;
    }

    // --------------------------------------------------------
    // DATA CUSTOMER
    // --------------------------------------------------------

    const newUser: CustomerUser = {
      id: user.id,
      name: user.name.trim(),
      email: normalizedEmail,
      createdAt:
        user.createdAt ||
        new Date().toISOString(),
    };

    // --------------------------------------------------------
    // SIMPAN
    // --------------------------------------------------------

    users.unshift(newUser);

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(users)
    );

    return newUser;
  } catch (error) {
    console.error(
      "Gagal menyimpan customer:",
      error
    );

    return null;
  }
}

// ============================================================
// UPDATE CUSTOMER
// ============================================================

export function updateUser(
  id: string,
  updates: Partial<CustomerUser>
): CustomerUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const users = getUsers();

    const index =
      users.findIndex(
        (user) => user.id === id
      );

    if (index === -1) {
      return null;
    }

    // --------------------------------------------------------
    // CEK EMAIL BARU
    // --------------------------------------------------------

    let updatedEmail =
      users[index].email;

    if (updates.email) {
      updatedEmail =
        updates.email
          .trim()
          .toLowerCase();

      const emailAlreadyUsed =
        users.some(
          (user, userIndex) =>
            userIndex !== index &&
            user.email
              .trim()
              .toLowerCase() ===
              updatedEmail
        );

      if (emailAlreadyUsed) {
        return null;
      }
    }

    // --------------------------------------------------------
    // UPDATE DATA
    // --------------------------------------------------------

    users[index] = {
      ...users[index],
      ...updates,
      name:
        updates.name !== undefined
          ? updates.name.trim()
          : users[index].name,
      email: updatedEmail,
    };

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(users)
    );

    return users[index];
  } catch (error) {
    console.error(
      "Gagal mengubah data customer:",
      error
    );

    return null;
  }
}

// ============================================================
// DELETE CUSTOMER
// ============================================================

export function deleteUser(
  id: string
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const users = getUsers();

    const updatedUsers =
      users.filter(
        (user) => user.id !== id
      );

    // Tidak ada data yang berubah
    if (
      updatedUsers.length ===
      users.length
    ) {
      return false;
    }

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(updatedUsers)
    );

    return true;
  } catch (error) {
    console.error(
      "Gagal menghapus customer:",
      error
    );

    return false;
  }
}

// ============================================================
// JUMLAH CUSTOMER
// ============================================================

export function getUserCount(): number {
  return getUsers().length;
}

// ============================================================
// CLEAR SEMUA CUSTOMER
// ============================================================
//
// Gunakan hanya untuk development/testing.
// Jangan dipanggil dari halaman customer.
//

export function clearUsers(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    USER_STORAGE_KEY
  );
}