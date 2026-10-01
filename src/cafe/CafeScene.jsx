import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Room, { WALL_COLOR } from "./Room";
import Table from "./Table";
import CameraRig from "./CameraRig";
import Interactive from "./Interactive";
import Chawan from "./items/Chawan";
import MatchaTin from "./items/MatchaTin";
import MatchaTools from "./items/MatchaTools";
import Kettle from "./items/Kettle";
import Glasses from "./items/Glasses";
import { VIEW, ITEMS, ITEM_BY_ID, ITEM_SCALE, TABLE } from "./config";

const MODELS = {
  tools: MatchaTools,
  chawan: Chawan,
  glasses: Glasses,
  tin: MatchaTin,
  kettle: Kettle,
};

const TEXTURE_SLOTS = [
  "map",
  "bumpMap",
  "normalMap",
  "roughnessMap",
  "metalnessMap",
  "emissiveMap",
  "alphaMap",
  "aoMap",
  "clearcoatMap",
  "clearcoatRoughnessMap",
  "transmissionMap",
  "thicknessMap",
];

const MAX_DPR = 2;
const startDpr = () => Math.min(window.devicePixelRatio || 1, MAX_DPR);

/* the display's frame interval (8.3ms at 120Hz, 16.7ms at 60Hz); the
   quickest quarter of intervals ignores any frames we happen to drop */
function measureRefreshInterval(samples = 12) {
  return new Promise((resolve) => {
    const gaps = [];
    let last = 0;
    const fallback = setTimeout(() => resolve(1000 / 60), 400); // hidden tab: rAF may not run
    const tick = (now) => {
      if (last) gaps.push(now - last);
      last = now;
      if (gaps.length < samples) {
        requestAnimationFrame(tick);
        return;
      }
      clearTimeout(fallback);
      gaps.sort((a, b) => a - b);
      resolve(gaps[Math.floor(gaps.length / 4)]);
    };
    requestAnimationFrame(tick);
  });
}

/**
 * Does all the GPU prep behind the splash so the intro never stutters:
 * compiles every shader (items start hidden, so three would otherwise
 * compile each one the instant it drops in), uploads every texture, and
 * draws throwaway frames with everything shown. Those frames build the
 * shadow-map and glass-refraction shader variants (the glass needs one
 * for every opaque material in the room) and let us time this device:
 * we keep the sharpest pixel ratio it can draw within budget.
 */
function Warmup({ onReady, onDpr }) {
  const { gl, scene, camera, setDpr, setFrameloop, get } = useThree();
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        /* compile() walks hidden meshes too; async lets the driver work in parallel */
        await gl.compileAsync(scene, camera);
      } catch {
        /* anything missed still compiles in the frames below */
      }
      /* a frame measured with the GPU synced may use ~85% of the display's
         frame interval: that holds 120fps on ProMotion, 60fps elsewhere.
         Rendering pauses while we sample so our own frames can't skew it. */
      const loop = get().frameloop;
      setFrameloop("never");
      const refresh = await measureRefreshInterval();
      setFrameloop(loop);
      const budget = Math.min(14, Math.max(6.5, refresh * 0.85));
      if (!alive) return;

      const textures = new Set();
      const hidden = [];
      scene.traverse((o) => {
        for (const m of o.material ? [].concat(o.material) : []) {
          for (const slot of TEXTURE_SLOTS) if (m[slot]?.isTexture) textures.add(m[slot]);
          for (const u of Object.values(m.uniforms ?? {})) if (u.value?.isTexture) textures.add(u.value);
        }
        if (o.isLight && o.map?.isTexture) textures.add(o.map);
        if (!o.visible && !o.userData.hit) {
          hidden.push(o);
          o.visible = true;
        }
      });
      textures.forEach((t) => gl.initTexture(t));

      /* time a few full frames (readPixels waits for the GPU to finish) */
      const ctx = gl.getContext();
      const px = new Uint8Array(4);
      const frame = () => {
        const t0 = performance.now();
        gl.render(scene, camera);
        ctx.readPixels(0, 0, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, px);
        return performance.now() - t0;
      };
      const top = startDpr();
      const ladder = [2, 1.75, 1.5, 1.25, 1].filter((d) => d <= top);
      if (!ladder.length) ladder.push(top);
      let chosen = ladder[ladder.length - 1];
      for (const d of ladder) {
        setDpr(d);
        frame();
        frame();
        const times = [frame(), frame(), frame(), frame(), frame()].sort((a, b) => a - b);
        if (times[2] <= budget) {
          chosen = d;
          break;
        }
      }
      setDpr(chosen);

      hidden.forEach((o) => (o.visible = false));
      onDpr?.(chosen);
      onReady?.();
    })();
    return () => {
      alive = false;
    };
  }, [gl, scene, camera, setDpr, setFrameloop, get, onReady, onDpr]);
  return null;
}

/**
 * Pins the DOM annotations to their items: projects each item's anchor
 * to screen space every frame and writes it straight into the element's
 * transform (no React re-renders).
 */
function LabelTracker({ labelRefs, anims }) {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    const els = labelRefs.current;
    for (const item of ITEMS) {
      const el = els[item.id];
      if (!el) continue;
      const [ax, ay, az] = item.anchor.map((n) => n * ITEM_SCALE);
      const c = Math.cos(item.rotation);
      const s = Math.sin(item.rotation);
      v.set(
        item.position[0] + ax * c + az * s,
        TABLE.height + ay + (anims[item.id].current.y || 0),
        item.position[1] - ax * s + az * c
      );
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
  });
  return null;
}

/* drag anywhere to spin the focused item (with a little inertia) */
function useDragSpin(dragRef, focused) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    dragRef.current.angle = 0;
    dragRef.current.vel = 0;
  }, [focused, dragRef]);
  useEffect(() => {
    const el = gl.domElement;
    const d = dragRef.current;
    const down = (e) => {
      d.active = true;
      d.lastX = e.clientX;
      d.moved = 0;
    };
    const move = (e) => {
      if (!d.active) return;
      const dx = e.clientX - d.lastX;
      d.lastX = e.clientX;
      d.moved += Math.abs(dx);
      d.angle += dx * 0.012;
      d.vel = dx * 0.012 * 60;
    };
    const up = () => {
      d.active = false;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl, dragRef]);
  useFrame((_, dt) => {
    const d = dragRef.current;
    if (!d.active && Math.abs(d.vel) > 0.01) {
      d.angle += d.vel * Math.min(dt, 1 / 30);
      d.vel *= Math.exp(-3.5 * Math.min(dt, 1 / 30));
    }
  });
}

/* every so often, one idle item gives a little hop */
function Nudger({ nudgeRef, idle, reducedMotion }) {
  const next = useRef(6);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (reducedMotion || !idle) {
      next.current = t + 7;
      return;
    }
    if (t > next.current) {
      const pick = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      nudgeRef.current = { id: pick.id, at: t };
      next.current = t + 7 + Math.random() * 5;
    }
  });
  return null;
}

function Scene({
  hovered,
  focused,
  play,
  reducedMotion,
  panelInset,
  labelRefs,
  onHover,
  onSelect,
  onReady,
  onDpr,
  onSettled,
  dragRef,
}) {
  const nudgeRef = useRef({ id: null, at: 0 });
  /* the intro is over once every item has dropped onto the table */
  const landed = useRef(new Set());
  const land = useCallback(
    (id) => {
      landed.current.add(id);
      if (landed.current.size === ITEMS.length) onSettled?.();
    },
    [onSettled]
  );
  const anims = useMemo(
    () => Object.fromEntries(ITEMS.map((it) => [it.id, { current: { hover: 0, focus: 0, y: 0 } }])),
    []
  );
  useDragSpin(dragRef, focused);
  const focusedItem = focused ? ITEM_BY_ID[focused] : null;

  return (
    <>
      <color attach="background" args={[WALL_COLOR]} />
      <CameraRig
        focusedItem={focusedItem}
        play={play}
        reducedMotion={reducedMotion}
        panelInset={panelInset}
      />
      <Room />
      <Table />
      {ITEMS.map((item, i) => {
        const Model = MODELS[item.id];
        return (
          <Interactive
            key={item.id}
            item={item}
            index={i}
            hovered={hovered === item.id}
            focused={focused === item.id}
            play={play}
            reducedMotion={reducedMotion}
            dragRef={dragRef}
            nudgeRef={nudgeRef}
            anim={anims[item.id]}
            onHover={onHover}
            onSelect={onSelect}
            onLanded={land}
          >
            <Model anim={anims[item.id]} />
          </Interactive>
        );
      })}
      <LabelTracker labelRefs={labelRefs} anims={anims} />
      <Nudger nudgeRef={nudgeRef} idle={!hovered && !focused && play} reducedMotion={reducedMotion} />
      <Warmup onReady={onReady} onDpr={onDpr} />
    </>
  );
}

/**
 * The café table scene. All interaction state lives in the page; this
 * just renders it and reports pointer intent back up.
 */
function CafeScene({
  hovered = null,
  focused = null,
  play = true,
  paused = false,
  reducedMotion = false,
  panelInset = { x: 0, y: 0 },
  labelRefs,
  onHover,
  onSelect,
  onBackground,
  onReady,
  onSettled,
}) {
  const dragRef = useRef({ angle: 0, vel: 0, active: false, lastX: 0, moved: 0 });
  const fallbackLabels = useRef({});
  /* the warm-up lowers this if the device can't keep up at full sharpness */
  const [dpr, setDpr] = useState(startDpr);

  return (
    <Canvas
      shadows="percentage"
      dpr={dpr}
      frameloop={paused ? "never" : "always"}
      camera={{ fov: VIEW.fov, near: 0.5, far: 140, position: VIEW.intro.position }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
        /* the glasses refract a soft, plain wall: a half-res refraction pass is plenty */
        transmissionResolutionScale: 0.5,
      }}
      style={{ position: "absolute", inset: 0, touchAction: "none" }}
      onPointerMissed={() => {
        if (dragRef.current.moved < 6) onBackground?.();
      }}
    >
      <Scene
        hovered={hovered}
        focused={focused}
        play={play}
        reducedMotion={reducedMotion}
        panelInset={panelInset}
        labelRefs={labelRefs ?? fallbackLabels}
        onHover={onHover ?? (() => {})}
        onSelect={onSelect ?? (() => {})}
        onReady={onReady}
        onDpr={setDpr}
        onSettled={onSettled}
        dragRef={dragRef}
      />
    </Canvas>
  );
}

/* page-only state (intro labels, hints) shouldn't re-reconcile the 3D tree */
export default memo(CafeScene);
