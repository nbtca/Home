import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js"
import { OutputPass } from "three/addons/postprocessing/OutputPass.js"
import { tape } from "./od"

type Shot = [x: number, y: number, z: number, tx: number, ty: number, tz: number]

const shots = {
  far: [0.95, 0.85, 1.35, 0, 0.03, 0],
  wide: [0.38, 0.34, 0.56, 0, 0.03, 0],
  well: [-0.06, 0.3, 0.27, -0.052, 0.04, 0],
  keys: [0.15, 0.12, 0.3, 0.07, 0.03, 0.07],
  display: [0.11, 0.15, 0.17, 0.055, 0.048, 0.003],
  reels: [-0.03, 0.2, 0.15, -0.052, 0.04, 0],
  low: [-0.24, 0.07, 0.34, 0, 0.035, 0],
  top: [0.02, 0.52, 0.1, 0, 0.03, 0],
  side: [0.34, 0.16, 0.36, 0.01, 0.03, 0.02],
  front: [0, 0.16, 0.42, 0, 0.035, 0.02],
} satisfies Record<string, Shot>

// One camera position per message, then the finale.
const messageShots: Shot[] = [shots.wide, shots.display, shots.reels, shots.low, shots.keys, shots.side, shots.display, shots.top, shots.front, shots.reels]

const LID_OPEN = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -1.75)
const KEY_NAMES = ["RECORD", "REW", "PLAY", "FF", "STOP", "PAUSE"] as const
type Key = typeof KEY_NAMES[number]

const smooth = (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

// Value noise keeps the grain organic without shipping an image.
function noise1(seed: number) {
  const r = (i: number) => {
    const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453
    return x - Math.floor(x)
  }
  return (x: number) => {
    const i = Math.floor(x)
    const f = x - i
    const u = f * f * (3 - 2 * f)
    return r(i) * (1 - u) + r(i + 1) * u
  }
}

// Walnut is drawn as long growth rings bent by noise, with pores and a few figure streaks.
// Returns color, roughness and bump maps that share the same pattern.
function walnutMaps() {
  const W = 2048
  const H = 1024
  const color = document.createElement("canvas")
  color.width = W
  color.height = H
  const g = color.getContext("2d")!
  const tone = g.createLinearGradient(0, 0, 0, H)
  tone.addColorStop(0, "#4a2013")
  tone.addColorStop(0.35, "#5a2817")
  tone.addColorStop(0.7, "#46200f")
  tone.addColorStop(1, "#542514")
  g.fillStyle = tone
  g.fillRect(0, 0, W, H)

  const bump = document.createElement("canvas")
  bump.width = W
  bump.height = H
  const b = bump.getContext("2d")!
  b.fillStyle = "#808080"
  b.fillRect(0, 0, W, H)

  const warp = noise1(3)
  const warpFine = noise1(7)
  const rings = 170
  for (let i = 0; i < rings; i++) {
    const y0 = (i / rings) * H + (Math.random() - 0.5) * 4
    const late = i % 3 === 0
    const width = late ? 2.4 + Math.random() * 3.6 : 0.8 + Math.random() * 1.4
    const dark = late ? 0.5 + Math.random() * 0.35 : 0.12 + Math.random() * 0.16
    const path = new Path2D()
    for (let x = -10; x <= W + 10; x += 6) {
      const y = y0 + (warp(x / 420 + i * 0.07) - 0.5) * 34 + (warpFine(x / 60 + i) - 0.5) * 3
      if (x === -10) path.moveTo(x, y)
      else path.lineTo(x, y)
    }
    g.strokeStyle = `rgba(24,9,3,${dark})`
    g.lineWidth = width
    g.stroke(path)
    b.strokeStyle = `rgba(40,40,40,${late ? 0.5 : 0.18})`
    b.lineWidth = width
    b.stroke(path)
    if (Math.random() < 0.25) {
      g.strokeStyle = `rgba(150,78,40,${0.05 + Math.random() * 0.08})`
      g.lineWidth = 2 + Math.random() * 5
      g.stroke(path)
    }
  }

  // Open pores: short dark dashes along the grain.
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const len = 3 + Math.random() * 10
    g.fillStyle = `rgba(15,5,2,${0.18 + Math.random() * 0.3})`
    g.fillRect(x, y, len, 0.9)
    b.fillStyle = "rgba(20,20,20,0.55)"
    b.fillRect(x, y, len, 0.9)
  }

  // Broad figure so large panels do not look uniform.
  const figure = noise1(11)
  for (let x = 0; x < W; x += 4) {
    const a = (figure(x / 260) - 0.5) * 0.28
    g.fillStyle = a > 0 ? `rgba(160,80,40,${a})` : `rgba(10,4,2,${-a})`
    g.fillRect(x, 0, 4, H)
  }

  const rough = document.createElement("canvas")
  rough.width = W
  rough.height = H
  const r = rough.getContext("2d")!
  r.filter = "grayscale(1) contrast(0.6) brightness(1.5)"
  r.drawImage(color, 0, 0)

  const tex = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c)
    if (srgb) t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 16
    return t
  }
  return { map: tex(color, true), roughnessMap: tex(rough, false), bumpMap: tex(bump, false) }
}

// The cabinet's UVs collapse whole faces onto one point, so the grain is projected from object space instead.
// Each face picks the projection along its dominant normal axis; the grain runs along x.
function boxMapWood(m: THREE.MeshPhysicalMaterial, maps: ReturnType<typeof walnutMaps>) {
  m.map = maps.map
  m.roughnessMap = maps.roughnessMap
  m.bumpMap = maps.bumpMap
  m.bumpScale = 1.2
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWoodPos;\nvarying vec3 vWoodNormal;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWoodPos = position;\nvWoodNormal = normal;")
    const uv = `
      vec3 wn = abs(normalize(vWoodNormal));
      woodUv = wn.y > max(wn.x, wn.z) ? vWoodPos.xz : wn.z > wn.x ? vWoodPos.xy : vWoodPos.zy;
      woodUv = woodUv * vec2(2.2, 3.4) + vec2(0.37, 0.11);
    `
    // Chunks are still #include lines at this point, so expand the ones that sample maps before renaming their UVs.
    const chunk = (name: keyof typeof THREE.ShaderChunk, from: string) => THREE.ShaderChunk[name].replaceAll(from, "woodUv")
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWoodPos;\nvarying vec3 vWoodNormal;\nvec2 woodUv;")
      .replace("#include <bumpmap_pars_fragment>", chunk("bumpmap_pars_fragment", "vBumpMapUv"))
      .replace("void main() {", `void main() {\n${uv}`)
      .replace("#include <map_fragment>", chunk("map_fragment", "vMapUv"))
      .replace("#include <roughnessmap_fragment>", chunk("roughnessmap_fragment", "vRoughnessMapUv"))
  }
  m.customProgramCacheKey = () => "box-mapped-walnut"
  m.needsUpdate = true
}

class DotMatrix {
  readonly cols = 64
  readonly rows = 16
  readonly texture: THREE.CanvasTexture
  private glyphs = document.createElement("canvas")
  private out = document.createElement("canvas")
  private last = ""

  constructor() {
    this.glyphs.width = this.cols
    this.glyphs.height = this.rows
    this.out.width = this.cols * 8
    this.out.height = this.rows * 8
    this.texture = new THREE.CanvasTexture(this.out)
    this.texture.colorSpace = THREE.SRGBColorSpace
  }

  draw(text: string, level: number, blink: boolean) {
    const bars = Math.round(level * 24)
    const key = `${text}|${bars}|${blink}`
    if (key === this.last) return
    this.last = key
    const g = this.glyphs.getContext("2d", { willReadFrequently: true })!
    g.fillStyle = "#000"
    g.fillRect(0, 0, this.cols, this.rows)
    if (!blink) {
      g.fillStyle = "#fff"
      g.font = "bold 10px ui-monospace, Menlo, monospace"
      g.textBaseline = "top"
      g.fillText(text, 2, 0)
    }
    const px = g.getImageData(0, 0, this.cols, this.rows).data
    const o = this.out.getContext("2d")!
    o.fillStyle = "#120600"
    o.fillRect(0, 0, this.out.width, this.out.height)
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const meter = y >= 13 && y <= 14 && x >= 2 && x < 2 + bars * 2 && x % 2 === 0
        const on = y < 12 ? px[(y * this.cols + x) * 4] > 110 : meter
        o.fillStyle = on ? "#ffb02e" : "#2a1103"
        o.beginPath()
        o.arc(x * 8 + 4, y * 8 + 4, on ? 3.2 : 2.6, 0, Math.PI * 2)
        o.fill()
      }
    }
    this.texture.needsUpdate = true
  }
}

export function mountMachine(root: HTMLElement) {
  const canvas = root.querySelector("canvas")!
  const audio = root.querySelector("audio")!
  const caption = root.querySelector<HTMLElement>("[data-caption]")!
  const start = root.querySelector<HTMLButtonElement>("[data-start]")!
  const finale = root.querySelector<HTMLElement>("[data-finale]")!
  const replay = root.querySelector<HTMLButtonElement>("[data-replay]")!

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  // Only the lid and cassette move, and only during the intro; re-render shadows on demand.
  renderer.shadowMap.autoUpdate = false

  const scene = new THREE.Scene()
  const bg = new THREE.Color("#0c0907")
  scene.background = bg
  scene.fog = new THREE.Fog(bg, 1.1, 3.2)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.32

  const camera = new THREE.PerspectiveCamera(30, 1, 0.02, 8)
  const eye = new THREE.Vector3(...shots.far.slice(0, 3) as [number, number, number])
  const look = new THREE.Vector3(...shots.far.slice(3) as [number, number, number])

  const key = new THREE.SpotLight("#ffd9b0", 3.2, 3, 0.55, 0.85, 1.4)
  key.position.set(-0.45, 0.95, 0.55)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.bias = -0.00005
  key.shadow.normalBias = 0.0015
  key.shadow.radius = 4
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 2
  scene.add(key, key.target)
  const rim = new THREE.DirectionalLight("#8fb3ff", 0.7)
  rim.position.set(0.6, 0.4, -0.8)
  scene.add(rim)

  const desk = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.MeshStandardMaterial({ color: "#17110d", roughness: 0.82 }))
  desk.rotation.x = -Math.PI / 2
  desk.receiveShadow = true
  scene.add(desk)

  // EffectComposer's default target has no MSAA, so edges crawl as the camera drifts.
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }))
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.4, 0.4, 0.96)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95

  const display = new DotMatrix()
  const nodes = new Map<string, THREE.Object3D>()
  const keyRest = new Map<Key, number>()
  const leds = new Map<string, THREE.MeshStandardMaterial>()
  let lid: THREE.Object3D | undefined
  let lidClosed = new THREE.Quaternion()
  let cassette: THREE.Object3D | undefined
  let cassetteRest = new THREE.Vector3()
  let reels: THREE.Object3D[] = []
  let selector: THREE.Object3D | undefined
  let selectorRest = 0
  let ready = false
  let visible = true
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(root)

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  loader.load("/od/machine.glb", ({ scene: model }) => {
    const wood = walnutMaps()
    model.traverse((o) => {
      // GLTFLoader sanitizes node names; the original glTF name survives in userData.
      nodes.set(o.userData.name ?? o.name, o)
      if (!(o instanceof THREE.Mesh)) return
      o.castShadow = true
      o.receiveShadow = true
      const m = o.material as THREE.MeshPhysicalMaterial
      if (m.transparent) {
        // Wear decals sit a hair above the surface and z-fight without an offset.
        m.depthWrite = false
        m.polygonOffset = true
        m.polygonOffsetFactor = -2
        m.polygonOffsetUnits = -2
        o.castShadow = false
      }
      switch (m.name) {
        case "Charcoal":
          m.color.set("#151413")
          m.roughness = 0.62
          break
        case "Red walnut":
          boxMapWood(m, wood)
          m.color.set("#ffffff")
          m.roughness = 0.62
          m.clearcoat = 0.45
          m.clearcoatRoughness = 0.22
          break
        case "Champagne":
          m.color.set("#c9b48d")
          m.metalness = 0.85
          m.roughness = 0.32
          break
        case "Aged olive ivory":
        case "Key PLAY rubbed surface":
        case "Key STOP rubbed surface":
          m.color.set(m.name === "Aged olive ivory" ? "#d9d0b6" : "#cbbf9f")
          m.roughness = 0.45
          break
        case "Uniform satin silver":
          m.color.set("#a9a9a4")
          m.metalness = 0.8
          m.roughness = 0.42
          break
        case "Steel hinge with oxidation":
          m.color.set("#8a8780")
          m.roughness = 0.4
          break
        case "Clear acrylic":
          // Transmission renders this lid opaque at this scale, hiding the tape and display.
          o.material = new THREE.MeshPhysicalMaterial({ name: m.name, color: "#2a1d14", roughness: 0.06, transparent: true, opacity: 0.38, depthWrite: false, clearcoat: 1 })
          break
        case "Black display bezel":
        case "Deep bronze display filter":
          m.roughness = 0.25
          break
      }
    })

    // The bottom shell's sides are coplanar with the cabinet and panel sides and flicker. Inset the mesh, not the node,
    // because the node also parents the rest of the machine.
    const shell = nodes.get("Black bottom shell")
    if (shell instanceof THREE.Mesh) shell.geometry = shell.geometry.clone().scale(0.997, 1, 0.996)

    for (const k of KEY_NAMES) {
      const n = nodes.get(`Key ${k}`)
      if (n) keyRest.set(k, n.position.y)
    }
    for (const name of ["RECORD indicator", "REW indicator", "PLAY indicator", "FF indicator", "PAUSE indicator", "POWER IND", "CALLS"]) {
      const n = nodes.get(name) as THREE.Mesh | undefined
      if (!n) continue
      const m = new THREE.MeshStandardMaterial({ color: "#2a0d0d", roughness: 0.3, emissive: name.startsWith("PLAY") ? "#57ff7a" : "#ff2a1a", emissiveIntensity: 0 })
      n.material = m
      leds.set(name, m)
    }

    for (const name of ["Amber display glyphs", "Amber dot matrix"]) {
      const n = nodes.get(name)
      if (n) n.visible = false
    }
    const filter = nodes.get("Recessed display filter")
    if (filter?.parent) {
      // Quantization bakes a scale into the filter node, so the screen sits beside it instead of inside.
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.078, 0.0245), new THREE.MeshBasicMaterial({ map: display.texture, toneMapped: false }))
      screen.material.color.setScalar(2.2)
      screen.quaternion.copy(filter.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2))
      screen.position.copy(filter.position).add(new THREE.Vector3(0, 0.0007, 0).applyQuaternion(filter.quaternion))
      filter.parent.add(screen)
    }

    lid = nodes.get("Lid hinge | X axis")
    if (lid) lidClosed = lid.quaternion.clone()
    cassette = nodes.get("Cassette | A side up, tape edge to front")
    if (cassette) {
      cassetteRest = cassette.position.clone()
      cassette.visible = false
    }
    const tooth = new THREE.BoxGeometry(0.0105, 0.0006, 0.0012)
    const toothMat = new THREE.MeshStandardMaterial({ color: "#1a1714", roughness: 0.5 })
    reels = ["Visible reel", "Visible reel.001"].flatMap((name) => {
      const reel = nodes.get(name)
      if (!reel?.parent) return []
      const hub = new THREE.Group()
      hub.position.copy(reel.position).y += 0.0016
      for (let i = 0; i < 3; i++) hub.add(new THREE.Mesh(tooth, toothMat).rotateY(i * Math.PI / 3))
      reel.parent.add(hub)
      return [hub]
    })
    selector = nodes.get("SELECTOR knob")
    selectorRest = selector?.rotation.y ?? 0
    scene.add(model)
    renderer.shadowMap.needsUpdate = true
    ready = true
    root.dataset.ready = ""
  })

  let ctx: AudioContext | undefined
  let analyser: AnalyserNode | undefined
  const levels = new Uint8Array(256)

  const click = (pitch = 1, gain = 0.5) => {
    if (!ctx) return
    const len = Math.floor(ctx.sampleRate * 0.05)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.08 / pitch))
    const src = ctx.createBufferSource()
    src.buffer = buf
    const f = ctx.createBiquadFilter()
    f.type = "bandpass"
    f.frequency.value = 1800 * pitch
    f.Q.value = 0.9
    const v = ctx.createGain()
    v.gain.value = gain
    src.connect(f).connect(v).connect(ctx.destination)
    src.start()
  }

  // The intro sequence runs on its own clock before the tape starts.
  let introAt = -1
  let lidOpen = 0
  let inserted = 0
  const pressed = new Map<Key, number>()
  const press = (k: Key) => {
    pressed.set(k, performance.now())
    click(k === "PLAY" ? 0.8 : 1.1, 0.6)
  }

  const begin = () => {
    if (introAt >= 0) return
    ctx = new AudioContext()
    const src = ctx.createMediaElementSource(audio)
    analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    src.connect(analyser).connect(ctx.destination)
    // Unlock playback inside the user gesture; real playback starts after the intro.
    audio.play().then(() => audio.pause()).catch(() => {})
    introAt = performance.now()
    root.dataset.state = "intro"
  }

  const messageIndex = (t: number) => tape.beeps.filter(b => b <= t).length
  // Track the target separately so repeated presses step through messages even before playback reaches the beep.
  let current = 0
  const seekMessage = (step: number) => {
    current = Math.max(0, Math.min(tape.announce.length - 1, current + step))
    audio.currentTime = Math.max(0, tape.announce[current] - 0.25)
    if (audio.paused) void audio.play()
  }
  audio.addEventListener("timeupdate", () => {
    if (audio.seeking) return
    current = Math.max(0, tape.announce.filter(a => a - 0.3 <= audio.currentTime).length - 1)
  })

  const onKey = (k: Key) => {
    if (!inserted) return begin()
    press(k)
    if (k === "PLAY") void audio.play()
    else if (k === "PAUSE") {
      if (audio.paused) void audio.play()
      else audio.pause()
    }
    else if (k === "STOP") audio.pause()
    else if (k === "FF") seekMessage(1)
    else if (k === "REW") seekMessage(audio.currentTime - tape.announce[current] > 3 ? 0 : -1)
  }

  start.addEventListener("click", begin)
  const kiosk = "kiosk" in root.dataset
  if (kiosk) {
    root.style.cursor = "none"
    addEventListener("pointerdown", () => {
      void document.documentElement.requestFullscreen?.().catch(() => {})
      begin()
    }, { once: true })
  }
  replay.addEventListener("click", () => {
    current = 0
    audio.currentTime = 0
    void audio.play()
    root.dataset.state = "playing"
  })
  addEventListener("keydown", (e) => {
    const map: Record<string, Key> = { " ": "PAUSE", "ArrowRight": "FF", "ArrowLeft": "REW", "Enter": "PLAY" }
    const k = map[e.key]
    if (!k || !visible || !ready || document.querySelector("dialog[open]") || (e.target as HTMLElement).closest("button, a")) return
    e.preventDefault()
    onKey(k)
  })

  const ray = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const hitKey = (e: PointerEvent): Key | undefined => {
    const r = canvas.getBoundingClientRect()
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(pointer, camera)
    const targets = KEY_NAMES.map(k => nodes.get(`Key ${k}`)).filter(Boolean) as THREE.Object3D[]
    return ray.intersectObjects(targets, false)[0]?.object.userData.name?.slice(4) as Key | undefined
  }
  canvas.addEventListener("pointermove", (e) => {
    canvas.style.cursor = ready && hitKey(e) ? "pointer" : ""
  })
  canvas.addEventListener("pointerdown", (e) => {
    if (!ready) return
    const k = hitKey(e)
    if (k) onKey(k)
  })

  const track = audio.textTracks[0]
  track.mode = "hidden"
  track.addEventListener("cuechange", () => {
    const cue = track.activeCues?.[0] as VTTCue | undefined
    caption.textContent = cue?.text ?? ""
    caption.toggleAttribute("data-on", !!cue)
  })
  audio.addEventListener("ended", () => {
    root.dataset.state = "ended"
    finale.hidden = false
    if (kiosk) setTimeout(() => replay.click(), 20_000)
  })
  audio.addEventListener("play", () => {
    root.dataset.state = "playing"
    finale.hidden = true
  })

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = root
    // A retina big screen at full density drops to ~19 fps, and the uneven pacing reads as flicker.
    const ratio = Math.min(devicePixelRatio, 2, Math.sqrt(4_000_000 / (w * h)))
    renderer.setPixelRatio(ratio)
    composer.setPixelRatio(ratio)
    renderer.setSize(w, h, false)
    composer.setSize(w, h)
    bloom.resolution.set(w / 2, h / 2)
    renderer.shadowMap.needsUpdate = true
    camera.aspect = w / h
    camera.fov = w / h < 1 ? 46 : 30
    camera.updateProjectionMatrix()
  }
  new ResizeObserver(resize).observe(root)
  resize()

  const shotEye = new THREE.Vector3()
  const shotLook = new THREE.Vector3()
  let reelAngle = 0
  let last = performance.now()

  const frame = (now: number) => {
    requestAnimationFrame(frame)
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    if (!visible || !ready) return

    const t = audio.currentTime
    const playing = !audio.paused && !audio.ended
    let shot: Shot = shots.wide
    let text = "-- --"
    let blink = false

    if (introAt < 0) {
      shot = shots.far
      const s = now / 1000
      shot = [shots.far[0] + Math.sin(s * 0.2) * 0.1, shots.far[1], shots.far[2], 0, 0.03, 0]
      text = "NO TAPE"
    }
    else if (!inserted) {
      const s = (now - introAt) / 1000
      shot = s < 1 ? shots.wide : s < 4.2 ? shots.well : shots.keys
      lidOpen = smooth(s / 1.1) * (1 - smooth((s - 3.2) / 0.7))
      const drop = smooth((s - 1.1) / 1.6)
      if (cassette) {
        cassette.visible = s > 1
        cassette.position.set(cassetteRest.x, cassetteRest.y + (1 - drop) * 0.16, cassetteRest.z + (1 - drop) * 0.05)
        cassette.rotation.x = (1 - drop) * -0.7
      }
      if (s > 2.7 && s - dt <= 2.7) click(0.6, 0.5)
      if (s > 3.9 && s - dt <= 3.9) click(0.5, 0.8)
      if (s > 4.6 && s - dt <= 4.6) press("PLAY")
      text = s < 2.7 ? "INSERT" : "09 MSG"
      if (s > 5) {
        inserted = 1
        audio.currentTime = 0
        void audio.play()
      }
    }
    else {
      const n = messageIndex(t)
      shot = messageShots[Math.min(n, 9)]
      if (n === 9 && t > 300) shot = t > tape.playbackEnd ? shots.wide : [-0.04, 0.16, 0.12, -0.052, 0.04, 0]
      if (t >= tape.recordBeep) {
        text = "REC"
        blink = Math.floor(now / 500) % 2 === 0
      }
      else if (t >= tape.greeting) text = "OGM"
      else if (t >= tape.playbackEnd) text = "END"
      else if (n === 0) text = "09 MSG"
      else text = `${n}/9 ${clock(t - tape.beeps[n - 1])}`
      if (!playing && !audio.ended) {
        text = t > 0.5 ? "PAUSE" : text
        blink = Math.floor(now / 600) % 2 === 0
      }
    }

    if (lid) lid.quaternion.slerpQuaternions(lidClosed, LID_OPEN, lidOpen)
    if (introAt >= 0 && !inserted) renderer.shadowMap.needsUpdate = true
    if (selector) selector.rotation.y += ((inserted ? selectorRest - 1.2 : selectorRest) - selector.rotation.y) * Math.min(1, dt * 6)

    // A real reel speeds up as its pack of tape gets thinner.
    const p = Math.min(1, t / (audio.duration || 411))
    const speed = playing ? 9 : 0
    reelAngle += speed * dt
    const supply = Math.sqrt(1 - p * 0.8) + 0.25
    const take = Math.sqrt(0.2 + p * 0.8) + 0.25
    if (reels[0]) reels[0].rotation.y = -reelAngle / supply
    if (reels[1]) reels[1].rotation.y = -reelAngle / take

    for (const [k, at] of pressed) {
      const n = nodes.get(`Key ${k}`)
      const age = (now - at) / 1000
      const depth = age < 0.08 ? age / 0.08 : Math.max(0, 1 - (age - 0.18) / 0.12)
      if (n) n.position.y = keyRest.get(k)! - depth * 0.0025
      if (age > 0.4) pressed.delete(k)
    }

    let level = 0
    if (analyser && playing) {
      analyser.getByteTimeDomainData(levels)
      let sum = 0
      for (const v of levels) sum += (v - 128) ** 2
      level = Math.min(1, Math.sqrt(sum / levels.length) / 40)
    }
    display.draw(text, level, blink)

    const glow = (name: string, v: number) => {
      const m = leds.get(name)
      if (m) m.emissiveIntensity += (v - m.emissiveIntensity) * Math.min(1, dt * 14)
    }
    const waiting = !inserted || messageIndex(t) === 0
    glow("POWER IND", 3)
    glow("CALLS", waiting && Math.floor(now / 700) % 2 === 0 ? 4 : 0)
    glow("PLAY indicator", playing && t < tape.greeting ? 4 : 0)
    glow("PAUSE indicator", inserted && !playing && !audio.ended ? 4 : 0)
    glow("RECORD indicator", t >= tape.recordBeep && !audio.ended ? 5 : 0)
    glow("FF indicator", pressed.has("FF") ? 4 : 0)
    glow("REW indicator", pressed.has("REW") ? 4 : 0)

    const drift = now / 1000
    shotEye.set(shot[0] + Math.sin(drift * 0.31) * 0.006, shot[1] + Math.sin(drift * 0.23) * 0.004, shot[2] + Math.cos(drift * 0.27) * 0.006)
    shotLook.set(shot[3], shot[4], shot[5])
    if (camera.aspect < 1) shotEye.sub(shotLook).multiplyScalar(1.7).add(shotLook)
    const ease = 1 - Math.exp(-dt * (introAt < 0 ? 0.6 : 1.1))
    eye.lerp(shotEye, ease)
    look.lerp(shotLook, ease)
    camera.position.copy(eye)
    camera.lookAt(look)
    key.target.position.set(0, 0.03, 0)
    composer.render(dt)
  }
  requestAnimationFrame(frame)
}
