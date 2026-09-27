import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ── scene constants ───────────────────────────────────────────── */
const DROP_Y = 6.4;        // fruits spawn this high above the cart
const GRAVITY = -13;
const RESTITUTION = 0.42;  // bounce energy kept on each landing
const CART_YAW = -0.3;     // whole cart angled for a 3/4 view
const SHOWCASE = [0.35, 2.95, 1.25]; // where a clicked fruit floats (cart space)

const IDENTITY_Q = new THREE.Quaternion();
const tmpVec = new THREE.Vector3();

/* basket dimensions (shared by cart + fruit slots) — shallow basket so
   the haul pokes out over the rim like a full grocery cart */
const BW = 1.62;   // half width  (x)
const BD = 0.82;   // half depth  (z)
const FLOOR_Y = 1.45;
const RIM_Y = 1.95;

/* ── tiny helpers ──────────────────────────────────────────────── */

/* a cylinder bar from point a to point b (cart frame, cherry stems…) */
function Bar({ from, to, r = 0.013, material }) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const d = b.clone().sub(a);
    const len = d.length();
    const pos = a.clone().add(b).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      d.normalize()
    );
    return { pos, quat, len };
  }, [...from, ...to]);
  return (
    <mesh position={pos} quaternion={quat} material={material} castShadow>
      <cylinderGeometry args={[r, r, len, 6]} />
    </mesh>
  );
}

function Leaf({ position, rotation = [0, 0, 0.5], scale = 1, color = "#7fae57" }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      <sphereGeometry args={[0.14, 8, 6]} />
      <meshStandardMaterial color={color} flatShading roughness={0.7} />
    </mesh>
  );
}

/* ── the fruits (procedural low-poly "assets") ─────────────────── */

function GrapeBunch() {
  const grapes = [
    [0, 0.2, 0], [0.16, 0.13, 0.08], [-0.16, 0.13, 0.05], [0.02, 0.12, -0.16],
    [0.04, 0.12, 0.17], [-0.06, -0.03, 0.13], [0.15, -0.03, -0.05],
    [-0.15, -0.02, -0.09], [0.04, -0.05, 0.01], [-0.01, -0.2, 0.05], [0.1, -0.19, -0.04],
  ];
  return (
    <group>
      {grapes.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[0.14, 10, 8]} />
          <meshStandardMaterial
            color={i % 2 ? "#9fc06f" : "#b0d084"}
            flatShading
            roughness={0.55}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.16, 6]} />
        <meshStandardMaterial color="#8a6f47" roughness={0.8} />
      </mesh>
    </group>
  );
}

function OrangeFruit() {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.33, 12, 9]} />
        <meshStandardMaterial color="#f2a03d" flatShading roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.07, 6]} />
        <meshStandardMaterial color="#7c5a34" roughness={0.8} />
      </mesh>
      <Leaf position={[0.1, 0.36, 0]} scale={[1.1, 0.25, 0.6]} />
    </group>
  );
}

function Blueberries() {
  const berries = [
    [-0.14, 0, 0.1, "#6279c0"],
    [0.17, -0.02, 0, "#54699f"],
    [0, 0.13, -0.09, "#6c86cc"],
  ];
  return (
    <group>
      {berries.map(([x, y, z, c], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh castShadow>
            <sphereGeometry args={[0.19, 10, 8]} />
            <meshStandardMaterial color={c} flatShading roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.17, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.03, 5]} />
            <meshStandardMaterial color="#3f4f7d" flatShading roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Cherries() {
  const stemMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#6f8a3d", roughness: 0.7 }),
    []
  );
  return (
    <group>
      <mesh position={[-0.16, -0.02, 0]} castShadow>
        <sphereGeometry args={[0.2, 11, 8]} />
        <meshStandardMaterial color="#c8385a" flatShading roughness={0.3} />
      </mesh>
      <mesh position={[0.18, -0.04, 0.05]} castShadow>
        <sphereGeometry args={[0.19, 11, 8]} />
        <meshStandardMaterial color="#b52e4e" flatShading roughness={0.3} />
      </mesh>
      <Bar from={[-0.16, 0.15, 0]} to={[0.02, 0.4, 0.02]} r={0.016} material={stemMat} />
      <Bar from={[0.18, 0.13, 0.05]} to={[0.02, 0.4, 0.02]} r={0.016} material={stemMat} />
      <Leaf position={[0.1, 0.4, 0.02]} scale={[0.9, 0.22, 0.5]} />
    </group>
  );
}

function AppleFruit() {
  return (
    <group>
      <mesh scale={[1, 0.88, 1]} castShadow>
        <sphereGeometry args={[0.34, 12, 9]} />
        <meshStandardMaterial color="#d0454f" flatShading roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.32, 0]} rotation={[0, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.02, 0.025, 0.16, 6]} />
        <meshStandardMaterial color="#7c5a34" roughness={0.8} />
      </mesh>
      <Leaf position={[0.12, 0.36, 0]} scale={[1.1, 0.25, 0.6]} />
    </group>
  );
}

function Strawberry() {
  /* seeds sprinkled around the cone body with a golden-angle spiral */
  const seeds = useMemo(() => {
    const out = [];
    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      const a = i * 2.39996;
      const y = 0.08 - t * 0.34;
      const r = 0.265 * (1 - t * 0.75) + 0.005;
      out.push([Math.cos(a) * r, y, Math.sin(a) * r]);
    }
    return out;
  }, []);
  return (
    <group>
      {/* cone body, point down */}
      <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.27, 0.44, 9]} />
        <meshStandardMaterial color="#e0475c" flatShading roughness={0.45} />
      </mesh>
      {/* rounded top dome */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <sphereGeometry args={[0.27, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e0475c" flatShading roughness={0.45} />
      </mesh>
      {seeds.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.018, 5, 4]} />
          <meshStandardMaterial color="#f7e8a0" roughness={0.6} />
        </mesh>
      ))}
      {/* calyx */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.13, 0.24, Math.sin(a) * 0.13]}
            rotation={[Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9]}
            castShadow
          >
            <coneGeometry args={[0.06, 0.18, 5]} />
            <meshStandardMaterial color="#6f9a48" flatShading roughness={0.6} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, 0.12, 5]} />
        <meshStandardMaterial color="#6f9a48" roughness={0.7} />
      </mesh>
    </group>
  );
}

function LemonFruit() {
  return (
    <group>
      <mesh scale={[1.3, 0.85, 0.85]} castShadow>
        <sphereGeometry args={[0.3, 12, 9]} />
        <meshStandardMaterial color="#f4d34f" flatShading roughness={0.55} />
      </mesh>
      <mesh position={[0.41, 0, 0]} castShadow>
        <sphereGeometry args={[0.06, 6, 5]} />
        <meshStandardMaterial color="#e8c53e" flatShading roughness={0.55} />
      </mesh>
      <mesh position={[-0.41, 0, 0]} castShadow>
        <sphereGeometry args={[0.06, 6, 5]} />
        <meshStandardMaterial color="#e8c53e" flatShading roughness={0.55} />
      </mesh>
    </group>
  );
}

function KiwiHalf() {
  const seeds = useMemo(() => {
    const out = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      out.push([Math.cos(a) * 0.17, 0.115, Math.sin(a) * 0.17]);
    }
    return out;
  }, []);
  return (
    /* tilted so the seedy cross-section faces the camera like an iris */
    <group rotation={[1.05, 0.3, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 14]} />
        <meshStandardMaterial color="#8a6f47" flatShading roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.104, 0]}>
        <cylinderGeometry args={[0.285, 0.285, 0.015, 14]} />
        <meshStandardMaterial color="#9dc45f" flatShading roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.115, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.01, 10]} />
        <meshStandardMaterial color="#f2f0d8" roughness={0.5} />
      </mesh>
      {seeds.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.014, 4, 4]} />
          <meshStandardMaterial color="#2e2a20" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* fruit roster — order matches the interests array on the page.
   slot = resting spot in the basket, restY = resting center height,
   delay = when it starts falling (staggered "grocery haul") */
const FRUITS = [
  { key: "grapes", name: "green grapes", emoji: "🍇", Comp: GrapeBunch, slot: [-0.36, -0.38], restY: 1.85, delay: 0.15 },
  { key: "orange", name: "orange", emoji: "🍊", Comp: OrangeFruit, slot: [-1.08, -0.38], restY: 1.81, delay: 1.35 },
  { key: "blueberries", name: "blueberries", emoji: "🫐", Comp: Blueberries, slot: [0.36, 0.4], restY: 1.7, delay: 0.7 },
  { key: "cherries", name: "cherries", emoji: "🍒", Comp: Cherries, slot: [-0.36, 0.4], restY: 1.72, delay: 2.15 },
  { key: "apple", name: "apple", emoji: "🍎", Comp: AppleFruit, slot: [1.08, -0.38], restY: 1.78, delay: 0.4 },
  { key: "strawberry", name: "strawberry", emoji: "🍓", Comp: Strawberry, slot: [-1.08, 0.4], restY: 1.8, delay: 1.75 },
  { key: "lemon", name: "lemon", emoji: "🍋", Comp: LemonFruit, slot: [0.36, -0.38], restY: 1.74, delay: 1.0 },
  { key: "kiwi", name: "kiwi", emoji: "🥝", Comp: KiwiHalf, slot: [1.08, 0.4], restY: 1.78, delay: 2.5 },
];

/* ── falling / interaction wrapper around each fruit ───────────── */
function FallingFruit({ def, index, active, hovered, onHover, onSelect, children }) {
  const group = useRef();
  const inner = useRef();
  const st = useRef({
    t: -def.delay,
    y: DROP_Y + (index % 3) * 0.5,
    vy: 0,
    landed: false,
    axis: new THREE.Vector3(
      Math.sin(index * 1.7) || 0.4,
      0.35,
      Math.cos(index * 2.3)
    ).normalize(),
    spin: 2.4 + (index % 4) * 0.7,
    dq: new THREE.Quaternion(),
  });

  useEffect(() => {
    inner.current?.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.033);
    const s = st.current;
    const g = group.current;
    const inn = inner.current;
    if (!g || !inn) return;

    /* waiting for this fruit's turn to drop */
    if (s.t < 0) {
      s.t += dt;
      g.visible = false;
      g.position.set(def.slot[0], s.y, def.slot[1]);
      return;
    }
    g.visible = true;

    if (!s.landed) {
      /* free fall with tumbling, then bounce until settled */
      s.vy += GRAVITY * dt;
      s.y += s.vy * dt;
      if (s.y <= def.restY) {
        s.y = def.restY;
        s.vy = -s.vy * RESTITUTION;
        s.spin *= 0.45;
        if (s.vy < 1.15) {
          s.landed = true;
          s.vy = 0;
        }
      }
      g.position.set(def.slot[0], s.y, def.slot[1]);
      s.dq.setFromAxisAngle(s.axis, s.spin * dt);
      inn.quaternion.premultiply(s.dq);
    } else {
      /* settled: glide between basket slot and the showcase spot */
      const k = 1 - Math.pow(0.002, dt);
      if (active) {
        tmpVec.set(SHOWCASE[0], SHOWCASE[1], SHOWCASE[2]);
        g.position.lerp(tmpVec, k);
        s.dq.setFromAxisAngle(tmpVec.set(0, 1, 0).normalize(), 0.9 * dt);
        inn.quaternion.premultiply(s.dq);
      } else {
        tmpVec.set(def.slot[0], def.restY, def.slot[1]);
        g.position.lerp(tmpVec, k);
        inn.quaternion.slerp(IDENTITY_Q, 1 - Math.pow(0.0015, dt));
      }
    }

    /* hover / active pop */
    const targetScale = active ? 1.18 : hovered ? 1.12 : 1;
    g.scale.setScalar(g.scale.x + (targetScale - g.scale.x) * (1 - Math.pow(0.001, dt)));
  });

  return (
    <group
      ref={group}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (st.current.landed) {
          onHover(index);
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (st.current.landed) onSelect(index);
      }}
    >
      <group ref={inner}>{children}</group>
    </group>
  );
}

/* ── the shopping cart ─────────────────────────────────────────── */
function Cart() {
  const mats = useMemo(
    () => ({
      metal: new THREE.MeshStandardMaterial({ color: "#d3dbd6", metalness: 0.2, roughness: 0.45 }),
      metalDark: new THREE.MeshStandardMaterial({ color: "#bcc6c0", metalness: 0.2, roughness: 0.5 }),
      grip: new THREE.MeshStandardMaterial({ color: "#8db860", roughness: 0.55 }),
      wheel: new THREE.MeshStandardMaterial({ color: "#5c5c5c", roughness: 0.65 }),
      hub: new THREE.MeshStandardMaterial({ color: "#9c9c9c", metalness: 0.4, roughness: 0.4 }),
    }),
    []
  );

  const wallH = RIM_Y - FLOOR_Y;
  const wireGeo = useMemo(() => new THREE.CylinderGeometry(0.013, 0.013, wallH, 6), [wallH]);

  const verticals = useMemo(() => {
    const out = [];
    for (let i = 0; i <= 16; i++) {
      const x = -1.5 + (i * 3) / 16;
      out.push([x, BD], [x, -BD]);
    }
    for (let i = 1; i <= 6; i++) {
      const z = -0.66 + (i * 1.32) / 7;
      out.push([BW, z], [-BW, z]);
    }
    return out;
  }, []);

  const midY = FLOOR_Y + wallH / 2;

  return (
    <group>
      {/* rim + mid rails */}
      {[RIM_Y, FLOOR_Y + wallH * 0.45].map((y, i) => {
        const t = i === 0 ? 0.055 : 0.03;
        return (
          <group key={y}>
            <mesh position={[0, y, BD]} material={mats.metal} castShadow>
              <boxGeometry args={[BW * 2 + t, t, t]} />
            </mesh>
            <mesh position={[0, y, -BD]} material={mats.metal} castShadow>
              <boxGeometry args={[BW * 2 + t, t, t]} />
            </mesh>
            <mesh position={[BW, y, 0]} material={mats.metal} castShadow>
              <boxGeometry args={[t, t, BD * 2 + t]} />
            </mesh>
            <mesh position={[-BW, y, 0]} material={mats.metal} castShadow>
              <boxGeometry args={[t, t, BD * 2 + t]} />
            </mesh>
          </group>
        );
      })}

      {/* vertical wires */}
      {verticals.map(([x, z], i) => (
        <mesh key={i} position={[x, midY, z]} geometry={wireGeo} material={mats.metalDark} />
      ))}

      {/* basket floor */}
      <mesh position={[0, FLOOR_Y, 0]} material={mats.metalDark} receiveShadow>
        <boxGeometry args={[BW * 2 - 0.06, 0.05, BD * 2 - 0.06]} />
      </mesh>

      {/* handle */}
      <Bar from={[1.45, RIM_Y, -BD]} to={[1.32, 2.55, -1.42]} r={0.035} material={mats.metal} />
      <Bar from={[-1.45, RIM_Y, -BD]} to={[-1.32, 2.55, -1.42]} r={0.035} material={mats.metal} />
      <mesh position={[0, 2.55, -1.42]} rotation={[0, 0, Math.PI / 2]} material={mats.grip} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 2.75, 10]} />
      </mesh>

      {/* chassis legs */}
      <Bar from={[1.15, FLOOR_Y, -0.5]} to={[1.3, 0.32, -0.62]} r={0.028} material={mats.metal} />
      <Bar from={[-1.15, FLOOR_Y, -0.5]} to={[-1.3, 0.32, -0.62]} r={0.028} material={mats.metal} />
      <Bar from={[1.15, FLOOR_Y, 0.5]} to={[1.3, 0.32, 0.62]} r={0.028} material={mats.metal} />
      <Bar from={[-1.15, FLOOR_Y, 0.5]} to={[-1.3, 0.32, 0.62]} r={0.028} material={mats.metal} />

      {/* lower tray */}
      <mesh position={[0, 0.62, 0]} material={mats.metalDark} castShadow>
        <boxGeometry args={[2.4, 0.04, 1.26]} />
      </mesh>

      {/* wheels */}
      {[
        [1.3, 0.62],
        [-1.3, 0.62],
        [1.3, -0.62],
        [-1.3, -0.62],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.17, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={mats.wheel} castShadow>
            <cylinderGeometry args={[0.17, 0.17, 0.08, 12]} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} material={mats.hub}>
            <cylinderGeometry args={[0.07, 0.07, 0.09, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* keeps the whole cart in frame on narrow screens by pulling back */
const LOOK_AT = [0.1, 1.7, 0];
const CAM_DIR = [0.2, 2.1, 6.2]; // offset from LOOK_AT at the design aspect
const DESIGN_ASPECT = 600 / 440;

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const f = Math.max(1, Math.pow(DESIGN_ASPECT / aspect, 0.8));
    camera.position.set(
      LOOK_AT[0] + CAM_DIR[0] * f,
      LOOK_AT[1] + CAM_DIR[1] * f,
      LOOK_AT[2] + CAM_DIR[2] * f
    );
    camera.lookAt(LOOK_AT[0], LOOK_AT[1], LOOK_AT[2]);
  }, [camera, size]);
  return null;
}

/* ── assembled scene ───────────────────────────────────────────── */
function Scene({ active, onSelect, hovered, onHover, seed }) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <hemisphereLight args={["#ffffff", "#e4ecd6", 0.6]} />
      <directionalLight
        position={[5, 9, 5]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={10}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={30}
      />

      <group rotation-y={CART_YAW}>
        <Cart />
        <group key={seed}>
          {FRUITS.map((f, i) => (
            <FallingFruit
              key={f.key}
              def={f}
              index={i}
              active={active === i}
              hovered={hovered === i}
              onHover={onHover}
              onSelect={onSelect}
            >
              <f.Comp />
            </FallingFruit>
          ))}
        </group>
      </group>

      {/* soft ground shadow */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <shadowMaterial transparent opacity={0.15} />
      </mesh>
    </>
  );
}

/* ── exported component: canvas + hover chip ───────────────────── */
export default function FruitCart3D({ interests, active, setActive, seed = 0 }) {
  const [hovered, setHovered] = useState(null);

  const onSelect = (i) => setActive(active === i ? null : i);

  return (
    <div style={{ width: "min(600px, 100%)", height: 440, margin: "0 auto", position: "relative" }}>
      {/* hovered-fruit label chip */}
      <div
        style={{
          position: "absolute",
          top: 2,
          left: "50%",
          transform: `translateX(-50%) translateY(${hovered !== null ? 0 : 6}px)`,
          opacity: hovered !== null ? 1 : 0,
          transition: "opacity 0.25s ease, transform 0.25s ease",
          background: "rgba(255,255,255,0.92)",
          border: "1px solid rgba(141,184,96,0.35)",
          borderRadius: 999,
          padding: "6px 16px",
          boxShadow: "0 4px 14px rgba(90,110,50,0.14)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          letterSpacing: 0.5,
          color: "#6a9a3a",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 30,
        }}
      >
        {hovered !== null
          ? `${FRUITS[hovered].emoji} ${interests[hovered].label}`
          : " "}
      </div>

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0.3, 3.8, 6.2], fov: 35 }}
        gl={{ alpha: true, antialias: true, toneMapping: THREE.NoToneMapping }}
        style={{ background: "transparent" }}
      >
        <ResponsiveCamera />
        <Scene
          active={active}
          onSelect={onSelect}
          hovered={hovered}
          onHover={setHovered}
          seed={seed}
        />
      </Canvas>
    </div>
  );
}
