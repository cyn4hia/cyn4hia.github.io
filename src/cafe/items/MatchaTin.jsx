import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getMaterials } from "../materials";
import { latheArc, roundedProfile } from "../geometry";
import { sp, spring } from "../anim";

const noRaycast = () => null;
const R = 0.42;
const PUFFS = 26;

/**
 * Washi-wrapped matcha tin with a lacquered green lid. When focused the
 * lid pops off, revealing the powder, with a little puff of green dust.
 */
export default function MatchaTin({ anim }) {
  const m = getMaterials();
  const lid = useRef();
  const puffRef = useRef();
  const st = useRef({ lift: sp(), tilt: sp(), wasOpen: false, puffT: -1 });

  const geo = useMemo(() => {
    const can = latheArc(
      roundedProfile(
        [
          [0, 0],
          [R - 0.015, 0, 0.012],
          [R, 0.02, 0.012],
          [R, 0.66],
          [R - 0.012, 0.675, 0.006],
          [R - 0.022, 0.66],
          [R - 0.022, 0.13],
          [0, 0.13],
        ],
        5
      ),
      72
    );
    const lidGeo = latheArc(
      roundedProfile(
        [
          [0, 0.848],
          [R + 0.005, 0.848, 0.02],
          [R + 0.005, 0.5, 0.003],
          [R + 0.021, 0.5, 0.003],
          [R + 0.021, 0.838, 0.03],
          [R - 0.02, 0.87, 0.025],
          [0, 0.872],
        ],
        5
      ),
      72
    );
    /* lid pivots about its own base so it can tip open */
    lidGeo.translate(0, -0.5, 0);
    const label = new THREE.CylinderGeometry(R + 0.0025, R + 0.0025, 0.56, 72, 1, true);
    label.translate(0, 0.32, 0);
    label.rotateY(Math.PI); // front panel faces the camera
    const bead = new THREE.TorusGeometry(R + 0.022, 0.007, 8, 72);
    bead.rotateX(Math.PI / 2);

    const puffs = new THREE.BufferGeometry();
    puffs.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PUFFS * 3), 3));
    return { can, lid: lidGeo, label, bead, puffs };
  }, []);

  const puffSeeds = useMemo(
    () =>
      Array.from({ length: PUFFS }, () => ({
        a: Math.random() * Math.PI * 2,
        r: Math.random() * 0.25,
        vy: 0.9 + Math.random() * 1.2,
        vr: 0.2 + Math.random() * 0.5,
      })),
    []
  );
  const puffMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: "#8fb654",
        size: 0.035,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    []
  );

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const a = anim.current;
    const s = st.current;
    const t = state.clock.elapsedTime;
    const open = a.focus > 0.5;

    /* peek on hover, pop right off when focused */
    const liftGoal = open ? 0.62 + Math.sin(t * 1.6) * 0.03 : a.hover * 0.06;
    spring(s.lift, liftGoal, dt, open ? 90 : 260, open ? 9 : 18);
    spring(s.tilt, open ? 0.32 : a.hover * 0.05, dt, 80, 8);
    lid.current.position.y = 0.5 + s.lift.x;
    lid.current.position.x = s.lift.x * 0.25;
    lid.current.rotation.z = -s.tilt.x;

    if (open && !s.wasOpen) s.puffT = 0;
    s.wasOpen = open;

    /* matcha dust */
    const arr = geo.puffs.attributes.position.array;
    if (s.puffT >= 0) {
      s.puffT += dt;
      const pt = s.puffT;
      puffSeeds.forEach((p, i) => {
        const rr = p.r + p.vr * pt;
        arr[i * 3] = Math.cos(p.a) * rr;
        arr[i * 3 + 1] = 0.62 + p.vy * pt - 1.4 * pt * pt;
        arr[i * 3 + 2] = Math.sin(p.a) * rr;
      });
      geo.puffs.attributes.position.needsUpdate = true;
      puffMat.opacity = Math.max(0, 0.85 * (1 - pt / 1.1));
      if (pt > 1.1) s.puffT = -1;
    }
    puffRef.current.visible = s.puffT >= 0;
  });

  return (
    <group>
      <mesh geometry={geo.can} material={m.tinMetal} castShadow receiveShadow raycast={noRaycast} />
      <mesh geometry={geo.label} material={m.label} castShadow receiveShadow raycast={noRaycast} />
      {/* powder, just under the neck */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.6} material={m.powder} raycast={noRaycast}>
        <circleGeometry args={[R - 0.024, 48]} />
      </mesh>
      <group ref={lid} position-y={0.5}>
        <mesh geometry={geo.lid} material={m.tinLid} castShadow receiveShadow raycast={noRaycast} />
        <mesh geometry={geo.bead} material={m.gold} position-y={0.012} raycast={noRaycast} />
      </group>
      <points ref={puffRef} geometry={geo.puffs} material={puffMat} raycast={noRaycast} />
    </group>
  );
}
