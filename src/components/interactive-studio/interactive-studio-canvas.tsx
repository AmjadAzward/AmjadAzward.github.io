import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import {
  ACESFilmicToneMapping,
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
  { id: "about", position: [-3.7, 0.03, -2.5], color: "#49a8ff" },
  { id: "skills", position: [-1.8, 0.03, -3.05], color: "#38bdf8" },
  { id: "portfolio", position: [2.45, 0.03, -2.65], color: "#278cff" },
  { id: "certifications", position: [3.65, 0.03, 1.35], color: "#6aaeff" },
  { id: "contact", position: [-3.7, 0.03, 1.45], color: "#30a7e8" },
];

const START_POSITION = new Vector3(1.72, 0, 0.72);

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

    const keyState = keys.current;
    let x =
      (keyState["KeyD"] || keyState["ArrowRight"] ? 1 : 0) -
      (keyState["KeyA"] || keyState["ArrowLeft"] ? 1 : 0) +
      input.x;
    let z =
      (keyState["KeyS"] || keyState["ArrowDown"] ? 1 : 0) -
      (keyState["KeyW"] || keyState["ArrowUp"] ? 1 : 0) +
      input.z;

    if (Math.abs(x) < 0.01 && Math.abs(z) < 0.01 && input.target) {
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
      root.position.addScaledVector(direction, speed * delta);
      root.position.x = MathUtils.clamp(root.position.x, -4.35, 4.35);
      root.position.z = MathUtils.clamp(root.position.z, -3.2, 2.15);

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

function StudioEnvironment({
  darkMode,
  inputRef,
}: {
  darkMode: boolean;
  inputRef: RefObject<StudioInput>;
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

  useFrame(({ camera }) => {
    const character = characterPositionRef.current;
    desiredCamera.set(character.x * 0.18, 4.35, character.z + 8.35);
    camera.position.lerp(desiredCamera, reducedMotion ? 0.2 : 0.045);
    cameraTarget.set(character.x * 0.28, 1.25, character.z - 0.72);
    camera.lookAt(cameraTarget);

    let nearest: StudioZoneId | null = null;
    let nearestDistance = 1.05;
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
      <fog attach="fog" args={[fog, 8.5, 22]} />
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
        position={[3.2, 2.5, -2.4]}
        intensity={darkMode ? 5 : 1.2}
        distance={7}
        color="#42a5ff"
      />
      <pointLight
        position={[-3.8, 2.6, -2.2]}
        intensity={darkMode ? 3.2 : 0.8}
        distance={6}
        color="#38bdf8"
      />

      <StudioEnvironment darkMode={darkMode} inputRef={inputRef} />
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
      camera={{ position: [0, 4.35, 9], fov: 43, near: 0.1, far: 45 }}
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
