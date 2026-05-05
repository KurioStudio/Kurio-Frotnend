import { useEffect, useRef, useState } from 'react'
import { Box, CircularProgress, IconButton, Typography } from '@mui/material'
import { IoAdd, IoRemove } from 'react-icons/io5'
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
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)

  const [localError, setLocalError] = useState('')
  const [modelLoaded, setModelLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || !modelBlob || loading) {
      return
    }

    setLocalError('')
    setModelLoaded(false)

    const container = containerRef.current

    // Limpiar canvas anterior de forma segura - remover solo el canvas renderer
    try {
      const existingCanvas = container.querySelector('canvas')
      if (existingCanvas && existingCanvas.parentElement === container) {
        container.removeChild(existingCanvas)
      }
    } catch (e) {
      console.warn('Error al limpiar canvas anterior:', e)
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

    try {
      // Scene
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x1a1a1a)

      // Camera
      const width = container.clientWidth
      const height = container.clientHeight

      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 5000)
      camera.position.z = 150
      cameraRef.current = camera

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
          setModelLoaded(true)
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

      // Animation - SIN ROTACIÓN AUTOMÁTICA
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }

      animate()

      // Cleanup
      return () => {
        try {
          window.removeEventListener('resize', handleResize)

          if (renderer && renderer.domElement) {
            renderer.domElement.removeEventListener('mousedown', onMouseDown)
            renderer.domElement.removeEventListener('mousemove', onMouseMove)
            renderer.domElement.removeEventListener('mouseup', onMouseUp)
            renderer.domElement.removeEventListener('mouseleave', onMouseUp)
          }

          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
          }

          if (renderer) {
            renderer.dispose()
          }

          // Remover canvas específico de forma segura
          if (containerRef.current && renderer && renderer.domElement) {
            try {
              if (renderer.domElement.parentElement === containerRef.current) {
                containerRef.current.removeChild(renderer.domElement)
              }
            } catch (e) {
              console.warn('Error al remover canvas:', e)
            }
          }
        } catch (err) {
          console.warn('Error en cleanup:', err)
        }
      }
    } catch (err) {
      console.error(err)
      setLocalError('Error al inicializar el visor 3D')
    }
  }, [modelBlob, loading])

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return

    const zoomSpeed = 20
    if (direction === 'in') {
      cameraRef.current.position.z -= zoomSpeed
    } else {
      cameraRef.current.position.z += zoomSpeed
    }
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {(loading || !modelLoaded) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(2px)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <CircularProgress sx={{ color: '#d7a449', width: '80px !important', height: '80px !important' }} />
          <Typography sx={{ color: '#d7a449', fontSize: '1rem', fontWeight: 600 }}>
            Cargando modelo 3D...
          </Typography>
        </Box>
      )}

      {/* Zoom Controls */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 5,
        }}
      >
        <IconButton
          onClick={() => handleZoom('in')}
          sx={{
            backgroundColor: 'rgba(215, 164, 73, 0.9)',
            color: '#fff',
            width: 40,
            height: 40,
            '&:hover': {
              backgroundColor: 'rgba(215, 164, 73, 1)',
            },
          }}
        >
          <IoAdd />
        </IconButton>
        <IconButton
          onClick={() => handleZoom('out')}
          sx={{
            backgroundColor: 'rgba(215, 164, 73, 0.9)',
            color: '#fff',
            width: 40,
            height: 40,
            '&:hover': {
              backgroundColor: 'rgba(215, 164, 73, 1)',
            },
          }}
        >
          <IoRemove />
        </IconButton>
      </Box>

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
            zIndex: 10,
          }}
        >
          {error || localError}
        </Box>
      )}
    </Box>
  )
}