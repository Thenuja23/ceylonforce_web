import { Component, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

const RING_COUNT = 11

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 src = texture2D(uTexture, vUv);
    float lum = dot(src.rgb, vec3(0.299, 0.587, 0.114));

    // The artwork is dark pixels on a transparent background, so the
    // alpha channel defines the mark. Luminance only sharpens the edges
    // instead of hiding the logo against the dark page.
    float edge = smoothstep(0.015, 0.22, lum);
    float mark = src.a * mix(0.75, 1.0, edge);

    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.4);
    vec3 base = vec3(0.54, 0.56, 0.58);
    vec3 lit = mix(base, vec3(0.95, 0.97, 1.0), fresnel * 0.6);
    gl_FragColor = vec4(lit, mark * 0.96);
  }
`

type LogoModelProps = {
  targetRotation: React.MutableRefObject<THREE.Euler>
  scrollProgress: React.MutableRefObject<number>
  isHovered: boolean
  reducedMotion: boolean
}

function RippleRing({
  index,
  baseRadius,
  scrollProgress,
}: {
  index: number
  baseRadius: number
  scrollProgress: React.MutableRefObject<number>
}) {
  const ref = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const baseZ = index * 0.006

  useFrame(() => {
    const mesh = ref.current
    const material = materialRef.current
    if (!mesh) return

    const p = scrollProgress.current
    const wave = Math.sin(p * Math.PI * 2 + index * 0.45) * 0.015
    const expand = 1 + p * 0.28 + index * 0.012
    const scale = expand + wave

    mesh.scale.set(scale, scale, 1)
    mesh.position.z = baseZ + p * 0.09 + wave * 2
    if (material) {
      material.opacity =
        THREE.MathUtils.lerp(0.18, 0.72, 1 - index / RING_COUNT) * (0.55 + p * 0.45)
    }
  })

  return (
    <mesh ref={ref} position={[-1.62, 0.02, baseZ]}>
      <torusGeometry args={[baseRadius, 0.0028, 8, 96]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#b8bcc0"
        metalness={0.94}
        roughness={0.18}
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </mesh>
  )
}

function LogoModel({ targetRotation, scrollProgress, isHovered, reducedMotion }: LogoModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const plateRef = useRef<THREE.Mesh>(null)
  const source = useLoader(THREE.TextureLoader, '/ceylonforce-logo.png')

  const { tex, planeWidth, planeHeight } = useMemo(() => {
    const image = source.image as HTMLImageElement
    const aspect = image.width / image.height
    const width = 4.6
    const t = source.clone()
    t.needsUpdate = true
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.minFilter = THREE.LinearMipmapLinearFilter
    t.magFilter = THREE.LinearFilter
    return { tex: t, planeWidth: width, planeHeight: width / aspect }
  }, [source])

  const rings = useMemo(
    () => Array.from({ length: RING_COUNT }, (_, i) => 0.07 + i * 0.034),
    [],
  )

  useFrame((_, delta) => {
    const group = groupRef.current
    const plate = plateRef.current
    if (!group) return

    const p = scrollProgress.current
    const hoverScale = isHovered ? 1.025 : 1
    const breathe = 1 + Math.sin(p * Math.PI) * 0.018

    if (reducedMotion) {
      group.rotation.copy(targetRotation.current)
      group.scale.setScalar(hoverScale)
      if (plate) plate.position.z = p * 0.04
      return
    }

    const s = 1 - Math.exp(-delta * 7)
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotation.current.x, s)
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotation.current.y, s)
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetRotation.current.z, s)
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, hoverScale * breathe, s))

    if (plate) {
      plate.position.z = THREE.MathUtils.lerp(plate.position.z, 0.02 + p * 0.07, s)
    }
  })

  return (
    <group ref={groupRef} rotation={[0.06, -0.12, 0]}>
      {rings.map((radius, i) => (
        <RippleRing
          key={radius}
          index={i}
          baseRadius={radius}
          scrollProgress={scrollProgress}
        />
      ))}

      <mesh ref={plateRef} position={[0, 0, 0.02]}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <shaderMaterial
          uniforms={{ uTexture: { value: tex } }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Subtle backing plate for depth */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[planeWidth * 1.02, planeHeight * 1.35]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.6}
          roughness={0.85}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  )
}

class LogoErrorBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

type LogoSceneProps = {
  targetRotation: React.MutableRefObject<THREE.Euler>
  scrollProgress: React.MutableRefObject<number>
  isHovered: boolean
  reducedMotion: boolean
}

export default function LogoScene({
  targetRotation,
  scrollProgress,
  isHovered,
  reducedMotion,
}: LogoSceneProps) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
      camera={{ position: [0, 0, 4.8], fov: 42, near: 0.1, far: 100 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      frameloop="always"
      onCreated={({ gl }) => {
        const el = gl.domElement
        const onLost = (event: Event) => {
          event.preventDefault()
        }
        el.addEventListener('webglcontextlost', onLost, false)
        return () => el.removeEventListener('webglcontextlost', onLost)
      }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[-4, 2, 5]} intensity={2.4} color="#fff5ee" />
      <directionalLight position={[4, -1, 3]} intensity={1.1} color="#8899aa" />
      <directionalLight position={[0, 0, -3]} intensity={0.25} color="#ffffff" />
      <pointLight position={[-2.5, 0.5, 2]} intensity={0.6} color="#c8d0d8" />
      <LogoErrorBoundary>
        <LogoModel
          targetRotation={targetRotation}
          scrollProgress={scrollProgress}
          isHovered={isHovered}
          reducedMotion={reducedMotion}
        />
      </LogoErrorBoundary>
    </Canvas>
  )
}