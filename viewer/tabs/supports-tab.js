import { state } from '../core/state.js';
import { emit, on } from '../core/event-bus.js';
import { classifySupport } from '../geometry/symbols.js';

export function renderSupports(container) {
    container.innerHTML = `
        <div class="restraints-tab" style="padding: 1rem;">
            <div class="restraints-toolbar" style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
                <input type="text" id="restraints-search" placeholder="Search supports..." class="search-input" style="padding: 0.5rem; flex: 1;">
                <button id="restraints-clear-search" class="btn-secondary">×</button>
            </div>

            <div class="restraints-filters" style="margin-bottom: 1rem;">
                <label style="font-weight: bold;">Filter Type:
                    <select id="restraint-type-filter" style="margin-left: 0.5rem; padding: 0.25rem;">
                        <option value="ALL">All</option>
                        <option value="GUIDE">Guide</option>
                        <option value="ANCHOR">Anchor</option>
                        <option value="STOP">Stop</option>
                        <option value="SPRING">Spring</option>
                        <option value="RIGID">Rigid</option>
                    </select>
                </label>
            </div>

            <div class="restraints-list-container">
                <table class="data-table" id="restraints-list-table">
                    <thead>
                        <tr>
                            <th>Node</th>
                            <th>Name / Type</th>
                            <th>Class</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="restraints-list-body">
                        <!-- Populated by JS -->
                    </tbody>
                </table>
            </div>
            <div id="restraint-details-panel" class="restraint-details hidden">
                <!-- Details shown on click -->
            </div>
        </div>
    `;

    const searchInput = container.querySelector('#restraints-search');
    const typeFilter = container.querySelector('#restraint-type-filter');
    const clearBtn = container.querySelector('#restraints-clear-search');

    const updateList = () => _populateList(container, searchInput.value, typeFilter.value);

    searchInput.addEventListener('input', updateList);
    typeFilter.addEventListener('change', updateList);
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        updateList();
    });

    on('parse-complete', updateList);
    updateList(); // Initial population
}

function _populateList(container, searchQuery, typeFilter) {
    const tbody = container.querySelector('#restraints-list-body');
    if (!tbody) return;

    const restraints = state.parsed?.restraints ?? [];

    const query = searchQuery.toLowerCase();

    const filtered = restraints.filter(r => {
        const name = (r.name || '').toLowerCase();
        const type = (r.type || '').toLowerCase();
        const keywords = (r.keywords || '').toLowerCase();
        const rClass = classifySupport(r.name || '', r.keywords || r.type || '');

        const matchesSearch = !query ||
            name.includes(query) ||
            type.includes(query) ||
            keywords.includes(query) ||
            String(r.node).includes(query);

        const matchesType = typeFilter === 'ALL' || rClass === typeFilter;

        return matchesSearch && matchesType;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="padding: 1rem;">No restraints found matching criteria.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(r => {
        const rClass = classifySupport(r.name || '', r.keywords || r.type || '');
        const displayName = r.name ? `${r.name} (${r.type})` : r.type;
        return `
            <tr data-node="${r.node}">
                <td>${r.node}</td>
                <td>${displayName}</td>
                <td><span class="badge badge-neutral">${rClass}</span></td>
                <td><button class="btn-secondary btn-navigate" data-node="${r.node}">[→] Navigate</button></td>
            </tr>
        `;
    }).join('');

    // Wire up navigation buttons
    tbody.querySelectorAll('.btn-navigate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const nodeId = parseInt(e.target.dataset.node, 10);
            _navigateToSupport(nodeId);
        });
    });
}

function _navigateToSupport(nodeId) {
    emit('navigate-to-node', nodeId);
    // Switch to geometry tab if not already there
    emit('tab-changed', 'geometry');
    const geoBtn = document.querySelector('.tab-btn[data-tab="geometry"]');
    if (geoBtn) geoBtn.click();
}
