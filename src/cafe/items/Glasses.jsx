import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { getMaterials } from "../materials";
import { latheArc, roundedProfile } from "../geometry";
import { clamp01 } from "../anim";

const noRaycast = () => null;
const SPACING = 0.78;
const FLOOR = 0.12; // inside bottom of the glass
const TOP = 1.29;
/* inner radius at height y (the tumbler tapers out toward the rim) */
const innerR = (y) => 0.336 + ((y - FLOOR) * 0.06) / (TOP - FLOOR) - 0.008;
const SEG = 40;

/* a frustum whose bottom/top we can move every frame (liquid layers) */
function makeLayer() {
  const g = new THREE.BufferGeometry();
  const count = (SEG + 1) * 2 + (SEG + 2);
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const nor = new Float32Array(count * 3);
  const idx = [];
  for (let i = 0; i <= SEG; i++) {
    const a = (i / SEG) * Math.PI * 2;
    nor.set([Math.sin(a), 0, Math.cos(a)], i * 3);
    nor.set([Math.sin(a), 0, Math.cos(a)], (SEG + 1 + i) * 3);
    if (i < SEG) idx.push(i, i + 1, SEG + 1 + i, i + 1, SEG + 2 + i, SEG + 1 + i);
  }
  const cap = (SEG + 1) * 2;
  for (let i = 0; i <= SEG + 1; i++) nor.set([0, 1, 0], (cap + i) * 3);
  for (let i = 0; i < SEG; i++) idx.push(cap, cap + 1 + i, cap + 2 + i);
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setIndex(idx);

  const set = (y0, y1) => {
    const p = g.attributes.position.array;
    const r0 = innerR(y0);
    const r1 = innerR(y1);
    for (let i = 0; i <= SEG; i++) {
      const a = (i / SEG) * Math.PI * 2;
      const s = Math.sin(a);
      const c = Math.cos(a);
      p.set([s * r0, y0, c * r0], i * 3);
      p.set([s * r1, y1, c * r1], (SEG + 1 + i) * 3);
      p.set([s * r1, y1, c * r1], (cap + 1 + i) * 3);
    }
    p.set([0, y1, 0], cap * 3);
    g.attributes.position.needsUpdate = true;
    g.computeBoundingSphere();
  };
  set(FLOOR, FLOOR + 0.001);
  return { geometry: g, set };
}

function Glass({ side, fill, clink, t }) {
  const m = getMaterials();
  const group = useRef();
  const layers = useMemo(() => ({ milk: makeLayer(), swirl: makeLayer(), matcha: makeLayer() }), []);
  const iceRefs = useRef([]);
  const ice = useMemo(
    () =>
      [0, 1, 2].map((i) => ({
        x: Math.cos(i * 2.2 + side) * 0.14,
        z: Math.sin(i * 2.2 + side) * 0.14,
        rx: i * 0.7 + side,
        ry: i * 1.3,
        s: 0.9 + i * 0.08,
      })),
    [side]
  );
  const iceGeo = useMemo(() => new RoundedBoxGeometry(0.2, 0.2, 0.2, 2, 0.04), []);
  const meshes = useRef({});
  const level = useRef({ fill: -1, top: FLOOR });

  useFrame(() => {
    const f = fill.current;
    const lv = level.current;
    /* only rebuild the liquid while it's actually pouring or draining */
    if (f !== lv.fill) {
      lv.fill = f;
      /* milk first, then the green pour settling on top */
      const milkTop = FLOOR + clamp01(f / 0.55) * 0.52;
      const swirlTop = milkTop + clamp01((f - 0.45) / 0.2) * 0.08;
      const matchaTop = swirlTop + clamp01((f - 0.55) / 0.45) * 0.3;
      layers.milk.set(FLOOR + 0.001, milkTop);
      layers.swirl.set(milkTop, swirlTop);
      layers.matcha.set(swirlTop, matchaTop);
      meshes.current.milk.visible = milkTop > FLOOR + 0.004;
      meshes.current.swirl.visible = swirlTop > milkTop + 0.002;
      meshes.current.matcha.visible = matchaTop > swirlTop + 0.002;
      lv.top = Math.max(milkTop, matchaTop);
    }

    iceRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const d = ice[i];
      const k = clamp01((f - 0.15 - i * 0.08) / 0.3);
      mesh.visible = k > 0.01;
      if (!mesh.visible) return;
      mesh.scale.setScalar(k * d.s);
      mesh.position.set(d.x, Math.max(FLOOR + 0.1, lv.top - 0.06 - i * 0.05) + Math.sin(t.current * 1.5 + i) * 0.01, d.z);
      mesh.rotation.set(d.rx + t.current * 0.05, d.ry, 0);
    });

    /* cheers: lean toward each other */
    group.current.rotation.z = side * clink.current * 0.14;
    group.current.position.x = side * (SPACING - clink.current * 0.14);
  });

  const glassGeo = useMemo(
    () =>
      latheArc(
        roundedProfile(
          [
            [0, 0],
            [0.35, 0, 0.02],
            [0.362, 0.03, 0.02],
            [0.415, TOP],
            [0.41, TOP + 0.012, 0.006],
            [0.398, TOP],
            [0.336, FLOOR, 0.03],
            [0, FLOOR],
          ],
          5
        ),
        64
      ),
    []
  );

  return (
    <group ref={group} position-x={side * SPACING}>
      <mesh geometry={glassGeo} material={m.glass} castShadow raycast={noRaycast} />
      <mesh ref={(el) => (meshes.current.milk = el)} geometry={layers.milk.geometry} material={m.milk} raycast={noRaycast} />
      <mesh ref={(el) => (meshes.current.swirl = el)} geometry={layers.swirl.geometry} material={m.swirl} raycast={noRaycast} />
      <mesh ref={(el) => (meshes.current.matcha = el)} geometry={layers.matcha.geometry} material={m.matcha} raycast={noRaycast} />
      {ice.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (iceRefs.current[i] = el)}
          geometry={iceGeo}
          material={m.ice}
          renderOrder={2}
          raycast={noRaycast}
        />
      ))}
    </group>
  );
}

/**
 * Two empty tumblers, one of them for you. Focus pours two layered iced
 * matcha lattes and clinks the glasses; they drain again afterwards.
 */
export default function Glasses({ anim }) {
  const fill = useRef(0);
  const clink = useRef(0);
  const t = useRef(0);
  const st = useRef({ was: false, focusT: 0 });

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const a = anim.current;
    const s = st.current;
    t.current = state.clock.elapsedTime;
    const focused = a.focus > 0.5;
    if (focused && !s.was) s.focusT = t.current;
    s.was = focused;

    /* pour steadily, drain faster */
    const goal = focused ? 1 : 0;
    const rate = focused ? 0.55 : 1.4;
    fill.current += Math.sign(goal - fill.current) * Math.min(Math.abs(goal - fill.current), dt * rate);

    const since = t.current - s.focusT - 2.1;
    clink.current = focused && since > 0 && since < 0.7 ? Math.sin((since / 0.7) * Math.PI) : 0;
    clink.current += a.hover * 0.12;
  });

  return (
    <group>
      <Glass side={-1} fill={fill} clink={clink} t={t} />
      <Glass side={1} fill={fill} clink={clink} t={t} />
    </group>
  );
}
