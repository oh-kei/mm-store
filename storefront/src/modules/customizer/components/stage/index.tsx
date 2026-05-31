"use client"

import React, { useRef, useEffect, useState } from "react"
import { Stage, Layer, Image, Text, Transformer } from "react-konva"
import useImage from "use-image"
import { CustomLayer, LayerProps } from "../../hooks/use-customizer"

interface StageComponentProps {
  recipe: any
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  onUpdateLayer: (id: string, props: Partial<LayerProps>) => void
  activeView?: string
}

// Moved logic into main component to avoid React 19 internal errors with nested Konva components

const ImageLayer = ({ data, isSelected, onSelect, onChange }: { data: CustomLayer; isSelected: boolean; onSelect: () => void; onChange: (props: any) => void }) => {
  const url = data.props.url
  const isAi = url?.toLowerCase().split('?')[0].endsWith('.ai')

  const aiPlaceholderSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
  <rect x="5" y="5" width="290" height="190" rx="16" fill="#F8FAFC" stroke="#FF9F00" stroke-width="2" stroke-dasharray="6 4"/>
  <g transform="translate(110, 40)">
    <rect width="80" height="60" rx="12" fill="#FF9F00"/>
    <text x="40" y="40" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle" dominant-baseline="middle">Ai</text>
  </g>
  <text x="150" y="130" fill="#334155" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" text-anchor="middle">Illustrator Vector File</text>
  <text x="150" y="150" fill="#64748B" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" text-anchor="middle">Positioned for Production</text>
  <text x="150" y="170" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-style="italic" text-anchor="middle">Drag &amp; scale as needed</text>
</svg>
  `)}`

  const imageUrl = isAi ? aiPlaceholderSvg : (url ? `/api/proxy-image?url=${encodeURIComponent(url)}` : "")
  const [image] = useImage(imageUrl || "", "anonymous")
  const shapeRef = useRef<any>(null)

  return (
    <Image
      id={data.id}
      image={image}
      ref={shapeRef}
      {...data.props}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        })
      }}
      onTransformEnd={(e) => {
        const node = shapeRef.current
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        
        // Reset scale so we can store the calculated scale in state
        node.scaleX(1)
        node.scaleY(1)
        
        onChange({
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: scaleX,
          scaleY: scaleY,
        })
      }}
    />
  )
}

const TextLayer = ({ data, isSelected, onSelect, onChange }: { data: CustomLayer; isSelected: boolean; onSelect: () => void; onChange: (props: any) => void }) => {
  const shapeRef = useRef<any>(null)

  return (
    <Text
      id={data.id}
      {...data.props}
      ref={shapeRef}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        })
      }}
      onTransformEnd={(e) => {
        const node = shapeRef.current
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        
        node.scaleX(1)
        node.scaleY(1)
        
        onChange({
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: scaleX,
          scaleY: scaleY,
        })
      }}
    />
  )
}

export const CustomizerStage = React.forwardRef<any, StageComponentProps>(({ recipe, selectedId, setSelectedId, onUpdateLayer, activeView }, ref) => {
  const stageRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 800, scale: 1 })
  
  // Logical canvas size is 1000x1000
  const VIRTUAL_SIZE = 1000

  // Load base image here instead of in a separate component to avoid React 19 internal errors
  const baseUrl = recipe.base.imageUrl
  const proxyBaseUrl = baseUrl ? `/api/proxy-image?url=${encodeURIComponent(baseUrl)}` : ""
  const [baseImage, baseImageStatus] = useImage(proxyBaseUrl, "anonymous")
  
  const baseImageData = React.useMemo(() => {
    if (!baseImage) return null
    const scale = Math.min(VIRTUAL_SIZE / baseImage.width, VIRTUAL_SIZE / baseImage.height)
    const x = (VIRTUAL_SIZE - baseImage.width * scale) / 2
    const y = (VIRTUAL_SIZE - baseImage.height * scale) / 2
    return { width: baseImage.width * scale, height: baseImage.height * scale, x, y }
  }, [baseImage])

  const [hideBaseImage, setHideBaseImage] = useState(false)

  React.useImperativeHandle(ref, () => ({
    isLoaded: (expectedView: string) => activeView === expectedView && (!proxyBaseUrl || baseImageStatus === "loaded"),
    getScreenshot: async (options?: { mimeType?: string; hideBase?: boolean }) => {
      if (!stageRef.current) return null
      
      // Deselect everything for a clean screenshot
      setSelectedId(null)
      
      const hideBase = options?.hideBase ?? false
      const mimeType = options?.mimeType ?? "image/jpeg"
      
      if (hideBase) {
        setHideBaseImage(true)
        // Wait for state update and re-render
        await new Promise(resolve => setTimeout(resolve, 80))
      }
      
      const dataUrl = stageRef.current.toDataURL({
        pixelRatio: 2, // High res
        mimeType: mimeType,
        quality: 0.8
      })
      
      if (hideBase) {
        setHideBaseImage(false)
        await new Promise(resolve => setTimeout(resolve, 80))
      }
      
      return dataUrl
    }
  }))

  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        const height = containerRef.current.offsetHeight
        const size = Math.min(width, height)
        setDimensions({
          width: size,
          height: size,
          scale: size / VIRTUAL_SIZE
        })
      }
    }

    checkSize()
    window.addEventListener("resize", checkSize)
    return () => window.removeEventListener("resize", checkSize)
  }, [])
  
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const stage = transformerRef.current.getStage()
      const selectedNode = stage.findOne("#" + selectedId)
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode])
        transformerRef.current.getLayer().batchDraw()
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
    }
  }, [selectedId, recipe.layers]) // Re-run if layers change (e.g. content update)

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <Stage 
        width={dimensions.width} 
        height={dimensions.height} 
        scaleX={dimensions.scale}
        scaleY={dimensions.scale}
        ref={stageRef}
        onMouseDown={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage()
          if (clickedOnEmpty) setSelectedId(null)
        }}
        onTouchStart={(e) => {
          const clickedOnEmpty = e.target === e.target.getStage()
          if (clickedOnEmpty) setSelectedId(null)
        }}
      >
        <Layer>
          {/* Base Product */}
          {!hideBaseImage && baseImage && baseImageData && (
            <Image 
              image={baseImage} 
              width={baseImageData.width} 
              height={baseImageData.height} 
              x={activeView === "right" ? baseImageData.x + baseImageData.width : baseImageData.x}
              y={baseImageData.y}
              scaleX={activeView === "right" ? -1 : 1}
              listening={false} 
            />
          )}
          
          {/* Design Layers */}
          {recipe.layers.map((layer: CustomLayer) => {
            const commonProps = {
              data: layer,
              isSelected: layer.id === selectedId,
              onSelect: () => setSelectedId(layer.id),
              onChange: (newProps: any) => onUpdateLayer(layer.id, newProps),
            }

            if (layer.type === "image") return <ImageLayer key={layer.id} {...commonProps} />
            if (layer.type === "text") return <TextLayer key={layer.id} {...commonProps} />
            return null
          })}

          {/* Transformation Tool */}
          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            enabledAnchors={[
              "top-left", "top-center", "top-right", "middle-right",
              "middle-left", "bottom-left", "bottom-center", "bottom-right"
            ]}
            rotationSnaps={[0, 90, 180, 270]}
            rotationSnapTolerance={5}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox
              return newBox
            }}
            anchorCornerRadius={3}
            anchorSize={8}
            anchorStroke="#D4AF37"
            anchorFill="#FFF"
            borderStroke="#D4AF37"
          />
        </Layer>
      </Stage>
    </div>
  )
})

export default CustomizerStage
