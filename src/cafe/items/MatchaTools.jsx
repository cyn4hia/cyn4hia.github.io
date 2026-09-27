import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMaterials } from "../materials";
import { curve, latheArc, roundedProfile, sweep } from "../geometry";
import { sp, spring } from "../anim";

const noRaycast = () => null;
const OUTER_TINES = 64;
const INNER_TINES = 30;

/* one tine, drawn in the x/y plane; instances are spun around y */
function tineGeometry(points, width, thick) {
  return sweep(curve(points), {
    segments: 26,
    radial: 5,
    rx: (t) => thick * (1 - t * 0.5),
    ry: (t) => width * (1 - t * 0.55),
  });
}

/* chashaku: a thin bamboo sliver, cupped, with the scoop end curled */
function scoopGeometry() {
  const L = 1.42;
  const g = new THREE.BoxGeometry(0.1, L, 0.022, 4, 60, 1);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const t = (y + L / 2) / L; // 0 bottom .. 1 scoop end
    x *= 0.72 + 0.28 * t;
    const node = Math.exp(-(((t - 0.42) / 0.025) ** 2));
    z *= 1 + node * 0.9;
    z += (x / 0.05) ** 2 * 0.012 * (0.3 + t);
    if (t > 0.84) {
      const k = (t - 0.84) / 0.16;
      z += k * k * 0.13;
      y -= k * k * 0.03;
    }
    pos.setXYZ(i, x, y + L / 2, z);
  }
  g.computeVertexNormals();
  return g;
}

/**
 * The chasen (whisk) standing on its handle, tines up, with the chashaku
 * (scoop) leaning against it, as in the sketch.
 */
export default function MatchaTools({ anim }) {
  const m = getMaterials();
  const whisk = useRef();
  const scoop = useRef();
  const outer = useRef();
  const inner = useRef();
  const st = useRef({ spin: sp(), wob: sp(), hop: sp(), flip: sp(), was: false, focusT: 0 });

  const geo = useMemo(() => {
    const handle = latheArc(
      roundedProfile(
        [
          [0, 0],
          [0.094, 0, 0.012],
          [0.1, 0.05, 0.01],
          [0.104, 0.07, 0.01],
          [0.1, 0.09, 0.01],
          [0.098, 0.5, 0.01],
          [0.09, 0.52],
          [0, 0.52],
        ],
        4
      ),
      40
    );
    const outerTine = tineGeometry(
      [
        [0.085, 0.52, 0],
        [0.13, 0.6, 0],
        [0.22, 0.72, 0],
        [0.28, 0.86, 0],
        [0.29, 0.96, 0],
        [0.255, 1.04, 0],
        [0.185, 1.08, 0],
        [0.13, 1.055, 0],
      ],
      0.013,
      0.0045
    );
    const innerTine = tineGeometry(
      [
        [0.05, 0.52, 0],
        [0.07, 0.62, 0],
        [0.1, 0.78, 0],
        [0.112, 0.92, 0],
        [0.095, 1.0, 0],
        [0.065, 1.025, 0],
      ],
      0.012,
      0.0045
    );
    return { handle, outerTine, innerTine, scoop: scoopGeometry() };
  }, []);

  /* fan the tines out around the handle */
  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    for (let i = 0; i < OUTER_TINES; i++) {
      d.rotation.set(0, (i / OUTER_TINES) * Math.PI * 2 + Math.sin(i * 12.9) * 0.02, 0);
      const s = 0.97 + Math.sin(i * 7.3) * 0.03;
      d.scale.set(s, 1 + Math.sin(i * 3.1) * 0.012, s);
      d.updateMatrix();
      outer.current.setMatrixAt(i, d.matrix);
    }
    outer.current.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < INNER_TINES; i++) {
      d.rotation.set(0, (i / INNER_TINES) * Math.PI * 2 + 0.05, 0);
      d.scale.set(1, 1, 1);
      d.updateMatrix();
      inner.current.setMatrixAt(i, d.matrix);
    }
    inner.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const a = anim.current;
    const s = st.current;
    const t = state.clock.elapsedTime;
    const focused = a.focus > 0.5;
    if (focused && !s.was) {
      s.focusT = t;
      s.flip.v += 14; // the scoop does a little twirl
      s.hop.v += 3.2;
    }
    s.was = focused;

    /* whisking: a quick back-and-forth burst when picked, then a lazy sway */
    const since = t - s.focusT;
    const burst = focused ? Math.max(0, 1 - since / 1.6) : 0;
    const whisking = Math.sin(t * 22) * 0.55 * burst;
    spring(s.spin, focused ? Math.sin(t * 0.8) * 0.3 : 0, dt, 60, 10);
    spring(s.wob, a.hover * Math.sin(t * 9) * 0.06, dt, 200, 12);
    whisk.current.rotation.y = s.spin.x + whisking;
    whisk.current.rotation.z = s.wob.x + Math.sin(t * 22 + 1) * 0.04 * burst;

    spring(s.hop, 0, dt, 120, 9);
    spring(s.flip, focused ? Math.PI * 2 : 0, dt, 70, 11);
    scoop.current.position.y = Math.max(0, s.hop.x * 0.12);
    scoop.current.rotation.y = s.flip.x;
  });

  return (
    <group>
      <group ref={whisk} position-x={0.2}>
        <mesh geometry={geo.handle} material={m.bamboo} castShadow receiveShadow raycast={noRaycast} />
        <mesh position-y={0.53} material={m.thread} castShadow raycast={noRaycast}>
          <cylinderGeometry args={[0.1, 0.1, 0.045, 32]} />
        </mesh>
        <instancedMesh
          ref={outer}
          args={[geo.outerTine, m.tine, OUTER_TINES]}
          castShadow
          receiveShadow
          raycast={noRaycast}
        />
        <instancedMesh
          ref={inner}
          args={[geo.innerTine, m.tine, INNER_TINES]}
          castShadow
          raycast={noRaycast}
        />
      </group>
      {/* the scoop leans on the whisk */}
      <group position={[-0.3, 0, 0.02]} rotation-z={-0.17}>
        <group ref={scoop}>
          <mesh geometry={geo.scoop} material={m.bamboo} castShadow receiveShadow raycast={noRaycast} />
        </group>
      </group>
    </group>
  );
}
