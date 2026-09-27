import * as THREE from "three";
import { makeFoam, makeGlaze, makePowder, makeTinLabel, makeWood } from "./textures";

/*
 * Shared materials, built once on first use. Items import getMaterials()
 * instead of making their own so the GPU sees as few programs as possible.
 */
let cache = null;

export function getMaterials() {
  if (cache) return cache;

  const bamboo = makeWood({
    width: 64,
    height: 512,
    boards: 1,
    vertical: true,
    seed: 21,
    light: [232, 212, 160],
    mid: [216, 190, 130],
    dark: [176, 142, 84],
  });
  const walnut = makeWood({
    width: 512,
    height: 128,
    boards: 1,
    seed: 31,
    light: [132, 88, 56],
    mid: [104, 66, 40],
    dark: [60, 36, 20],
  });
  const foam = makeFoam();
  foam.center.set(0.5, 0.5); // so the swirl spins around the middle
  const kettleBlack = {
    color: "#252528",
    roughness: 0.46,
    clearcoat: 0.35,
    clearcoatRoughness: 0.5,
  };

  cache = {
    bamboo: new THREE.MeshStandardMaterial({ map: bamboo.map, roughness: 0.5 }),
    tine: new THREE.MeshStandardMaterial({ color: "#e4cf98", roughness: 0.62 }),
    thread: new THREE.MeshStandardMaterial({ color: "#2a2420", roughness: 0.85 }),

    glaze: new THREE.MeshPhysicalMaterial({
      map: makeGlaze(),
      roughness: 0.4,
      clearcoat: 0.85,
      clearcoatRoughness: 0.2,
    }),
    foam: new THREE.MeshStandardMaterial({ map: foam, roughness: 0.6 }),

    powder: new THREE.MeshStandardMaterial({ map: makePowder(), roughness: 0.95 }),
    label: new THREE.MeshStandardMaterial({ map: makeTinLabel(), roughness: 0.72 }),
    tinLid: new THREE.MeshPhysicalMaterial({
      color: "#58733a",
      roughness: 0.38,
      metalness: 0.3,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
    }),
    tinMetal: new THREE.MeshStandardMaterial({ color: "#cfc9bd", roughness: 0.3, metalness: 1 }),
    gold: new THREE.MeshStandardMaterial({ color: "#d4ae68", roughness: 0.28, metalness: 1 }),

    kettle: new THREE.MeshPhysicalMaterial(kettleBlack),
    kettleInside: new THREE.MeshPhysicalMaterial({ ...kettleBlack, side: THREE.DoubleSide }),
    steel: new THREE.MeshStandardMaterial({ color: "#d6d4d0", roughness: 0.22, metalness: 1 }),
    walnut: new THREE.MeshStandardMaterial({ map: walnut.map, roughness: 0.42 }),
    dial: new THREE.MeshStandardMaterial({ color: "#2e2e31", roughness: 0.35, metalness: 0.6 }),

    glass: new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      transmission: 1,
      thickness: 0.35,
      roughness: 0.06,
      ior: 1.5,
      specularIntensity: 1,
      envMapIntensity: 2.6,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      attenuationColor: new THREE.Color("#dfe8d2"),
      attenuationDistance: 1.2,
    }),
    milk: new THREE.MeshPhysicalMaterial({
      color: "#f3eee3",
      roughness: 0.28,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    }),
    swirl: new THREE.MeshPhysicalMaterial({ color: "#c7d79c", roughness: 0.3, clearcoat: 0.5 }),
    matcha: new THREE.MeshPhysicalMaterial({
      color: "#76a03a",
      roughness: 0.32,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    }),
    ice: new THREE.MeshPhysicalMaterial({
      color: "#f7fcff",
      roughness: 0.08,
      transparent: true,
      opacity: 0.5,
      clearcoat: 1,
      ior: 1.31,
      depthWrite: false,
    }),
  };
  return cache;
}
