import { useEffect, useRef, useState } from 'react'
import { Box, CircularProgress } from '@mui/material'
import * as THREE from 'three'
import { STLLoader, ThreeMFLoader } from 'three/examples/jsm/Addons.js'

interface Model3DViewerProps {
  modelBlob?: Blob
  loading?: boolean
  error?: string
}

export default function Model3DViewer({
  modelBlob,
  loading = false,
  error = '',
}: Model3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationRef = useRef<number | null>(null)

  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!containerRef.current || !modelBlob || loading) {
      return
    }

    setLocalError('')

    const container = containerRef.current

    // Limpiar canvas anterior
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    let scene: THREE.Scene
    let camera: THREE.PerspectiveCamera
    let renderer: THREE.WebGLRenderer
    let model: THREE.Object3D | null = null

    const mouse = {
      down: false,
      x: 0,
      y: 0,
    }

    let autoRotate = 0

    try {
      // Scene
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x1a1a1a)

      // Camera
      const width = container.clientWidth
      const height = container.clientHeight

      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000)
      camera.position.z = 150

      // Renderer
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      })

      renderer.setSize(width, height)
      renderer.setPixelRatio(window.devicePixelRatio)

      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
      directionalLight.position.set(50, 50, 50)
      scene.add(directionalLight)

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight2.position.set(-50, -50, -50)
      scene.add(directionalLight2)

      // Load model (STL o 3MF)
      const loadModel = async () => {
        try {
          const arrayBuffer = await modelBlob.arrayBuffer()

          const mimeType = modelBlob.type.toLowerCase()

          if (
            mimeType.includes('3mf') ||
            mimeType.includes('3dmanufacturing') ||
            mimeType.includes('zip')
          ) {
            // 3MF
            const loader = new ThreeMFLoader()
            model = loader.parse(arrayBuffer)
          } else {
            // STL
            const loader = new STLLoader()
            const geometry = loader.parse(arrayBuffer)

            geometry.computeVertexNormals()
            geometry.center()

            const material = new THREE.MeshPhongMaterial({
              color: 0xd7a449,
              shininess: 100,
              specular: 0x222222,
            })

            model = new THREE.Mesh(geometry, material)
          }

          if (!model) {
            throw new Error('No se pudo interpretar el modelo')
          }

          // Centrar objeto
          const box = new THREE.Box3().setFromObject(model)
          const center = box.getCenter(new THREE.Vector3())
          const size = box.getSize(new THREE.Vector3())

          model.position.sub(center)

          const maxDim = Math.max(size.x, size.y, size.z)

          // Ajustar cámara automáticamente
          camera.position.z = maxDim * 2.2 || 150
          camera.lookAt(0, 0, 0)

          scene.add(model)
        } catch (err) {
          console.error(err)
          setLocalError('No se pudo cargar este modelo 3D')
        }
      }

      void loadModel()

      // Mouse controls
      const onMouseDown = (e: MouseEvent) => {
        mouse.down = true
        mouse.x = e.clientX
        mouse.y = e.clientY
      }

      const onMouseMove = (e: MouseEvent) => {
        if (!mouse.down || !model) return

        const deltaX = e.clientX - mouse.x
        const deltaY = e.clientY - mouse.y

        model.rotation.y += deltaX * 0.01
        model.rotation.x += deltaY * 0.01

        mouse.x = e.clientX
        mouse.y = e.clientY
      }

      const onMouseUp = () => {
        mouse.down = false
      }

      renderer.domElement.addEventListener('mousedown', onMouseDown)
      renderer.domElement.addEventListener('mousemove', onMouseMove)
      renderer.domElement.addEventListener('mouseup', onMouseUp)
      renderer.domElement.addEventListener('mouseleave', onMouseUp)

      // Resize
      const handleResize = () => {
        if (!containerRef.current || !rendererRef.current) return

        const newWidth = containerRef.current.clientWidth
        const newHeight = containerRef.current.clientHeight

        camera.aspect = newWidth / newHeight
        camera.updateProjectionMatrix()

        renderer.setSize(newWidth, newHeight)
      }

      window.addEventListener('resize', handleResize)

      // Animation
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate)

        if (model && !mouse.down) {
          autoRotate += 0.003
          model.rotation.y = autoRotate
        }

        renderer.render(scene, camera)
      }

      animate()

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)

        renderer.domElement.removeEventListener('mousedown', onMouseDown)
        renderer.domElement.removeEventListener('mousemove', onMouseMove)
        renderer.domElement.removeEventListener('mouseup', onMouseUp)
        renderer.domElement.removeEventListener('mouseleave', onMouseUp)

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }

        renderer.dispose()

        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
      }
    } catch (err) {
      console.error(err)
      setLocalError('Error al inicializar el visor 3D')
    }
  }, [modelBlob, loading])

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '400px',
        position: 'relative',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <CircularProgress sx={{ color: '#d7a449' }} />
        </Box>
      )}

      {(error || localError) && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ff6b6b',
            textAlign: 'center',
            fontSize: '0.95rem',
            px: 2,
          }}
        >
          {error || localError}
        </Box>
      )}
    </Box>
  )
}