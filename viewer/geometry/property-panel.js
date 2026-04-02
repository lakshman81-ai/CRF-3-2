import { state } from '../core/state.js';
import { unitSuffix } from '../utils/formatter.js';

export function initPropertyPanel(container) {
    const panel = document.createElement('div');
    panel.id = 'geo-property-panel';
    panel.className = 'geo-property-panel hidden';

    panel.innerHTML = `
        <div class="prop-panel-header">
            <h3 id="prop-panel-title">Component Properties</h3>
            <button id="prop-panel-close" class="btn-small">×</button>
        </div>
        <div id="prop-panel-content" class="prop-panel-content"></div>
    `;

    container.appendChild(panel);

    panel.querySelector('#prop-panel-close').addEventListener('click', () => {
        panel.classList.add('hidden');
    });
}

export function updatePropertyPanel(data, type = 'element') {
    const panel = document.getElementById('geo-property-panel');
    const content = document.getElementById('prop-panel-content');
    const title = document.getElementById('prop-panel-title');

    if (!panel || !content) return;

    if (!data) {
        panel.classList.add('hidden');
        return;
    }

    panel.classList.remove('hidden');

    const units = state.parsed?.units ?? {};
    let groups = {};

    if (type === 'element') {
        const element = data;
        groups = {
            'Identity & Connectivity': [
                { label: 'Component', value: element.isBend ? 'Bend' : 'Pipe' },
                { label: 'From Node', value: element.from },
                { label: 'To Node', value: element.to }
            ],
            'Geometry': [
                { label: `Length${unitSuffix(units.length)}`, value: element.length?.toFixed(2) },
                { label: `OD${unitSuffix(units.length)}`, value: element.od?.toFixed(2) },
                { label: `Wall Thk${unitSuffix(units.length)}`, value: element.wall?.toFixed(3) },
                { label: `Insul Thk${unitSuffix(units.length)}`, value: element.insul?.toFixed(2) }
            ],
            'Process': [
                { label: `T1${unitSuffix(units.temperature)}`, value: element.T1 },
                { label: `T2${unitSuffix(units.temperature)}`, value: element.T2 },
                { label: `P1${unitSuffix(units.pressure)}`, value: element.P1 },
                { label: `Density${unitSuffix(units.density)}`, value: element.density }
            ],
            'Material': [
                { label: 'Material', value: element.material },
                { label: 'E Cold', value: element.E_cold },
                { label: 'E Hot', value: element.E_hot }
            ]
        };
        title.textContent = `Node ${element.from} → ${element.to}`;
    } else if (type === 'restraint') {
        const restraint = data;
        groups = {
            'Restraint Info': [
                { label: 'Node', value: restraint.node },
                { label: 'Name', value: restraint.name },
                { label: 'Type', value: restraint.type },
                { label: 'Keywords', value: restraint.keywords },
                { label: 'Is Anchor', value: restraint.isAnchor ? 'Yes' : 'No' }
            ]
        };
        title.textContent = `Support at Node ${restraint.node}`;
    }

    let html = '';
    for (const [groupName, props] of Object.entries(groups)) {
        html += `<div class="prop-group">
            <h4>${groupName}</h4>
            <table class="data-table prop-table">
                <tbody>
                    ${props.filter(p => p.value !== undefined && p.value !== null && p.value !== '').map(p => `
                        <tr>
                            <td>${p.label}</td>
                            <td class="mono">${p.value}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
    }

    content.innerHTML = html;
}
