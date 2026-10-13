/* =====================================================
   DriveEasy - Vehicle Rental Management System
   Plain JavaScript + localStorage (demo project only)
   ===================================================== */

/* ---------- Settings ---------- */

// Paste a public .mp4 video link here to show a video in "Explore Our Vehicles".
// If it is empty or fails to load, a vehicle photo is shown instead.
const VIDEO_URL = "";
const VIDEO_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=70";

// Shown when a vehicle image cannot be loaded (an inline SVG, so no extra file is needed)
const PLACEHOLDER_IMAGE = "data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#1e293b'/>" +
  "<text x='50%' y='50%' fill='#94a3b8' font-size='28' font-family='Arial' text-anchor='middle'>Image not available</text></svg>"
);

// localStorage keys
const KEY_VEHICLES = "driveeasy_vehicles";
const KEY_BOOKINGS = "driveeasy_bookings";
const KEY_CUSTOMERS = "driveeasy_customers";

/* ---------- Classes (like Java classes) ---------- */

class Vehicle {
  constructor(id, registration, name, brand, type, model, pricePerDay, image) {
    this.id = id;
    this.registration = registration;
    this.name = name;
    this.brand = brand;
    this.type = type;           // "Car", "Bike" or "Truck"
    this.model = model;
    this.pricePerDay = pricePerDay;
    this.image = image;
    this.available = true;      // false while the vehicle is rented
  }
}

class Customer {
  constructor(id, name, phone, email, licenceNumber) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.licenceNumber = licenceNumber;
  }
}

class Booking {
  constructor(id, customerId, customerName, vehicleId, vehicleName, registration, startDate, days, pricePerDay) {
    this.id = id;
    this.customerId = customerId;
    this.customerName = customerName;
    this.vehicleId = vehicleId;
    this.vehicleName = vehicleName;
    this.registration = registration;
    this.startDate = startDate;
    this.days = days;
    this.pricePerDay = pricePerDay;
    this.totalAmount = calculateTotalRent(pricePerDay, days);
    this.status = "Active";     // "Active" or "Returned"
    this.returnedOn = null;
  }
}

/* ---------- Sample data (fictional) ---------- */

function createSampleVehicles() {
  const img = (id) => "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=700&q=70";
  return [
    new Vehicle("V001", "KA09AB1234", "Creta",           "Hyundai",        "Car",   "2023 SX", 2000, img("1568605117036-5fe5e7bab0b7")),
    new Vehicle("V002", "KA09AB4321", "Swift",           "Maruti Suzuki",  "Car",   "2022 VXi", 1200, img("1503376780353-7e6692767b70")),
    new Vehicle("V003", "KA09AB7788", "Seltos",          "Kia",            "Car",   "2023 HTX", 2200, img("1552519507-da3b142c6e3d")),
    new Vehicle("V004", "KA09CD5678", "Classic 350",     "Royal Enfield",  "Bike",  "2023",     700,  img("1558981806-ec527fa84c39")),
    new Vehicle("V005", "KA09CD1122", "Duke 200",        "KTM",            "Bike",  "2022",     800,  img("1609630875171-b1321377ee65")),
    new Vehicle("V006", "KA09CD3344", "Activa 6G",       "Honda",          "Bike",  "2023",     400,  img("1558618666-fcd25c85cd64")),
    new Vehicle("V007", "KA09EF9012", "Ace",             "Tata",           "Truck", "2022 Gold", 3000, img("1601584115197-04ecc0da31d7")),
    new Vehicle("V008", "KA09EF3456", "Bolero Pik-Up",   "Mahindra",       "Truck", "2021",     3500, img("1519003722824-194d4455a60c")),
    new Vehicle("V009", "KA09EF7890", "Eicher Pro 2049", "Eicher",         "Truck", "2022",     4500, img("1591768793355-74d04bb6608f"))
  ];
}

/* ---------- App data (loaded from localStorage) ---------- */

let vehicles = [];
let bookings = [];
let customers = [];
let selectedVehicleType = "All";
let selectedBookingStatus = "All";

// Read a list from localStorage. If nothing is saved (or it is broken), return the default.
function loadFromStorage(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(KEY_VEHICLES, JSON.stringify(vehicles));
    localStorage.setItem(KEY_BOOKINGS, JSON.stringify(bookings));
    localStorage.setItem(KEY_CUSTOMERS, JSON.stringify(customers));
  } catch (error) {
    showToast("Could not save data in this browser.");
  }
}

function loadAllData() {
  vehicles = loadFromStorage(KEY_VEHICLES, null) || createSampleVehicles();
  bookings = loadFromStorage(KEY_BOOKINGS, []);
  customers = loadFromStorage(KEY_CUSTOMERS, []);
}

/* ---------- Helper functions ---------- */

// The main rental formula: Total Rent = Price Per Day x Number of Days
function calculateTotalRent(pricePerDay, days) {
  return pricePerDay * days;
}

function formatMoney(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Today as YYYY-MM-DD in local time (used for the date input)
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// Make user-typed text safe before putting it in HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Create the next ID such as C001 or B002 from a list of records
function generateNextId(prefix, list) {
  const highest = list.reduce((max, item) => {
    const number = parseInt(item.id.slice(prefix.length), 10);
    return number > max ? number : max;
  }, 0);
  return prefix + String(highest + 1).padStart(3, "0");
}

function findVehicleById(id) {
  return vehicles.find((vehicle) => vehicle.id === id);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 3000);
}

/* ---------- Rendering: vehicles ---------- */

function renderVehicles() {
  const grid = document.getElementById("vehicleGrid");
  const list = vehicles.filter((v) => selectedVehicleType === "All" || v.type === selectedVehicleType);

  grid.innerHTML = list.map((v) => `
    <article class="vehicle-card">
      <div class="card-image">
        <img src="${v.image}" alt="${escapeHtml(v.brand + " " + v.name)}" loading="lazy" data-fallback="true">
        <span class="type-badge">${v.type}</span>
        <span class="status-badge ${v.available ? "available" : "rented"}">${v.available ? "Available" : "Rented"}</span>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(v.brand + " " + v.name)}</h3>
        <p class="card-brand">Model: ${escapeHtml(v.model)}</p>
        <ul class="card-details">
          <li><span>Vehicle ID</span><span>${v.id}</span></li>
          <li><span>Registration</span><span>${v.registration}</span></li>
          <li><span>Type</span><span>${v.type}</span></li>
        </ul>
        <div class="card-footer">
          <span class="price">${formatMoney(v.pricePerDay)}<small> / day</small></span>
          <button class="btn btn-primary" data-rent-id="${v.id}" ${v.available ? "" : "disabled"}>
            ${v.available ? "Rent Now" : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  `).join("") || "<p class='empty-message'>No vehicles found.</p>";

  // If an image fails to load, show the placeholder instead
  grid.querySelectorAll("img[data-fallback]").forEach((img) => {
    img.addEventListener("error", () => { img.src = PLACEHOLDER_IMAGE; }, { once: true });
  });
}

function renderStats() {
  const activeCount = bookings.filter((b) => b.status === "Active").length;
  document.getElementById("statTotal").textContent = vehicles.length;
  document.getElementById("statAvailable").textContent = vehicles.filter((v) => v.available).length;
  document.getElementById("statActive").textContent = activeCount;
}

/* ---------- Rendering: rent form ---------- */

// Fill the drop-down with vehicles that are available right now
function fillVehicleDropdown(selectedId) {
  const select = document.getElementById("vehicleSelect");
  const availableVehicles = vehicles.filter((v) => v.available);

  select.innerHTML = "<option value=''>-- Choose a vehicle --</option>" + availableVehicles.map((v) =>
    `<option value="${v.id}">${escapeHtml(v.brand + " " + v.name)} (${v.type}) - ${formatMoney(v.pricePerDay)}/day</option>`
  ).join("");

  select.value = availableVehicles.some((v) => v.id === selectedId) ? selectedId : "";
  updateFormSummary();
}

// Update registration, price and total whenever the vehicle or days change
function updateFormSummary() {
  const vehicle = findVehicleById(document.getElementById("vehicleSelect").value);
  const days = parseInt(document.getElementById("rentalDays").value, 10);

  document.getElementById("registrationNumber").value = vehicle ? vehicle.registration : "";
  document.getElementById("pricePerDay").value = vehicle ? formatMoney(vehicle.pricePerDay) : "";

  const validDays = Number.isInteger(days) && days > 0;
  const total = vehicle && validDays ? calculateTotalRent(vehicle.pricePerDay, days) : 0;
  document.getElementById("totalAmount").textContent = formatMoney(total);
}

// Show the ID the next new customer would get (a returning customer keeps their old ID)
function previewCustomerId() {
  const phone = document.getElementById("customerPhone").value.trim();
  const email = document.getElementById("customerEmail").value.trim().toLowerCase();
  const existing = customers.find((c) => c.phone === phone && c.email.toLowerCase() === email);
  document.getElementById("customerId").value = existing ? existing.id : generateNextId("C", customers);
}

/* ---------- Validation ---------- */

function setError(inputId, errorId, message) {
  document.getElementById(errorId).textContent = message;
  document.getElementById(inputId).classList.toggle("invalid", message !== "");
  return message === "";
}

// Check every field. Returns true only if all fields are valid.
function validateForm() {
  const vehicleId = document.getElementById("vehicleSelect").value;
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const licence = document.getElementById("licenceNumber").value.trim();
  const startDate = document.getElementById("startDate").value;
  const days = Number(document.getElementById("rentalDays").value);

  const results = [
    setError("vehicleSelect", "errVehicle", vehicleId ? "" : "Please select a vehicle."),
    setError("customerName", "errName", /^[A-Za-z][A-Za-z .'-]{1,49}$/.test(name) ? "" : "Enter a valid name (letters only)."),
    // Indian mobile numbers: 10 digits starting with 6, 7, 8 or 9
    setError("customerPhone", "errPhone", /^[6-9]\d{9}$/.test(phone) ? "" : "Enter a valid 10-digit phone number."),
    setError("customerEmail", "errEmail", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter a valid email address."),
    // Format check only - we do NOT verify the licence
    setError("licenceNumber", "errLicence", /^[A-Za-z0-9-]{8,20}$/.test(licence) ? "" : "Enter 8-20 letters/digits."),
    setError("startDate", "errDate", startDate && startDate >= getTodayString() ? "" : "Choose today or a future date."),
    setError("rentalDays", "errDays", Number.isInteger(days) && days >= 1 && days <= 90 ? "" : "Days must be between 1 and 90.")
  ];
  return results.every(Boolean);
}

/* ---------- Booking logic ---------- */

function confirmBooking(event) {
  event.preventDefault();
  if (!validateForm()) {
    showToast("Please fix the highlighted fields.");
    return;
  }

  const vehicle = findVehicleById(document.getElementById("vehicleSelect").value);

  // Prevent double booking: check again right before saving
  if (!vehicle || !vehicle.available) {
    showToast("Sorry, this vehicle is already rented.");
    fillVehicleDropdown("");
    renderVehicles();
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const email = document.getElementById("customerEmail").value.trim();
  const licence = document.getElementById("licenceNumber").value.trim().toUpperCase();
  const days = parseInt(document.getElementById("rentalDays").value, 10);

  // Reuse the customer record if the same phone + email booked before; otherwise create one
  let customer = customers.find((c) => c.phone === phone && c.email.toLowerCase() === email.toLowerCase());
  if (customer) {
    customer.name = name;
    customer.licenceNumber = licence;
  } else {
    customer = new Customer(generateNextId("C", customers), name, phone, email, licence);
    customers.push(customer);
  }

  const booking = new Booking(
    generateNextId("B", bookings), customer.id, customer.name,
    vehicle.id, vehicle.brand + " " + vehicle.name, vehicle.registration,
    document.getElementById("startDate").value, days, vehicle.pricePerDay
  );
  bookings.unshift(booking);   // newest booking first
  vehicle.available = false;   // vehicle is now rented

  saveToStorage();
  refreshPage();
  showConfirmation(booking);
  resetForm();
}

function returnVehicle(bookingId) {
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking || booking.status !== "Active") return;

  booking.status = "Returned";
  booking.returnedOn = getTodayString();

  const vehicle = findVehicleById(booking.vehicleId);
  if (vehicle) vehicle.available = true;   // vehicle can be rented again

  saveToStorage();
  refreshPage();
  showToast(booking.vehicleName + " returned. It is available again.");
}

/* ---------- Rendering: bookings and confirmation ---------- */

function renderBookings() {
  const container = document.getElementById("bookingList");
  const list = bookings.filter((b) => selectedBookingStatus === "All" || b.status === selectedBookingStatus);

  if (list.length === 0) {
    container.innerHTML = "<p class='empty-message'>No bookings to show yet. Rent a vehicle to get started!</p>";
    return;
  }

  container.innerHTML = list.map((b) => {
    const isActive = b.status === "Active";
    return `
      <article class="booking-card ${isActive ? "" : "returned"}">
        <div>
          <h3>${escapeHtml(b.vehicleName)} <small>(${b.registration})</small></h3>
          <div class="booking-meta">
            <span><b>Booking ID:</b> ${b.id}</span>
            <span><b>Customer:</b> ${escapeHtml(b.customerName)} (${b.customerId})</span>
            <span><b>Start date:</b> ${formatDate(b.startDate)}</span>
            <span><b>Duration:</b> ${b.days} day${b.days > 1 ? "s" : ""}</span>
            <span><b>Rate:</b> ${formatMoney(b.pricePerDay)} / day</span>
            ${b.returnedOn ? `<span><b>Returned on:</b> ${formatDate(b.returnedOn)}</span>` : ""}
          </div>
        </div>
        <div class="booking-side">
          <span class="booking-status ${isActive ? "active" : "returned"}">${b.status}</span>
          <span class="booking-total">${formatMoney(b.totalAmount)}</span>
          ${isActive ? `<button class="btn btn-success" data-return-id="${b.id}">Return Vehicle</button>` : ""}
        </div>
      </article>`;
  }).join("");
}

function showConfirmation(booking) {
  document.getElementById("confirmDetails").innerHTML = `
    <p><span>Booking ID</span><strong>${booking.id}</strong></p>
    <p><span>Customer</span><strong>${escapeHtml(booking.customerName)} (${booking.customerId})</strong></p>
    <p><span>Vehicle</span><strong>${escapeHtml(booking.vehicleName)}</strong></p>
    <p><span>Registration</span><strong>${booking.registration}</strong></p>
    <p><span>Start date</span><strong>${formatDate(booking.startDate)}</strong></p>
    <p><span>Duration</span><strong>${booking.days} day${booking.days > 1 ? "s" : ""}</strong></p>
    <p><span>Total amount</span><strong>${formatMoney(booking.totalAmount)}</strong></p>
    <p><span>Status</span><strong>${booking.status}</strong></p>`;
  document.getElementById("confirmModal").classList.remove("hidden");
}

function closeConfirmation() {
  document.getElementById("confirmModal").classList.add("hidden");
}

/* ---------- Page refresh and form reset ---------- */

function resetForm() {
  document.getElementById("rentForm").reset();
  document.getElementById("rentalDays").value = 1;
  document.getElementById("startDate").value = getTodayString();
  document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
  document.querySelectorAll(".error").forEach((el) => { el.textContent = ""; });
  fillVehicleDropdown("");
  previewCustomerId();
}

// Redraw everything that depends on the data
function refreshPage() {
  const currentChoice = document.getElementById("vehicleSelect").value;
  renderVehicles();
  renderStats();
  renderBookings();
  fillVehicleDropdown(currentChoice);
  previewCustomerId();
}

/* ---------- Video section ---------- */

function setupVideo() {
  const video = document.getElementById("exploreVideo");
  const fallback = document.getElementById("videoFallback");
  fallback.src = VIDEO_FALLBACK_IMAGE;

  function showFallback() {
    video.classList.add("hidden");
    fallback.classList.remove("hidden");
  }

  if (!VIDEO_URL) { showFallback(); return; }
  fallback.classList.add("hidden");
  video.poster = VIDEO_FALLBACK_IMAGE;
  video.src = VIDEO_URL;
  video.addEventListener("error", showFallback);
}

/* ---------- Event listeners ---------- */

function setupEvents() {
  // Mobile menu
  const navLinks = document.getElementById("navLinks");
  document.getElementById("menuToggle").addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", () => navLinks.classList.remove("open"));

  // Vehicle type filter buttons
  document.getElementById("vehicleFilters").addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button) return;
    selectedVehicleType = button.dataset.type;
    document.querySelectorAll("#vehicleFilters .filter-btn").forEach((b) => b.classList.toggle("active", b === button));
    renderVehicles();
  });

  // Booking status filter buttons
  document.getElementById("bookingFilters").addEventListener("click", (event) => {
    const button = event.target.closest(".filter-btn");
    if (!button) return;
    selectedBookingStatus = button.dataset.status;
    document.querySelectorAll("#bookingFilters .filter-btn").forEach((b) => b.classList.toggle("active", b === button));
    renderBookings();
  });

  // "Rent Now" on a vehicle card: select it in the form and scroll there
  document.getElementById("vehicleGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-rent-id]");
    if (!button) return;
    fillVehicleDropdown(button.dataset.rentId);
    document.getElementById("rent").scrollIntoView({ behavior: "smooth" });
  });

  // "Return Vehicle" on a booking
  document.getElementById("bookingList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-return-id]");
    if (button) returnVehicle(button.dataset.returnId);
  });

  // Form
  document.getElementById("rentForm").addEventListener("submit", confirmBooking);
  document.getElementById("clearFormBtn").addEventListener("click", resetForm);
  document.getElementById("vehicleSelect").addEventListener("change", updateFormSummary);
  document.getElementById("rentalDays").addEventListener("input", updateFormSummary);
  document.getElementById("customerPhone").addEventListener("input", previewCustomerId);
  document.getElementById("customerEmail").addEventListener("input", previewCustomerId);

  // Modal
  document.getElementById("closeModalBtn").addEventListener("click", closeConfirmation);
  document.getElementById("viewBookingsBtn").addEventListener("click", closeConfirmation);
  document.getElementById("confirmModal").addEventListener("click", (event) => {
    if (event.target.id === "confirmModal") closeConfirmation();
  });

  // Reset demo data
  document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (!confirm("This will delete all bookings and customers and restore the sample vehicles. Continue?")) return;
    vehicles = createSampleVehicles();
    bookings = [];
    customers = [];
    saveToStorage();
    refreshPage();
    showToast("Demo data has been reset.");
  });
}

/* ---------- Start the app ---------- */

loadAllData();
setupEvents();
setupVideo();
document.getElementById("startDate").min = getTodayString();
resetForm();
refreshPage();
