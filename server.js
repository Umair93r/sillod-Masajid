// server.js
const express = require("express");
const path = require("path");

const app = express();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "masjid123";

function adminAuth(req, res, next) {
  const pwd = req.headers["x-admin-password"];
  if (pwd !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}




const PORT = process.env.PORT || 3000;

// --- Simple username/password for admin (Basic Auth) ---
const ADMIN_USER = "admin";
const ADMIN_PASS = "masjid123";

function basicAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [type, value] = authHeader.split(" ");

  if (type !== "Basic" || !value) {
    res.set("WWW-Authenticate", 'Basic realm="Al Masjid Admin"');
    return res.status(401).send("Authentication required");
  }

  const [user, pass] = Buffer.from(value, "base64").toString().split(":");

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return next();
  }

  res.set("WWW-Authenticate", 'Basic realm="Al Masjid Admin"');
  return res.status(401).send("Invalid credentials");
}



// ---- In-memory data ----
let todayData = {
  dateReadable: "09 December 2025",
  hijri: "27 Jumada al-Akhirah 1447H",
  city: "Sillod, Maharashtra",
  prayers: [
    { name: "Fajr", adhan: "05:15 AM", iqamah: "05:30 AM" },
    { name: "Sunrise", adhan: "-", iqamah: "06:50 AM" },
    { name: "Dhuhr", adhan: "01:15 PM", iqamah: "01:30 PM" },
    { name: "Asr", adhan: "04:30 PM", iqamah: "04:45 PM" },
    { name: "Maghrib", adhan: "Sunset", iqamah: "06:05 PM" },
    { name: "Isha", adhan: "07:45 PM", iqamah: "08:00 PM" },
  ],
};

let weekTimetable = [
  { day: "Tuesday", fajr: "05:30", dhuhr: "13:30", asr: "16:45", maghrib: "18:05", isha: "20:00", jumuah: "—" },
  { day: "Wednesday", fajr: "05:31", dhuhr: "13:30", asr: "16:45", maghrib: "18:05", isha: "20:00", jumuah: "—" },
  { day: "Thursday", fajr: "05:32", dhuhr: "13:30", asr: "16:46", maghrib: "18:06", isha: "20:01", jumuah: "—" },
  { day: "Friday", fajr: "05:32", dhuhr: "13:30", asr: "16:46", maghrib: "18:06", isha: "20:01", jumuah: "13:45" },
  { day: "Saturday", fajr: "05:33", dhuhr: "13:31", asr: "16:47", maghrib: "18:07", isha: "20:02", jumuah: "—" },
  { day: "Sunday", fajr: "05:34", dhuhr: "13:31", asr: "16:47", maghrib: "18:07", isha: "20:02", jumuah: "—" },
  { day: "Monday", fajr: "05:35", dhuhr: "13:31", asr: "16:48", maghrib: "18:08", isha: "20:03", jumuah: "—" },
];

let announcements = [
  { title: "Friday Khutbah Timing", text: "Khutbah starts at 1:45 PM, Salah at 2:00 PM" },
  { title: "Weekly Dars", text: "Every Saturday after Maghrib – Hadith & Tafseer class" },
  { title: "Madarsa Timings", text: "Mon–Thu: 5:00 PM – 7:00 PM (Boys & Girls)" },
];

let masjidInfo = {
  name: "Al Masjid, Sillod",
  addressLine: "Near [Landmark], Sillod, Maharashtra, India – 431112",
  phone: "+91-98765-43210",
  email: "info@almasjid-sillod.in",
};

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Public APIs
app.get("/api/timings/today", (req, res) => {
  res.json(todayData);
});

app.get("/api/timings/week", (req, res) => {
  res.json(weekTimetable);
});

app.get("/api/announcements", (req, res) => {
  res.json(announcements);
});

app.get("/api/masjid", (req, res) => {
  res.json(masjidInfo);
});

// Admin API
app.post("/api/admin/timings", adminAuth, (req, res) => {
  const { dateReadable, hijri, city, prayers } = req.body;
  console.log("Received admin update:", req.body);

  if (!Array.isArray(prayers)) {
    return res.status(400).json({ error: "prayers must be an array" });
  }

  todayData = {
    ...todayData,
    dateReadable: dateReadable || todayData.dateReadable,
    hijri: hijri || todayData.hijri,
    city: city || todayData.city,
    prayers,
  };

  return res.json({ ok: true, todayData });
});

// Route for /admin
app.get("/admin", basicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.listen(PORT, () => {
  console.log(`Al Masjid Sillod app running on http://localhost:${PORT}`);
});
