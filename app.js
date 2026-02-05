:root {
  --bg: #f2f4f8;
  --card: #fff;
  --text: #111;
  --muted: #6b7280;
  --blue: #3b82f6;
  --green: #22c55e;
  --radius: 16px;
}

body {
  margin: 0;
  padding: 16px;
  background: var(--bg);
  font-family: system-ui, -apple-system;
  color: var(--text);
  max-width: 520px;
  margin-inline: auto;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  width: 32px;
  height: 32px;
  background: #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.app-name {
  font-weight: 700;
  font-size: 18px;
}

.user-name {
  font-size: 14px;
  color: var(--muted);
}

.header-right button {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 14px;
}

.card {
  background: var(--card);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
}

.person {
  margin-bottom: 12px;
}

.label {
  font-size: 13px;
  font-weight: 600;
}

.blue { color: var(--blue); }
.green { color: var(--green); }

.bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin-top: 4px;
}

.fill {
  height: 100%;
  width: 0%;
  transition: width 0.4s ease;
}

.fill.blue { background: var(--blue); }
.fill.green { background: var(--green); }

#week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.day {
  background: #f1f3f6;
  border-radius: 10px;
  padding: 6px;
  font-size: 11px;
  text-align: center;
}

.day.today {
  outline: 2px solid #999;
}

input, button {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #ddd;
}

button {
  background: #111;
  color: #fff;
  border: none;
  margin-top: 8px;
}

button:disabled {
  opacity: 0.4;
}

.login-card {
  background: #fff;
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
}

.hint {
  font-size: 13px;
  color: var(--muted);
}
