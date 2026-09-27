import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { makeBlob, makeDot, makePlaster, makeWindowCookie, makeWood } from "./textures";
import { TABLE, WALL_Z } from "./config";

export const WALL_COLOR = "#eadcc8";

/* a warm, softly lit room captured into an environment map so glass,
   glaze and the kettle all pick up believable reflections */
function makeEnvScene() {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(24, 14, 24),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("#b9a38a").multiplyScalar(0.55), side: THREE.BackSide })
  );
  room.position.y = 5;
  scene.add(room);
  const panel = (w, h, color, power, pos, rot) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide })
    );
    m.position.set(...pos);
    m.rotation.set(...rot);
    scene.add(m);
  };
  panel(7, 6, "#fff0d8", 7, [-11.8, 6, 3], [0, Math.PI / 2, 0]); // the window
  panel(14, 14, "#fff6ea", 1.1, [0, 11.8, 0], [Math.PI / 2, 0, 0]); // ceiling bounce
  panel(20, 6, "#e9d4b8", 0.9, [0, 2, -11.8], [0, 0, 0]); // back wall
  panel(10, 5, "#ffe8cc", 1.3, [11.8, 5, 2], [0, -Math.PI / 2, 0]); // room fill
  panel(20, 20, "#b98f64", 0.5, [0, -1.9, 0], [-Math.PI / 2, 0, 0]); // warm floor bounce
  return scene;
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const envScene = makeEnvScene();
    const rt = pmrem.fromScene(envScene, 0.035);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.65;
    envScene.traverse((o) => {
      if (o.isMesh) {
        o.geometry.dispose();
        o.material.dispose();
      }
    });
    return () => {
      scene.environment = null;
      rt.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/* afternoon sun through a window just out of frame to the left */
function Sun() {
  const light = useRef();
  const cookie = useMemo(() => makeWindowCookie(512), []);
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-0.6, 8.6, -2.0);
    return o;
  }, []);

  useEffect(() => {
    light.current.target = target;
    target.updateMatrixWorld();
  }, [target]);

  useFrame((state) => cookie.update(state.clock.elapsedTime));

  return (
    <>
      <primitive object={target} />
      <spotLight
        ref={light}
        position={[-17, 21, 12]}
        angle={0.375}
        penumbra={0}
        decay={0}
        intensity={9}
        color="#ffd9a8"
        map={cookie.texture}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00025}
        shadow-normalBias={0.025}
        shadow-radius={3}
        shadow-camera-near={14}
        shadow-camera-far={48}
      />
    </>
  );
}

/* a few motes of dust drifting through the sunbeam */
function Dust({ count = 70 }) {
  const points = useRef();
  const { geometry, seeds } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seeds = [];
    for (let i = 0; i < count; i++) {
      const s = {
        x: -7 + Math.random() * 11,
        y: 7.6 + Math.random() * 6,
        z: -2.8 + Math.random() * 5,
        p: Math.random() * Math.PI * 2,
        r: 0.3 + Math.random() * 0.5,
      };
      seeds.push(s);
      pos.set([s.x, s.y, s.z], i * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geometry: g, seeds };
  }, [count]);
  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: makeDot(),
        color: "#fff1d6",
        size: 0.07,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    []
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const arr = geometry.attributes.position.array;
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      arr[i * 3] = s.x + Math.sin(t * 0.13 * s.r + s.p) * 0.9;
      arr[i * 3 + 1] = s.y + Math.sin(t * 0.09 * s.r + s.p * 2) * 0.6;
      arr[i * 3 + 2] = s.z + Math.cos(t * 0.11 * s.r + s.p) * 0.5;
    }
    geometry.attributes.position.needsUpdate = true;
  });
  return <points ref={points} geometry={geometry} material={material} raycast={() => null} />;
}

export default function Room() {
  const mats = useMemo(() => {
    const plaster = makePlaster(512);
    plaster.map.repeat.set(5, 2.5);
    plaster.bump.repeat.set(5, 2.5);
    const wall = new THREE.MeshStandardMaterial({
      color: WALL_COLOR,
      map: plaster.map,
      bumpMap: plaster.bump,
      bumpScale: 1.2,
      roughness: 0.93,
    });

    const planks = makeWood({
      width: 768,
      height: 1024,
      boards: 5,
      vertical: true,
      seed: 12,
      light: [198, 178, 154],
      mid: [188, 167, 142],
      dark: [168, 146, 120],
    });
    planks.map.repeat.set(6, 1.2);
    planks.bump.repeat.set(6, 1.2);
    const floor = new THREE.MeshStandardMaterial({
      map: planks.map,
      bumpMap: planks.bump,
      bumpScale: 0.5,
      roughness: 0.78,
    });

    const trim = new THREE.MeshStandardMaterial({ color: "#f3ede3", roughness: 0.55 });
    const blob = new THREE.MeshBasicMaterial({
      map: makeBlob(),
      transparent: true,
      depthWrite: false,
      opacity: 0.38,
      toneMapped: false,
    });
    return { wall, floor, trim, blob };
  }, []);

  return (
    <group>
      <Environment />
      <Sun />
      <hemisphereLight args={["#fff5e8", "#a88a68", 0.45]} />
      <directionalLight position={[14, 12, 16]} intensity={0.45} color="#ffe6cc" />

      {/* back wall */}
      <mesh position={[0, 14, WALL_Z]} material={mats.wall} receiveShadow raycast={() => null}>
        <planeGeometry args={[70, 28]} />
      </mesh>
      {/* floor */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0, WALL_Z + 20]}
        material={mats.floor}
        receiveShadow
        raycast={() => null}
      >
        <planeGeometry args={[70, 40]} />
      </mesh>
      {/* skirting board */}
      <mesh position={[0, 0.42, WALL_Z + 0.06]} material={mats.trim} receiveShadow raycast={() => null}>
        <boxGeometry args={[70, 0.84, 0.12]} />
      </mesh>
      {/* soft occlusion under the table */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0.01, 0]}
        material={mats.blob}
        raycast={() => null}
      >
        <planeGeometry args={[TABLE.width * 1.45, TABLE.depth * 1.9]} />
      </mesh>

      <Dust />
    </group>
  );
}
