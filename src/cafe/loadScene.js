/* the 3D scene (and three.js with it) is code-split; App starts fetching
   it while the splash is up, HomePage renders it when it lands */
let pending = null;
export const loadCafeScene = () => (pending ??= import("./CafeScene"));
