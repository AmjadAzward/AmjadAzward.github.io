import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
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
  eye: "#42a5ff",
  cyan: "#38bdf8",
  face: "#101827",
  joint: "#64748b",
  dark: "#07101e",
};

type Vec3 = [number, number, number];
type PiecePose = { position: Vec3; rotation: Vec3 };
type RobotMaterials = ReturnType<typeof createMaterials>;
type RobotGeometries = ReturnType<typeof createGeometries>;

const FINAL_POSE: PiecePose = { position: [0, 0, 0], rotation: [0, 0, 0] };
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
}: {
  groupRef: React.RefObject<Group | null>;
  leftEyeRef: React.RefObject<Group | null>;
  rightEyeRef: React.RefObject<Group | null>;
  geometries: RobotGeometries;
  materials: RobotMaterials;
}) {
  return (
    <group ref={groupRef}>
      <mesh geometry={geometries.head} material={materials.body} />
      <mesh geometry={geometries.face} material={materials.face} position={[0, 0, 0.55]} />
      <group ref={leftEyeRef} position={[-0.52, 0.08, 0.69]}>
        <mesh geometry={geometries.eye} material={materials.eye} scale={[1.08, 0.62, 0.22]} />
      </group>
      <group ref={rightEyeRef} position={[0.52, 0.08, 0.69]}>
        <mesh geometry={geometries.eye} material={materials.eye} scale={[1.08, 0.62, 0.22]} />
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
}: {
  torsoRef: React.RefObject<Group | null>;
  coreRef: React.RefObject<Group | null>;
  pulseRef: React.RefObject<Group | null>;
  geometries: RobotGeometries;
  materials: RobotMaterials;
}) {
  return (
    <>
      <group ref={torsoRef}>
        <mesh geometry={geometries.torso} material={materials.body} />
        <mesh
          geometry={geometries.chestPanel}
          material={materials.face}
          position={[0, 0.08, 0.45]}
        />
        <mesh
          geometry={geometries.sideDetail}
          material={materials.accent}
          position={[0, -0.55, 0.48]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.7, 1, 0.7]}
        />
      </group>
      <group ref={coreRef}>
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
}: {
  groupRef: React.RefObject<Group | null>;
  handRef: React.RefObject<Group | null>;
  side: -1 | 1;
  geometries: RobotGeometries;
  materials: RobotMaterials;
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
      <group ref={handRef}>
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
}: {
  groupRef: React.RefObject<Group | null>;
  footRef: React.RefObject<Group | null>;
  geometries: RobotGeometries;
  materials: RobotMaterials;
}) {
  return (
    <>
      <group ref={groupRef}>
        <mesh geometry={geometries.joint} material={materials.joint} position={[0, 0.28, 0]} />
        <mesh geometry={geometries.leg} material={materials.body} />
      </group>
      <group ref={footRef}>
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
  replayToken,
  reducedMotion,
}: {
  replayToken: number;
  reducedMotion: boolean;
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

  const materials = useMemo(createMaterials, []);
  const geometries = useMemo(createGeometries, []);

  useEffect(() => {
    startTimeRef.current = null;
  }, [replayToken, reducedMotion]);

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
    const clickAmount =
      sinceClick >= 0 && sinceClick < 0.7 ? Math.sin((sinceClick / 0.7) * Math.PI) : 0;
    const hoverAmount = hoveredRef.current && elapsed >= 4 ? 1 : 0;
    const breathing = reducedMotion ? 0 : (Math.sin(state.clock.elapsedTime * 2.2) + 1) * 0.5;

    materials.eye.color.copy(DARK).lerp(BLUE, activation);
    materials.eye.emissiveIntensity = activation * (0.95 + hoverAmount * 0.42 + clickAmount * 0.65);
    materials.core.color.copy(DARK).lerp(BLUE, activation);
    materials.core.emissiveIntensity =
      activation * (0.92 + breathing * 0.34 * idle + hoverAmount * 0.38 + clickAmount * 0.75);
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

    if (leftEyeRef.current) {
      leftEyeRef.current.scale.y = blinkScale;
      leftEyeRef.current.position.x = MathUtils.lerp(
        leftEyeRef.current.position.x,
        -0.52 + eyeOffsetX,
        0.16,
      );
      leftEyeRef.current.position.y = MathUtils.lerp(
        leftEyeRef.current.position.y,
        0.08 + eyeOffsetY,
        0.16,
      );
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.y = blinkScale;
      rightEyeRef.current.position.x = MathUtils.lerp(
        rightEyeRef.current.position.x,
        0.52 + eyeOffsetX,
        0.16,
      );
      rightEyeRef.current.position.y = MathUtils.lerp(
        rightEyeRef.current.position.y,
        0.08 + eyeOffsetY,
        0.16,
      );
    }

    if (pulseRef.current) {
      const activationPulse = clampProgress(elapsed, 4.08, 4.92);
      const clickPulse = sinceClick >= 0 && sinceClick < 0.72 ? sinceClick / 0.72 : -1;
      const pulseProgress = clickPulse >= 0 ? clickPulse : activationPulse;
      const pulseOpacity =
        pulseProgress > 0 && pulseProgress < 1 ? Math.sin(pulseProgress * Math.PI) * 0.42 : 0;
      pulseRef.current.scale.setScalar(0.7 + pulseProgress * 2.2);
      materials.pulse.opacity = pulseOpacity;
    }

    if (robotRef.current) {
      const bounceProgress = clampProgress(elapsed, 4.36, 4.96);
      const bounce = reducedMotion ? 0 : Math.sin(bounceProgress * Math.PI) * 0.14;
      const float =
        !reducedMotion && elapsed > 5 ? Math.sin(state.clock.elapsedTime * 1.45) * 0.055 : 0;
      robotRef.current.position.y = bounce + float;
      const activatedScale = MathUtils.lerp(1, 1.1, smooth(clampProgress(elapsed, 3.72, 4.28)));
      const scale =
        activatedScale + (!reducedMotion ? Math.sin(bounceProgress * Math.PI) * 0.035 : 0);
      robotRef.current.scale.setScalar(scale);
    }

    if (headRef.current && elapsed >= 4) {
      const activationTilt = -0.1 * smooth(clampProgress(elapsed, 4.12, 4.82)) * (1 - idle);
      const idleTilt = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.72) * 0.035 * idle;
      const targetX = activationTilt - pointerRef.current.y * 0.16 * trackingAmount;
      const targetY = pointerRef.current.x * 0.28 * trackingAmount;
      const targetZ = idleTilt + clickAmount * 0.16;
      headRef.current.rotation.x = MathUtils.lerp(headRef.current.rotation.x, targetX, 0.08);
      headRef.current.rotation.y = MathUtils.lerp(headRef.current.rotation.y, targetY, 0.08);
      headRef.current.rotation.z = MathUtils.lerp(headRef.current.rotation.z, targetZ, 0.09);
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!reducedMotion && elapsedRef.current >= 4) clickTimeRef.current = performance.now() / 1000;
  };

  const handlePointer = (hovered: boolean) => (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    hoveredRef.current = hovered;
  };

  return (
    <group
      ref={robotRef}
      rotation={[0, -0.08, 0]}
      onPointerOver={handlePointer(true)}
      onPointerOut={handlePointer(false)}
      onClick={handleClick}
    >
      <RobotHead
        groupRef={headRef}
        leftEyeRef={leftEyeRef}
        rightEyeRef={rightEyeRef}
        geometries={geometries}
        materials={materials}
      />
      <RobotBody
        torsoRef={torsoRef}
        coreRef={coreRef}
        pulseRef={pulseRef}
        geometries={geometries}
        materials={materials}
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
      />
      <RobotArm
        groupRef={rightArmRef}
        handRef={rightHandRef}
        side={1}
        geometries={geometries}
        materials={materials}
      />
      <RobotLeg
        groupRef={leftLegRef}
        footRef={leftFootRef}
        geometries={geometries}
        materials={materials}
      />
      <RobotLeg
        groupRef={rightLegRef}
        footRef={rightFootRef}
        geometries={geometries}
        materials={materials}
      />
    </group>
  );
}

export default function MiniRobotCanvas({
  replayToken,
  reducedMotion,
  inView,
}: {
  replayToken: number;
  reducedMotion: boolean;
  inView: boolean;
}) {
  return (
    <div
      className="mini-robot-canvas"
      role="img"
      aria-label="Interactive miniature AI companion assembling itself from floating components"
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "never"}
        camera={{ position: [4.6, 2.7, 11.8], fov: 37, near: 0.1, far: 50 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={1.65} color="#cfe4ff" />
        <directionalLight position={[4, 6, 7]} intensity={2.15} color="#ffffff" />
        <directionalLight position={[-4, 1, 5]} intensity={0.72} color="#42a5ff" />
        <pointLight position={[0, 2, 4]} intensity={0.8} color="#38bdf8" distance={10} />
        <MiniRobot replayToken={replayToken} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
