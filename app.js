/* =========================
   BASE
========================= */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: #f6f7f9;
  color: #111;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
}

.card.muted {
  opacity: 0.55;
}

/* =========================
   HEADER
========================= */
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.logo {
  height: 32px;
}

.logo-small {
  display: none;
}

.user-name {
  font-weight: 600;
  margin-right: 10px;
}

button {
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  background: #111;
  color: #fff;
  font-size: 14px;
}

/* =========================
   LOGIN
========================= */
.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 100;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: #fff;
  padding: 20px;
  border-radius: 14px;
  width: 90%;
  max-width: 320px;
}

.login-card input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

/* =========================
   HEUTE
========================= */
.today-card h2 {
  margin-top: 0;
}

.today-block {
  margin-bottom: 14px;
}

.today-label {
  font-weight: 700;
  margin-bottom: 4px;
  display: inline-block;
}

/* 🎨 NAMEN-FARBEN (Bedeutung!) */
#labelNoah {
  color: #3b82f6; /* Blau */
}

#labelMax {
  color: #22c55e; /* Grün */
}

.today-label.active {
  text-decoration: underline;
}

.bar {
  height: 12px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 4px;
}

.fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.fill.red { background: #ef4444; }
.fill.yellow { background: #f59e0b; }
.fill.green { background: #22c55e; }

.last-entry {
  font-size: 12px;
  opacity: 0.6;
}

/* =========================
   WEEK VIEW
========================= */
.week-day {
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 10px;
}

.week-day.today {
  outline: 2px solid #111;
}

.week-day.clickable {
  cursor: pointer;
}

/* WEEK BAR CONTAINER */
.week-bar {
  background: rgba(0,0,0,0.06);
  border-radius: 6px;
  height: 7px;
  margin: 4px 0;
  overflow: hidden;
}

/* WEEK FILLS */
.week-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}

/* 🎨 FIXE FARBEN */
.week-fill.noah {
  background-color: #3b82f6; /* Blau */
}

.week-fill.max {
  background-color: #22c55e; /* Grün */
}

/* Abstand zwischen Noah / Max */
.week-bar + .week-bar {
  margin-top: 6px;
}

/* =========================
   SAVEBAR
========================= */
.savebar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 10px;
  display: flex;
  gap: 8px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.08);
}

.savebar.hidden {
  display: none;
}

#proteinInput {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

#undoBtn {
  display: none;
  background: #e5e7eb;
  color: #111;
}

/* =========================
   CONFETTI CANVAS
========================= */
#confetti {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 200;
}

/* =========================
   MOBILE
========================= */
@media (max-width: 600px) {
  .logo-horizontal {
    display: none;
  }
  .logo-small {
    display: block;
  }
}
