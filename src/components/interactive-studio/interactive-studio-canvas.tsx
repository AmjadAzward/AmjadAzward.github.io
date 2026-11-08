import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  LinearFilter,
  MathUtils,
  Mesh,
  Object3D,
  PerspectiveCamera,
  SRGBColorSpace,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import { socials } from "@/data/portfolio";

import type {
  ShowcaseSlide,
  StudioInput,
  StudioPosition,
  StudioQuality,
  StudioZoneId,
} from "./interactive-studio-hero";

type StudioCanvasProps = {
  darkMode: boolean;
  reducedMotion: boolean;
  quality: StudioQuality;
  inView: boolean;
  inputRef: RefObject<StudioInput>;
  explorerPositionRef: RefObject<StudioPosition>;
  onZoneChange: (zone: StudioZoneId | null) => void;
  showcase: { section: StudioZoneId; slide: number } | null;
  showcaseSlide: ShowcaseSlide | null;
  showcaseTotal: number;
  onShowcasePrevious: () => void;
  onShowcaseNext: () => void;
  onShowcaseClose: () => void;
};

type Zone = {
  id: StudioZoneId;
  position: [number, number, number];
};

const ZONES: Zone[] = [
  { id: "about", position: [-4.8, 0.03, 0.8] },
  { id: "skills", position: [4.6, 0.03, -3.6] },
  { id: "certifications", position: [-4.6, 0.03, -8.9] },
  { id: "services", position: [4.9, 0.03, -13.4] },
  { id: "portfolio", position: [-3.8, 0.03, -18.8] },
  { id: "contact", position: [3.8, 0.03, -24] },
];

const SERVICE_NODE_POSITIONS: Array<[number, number]> = [
  [-0.5, 0.38],
  [0.52, 0.34],
  [0, -0.52],
];

const START_POSITION = new Vector3(0, 0, 5);
const WALK_BOUNDS = { minX: -12.8, maxX: 12.8, minZ: -28.5, maxZ: 7.2 };
const SHOWCASE_SCREEN_OFFSET = 3.25;
const STREAM_CENTER_Z = -15.65;
const STREAM_HALF_WIDTH = 0.53;
const MAIN_TRAIL_WIDTH = 2.45;
const BRANCH_TRAIL_WIDTH = 1.68;
const LANDMARK_OFFSET = 1.9;
const LANDMARK_APPROACH_OFFSET = 0.62;
const LANDMARK_TRIGGER_RADIUS = 1.65;

const MEADOW_PATCHES: Array<[number, number]> = [
  [-11.2, 5.2],
  [-10.1, 3.2],
  [-11.4, -0.8],
  [-10.7, -5.4],
  [-11.5, -10.5],
  [-10.6, -16.2],
  [-11.3, -21.5],
  [-10.1, -26.2],
  [10.2, 4.7],
  [11.3, 1.1],
  [10.5, -4.2],
  [11.2, -9.5],
  [10.5, -14.8],
  [11.4, -20.2],
  [10.2, -25.8],
  [-1.7, 4.3],
  [2.2, 3.8],
  [-1.8, -27.1],
  [2.1, -27],
];

const FENCE_SEGMENTS: Array<{ x: number; z: number; rotation: number; length: number }> = [
  { x: -12.15, z: 3.5, rotation: Math.PI / 2, length: 4.5 },
  { x: -12.15, z: -3.5, rotation: Math.PI / 2, length: 5 },
  { x: -12.15, z: -10.5, rotation: Math.PI / 2, length: 5 },
  { x: -12.15, z: -17.5, rotation: Math.PI / 2, length: 5 },
  { x: -12.15, z: -24.5, rotation: Math.PI / 2, length: 5 },
  { x: 12.15, z: 3.5, rotation: Math.PI / 2, length: 4.5 },
  { x: 12.15, z: -3.5, rotation: Math.PI / 2, length: 5 },
  { x: 12.15, z: -10.5, rotation: Math.PI / 2, length: 5 },
  { x: 12.15, z: -17.5, rotation: Math.PI / 2, length: 5 },
  { x: 12.15, z: -24.5, rotation: Math.PI / 2, length: 5 },
  { x: -8.05, z: 6.35, rotation: 0, length: 7.5 },
  { x: 8.05, z: 6.35, rotation: 0, length: 7.5 },
  { x: -8.1, z: -27.65, rotation: 0, length: 7.8 },
  { x: 8.1, z: -27.65, rotation: 0, length: 7.8 },
];

const FOREST_OBJECTS = Array.from({ length: 48 }, (_, index) => {
  const rightSide = index % 2 === 1;
  const row = Math.floor(index / 2);
  const edgeOffset = ((index * 5) % 4) * 0.72;
  return {
    x: (rightSide ? 1 : -1) * (8.35 + edgeOffset),
    z: 5 - row * 1.43 + ((index * 7) % 5) * 0.2,
    scale: 0.64 + ((index * 11) % 7) * 0.06,
    light: index % 3 === 0,
  };
});

const HILL_OBJECTS: Array<[number, number, number]> = [
  [-10.4, 2.4, 1.2],
  [-10.2, -13.8, 1.5],
  [-9.8, -22.7, 1.32],
  [9.8, 1.2, 0.86],
  [9.9, -9.4, 1],
  [10.1, -21.4, 0.9],
];

const STATION_OBJECTS = ZONES.map((zone, index) => ({
  x: zone.position[0] + (index % 2 === 0 ? -1 : 1) * LANDMARK_OFFSET,
  z: zone.position[2],
}));

const SHOWCASE_OBJECTS = ZONES.map((zone, index) => ({
  x: zone.position[0] + (index % 2 === 0 ? -1 : 1) * SHOWCASE_SCREEN_OFFSET,
  z: zone.position[2] + 0.22,
}));

const LAMP_OBJECTS = [3.8, -1.7, -7.1, -12.4, -19.1, -24.6].flatMap((z, index) => [
  { x: -9.2 - (index % 2) * 0.25, z },
  { x: 9.2 + ((index + 1) % 2) * 0.25, z: z - 0.35 },
]);

const VISIBLE_FOREST_OBJECTS = FOREST_OBJECTS.filter((tree) => {
  const clearOfLandmarks = STATION_OBJECTS.every(
    (station) => Math.hypot(tree.x - station.x, tree.z - station.z) > 3.05,
  );
  const clearOfApproaches = ZONES.every(
    (zone) => Math.hypot(tree.x - zone.position[0], tree.z - zone.position[2]) > 2.25,
  );
  const clearOfLamps = LAMP_OBJECTS.every(
    (lamp) => Math.hypot(tree.x - lamp.x, tree.z - lamp.z) > 1.05,
  );
  const clearOfShowcases = SHOWCASE_OBJECTS.every(
    (screen) =>
      Math.abs(tree.x - screen.x) > 3.15 || tree.z < screen.z - 1.6 || tree.z > screen.z + 4.4,
  );
  return clearOfLandmarks && clearOfApproaches && clearOfLamps && clearOfShowcases;
});

const SOCIAL_OBJECTS = socials.map((social, index) => ({
  ...social,
  x: -2.2 + index * 1.1,
  z: -25.55,
}));

const WORLD_CIRCLE_COLLIDERS = [
  ...VISIBLE_FOREST_OBJECTS.map((tree) => ({
    x: tree.x,
    z: tree.z,
    radius: 0.28 + tree.scale * 0.16,
  })),
  ...HILL_OBJECTS.map(([x, z, scale]) => ({ x, z, radius: scale * 0.82 + 0.2 })),
  ...LAMP_OBJECTS.map(({ x, z }) => ({ x, z, radius: 0.34 })),
  ...SOCIAL_OBJECTS.map(({ x, z }) => ({ x, z, radius: 0.43 })),
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

  const hitsFence = FENCE_SEGMENTS.some((fence) => {
    const dx = x - fence.x;
    const dz = z - fence.z;
    const cosine = Math.cos(fence.rotation);
    const sine = Math.sin(fence.rotation);
    const localX = dx * cosine - dz * sine;
    const localZ = dx * sine + dz * cosine;
    return Math.abs(localX) < fence.length / 2 + 0.14 && Math.abs(localZ) < 0.2;
  });
  if (hitsFence) return true;

  const insideStream = Math.abs(z - STREAM_CENTER_Z) < STREAM_HALF_WIDTH;
  const onBridge = x > -0.78 && x < 1.08;
  return insideStream && !onBridge;
}

function getCharacterSurfaceLift(x: number, z: number) {
  const onStreamBridge =
    x > -1.05 && x < 1.35 && Math.abs(z - STREAM_CENTER_Z) < STREAM_HALF_WIDTH + 0.3;
  if (onStreamBridge) return 0.225;

  const welcomeDistance = Math.hypot(x, z - 5);
  if (welcomeDistance < 1.52) return 0.188;
  if (welcomeDistance < 1.8) return 0.133;

  return 0;
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

function isTrailSegmentOnLand(segment: TrailSegment) {
  const width = segment.key.startsWith("main") ? MAIN_TRAIL_WIDTH : BRANCH_TRAIL_WIDTH;
  const halfWorldZExtent =
    (Math.abs(Math.cos(segment.rotation)) * segment.length) / 2 +
    (Math.abs(Math.sin(segment.rotation)) * width) / 2;

  return (
    Math.abs(segment.position[2] - STREAM_CENTER_Z) - halfWorldZExtent > STREAM_HALF_WIDTH + 0.04
  );
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
  headingRef,
  mapPositionRef,
  reducedMotion,
  darkMode,
}: {
  inputRef: RefObject<StudioInput>;
  positionRef: RefObject<Vector3>;
  headingRef: RefObject<number>;
  mapPositionRef: RefObject<StudioPosition>;
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
  const skinShadow = darkMode ? "#a96850" : "#94563f";
  const shirt = darkMode ? "#dcecff" : "#eef6ff";
  const shirtShadow = darkMode ? "#a9c7e5" : "#c1d7eb";
  const trousers = darkMode ? "#08111f" : "#122742";
  const hair = darkMode ? "#090c13" : "#101722";
  const shoes = darkMode ? "#070c14" : "#101a29";

  useEffect(() => {
    if (!rootRef.current) return;
    rootRef.current.position.copy(START_POSITION);
    positionRef.current?.copy(START_POSITION);
    if (mapPositionRef.current) {
      mapPositionRef.current.x = START_POSITION.x;
      mapPositionRef.current.z = START_POSITION.z;
    }
  }, [mapPositionRef, positionRef]);

  useFrame((state, frameDelta) => {
    const root = rootRef.current;
    const input = inputRef.current;
    if (!root || !input) return;

    if (input.spawn) {
      root.position.set(input.spawn.x, 0, input.spawn.z);
      root.rotation.y = 0;
      headingRef.current = 0;
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
        input.target = input.route.shift() ?? null;
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
      const nextX = MathUtils.clamp(root.position.x + stepX, WALK_BOUNDS.minX, WALK_BOUNDS.maxX);
      const nextZ = MathUtils.clamp(root.position.z + stepZ, WALK_BOUNDS.minZ, WALK_BOUNDS.maxZ);

      // Resolve each axis independently so the explorer naturally slides along obstacles.
      if (!isWorldBlocked(nextX, root.position.z)) root.position.x = nextX;
      if (!isWorldBlocked(root.position.x, nextZ)) root.position.z = nextZ;

      const targetRotation = Math.atan2(direction.x, direction.z);
      root.rotation.y = MathUtils.lerp(root.rotation.y, targetRotation, 0.13);
    }

    positionRef.current?.copy(root.position);
    headingRef.current = root.rotation.y;
    if (mapPositionRef.current) {
      mapPositionRef.current.x = root.position.x;
      mapPositionRef.current.z = root.position.z;
    }

    const time = state.clock.elapsedTime;
    const stride = moving && !reducedMotion ? Math.sin(time * 9.5) : 0;
    const idle = reducedMotion ? 0 : Math.sin(time * 1.6) * 0.012;

    if (bodyRef.current) {
      const surfaceLift = getCharacterSurfaceLift(root.position.x, root.position.z);
      const targetBodyY = surfaceLift + idle + (moving ? Math.abs(stride) * 0.025 : 0);
      bodyRef.current.position.y = MathUtils.lerp(
        bodyRef.current.position.y,
        targetBodyY,
        reducedMotion ? 0.32 : 0.18,
      );
    }
    if (leftLegRef.current) leftLegRef.current.rotation.x = stride * 0.5;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -stride * 0.5;
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -stride * 0.42;
      leftArmRef.current.rotation.z = 0;
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = stride * 0.42;
      rightArmRef.current.rotation.z = 0;
    }
  });

  return (
    <group ref={rootRef} name="digital-engineer">
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.58, 32]} />
        <meshBasicMaterial color="#06101d" transparent opacity={darkMode ? 0.34 : 0.13} />
      </mesh>

      <group ref={bodyRef}>
        <group ref={leftLegRef} position={[-0.18, 0.91, 0]}>
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.125, 0.3, 6, 12]} />
            <meshStandardMaterial color={trousers} roughness={0.56} />
          </mesh>
          <mesh position={[0, -0.48, 0]} scale={[1, 0.88, 0.96]}>
            <sphereGeometry args={[0.12, 14, 10]} />
            <meshStandardMaterial color={trousers} roughness={0.56} />
          </mesh>
          <mesh position={[0, -0.65, 0]}>
            <capsuleGeometry args={[0.112, 0.2, 6, 12]} />
            <meshStandardMaterial color={trousers} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.86, 0.1]} scale={[0.18, 0.11, 0.32]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color={shoes} roughness={0.3} metalness={0.08} />
          </mesh>
          <mesh position={[0, -0.945, 0.105]} scale={[0.19, 0.025, 0.33]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#020711" roughness={0.48} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.18, 0.91, 0]}>
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.125, 0.3, 6, 12]} />
            <meshStandardMaterial color={trousers} roughness={0.56} />
          </mesh>
          <mesh position={[0, -0.48, 0]} scale={[1, 0.88, 0.96]}>
            <sphereGeometry args={[0.12, 14, 10]} />
            <meshStandardMaterial color={trousers} roughness={0.56} />
          </mesh>
          <mesh position={[0, -0.65, 0]}>
            <capsuleGeometry args={[0.112, 0.2, 6, 12]} />
            <meshStandardMaterial color={trousers} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.86, 0.1]} scale={[0.18, 0.11, 0.32]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color={shoes} roughness={0.3} metalness={0.08} />
          </mesh>
          <mesh position={[0, -0.945, 0.105]} scale={[0.19, 0.025, 0.33]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#020711" roughness={0.48} />
          </mesh>
        </group>

        <mesh position={[0, 1.43, 0]} scale={[1.34, 1, 0.8]}>
          <capsuleGeometry args={[0.32, 0.54, 8, 16]} />
          <meshStandardMaterial color={shirt} roughness={0.62} />
        </mesh>
        <mesh position={[0, 1.45, 0.321]} scale={[0.018, 0.52, 0.018]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={shirtShadow} roughness={0.65} />
        </mesh>
        <mesh position={[-0.085, 1.79, 0.326]} rotation={[0, 0, -0.48]} scale={[0.1, 0.18, 0.022]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={shirtShadow} roughness={0.62} />
        </mesh>
        <mesh position={[0.085, 1.79, 0.326]} rotation={[0, 0, 0.48]} scale={[0.1, 0.18, 0.022]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={shirtShadow} roughness={0.62} />
        </mesh>
        <mesh position={[0, 1.59, 0.342]}>
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshStandardMaterial color="#23456a" roughness={0.48} />
        </mesh>
        <mesh position={[0, 1.4, 0.342]}>
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshStandardMaterial color="#23456a" roughness={0.48} />
        </mesh>
        <mesh position={[0, 1.21, 0.342]}>
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshStandardMaterial color="#23456a" roughness={0.48} />
        </mesh>

        <group ref={leftArmRef} position={[-0.49, 1.78, 0]}>
          <mesh position={[0, -0.06, 0]} scale={[1, 0.92, 0.94]}>
            <sphereGeometry args={[0.15, 14, 10]} />
            <meshStandardMaterial color={shirt} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.115, 0.26, 6, 12]} />
            <meshStandardMaterial color={shirt} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.55, 0]} scale={[1, 0.88, 0.96]}>
            <sphereGeometry args={[0.105, 12, 8]} />
            <meshStandardMaterial color={shirtShadow} roughness={0.64} />
          </mesh>
          <mesh position={[0, -0.72, 0]}>
            <capsuleGeometry args={[0.105, 0.18, 6, 12]} />
            <meshStandardMaterial color={shirt} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.85, 0]} scale={[1.05, 0.56, 1.02]}>
            <cylinderGeometry args={[0.11, 0.11, 0.12, 12]} />
            <meshStandardMaterial color={shirtShadow} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.93, 0.015]} scale={[0.88, 1.18, 0.72]}>
            <sphereGeometry args={[0.13, 14, 10]} />
            <meshStandardMaterial color={skin} roughness={0.58} />
          </mesh>
          <mesh
            position={[-0.095, -0.91, 0.025]}
            scale={[0.48, 0.9, 0.55]}
            rotation={[0, 0, -0.25]}
          >
            <sphereGeometry args={[0.075, 10, 8]} />
            <meshStandardMaterial color={skinShadow} roughness={0.58} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.49, 1.78, 0]}>
          <mesh position={[0, -0.06, 0]} scale={[1, 0.92, 0.94]}>
            <sphereGeometry args={[0.15, 14, 10]} />
            <meshStandardMaterial color={shirt} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.115, 0.26, 6, 12]} />
            <meshStandardMaterial color={shirt} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.55, 0]} scale={[1, 0.88, 0.96]}>
            <sphereGeometry args={[0.105, 12, 8]} />
            <meshStandardMaterial color={shirtShadow} roughness={0.64} />
          </mesh>
          <mesh position={[0, -0.72, 0]}>
            <capsuleGeometry args={[0.105, 0.18, 6, 12]} />
            <meshStandardMaterial color={shirt} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.85, 0]} scale={[1.05, 0.56, 1.02]}>
            <cylinderGeometry args={[0.11, 0.11, 0.12, 12]} />
            <meshStandardMaterial color={shirtShadow} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.93, 0.015]} scale={[0.88, 1.18, 0.72]}>
            <sphereGeometry args={[0.13, 14, 10]} />
            <meshStandardMaterial color={skin} roughness={0.58} />
          </mesh>
          <mesh position={[0.095, -0.91, 0.025]} scale={[0.48, 0.9, 0.55]} rotation={[0, 0, 0.25]}>
            <sphereGeometry args={[0.075, 10, 8]} />
            <meshStandardMaterial color={skinShadow} roughness={0.58} />
          </mesh>
        </group>

        <mesh position={[0, 2.05, 0]}>
          <cylinderGeometry args={[0.105, 0.125, 0.25, 16]} />
          <meshStandardMaterial color={skin} roughness={0.56} />
        </mesh>
        <mesh position={[-0.255, 2.39, 0]} scale={[0.5, 0.82, 0.34]}>
          <sphereGeometry args={[0.1, 14, 10]} />
          <meshStandardMaterial color={skinShadow} roughness={0.58} />
        </mesh>
        <mesh position={[0.255, 2.39, 0]} scale={[0.5, 0.82, 0.34]}>
          <sphereGeometry args={[0.1, 14, 10]} />
          <meshStandardMaterial color={skinShadow} roughness={0.58} />
        </mesh>
        <mesh position={[0, 2.39, 0]} scale={[0.78, 1.04, 0.75]}>
          <sphereGeometry args={[0.32, 28, 20]} />
          <meshStandardMaterial color={skin} roughness={0.62} />
        </mesh>

        <mesh position={[0, 2.6, -0.025]} scale={[0.82, 0.48, 0.79]}>
          <sphereGeometry args={[0.34, 22, 16]} />
          <meshStandardMaterial color={hair} roughness={0.78} />
        </mesh>
        <mesh position={[-0.225, 2.47, -0.035]} scale={[0.26, 0.53, 0.66]}>
          <sphereGeometry args={[0.3, 18, 14]} />
          <meshStandardMaterial color={hair} roughness={0.78} />
        </mesh>
        <mesh position={[0.225, 2.47, -0.035]} scale={[0.26, 0.53, 0.66]}>
          <sphereGeometry args={[0.3, 18, 14]} />
          <meshStandardMaterial color={hair} roughness={0.78} />
        </mesh>
        <mesh position={[-0.12, 2.63, 0.18]} rotation={[0.12, 0, -0.34]} scale={[0.55, 0.22, 0.36]}>
          <sphereGeometry args={[0.18, 14, 10]} />
          <meshStandardMaterial color={hair} roughness={0.78} />
        </mesh>
        <mesh position={[0.08, 2.64, 0.19]} rotation={[0.08, 0, 0.22]} scale={[0.62, 0.2, 0.34]}>
          <sphereGeometry args={[0.18, 14, 10]} />
          <meshStandardMaterial color={hair} roughness={0.78} />
        </mesh>

        <mesh position={[-0.105, 2.43, 0.253]} scale={[1.36, 0.72, 0.35]}>
          <sphereGeometry args={[0.047, 14, 10]} />
          <meshStandardMaterial color="#eef7ff" roughness={0.25} />
        </mesh>
        <mesh position={[0.105, 2.43, 0.253]} scale={[1.36, 0.72, 0.35]}>
          <sphereGeometry args={[0.047, 14, 10]} />
          <meshStandardMaterial color="#eef7ff" roughness={0.25} />
        </mesh>
        <mesh position={[-0.105, 2.43, 0.289]} scale={[0.82, 1, 0.45]}>
          <sphereGeometry args={[0.028, 12, 8]} />
          <meshStandardMaterial color="#27364c" roughness={0.22} />
        </mesh>
        <mesh position={[0.105, 2.43, 0.289]} scale={[0.82, 1, 0.45]}>
          <sphereGeometry args={[0.028, 12, 8]} />
          <meshStandardMaterial color="#27364c" roughness={0.22} />
        </mesh>
        <mesh position={[-0.105, 2.43, 0.31]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshBasicMaterial color="#050911" />
        </mesh>
        <mesh position={[0.105, 2.43, 0.31]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshBasicMaterial color="#050911" />
        </mesh>
        <mesh position={[-0.105, 2.49, 0.27]} rotation={[0, 0, -0.08]} scale={[0.13, 0.018, 0.02]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={hair} roughness={0.7} />
        </mesh>
        <mesh position={[0.105, 2.49, 0.27]} rotation={[0, 0, 0.08]} scale={[0.13, 0.018, 0.02]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={hair} roughness={0.7} />
        </mesh>

        <mesh position={[-0.105, 2.43, 0.305]}>
          <torusGeometry args={[0.066, 0.009, 6, 20]} />
          <meshStandardMaterial color="#0a1424" roughness={0.26} metalness={0.35} />
        </mesh>
        <mesh position={[0.105, 2.43, 0.305]}>
          <torusGeometry args={[0.066, 0.009, 6, 20]} />
          <meshStandardMaterial color="#0a1424" roughness={0.26} metalness={0.35} />
        </mesh>
        <mesh position={[0, 2.43, 0.307]} scale={[0.08, 0.012, 0.012]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#0a1424" roughness={0.26} metalness={0.35} />
        </mesh>

        <mesh position={[0, 2.355, 0.294]} scale={[0.48, 0.92, 0.56]}>
          <sphereGeometry args={[0.045, 12, 8]} />
          <meshStandardMaterial color={skinShadow} roughness={0.64} />
        </mesh>
        <mesh position={[0, 2.293, 0.307]} scale={[0.115, 0.022, 0.02]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#69362f" roughness={0.68} />
        </mesh>
        <mesh position={[0, 2.275, 0.292]} scale={[0.09, 0.012, 0.016]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#9c584f" roughness={0.72} />
        </mesh>
      </group>
    </group>
  );
}

function RobotCompanion({
  positionRef,
  headingRef,
  darkMode,
  reducedMotion,
}: {
  positionRef: RefObject<Vector3>;
  headingRef: RefObject<number>;
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
    const heading = headingRef.current;
    const forwardX = Math.sin(heading);
    const forwardZ = Math.cos(heading);
    const rightX = Math.cos(heading);
    const rightZ = -Math.sin(heading);
    target.set(
      character.x + rightX * 0.82 - forwardX * 0.38,
      0,
      character.z + rightZ * 0.82 - forwardZ * 0.38,
    );
    robot.position.lerp(target, reducedMotion ? 0.22 : 0.095);
    robot.position.y = reducedMotion
      ? 0.08
      : 0.09 + Math.sin(state.clock.elapsedTime * 2.8) * 0.045;
    const rotationDelta = Math.atan2(
      Math.sin(heading - robot.rotation.y),
      Math.cos(heading - robot.rotation.y),
    );
    robot.rotation.y += rotationDelta * (reducedMotion ? 0.2 : 0.11);
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

function SocialIconMark({ label }: { label: string }) {
  const markMaterial = (
    <meshStandardMaterial
      color="#ffe3ae"
      emissive="#d59a4f"
      emissiveIntensity={0.12}
      roughness={0.46}
      metalness={0.04}
    />
  );

  if (label === "LinkedIn") {
    return (
      <group position={[0, 0, 0.095]}>
        <mesh position={[-0.18, -0.07, 0]} scale={[0.065, 0.25, 0.055]}>
          <boxGeometry args={[1, 1, 1]} />
          {markMaterial}
        </mesh>
        <mesh position={[-0.18, 0.17, 0]}>
          <sphereGeometry args={[0.045, 12, 8]} />
          {markMaterial}
        </mesh>
        <mesh position={[-0.005, -0.07, 0]} scale={[0.065, 0.25, 0.055]}>
          <boxGeometry args={[1, 1, 1]} />
          {markMaterial}
        </mesh>
        <mesh position={[0.17, -0.07, 0]} scale={[0.065, 0.25, 0.055]}>
          <boxGeometry args={[1, 1, 1]} />
          {markMaterial}
        </mesh>
        <mesh position={[0.082, 0.05, 0]} scale={[0.24, 0.065, 0.055]}>
          <boxGeometry args={[1, 1, 1]} />
          {markMaterial}
        </mesh>
      </group>
    );
  }

  if (label === "GitHub") {
    return (
      <group position={[0, -0.015, 0.1]}>
        <mesh scale={[1, 0.9, 0.25]}>
          <sphereGeometry args={[0.2, 20, 14]} />
          {markMaterial}
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.125, 0.17, 0]} rotation={[0, 0, side * 0.12]}>
            <coneGeometry args={[0.085, 0.16, 3]} />
            {markMaterial}
          </mesh>
        ))}
        <mesh position={[0, -0.2, 0]} scale={[0.23, 0.16, 0.055]}>
          <sphereGeometry args={[1, 16, 10]} />
          {markMaterial}
        </mesh>
      </group>
    );
  }

  if (label === "Facebook") {
    return (
      <group position={[0.02, 0, 0.095]}>
        <mesh position={[-0.035, -0.02, 0]} scale={[0.085, 0.47, 0.055]}>
          <boxGeometry args={[1, 1, 1]} />
          {markMaterial}
        </mesh>
        <mesh position={[0.075, 0.19, 0]} scale={[0.3, 0.085, 0.055]}>
          <boxGeometry args={[1, 1, 1]} />
          {markMaterial}
        </mesh>
        <mesh position={[0.045, 0.035, 0]} scale={[0.24, 0.075, 0.055]}>
          <boxGeometry args={[1, 1, 1]} />
          {markMaterial}
        </mesh>
      </group>
    );
  }

  if (label === "X") {
    return (
      <group position={[0, 0, 0.095]}>
        {[-1, 1].map((direction) => (
          <mesh key={direction} rotation={[0, 0, direction * 0.66]} scale={[0.075, 0.5, 0.055]}>
            <boxGeometry args={[1, 1, 1]} />
            {markMaterial}
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group position={[0, 0, 0.095]}>
      <mesh position={[0, 0.215, 0]} scale={[0.48, 0.065, 0.055]}>
        <boxGeometry args={[1, 1, 1]} />
        {markMaterial}
      </mesh>
      <mesh position={[0, -0.215, 0]} scale={[0.48, 0.065, 0.055]}>
        <boxGeometry args={[1, 1, 1]} />
        {markMaterial}
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.215, 0, 0]} scale={[0.065, 0.48, 0.055]}>
          <boxGeometry args={[1, 1, 1]} />
          {markMaterial}
        </mesh>
      ))}
      <mesh>
        <torusGeometry args={[0.105, 0.035, 8, 20]} />
        {markMaterial}
      </mesh>
      <mesh position={[0.13, 0.13, 0]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        {markMaterial}
      </mesh>
    </group>
  );
}

function SocialIconSculpture({
  item,
  index,
  plateGeometry,
  darkMode,
  reducedMotion,
}: {
  item: (typeof SOCIAL_OBJECTS)[number];
  index: number;
  plateGeometry: RoundedBoxGeometry;
  darkMode: boolean;
  reducedMotion: boolean;
}) {
  const rootRef = useRef<Group>(null);
  const hoveredRef = useRef(false);
  const woodDark = darkMode ? "#32190d" : "#4f2914";
  const woodMid = darkMode ? "#70401f" : "#875029";
  const woodLight = darkMode ? "#a56a35" : "#b8783e";

  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );

  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;
    const float = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.8 + index * 0.7) * 0.025;
    root.position.y = MathUtils.lerp(root.position.y, 0.86 + float, 0.08);
    const scale = hoveredRef.current ? 1.1 : 1;
    const nextScale = MathUtils.lerp(root.scale.x, scale, 0.12);
    root.scale.setScalar(nextScale);
  });

  return (
    <group
      ref={rootRef}
      position={[item.x, 0.86, item.z]}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        window.open(item.href, "_blank", "noopener,noreferrer");
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        hoveredRef.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hoveredRef.current = false;
        document.body.style.cursor = "";
      }}
    >
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.9, 0.9, 0.34]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>
      <mesh geometry={plateGeometry}>
        <meshStandardMaterial color={woodDark} roughness={0.86} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0, 0.1]} scale={[0.86, 0.86, 0.34]} geometry={plateGeometry}>
        <meshStandardMaterial color={woodMid} roughness={0.8} metalness={0.02} />
      </mesh>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((y) => (
          <mesh key={`social-bolt-${x}-${y}`} position={[x * 0.235, y * 0.245, 0.135]}>
            <sphereGeometry args={[0.025, 10, 8]} />
            <meshStandardMaterial color="#d6a15d" roughness={0.38} metalness={0.52} />
          </mesh>
        )),
      )}
      <group position={[0, 0, 0.075]}>
        <SocialIconMark label={item.label} />
      </group>
      <mesh position={[0, -0.48, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 0.28, 10]} />
        <meshStandardMaterial color={woodMid} roughness={0.88} metalness={0.02} />
      </mesh>
      <mesh position={[0, -0.65, 0.02]} scale={[0.45, 0.075, 0.28]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={woodLight} roughness={0.9} metalness={0.01} />
      </mesh>
    </group>
  );
}

function SocialLandmarks({
  darkMode,
  reducedMotion,
}: {
  darkMode: boolean;
  reducedMotion: boolean;
}) {
  const plateGeometry = useMemo(() => new RoundedBoxGeometry(0.64, 0.66, 0.16, 3, 0.12), []);

  useEffect(() => () => plateGeometry.dispose(), [plateGeometry]);

  return (
    <group name="social-landmarks">
      {SOCIAL_OBJECTS.map((item, index) => (
        <SocialIconSculpture
          key={item.label}
          item={item}
          index={index}
          plateGeometry={plateGeometry}
          darkMode={darkMode}
          reducedMotion={reducedMotion}
        />
      ))}
      <pointLight
        position={[0, 1.35, -24.65]}
        color="#ffc36b"
        intensity={darkMode ? 1.8 : 0.28}
        distance={5.2}
      />
    </group>
  );
}

function RoadSignLabel({ label, index }: { label: string; index: number }) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const woodGradient = context.createLinearGradient(14, 18, 498, 110);
    woodGradient.addColorStop(0, "#70401f");
    woodGradient.addColorStop(0.5, "#a56a35");
    woodGradient.addColorStop(1, "#74411f");
    context.fillStyle = woodGradient;
    context.beginPath();
    context.roundRect(14, 18, 484, 92, 18);
    context.fill();
    context.strokeStyle = "#32190d";
    context.lineWidth = 8;
    context.stroke();
    context.strokeStyle = "rgba(255,224,170,.22)";
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(22, 26, 468, 76, 13);
    context.stroke();

    context.fillStyle = "#32190d";
    context.beginPath();
    context.roundRect(28, 29, 88, 70, 15);
    context.fill();
    context.strokeStyle = "#d6a15d";
    context.lineWidth = 3;
    context.stroke();

    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillStyle = "#ffe3ae";
    context.font = "800 32px Arial, sans-serif";
    context.fillText(String(index + 1).padStart(2, "0"), 72, 65);

    context.textAlign = "left";
    context.fillStyle = "#fff1cb";
    context.shadowColor = "rgba(45,20,7,.85)";
    context.shadowOffsetY = 3;
    context.shadowBlur = 1;
    context.font = `800 ${label.length > 12 ? 35 : 43}px Arial, sans-serif`;
    context.fillText(label.toUpperCase(), 140, 66, 336);
    const nextTexture = new CanvasTexture(canvas);
    nextTexture.colorSpace = SRGBColorSpace;
    nextTexture.minFilter = LinearFilter;
    nextTexture.magFilter = LinearFilter;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [index, label]);

  useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <mesh position={[0, 0, 0.071]}>
      <planeGeometry args={[1.62, 0.4]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

function drawScreenText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }
  if (line && lines.length < maxLines) lines.push(line);

  if (lines.join(" ").length < text.length && lines.length) {
    let finalLine = lines[lines.length - 1] ?? "";
    while (context.measureText(`${finalLine}...`).width > maxWidth && finalLine.includes(" ")) {
      finalLine = finalLine.slice(0, finalLine.lastIndexOf(" "));
    }
    lines[lines.length - 1] = `${finalLine}...`;
  }

  lines.forEach((value, index) => context.fillText(value, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function VillageShowcaseScreen({
  section,
  slide,
  slideIndex,
  total,
  darkMode,
  onPrevious,
  onNext,
  onClose,
}: {
  section: StudioZoneId;
  slide: ShowcaseSlide;
  slideIndex: number;
  total: number;
  darkMode: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const screenGroupRef = useRef<Group>(null);
  const zoneIndex = ZONES.findIndex((zone) => zone.id === section);
  const zone = ZONES[Math.max(0, zoneIndex)]!;
  const side = zoneIndex % 2 === 0 ? -1 : 1;
  const woodDark = darkMode ? "#32190d" : "#5a3018";
  const woodMid = darkMode ? "#70401f" : "#8b542b";
  const woodLight = darkMode ? "#a56a35" : "#b97a42";
  const woodHighlight = darkMode ? "#d6a15d" : "#dca563";
  const warmGlow = "#ffc36b";
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const nextTexture = new CanvasTexture(canvas);
    nextTexture.colorSpace = SRGBColorSpace;
    nextTexture.minFilter = LinearFilter;
    nextTexture.magFilter = LinearFilter;
    return nextTexture;
  }, []);
  const frameGeometry = useMemo(() => new RoundedBoxGeometry(4.5, 2.85, 0.2, 4, 0.18), []);

  useEffect(() => {
    if (!texture) return;
    const canvas = texture.image as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) return;
    let cancelled = false;

    const draw = (image?: HTMLImageElement) => {
      const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#623719");
      gradient.addColorStop(0.48, "#8a562d");
      gradient.addColorStop(1, "#68401f");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.strokeStyle = "rgba(255,225,174,.055)";
      context.lineWidth = 2;
      for (let x = 38; x < canvas.width; x += 118) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }
      for (let y = 0; y < canvas.height; y += 144) {
        context.strokeStyle = "rgba(48,22,8,.52)";
        context.lineWidth = 5;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
        context.strokeStyle = "rgba(255,225,174,.1)";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, y + 5);
        context.lineTo(canvas.width, y + 5);
        context.stroke();
      }

      [
        [190, 320, 19],
        [780, 575, 13],
        [1120, 286, 16],
      ].forEach(([x = 0, y = 0, radius = 0]) => {
        context.strokeStyle = "rgba(52,24,9,.28)";
        context.lineWidth = 5;
        context.beginPath();
        context.ellipse(x, y, radius * 1.8, radius, -0.18, 0, Math.PI * 2);
        context.stroke();
      });

      context.fillStyle = "rgba(55,27,11,.48)";
      context.fillRect(0, 0, canvas.width, 96);
      context.fillStyle = "rgba(255,214,142,.54)";
      context.fillRect(52, 94, 1176, 2);

      context.fillStyle = "#e5b16b";
      context.font = "700 24px Arial, sans-serif";
      context.letterSpacing = "3px";
      context.fillText(`AA VILLAGE / ${section.toUpperCase()}`, 62, 60);
      context.letterSpacing = "0px";
      context.textAlign = "right";
      context.fillStyle = "#f1cf96";
      context.fillText(
        `${String(slideIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
        1218,
        60,
      );
      context.textAlign = "left";

      const hasImage = Boolean(image);
      const mediaPanelX = 52;
      const mediaPanelY = 120;
      const mediaPanelWidth = 430;
      const panelHeight = 548;
      const infoPanelX = hasImage ? 506 : 52;
      const infoPanelWidth = hasImage ? 722 : 1176;
      const copyX = infoPanelX + 36;
      const copyWidth = infoPanelWidth - 72;

      context.fillStyle = "rgba(68,34,14,.55)";
      context.strokeStyle = "rgba(247,194,117,.46)";
      context.lineWidth = 3;
      context.beginPath();
      context.roundRect(infoPanelX, mediaPanelY, infoPanelWidth, panelHeight, 22);
      context.fill();
      context.stroke();

      context.strokeStyle = "rgba(45,20,7,.62)";
      context.lineWidth = 2;
      context.beginPath();
      context.roundRect(infoPanelX + 8, mediaPanelY + 8, infoPanelWidth - 16, panelHeight - 16, 17);
      context.stroke();

      if (image) {
        context.fillStyle = "rgba(68,34,14,.62)";
        context.beginPath();
        context.roundRect(mediaPanelX, mediaPanelY, mediaPanelWidth, panelHeight, 22);
        context.fill();
        context.strokeStyle = "rgba(229,177,107,.38)";
        context.stroke();

        context.fillStyle = "#d7a665";
        context.font = "700 17px Arial, sans-serif";
        context.letterSpacing = "2px";
        context.fillText("DOCUMENT PREVIEW", mediaPanelX + 28, mediaPanelY + 40);
        context.letterSpacing = "0px";

        const boxX = mediaPanelX + 24;
        const boxY = mediaPanelY + 62;
        const boxWidth = mediaPanelWidth - 48;
        const boxHeight = 420;
        context.save();
        context.beginPath();
        context.roundRect(boxX, boxY, boxWidth, boxHeight, 16);
        context.clip();
        context.fillStyle = "#2d180b";
        context.fillRect(boxX, boxY, boxWidth, boxHeight);
        const scale = Math.min(boxWidth / image.naturalWidth, boxHeight / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        context.drawImage(
          image,
          boxX + (boxWidth - width) / 2,
          boxY + (boxHeight - height) / 2,
          width,
          height,
        );
        context.restore();
        context.strokeStyle = "rgba(229,177,107,.52)";
        context.lineWidth = 3;
        context.beginPath();
        context.roundRect(boxX, boxY, boxWidth, boxHeight, 16);
        context.stroke();

        context.fillStyle = "#ead8b7";
        context.font = "600 16px Arial, sans-serif";
        context.fillText("Verified portfolio document", mediaPanelX + 28, mediaPanelY + 520);
      }

      context.fillStyle = "#e5b16b";
      context.font = "700 20px Arial, sans-serif";
      context.letterSpacing = "2px";
      context.fillText(slide.eyebrow.toUpperCase(), copyX, 166);
      context.letterSpacing = "0px";

      let cursorY = 226;
      if (slide.metric) {
        context.fillStyle = "rgba(229,177,107,.14)";
        context.beginPath();
        const metricWidth = Math.min(context.measureText(slide.metric).width + 52, copyWidth);
        context.roundRect(copyX, cursorY - 30, metricWidth, 44, 22);
        context.fill();
        context.strokeStyle = "rgba(229,177,107,.3)";
        context.lineWidth = 1;
        context.stroke();
        context.fillStyle = "#f1cf96";
        context.font = "700 19px Arial, sans-serif";
        context.fillText(slide.metric, copyX + 20, cursorY - 1);
        cursorY += 60;
      }

      context.fillStyle = "#fff1cb";
      context.font = `700 ${hasImage ? 50 : 60}px Arial, sans-serif`;
      cursorY = drawScreenText(
        context,
        slide.title,
        copyX,
        cursorY,
        copyWidth,
        hasImage ? 54 : 64,
        3,
      );

      const dividerY = Math.min(cursorY + 20, 488);
      context.fillStyle = "rgba(255,214,142,.42)";
      context.fillRect(copyX, dividerY, copyWidth, 2);

      context.fillStyle = "#d7a665";
      context.font = "700 16px Arial, sans-serif";
      context.letterSpacing = "2px";
      context.fillText("OVERVIEW", copyX, dividerY + 40);
      context.letterSpacing = "0px";

      context.fillStyle = "#ead8b7";
      context.font = "400 24px Arial, sans-serif";
      cursorY = drawScreenText(
        context,
        slide.description,
        copyX,
        dividerY + 78,
        copyWidth,
        34,
        hasImage ? 3 : 4,
      );

      if (slide.chips?.length) {
        context.fillStyle = "#d7a665";
        context.font = "700 15px Arial, sans-serif";
        context.letterSpacing = "2px";
        const detailsY = Math.min(cursorY + 24, 596);
        context.fillText("DETAILS", copyX, detailsY);
        context.letterSpacing = "0px";

        context.font = "600 18px Arial, sans-serif";
        let chipX = copyX;
        let chipY = detailsY + 43;
        for (const chip of slide.chips.slice(0, 8)) {
          const chipWidth = Math.min(context.measureText(chip).width + 34, copyWidth);
          if (chipX + chipWidth > copyX + copyWidth) {
            chipX = copyX;
            chipY += 46;
          }
          if (chipY > 650) break;
          context.fillStyle = "rgba(42,19,7,.34)";
          context.beginPath();
          context.roundRect(chipX, chipY - 27, chipWidth, 35, 18);
          context.fill();
          context.strokeStyle = "rgba(247,194,117,.52)";
          context.stroke();
          context.fillStyle = "#f4dfba";
          context.fillText(chip, chipX + 17, chipY - 3);
          chipX += chipWidth + 12;
        }
      }

      context.fillStyle = "rgba(255,225,175,.025)";
      for (let y = 0; y < canvas.height; y += 6) context.fillRect(0, y, canvas.width, 1);
      texture.needsUpdate = true;
    };

    draw();
    if (slide.image) {
      const image = new Image();
      image.onload = () => {
        if (!cancelled) draw(image);
      };
      image.src = slide.image;
    }

    return () => {
      cancelled = true;
    };
  }, [section, slide, slideIndex, texture, total]);

  useEffect(
    () => () => {
      texture?.dispose();
      frameGeometry.dispose();
    },
    [frameGeometry, texture],
  );

  useFrame(() => {
    if (!screenGroupRef.current) return;
    screenGroupRef.current.scale.x = MathUtils.lerp(screenGroupRef.current.scale.x, 1, 0.12);
    screenGroupRef.current.scale.y = MathUtils.lerp(screenGroupRef.current.scale.y, 1, 0.12);
    screenGroupRef.current.scale.z = MathUtils.lerp(screenGroupRef.current.scale.z, 1, 0.12);
  });

  const handlePointerOver = () => {
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = () => {
    document.body.style.cursor = "";
  };

  return (
    <group
      ref={screenGroupRef}
      position={[zone.position[0] + side * SHOWCASE_SCREEN_OFFSET, 0, zone.position[2] + 0.22]}
      scale={0.72}
    >
      <mesh position={[0, 2.25, 0]} geometry={frameGeometry}>
        <meshStandardMaterial color={woodDark} roughness={0.82} metalness={0.03} />
      </mesh>
      {[-1, 1].map((vertical) => (
        <mesh key={`showcase-rail-${vertical}`} position={[0, 2.25 + vertical * 1.28, 0.14]}>
          <boxGeometry args={[4.38, 0.16, 0.16]} />
          <meshStandardMaterial color={vertical > 0 ? woodLight : woodMid} roughness={0.78} />
        </mesh>
      ))}
      {[-1, 1].map((horizontal) => (
        <mesh key={`showcase-side-${horizontal}`} position={[horizontal * 2.1, 2.25, 0.14]}>
          <boxGeometry args={[0.16, 2.46, 0.16]} />
          <meshStandardMaterial color={horizontal > 0 ? woodMid : woodLight} roughness={0.8} />
        </mesh>
      ))}
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((y) => (
          <mesh key={`showcase-bolt-${x}-${y}`} position={[x * 2.07, 2.25 + y * 1.22, 0.25]}>
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshStandardMaterial color={woodHighlight} roughness={0.42} metalness={0.5} />
          </mesh>
        )),
      )}
      <mesh position={[0, 2.25, 0.115]}>
        <planeGeometry args={[4.15, 2.5]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.2, 1.3]} color={warmGlow} intensity={1.8} distance={5} />
      <pointLight
        position={[-side * SHOWCASE_SCREEN_OFFSET, 1.75, 0.65]}
        color="#ffd89a"
        intensity={darkMode ? 3.4 : 1.2}
        distance={4.4}
      />
      <mesh
        position={[-side * SHOWCASE_SCREEN_OFFSET, 0.035, -0.22]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.58, 0.72, 40]} />
        <meshBasicMaterial color={woodHighlight} transparent opacity={0.82} />
      </mesh>

      <group position={[0, 0.48, -0.04]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[2.55, 0.22, 0.34]} />
          <meshStandardMaterial color={woodDark} roughness={0.84} />
        </mesh>
        {[-1, 1].map((x) => (
          <mesh key={`showcase-post-${x}`} position={[x * 1.72, 0.3, -0.05]}>
            <boxGeometry args={[0.2, 0.72, 0.22]} />
            <meshStandardMaterial color={woodMid} roughness={0.86} />
          </mesh>
        ))}
      </group>

      <group position={[0, 0.55, 0.12]}>
        <group
          position={[-0.78, 0, 0]}
          onPointerDown={(event) => {
            event.stopPropagation();
            onPrevious();
          }}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.14, 24]} />
            <meshStandardMaterial color={woodMid} roughness={0.78} metalness={0.04} />
          </mesh>
          <mesh position={[0, 0, 0.09]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.11, 0.24, 3]} />
            <meshBasicMaterial color="#ffe6b7" />
          </mesh>
        </group>
        <group
          onPointerDown={(event) => {
            event.stopPropagation();
            onClose();
          }}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.14, 24]} />
            <meshStandardMaterial color={woodDark} roughness={0.8} metalness={0.03} />
          </mesh>
          <mesh position={[0, 0, 0.09]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.28, 0.04, 0.035]} />
            <meshBasicMaterial color="#f4bf78" />
          </mesh>
          <mesh position={[0, 0, 0.09]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.28, 0.04, 0.035]} />
            <meshBasicMaterial color="#f4bf78" />
          </mesh>
        </group>
        <group
          position={[0.78, 0, 0]}
          onPointerDown={(event) => {
            event.stopPropagation();
            onNext();
          }}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.14, 24]} />
            <meshStandardMaterial color={woodMid} roughness={0.78} metalness={0.04} />
          </mesh>
          <mesh position={[0, 0, 0.09]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.11, 0.24, 3]} />
            <meshBasicMaterial color="#ffe6b7" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function SectionLandmark({
  zone,
  index,
  side,
  darkMode,
  pathEdge,
  inputRef,
}: {
  zone: Zone;
  index: number;
  side: number;
  darkMode: boolean;
  pathEdge: string;
  inputRef: RefObject<StudioInput>;
}) {
  const pale = "#fff1cb";
  const deep = darkMode ? "#32190d" : "#4b2813";
  const woodDark = deep;
  const woodMid = darkMode ? "#70401f" : "#875029";
  const woodLight = darkMode ? "#a56a35" : "#b8783e";
  const brass = "#d6a15d";
  const warmLight = "#ffd89a";

  return (
    <group
      onPointerDown={(event) => {
        event.stopPropagation();
        inputRef.current.route = [];
        inputRef.current.target = {
          x: zone.position[0] + side * LANDMARK_APPROACH_OFFSET,
          z: zone.position[2],
        };
        inputRef.current.x = 0;
        inputRef.current.z = 0;
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.82, 0.9, 0.16, 12]} />
        <meshStandardMaterial color={pathEdge} roughness={0.68} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.7, 0.76, 0.12, 12]} />
        <meshStandardMaterial color={woodLight} roughness={0.82} metalness={0.02} />
      </mesh>

      <group position={[0, 0.24, -0.34]}>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[1.52, 1.08, 0.72]} />
          <meshStandardMaterial color={index % 2 === 0 ? woodLight : woodMid} roughness={0.86} />
        </mesh>
        <mesh position={[0, 1.42, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.02, 0.58, 4]} />
          <meshStandardMaterial color={deep} roughness={0.9} metalness={0.01} />
        </mesh>
        <mesh position={[0, 0.47, 0.38]}>
          <boxGeometry args={[0.34, 0.62, 0.055]} />
          <meshStandardMaterial color={deep} roughness={0.4} />
        </mesh>
        {[-0.48, 0.48].map((x) => (
          <mesh key={`window-${x}`} position={[x, 0.78, 0.385]}>
            <boxGeometry args={[0.3, 0.3, 0.045]} />
            <meshStandardMaterial
              color={warmLight}
              emissive="#ffbf69"
              emissiveIntensity={darkMode ? 1.6 : 0.2}
              roughness={0.24}
            />
          </mesh>
        ))}
      </group>

      {index === 0 ? (
        <group position={[0, 0.25, 0]}>
          <mesh position={[-0.48, 0.62, 0]}>
            <boxGeometry args={[0.14, 1.12, 0.24]} />
            <meshStandardMaterial color={woodLight} roughness={0.86} />
          </mesh>
          <mesh position={[0.48, 0.62, 0]}>
            <boxGeometry args={[0.14, 1.12, 0.24]} />
            <meshStandardMaterial color={woodLight} roughness={0.86} />
          </mesh>
          <mesh position={[0, 1.13, 0]}>
            <boxGeometry args={[1.1, 0.14, 0.24]} />
            <meshStandardMaterial
              color={woodMid}
              emissive="#7a421f"
              emissiveIntensity={darkMode ? 0.08 : 0}
            />
          </mesh>
          <mesh position={[0, 0.79, 0.15]}>
            <sphereGeometry args={[0.2, 18, 12]} />
            <meshStandardMaterial color={pale} roughness={0.46} />
          </mesh>
          <mesh position={[0, 0.42, 0.14]} scale={[1.25, 0.72, 0.46]}>
            <sphereGeometry args={[0.3, 18, 12]} />
            <meshStandardMaterial color={deep} roughness={0.5} />
          </mesh>
        </group>
      ) : null}

      {index === 1 ? (
        <group position={[0, 0.25, 0]}>
          {[0.55, 0.84, 1.12, 0.75, 0.96].map((height, barIndex) => (
            <mesh key={barIndex} position={[-0.48 + barIndex * 0.24, height / 2, 0]}>
              <boxGeometry args={[0.14, height, 0.22]} />
              <meshStandardMaterial
                color={barIndex % 2 === 0 ? woodLight : pale}
                emissive="#000000"
                emissiveIntensity={0}
                roughness={0.76}
              />
            </mesh>
          ))}
          <mesh position={[0, 0.62, -0.02]}>
            <boxGeometry args={[1.18, 0.055, 0.3]} />
            <meshStandardMaterial color={deep} roughness={0.5} />
          </mesh>
        </group>
      ) : null}

      {index === 2 ? (
        <group position={[0, 0.81, 0]}>
          <mesh>
            <boxGeometry args={[1.12, 0.92, 0.2]} />
            <meshStandardMaterial color={pale} roughness={0.42} />
          </mesh>
          {[-0.2, 0, 0.2].map((y) => (
            <mesh key={y} position={[-0.16, y, 0.115]}>
              <boxGeometry args={[0.55, 0.045, 0.025]} />
              <meshStandardMaterial color={woodMid} roughness={0.78} />
            </mesh>
          ))}
          <mesh position={[0.3, -0.18, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.05, 20]} />
            <meshStandardMaterial
              color={brass}
              emissive="#9a642d"
              emissiveIntensity={darkMode ? 0.12 : 0}
            />
          </mesh>
          <mesh position={[0.24, -0.46, 0.13]} rotation={[0, 0, 0.18]}>
            <boxGeometry args={[0.12, 0.35, 0.04]} />
            <meshStandardMaterial color={brass} roughness={0.46} metalness={0.24} />
          </mesh>
          <mesh position={[0.37, -0.46, 0.13]} rotation={[0, 0, -0.18]}>
            <boxGeometry args={[0.12, 0.35, 0.04]} />
            <meshStandardMaterial color={brass} roughness={0.46} metalness={0.24} />
          </mesh>
        </group>
      ) : null}

      {index === 3 ? (
        <group position={[0, 0.82, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.2, 6]} />
            <meshStandardMaterial
              color={woodMid}
              emissive="#7a421f"
              emissiveIntensity={darkMode ? 0.08 : 0}
            />
          </mesh>
          {SERVICE_NODE_POSITIONS.map(([x, y], nodeIndex) => (
            <group key={nodeIndex}>
              <mesh position={[x / 2, y / 2, 0.02]} rotation={[0, 0, Math.atan2(y, x)]}>
                <boxGeometry args={[Math.hypot(x, y), 0.045, 0.08]} />
                <meshStandardMaterial color={woodLight} roughness={0.82} />
              </mesh>
              <mesh position={[x, y, 0.04]}>
                <sphereGeometry args={[0.16, 14, 10]} />
                <meshStandardMaterial color={pale} roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      ) : null}

      {index === 4 ? (
        <group position={[0, 0.82, 0]}>
          {[-0.38, 0, 0.38].map((x, cardIndex) => (
            <mesh
              key={x}
              position={[x, cardIndex === 1 ? 0.13 : 0, cardIndex === 1 ? 0.1 : 0]}
              rotation={[0, 0, (cardIndex - 1) * 0.12]}
            >
              <boxGeometry args={[0.48, 0.76, 0.1]} />
              <meshStandardMaterial
                color={cardIndex === 1 ? woodLight : pale}
                emissive="#000000"
                emissiveIntensity={0}
                roughness={0.76}
              />
            </mesh>
          ))}
        </group>
      ) : null}

      {index === 5 ? (
        <group position={[0, 0.82, 0]}>
          <mesh>
            <boxGeometry args={[1.15, 0.78, 0.22]} />
            <meshStandardMaterial color={deep} roughness={0.38} metalness={0.18} />
          </mesh>
          <mesh position={[-0.28, 0.06, 0.13]} rotation={[0, 0, -0.58]}>
            <boxGeometry args={[0.72, 0.065, 0.04]} />
            <meshStandardMaterial
              color={brass}
              emissive="#9a642d"
              emissiveIntensity={darkMode ? 0.12 : 0}
            />
          </mesh>
          <mesh position={[0.28, 0.06, 0.13]} rotation={[0, 0, 0.58]}>
            <boxGeometry args={[0.72, 0.065, 0.04]} />
            <meshStandardMaterial
              color={brass}
              emissive="#9a642d"
              emissiveIntensity={darkMode ? 0.12 : 0}
            />
          </mesh>
          <mesh position={[0, -0.2, 0.13]}>
            <boxGeometry args={[0.62, 0.065, 0.04]} />
            <meshStandardMaterial color={pale} roughness={0.4} />
          </mesh>
        </group>
      ) : null}

      <group position={[0, 2.16, 0]}>
        <mesh position={[0, -0.55, -0.04]}>
          <cylinderGeometry args={[0.055, 0.07, 1.08, 10]} />
          <meshStandardMaterial color={woodDark} roughness={0.9} metalness={0.01} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.78, 0.5, 0.14]} />
          <meshStandardMaterial color={woodMid} roughness={0.84} metalness={0.02} />
        </mesh>
        <RoadSignLabel label={zone.id} index={index} />
        <mesh position={[side * 0.96, 0, 0]} rotation={[0, 0, (side * -Math.PI) / 2]}>
          <coneGeometry args={[0.25, 0.34, 3]} />
          <meshStandardMaterial color={woodLight} roughness={0.86} />
        </mesh>
      </group>
    </group>
  );
}

function VillageFences({ darkMode }: { darkMode: boolean }) {
  const postsRef = useRef<InstancedMesh>(null);
  const railsRef = useRef<InstancedMesh>(null);
  const capsRef = useRef<InstancedMesh>(null);
  const transform = useMemo(() => new Object3D(), []);
  const posts = useMemo(
    () =>
      FENCE_SEGMENTS.flatMap((segment) => {
        const count = Math.ceil(segment.length / 0.72) + 1;
        return Array.from({ length: count }, (_, index) => {
          const localX = -segment.length / 2 + (index / (count - 1)) * segment.length;
          return {
            x: segment.x + localX * Math.cos(segment.rotation),
            z: segment.z - localX * Math.sin(segment.rotation),
            rotation: segment.rotation,
          };
        });
      }),
    [],
  );
  const rails = useMemo(
    () =>
      FENCE_SEGMENTS.flatMap((segment) => [
        { ...segment, y: 0.34 },
        { ...segment, y: 0.68 },
      ]),
    [],
  );

  useEffect(() => {
    const postsMesh = postsRef.current;
    const railsMesh = railsRef.current;
    const capsMesh = capsRef.current;
    if (!postsMesh || !railsMesh || !capsMesh) return;

    posts.forEach((post, index) => {
      transform.position.set(post.x, 0.42, post.z);
      transform.rotation.set(0, post.rotation, 0);
      transform.scale.set(0.09, 0.84, 0.09);
      transform.updateMatrix();
      postsMesh.setMatrixAt(index, transform.matrix);

      transform.position.set(post.x, 0.88, post.z);
      transform.rotation.set(0, 0, 0);
      transform.scale.setScalar(1);
      transform.updateMatrix();
      capsMesh.setMatrixAt(index, transform.matrix);
    });

    rails.forEach((rail, index) => {
      transform.position.set(rail.x, rail.y, rail.z);
      transform.rotation.set(0, rail.rotation, 0);
      transform.scale.set(rail.length, 0.075, 0.09);
      transform.updateMatrix();
      railsMesh.setMatrixAt(index, transform.matrix);
    });

    postsMesh.instanceMatrix.needsUpdate = true;
    railsMesh.instanceMatrix.needsUpdate = true;
    capsMesh.instanceMatrix.needsUpdate = true;
  }, [posts, rails, transform]);

  const wood = darkMode ? "#63472f" : "#946b43";
  const woodTop = darkMode ? "#7d5b39" : "#b18455";

  return (
    <group name="village-fences">
      <instancedMesh
        ref={postsRef}
        args={[undefined, undefined, posts.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={wood} roughness={0.86} />
      </instancedMesh>
      <instancedMesh
        ref={railsRef}
        args={[undefined, undefined, rails.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={wood} roughness={0.88} />
      </instancedMesh>
      <instancedMesh
        ref={capsRef}
        args={[undefined, undefined, posts.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.075, 7, 5]} />
        <meshStandardMaterial color={woodTop} roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

function SwayingForest({ darkMode, reducedMotion }: { darkMode: boolean; reducedMotion: boolean }) {
  const trunksRef = useRef<InstancedMesh>(null);
  const lowerCanopiesRef = useRef<InstancedMesh>(null);
  const upperCanopiesRef = useRef<InstancedMesh>(null);
  const transform = useMemo(() => new Object3D(), []);
  const lastUpdateRef = useRef(-1);

  useEffect(() => {
    trunksRef.current?.instanceMatrix.setUsage(DynamicDrawUsage);
    lowerCanopiesRef.current?.instanceMatrix.setUsage(DynamicDrawUsage);
    upperCanopiesRef.current?.instanceMatrix.setUsage(DynamicDrawUsage);
  }, []);

  useFrame((state) => {
    const time = reducedMotion ? 0 : state.clock.elapsedTime;
    if (reducedMotion && lastUpdateRef.current >= 0) return;
    if (!reducedMotion && time - lastUpdateRef.current < 1 / 24) return;
    lastUpdateRef.current = time;

    const trunks = trunksRef.current;
    const lowerCanopies = lowerCanopiesRef.current;
    const upperCanopies = upperCanopiesRef.current;
    if (!trunks || !lowerCanopies || !upperCanopies) return;

    VISIBLE_FOREST_OBJECTS.forEach((tree, index) => {
      const swayZ = reducedMotion ? 0 : Math.sin(time * 0.62 + index * 0.73) * 0.035;
      const swayX = reducedMotion ? 0 : Math.cos(time * 0.48 + index * 0.51) * 0.018;

      transform.position.set(tree.x, 0.62 * tree.scale, tree.z);
      transform.rotation.set(0, 0, 0);
      transform.scale.setScalar(tree.scale);
      transform.updateMatrix();
      trunks.setMatrixAt(index, transform.matrix);

      transform.position.set(tree.x, 1.48 * tree.scale, tree.z);
      transform.rotation.set(swayX, 0, swayZ);
      transform.scale.set(0.82 * tree.scale, 1.18 * tree.scale, 0.82 * tree.scale);
      transform.updateMatrix();
      lowerCanopies.setMatrixAt(index, transform.matrix);

      transform.position.set(
        tree.x + 0.18 * tree.scale,
        1.82 * tree.scale,
        tree.z - 0.05 * tree.scale,
      );
      transform.rotation.set(swayX * 1.15, 0, swayZ * 1.2);
      transform.scale.set(0.5 * tree.scale, 0.64 * tree.scale, 0.5 * tree.scale);
      transform.updateMatrix();
      upperCanopies.setMatrixAt(index, transform.matrix);
    });

    trunks.instanceMatrix.needsUpdate = true;
    lowerCanopies.instanceMatrix.needsUpdate = true;
    upperCanopies.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="swaying-forest">
      <instancedMesh
        ref={trunksRef}
        args={[undefined, undefined, VISIBLE_FOREST_OBJECTS.length]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.1, 0.17, 1.25, 7]} />
        <meshStandardMaterial color={darkMode ? "#4d321f" : "#704626"} roughness={0.94} />
      </instancedMesh>
      <instancedMesh
        ref={lowerCanopiesRef}
        args={[undefined, undefined, VISIBLE_FOREST_OBJECTS.length]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial color={darkMode ? "#174b2a" : "#3f873f"} roughness={0.87} />
      </instancedMesh>
      <instancedMesh
        ref={upperCanopiesRef}
        args={[undefined, undefined, VISIBLE_FOREST_OBJECTS.length]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[0.48, 1]} />
        <meshStandardMaterial color={darkMode ? "#28623a" : "#62a557"} roughness={0.89} />
      </instancedMesh>
    </group>
  );
}

function NaturalLife({ darkMode, reducedMotion }: { darkMode: boolean; reducedMotion: boolean }) {
  const grassRef = useRef<InstancedMesh>(null);
  const leavesRef = useRef<InstancedMesh>(null);
  const lastUpdateRef = useRef(-1);
  const transform = useMemo(() => new Object3D(), []);
  const grass = useMemo(
    () =>
      Array.from({ length: MEADOW_PATCHES.length * 9 }, (_, index) => {
        const patch = MEADOW_PATCHES[index % MEADOW_PATCHES.length]!;
        const angle = ((index * 137.5) % 360) * (Math.PI / 180);
        const radius = 0.18 + ((index * 17) % 9) * 0.09;
        return {
          x: patch[0] + Math.cos(angle) * radius,
          z: patch[1] + Math.sin(angle) * radius,
          height: 0.7 + ((index * 11) % 7) * 0.08,
          phase: index * 0.43,
          yaw: angle,
        };
      }),
    [],
  );
  const leaves = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => ({
        x: -8.7 + ((index * 47) % 174) * 0.1,
        z: 5.5 - ((index * 71) % 325) * 0.1,
        startY: 0.5 + ((index * 29) % 46) * 0.1,
        speed: 0.22 + (index % 7) * 0.035,
        phase: index * 0.71,
        scale: 0.7 + (index % 5) * 0.09,
      })),
    [],
  );

  useEffect(() => {
    grassRef.current?.instanceMatrix.setUsage(DynamicDrawUsage);
    leavesRef.current?.instanceMatrix.setUsage(DynamicDrawUsage);
  }, []);

  useFrame((state) => {
    const time = reducedMotion ? 0 : state.clock.elapsedTime;
    if (reducedMotion && lastUpdateRef.current >= 0) return;
    if (!reducedMotion && time - lastUpdateRef.current < 1 / 24) return;
    lastUpdateRef.current = time;
    const grassMesh = grassRef.current;
    if (grassMesh) {
      grass.forEach((blade, index) => {
        transform.position.set(blade.x, 0.16 * blade.height, blade.z);
        transform.rotation.set(0, blade.yaw, Math.sin(time * 1.35 + blade.phase) * 0.12);
        transform.scale.set(0.72, blade.height, 0.72);
        transform.updateMatrix();
        grassMesh.setMatrixAt(index, transform.matrix);
      });
      grassMesh.instanceMatrix.needsUpdate = true;
    }

    const leafMesh = leavesRef.current;
    if (leafMesh) {
      leaves.forEach((leaf, index) => {
        const fallSpan = 5.2;
        const fallingY =
          0.28 + ((((leaf.startY - time * leaf.speed) % fallSpan) + fallSpan) % fallSpan);
        transform.position.set(
          leaf.x + Math.sin(time * 0.72 + leaf.phase) * 0.42,
          fallingY,
          leaf.z + Math.cos(time * 0.48 + leaf.phase) * 0.28,
        );
        transform.rotation.set(
          time * 0.8 + leaf.phase,
          time * 0.55 + leaf.phase * 0.6,
          Math.sin(time + leaf.phase) * 0.9,
        );
        transform.scale.set(leaf.scale, leaf.scale, leaf.scale);
        transform.updateMatrix();
        leafMesh.setMatrixAt(index, transform.matrix);
      });
      leafMesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group name="natural-life">
      <instancedMesh
        ref={grassRef}
        args={[undefined, undefined, grass.length]}
        frustumCulled={false}
      >
        <coneGeometry args={[0.035, 0.34, 3]} />
        <meshStandardMaterial
          color={darkMode ? "#3f7d3e" : "#5f9f4c"}
          roughness={0.9}
          side={DoubleSide}
        />
      </instancedMesh>
      <instancedMesh
        ref={leavesRef}
        args={[undefined, undefined, leaves.length]}
        frustumCulled={false}
      >
        <planeGeometry args={[0.11, 0.18]} />
        <meshStandardMaterial
          color={darkMode ? "#9e7e3f" : "#b38345"}
          roughness={0.86}
          side={DoubleSide}
        />
      </instancedMesh>
      {MEADOW_PATCHES.filter((_, index) => index % 2 === 0).map(([x, z], index) => (
        <group key={`wildflower-${x}-${z}`} position={[x + 0.35, 0, z - 0.22]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.008, 0.012, 0.36, 6]} />
            <meshStandardMaterial color={darkMode ? "#39733f" : "#4d8b45"} roughness={0.86} />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? "#83cfff" : "#dceeff"}
              emissive={index % 2 === 0 && darkMode ? "#236da2" : "#000000"}
              emissiveIntensity={darkMode ? 0.22 : 0}
              roughness={0.7}
            />
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
  hiddenZoneId,
}: {
  darkMode: boolean;
  inputRef: RefObject<StudioInput>;
  reducedMotion: boolean;
  hiddenZoneId: StudioZoneId | null;
}) {
  const waterRef = useRef<Group>(null);
  const ground = darkMode ? "#123923" : "#6f9f62";
  const path = darkMode ? "#6a5843" : "#d6c39a";
  const pathEdge = darkMode ? "#9a8059" : "#9a835c";
  const structure = darkMode ? "#173654" : "#d4e4ef";
  const accent = darkMode ? "#42a5ff" : "#0878ee";
  const foliage = darkMode ? "#18502e" : "#2f773b";
  const foliageLight = darkMode ? "#327044" : "#4f9849";
  const water = darkMode ? "#063356" : "#319ac5";
  const sand = darkMode ? "#5b513b" : "#d2bd83";
  const bridgeDeck = darkMode ? "#6d5035" : "#a77d4f";
  const bridgeRail = darkMode ? "#8a6844" : "#bd925d";
  const lampColor = darkMode ? "#ffd38a" : "#ffdf9f";
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
  const shorelineRocks = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        x: 12.05 + ((index * 7) % 5) * 0.24,
        z: 4.3 - index * 1.42,
        scale: 0.18 + (index % 4) * 0.07,
      })),
    [],
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (waterRef.current && !reducedMotion) {
      waterRef.current.position.y = Math.sin(time * 0.7) * 0.025;
      waterRef.current.rotation.z = Math.sin(time * 0.22) * 0.0015;
    }
  });

  const walkTo = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const input = inputRef.current;
    if (!input) return;
    const x = MathUtils.clamp(event.point.x, WALK_BOUNDS.minX, WALK_BOUNDS.maxX);
    const z = MathUtils.clamp(event.point.z, WALK_BOUNDS.minZ, WALK_BOUNDS.maxZ);
    if (isWorldBlocked(x, z)) return;
    input.route = [];
    input.target = { x, z };
  };

  return (
    <group>
      <mesh position={[0, -0.08, -10.65]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={walkTo}>
        <planeGeometry args={[30, 42]} />
        <meshStandardMaterial color={ground} roughness={0.92} />
      </mesh>

      <mesh
        position={[14.6, -0.055, -10.65]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={walkTo}
      >
        <planeGeometry args={[2.6, 42]} />
        <meshStandardMaterial color={sand} roughness={0.96} />
      </mesh>

      <group ref={waterRef}>
        <mesh position={[19.2, -0.11, -10.65]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7.6, 42, 1, 32]} />
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
            position={[15.55 + index * 0.58, -0.045 + (index % 2) * 0.012, -10.65]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.035, 39]} />
            <meshBasicMaterial
              color={darkMode ? "#2a87b5" : "#a9e7f2"}
              transparent
              opacity={0.38}
            />
          </mesh>
        ))}
      </group>

      {[...mainTrail, ...forestBranch, ...coastBranch, ...crossTrails]
        .filter(isTrailSegmentOnLand)
        .map((segment) => (
          <mesh
            key={segment.key}
            position={segment.position}
            rotation={[0, segment.rotation, 0]}
            onPointerDown={walkTo}
          >
            <boxGeometry
              args={[
                segment.key.startsWith("main") ? MAIN_TRAIL_WIDTH : BRANCH_TRAIL_WIDTH,
                0.07,
                segment.length,
              ]}
            />
            <meshStandardMaterial color={path} roughness={0.82} metalness={0.02} />
          </mesh>
        ))}

      {mainTrail
        .filter(isTrailSegmentOnLand)
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

      <mesh position={[0, -0.035, STREAM_CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 1.05]} />
        <meshStandardMaterial
          color={water}
          emissive={darkMode ? "#03223a" : "#176d98"}
          emissiveIntensity={darkMode ? 0.38 : 0.06}
          roughness={0.2}
        />
      </mesh>
      <group name="stream-bridge" onPointerDown={walkTo}>
        {[-0.73, 1.03].map((x) => (
          <mesh key={`bridge-support-${x}`} position={[x, 0.025, -15.65]}>
            <boxGeometry args={[0.13, 0.16, 1.62]} />
            <meshStandardMaterial color={pathEdge} roughness={0.9} />
          </mesh>
        ))}
        {Array.from({ length: 10 }, (_, index) => (
          <mesh key={`bridge-plank-${index}`} position={[0.15, 0.12, -16.28 + index * 0.14]}>
            <boxGeometry args={[2.18, 0.11, 0.12]} />
            <meshStandardMaterial color={bridgeDeck} roughness={0.84} />
          </mesh>
        ))}
        {[-0.98, 1.28].map((x) => (
          <group key={`bridge-side-${x}`}>
            {[-16.28, -15.85, -15.42, -15.02].map((z) => (
              <group key={z}>
                <mesh position={[x, 0.46, z]}>
                  <boxGeometry args={[0.09, 0.72, 0.09]} />
                  <meshStandardMaterial color={bridgeRail} roughness={0.82} />
                </mesh>
                <mesh position={[x, 0.84, z]}>
                  <sphereGeometry args={[0.07, 8, 6]} />
                  <meshStandardMaterial color={bridgeRail} roughness={0.76} />
                </mesh>
              </group>
            ))}
            <mesh position={[x, 0.78, -15.65]}>
              <boxGeometry args={[0.09, 0.085, 1.55]} />
              <meshStandardMaterial color={bridgeRail} roughness={0.8} />
            </mesh>
            <mesh position={[x, 0.49, -15.65]}>
              <boxGeometry args={[0.065, 0.065, 1.48]} />
              <meshStandardMaterial color={bridgeRail} roughness={0.82} />
            </mesh>
          </group>
        ))}
        {[-16.33, -14.97].map((z) => (
          <mesh key={`bridge-end-beam-${z}`} position={[0.15, 0.14, z]}>
            <boxGeometry args={[2.28, 0.17, 0.1]} />
            <meshStandardMaterial color={bridgeRail} roughness={0.84} />
          </mesh>
        ))}
      </group>

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

      <group name="welcome-plaza" position={[0, 0.02, 5]}>
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[1.72, 1.8, 0.1, 16]} />
          <meshStandardMaterial color={pathEdge} roughness={0.84} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[1.46, 1.52, 0.08, 16]} />
          <meshStandardMaterial color={path} roughness={0.78} />
        </mesh>
        {[-1.05, 1.05].map((x) => (
          <group key={`welcome-post-${x}`} position={[x, 0, -1.05]}>
            <mesh position={[0, 0.82, 0]}>
              <boxGeometry args={[0.16, 1.64, 0.16]} />
              <meshStandardMaterial color={bridgeRail} roughness={0.74} />
            </mesh>
            <mesh position={[0, 1.72, 0]}>
              <sphereGeometry args={[0.13, 12, 8]} />
              <meshStandardMaterial
                color={lampColor}
                emissive={lampColor}
                emissiveIntensity={darkMode ? 2.3 : 0.25}
              />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 1.45, -1.05]}>
          <boxGeometry args={[2.25, 0.18, 0.18]} />
          <meshStandardMaterial color={bridgeRail} roughness={0.72} />
        </mesh>
        <mesh position={[0, 1.48, -0.94]}>
          <boxGeometry args={[1.25, 0.42, 0.08]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={darkMode ? 0.48 : 0.08}
            roughness={0.4}
          />
        </mesh>
        <pointLight
          position={[0, 2.1, -0.6]}
          color={lampColor}
          intensity={darkMode ? 3.2 : 0.28}
          distance={5}
        />
      </group>

      {stations.map((station, index) =>
        station.id === hiddenZoneId ? null : (
          <group
            key={station.id}
            position={[
              station.position[0] + station.side * LANDMARK_OFFSET,
              0,
              station.position[2],
            ]}
          >
            <SectionLandmark
              zone={station}
              index={index}
              side={station.side}
              darkMode={darkMode}
              pathEdge={pathEdge}
              inputRef={inputRef}
            />
          </group>
        ),
      )}

      {LAMP_OBJECTS.map((lamp, index) => {
        return (
          <group key={`lamp-${index}`} position={[lamp.x, 0, lamp.z]}>
            <mesh position={[0, 0.75, 0]}>
              <cylinderGeometry args={[0.035, 0.055, 1.5, 10]} />
              <meshStandardMaterial color={structure} metalness={0.55} roughness={0.28} />
            </mesh>
            <mesh position={[0, 1.55, 0]}>
              <sphereGeometry args={[0.11, 12, 8]} />
              <meshStandardMaterial
                color={lampColor}
                emissive={lampColor}
                emissiveIntensity={darkMode ? 2.1 : 0.32}
              />
            </mesh>
            {index % 3 === 0 ? (
              <pointLight
                position={[0, 1.5, 0]}
                color={lampColor}
                intensity={darkMode ? 2.2 : 0.18}
                distance={4.2}
              />
            ) : null}
          </group>
        );
      })}

      <VillageFences darkMode={darkMode} />
      <SwayingForest darkMode={darkMode} reducedMotion={reducedMotion} />
      <NaturalLife darkMode={darkMode} reducedMotion={reducedMotion} />

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

      <SocialLandmarks darkMode={darkMode} reducedMotion={reducedMotion} />

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
  hiddenZoneId,
}: {
  darkMode: boolean;
  inputRef: RefObject<StudioInput>;
  reducedMotion: boolean;
  hiddenZoneId: StudioZoneId | null;
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
      <PathEnvironment
        darkMode={darkMode}
        inputRef={inputRef}
        reducedMotion={reducedMotion}
        hiddenZoneId={hiddenZoneId}
      />
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
    input.route = [];
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

function StudioWorld({
  darkMode,
  reducedMotion,
  quality,
  inputRef,
  explorerPositionRef,
  onZoneChange,
  showcase,
  showcaseSlide,
  showcaseTotal,
  onShowcasePrevious,
  onShowcaseNext,
  onShowcaseClose,
}: Omit<StudioCanvasProps, "inView">) {
  const characterPositionRef = useRef(new Vector3().copy(START_POSITION));
  const characterHeadingRef = useRef(0);
  const activeZoneRef = useRef<StudioZoneId | null>(null);
  const desiredCamera = useMemo(() => new Vector3(), []);
  const cameraTarget = useMemo(() => new Vector3(), []);
  const renderer = useThree((state) => state.gl);
  const background = darkMode ? "#0b1930" : "#cfe8fb";
  const fog = darkMode ? "#10253d" : "#d8ebf8";

  useEffect(() => {
    renderer.toneMappingExposure = darkMode ? 1.18 : 0.94;
  }, [darkMode, renderer]);

  useFrame(({ camera, size }) => {
    const character = characterPositionRef.current;
    const compactViewport = size.width < 680;
    const tabletViewport = size.width < 1024;
    if (showcase) {
      const zoneIndex = ZONES.findIndex((zone) => zone.id === showcase.section);
      const zone = ZONES[Math.max(0, zoneIndex)]!;
      const side = zoneIndex % 2 === 0 ? -1 : 1;
      const screenX = zone.position[0] + side * SHOWCASE_SCREEN_OFFSET;
      const screenZ = zone.position[2] + 0.22;
      const compositionX = screenX - side * 1.45;
      desiredCamera.set(
        compositionX,
        compactViewport ? 3.15 : 2.9,
        screenZ + (compactViewport ? 8.4 : 6.5),
      );
      cameraTarget.set(compositionX, 1.72, screenZ - 0.15);
    } else {
      const contactOffset =
        activeZoneRef.current === "contact" ? (compactViewport ? 1.2 : 0.75) : 0;
      const panelOffset = size.width >= 860 ? 1.45 : contactOffset;
      const cameraHeight = compactViewport ? 4.55 : tabletViewport ? 4.12 : 3.88;
      const cameraDistance = compactViewport ? 8.55 : tabletViewport ? 7.55 : 6.85;
      desiredCamera.set(
        character.x - panelOffset * 0.28,
        cameraHeight,
        character.z + cameraDistance,
      );
      cameraTarget.set(character.x - panelOffset, compactViewport ? 0.95 : 1.1, character.z - 1.45);
    }
    camera.position.lerp(desiredCamera, reducedMotion ? 0.2 : showcase ? 0.08 : 0.045);
    camera.lookAt(cameraTarget);

    const perspectiveCamera = camera as PerspectiveCamera;
    const targetFov = showcase
      ? compactViewport
        ? 49
        : 42
      : compactViewport
        ? 52
        : tabletViewport
          ? 48
          : 45;
    const nextFov = MathUtils.lerp(perspectiveCamera.fov, targetFov, 0.08);
    if (Math.abs(nextFov - perspectiveCamera.fov) > 0.001) {
      perspectiveCamera.fov = nextFov;
      perspectiveCamera.updateProjectionMatrix();
    }

    let nearest: StudioZoneId | null = null;
    let nearestDistance = LANDMARK_TRIGGER_RADIUS;
    for (const [index, zone] of ZONES.entries()) {
      const landmark = STATION_OBJECTS[index];
      if (!landmark) continue;
      const distance = Math.hypot(character.x - landmark.x, character.z - landmark.z);
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
      <fog attach="fog" args={[fog, 14, 38]} />
      <hemisphereLight
        intensity={darkMode ? 1.42 : 1.55}
        color={darkMode ? "#a7c9ff" : "#fff3d9"}
        groundColor={darkMode ? "#183b50" : "#8db8d8"}
      />
      <ambientLight intensity={darkMode ? 0.96 : 1.1} color={darkMode ? "#9bc4ff" : "#fff4dc"} />
      <directionalLight
        position={[4, 7, 6]}
        intensity={darkMode ? 1.75 : 2.4}
        color={darkMode ? "#9fc4ff" : "#fff0c9"}
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

      <StudioEnvironment
        darkMode={darkMode}
        inputRef={inputRef}
        reducedMotion={reducedMotion || quality === "low"}
        hiddenZoneId={showcase?.section ?? null}
      />
      <DigitalEngineer
        inputRef={inputRef}
        positionRef={characterPositionRef}
        headingRef={characterHeadingRef}
        mapPositionRef={explorerPositionRef}
        reducedMotion={reducedMotion}
        darkMode={darkMode}
      />
      <RobotCompanion
        positionRef={characterPositionRef}
        headingRef={characterHeadingRef}
        darkMode={darkMode}
        reducedMotion={reducedMotion}
      />
      {showcase && showcaseSlide ? (
        <VillageShowcaseScreen
          section={showcase.section}
          slide={showcaseSlide}
          slideIndex={showcase.slide}
          total={showcaseTotal}
          darkMode={darkMode}
          onPrevious={onShowcasePrevious}
          onNext={onShowcaseNext}
          onClose={onShowcaseClose}
        />
      ) : null}
    </>
  );
}

function SceneReadySignal() {
  const signalledRef = useRef(false);

  useFrame(() => {
    if (signalledRef.current) return;
    signalledRef.current = true;
    document.documentElement.dataset["studioReady"] = "true";
    window.dispatchEvent(new Event("portfolio:studio-ready"));
  });

  return null;
}

function shouldUseAutomaticLowQuality(quality: StudioQuality) {
  if (quality !== "auto" || typeof window === "undefined") return false;
  const device = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  return (
    window.innerWidth <= 820 ||
    device.connection?.saveData === true ||
    device.connection?.effectiveType === "2g" ||
    (device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
    navigator.hardwareConcurrency <= 4
  );
}

export default function InteractiveStudioCanvas(props: StudioCanvasProps) {
  const effectiveQuality: StudioQuality = shouldUseAutomaticLowQuality(props.quality)
    ? "low"
    : props.quality;

  return (
    <Canvas
      className="interactive-studio-canvas"
      camera={{ position: [0, 3.88, 8], fov: 45, near: 0.1, far: 64 }}
      dpr={effectiveQuality === "low" ? 1 : effectiveQuality === "high" ? [1, 1.5] : [1, 1.2]}
      frameloop={props.inView ? "always" : "never"}
      gl={{
        antialias: effectiveQuality !== "low",
        alpha: false,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
      }}
    >
      <SceneReadySignal />
      <StudioWorld
        darkMode={props.darkMode}
        reducedMotion={props.reducedMotion}
        quality={effectiveQuality}
        inputRef={props.inputRef}
        explorerPositionRef={props.explorerPositionRef}
        onZoneChange={props.onZoneChange}
        showcase={props.showcase}
        showcaseSlide={props.showcaseSlide}
        showcaseTotal={props.showcaseTotal}
        onShowcasePrevious={props.onShowcasePrevious}
        onShowcaseNext={props.onShowcaseNext}
        onShowcaseClose={props.onShowcaseClose}
      />
    </Canvas>
  );
}
