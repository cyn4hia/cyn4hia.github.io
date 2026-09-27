import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMaterials } from "../materials";
import { latheArc, radiusAt, roundedProfile } from "../geometry";
import { smoothstep } from "../anim";
import Steam from "../Steam";

const noRaycast = () => null;
const SURFACE_Y = 0.5;

/* average the normals where a lathe's seam meets itself */
function weldSeam(g, segments, n) {
  const nor = g.attributes.normal;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  for (let j = 0; j < n; j++) {
    a.fromBufferAttribute(nor, j);
    b.fromBufferAttribute(nor, segments * n + j);
    a.add(b).normalize();
    nor.setXYZ(j, a.x, a.y, a.z);
    nor.setXYZ(segments * n + j, a.x, a.y, a.z);
  }
  nor.needsUpdate = true;
}

/**
 * Katakuchi-style chawan: oatmeal glaze over speckled clay, an unglazed
 * foot ring, a pinched pouring lip, and a fresh bowl of whisked matcha.
 */
export default function Chawan({ anim }) {
  const m = getMaterials();
  const foam = useRef();
  const steam = useRef(0.75);

  const { bowl, surfaceR } = useMemo(() => {
    const profile = roundedProfile(
      [
        [0, 0.045],
        [0.235, 0.045, 0.02],
        [0.255, 0.0, 0.015],
        [0.33, 0.0, 0.015],
        [0.345, 0.1, 0.03],
        [0.5, 0.15, 0.1],
        [0.68, 0.33, 0.14],
        [0.765, 0.57, 0.08],
        [0.782, 0.735, 0.012],
        [0.755, 0.752, 0.012],
        [0.735, 0.72, 0.02],
        [0.715, 0.56, 0.08],
        [0.6, 0.3, 0.12],
        [0.36, 0.17, 0.1],
        [0, 0.155],
      ],
      6
    );
    const segments = 96;
    const g = latheArc(profile, segments);

    /* the pouring lip: push the rim out (and up a touch) on one side */
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      if (r < 1e-4) continue;
      let d = Math.atan2(x, z) + Math.PI / 2; // lip faces -x before the flip below
      d = Math.atan2(Math.sin(d), Math.cos(d));
      const w = Math.exp(-((d / 0.28) ** 2)) * smoothstep(0.4, 0.76, y);
      const nr = r + w * 0.2;
      pos.setXYZ(i, (x / r) * nr, y + w * 0.035, (z / r) * nr);
    }
    g.computeVertexNormals();
    weldSeam(g, segments, profile.length);
    /* hide the lathe seam at the back, lip ends up facing +x */
    g.rotateY(Math.PI);

    const rim = profile.reduce((best, p, i) => (p.x > profile[best].x ? i : best), 0);
    const surfaceR = radiusAt(profile, SURFACE_Y, rim, profile.length - 1) - 0.006;
    return { bowl: g, surfaceR };
  }, []);

  useFrame((state, dt) => {
    const a = anim.current;
    /* the foam swirls when the bowl is picked up, settling afterwards */
    const spin = 0.04 + a.focus * 0.5 + a.hover * 0.15;
    m.foam.map.rotation += spin * dt;
    steam.current = 0.75 + a.focus * 0.25;
    if (foam.current) foam.current.position.y = SURFACE_Y + Math.sin(state.clock.elapsedTime * 2.1) * 0.002;
  });

  return (
    <group>
      <mesh geometry={bowl} material={m.glaze} castShadow receiveShadow raycast={noRaycast} />
      <mesh
        ref={foam}
        rotation-x={-Math.PI / 2}
        position-y={SURFACE_Y}
        material={m.foam}
        receiveShadow
        raycast={noRaycast}
      >
        <circleGeometry args={[surfaceR, 72]} />
      </mesh>
      <Steam position={[0, SURFACE_Y, 0]} width={0.75} height={2.1} opacity={steam} seed={0.13} wind={2.2} />
    </group>
  );
}
