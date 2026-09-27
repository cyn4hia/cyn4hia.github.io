import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { makeWood } from "./textures";
import { TABLE } from "./config";

const noRaycast = () => null;

/* square leg that narrows toward the floor */
function taperedLeg(w, h, taper) {
  const g = new THREE.BoxGeometry(w, h, w);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) < 0) {
      pos.setX(i, pos.getX(i) * taper);
      pos.setZ(i, pos.getZ(i) * taper);
    }
  }
  g.computeVertexNormals();
  return g;
}

/**
 * Honey-oak table: a glued-up four-board top with softened edges,
 * a slim apron and tapered legs.
 */
export default function Table() {
  const { W, D, H, T, legW, legX, legZ, legH, geo, mats } = useMemo(() => {
    const W = TABLE.width;
    const D = TABLE.depth;
    const H = TABLE.height;
    const T = TABLE.thickness;
    const legW = 0.46;
    const inset = 0.42;
    const legX = W / 2 - inset - legW / 2;
    const legZ = D / 2 - inset - legW / 2;
    const legH = H - T;

    const top = makeWood({ width: 2048, height: 512, boards: 4, seed: 3 });
    top.map.repeat.set(1.5, 1);
    top.bump.repeat.set(1.5, 1);
    const topMat = new THREE.MeshPhysicalMaterial({
      map: top.map,
      bumpMap: top.bump,
      bumpScale: 0.9,
      roughness: 0.5,
      clearcoat: 0.35,
      clearcoatRoughness: 0.32,
    });
    const edgeMap = top.map.clone();
    edgeMap.repeat.set(1.5, 0.25);
    const edgeMat = new THREE.MeshPhysicalMaterial({
      map: edgeMap,
      roughness: 0.52,
      clearcoat: 0.25,
      clearcoatRoughness: 0.4,
    });

    const leg = makeWood({ width: 128, height: 1024, boards: 1, vertical: true, seed: 5 });
    const legMat = new THREE.MeshStandardMaterial({
      map: leg.map,
      bumpMap: leg.bump,
      bumpScale: 0.6,
      roughness: 0.52,
    });
    const apronMap = top.map.clone();
    apronMap.repeat.set(1.2, 0.25);
    const apronMat = new THREE.MeshStandardMaterial({ map: apronMap, roughness: 0.55 });

    return {
      W,
      D,
      H,
      T,
      legW,
      legX,
      legZ,
      legH,
      geo: {
        top: new RoundedBoxGeometry(W, T, D, 4, 0.09),
        leg: taperedLeg(legW, legH, 0.68),
      },
      mats: {
        top: [edgeMat, edgeMat, topMat, edgeMat, edgeMat, edgeMat],
        leg: legMat,
        apron: apronMat,
      },
    };
  }, []);

  const apronH = 0.6;
  const apronT = 0.12;
  const apronY = H - T - apronH / 2;

  return (
    <group>
      <mesh
        geometry={geo.top}
        material={mats.top}
        position={[0, H - T / 2, 0]}
        castShadow
        receiveShadow
        raycast={noRaycast}
      />

      {/* apron */}
      {[1, -1].map((s) => (
        <mesh
          key={`fz${s}`}
          position={[0, apronY, s * (legZ + legW / 2 - apronT / 2 - 0.03)]}
          material={mats.apron}
          castShadow
          receiveShadow
          raycast={noRaycast}
        >
          <boxGeometry args={[legX * 2, apronH, apronT]} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <mesh
          key={`fx${s}`}
          position={[s * (legX + legW / 2 - apronT / 2 - 0.03), apronY, 0]}
          material={mats.apron}
          castShadow
          receiveShadow
          raycast={noRaycast}
        >
          <boxGeometry args={[apronT, apronH, legZ * 2]} />
        </mesh>
      ))}

      {/* legs */}
      {[
        [legX, legZ],
        [-legX, legZ],
        [legX, -legZ],
        [-legX, -legZ],
      ].map(([x, z]) => (
        <mesh
          key={`${x},${z}`}
          geometry={geo.leg}
          material={mats.leg}
          position={[x, legH / 2, z]}
          castShadow
          receiveShadow
          raycast={noRaycast}
        />
      ))}
    </group>
  );
}
