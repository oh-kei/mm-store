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
}

const ProductBaseImage = ({ url, stageSize }: { url: string; stageSize: number }) => {
  const [image] = useImage(url)
  if (!image) return null
  
  // Calculate scaling to fit the image in the stage while maintaining aspect ratio
  const scale = Math.min(stageSize / image.width, stageSize / image.height)
  const x = (stageSize - image.width * scale) / 2
  const y = (stageSize - image.height * scale) / 2

  return (
    <Image 
      image={image} 
      width={image.width * scale} 
      height={image.height * scale} 
      x={x}
      y={y}
      listening={false} 
    />
  )
}

const ImageLayer = ({ data, isSelected, onSelect, onChange }: { data: CustomLayer; isSelected: boolean; onSelect: () => void; onChange: (props: any) => void }) => {
  const [image] = useImage(data.props.url || "")
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

export const CustomizerStage = ({ recipe, selectedId, setSelectedId, onUpdateLayer }: StageComponentProps) => {
  const stageRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 800, scale: 1 })

  // Logical canvas size is 1000x1000
  const VIRTUAL_SIZE = 1000

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
          <ProductBaseImage url={recipe.base.imageUrl} stageSize={VIRTUAL_SIZE} />
          
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
}

export default CustomizerStage
