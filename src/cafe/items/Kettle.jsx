import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { getMaterials } from "../materials";
import { curve, latheArc, roundedProfile, sweep } from "../geometry";
import { sp, spring } from "../anim";
import { makeLcd } from "../textures";
import Steam from "../Steam";

const noRaycast = () => null;
const BASE_H = 0.3;
const BODY_X = 0.22;
const SPOUT = [
  [-0.56, 0.2, 0],
  [-0.78, 0.24, 0],
  [-0.93, 0.42, 0],
  [-0.99, 0.8, 0],
  [-1.02, 1.14, 0],
  [-1.08, 1.38, 0],
  [-1.2, 1.5, 0],
  [-1.34, 1.53, 0],
  [-1.43, 1.49, 0],
];

/**
 * Gooseneck pour-over kettle on its heating base (matte black, walnut
 * handle). Focus lifts it off the base into a pouring tilt while the
 * display warms up to a proper matcha 80°C and steam curls off the spout.
 */
export default function Kettle({ anim }) {
  const m = getMaterials();
  const body = useRef();
  const lcdMat = useRef();
  const steam = useRef(0);
  const st = useRef({ lift: sp(), tilt: sp(), temp: 72 });
  const lcd = useMemo(() => makeLcd(), []);

  const geo = useMemo(() => {
    const base = new RoundedBoxGeometry(2.0, BASE_H, 1.75, 4, 0.12);
    base.translate(0, BASE_H / 2, 0);
    const pot = latheArc(
      roundedProfile(
        [
          [0, 0],
          [0.58, 0, 0.08],
          [0.64, 0.1, 0.1],
          [0.64, 0.3],
          [0.61, 1.12, 0.12],
          [0.56, 1.22, 0.05],
          [0.5, 1.245],
          [0, 1.245],
        ],
        6
      ),
      72
    );
    const lid = latheArc(
      roundedProfile(
        [
          [0, 1.31],
          [0.44, 1.302, 0.05],
          [0.49, 1.27, 0.02],
          [0.49, 1.24],
          [0, 1.24],
        ],
        6
      ),
      72
    );
    const knob = latheArc(
      roundedProfile(
        [
          [0, 1.3],
          [0.08, 1.3],
          [0.085, 1.56, 0.04],
          [0, 1.58],
        ],
        5
      ),
      32
    );
    const spoutCurve = curve(SPOUT);
    const spout = sweep(spoutCurve, {
      segments: 64,
      radial: 16,
      rx: (t) => 0.085 - 0.05 * Math.pow(t, 0.8) + Math.max(0, 0.06 - t) * 0.5,
    });
    const handle = sweep(
      curve([
        [0.58, 1.08, 0],
        [0.84, 1.12, 0],
        [0.99, 0.98, 0],
        [1.03, 0.7, 0],
        [0.97, 0.44, 0],
        [0.8, 0.3, 0],
        [0.6, 0.3, 0],
      ]),
      { segments: 48, radial: 14, rx: () => 0.06, ry: () => 0.085 }
    );
    const ring = new THREE.TorusGeometry(0.49, 0.012, 8, 72);
    ring.rotateX(Math.PI / 2);
    ring.translate(0, 1.245, 0);
    const tip = spoutCurve.getPointAt(1);
    return { base, pot, lid, knob, spout, handle, ring, tip };
  }, []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const a = anim.current;
    const s = st.current;
    const focused = a.focus > 0.5;

    /* pick it up and tip it toward the chawan */
    spring(s.lift, focused ? 0.42 : a.hover * 0.05, dt, 70, 11);
    spring(s.tilt, focused ? 0.16 : 0, dt, 50, 9);
    body.current.position.y = BASE_H + s.lift.x;
    body.current.rotation.z = s.tilt.x;

    /* the display heats toward 80°C when picked, cools back when not */
    const target = focused ? 80 : 72;
    s.temp += Math.sign(target - s.temp) * Math.min(Math.abs(target - s.temp), dt * 5);
    lcd.draw(Math.round(s.temp), focused && s.temp < 79.5);
    lcdMat.current.color.setScalar(0.75 + a.hover * 0.25 + a.focus * 0.25);
    steam.current = a.focus * 0.85;
  });

  return (
    <group>
      {/* heating base */}
      <mesh geometry={geo.base} material={m.kettle} castShadow receiveShadow raycast={noRaycast} />
      <mesh position={[BODY_X, BASE_H + 0.002, 0]} rotation-x={-Math.PI / 2} material={m.steel} raycast={noRaycast}>
        <ringGeometry args={[0.52, 0.56, 64]} />
      </mesh>
      <mesh position={[-0.28, BASE_H / 2, 0.8755]} raycast={noRaycast}>
        <planeGeometry args={[0.5, 0.19]} />
        <meshBasicMaterial ref={lcdMat} map={lcd.texture} toneMapped={false} />
      </mesh>
      <group position={[0.6, BASE_H / 2, 0.875]}>
        <mesh rotation-x={Math.PI / 2} position-z={0.03} material={m.dial} castShadow raycast={noRaycast}>
          <cylinderGeometry args={[0.12, 0.125, 0.07, 36]} />
        </mesh>
        <mesh position={[0, 0.07, 0.068]} material={m.steel} raycast={noRaycast}>
          <sphereGeometry args={[0.014, 10, 8]} />
        </mesh>
      </group>

      {/* the kettle itself */}
      <group position-x={BODY_X}>
        <group ref={body} position-y={BASE_H}>
          <mesh geometry={geo.pot} material={m.kettle} castShadow receiveShadow raycast={noRaycast} />
          <mesh geometry={geo.lid} material={m.kettle} castShadow receiveShadow raycast={noRaycast} />
          <mesh geometry={geo.ring} material={m.steel} raycast={noRaycast} />
          <mesh geometry={geo.knob} material={m.walnut} castShadow receiveShadow raycast={noRaycast} />
          <mesh geometry={geo.spout} material={m.kettleInside} castShadow receiveShadow raycast={noRaycast} />
          <mesh geometry={geo.handle} material={m.walnut} castShadow receiveShadow raycast={noRaycast} />
          <Steam
            position={[geo.tip.x - 0.04, geo.tip.y - 0.02, geo.tip.z]}
            width={0.5}
            height={1.6}
            opacity={steam}
            seed={0.61}
            wind={2}
            speed={1.6}
          />
        </group>
      </group>
    </group>
  );
}
