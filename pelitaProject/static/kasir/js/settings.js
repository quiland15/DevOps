function getCSRFToken() {
  const name = "csrftoken";
  const cookie = document.cookie
    .split("; ")
    .find(row => row.startsWith(name + "="));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
}    

// Sample initial users data
    let users = [];

async function fetchUsers() {
  try {
    const res = await fetch("/kasir/api/users/");
    if (!res.ok) throw new Error("Gagal memuat pengguna");
    users = await res.json();
    renderUsers();
  } catch (err) {
    alert("Gagal mengambil data pengguna.");
    console.error(err);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  fetchUsers();
});


    const userTableBody = document.getElementById("userTableBody");
    const userForm = document.getElementById("userForm");
    const userIdInput = document.getElementById("userId");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const roleInput = document.getElementById("role");
    const passwordInput = document.getElementById("password");
    const cancelEditBtn = document.getElementById("cancelEditBtn");

    // Error elements
    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const roleError = document.getElementById("roleError");
    const passwordError = document.getElementById("passwordError");

    // Render users in table
    function renderUsers() {
      userTableBody.innerHTML = "";
      users.forEach((user) => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-gray-50";

        tr.innerHTML = `
          <td class="px-4 py-2 border-b border-gray-300">${user.name}</td>
          <td class="px-4 py-2 border-b border-gray-300">${user.email}</td>
          <td class="px-4 py-2 border-b border-gray-300 capitalize">${user.role}</td>
          <td class="px-4 py-2 border-b border-gray-300 text-center space-x-2">
            <button class="editBtn text-blue-600 hover:underline" data-id="${user.id}" aria-label="Edit user ${user.name}">Edit</button>
            <button class="deleteBtn text-red-600 hover:underline" data-id="${user.id}" aria-label="Delete user ${user.name}">Hapus</button>
          </td>
        `;
        userTableBody.appendChild(tr);
      });

      // Attach event listeners for edit and delete buttons
      document.querySelectorAll(".editBtn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.getAttribute("data-id"));
          startEditUser(id);
        });
      });
      document.querySelectorAll(".deleteBtn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.getAttribute("data-id"));
          deleteUser(id);
        });
      });
    }

    // Reset form and errors
    function resetForm() {
      userIdInput.value = "";
      nameInput.value = "";
      emailInput.value = "";
      roleInput.value = "";
      passwordInput.value = "";
      passwordInput.required = true;
      passwordInput.placeholder = "Minimal 6 karakter";
      passwordInput.nextElementSibling.classList.remove("hidden"); // show password help text
      cancelEditBtn.classList.add("hidden");
      clearErrors();
    }

    // Clear error messages
    function clearErrors() {
      nameError.classList.add("hidden");
      emailError.classList.add("hidden");
      roleError.classList.add("hidden");
      passwordError.classList.add("hidden");
    }

    // Validate form fields
    function validateForm() {
      let valid = true;
      clearErrors();

      if (!nameInput.value.trim()) {
        nameError.classList.remove("hidden");
        valid = false;
      }

      if (!emailInput.value.trim() || !/^\S+@\S+\.\S+$/.test(emailInput.value.trim())) {
        emailError.classList.remove("hidden");
        valid = false;
      }

      if (!roleInput.value) {
        roleError.classList.remove("hidden");
        valid = false;
      }

      // Password required only if adding new user or changing password
      if (!userIdInput.value) {
        if (!passwordInput.value || passwordInput.value.length < 6) {
          passwordError.classList.remove("hidden");
          valid = false;
        }
      } else {
        // Editing user: password optional but if filled must be >=6 chars
        if (passwordInput.value && passwordInput.value.length < 6) {
          passwordError.classList.remove("hidden");
          valid = false;
        }
      }

      return valid;
    }

    // Add new user
async function addUser(user) {
  try {
    const payload = {
      ...user,
      password: passwordInput.value
    };
    const res = await fetch("/kasir/api/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.status === "success") {
      fetchUsers(); // refresh
    } else {
      alert("Gagal menambah pengguna: " + data.message);
    }
  } catch (err) {
    alert("Terjadi kesalahan saat menambah pengguna.");
    console.error(err);
  }
}

    // Update existing user
async function updateUser(id, updatedUser) {
  try {
    const payload = {
      id,
      ...updatedUser,
      password: passwordInput.value
    };
    const res = await fetch("/kasir/api/users/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.status === "success") {
      fetchUsers();
    } else {
      alert("Gagal mengupdate pengguna: " + data.message);
    }
  } catch (err) {
    alert("Terjadi kesalahan saat update pengguna.");
    console.error(err);
  }
}

    // Delete user with confirmation
async function deleteUser(id) {
  if (!confirm("Hapus pengguna ini?")) return;

  try {
    const res = await fetch("/kasir/api/users/", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()
      },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    if (data.status === "success") {
      fetchUsers();
      if (userIdInput.value == id) {
        resetForm();
      }
    } else {
      alert("Gagal menghapus pengguna: " + data.message);
    }
  } catch (err) {
    alert("Terjadi kesalahan saat menghapus pengguna.");
    console.error(err);
  }
}

    // Start editing user
    function startEditUser(id) {
      const user = users.find(u => u.id === id);
      if (!user) return;
      userIdInput.value = user.id;
      nameInput.value = user.name;
      emailInput.value = user.email;
      roleInput.value = user.role;
      passwordInput.value = "";
      passwordInput.required = false;
      passwordInput.placeholder = "Kosongkan jika tidak ingin mengubah password";
      passwordInput.nextElementSibling.classList.add("hidden"); // hide password help text
      cancelEditBtn.classList.remove("hidden");
      clearErrors();
      nameInput.focus();
    }

    // Cancel editing
    cancelEditBtn.addEventListener("click", () => {
      resetForm();
    });

    // Handle form submit
    userForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      const id = userIdInput.value ? parseInt(userIdInput.value) : null;
      const userData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        role: roleInput.value,
      };

      // Password is not stored here but in real app would be hashed and saved
      // We just simulate that password is required on create and optional on update

      if (id) {
        updateUser(id, userData);
      } else {
        addUser(userData);
      }
      resetForm();
    });

    // Initial render
    renderUsers();
