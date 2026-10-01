// ========== Data layer ==========
const STORAGE_KEY = 'kamando-abby-transactions';
const GOAL = 10000;

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTransactions(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// key format: "YYYY-MM-DD"
let transactions = loadTransactions();
let currentYear, currentMonth; // 0-indexed month

// ========== Helpers ==========
function pad(n) { return n < 10 ? '0' + n : '' + n; }

function dateKey(y, m, d) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function getColorClass(amount) {
  if (amount <= 200) return 'red';
  if (amount <= 349) return 'yellow';
  return 'green';
}

function formatKES(n) {
  return 'KES ' + Number(n).toLocaleString('en-KE');
}

function monthName(m) {
  return ['January','February','March','April','May','June',
          'July','August','September','October','November','December'][m];
}

// ========== Calendar render ==========
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  // Day headers
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'day-header';
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(currentYear, currentMonth, 1);
  const startWeekday = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Previous month padding
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const cell = createDayCell(currentYear, currentMonth - 1, day, true);
    grid.appendChild(cell);
  }

  // Current month
  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = (d === today.getDate() &&
                     currentMonth === today.getMonth() &&
                     currentYear === today.getFullYear());
    const cell = createDayCell(currentYear, currentMonth, d, false, isToday);
    grid.appendChild(cell);
  }

  // Next month padding to fill remaining cells
  const totalCells = startWeekday + daysInMonth;
  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let d = 1; d <= remaining; d++) {
    const cell = createDayCell(currentYear, currentMonth + 1, d, true);
    grid.appendChild(cell);
  }

  document.getElementById('month-label').textContent =
    `${monthName(currentMonth)} ${currentYear}`;

  updateProgress();
}

function createDayCell(y, m, d, otherMonth, isToday = false) {
  // Normalize month/year for edge cases
  let year = y, month = m;
  if (month < 0) { month = 11; year--; }
  if (month > 11) { month = 0; year++; }

  const key = dateKey(year, month, d);
  const tx = transactions[key];

  const cell = document.createElement('div');
  cell.className = 'day-cell' + (otherMonth ? ' other-month' : '') + (isToday ? ' today' : '');
  cell.dataset.key = key;

  const num = document.createElement('div');
  num.className = 'day-number';
  num.textContent = d;
  cell.appendChild(num);

  if (tx && !otherMonth) {
    const flag = document.createElement('div');
    flag.className = 'flag ' + getColorClass(tx.amount);
    flag.textContent = tx.amount;
    cell.appendChild(flag);

    if (tx.note && tx.note.trim()) {
      const note = document.createElement('div');
      note.className = 'note-indicator';
      note.textContent = '📝';
      note.title = tx.note.substring(0, 80) + (tx.note.length > 80 ? '…' : '');
      cell.appendChild(note);
    }
  }

  if (!otherMonth) {
    cell.addEventListener('click', () => openModal(key));
  }

  return cell;
}

// ========== Progress ==========
function updateProgress() {
  let total = 0;
  const prefix = `${currentYear}-${pad(currentMonth + 1)}-`;
  Object.keys(transactions).forEach(k => {
    if (k.startsWith(prefix)) {
      total += Number(transactions[k].amount) || 0;
    }
  });

  const pct = Math.min(100, (total / GOAL) * 100);
  const remaining = Math.max(0, GOAL - total);

  document.getElementById('total-sent').textContent = formatKES(total);
  document.getElementById('remaining').textContent =
    remaining === 0 ? 'Goal reached!' : formatKES(remaining) + ' remaining';

  const fill = document.getElementById('progress-fill');
  const marker = document.getElementById('progress-marker');
  fill.style.width = pct + '%';
  marker.style.left = pct + '%';
  marker.textContent = Math.round(pct) + '%';

  // Keep marker readable near edges
  if (pct < 8) marker.style.transform = 'translate(0, -50%)';
  else if (pct > 92) marker.style.transform = 'translate(-100%, -50%)';
  else marker.style.transform = 'translate(-50%, -50%)';
}

// ========== Modal ==========
let editingKey = null;

function openModal(key) {
  editingKey = key;
  const tx = transactions[key] || { amount: '', note: '' };

  document.getElementById('tx-date').value = key;
  document.getElementById('tx-amount').value = tx.amount || '';
  document.getElementById('tx-note').value = tx.note || '';

  document.getElementById('modal-title').textContent =
    tx.amount ? 'Edit Payment' : 'Record Payment';

  document.getElementById('btn-delete').style.display =
    tx.amount ? 'inline-block' : 'none';

  document.getElementById('modal').classList.add('open');
  document.getElementById('tx-amount').focus();
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  editingKey = null;
}

function saveTransaction() {
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const note = document.getElementById('tx-note').value.trim();

  if (isNaN(amount) || amount < 0) {
    alert('Please enter a valid amount (0 or greater).');
    return;
  }

  transactions[editingKey] = { amount: Math.round(amount), note };
  saveTransactions(transactions);
  closeModal();
  renderCalendar();
}

function deleteTransaction() {
  if (!confirm('Delete this payment record?')) return;
  delete transactions[editingKey];
  saveTransactions(transactions);
  closeModal();
  renderCalendar();
}

// ========== PDF / Print ==========
function buildPrintContent(filterKey = null) {
  // filterKey can be null (whole current month) or a specific "YYYY-MM-DD"
  const area = document.getElementById('print-area');
  let rows = [];
  let total = 0;

  const keys = Object.keys(transactions).sort();

  keys.forEach(k => {
    if (filterKey) {
      if (k !== filterKey) return;
    } else {
      const prefix = `${currentYear}-${pad(currentMonth + 1)}-`;
      if (!k.startsWith(prefix)) return;
    }
    const tx = transactions[k];
    total += Number(tx.amount) || 0;
    rows.push({ date: k, amount: tx.amount, note: tx.note || '—' });
  });

  const title = filterKey
    ? `Payment Record · ${filterKey}`
    : `Monthly Summary · ${monthName(currentMonth)} ${currentYear}`;

  let tableRows = rows.map(r => {
    const color = getColorClass(r.amount);
    const colorHex = color === 'red' ? '#e53935' : color === 'yellow' ? '#fdd835' : '#43a047';
    return `
      <tr>
        <td>${r.date}</td>
        <td>
          <span class="color-dot" style="background:${colorHex}"></span>
          ${formatKES(r.amount)}
        </td>
        <td style="font-size:9.5pt; max-width:280pt; word-break:break-word;">${escapeHtml(r.note)}</td>
      </tr>`;
  }).join('');

  if (rows.length === 0) {
    tableRows = `<tr><td colspan="3" style="text-align:center; color:#666;">No payments recorded for this period.</td></tr>`;
  }

  area.innerHTML = `
    <h1>Kamando Abby · Food Support Log</h1>
    <p><small>Generated ${new Date().toLocaleString('en-KE')}</small></p>

    <div class="summary-box">
      <p><strong>${title}</strong></p>
      <p>Total disbursed: <strong>${formatKES(total)}</strong>
         &nbsp;·&nbsp; Goal: KES 10,000
         &nbsp;·&nbsp; ${Math.round((total / GOAL) * 100)}% of monthly goal</p>
      <p>Transactions: ${rows.length}</p>
    </div>

    <h2>Payment Details</h2>
    <table>
      <thead>
        <tr>
          <th style="width:18%">Date</th>
          <th style="width:22%">Amount</th>
          <th>Acknowledgement / Note</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
      <tfoot>
        <tr>
          <td><strong>Total</strong></td>
          <td><strong>${formatKES(total)}</strong></td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <p style="margin-top:18pt; font-size:9pt; color:#555;">
      Colour key: 
      <span class="color-dot" style="background:#e53935"></span> 0–200 &nbsp;
      <span class="color-dot" style="background:#fdd835"></span> 201–349 &nbsp;
      <span class="color-dot" style="background:#43a047"></span> 350+
    </p>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function exportPDF() {
  buildPrintContent(null); // current month
  window.print();
}

// ========== Init & events ==========
function init() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth();

  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
  });

  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
  });

  document.getElementById('btn-today').addEventListener('click', () => {
    const t = new Date();
    currentYear = t.getFullYear();
    currentMonth = t.getMonth();
    renderCalendar();
  });

  document.getElementById('btn-print').addEventListener('click', exportPDF);

  document.getElementById('btn-save').addEventListener('click', saveTransaction);
  document.getElementById('btn-cancel').addEventListener('click', closeModal);
  document.getElementById('btn-delete').addEventListener('click', deleteTransaction);

  // Close modal on overlay click
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
  });

  // Keyboard: Escape closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  renderCalendar();
}

init();
