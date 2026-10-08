// ScreenDoc — doorstep phone screen repair
// Prices in INR: [standard, premium]
const PHONES = {
  Apple:   { "iPhone 11": [3500, 5500], "iPhone 12": [5500, 8500], "iPhone 13": [7500, 11500], "iPhone 14": [9500, 14500] },
  Samsung: { "Galaxy A14": [2800, 3800], "Galaxy A54": [4500, 6500], "Galaxy S21": [6500, 11000], "Galaxy S23": [9000, 15000] },
  Xiaomi:  { "Redmi Note 11": [2200, 3200], "Redmi Note 12": [2600, 3600], "Poco X5": [2900, 4000] },
  OnePlus: { "Nord CE 3": [3200, 4500], "OnePlus 10R": [4200, 6000], "OnePlus 11": [7500, 11000] },
  Realme:  { "Realme 9": [2400, 3400], "Realme Narzo 60": [2700, 3800] }
};
const WA_NUMBER = "919000000000"; // replace with the owner's WhatsApp number

const STAGES = ["Booking confirmed", "Technician assigned", "On the way", "Repair in progress", "Completed"];
const DEMO_ORDERS = { SD1001: 1, SD1002: 3, SD1003: 4 }; // value = index of current stage

const $ = (id) => document.getElementById(id);
const brandSel = $("brand"), modelSel = $("model");

/* ---------- Price estimator ---------- */
function fillBrands() {
  brandSel.innerHTML = Object.keys(PHONES).map(b => `<option>${b}</option>`).join("");
  fillModels();
}
function fillModels() {
  modelSel.innerHTML = Object.keys(PHONES[brandSel.value]).map(m => `<option>${m}</option>`).join("");
  updatePrice();
}
function quality() {
  return Number(document.querySelector('input[name="q"]:checked').value);
}
function currentPrice() {
  return PHONES[brandSel.value][modelSel.value][quality()];
}
function updatePrice() {
  $("price").textContent = "₹" + currentPrice().toLocaleString("en-IN");
  $("priceNote").textContent = `${brandSel.value} ${modelSel.value} · ${quality() ? "Premium" : "Standard"} screen · includes doorstep visit`;
}
brandSel.addEventListener("change", fillModels);
modelSel.addEventListener("change", updatePrice);
document.querySelectorAll('input[name="q"]').forEach(r => r.addEventListener("change", updatePrice));

/* ---------- Booking form ---------- */
const dateInput = $("date");
dateInput.min = new Date().toISOString().split("T")[0];
dateInput.value = dateInput.min;

$("bookForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("name").value.trim();
  const phone = $("phone").value.trim();
  const address = $("address").value.trim();
  const date = dateInput.value;
  const err = $("formError");

  if (name.length < 2) return (err.textContent = "Please enter your name.");
  if (!/^[6-9]\d{9}$/.test(phone)) return (err.textContent = "Enter a valid 10-digit mobile number.");
  if (address.length < 8) return (err.textContent = "Please enter your full address.");
  if (!date) return (err.textContent = "Please choose a date.");
  err.textContent = "";

  const id = "SD" + Math.floor(1000 + Math.random() * 9000);
  const msg =
`Hi ScreenDoc! New doorstep repair booking
Order ID: ${id}
Phone: ${brandSel.value} ${modelSel.value} (${quality() ? "Premium" : "Standard"})
Estimate: ₹${currentPrice().toLocaleString("en-IN")}
Name: ${name}
Mobile: ${phone}
Address: ${address}
Date: ${date}, ${$("slot").value}`;

  $("orderId").textContent = id;
  $("waLink").href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  $("bookForm").hidden = true;
  $("success").hidden = false;
  $("success").scrollIntoView({ behavior: "smooth", block: "center" });
  DEMO_ORDERS[id] = 0;
});

/* ---------- Order tracker ---------- */
function track() {
  const id = $("trackInput").value.trim().toUpperCase();
  const list = $("timeline"), err = $("trackError");
  if (!(id in DEMO_ORDERS)) {
    list.hidden = true;
    err.textContent = "Order not found. Check the ID and try again.";
    return;
  }
  err.textContent = "";
  const current = DEMO_ORDERS[id];
  list.innerHTML = STAGES.map((s, i) =>
    `<li class="${i < current || (current === STAGES.length - 1 && i === current) ? "done" : i === current ? "now" : ""}">${s}</li>`
  ).join("");
  list.hidden = false;
}
$("trackBtn").addEventListener("click", track);
$("trackInput").addEventListener("keydown", (e) => { if (e.key === "Enter") track(); });

/* ---------- Open badge (10 AM – 8 PM daily) ---------- */
(function () {
  const h = new Date().getHours();
  $("openBadge").textContent = h >= 10 && h < 20 ? "● Technicians available now" : "Booking open · next visits from 10 AM";
})();

/* ---------- Animated counters ---------- */
document.querySelectorAll("[data-count]").forEach((el) => {
  const target = Number(el.dataset.count);
  const steps = 40;
  let n = 0;
  const t = setInterval(() => {
    n++;
    el.textContent = Math.round((target * n) / steps).toLocaleString("en-IN") + (target > 100 ? "+" : "");
    if (n >= steps) clearInterval(t);
  }, 30);
});

fillBrands();