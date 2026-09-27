import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ITEM_SCALE, TABLE, VIEW } from "./config";
import { clamp01, easeInOutCubic } from "./anim";

const INTRO_SECONDS = 2.8;

const v = (a) => new THREE.Vector3(...a);
const BASE_POS = v(VIEW.position);
const BASE_TARGET = v(VIEW.target);
const INTRO_POS = v(VIEW.intro.position);
const INTRO_TARGET = v(VIEW.intro.target);

const goalPos = new THREE.Vector3();
const goalTarget = new THREE.Vector3();
const tmp = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);

/**
 * Drives the camera: a slow glide in on load, gentle pointer parallax
 * over the table, and a smooth fly-to when an item is focused. The
 * focused item is nudged off-centre (via a view offset) so the info
 * panel never covers it.
 */
export default function CameraRig({ focusedItem, play, reducedMotion, panelInset }) {
  const { camera, size } = useThree();
  const st = useRef({
    pos: INTRO_POS.clone(),
    target: INTRO_TARGET.clone(),
    offX: 0,
    offY: 0,
    introStart: null,
    px: 0,
    py: 0,
  });

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const s = st.current;
    const t = state.clock.elapsedTime;
    const aspect = size.width / size.height;

    /* narrow screens: pull back just enough to keep the table in frame */
    const fit = Math.max(1, (0.62 * VIEW.designAspect) / aspect);
    const basePos = tmp.copy(BASE_POS).sub(BASE_TARGET).multiplyScalar(fit).add(BASE_TARGET);

    if (play && s.introStart === null) s.introStart = t;
    const intro = s.introStart === null ? 0 : clamp01((t - s.introStart) / (reducedMotion ? 0.01 : INTRO_SECONDS));

    let rate = 3.2;
    let offX = 0;
    let offY = 0;

    if (focusedItem) {
      const f = focusedItem.focus;
      const [ix, iz] = focusedItem.position;
      goalTarget.set(ix, TABLE.height + (f.look + f.lift) * ITEM_SCALE, iz); // aim at it while lifted
      const narrowFit = Math.max(1, Math.pow(1.1 / aspect, 0.75));
      const dist = f.dist * ITEM_SCALE * narrowFit * (panelInset.zoom ?? 1);
      goalPos.set(
        Math.sin(f.azim) * Math.cos(f.elev) * dist,
        Math.sin(f.elev) * dist,
        Math.cos(f.azim) * Math.cos(f.elev) * dist
      ).add(goalTarget);
      offX = panelInset.x;
      offY = panelInset.y;
      rate = 2.6;
    } else {
      const e = easeInOutCubic(intro);
      goalPos.copy(INTRO_POS).lerp(basePos, e);
      goalTarget.copy(INTRO_TARGET).lerp(BASE_TARGET, e);

      /* parallax: lean with the pointer, a little breathing drift */
      if (!reducedMotion && intro >= 1) {
        s.px += (state.pointer.x - s.px) * (1 - Math.exp(-2.5 * dt));
        s.py += (state.pointer.y - s.py) * (1 - Math.exp(-2.5 * dt));
        right.subVectors(goalTarget, goalPos).cross(up).normalize();
        goalPos.addScaledVector(right, s.px * 0.9);
        goalPos.y += s.py * 0.45 + Math.sin(t * 0.35) * 0.06;
        goalTarget.addScaledVector(right, s.px * 0.25);
      }
      if (intro < 1) rate = 9; // the glide itself is eased; just follow it
    }

    const k = 1 - Math.exp(-rate * dt);
    s.pos.lerp(goalPos, k);
    s.target.lerp(goalTarget, k);
    s.offX += (offX - s.offX) * k;
    s.offY += (offY - s.offY) * k;

    camera.position.copy(s.pos);
    camera.lookAt(s.target);
    camera.setViewOffset(size.width, size.height, s.offX, s.offY, size.width, size.height);
  });

  return null;
}
