/**
 * symbols.js — 3D Support Symbol generation based on the Geometry Tab Revamp Work Instruction.
 */

import * as THREE from 'three';
import { toThree } from './pipe-geometry.js';
import { state } from '../core/state.js';

const GREEN_COLOR = 0x00C853;

function getUpAxis() {
    const isZUp = state.sticky.viewer3d.axisConvention === 'Z-up';
    return isZUp ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 1, 0); // In three.js space, up is always +Y for Z-up because we rotate the scene root.
}

/**
 * Builds a single arrow (shaft + cone).
 * Direction is normalized, length/radius relative to pipe OD.
 */
function buildArrow(direction, offset, od, color = GREEN_COLOR, dashed = false) {
    const group = new THREE.Group();
    const arrowLen = 1.5 * od;
    const shaftR   = 0.075 * od;
    const headLen  = 0.4 * od;
    const headR    = 0.175 * od;

    // MeshStandardMaterial for actual 3D shading
    const matParams = { color, roughness: 0.4, metalness: 0.1 };
    let mat;

    const shaftLen = arrowLen - headLen;
    let shaft;

    if (dashed) {
        // Fallback for dashed: build multiple small cylinders with gaps
        const dashCount = 5;
        const segmentLen = shaftLen / (dashCount * 2 - 1);
        const dashMat = new THREE.MeshStandardMaterial(matParams);
        shaft = new THREE.Group();
        for (let i = 0; i < dashCount; i++) {
             const seg = new THREE.Mesh(new THREE.CylinderGeometry(shaftR, shaftR, segmentLen, 8), dashMat);
             // Shift segment to start at bottom of shaft group
             seg.position.y = (i * 2 * segmentLen) - (shaftLen / 2) + (segmentLen / 2);
             shaft.add(seg);
        }
    } else {
        mat = new THREE.MeshStandardMaterial(matParams);
        shaft = new THREE.Mesh(new THREE.CylinderGeometry(shaftR, shaftR, shaftLen, 8), mat);
    }

    mat = new THREE.MeshStandardMaterial(matParams);
    const head = new THREE.Mesh(new THREE.ConeGeometry(headR, headLen, 8), mat);

    group.add(shaft);
    group.add(head);

    // Default geometries are built along Y axis. Orient to direction.
    // Cylinder is centered at origin. Shift so base is at offset.
    // Cone is centered at origin. Shift so base is at offset + shaftLen.
    const unitDir = direction.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), unitDir);

    shaft.position.copy(unitDir).multiplyScalar(offset + shaftLen / 2);
    head.position.copy(unitDir).multiplyScalar(offset + shaftLen + headLen / 2);

    shaft.quaternion.copy(quat);
    head.quaternion.copy(quat);

    return group;
}

export function buildSupportSymbol(pos, pipeAxis, od, type, color = GREEN_COLOR) {
    const group = new THREE.Group();
    const upAxis = getUpAxis();

    // Ensure pipe axis isn't perfectly aligned with upAxis
    let lateral = new THREE.Vector3().crossVectors(pipeAxis, upAxis);
    if (lateral.lengthSq() < 1e-6) {
        // Fallback if pipe is vertical
        lateral = new THREE.Vector3(1, 0, 0);
    }
    lateral.normalize();

    const scale = state.sticky.viewer3d.restraintSymbolScale || 1.0;

    switch (type) {
        case 'GUIDE':
        case 'ANCHOR':
            group.add(buildArrow(lateral.clone().negate(), od / 2, od, color));
            group.add(buildArrow(lateral.clone(), od / 2, od, color));
            group.add(buildArrow(upAxis.clone().negate(), od / 2, od, color));
            break;

        case 'STOP':
            group.add(buildArrow(lateral.clone().negate(), od / 2, od, color));
            group.add(buildArrow(lateral.clone(), od / 2, od, color));
            break;

        case 'SPRING':
        case 'HANGER':
            group.add(buildArrow(upAxis.clone().negate(), od / 2, od, color, true));
            break;

        case 'RIGID':
            // Cross symbol in pipe plane
            const crossDir1 = lateral.clone().applyAxisAngle(pipeAxis, Math.PI / 4);
            const crossDir2 = lateral.clone().applyAxisAngle(pipeAxis, -Math.PI / 4);
            group.add(buildArrow(crossDir1, od / 2, od * 0.8, color));
            group.add(buildArrow(crossDir1.negate(), od / 2, od * 0.8, color));
            group.add(buildArrow(crossDir2, od / 2, od * 0.8, color));
            group.add(buildArrow(crossDir2.negate(), od / 2, od * 0.8, color));
            break;

        case 'UNKNOWN':
        default:
            group.add(buildArrow(upAxis.clone().negate(), od / 2, od, color));
            break;
    }

    group.position.copy(pos);
    group.scale.set(scale, scale, scale);
    return group;
}

export function classifySupport(supportName, supportKeywords) {
    const combined = `${supportName} ${supportKeywords}`.toUpperCase();
    if (combined.includes('GUI') || combined.includes('GUIDE')) return 'GUIDE';
    if (/CA\d+/i.test(supportName) || combined.includes('ANCH') || combined.includes('ANCHOR')) return 'ANCHOR';
    if (combined.includes('STOP')) return 'STOP';
    if (combined.includes('SPRING') || combined.includes('HANGER')) return 'SPRING';
    if (combined.includes('RIGID')) return 'RIGID';
    return 'UNKNOWN';
}

export function createForceArrow(pos, force) {
  const dir = new THREE.Vector3(force.fy, force.fz, force.fx).normalize();
  if (dir.length() < 0.01) return null;

  const origin = toThree(pos);
  const length = 0.05;
  const arrow = new THREE.ArrowHelper(dir, origin, length, 0xe0a000, 0.015, 0.01);
  return arrow;
}