import { state } from './state.js';
import { on } from './event-bus.js';

export function initLogPanel() {
  const container = document.createElement('div');
  container.id = 'log-panel-container';
  container.className = 'log-panel-collapsed';

  container.innerHTML = `
    <div class="log-panel-header">
      <div class="log-panel-summary">
        <span id="log-count-err" class="log-badge err">0 Errors</span>
        <span id="log-count-warn" class="log-badge warn">0 Warnings</span>
        <span id="log-count-info" class="log-badge info">0 Info</span>
      </div>
      <div class="log-panel-controls">
        <button id="log-panel-toggle" class="btn-small">Expand</button>
      </div>
    </div>
    <div class="log-panel-body" style="display:none;">
      <div class="log-panel-filters">
        <input type="text" id="log-search" placeholder="Search logs..." class="log-search-input">
      </div>
      <div class="log-list-container">
        <table class="data-table log-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody id="log-list-body">
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const toggleBtn = container.querySelector('#log-panel-toggle');
  const body = container.querySelector('.log-panel-body');

  toggleBtn.addEventListener('click', () => {
    if (container.classList.contains('log-panel-collapsed')) {
      container.classList.remove('log-panel-collapsed');
      container.classList.add('log-panel-expanded');
      body.style.display = 'flex';
      toggleBtn.textContent = 'Collapse';
    } else {
      container.classList.remove('log-panel-expanded');
      container.classList.add('log-panel-collapsed');
      body.style.display = 'none';
      toggleBtn.textContent = 'Expand';
    }
  });

  on('parse-complete', () => updateLogPanel());
}

export function updateLogPanel() {
  const errBadge = document.getElementById('log-count-err');
  const warnBadge = document.getElementById('log-count-warn');
  const infoBadge = document.getElementById('log-count-info');
  const tbody = document.getElementById('log-list-body');

  if (!errBadge || !warnBadge || !infoBadge || !tbody) return;

  const logs = [...state.errors, ...state.log];

  const errCount = logs.filter(l => l.level === 'ERROR').length;
  const warnCount = logs.filter(l => l.level === 'WARN').length;
  const infoCount = logs.filter(l => l.level === 'INFO' || l.level === 'OK').length;

  errBadge.textContent = `${errCount} Errors`;
  warnBadge.textContent = `${warnCount} Warnings`;
  infoBadge.textContent = `${infoCount} Info`;

  tbody.innerHTML = logs.map(l => {
    const cls = l.level === 'ERROR' ? 'log-row-err' : l.level === 'WARN' ? 'log-row-warn' : 'log-row-info';
    return `<tr class="${cls}">
      <td style="width: 80px;">${l.level}</td>
      <td>${l.msg}</td>
    </tr>`;
  }).join('');
}
