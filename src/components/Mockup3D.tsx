'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber'
import { OrbitControls, Center, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js'

// ---------------------------------------------------------------------------
// TIPE
// ---------------------------------------------------------------------------

export type Side = 'front' | 'back'

export interface SideDesign {
  image: string | null
  scale: number
  x: number
  y: number
}

export type Designs = Record<Side, SideDesign>

type Anchor = { point: THREE.Vector3; normal: THREE.Vector3; mesh: THREE.Mesh }
type Anchors = Record<Side, Anchor | null>

const SIDES: Side[] = ['front', 'back']

// ---------------------------------------------------------------------------
// KONFIGURASI PER JENIS PAKAIAN
// ---------------------------------------------------------------------------

const MODEL_PATHS: Record<string, string> = {
  kaos: '/models/kaos.glb',
  oversized: '/models/kaos.glb',
  hoodie: '/models/hoodie.glb',
  topi: '/models/topi.glb',
}

const DEFAULT_TARGET_SIZE = 2.4
const TARGET_SIZE: Record<string, number> = {
  kaos: 2.4,
  oversized: 2.4,
  hoodie: 2.4,
  topi: 1.8,
}

const HIDE_MESHES: Record<string, string[]> = {
  kaos: [],
  oversized: [],
  hoodie: [],
  topi: [],
}

const DECAL_DEPTH_FACTOR: Record<string, number> = {
  hoodie: 0.5,
}

// ---------------------------------------------------------------------------
// HELPER
// ---------------------------------------------------------------------------

const isMesh = (o: THREE.Object3D): o is THREE.Mesh => (o as THREE.Mesh).isMesh === true

const getModelBox = (root: THREE.Object3D) => {
  const box = new THREE.Box3()
  root.updateWorldMatrix(true, true)
  root.traverse((c) => {
    if (isMesh(c) && !c.userData.isDecal) box.expandByObject(c)
  })
  return box
}

const keepFacingTriangles = (geo: THREE.BufferGeometry, dir: THREE.Vector3, minDot = 0.3) => {
  const pos = geo.getAttribute('position')
  const nor = geo.getAttribute('normal')
  const uv = geo.getAttribute('uv')
  if (!pos || !nor || !uv) return geo

  const p: number[] = []
  const n: number[] = []
  const u: number[] = []
  const v = new THREE.Vector3()
  const tmp = new THREE.Vector3()
  for (let i = 0; i + 2 < pos.count; i += 3) {
    v.set(0, 0, 0)
    for (let k = 0; k < 3; k++) v.add(tmp.set(nor.getX(i + k), nor.getY(i + k), nor.getZ(i + k)))
    v.normalize()
    if (v.dot(dir) < minDot) continue
    for (let k = 0; k < 3; k++) {
      p.push(pos.getX(i + k), pos.getY(i + k), pos.getZ(i + k))
      n.push(nor.getX(i + k), nor.getY(i + k), nor.getZ(i + k))
      u.push(uv.getX(i + k), uv.getY(i + k))
    }
  }
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(p, 3))
  out.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3))
  out.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2))
  geo.dispose()
  return out
}

class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; label: string },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error('Gagal memuat model 3D:', error)
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="w-full h-full flex items-center justify-center text-center px-6">
          <p className="text-xs font-bold text-zinc-400">
            Model 3D untuk {this.props.label} belum tersedia atau filenya rusak.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// SATU LAPISAN DESAIN (depan atau belakang)
// ---------------------------------------------------------------------------

interface DesignLayerProps {
  model: THREE.Object3D
  side: Side
  apparelType: string
  imageUrl: string | null
  scale: number
  positionX: number
  positionY: number
  anchor: Anchor | null
}

function DesignLayer({ model, side, apparelType, imageUrl, scale, positionX, positionY, anchor }: DesignLayerProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null)
      return
    }
    let cancelled = false
    let loadedTexture: THREE.Texture | null = null

    // Memuat gambar via HTML Image Element supaya format Base64 / Blob URL terbaca 100%
    const imgElement = new window.Image()
    imgElement.crossOrigin = 'anonymous'
    imgElement.src = imageUrl
    imgElement.onload = () => {
      if (cancelled) return
      const t = new THREE.Texture(imgElement)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      t.needsUpdate = true
      loadedTexture = t
      setTexture(t)
    }

    return () => {
      cancelled = true
      loadedTexture?.dispose()
    }
  }, [imageUrl])

  const material = useMemo(
    () =>
      texture
        ? new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            roughness: 0.9,
            metalness: 0,
            side: THREE.DoubleSide,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
          })
        : null,
    [texture]
  )

  useEffect(() => {
    return () => {
      material?.dispose()
    }
  }, [material])

  const decalsRef = useRef<THREE.Mesh[]>([])
  const removeDecals = useCallback(() => {
    decalsRef.current.forEach((d) => {
      model.remove(d)
      d.geometry.dispose()
    })
    decalsRef.current = []
  }, [model])

  useEffect(() => removeDecals, [model, texture, removeDecals])

  useEffect(() => {
    if (!texture || !material) {
      removeDecals()
      return
    }
    const img = texture.image as unknown as { width: number; height: number } | undefined
    if (!img || !img.width) return
    const aspect = img.height / img.width

    const fullBox = getModelBox(model)
    const size = fullBox.getSize(new THREE.Vector3())
    const centerX = (fullBox.min.x + fullBox.max.x) / 2
    const solid = (h: THREE.Intersection) => isMesh(h.object) && !h.object.userData.isDecal

    let targetMesh: THREE.Mesh
    let point: THREE.Vector3
    let normal: THREE.Vector3

    if (anchor) {
      targetMesh = anchor.mesh
      point = anchor.point.clone()
      normal = anchor.normal.clone()
    } else {
      const dirX = side === 'front' ? 1 : -1
      const aimX = centerX + dirX * positionX * size.x * 0.5
      const aimY = fullBox.min.y + size.y * (0.55 + positionY * 0.5)

      const castFrom = (dirZ: 1 | -1) => {
        const d = new THREE.Vector3(0, 0, -dirZ)
        const origin = new THREE.Vector3(aimX, aimY, dirZ > 0 ? fullBox.max.z + 1 : fullBox.min.z - 1)
        const hits = new THREE.Raycaster(origin, d).intersectObject(model, true).filter(solid)
        return { d, hit: hits[0] }
      }

      const order: (1 | -1)[] = side === 'front' ? [1, -1] : [-1]
      let found: { d: THREE.Vector3; hit: THREE.Intersection } | null = null
      for (const z of order) {
        const r = castFrom(z)
        if (r.hit) {
          found = { d: r.d, hit: r.hit }
          break
        }
      }
      if (!found || !found.hit.face) {
        removeDecals()
        return
      }

      targetMesh = found.hit.object as THREE.Mesh
      point = found.hit.point.clone()
      normal = found.hit.face.normal.clone().transformDirection(targetMesh.matrixWorld)
      if (normal.dot(found.d) > 0) normal.negate()
    }

    const into = normal.clone().negate()

    const behind = new THREE.Raycaster(point.clone().addScaledVector(into, 0.002), into)
      .intersectObject(model, true)
      .filter(solid)
    const thickness = behind.length ? behind[0].distance : size.z

    const width = size.x * 0.4 * scale
    const height = width * aspect
    const depthFactor = DECAL_DEPTH_FACTOR[apparelType]
    const depth = depthFactor
      ? Math.max(0.05, width * depthFactor)
      : Math.max(0.01, Math.min(thickness * 1.6, width * 0.8))

    const up = Math.abs(normal.y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0)
    const rotMatrix = new THREE.Matrix4().lookAt(normal, new THREE.Vector3(0, 0, 0), up)
    const orientation = new THREE.Euler().setFromRotationMatrix(rotMatrix)

    const reach = Math.max(width, height, depth) * 0.8
    const candidates: THREE.Mesh[] = []
    model.traverse((c) => {
      if (!isMesh(c) || c.userData.isDecal) return
      const box = new THREE.Box3().setFromObject(c)
      if (box.distanceToPoint(point) <= reach) candidates.push(c)
    })
    if (!candidates.includes(targetMesh)) candidates.push(targetMesh)

    removeDecals()
    const inverse = model.matrixWorld.clone().invert()
    candidates.forEach((m) => {
      let geometry: THREE.BufferGeometry = new DecalGeometry(m, point, orientation, new THREE.Vector3(width, height, depth))
      geometry = keepFacingTriangles(geometry, normal)
      if (geometry.getAttribute('position').count === 0) {
        geometry.dispose()
        return
      }
      geometry.applyMatrix4(inverse)
      const mesh = new THREE.Mesh(geometry, material)
      mesh.renderOrder = side === 'front' ? 1 : 2
      mesh.userData.isDecal = true
      mesh.userData.side = side
      model.add(mesh)
      decalsRef.current.push(mesh)
    })
  }, [model, texture, material, side, apparelType, scale, positionX, positionY, anchor, removeDecals])

  return null
}

// ---------------------------------------------------------------------------
// MODEL BAJU + DUA LAPISAN DESAIN
// ---------------------------------------------------------------------------

interface ApparelModelProps {
  apparelType: string
  color: string
  designs: Designs
  controlsRef: React.MutableRefObject<any>
}

function ApparelModel({ apparelType, color, designs, controlsRef }: ApparelModelProps) {
  const { camera, gl } = useThree()
  const { scene } = useGLTF(MODEL_PATHS[apparelType] || MODEL_PATHS.kaos)

  const model = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((child) => {
      if (isMesh(child) && child.material) {
        child.material = Array.isArray(child.material)
          ? child.material.map((m) => m.clone())
          : child.material.clone()
      }
    })

    clone.updateWorldMatrix(true, true)
    const hide = HIDE_MESHES[apparelType] || []
    const toRemove: THREE.Object3D[] = []
    clone.traverse((c) => {
      if (isMesh(c) && hide.includes(c.name)) toRemove.push(c)
    })
    toRemove.forEach((c) => c.parent?.remove(c))

    const target = TARGET_SIZE[apparelType] ?? DEFAULT_TARGET_SIZE
    const size = getModelBox(clone).getSize(new THREE.Vector3())
    const max = Math.max(size.x, size.y, size.z)
    if (max > 0) clone.scale.multiplyScalar(target / max)

    return clone
  }, [scene, apparelType])

  const [anchors, setAnchors] = useState<Anchors>({ front: null, back: null })

  useEffect(() => {
    setAnchors({ front: null, back: null })
  }, [model])
  useEffect(() => {
    setAnchors((a) => ({ ...a, front: null }))
  }, [designs.front.x, designs.front.y])
  useEffect(() => {
    setAnchors((a) => ({ ...a, back: null }))
  }, [designs.back.x, designs.back.y])

  useEffect(() => {
    model.traverse((child) => {
      if (!isMesh(child) || child.userData.isDecal) return
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial
        if (mat && mat.color) {
          mat.color.set(color)
          mat.map = null
          mat.side = THREE.DoubleSide
          mat.needsUpdate = true
        }
      })
    })
  }, [model, color])

  const draggingSideRef = useRef<Side | null>(null)

  useEffect(() => {
    const raycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let raf = 0
    let pending: { side: Side; anchor: Anchor } | null = null

    const onMove = (ev: PointerEvent) => {
      const side = draggingSideRef.current
      if (!side) return

      const rect = gl.domElement.getBoundingClientRect()
      ndc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(ndc, camera)

      const hit = raycaster
        .intersectObject(model, true)
        .find((h) => isMesh(h.object) && !h.object.userData.isDecal && h.face)
      if (!hit || !hit.face) return

      const mesh = hit.object as THREE.Mesh
      const normal = hit.face.normal.clone().transformDirection(mesh.matrixWorld)
      if (normal.dot(raycaster.ray.direction) > 0) normal.negate()

      pending = { side, anchor: { point: hit.point.clone(), normal, mesh } }
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0
          if (pending) {
            const { side: s, anchor } = pending
            setAnchors((a) => ({ ...a, [s]: anchor }))
          }
        })
      }
    }

    const onUp = () => {
      if (!draggingSideRef.current) return
      draggingSideRef.current = null
      if (controlsRef.current) controlsRef.current.enabled = true
      gl.domElement.style.cursor = ''
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [camera, gl, model, controlsRef])

  const visibleDecal = (e: ThreeEvent<PointerEvent>) => {
    const first = e.intersections[0]
    if (!first) return undefined
    return e.intersections.find((i) => i.object.userData.isDecal && i.distance - first.distance < 0.02)
  }

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    const hit = visibleDecal(e)
    if (!hit) return

    e.stopPropagation()
    draggingSideRef.current = hit.object.userData.side as Side
    if (controlsRef.current) controlsRef.current.enabled = false
    gl.domElement.style.cursor = 'move'
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (draggingSideRef.current) return
    gl.domElement.style.cursor = visibleDecal(e) ? 'move' : ''
  }

  const handlePointerOut = () => {
    if (!draggingSideRef.current) gl.domElement.style.cursor = ''
  }

  return (
    <group position={[0, -0.2, 0]}>
      <Center>
        <primitive
          object={model}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
        />
      </Center>

      {SIDES.map((side) => (
        <DesignLayer
          key={side}
          model={model}
          side={side}
          apparelType={apparelType}
          imageUrl={designs[side].image}
          scale={designs[side].scale}
          positionX={designs[side].x}
          positionY={designs[side].y}
          anchor={anchors[side]}
        />
      ))}
    </group>
  )
}

function CameraRig({ viewSide, controlsRef }: { viewSide: Side; controlsRef: React.MutableRefObject<any> }) {
  const { camera } = useThree()
  useEffect(() => {
    const dist = camera.position.length() || 4
    camera.position.set(0, 0, viewSide === 'back' ? -dist : dist)
    camera.lookAt(0, 0, 0)
    controlsRef.current?.update()
  }, [viewSide, camera, controlsRef])
  return null
}

function SceneCapture({ onReady }: { onReady: React.MutableRefObject<(() => void) | null> }) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    onReady.current = () => {
      try {
        gl.render(scene, camera)
        const dataUrl = gl.domElement.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `preview-3d-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err) {
        console.error('Gagal mengekspor gambar canvas 3D:', err)
      }
    }
  }, [gl, scene, camera, onReady])
  return null
}

// ---------------------------------------------------------------------------
// KOMPONEN UTAMA
// ---------------------------------------------------------------------------

interface Mockup3DProps {
  apparelType?: string
  color?: string
  designs?: Designs
  viewSide?: Side
  onDownloadRef?: React.MutableRefObject<(() => void) | null>
}

const EMPTY_DESIGNS: Designs = {
  front: { image: null, scale: 0.8, x: 0, y: 0.1 },
  back: { image: null, scale: 0.8, x: 0, y: 0.1 },
}

export default function Mockup3D({
  apparelType = 'kaos',
  color = '#ffffff',
  designs = EMPTY_DESIGNS,
  viewSide = 'front',
  onDownloadRef,
}: Mockup3DProps) {
  const controlsRef = useRef<any>(null)
  const internalDownloadRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (onDownloadRef) {
      onDownloadRef.current = () => {
        if (internalDownloadRef.current) {
          internalDownloadRef.current()
        }
      }
    }
  }, [onDownloadRef])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative bg-zinc-900/50 rounded-3xl p-4 border border-zinc-800 overflow-hidden shadow-2xl">
      <div className="absolute top-4 left-6 z-10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          DSCPL WEARS 3D Studio ({apparelType.toUpperCase()})
        </span>
      </div>

      <div className="w-full h-[480px] cursor-grab active:cursor-grabbing flex items-center justify-center">
        <ModelErrorBoundary key={apparelType} label={apparelType}>
          <Canvas 
            camera={{ position: [0, 0, 4], fov: 45 }}
            gl={{ preserveDrawingBuffer: true, alpha: true }}
          >
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} />
            <directionalLight position={[-5, -5, -5]} intensity={0.8} />
            <React.Suspense fallback={null}>
              <ApparelModel apparelType={apparelType} color={color} designs={designs} controlsRef={controlsRef} />
            </React.Suspense>
            <OrbitControls ref={controlsRef} enableZoom={true} minDistance={2} maxDistance={6} target={[0, 0, 0]} />
            <CameraRig viewSide={viewSide} controlsRef={controlsRef} />
            <SceneCapture onReady={internalDownloadRef} />
          </Canvas>
        </ModelErrorBoundary>
      </div>

      <div className="absolute bottom-4 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-zinc-800">
        Seret desain untuk memindahkan • Seret baju untuk memutar • Scroll untuk Zoom
      </div>
    </div>
  )
}