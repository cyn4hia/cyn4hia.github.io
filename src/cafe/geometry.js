import * as THREE from "three";

/**
 * Turn a polyline of [x, y, filletRadius?] into smooth Vector2 points,
 * rounding every corner that has a radius. Used for lathe profiles.
 */
export function roundedProfile(pts, steps = 6) {
  const out = [];
  const p = new THREE.Vector2();
  const a = new THREE.Vector2();
  const b = new THREE.Vector2();
  for (let i = 0; i < pts.length; i++) {
    const [x, y, rad = 0] = pts[i];
    if (!rad || i === 0 || i === pts.length - 1) {
      out.push(new THREE.Vector2(x, y));
      continue;
    }
    p.set(x, y);
    a.set(pts[i - 1][0], pts[i - 1][1]).sub(p);
    b.set(pts[i + 1][0], pts[i + 1][1]).sub(p);
    const ra = Math.min(rad, a.length() * 0.5);
    const rb = Math.min(rad, b.length() * 0.5);
    const p0 = p.clone().add(a.normalize().multiplyScalar(ra));
    const p2 = p.clone().add(b.normalize().multiplyScalar(rb));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const k0 = (1 - t) * (1 - t);
      const k1 = 2 * (1 - t) * t;
      const k2 = t * t;
      out.push(
        new THREE.Vector2(k0 * p0.x + k1 * p.x + k2 * p2.x, k0 * p0.y + k1 * p.y + k2 * p2.y)
      );
    }
  }
  return out;
}

/**
 * LatheGeometry whose v coordinate follows arc length along the profile
 * (the stock one spaces v by point index, which smears textures).
 */
export function latheArc(points, segments = 64) {
  const g = new THREE.LatheGeometry(points, segments);
  const n = points.length;
  const arc = [0];
  for (let j = 1; j < n; j++) arc.push(arc[j - 1] + points[j].distanceTo(points[j - 1]));
  const total = arc[n - 1] || 1;
  const uv = g.attributes.uv;
  for (let i = 0; i <= segments; i++) {
    for (let j = 0; j < n; j++) uv.setY(i * n + j, arc[j] / total);
  }
  uv.needsUpdate = true;
  return g;
}

/** radius of a lathe profile at height y, searching one monotone run */
export function radiusAt(points, y, from = 0, to = points.length - 1) {
  for (let j = from; j < to; j++) {
    const p = points[j];
    const q = points[j + 1];
    if ((y >= p.y && y <= q.y) || (y <= p.y && y >= q.y)) {
      const t = q.y === p.y ? 0 : (y - p.y) / (q.y - p.y);
      return p.x + (q.x - p.x) * t;
    }
  }
  return points[to].x;
}

/**
 * Tube along a curve whose cross-section is an ellipse that can change
 * size along the way (spouts, handles, bamboo slivers).
 * rx(t)/ry(t) give the half-axes along the curve's normal/binormal.
 */
export function sweep(curve, { segments = 48, radial = 12, rx, ry = rx, closed = false }) {
  const frames = curve.computeFrenetFrames(segments, closed);
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const P = new THREE.Vector3();
  const V = new THREE.Vector3();
  const Nrm = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    curve.getPointAt(t, P);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const a = rx(t);
    const b = ry(t);
    for (let j = 0; j <= radial; j++) {
      const th = (j / radial) * Math.PI * 2;
      const c = Math.cos(th);
      const s = Math.sin(th);
      V.set(0, 0, 0).addScaledVector(N, c * a).addScaledVector(B, s * b);
      positions.push(P.x + V.x, P.y + V.y, P.z + V.z);
      /* ellipse normal: scale by the opposite axis */
      Nrm.set(0, 0, 0).addScaledVector(N, c * b).addScaledVector(B, s * a).normalize();
      normals.push(Nrm.x, Nrm.y, Nrm.z);
      uvs.push(t, j / radial);
    }
  }
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radial; j++) {
      const a = (radial + 1) * i + j;
      const b = (radial + 1) * (i + 1) + j;
      const c = (radial + 1) * (i + 1) + j + 1;
      const d = (radial + 1) * i + j + 1;
      indices.push(a, b, d, b, c, d);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setIndex(indices);
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  return g;
}

export const curve = (pts) =>
  new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "centripetal");
