import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeSteamNoise } from "./textures";

let noiseTex = null;
const getNoise = () => (noiseTex ??= makeSteamNoise(128));

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uWind;
  uniform sampler2D uNoise;
  varying vec2 vUv;

  vec2 rotate2D(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, s, -s, c) * v;
  }

  void main() {
    vec3 p = position;
    /* twist the ribbon around its axis, more the higher it drifts */
    float twist = texture2D(uNoise, vec2(0.5 + uSeed, uv.y * 0.2 - uTime * 0.005)).r;
    p.xz = rotate2D(p.xz, twist * 8.0);
    vec2 wind = vec2(
      texture2D(uNoise, vec2(0.25 + uSeed, uTime * 0.01)).r - 0.5,
      texture2D(uNoise, vec2(0.75 + uSeed, uTime * 0.01)).r - 0.5
    );
    p.xz += wind * pow(uv.y, 2.0) * uWind;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform sampler2D uNoise;
  varying vec2 vUv;

  void main() {
    vec2 suv = vUv;
    suv.x = suv.x * 0.5 + uSeed;
    suv.y = suv.y * 0.3 - uTime * 0.035;
    float s = texture2D(uNoise, suv).r;
    s = smoothstep(0.45, 1.0, s);
    s *= smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
    s *= smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.42, vUv.y);
    gl_FragColor = vec4(uColor, s * uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Curling wisp of steam: a twisted, noise-scrolled ribbon.
 * `opacity` can be a number or a ref ({ current }) for animated strength.
 */
export default function Steam({
  position = [0, 0, 0],
  width = 0.8,
  height = 2,
  opacity = 0.4,
  seed = 0,
  wind = 6,
  speed = 1,
  color = "#fffaf2",
}) {
  const mat = useRef();
  const mesh = useRef();
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, 16, 64);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSeed: { value: seed },
      uWind: { value: wind },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uNoise: { value: getNoise() },
    }),
    [seed, wind, color]
  );

  useFrame((_, dt) => {
    const u = mat.current.uniforms;
    u.uTime.value += dt * speed;
    u.uOpacity.value = typeof opacity === "number" ? opacity : opacity.current;
    mesh.current.visible = u.uOpacity.value > 0.002; // don't draw invisible steam
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      position={position}
      scale={[width, height, width]}
      renderOrder={10}
      raycast={() => null}
    >
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
