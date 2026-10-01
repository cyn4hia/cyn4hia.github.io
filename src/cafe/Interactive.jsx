import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ITEM_SCALE, TABLE } from "./config";
import { sp, spring, TAU, approach } from "./anim";
import { makeBlob } from "./textures";

let blobTex = null;
const getBlob = () => (blobTex ??= makeBlob());
const GRAVITY = -26;

/**
 * Wraps one table item with everything that makes it feel alive:
 * - an intro drop with a squashy landing
 * - hover lift + wobble, click squash
 * - focus: floats up and slowly sways; drag to spin it (via dragRef)
 * - idle "nudge" hops so visitors notice things are clickable
 * - a soft contact shadow that fades as the item leaves the table
 * Children read `anim.current.{hover, focus}` (0..1) for their own tricks.
 * `onLanded` fires once, when the intro drop first comes to rest.
 */
export default function Interactive({
  item,
  index,
  hovered,
  focused,
  play,
  reducedMotion,
  dragRef,
  nudgeRef,
  anim,
  onHover,
  onSelect,
  onLanded,
  children,
}) {
  const lifter = useRef();
  const spinner = useRef();
  const shadow = useRef();
  const st = useRef({
    started: false,
    t0: 0,
    dropY: 1.6 + index * 0.15,
    dropV: 0,
    landed: false,
    arrived: false, // first landing reported (nudge hops land again later)
    lift: sp(),
    squash: sp(),
    tiltX: sp(),
    tiltZ: sp(),
    yaw: sp(),
    scale: 0,
    lastNudge: 0,
    wasHovered: false,
  });

  const shadowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getBlob(),
        transparent: true,
        depthWrite: false,
        opacity: 0,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    []
  );

  /* a click gets a satisfying squash */
  const poke = () => {
    const s = st.current;
    s.squash.v -= 3.5;
    s.tiltZ.v += (Math.random() > 0.5 ? 1 : -1) * 2.2;
  };

  useEffect(() => {
    if (hovered && !st.current.wasHovered) st.current.tiltZ.v += (index % 2 ? 1 : -1) * 1.6;
    st.current.wasHovered = hovered;
  }, [hovered, index]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const t = state.clock.elapsedTime;
    const s = st.current;
    const a = anim.current;

    if (!play) {
      lifter.current.visible = false;
      shadowMat.opacity = 0;
      return;
    }
    if (!s.started) {
      s.started = true;
      s.t0 = t + (reducedMotion ? 0 : 0.55 + index * 0.16);
      if (reducedMotion) {
        s.dropY = 0;
        s.landed = true;
        s.scale = 1;
      }
    }
    if (t < s.t0) {
      lifter.current.visible = false;
      return;
    }
    lifter.current.visible = true;

    /* intro: fall onto the table and bounce */
    if (!s.landed) {
      s.scale = approach(s.scale, 1, 9, dt);
      s.dropV += GRAVITY * dt;
      s.dropY += s.dropV * dt;
      if (s.dropY <= 0) {
        s.dropY = 0;
        const impact = -s.dropV;
        s.dropV = impact * 0.32;
        s.squash.v -= impact * 0.55;
        if (s.dropV < 1.2) {
          s.landed = true;
          s.dropV = 0;
        }
      }
    } else {
      s.scale = approach(s.scale, 1, 9, dt);
    }
    if (s.landed && !s.arrived) {
      s.arrived = true;
      onLanded?.(item.id);
    }

    /* idle nudge: a little hop so the table feels alive */
    const n = nudgeRef.current;
    if (n.id === item.id && n.at !== s.lastNudge && s.landed && !focused) {
      s.lastNudge = n.at;
      s.dropV = 3.4;
      s.landed = false;
      s.tiltZ.v += (Math.random() > 0.5 ? 1 : -1) * 1.8;
    }

    const hov = hovered && !focused ? 1 : 0;
    spring(s.lift, focused ? item.focus.lift + Math.sin(t * 1.3) * 0.04 : hov * 0.16, dt, focused ? 60 : 220, focused ? 11 : 19);
    spring(s.squash, 0, dt, 260, 9);
    spring(s.tiltX, hov * -0.05, dt, 200, 12);
    spring(s.tiltZ, 0, dt, 170, 7);

    /* yaw: sway + drag while focused, unwind to the nearest full turn after */
    let yawGoal;
    if (focused) {
      yawGoal = dragRef.current.angle + (reducedMotion ? 0 : Math.sin(t * 0.55) * 0.22);
    } else {
      yawGoal = Math.round(s.yaw.x / TAU) * TAU;
    }
    spring(s.yaw, yawGoal, dt, focused ? 40 : 30, focused ? 9 : 10);

    const q = s.squash.x;
    lifter.current.position.y = s.dropY + s.lift.x;
    lifter.current.scale.set(s.scale * (1 - q * 0.45), s.scale * (1 + q), s.scale * (1 - q * 0.45));
    lifter.current.rotation.set(s.tiltX.x, 0, s.tiltZ.x);
    spinner.current.rotation.y = s.yaw.x;

    const h = s.dropY + s.lift.x;
    shadowMat.opacity = item.shadow.opacity * Math.max(0, 1 - h * 1.1) * s.scale;
    shadow.current.scale.set(1 + h * 0.4, 1 + h * 0.4, 1);

    a.hover = approach(a.hover, hov, 10, dt);
    a.focus = approach(a.focus, focused ? 1 : 0, 6, dt);
    a.y = h * ITEM_SCALE;
  });

  const [px, pz] = item.position;
  const hit = item.hit;

  return (
    <group position={[px, TABLE.height, pz]} rotation-y={item.rotation} scale={ITEM_SCALE}>
      <mesh
        ref={shadow}
        rotation-x={-Math.PI / 2}
        position-y={0.004}
        material={shadowMat}
        renderOrder={1}
        raycast={() => null}
      >
        <planeGeometry args={item.shadow.size} />
      </mesh>
      <group ref={lifter} visible={false}>
        <group ref={spinner}>{children}</group>
      </group>

      {/* generous, invisible hit volume: thin whisk tines are hard to hover */}
      <mesh
        position={hit.offset}
        visible={false}
        userData={{ hit: true }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(item.id);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta > 6) return; // that was a drag, not a click
          poke();
          onSelect(item.id);
        }}
      >
        {hit.type === "cyl" ? (
          <cylinderGeometry args={[hit.radius, hit.radius, hit.height, 20]} />
        ) : (
          <boxGeometry args={hit.size} />
        )}
      </mesh>
    </group>
  );
}
