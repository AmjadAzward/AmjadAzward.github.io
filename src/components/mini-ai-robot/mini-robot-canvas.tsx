import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  Color,
  CylinderGeometry,
  Group,
  MathUtils,
  MeshStandardMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  type BufferGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const COLORS = {
  body: "#eaf2ff",
  bodyLightMode: "#142844",
  eye: "#42a5ff",
  cyan: "#38bdf8",
  face: "#101827",
  faceLightMode: "#edf4ff",
  joint: "#64748b",
  jointLightMode: "#0a1930",
  dark: "#07101e",
};

type Vec3 = [number, number, number];
type PiecePose = { position: Vec3; rotation: Vec3 };
type RobotMaterials = ReturnType<typeof createMaterials>;
type RobotGeometries = ReturnType<typeof createGeometries>;
type RobotPart = "head" | "face" | "hand" | "chest" | "feet";
type RobotInteraction = {
  kind: RobotPart | "dance";
  startedAt: number;
  side?: -1 | 1;
};
type PartClickHandler = (event: ThreeEvent<MouseEvent>, part: RobotPart, side?: -1 | 1) => void;

const FINAL_POSE: PiecePose = { position: [0, 0, 0], rotation: [0, 0, 0] };
const ROBOT_VERTICAL_OFFSET = -0.32;
const BLUE = new Color(COLORS.eye);
const DARK = new Color(COLORS.dark);

function createMaterials() {
  return {
    body: new MeshStandardMaterial({
      color: COLORS.body,
      roughness: 0.26,
      metalness: 0.12,
    }),
    face: new MeshStandardMaterial({
      color: COLORS.face,
      roughness: 0.2,
      metalness: 0.28,
    }),
    joint: new MeshStandardMaterial({
      color: COLORS.joint,
      roughness: 0.32,
      metalness: 0.65,
    }),
    eye: new MeshStandardMaterial({
      color: COLORS.dark,
      emissive: COLORS.eye,
      emissiveIntensity: 0,
      roughness: 0.18,
      metalness: 0.1,
    }),
    core: new MeshStandardMaterial({
      color: COLORS.dark,
      emissive: COLORS.eye,
      emissiveIntensity: 0,
      roughness: 0.2,
      metalness: 0.32,
    }),
    accent: new MeshStandardMaterial({
      color: COLORS.cyan,
      emissive: COLORS.cyan,
      emissiveIntensity: 0.1,
      roughness: 0.25,
      metalness: 0.35,
    }),
    pulse: new MeshStandardMaterial({
      color: COLORS.eye,
      emissive: COLORS.eye,
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      roughness: 0.3,
    }),
  };
}

function rounded(width: number, height: number, depth: number, radius: number) {
  return new RoundedBoxGeometry(width, height, depth, 4, radius);
}

function createGeometries() {
  return {
    head: rounded(2.45, 1.95, 1.05, 0.28),
    face: rounded(2.03, 1.46, 0.16, 0.3),
    torso: rounded(1.52, 1.58, 0.82, 0.26),
    chestPanel: rounded(1.12, 0.84, 0.12, 0.2),
    arm: rounded(0.42, 0.95, 0.48, 0.17),
    hand: new SphereGeometry(0.29, 18, 12),
    leg: rounded(0.5, 0.68, 0.52, 0.16),
    foot: rounded(0.76, 0.38, 1.02, 0.17),
    neck: new CylinderGeometry(0.22, 0.27, 0.5, 20),
    joint: new SphereGeometry(0.23, 16, 12),
    eye: new SphereGeometry(0.26, 20, 12),
    core: new SphereGeometry(0.25, 20, 14),
    coreRing: new TorusGeometry(0.33, 0.055, 10, 28),
    sideDetail: new CylinderGeometry(0.08, 0.08, 0.7, 12),
    pulseRing: new TorusGeometry(0.39, 0.025, 8, 36),
  };
}

function disposeRecord(record: Record<string, { dispose: () => void }>) {
  Object.values(record).forEach((item) => item.dispose());
}

function clampProgress(time: number, start: number, end: number) {
  return MathUtils.clamp((time - start) / (end - start), 0, 1);
}

function smooth(progress: number) {
  return progress * progress * (3 - 2 * progress);
}

function settle(progress: number) {
  if (progress <= 0 || progress >= 1) return progress;
  const c1 = 1.35;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);
}

function animatePiece(
  target: Group | null,
  startPose: PiecePose,
  endPose: PiecePose,
  progress: number,
  overshoot = true,
) {
  if (!target) return;
  const amount = overshoot ? settle(progress) : smooth(progress);
  target.position.set(
    MathUtils.lerp(startPose.position[0], endPose.position[0], amount),
    MathUtils.lerp(startPose.position[1], endPose.position[1], amount),
    MathUtils.lerp(startPose.position[2], endPose.position[2], amount),
  );
  target.rotation.set(
    MathUtils.lerp(startPose.rotation[0], endPose.rotation[0], amount),
    MathUtils.lerp(startPose.rotation[1], endPose.rotation[1], amount),
    MathUtils.lerp(startPose.rotation[2], endPose.rotation[2], amount),
  );
}

function RobotHead({
  groupRef,
  leftEyeRef,
  rightEyeRef,
  geometries,
  materials,
  onPartClick,
}: {
  groupRef: React.RefObject<Group | null>;
  leftEyeRef: React.RefObject<Group | null>;
  rightEyeRef: React.RefObject<Group | null>;
  geometries: RobotGeometries;
  materials: RobotMaterials;
  onPartClick: PartClickHandler;
}) {
  return (
    <group ref={groupRef}>
      <mesh
        geometry={geometries.head}
        material={materials.body}
        onClick={(event) => onPartClick(event, "head")}
      />
      <group onClick={(event) => onPartClick(event, "face")}>
        <mesh geometry={geometries.face} material={materials.face} position={[0, 0, 0.55]} />
        <group ref={leftEyeRef} position={[-0.52, 0.08, 0.69]}>
          <mesh geometry={geometries.eye} material={materials.eye} scale={[1.08, 0.62, 0.22]} />
        </group>
        <group ref={rightEyeRef} position={[0.52, 0.08, 0.69]}>
          <mesh geometry={geometries.eye} material={materials.eye} scale={[1.08, 0.62, 0.22]} />
        </group>
      </group>
      <mesh
        geometry={geometries.sideDetail}
        material={materials.accent}
        position={[-1.24, 0, 0.04]}
        rotation={[0, 0, Math.PI / 2]}
      />
      <mesh
        geometry={geometries.sideDetail}
        material={materials.accent}
        position={[1.24, 0, 0.04]}
        rotation={[0, 0, Math.PI / 2]}
      />
    </group>
  );
}

function RobotBody({
  torsoRef,
  coreRef,
  pulseRef,
  geometries,
  materials,
  onPartClick,
}: {
  torsoRef: React.RefObject<Group | null>;
  coreRef: React.RefObject<Group | null>;
  pulseRef: React.RefObject<Group | null>;
  geometries: RobotGeometries;
  materials: RobotMaterials;
  onPartClick: PartClickHandler;
}) {
  return (
    <>
      <group ref={torsoRef}>
        <mesh
          geometry={geometries.torso}
          material={materials.body}
          onClick={(event) => onPartClick(event, "chest")}
        />
        <mesh
          geometry={geometries.chestPanel}
          material={materials.face}
          position={[0, 0.08, 0.45]}
          onClick={(event) => onPartClick(event, "chest")}
        />
        <mesh
          geometry={geometries.sideDetail}
          material={materials.accent}
          position={[0, -0.55, 0.48]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.7, 1, 0.7]}
        />
      </group>
      <group ref={coreRef} onClick={(event) => onPartClick(event, "chest")}>
        <mesh geometry={geometries.coreRing} material={materials.joint} />
        <mesh geometry={geometries.core} material={materials.core} scale={[1, 1, 0.34]} />
        <group ref={pulseRef}>
          <mesh geometry={geometries.pulseRing} material={materials.pulse} />
        </group>
      </group>
    </>
  );
}

function RobotArm({
  groupRef,
  handRef,
  side,
  geometries,
  materials,
  onPartClick,
}: {
  groupRef: React.RefObject<Group | null>;
  handRef: React.RefObject<Group | null>;
  side: -1 | 1;
  geometries: RobotGeometries;
  materials: RobotMaterials;
  onPartClick: PartClickHandler;
}) {
  return (
    <>
      <group ref={groupRef}>
        <mesh geometry={geometries.joint} material={materials.joint} position={[0, 0.37, 0]} />
        <mesh geometry={geometries.arm} material={materials.body} position={[0, -0.06, 0]} />
        <mesh
          geometry={geometries.sideDetail}
          material={materials.accent}
          position={[side * 0.22, -0.08, 0]}
          scale={[0.48, 0.48, 0.48]}
        />
      </group>
      <group ref={handRef} onClick={(event) => onPartClick(event, "hand", side)}>
        <mesh geometry={geometries.hand} material={materials.body} scale={[0.95, 1.05, 0.9]} />
      </group>
    </>
  );
}

function RobotLeg({
  groupRef,
  footRef,
  geometries,
  materials,
  side,
  onPartClick,
}: {
  groupRef: React.RefObject<Group | null>;
  footRef: React.RefObject<Group | null>;
  geometries: RobotGeometries;
  materials: RobotMaterials;
  side: -1 | 1;
  onPartClick: PartClickHandler;
}) {
  return (
    <>
      <group ref={groupRef}>
        <mesh geometry={geometries.joint} material={materials.joint} position={[0, 0.28, 0]} />
        <mesh geometry={geometries.leg} material={materials.body} />
      </group>
      <group ref={footRef} onClick={(event) => onPartClick(event, "feet", side)}>
        <mesh geometry={geometries.foot} material={materials.body} />
        <mesh
          geometry={geometries.sideDetail}
          material={materials.accent}
          position={[0, -0.17, 0.18]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.42, 0.5, 0.42]}
        />
      </group>
    </>
  );
}

function MiniRobot({
  reducedMotion,
  darkMode,
  onGreeting,
}: {
  reducedMotion: boolean;
  darkMode: boolean;
  onGreeting: () => void;
}) {
  const robotRef = useRef<Group>(null);
  const torsoRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const neckRef = useRef<Group>(null);
  const coreRef = useRef<Group>(null);
  const pulseRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftHandRef = useRef<Group>(null);
  const rightHandRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftFootRef = useRef<Group>(null);
  const rightFootRef = useRef<Group>(null);
  const leftEyeRef = useRef<Group>(null);
  const rightEyeRef = useRef<Group>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const hoveredRef = useRef(false);
  const clickTimeRef = useRef(-100);
  const pointerRef = useRef({ x: 0, y: 0 });
  const interactionRef = useRef<RobotInteraction>({ kind: "face", startedAt: -100 });
  const tapTimesRef = useRef<number[]>([]);
  const expressionRef = useRef(0);
  const headMotionRef = useRef({ x: 0, y: 0, z: 0 });

  const materials = useMemo(createMaterials, []);
  const geometries = useMemo(createGeometries, []);

  useEffect(() => {
    startTimeRef.current = null;
  }, [reducedMotion]);

  useEffect(() => {
    materials.body.color.set(darkMode ? COLORS.body : COLORS.bodyLightMode);
    materials.face.color.set(darkMode ? COLORS.face : COLORS.faceLightMode);
    materials.joint.color.set(darkMode ? COLORS.joint : COLORS.jointLightMode);
  }, [darkMode, materials]);

  useEffect(() => {
    const resetPointer = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    if (reducedMotion) {
      resetPointer();
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerRef.current.x = MathUtils.clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1);
      pointerRef.current.y = MathUtils.clamp(1 - (event.clientY / window.innerHeight) * 2, -1, 1);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", resetPointer);
    document.documentElement.addEventListener("mouseleave", resetPointer);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", resetPointer);
      document.documentElement.removeEventListener("mouseleave", resetPointer);
    };
  }, [reducedMotion]);

  useEffect(
    () => () => {
      disposeRecord(materials);
      disposeRecord(geometries as unknown as Record<string, BufferGeometry>);
    },
    [geometries, materials],
  );

  const handlePartClick = useCallback<PartClickHandler>(
    (event, part, side) => {
      event.stopPropagation();
      if (elapsedRef.current < 4) return;

      const now = performance.now() / 1000;
      clickTimeRef.current = now;
      const recentTaps = tapTimesRef.current.filter((tap) => now - tap < 1.8);
      recentTaps.push(now);
      tapTimesRef.current = recentTaps;

      if (recentTaps.length >= 5) {
        tapTimesRef.current = [];
        interactionRef.current = { kind: "dance", startedAt: now };
        return;
      }

      if (part === "face") expressionRef.current = (expressionRef.current + 1) % 4;
      interactionRef.current =
        side === undefined ? { kind: part, startedAt: now } : { kind: part, startedAt: now, side };
      if (part === "hand") onGreeting();
    },
    [onGreeting],
  );

  useFrame((state) => {
    if (startTimeRef.current === null) startTimeRef.current = state.clock.elapsedTime;
    const elapsed = reducedMotion ? 6 : state.clock.elapsedTime - startTimeRef.current;
    elapsedRef.current = elapsed;

    animatePiece(
      torsoRef.current,
      { position: [0, 0.45, -2.5], rotation: [-0.42, 0.48, 0.22] },
      { position: [0, -0.22, 0], rotation: [0, 0, 0] },
      clampProgress(elapsed, 1, 1.72),
    );
    animatePiece(
      leftLegRef.current,
      { position: [-1.85, -1.92, 0.55], rotation: [0.25, -0.4, 0.7] },
      { position: [-0.43, -1.42, 0], rotation: [0, 0, 0] },
      clampProgress(elapsed, 1.08, 1.72),
    );
    animatePiece(
      rightLegRef.current,
      { position: [1.85, -1.92, -0.35], rotation: [-0.25, 0.45, -0.75] },
      { position: [0.43, -1.42, 0], rotation: [0, 0, 0] },
      clampProgress(elapsed, 1.2, 1.84),
    );
    animatePiece(
      leftFootRef.current,
      { position: [-1.65, -2.5, 1.15], rotation: [0.45, -0.5, 0.35] },
      { position: [-0.43, -2.01, 0.14], rotation: [0, 0, 0] },
      clampProgress(elapsed, 1.38, 1.94),
    );
    animatePiece(
      rightFootRef.current,
      { position: [1.65, -2.5, 1.05], rotation: [0.4, 0.5, -0.35] },
      { position: [0.43, -2.01, 0.14], rotation: [0, 0, 0] },
      clampProgress(elapsed, 1.48, 2),
    );

    animatePiece(
      leftArmRef.current,
      { position: [-2.45, 0.62, 0.4], rotation: [0.2, -0.4, 1.05] },
      { position: [-1.13, -0.18, 0], rotation: [0, 0, 0.08] },
      clampProgress(elapsed, 2, 2.66),
    );
    animatePiece(
      rightArmRef.current,
      { position: [2.45, 0.55, -0.25], rotation: [-0.2, 0.45, -1.05] },
      { position: [1.13, -0.18, 0], rotation: [0, 0, -0.08] },
      clampProgress(elapsed, 2.08, 2.72),
    );
    animatePiece(
      leftHandRef.current,
      { position: [-2.2, -0.95, 1.05], rotation: [0.5, 0.4, 0.6] },
      { position: [-1.17, -0.86, 0], rotation: [0, 0, 0] },
      clampProgress(elapsed, 2.32, 2.88),
    );
    animatePiece(
      rightHandRef.current,
      { position: [2.2, -1.05, 0.9], rotation: [-0.5, -0.4, -0.6] },
      { position: [1.17, -0.86, 0], rotation: [0, 0, 0] },
      clampProgress(elapsed, 2.4, 2.94),
    );
    animatePiece(
      neckRef.current,
      { position: [0, 2.95, -1.5], rotation: [1.2, 0.35, 0.25] },
      { position: [0, 0.84, 0], rotation: [0, 0, 0] },
      clampProgress(elapsed, 2.38, 3),
    );

    animatePiece(
      headRef.current,
      { position: [0, 2.68, -1.25], rotation: [-0.28, 0.48, -0.22] },
      { position: [0, 2.02, 0], rotation: [0, 0, 0] },
      clampProgress(elapsed, 3, 3.86),
    );
    animatePiece(
      coreRef.current,
      { position: [0, -0.2, 2.65], rotation: [0.2, 0.8, 0.3] },
      { position: [0, -0.14, 0.57], rotation: [0, 0, 0] },
      clampProgress(elapsed, 3.32, 4),
    );

    const activation = smooth(clampProgress(elapsed, 4, 4.62));
    const idle = smooth(clampProgress(elapsed, 5, 5.35));
    const now = performance.now() / 1000;
    const sinceClick = now - clickTimeRef.current;
    const interaction = interactionRef.current;
    const interactionAge = now - interaction.startedAt;
    const motionStrength = reducedMotion ? 0.22 : 1;
    const headReaction =
      interaction.kind === "head" && interactionAge >= 0 && interactionAge < 1.15
        ? Math.sin((interactionAge / 1.15) * Math.PI)
        : 0;
    const chestReaction =
      interaction.kind === "chest" && interactionAge >= 0 && interactionAge < 1.1
        ? Math.sin((interactionAge / 1.1) * Math.PI)
        : 0;
    const jumpProgress =
      interaction.kind === "feet" && interactionAge >= 0 && interactionAge < 0.9
        ? interactionAge / 0.9
        : -1;
    const danceProgress =
      interaction.kind === "dance" && interactionAge >= 0 && interactionAge < 2.65
        ? interactionAge / 2.65
        : -1;
    const danceEnvelope =
      danceProgress >= 0
        ? smooth(clampProgress(danceProgress, 0, 0.12)) *
          (1 - smooth(clampProgress(danceProgress, 0.82, 1)))
        : 0;
    const clickAmount =
      sinceClick >= 0 && sinceClick < 0.7 ? Math.sin((sinceClick / 0.7) * Math.PI) : 0;
    const hoverAmount = hoveredRef.current && elapsed >= 4 ? 1 : 0;
    const breathing = reducedMotion ? 0 : (Math.sin(state.clock.elapsedTime * 2.2) + 1) * 0.5;

    if (darkMode) {
      materials.eye.color.copy(DARK).lerp(BLUE, activation);
      materials.eye.emissiveIntensity =
        activation * (0.95 + hoverAmount * 0.42 + clickAmount * 0.65);
    } else {
      materials.eye.color.copy(DARK);
      materials.eye.emissiveIntensity =
        activation * (0.08 + hoverAmount * 0.04 + clickAmount * 0.06);
    }
    materials.core.color.copy(DARK).lerp(BLUE, activation);
    materials.core.emissiveIntensity =
      activation *
      (0.92 +
        breathing * 0.34 * idle +
        hoverAmount * 0.38 +
        clickAmount * 0.32 +
        chestReaction * 2.2);
    materials.accent.emissiveIntensity = 0.08 + activation * 0.55;

    const autoPhase = (((elapsed - 5.2) % 4.6) + 4.6) % 4.6;
    const autoBlink =
      !reducedMotion && elapsed > 5.2 && autoPhase > 4.34
        ? MathUtils.clamp(Math.abs(autoPhase - 4.47) / 0.13, 0.1, 1)
        : 1;
    const clickBlink =
      sinceClick >= 0.08 && sinceClick <= 0.3
        ? MathUtils.clamp(Math.abs(sinceClick - 0.19) / 0.11, 0.08, 1)
        : 1;
    const blinkScale = Math.min(autoBlink, clickBlink);
    const trackingAmount = reducedMotion ? 0 : smooth(clampProgress(elapsed, 4.28, 4.88));
    const eyeOffsetX = pointerRef.current.x * 0.1 * trackingAmount;
    const eyeOffsetY = pointerRef.current.y * 0.075 * trackingAmount;
    const expression = expressionRef.current;
    const expressionLeftY =
      expression === 1 ? 0.48 : expression === 2 ? 1.12 : expression === 3 ? 0.18 : 1;
    const expressionRightY =
      expression === 1 ? 0.48 : expression === 2 ? 0.72 : expression === 3 ? 0.18 : 1;
    const surpriseScale = 1 + headReaction * 0.34;
    const leftEyeTargetY = 0.08 + eyeOffsetY + (expression === 2 ? 0.05 : 0);
    const rightEyeTargetY = 0.08 + eyeOffsetY + (expression === 2 ? -0.03 : 0);

    if (leftEyeRef.current) {
      leftEyeRef.current.scale.x = MathUtils.lerp(
        leftEyeRef.current.scale.x,
        surpriseScale * (expression === 2 ? 1.08 : 1),
        0.18,
      );
      leftEyeRef.current.scale.y = MathUtils.lerp(
        leftEyeRef.current.scale.y,
        blinkScale * expressionLeftY * surpriseScale,
        0.22,
      );
      leftEyeRef.current.rotation.z = MathUtils.lerp(
        leftEyeRef.current.rotation.z,
        expression === 1 ? -0.14 : 0,
        0.18,
      );
      leftEyeRef.current.position.x = MathUtils.lerp(
        leftEyeRef.current.position.x,
        -0.52 + eyeOffsetX,
        0.16,
      );
      leftEyeRef.current.position.y = MathUtils.lerp(
        leftEyeRef.current.position.y,
        leftEyeTargetY,
        0.16,
      );
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.x = MathUtils.lerp(
        rightEyeRef.current.scale.x,
        surpriseScale * (expression === 2 ? 0.84 : 1),
        0.18,
      );
      rightEyeRef.current.scale.y = MathUtils.lerp(
        rightEyeRef.current.scale.y,
        blinkScale * expressionRightY * surpriseScale,
        0.22,
      );
      rightEyeRef.current.rotation.z = MathUtils.lerp(
        rightEyeRef.current.rotation.z,
        expression === 1 ? 0.14 : 0,
        0.18,
      );
      rightEyeRef.current.position.x = MathUtils.lerp(
        rightEyeRef.current.position.x,
        0.52 + eyeOffsetX,
        0.16,
      );
      rightEyeRef.current.position.y = MathUtils.lerp(
        rightEyeRef.current.position.y,
        rightEyeTargetY,
        0.16,
      );
    }

    if (pulseRef.current) {
      const activationPulse = clampProgress(elapsed, 4.08, 4.92);
      const chestPulse =
        interaction.kind === "chest" && interactionAge >= 0 && interactionAge < 1.1
          ? interactionAge / 1.1
          : -1;
      const pulseProgress = chestPulse >= 0 ? chestPulse : activationPulse;
      const pulseOpacity =
        pulseProgress > 0 && pulseProgress < 1
          ? Math.sin(pulseProgress * Math.PI) * (chestPulse >= 0 ? 0.78 : 0.42)
          : 0;
      pulseRef.current.scale.setScalar(0.7 + pulseProgress * (chestPulse >= 0 ? 3.3 : 2.2));
      materials.pulse.opacity = pulseOpacity;
    }

    if (torsoRef.current && elapsed >= 4) {
      const torsoPulse = 1 + chestReaction * 0.045;
      torsoRef.current.scale.setScalar(torsoPulse);
    }

    if (robotRef.current) {
      const bounceProgress = clampProgress(elapsed, 4.36, 4.96);
      const bounce = reducedMotion ? 0 : Math.sin(bounceProgress * Math.PI) * 0.14;
      const float =
        !reducedMotion && elapsed > 5 ? Math.sin(state.clock.elapsedTime * 1.45) * 0.055 : 0;
      const jump = jumpProgress >= 0 ? Math.sin(jumpProgress * Math.PI) * 0.72 * motionStrength : 0;
      const danceHop =
        danceProgress >= 0
          ? Math.abs(Math.sin(danceProgress * Math.PI * 8)) * 0.18 * danceEnvelope * motionStrength
          : 0;
      robotRef.current.position.y = ROBOT_VERTICAL_OFFSET + bounce + float + jump + danceHop;
      const activatedScale = MathUtils.lerp(1, 1.1, smooth(clampProgress(elapsed, 3.72, 4.28)));
      const scale =
        activatedScale +
        (!reducedMotion ? Math.sin(bounceProgress * Math.PI) * 0.035 : 0) +
        (jumpProgress >= 0 ? Math.sin(jumpProgress * Math.PI) * 0.04 * motionStrength : 0);
      robotRef.current.scale.setScalar(scale);
      robotRef.current.rotation.x = 0;
      robotRef.current.rotation.y =
        danceProgress >= 0
          ? Math.sin(danceProgress * Math.PI * 4) * 0.42 * danceEnvelope * motionStrength
          : 0;
      robotRef.current.rotation.z =
        danceProgress >= 0
          ? Math.sin(danceProgress * Math.PI * 8) * 0.13 * danceEnvelope * motionStrength
          : 0;
    }

    const waveUp = smooth(clampProgress(elapsed, 5.05, 5.52));
    const waveDown = 1 - smooth(clampProgress(elapsed, 6.88, 7.3));
    const automaticWave = reducedMotion ? 0 : waveUp * waveDown;
    const tapWaveUp = smooth(clampProgress(interactionAge, 0, 0.28));
    const tapWaveDown = 1 - smooth(clampProgress(interactionAge, 1.45, 1.85));
    const tapWave =
      interaction.kind === "hand" && interactionAge >= 0 && interactionAge < 1.85
        ? tapWaveUp * tapWaveDown * motionStrength
        : 0;
    const updateArmWave = (
      side: -1 | 1,
      arm: Group | null,
      hand: Group | null,
      amount: number,
      oscillation: number,
    ) => {
      if (!arm || !hand || elapsed < 5) return;
      arm.position.x = MathUtils.lerp(1.13 * side, 1.35 * side, amount);
      arm.position.y = MathUtils.lerp(-0.18, 0.48, amount);
      arm.rotation.set(
        0,
        0,
        MathUtils.lerp(-0.08 * side, 2.08 * side, amount) + oscillation * 0.14 * side,
      );
      hand.position.x = MathUtils.lerp(1.17 * side, (1.64 + oscillation * 0.08) * side, amount);
      hand.position.y = MathUtils.lerp(-0.86, 0.9 + Math.abs(oscillation) * 0.035, amount);
      hand.position.z = MathUtils.lerp(0, 0.12, amount);
      hand.rotation.z = oscillation * 0.28 * side;
    };
    const leftWave = interaction.side === -1 ? tapWave : 0;
    const rightWave = Math.max(automaticWave, interaction.side === 1 ? tapWave : 0);
    const leftWaveOscillation =
      leftWave > 0 ? Math.sin((interactionAge - 0.24) * Math.PI * 4.8) * leftWave : 0;
    const rightWaveOscillation =
      rightWave > 0
        ? Math.sin(
            (interaction.side === 1 && tapWave > automaticWave ? interactionAge : elapsed - 5.48) *
              Math.PI *
              4.4,
          ) * rightWave
        : 0;
    updateArmWave(-1, leftArmRef.current, leftHandRef.current, leftWave, leftWaveOscillation);
    updateArmWave(1, rightArmRef.current, rightHandRef.current, rightWave, rightWaveOscillation);

    if (danceEnvelope > 0) {
      const danceBeat = Math.sin(danceProgress * Math.PI * 8);
      if (leftArmRef.current)
        leftArmRef.current.rotation.z = MathUtils.lerp(
          leftArmRef.current.rotation.z,
          -1.25 + danceBeat * 0.35,
          danceEnvelope * motionStrength,
        );
      if (rightArmRef.current)
        rightArmRef.current.rotation.z = MathUtils.lerp(
          rightArmRef.current.rotation.z,
          1.25 + danceBeat * 0.35,
          danceEnvelope * motionStrength,
        );
      if (leftLegRef.current)
        leftLegRef.current.rotation.x = danceBeat * 0.16 * danceEnvelope * motionStrength;
      if (rightLegRef.current)
        rightLegRef.current.rotation.x = -danceBeat * 0.16 * danceEnvelope * motionStrength;
    }

    if (headRef.current && elapsed >= 4) {
      const activationTilt = -0.1 * smooth(clampProgress(elapsed, 4.12, 4.82)) * (1 - idle);
      const idleTilt = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.72) * 0.035 * idle;
      const danceNod =
        danceProgress >= 0
          ? Math.sin(danceProgress * Math.PI * 8) * 0.12 * danceEnvelope * motionStrength
          : 0;
      const targetX =
        activationTilt -
        pointerRef.current.y * 0.16 * trackingAmount -
        headReaction * 0.08 +
        danceNod;
      const targetY = pointerRef.current.x * 0.28 * trackingAmount;
      const targetZ = idleTilt + headReaction * 0.24 * motionStrength;
      const headMotion = headMotionRef.current;
      headMotion.x = MathUtils.lerp(headMotion.x, targetX, 0.08);
      headMotion.y = MathUtils.lerp(headMotion.y, targetY, 0.08);
      headMotion.z = MathUtils.lerp(headMotion.z, targetZ, 0.09);
      headRef.current.rotation.set(headMotion.x, headMotion.y, headMotion.z);
    }
  });

  const handlePointer = (hovered: boolean) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    hoveredRef.current = hovered;
  };

  return (
    <group
      ref={robotRef}
      rotation={[0, 0, 0]}
      onPointerOver={handlePointer(true)}
      onPointerOut={handlePointer(false)}
    >
      <RobotHead
        groupRef={headRef}
        leftEyeRef={leftEyeRef}
        rightEyeRef={rightEyeRef}
        geometries={geometries}
        materials={materials}
        onPartClick={handlePartClick}
      />
      <RobotBody
        torsoRef={torsoRef}
        coreRef={coreRef}
        pulseRef={pulseRef}
        geometries={geometries}
        materials={materials}
        onPartClick={handlePartClick}
      />
      <group ref={neckRef}>
        <mesh geometry={geometries.neck} material={materials.joint} />
        <mesh
          geometry={geometries.coreRing}
          material={materials.accent}
          scale={[0.64, 0.64, 0.64]}
        />
      </group>
      <RobotArm
        groupRef={leftArmRef}
        handRef={leftHandRef}
        side={-1}
        geometries={geometries}
        materials={materials}
        onPartClick={handlePartClick}
      />
      <RobotArm
        groupRef={rightArmRef}
        handRef={rightHandRef}
        side={1}
        geometries={geometries}
        materials={materials}
        onPartClick={handlePartClick}
      />
      <RobotLeg
        groupRef={leftLegRef}
        footRef={leftFootRef}
        geometries={geometries}
        materials={materials}
        side={-1}
        onPartClick={handlePartClick}
      />
      <RobotLeg
        groupRef={rightLegRef}
        footRef={rightFootRef}
        geometries={geometries}
        materials={materials}
        side={1}
        onPartClick={handlePartClick}
      />
    </group>
  );
}

export default function MiniRobotCanvas({
  reducedMotion,
  inView,
  darkMode,
}: {
  reducedMotion: boolean;
  inView: boolean;
  darkMode: boolean;
}) {
  const [greetingKey, setGreetingKey] = useState(0);
  const showGreeting = useCallback(() => setGreetingKey((key) => key + 1), []);

  return (
    <div
      className="mini-robot-canvas"
      role="img"
      aria-label="Interactive miniature AI companion. Tap its head, face, hands, chest, or feet to see different reactions."
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "never"}
        camera={{ position: [0, 2.35, 12.8], fov: 37, near: 0.1, far: 50 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={darkMode ? 1.65 : 1.15} color="#cfe4ff" />
        <directionalLight position={[4, 6, 7]} intensity={darkMode ? 2.15 : 1.65} color="#ffffff" />
        <directionalLight position={[-4, 1, 5]} intensity={0.72} color="#42a5ff" />
        <pointLight position={[0, 2, 4]} intensity={0.8} color="#38bdf8" distance={10} />
        <MiniRobot reducedMotion={reducedMotion} darkMode={darkMode} onGreeting={showGreeting} />
      </Canvas>
      {!reducedMotion && (
        <span
          key={greetingKey}
          className={`mini-robot-greeting${greetingKey > 0 ? " mini-robot-greeting--tap" : ""}`}
          aria-hidden
        >
          HI
        </span>
      )}
    </div>
  );
}
