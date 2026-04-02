import { state, updateViewer3DSettings } from '../core/state.js';

export function initViewerSettingsDrawer(container) {
    const drawer = document.createElement('div');
    drawer.id = 'viewer-settings-drawer';
    drawer.className = 'settings-drawer-closed';

    drawer.innerHTML = `
        <div class="settings-drawer-header">
            <h3>Viewer Settings</h3>
            <button id="close-settings-btn" class="btn-small">×</button>
        </div>
        <div class="settings-drawer-content">
            ${_buildCameraSection()}
            ${_buildAxisSection()}
            ${_buildLabelsSection()}
            ${_buildAppearanceSection()}
        </div>
    `;

    container.appendChild(drawer);

    drawer.querySelector('#close-settings-btn').addEventListener('click', () => {
        closeSettingsDrawer();
    });

    _wireSettingsInputs(drawer);
}

export function openSettingsDrawer() {
    const drawer = document.getElementById('viewer-settings-drawer');
    if (drawer) {
        drawer.classList.remove('settings-drawer-closed');
        drawer.classList.add('settings-drawer-open');
    }
}

export function closeSettingsDrawer() {
    const drawer = document.getElementById('viewer-settings-drawer');
    if (drawer) {
        drawer.classList.remove('settings-drawer-open');
        drawer.classList.add('settings-drawer-closed');
    }
}

function _buildCameraSection() {
    const s = state.sticky.viewer3d;
    return `
        <div class="settings-section">
            <h4>Camera</h4>
            <label class="setting-row">
                <span>Projection</span>
                <select data-key="projection">
                    <option value="perspective" ${s.projection === 'perspective' ? 'selected' : ''}>Perspective</option>
                    <option value="orthographic" ${s.projection === 'orthographic' ? 'selected' : ''}>Orthographic</option>
                </select>
            </label>
            <label class="setting-row">
                <span>FOV</span>
                <input type="number" data-key="fov" value="${s.fov}" min="10" max="170">
            </label>
            <label class="setting-row">
                <span>Auto Near/Far</span>
                <input type="checkbox" data-key="autoNearFar" ${s.autoNearFar ? 'checked' : ''}>
            </label>
        </div>
    `;
}

function _buildAxisSection() {
    const s = state.sticky.viewer3d;
    return `
        <div class="settings-section">
            <h4>Axis & Coordinates</h4>
            <label class="setting-row">
                <span>Up Axis</span>
                <select data-key="axisConvention">
                    <option value="Z-up" ${s.axisConvention === 'Z-up' ? 'selected' : ''}>Z-up (CAESAR)</option>
                    <option value="Y-up" ${s.axisConvention === 'Y-up' ? 'selected' : ''}>Y-up (Native)</option>
                </select>
            </label>
            <label class="setting-row">
                <span>Show Gizmo</span>
                <input type="checkbox" data-key="showAxisGizmo" ${s.showAxisGizmo ? 'checked' : ''}>
            </label>
            <label class="setting-row">
                <span>Show ViewCube</span>
                <input type="checkbox" data-key="showViewCube" ${s.showViewCube ? 'checked' : ''}>
            </label>
        </div>
    `;
}

function _buildLabelsSection() {
    const s = state.sticky.viewer3d;
    return `
        <div class="settings-section">
            <h4>Labels</h4>
            <label class="setting-row">
                <span>Show Labels</span>
                <input type="checkbox" data-key="showLabels" ${s.showLabels ? 'checked' : ''}>
            </label>
            <label class="setting-row">
                <span>Density Mode</span>
                <select data-key="labelMode">
                    <option value="off" ${s.labelMode === 'off' ? 'selected' : ''}>Off</option>
                    <option value="minimal" ${s.labelMode === 'minimal' ? 'selected' : ''}>Minimal</option>
                    <option value="smart-density" ${s.labelMode === 'smart-density' ? 'selected' : ''}>Smart Density</option>
                    <option value="full" ${s.labelMode === 'full' ? 'selected' : ''}>Full Detail</option>
                </select>
            </label>
        </div>
    `;
}

function _buildAppearanceSection() {
     const s = state.sticky.viewer3d;
     return `
         <div class="settings-section">
             <h4>Appearance</h4>
             <label class="setting-row">
                 <span>Theme Preset</span>
                 <select data-key="themePreset">
                     <option value="IsoTheme" ${s.themePreset === 'IsoTheme' ? 'selected' : ''}>IsoTheme (Technical)</option>
                     <option value="3DTheme" ${s.themePreset === '3DTheme' ? 'selected' : ''}>3D Theme (Shaded)</option>
                 </select>
             </label>
             <label class="setting-row">
                 <span>Show Grid</span>
                 <input type="checkbox" data-key="showGrid" ${s.showGrid ? 'checked' : ''}>
             </label>
         </div>
     `;
}

function _wireSettingsInputs(drawer) {
    drawer.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', (e) => {
            const key = e.target.dataset.key;
            if (!key) return;

            const value = e.target.type === 'checkbox' ? e.target.checked :
                          e.target.type === 'number' ? parseFloat(e.target.value) :
                          e.target.value;

            updateViewer3DSettings({ [key]: value });
        });
    });
}
