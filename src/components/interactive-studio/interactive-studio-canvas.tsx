import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  ACESFilmicToneMapping,
  CatmullRomCurve3,
  Color,
  Group,
  MathUtils,
  Mesh,
  SRGBColorSpace,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import type { StudioInput, StudioZoneId } from "./interactive-studio-hero";

type StudioCanvasProps = {
  darkMode: boolean;
  reducedMotion: boolean;
  inView: boolean;
  inputRef: RefObject<StudioInput>;
  onZoneChange: (zone: StudioZoneId | null) => void;
};

type Zone = {
  id: StudioZoneId;
  position: [number, number, number];
  color: string;
};

const ZONES: Zone[] = [
  { id: "about", position: [-4.8, 0.03, 0.8], color: "#49a8ff" },
  { id: "skills", position: [4.6, 0.03, -3.6], color: "#38bdf8" },
  { id: "certifications", position: [-4.6, 0.03, -8.9], color: "#6aaeff" },
  { id: "services", position: [4.9, 0.03, -13.4], color: "#278cff" },
  { id: "portfolio", position: [-3.8, 0.03, -18.8], color: "#57b8ff" },
  { id: "contact", position: [3.8, 0.03, -24], color: "#30a7e8" },
];

const START_POSITION = new Vector3(0, 0, 5);

const FOREST_OBJECTS = Array.from({ length: 48 }, (_, index) => {
  const rightSide = index % 4 === 0;
  const row = Math.floor(index / 2);
  return {
    x: rightSide ? 2.2 + (index % 4) * 1.12 : -2.1 - (index % 6) * 0.96,
    z: 4.6 - row * 1.36 + ((index * 7) % 5) * 0.24,
    scale: 0.72 + ((index * 11) % 7) * 0.07,
    light: index % 3 === 0,
  };
});

const HILL_OBJECTS: Array<[number, number, number]> = [
  [-7.6, 2.4, 1.25],
  [-7.3, -13.8, 1.65],
  [-6.8, -22.7, 1.4],
  [6.7, 1.2, 0.88],
  [6.8, -9.4, 1.05],
  [7.1, -21.4, 0.92],
];

const STATION_OBJECTS = ZONES.map((zone, index) => ({
  x: zone.position[0] + (index % 2 === 0 ? -1 : 1) * 1.9,
  z: zone.position[2],
}));

const LAMP_OBJECTS = Array.from({ length: 12 }, (_, index) => ({
  x: (index % 2 === 0 ? -1 : 1) * 2.75,
  z: -0.5 - Math.floor(index / 2) * 5.1,
}));

const WORLD_CIRCLE_COLLIDERS = [
  ...FOREST_OBJECTS.map((tree) => ({
    x: tree.x,
    z: tree.z,
    radius: 0.28 + tree.scale * 0.16,
  })),
  ...HILL_OBJECTS.map(([x, z, scale]) => ({ x, z, radius: scale * 0.82 + 0.2 })),
  ...LAMP_OBJECTS.map(({ x, z }) => ({ x, z, radius: 0.34 })),
  { x: 7.15, z: -17.8, radius: 1.22 },
];

const WORLD_BOX_COLLIDERS = STATION_OBJECTS.map(({ x, z }) => ({
  x,
  z,
  halfWidth: 1.12,
  halfDepth: 0.36,
}));

function isWorldBlocked(x: number, z: number) {
  const hitsCircle = WORLD_CIRCLE_COLLIDERS.some(
    (collider) => Math.hypot(x - collider.x, z - collider.z) < collider.radius,
  );
  if (hitsCircle) return true;

  const hitsStructure = WORLD_BOX_COLLIDERS.some(
    (collider) =>
      Math.abs(x - collider.x) < collider.halfWidth &&
      Math.abs(z - collider.z) < collider.halfDepth,
  );
  if (hitsStructure) return true;

  const insideStream = z > -16.18 && z < -15.12;
  const onBridge = x > -0.68 && x < 0.98;
  return insideStream && !onBridge;
}

type TrailSegment = {
  key: string;
  position: [number, number, number];
  rotation: number;
  length: number;
};

function createTrailSegments(
  points: Array<[number, number]>,
  samples: number,
  keyPrefix: string,
): TrailSegment[] {
  const curve = new CatmullRomCurve3(
    points.map(([x, z]) => new Vector3(x, 0, z)),
    false,
    "catmullrom",
    0.34,
  );
  const sampled = curve.getPoints(samples);

  return sampled.slice(1).map((point, index) => {
    const previous = sampled[index];
    if (!previous) {
      return { key: `${keyPrefix}-${index}`, position: [0, 0, 0], rotation: 0, length: 0 };
    }
    const dx = point.x - previous.x;
    const dz = point.z - previous.z;
    return {
      key: `${keyPrefix}-${index}`,
      position: [(point.x + previous.x) / 2, 0.025, (point.z + previous.z) / 2],
      rotation: Math.atan2(dx, dz),
      length: Math.hypot(dx, dz) + 0.18,
    };
  });
}

function useKeyboard() {
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const update = (event: KeyboardEvent, pressed: boolean) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
      }
      keys.current[event.code] = pressed;
    };
    const down = (event: KeyboardEvent) => update(event, true);
    const up = (event: KeyboardEvent) => update(event, false);
    const clear = () => {
      keys.current = {};
    };

    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  return keys;
}

function DigitalEngineer({
  inputRef,
  positionRef,
  reducedMotion,
  darkMode,
}: {
  inputRef: RefObject<StudioInput>;
  positionRef: RefObject<Vector3>;
  reducedMotion: boolean;
  darkMode: boolean;
}) {
  const rootRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const keys = useKeyboard();
  const direction = useMemo(() => new Vector3(), []);
  const skin = darkMode ? "#c88968" : "#b97556";
  const jacket = darkMode ? "#101d31" : "#18385e";
  const jacketEdge = darkMode ? "#1e4774" : "#275d94";
  const trousers = darkMode ? "#08111f" : "#122742";

  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.position.copy(START_POSITION);
    positionRef.current?.copy(START_POSITION);
  }, [positionRef]);

  useFrame((state, frameDelta) => {
    const root = rootRef.current;
    const input = inputRef.current;
    if (!root || !input) return;

    if (input.spawn) {
      root.position.set(input.spawn.x, 0, input.spawn.z);
      root.rotation.y = 0;
      positionRef.current?.copy(root.position);
      input.spawn = null;
    }

    const keyState = keys.current;
    let x = input.locked
      ? 0
      : (keyState["KeyD"] || keyState["ArrowRight"] ? 1 : 0) -
        (keyState["KeyA"] || keyState["ArrowLeft"] ? 1 : 0) +
        input.x;
    let z = input.locked
      ? 0
      : (keyState["KeyS"] || keyState["ArrowDown"] ? 1 : 0) -
        (keyState["KeyW"] || keyState["ArrowUp"] ? 1 : 0) +
        input.z;

    if (!input.locked && Math.abs(x) < 0.01 && Math.abs(z) < 0.01 && input.target) {
      x = input.target.x - root.position.x;
      z = input.target.z - root.position.z;
      if (Math.hypot(x, z) < 0.16) {
        input.target = null;
        x = 0;
        z = 0;
      }
    }

    const moving = Math.abs(x) > 0.01 || Math.abs(z) > 0.01;
    const delta = Math.min(frameDelta, 0.05);
    if (moving) {
      direction.set(x, 0, z).normalize();
      const sprinting = keyState["ShiftLeft"] || keyState["ShiftRight"];
      const speed = sprinting ? 3.05 : 1.9;
      const stepX = direction.x * speed * delta;
      const stepZ = direction.z * speed * delta;
      const nextX = MathUtils.clamp(root.position.x + stepX, -8.1, 8.1);
      const nextZ = MathUtils.clamp(root.position.z + stepZ, -25.4, 5.8);

      // Resolve each axis independently so the explorer naturally slides along obstacles.
      if (!isWorldBlocked(nextX, root.position.z)) root.position.x = nextX;
      if (!isWorldBlocked(root.position.x, nextZ)) root.position.z = nextZ;

      const targetRotation = Math.atan2(direction.x, direction.z);
      root.rotation.y = MathUtils.lerp(root.rotation.y, targetRotation, 0.13);
    }

    positionRef.current?.copy(root.position);

    const time = state.clock.elapsedTime;
    const stride = moving && !reducedMotion ? Math.sin(time * 9.5) : 0;
    const idle = reducedMotion ? 0 : Math.sin(time * 1.6) * 0.012;
    const waveEnvelope =
      !reducedMotion && time > 0.65 && time < 3.65
        ? Math.sin(MathUtils.clamp((time - 0.65) / 3, 0, 1) * Math.PI)
        : 0;

    if (bodyRef.current)
      bodyRef.current.position.y = idle + (moving ? Math.abs(stride) * 0.025 : 0);
    if (leftLegRef.current) leftLegRef.current.rotation.x = stride * 0.5;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -stride * 0.5;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -stride * 0.42;
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = stride * 0.42 + Math.sin(time * 9) * 0.11 * waveEnvelope;
      rightArmRef.current.rotation.z = -1.65 * waveEnvelope;
    }
  });

  return (
    <group ref={rootRef} name="digital-engineer">
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.58, 32]} />
        <meshBasicMaterial color="#06101d" transparent opacity={darkMode ? 0.34 : 0.13} />
      </mesh>

      <group ref={bodyRef}>
        <group ref={leftLegRef} position={[-0.2, 0.75, 0]}>
          <mesh position={[0, -0.31, 0]}>
            <capsuleGeometry args={[0.14, 0.48, 6, 10]} />
            <meshStandardMaterial color={trousers} roughness={0.58} />
          </mesh>
          <mesh position={[0, -0.69, 0.12]} scale={[0.34, 0.18, 0.55]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#e9f2ff" roughness={0.38} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.2, 0.75, 0]}>
          <mesh position={[0, -0.31, 0]}>
            <capsuleGeometry args={[0.14, 0.48, 6, 10]} />
            <meshStandardMaterial color={trousers} roughness={0.58} />
          </mesh>
          <mesh position={[0, -0.69, 0.12]} scale={[0.34, 0.18, 0.55]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#e9f2ff" roughness={0.38} />
          </mesh>
        </group>

        <mesh position={[0, 1.46, 0]} scale={[0.78, 1, 0.55]}>
          <capsuleGeometry args={[0.42, 0.65, 8, 14]} />
          <meshStandardMaterial color={jacket} roughness={0.42} metalness={0.08} />
        </mesh>
        <mesh position={[0, 1.55, 0.33]} scale={[0.23, 0.62, 0.08]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f2f7ff" roughness={0.45} />
        </mesh>
        <mesh position={[0, 1.51, 0.39]} scale={[0.055, 0.48, 0.035]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#168cff" roughness={0.28} metalness={0.18} />
        </mesh>
        <mesh position={[-0.19, 1.65, 0.385]} rotation={[0, 0, -0.46]} scale={[0.2, 0.52, 0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={jacketEdge} roughness={0.42} />
        </mesh>
        <mesh position={[0.19, 1.65, 0.385]} rotation={[0, 0, 0.46]} scale={[0.2, 0.52, 0.04]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={jacketEdge} roughness={0.42} />
        </mesh>

        <group ref={leftArmRef} position={[-0.55, 1.82, 0]}>
          <mesh position={[0, -0.38, 0]}>
            <capsuleGeometry args={[0.14, 0.5, 6, 10]} />
            <meshStandardMaterial color={jacket} roughness={0.44} />
          </mesh>
          <mesh position={[0, -0.78, 0]}>
            <sphereGeometry args={[0.16, 14, 10]} />
            <meshStandardMaterial color={skin} roughness={0.58} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.55, 1.82, 0]}>
          <mesh position={[0, -0.38, 0]}>
            <capsuleGeometry args={[0.14, 0.5, 6, 10]} />
            <meshStandardMaterial color={jacket} roughness={0.44} />
          </mesh>
          <mesh position={[0, -0.78, 0]}>
            <sphereGeometry args={[0.16, 14, 10]} />
            <meshStandardMaterial color={skin} roughness={0.58} />
          </mesh>
        </group>

        <mesh position={[0, 2.05, 0]}>
          <cylinderGeometry args={[0.12, 0.14, 0.22, 12]} />
          <meshStandardMaterial color={skin} roughness={0.56} />
        </mesh>
        <mesh position={[0, 2.36, 0]} scale={[0.88, 1.03, 0.82]}>
          <sphereGeometry args={[0.33, 22, 16]} />
          <meshStandardMaterial color={skin} roughness={0.58} />
        </mesh>
        <mesh position={[0, 2.59, -0.03]} scale={[0.96, 0.48, 0.9]}>
          <sphereGeometry args={[0.34, 20, 14]} />
          <meshStandardMaterial color="#11131a" roughness={0.72} />
        </mesh>
        <mesh position={[-0.245, 2.45, -0.02]} scale={[0.28, 0.5, 0.66]}>
          <sphereGeometry args={[0.28, 16, 12]} />
          <meshStandardMaterial color="#11131a" roughness={0.72} />
        </mesh>
        <mesh position={[0.245, 2.45, -0.02]} scale={[0.28, 0.5, 0.66]}>
          <sphereGeometry args={[0.28, 16, 12]} />
          <meshStandardMaterial color="#11131a" roughness={0.72} />
        </mesh>
        <mesh position={[-0.12, 2.39, 0.29]}>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshStandardMaterial color="#09101b" roughness={0.25} />
        </mesh>
        <mesh position={[0.12, 2.39, 0.29]}>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshStandardMaterial color="#09101b" roughness={0.25} />
        </mesh>
        <mesh position={[0, 2.28, 0.318]} scale={[0.16, 0.025, 0.025]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#5f332b" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

function RobotCompanion({
  positionRef,
  darkMode,
  reducedMotion,
}: {
  positionRef: RefObject<Vector3>;
  darkMode: boolean;
  reducedMotion: boolean;
}) {
  const robotRef = useRef<Group>(null);
  const headGeometry = useMemo(() => new RoundedBoxGeometry(0.7, 0.52, 0.38, 3, 0.12), []);
  const bodyGeometry = useMemo(() => new RoundedBoxGeometry(0.5, 0.56, 0.36, 3, 0.1), []);
  const target = useMemo(() => new Vector3(), []);
  const body = darkMode ? "#eaf2ff" : "#173253";
  const face = darkMode ? "#0b1424" : "#edf5ff";
  const eye = darkMode ? "#42a5ff" : "#07101e";

  useEffect(
    () => () => {
      headGeometry.dispose();
      bodyGeometry.dispose();
    },
    [bodyGeometry, headGeometry],
  );

  useFrame((state) => {
    const robot = robotRef.current;
    const character = positionRef.current;
    if (!robot || !character) return;
    target.set(character.x + 0.88, 0, character.z + 0.36);
    robot.position.lerp(target, reducedMotion ? 0.1 : 0.045);
    robot.position.y = reducedMotion
      ? 0.08
      : 0.09 + Math.sin(state.clock.elapsedTime * 2.8) * 0.045;
    robot.rotation.y = MathUtils.lerp(robot.rotation.y, 0, 0.08);
  });

  return (
    <group ref={robotRef} position={[0.3, 0.08, 1.15]} scale={0.78}>
      <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#07101e" transparent opacity={darkMode ? 0.25 : 0.1} />
      </mesh>
      <mesh geometry={bodyGeometry} position={[0, 0.7, 0]}>
        <meshStandardMaterial color={body} roughness={0.3} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.72, 0.195]}>
        <circleGeometry args={[0.12, 20]} />
        <meshStandardMaterial color="#0e1b2d" emissive="#42a5ff" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 1.03, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.25, 12]} />
        <meshStandardMaterial color="#63748b" roughness={0.28} metalness={0.7} />
      </mesh>
      <mesh geometry={headGeometry} position={[0, 1.32, 0]}>
        <meshStandardMaterial color={body} roughness={0.28} metalness={0.15} />
      </mesh>
      <mesh position={[0, 1.32, 0.205]} scale={[0.82, 0.68, 0.08]}>
        <boxGeometry args={[0.7, 0.52, 0.1]} />
        <meshStandardMaterial color={face} roughness={0.2} metalness={0.24} />
      </mesh>
      <mesh position={[-0.14, 1.34, 0.245]} scale={[1.45, 0.64, 0.2]}>
        <sphereGeometry args={[0.055, 12, 8]} />
        <meshStandardMaterial
          color={eye}
          emissive="#42a5ff"
          emissiveIntensity={darkMode ? 1.65 : 0.25}
        />
      </mesh>
      <mesh position={[0.14, 1.34, 0.245]} scale={[1.45, 0.64, 0.2]}>
        <sphereGeometry args={[0.055, 12, 8]} />
        <meshStandardMaterial
          color={eye}
          emissive="#42a5ff"
          emissiveIntensity={darkMode ? 1.65 : 0.25}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.34, 0.75, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <capsuleGeometry args={[0.075, 0.28, 5, 8]} />
            <meshStandardMaterial color={body} roughness={0.32} />
          </mesh>
          <mesh position={[0, -0.36, 0]}>
            <sphereGeometry args={[0.1, 12, 8]} />
            <meshStandardMaterial color={body} roughness={0.32} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={`leg-${side}`} position={[side * 0.14, 0.37, 0]}>
          <mesh position={[0, -0.12, 0]}>
            <capsuleGeometry args={[0.07, 0.18, 5, 8]} />
            <meshStandardMaterial color="#64748b" roughness={0.32} metalness={0.58} />
          </mesh>
          <mesh position={[0, -0.27, 0.05]} scale={[0.16, 0.08, 0.24]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={body} roughness={0.32} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PathEnvironment({
  darkMode,
  inputRef,
  reducedMotion,
}: {
  darkMode: boolean;
  inputRef: RefObject<StudioInput>;
  reducedMotion: boolean;
}) {
  const waterRef = useRef<Group>(null);
  const ground = darkMode ? "#0b2719" : "#6f9f62";
  const path = darkMode ? "#493c2e" : "#d6c39a";
  const pathEdge = darkMode ? "#766247" : "#9a835c";
  const structure = darkMode ? "#173654" : "#d4e4ef";
  const accent = darkMode ? "#42a5ff" : "#0878ee";
  const foliage = darkMode ? "#123d25" : "#2f773b";
  const foliageLight = darkMode ? "#245b32" : "#4f9849";
  const water = darkMode ? "#063356" : "#319ac5";
  const sand = darkMode ? "#5b513b" : "#d2bd83";
  const stations = useMemo(
    () =>
      ZONES.map((zone, index) => ({
        ...zone,
        side: index % 2 === 0 ? -1 : 1,
        height: 1.15 + (index % 3) * 0.22,
      })),
    [],
  );
  const mainTrail = useMemo(
    () =>
      createTrailSegments(
        [
          [0, 5],
          [-3.1, 3.6],
          [-4.8, 0.8],
          [-5.6, -4.2],
          [-4.6, -8.9],
          [-5.2, -14.2],
          [-3.8, -18.8],
          [-1.2, -23.6],
          [3.8, -24],
          [5.8, -18.4],
          [4.9, -13.4],
          [5.6, -8.1],
          [4.6, -3.6],
          [3.2, 1.8],
          [0, 5],
        ],
        72,
        "main",
      ),
    [],
  );
  const forestBranch = useMemo(
    () =>
      createTrailSegments(
        [
          [-4.8, 0.8],
          [-7.2, -1.8],
          [-7.4, -7.2],
          [-6.4, -12.5],
          [-4.6, -8.9],
        ],
        24,
        "forest",
      ),
    [],
  );
  const coastBranch = useMemo(
    () =>
      createTrailSegments(
        [
          [4.6, -3.6],
          [7.1, -6.2],
          [7.3, -11.5],
          [7.1, -17.8],
          [5.9, -21.9],
          [3.8, -24],
        ],
        28,
        "coast",
      ),
    [],
  );
  const crossTrails = useMemo(
    () => [
      ...createTrailSegments(
        [
          [-4.8, 0.8],
          [-1.7, -0.9],
          [1.5, -1.4],
          [4.6, -3.6],
        ],
        16,
        "cross-north",
      ),
      ...createTrailSegments(
        [
          [-4.6, -8.9],
          [-1.8, -10.4],
          [1.9, -10.8],
          [4.9, -13.4],
        ],
        16,
        "cross-center",
      ),
      ...createTrailSegments(
        [
          [-3.8, -18.8],
          [-0.8, -17.2],
          [2.1, -18.6],
          [3.8, -24],
        ],
        16,
        "cross-south",
      ),
      ...createTrailSegments(
        [
          [0, 5],
          [0.4, 1.2],
          [-0.2, -4.3],
          [0.5, -9.8],
          [0, -15.3],
          [-0.8, -17.2],
        ],
        26,
        "central",
      ),
    ],
    [],
  );
  const forest = FOREST_OBJECTS;
  const shorelineRocks = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        x: 8.45 + ((index * 7) % 5) * 0.24,
        z: 4.3 - index * 1.42,
        scale: 0.18 + (index % 4) * 0.07,
      })),
    [],
  );

  useFrame((state) => {
    if (!waterRef.current || reducedMotion) return;
    waterRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.025;
    waterRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.22) * 0.0015;
  });

  const walkTo = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const input = inputRef.current;
    if (!input) return;
    const x = MathUtils.clamp(event.point.x, -8.1, 8.1);
    const z = MathUtils.clamp(event.point.z, -25.4, 5.8);
    if (isWorldBlocked(x, z)) return;
    input.target = { x, z };
  };

  return (
    <group>
      <mesh position={[0, -0.08, -10]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={walkTo}>
        <planeGeometry args={[18.5, 36]} />
        <meshStandardMaterial color={ground} roughness={0.92} />
      </mesh>

      <mesh position={[8.8, -0.055, -10]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={walkTo}>
        <planeGeometry args={[2.1, 36]} />
        <meshStandardMaterial color={sand} roughness={0.96} />
      </mesh>

      <group ref={waterRef}>
        <mesh position={[12.9, -0.11, -10]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.4, 36, 1, 28]} />
          <meshStandardMaterial
            color={water}
            emissive={darkMode ? "#03223a" : "#176d98"}
            emissiveIntensity={darkMode ? 0.42 : 0.08}
            metalness={0.12}
            roughness={0.24}
            transparent
            opacity={0.88}
          />
        </mesh>
        {Array.from({ length: 7 }, (_, index) => (
          <mesh
            key={`wave-${index}`}
            position={[9.75 + index * 0.52, -0.045 + (index % 2) * 0.012, -10]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.035, 33]} />
            <meshBasicMaterial
              color={darkMode ? "#2a87b5" : "#a9e7f2"}
              transparent
              opacity={0.38}
            />
          </mesh>
        ))}
      </group>

      {[...mainTrail, ...forestBranch, ...coastBranch, ...crossTrails].map((segment) => (
        <mesh
          key={segment.key}
          position={segment.position}
          rotation={[0, segment.rotation, 0]}
          onPointerDown={walkTo}
        >
          <boxGeometry
            args={[segment.key.startsWith("main") ? 1.85 : 1.18, 0.07, segment.length]}
          />
          <meshStandardMaterial color={path} roughness={0.82} metalness={0.02} />
        </mesh>
      ))}

      {mainTrail
        .filter((_, index) => index % 3 === 0)
        .map((segment, index) => (
          <mesh
            key={`trail-stone-${segment.key}`}
            position={[segment.position[0], 0.073, segment.position[2]]}
            rotation={[-Math.PI / 2, 0, index * 0.37]}
          >
            <circleGeometry args={[0.08 + (index % 3) * 0.02, 10]} />
            <meshStandardMaterial
              color={pathEdge}
              emissive={darkMode ? accent : "#000000"}
              emissiveIntensity={darkMode ? 0.16 : 0}
              roughness={0.78}
            />
          </mesh>
        ))}

      <mesh position={[0, -0.035, -15.65]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 1.05]} />
        <meshStandardMaterial
          color={water}
          emissive={darkMode ? "#03223a" : "#176d98"}
          emissiveIntensity={darkMode ? 0.38 : 0.06}
          roughness={0.2}
        />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => (
        <mesh key={`bridge-plank-${index}`} position={[0.15, 0.09, -16.12 + index * 0.14]}>
          <boxGeometry args={[2.1, 0.09, 0.115]} />
          <meshStandardMaterial color={darkMode ? "#3d5260" : "#9b8063"} roughness={0.82} />
        </mesh>
      ))}
      {[-0.94, 1.24].map((x) => (
        <mesh key={`bridge-rail-${x}`} position={[x, 0.22, -15.63]}>
          <boxGeometry args={[0.055, 0.38, 1.35]} />
          <meshStandardMaterial color={pathEdge} roughness={0.62} />
        </mesh>
      ))}

      <group position={[7.15, 0.04, -17.8]}>
        <mesh>
          <cylinderGeometry args={[1.05, 1.05, 0.1, 8]} />
          <meshStandardMaterial color={darkMode ? "#294353" : "#a88d6c"} roughness={0.78} />
        </mesh>
        {[-0.72, 0.72].map((x) => (
          <mesh key={x} position={[x, 0.4, 0]}>
            <cylinderGeometry args={[0.035, 0.045, 0.8, 8]} />
            <meshStandardMaterial color={pathEdge} roughness={0.58} />
          </mesh>
        ))}
      </group>

      {stations.map((station, index) => (
        <group
          key={station.id}
          position={[station.position[0] + station.side * 1.9, 0, station.position[2]]}
        >
          <mesh position={[0, station.height / 2, 0]}>
            <boxGeometry args={[1.75, station.height, 0.22]} />
            <meshStandardMaterial color={structure} roughness={0.42} metalness={0.2} />
          </mesh>
          <mesh position={[-station.side * 0.88, 0.72, 0]} rotation={[0, 0, station.side * -0.08]}>
            <boxGeometry args={[0.08, 1.5, 0.08]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={darkMode ? 1.1 : 0.2}
            />
          </mesh>
          <mesh position={[0, station.height + 0.13, 0]}>
            <boxGeometry args={[1.15, 0.08, 0.3]} />
            <meshStandardMaterial
              color={station.color}
              emissive={station.color}
              emissiveIntensity={darkMode ? 0.75 : 0.12}
            />
          </mesh>
          {index === 4 ? (
            <group position={[0, 0.72, station.side * -0.18]}>
              {[-0.5, 0, 0.5].map((x, cardIndex) => (
                <mesh
                  key={x}
                  position={[x, cardIndex === 1 ? 0.12 : 0, 0]}
                  rotation={[0, 0, (cardIndex - 1) * 0.08]}
                >
                  <boxGeometry args={[0.42, 0.6, 0.05]} />
                  <meshStandardMaterial
                    color={cardIndex === 1 ? accent : pathEdge}
                    emissive={cardIndex === 1 ? accent : "#000000"}
                    emissiveIntensity={darkMode ? 0.45 : 0.06}
                  />
                </mesh>
              ))}
            </group>
          ) : null}
        </group>
      ))}

      {Array.from({ length: 12 }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const z = -0.5 - Math.floor(index / 2) * 5.1;
        return (
          <group key={`lamp-${index}`} position={[side * 2.75, 0, z]}>
            <mesh position={[0, 0.75, 0]}>
              <cylinderGeometry args={[0.035, 0.055, 1.5, 10]} />
              <meshStandardMaterial color={structure} metalness={0.55} roughness={0.28} />
            </mesh>
            <mesh position={[0, 1.55, 0]}>
              <sphereGeometry args={[0.11, 12, 8]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={darkMode ? 2.1 : 0.32}
              />
            </mesh>
            {index % 3 === 0 ? (
              <pointLight
                position={[0, 1.5, 0]}
                color={accent}
                intensity={darkMode ? 1.8 : 0.15}
                distance={4.2}
              />
            ) : null}
          </group>
        );
      })}

      {forest.map((tree, index) => (
        <group key={`tree-${index}`} position={[tree.x, 0, tree.z]} scale={tree.scale}>
          <mesh position={[0, 0.62, 0]}>
            <cylinderGeometry args={[0.1, 0.17, 1.25, 8]} />
            <meshStandardMaterial color={darkMode ? "#4d321f" : "#704626"} roughness={0.94} />
          </mesh>
          <mesh position={[0, 1.48, 0]} scale={[0.82, 1.18, 0.82]}>
            <icosahedronGeometry args={[0.72, 1]} />
            <meshStandardMaterial color={tree.light ? foliageLight : foliage} roughness={0.86} />
          </mesh>
          <mesh position={[0.18, 1.82, -0.05]} scale={[0.5, 0.64, 0.5]}>
            <icosahedronGeometry args={[0.48, 1]} />
            <meshStandardMaterial color={tree.light ? foliage : foliageLight} roughness={0.88} />
          </mesh>
        </group>
      ))}

      {shorelineRocks.map((rock, index) => (
        <mesh
          key={`shore-rock-${index}`}
          position={[rock.x, rock.scale * 0.35 - 0.05, rock.z]}
          rotation={[index * 0.21, index * 0.47, index * 0.16]}
          scale={[rock.scale * 1.3, rock.scale * 0.7, rock.scale]}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={darkMode ? "#234354" : "#78939a"} roughness={0.93} />
        </mesh>
      ))}

      {HILL_OBJECTS.map(([x, z, scale], index) => (
        <mesh
          key={`hill-${index}`}
          position={[x, scale * 0.22 - 0.12, z]}
          scale={[scale, scale * 0.42, scale]}
        >
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial color={index % 2 === 0 ? foliage : foliageLight} roughness={0.98} />
        </mesh>
      ))}

      {darkMode
        ? Array.from({ length: 18 }, (_, index) => (
            <mesh
              key={`firefly-${index}`}
              position={[
                -4.4 + ((index * 13) % 9) * 0.82,
                0.75 + (index % 4) * 0.31,
                4.5 - index * 1.55,
              ]}
            >
              <sphereGeometry args={[0.025, 8, 6]} />
              <meshBasicMaterial color={index % 2 === 0 ? "#7bd7ff" : "#bcecff"} />
            </mesh>
          ))
        : null}
    </group>
  );
}

function StudioEnvironment({
  darkMode,
  inputRef,
  reducedMotion,
}: {
  darkMode: boolean;
  inputRef: RefObject<StudioInput>;
  reducedMotion: boolean;
}) {
  const city = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        x: -4.9 + (index % 9) * 1.18,
        y: 0.45 + ((index * 7) % 5) * 0.26,
        width: 0.42 + ((index * 3) % 4) * 0.11,
      })),
    [],
  );
  if (ZONES.length > 0)
    return (
      <PathEnvironment darkMode={darkMode} inputRef={inputRef} reducedMotion={reducedMotion} />
    );
  const floor = darkMode ? "#0b192a" : "#dce9f8";
  const wall = darkMode ? "#13253b" : "#edf4fc";
  const frame = darkMode ? "#245177" : "#aac5e2";
  const glass = darkMode ? "#0c2037" : "#a8d8f5";
  const accent = darkMode ? "#42a5ff" : "#0878ee";

  const walkTo = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const input = inputRef.current;
    if (!input) return;
    input.target = {
      x: MathUtils.clamp(event.point.x, -4.35, 4.35),
      z: MathUtils.clamp(event.point.z, -3.2, 2.15),
    };
  };

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerDown={walkTo}>
        <planeGeometry args={[12, 9]} />
        <meshStandardMaterial color={floor} roughness={0.63} metalness={darkMode ? 0.18 : 0.05} />
      </mesh>
      <gridHelper
        args={[12, 24, darkMode ? "#234b70" : "#5f91bd", darkMode ? "#122841" : "#b5cee4"]}
        position={[0, 0.012, 0]}
      />

      <mesh position={[0, 2.5, -4.5]}>
        <boxGeometry args={[12, 5, 0.18]} />
        <meshStandardMaterial color={wall} roughness={0.7} />
      </mesh>
      <mesh position={[-6, 2.5, 0]}>
        <boxGeometry args={[0.18, 5, 9]} />
        <meshStandardMaterial color={wall} roughness={0.72} />
      </mesh>
      <mesh position={[6, 2.5, 0]}>
        <boxGeometry args={[0.18, 5, 9]} />
        <meshStandardMaterial color={wall} roughness={0.72} />
      </mesh>

      <mesh position={[0.75, 2.75, -4.38]}>
        <boxGeometry args={[7.8, 3.7, 0.08]} />
        <meshStandardMaterial
          color={glass}
          emissive={darkMode ? "#071326" : "#79bff0"}
          emissiveIntensity={darkMode ? 0.35 : 0.16}
          roughness={0.18}
          metalness={0.12}
        />
      </mesh>
      {[-3.15, -1.2, 0.75, 2.7, 4.65].map((x) => (
        <mesh key={x} position={[x, 2.75, -4.3]}>
          <boxGeometry args={[0.055, 3.7, 0.06]} />
          <meshStandardMaterial color={frame} metalness={0.58} roughness={0.25} />
        </mesh>
      ))}
      {city.map((building, index) => (
        <mesh
          key={index}
          position={[building.x + 0.75, building.y, -4.25]}
          scale={[building.width, building.y * 1.35, 0.06]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={darkMode ? "#102b48" : "#6d9bc2"}
            emissive={index % 3 === 0 ? accent : "#000000"}
            emissiveIntensity={darkMode && index % 3 === 0 ? 0.65 : 0.03}
            roughness={0.5}
          />
        </mesh>
      ))}

      <group position={[3.1, 0, -2.92]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[2.75, 0.12, 1.05]} />
          <meshStandardMaterial color={frame} roughness={0.33} metalness={0.52} />
        </mesh>
        {[-1.1, 1.1].map((x) => (
          <mesh key={x} position={[x, 0.27, 0]}>
            <boxGeometry args={[0.1, 0.55, 0.85]} />
            <meshStandardMaterial color={frame} roughness={0.36} metalness={0.48} />
          </mesh>
        ))}
        {[-0.62, 0.05, 0.72].map((x, index) => (
          <group
            key={x}
            position={[x, 1.15, -0.22]}
            rotation={[-0.08, index === 0 ? 0.1 : index === 2 ? -0.1 : 0, 0]}
          >
            <mesh>
              <boxGeometry args={[0.58, 0.72, 0.08]} />
              <meshStandardMaterial color="#07101e" roughness={0.2} metalness={0.22} />
            </mesh>
            <mesh position={[0, 0, 0.046]} scale={[0.82, 0.78, 0.02]}>
              <planeGeometry args={[0.58, 0.72]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={darkMode ? 0.95 : 0.28}
              />
            </mesh>
          </group>
        ))}
      </group>

      <group position={[-4.32, 1.62, -2.95]}>
        {[0, 0.82, 1.64].map((y, index) => (
          <mesh key={y} position={[0, y, 0]} rotation={[0, 0.16, 0]}>
            <boxGeometry args={[1.6, 0.58, 0.08]} />
            <meshStandardMaterial
              color={index === 1 ? accent : glass}
              emissive={index === 1 ? accent : "#000000"}
              emissiveIntensity={index === 1 ? (darkMode ? 0.75 : 0.18) : 0}
              roughness={0.25}
              metalness={0.18}
            />
          </mesh>
        ))}
      </group>

      {[-3.8, -1.9, 0, 1.9, 3.8].map((x, index) => (
        <mesh key={x} position={[x, 0.025, 2.55]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.055 + (index % 2) * 0.018, 16]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      ))}
    </group>
  );
}

function ZoneBeacons({
  inputRef,
  darkMode,
}: {
  inputRef: RefObject<StudioInput>;
  darkMode: boolean;
}) {
  return (
    <group>
      {ZONES.map((zone, index) => (
        <group
          key={zone.id}
          position={zone.position}
          onPointerDown={(event) => {
            event.stopPropagation();
            if (inputRef.current) {
              inputRef.current.target = { x: zone.position[0], z: zone.position[2] };
            }
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
          }}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.48, 0.025, 8, 42]} />
            <meshStandardMaterial
              color={zone.color}
              emissive={zone.color}
              emissiveIntensity={darkMode ? 1.15 : 0.3}
            />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.025, 0.05, 0.38, 10]} />
            <meshStandardMaterial
              color={zone.color}
              emissive={zone.color}
              emissiveIntensity={darkMode ? 0.9 : 0.2}
            />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <sphereGeometry args={[0.075 + index * 0.002, 12, 8]} />
            <meshStandardMaterial
              color={zone.color}
              emissive={zone.color}
              emissiveIntensity={darkMode ? 1.4 : 0.35}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function StudioWorld({
  darkMode,
  reducedMotion,
  inputRef,
  onZoneChange,
}: Omit<StudioCanvasProps, "inView">) {
  const characterPositionRef = useRef(new Vector3().copy(START_POSITION));
  const activeZoneRef = useRef<StudioZoneId | null>(null);
  const desiredCamera = useMemo(() => new Vector3(), []);
  const cameraTarget = useMemo(() => new Vector3(), []);
  const renderer = useThree((state) => state.gl);
  const background = darkMode ? "#07101c" : "#cfe8fb";
  const fog = darkMode ? "#0a1726" : "#d8ebf8";

  useEffect(() => {
    renderer.toneMappingExposure = darkMode ? 1.08 : 0.94;
  }, [darkMode, renderer]);

  useFrame(({ camera, size }) => {
    const character = characterPositionRef.current;
    const panelOffset = size.width >= 860 ? 1.45 : 0;
    desiredCamera.set(character.x - panelOffset * 0.28, 4.15, character.z + 7.6);
    camera.position.lerp(desiredCamera, reducedMotion ? 0.2 : 0.045);
    cameraTarget.set(character.x - panelOffset, 1.1, character.z - 1.45);
    camera.lookAt(cameraTarget);

    let nearest: StudioZoneId | null = null;
    let nearestDistance = 1.18;
    for (const zone of ZONES) {
      const distance = Math.hypot(character.x - zone.position[0], character.z - zone.position[2]);
      if (distance < nearestDistance) {
        nearest = zone.id;
        nearestDistance = distance;
      }
    }
    if (nearest !== activeZoneRef.current) {
      activeZoneRef.current = nearest;
      onZoneChange(nearest);
    }
  });

  return (
    <>
      <color attach="background" args={[background]} />
      <fog attach="fog" args={[fog, 12, 34]} />
      <hemisphereLight
        intensity={darkMode ? 1.05 : 1.55}
        color={darkMode ? "#8fbdff" : "#fff3d9"}
        groundColor={darkMode ? "#10243c" : "#8db8d8"}
      />
      <ambientLight intensity={darkMode ? 0.72 : 1.1} color={darkMode ? "#8bbcff" : "#fff4dc"} />
      <directionalLight
        position={[4, 7, 6]}
        intensity={darkMode ? 1.35 : 2.4}
        color={darkMode ? "#7fb5ff" : "#fff0c9"}
      />
      <pointLight
        position={[2.8, 3.2, -9]}
        intensity={darkMode ? 5 : 1.2}
        distance={7}
        color="#42a5ff"
      />
      <pointLight
        position={[-2.8, 3.2, -21]}
        intensity={darkMode ? 3.2 : 0.8}
        distance={6}
        color="#38bdf8"
      />

      <StudioEnvironment darkMode={darkMode} inputRef={inputRef} reducedMotion={reducedMotion} />
      <ZoneBeacons inputRef={inputRef} darkMode={darkMode} />
      <DigitalEngineer
        inputRef={inputRef}
        positionRef={characterPositionRef}
        reducedMotion={reducedMotion}
        darkMode={darkMode}
      />
      <RobotCompanion
        positionRef={characterPositionRef}
        darkMode={darkMode}
        reducedMotion={reducedMotion}
      />
    </>
  );
}

export default function InteractiveStudioCanvas(props: StudioCanvasProps) {
  return (
    <Canvas
      className="interactive-studio-canvas"
      camera={{ position: [0, 4.15, 8.8], fov: 45, near: 0.1, far: 60 }}
      dpr={[1, 1.5]}
      frameloop={props.inView ? "always" : "never"}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
      }}
    >
      <StudioWorld
        darkMode={props.darkMode}
        reducedMotion={props.reducedMotion}
        inputRef={props.inputRef}
        onZoneChange={props.onZoneChange}
      />
    </Canvas>
  );
}
