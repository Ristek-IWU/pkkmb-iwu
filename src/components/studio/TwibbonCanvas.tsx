"use client";

import { useEffect, useRef, useCallback } from "react";
import { Frame } from "@/types";

interface TwibbonCanvasProps {
  selectedFrame: Frame | null;
  photo: File | null;
  zoom: number;
  rotation: number;
  onCanvasReady?: (canvas: any) => void;
}

export function TwibbonCanvas({
  selectedFrame,
  photo,
  zoom,
  rotation,
  onCanvasReady,
}: TwibbonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const photoRef = useRef<any>(null);
  const frameRef = useRef<any>(null);
  const baseScaleRef = useRef(1);
  const baseLeftRef = useRef(0);
  const baseTopRef = useRef(0);

  const initCanvas = useCallback(async () => {
    if (!canvasRef.current) return;

    const fabricModule = await import("fabric");
    const fabric = fabricModule;

    if (fabricRef.current) {
      fabricRef.current.dispose();
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 350,
      height: 350,
      selection: false,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    if (onCanvasReady) {
      onCanvasReady({
        exportCanvas: (width: number, height: number) => {
          const multiplier = width / 350;

          canvas.setWidth(width);
          canvas.setHeight(height);

          canvas.getObjects().forEach((obj: any) => {
            obj.scaleX = obj.scaleX * multiplier;
            obj.scaleY = obj.scaleY * multiplier;
            obj.left = obj.left * multiplier;
            obj.top = obj.top * multiplier;
          });

          const dataUrl = canvas.toDataURL({
            format: "png",
            quality: 1,
            multiplier: 1,
          });

          canvas.setWidth(350);
          canvas.setHeight(350);

          canvas.getObjects().forEach((obj: any) => {
            obj.scaleX = obj.scaleX / multiplier;
            obj.scaleY = obj.scaleY / multiplier;
            obj.left = obj.left / multiplier;
            obj.top = obj.top / multiplier;
          });

          canvas.renderAll();
          return dataUrl;
        },
        resetPosition: () => {
          if (photoRef.current) {
            photoRef.current.set({
              left: baseLeftRef.current,
              top: baseTopRef.current,
              scaleX: baseScaleRef.current,
              scaleY: baseScaleRef.current,
              angle: 0,
            });
            canvas.renderAll();
          }
        },
      });
    }

    return canvas;
  }, [onCanvasReady]);

  useEffect(() => {
    initCanvas();
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
      }
    };
  }, [initCanvas]);

  // Load frame
  useEffect(() => {
    const loadFrame = async () => {
      if (!fabricRef.current || !selectedFrame) return;

      const fabricModule = await import("fabric");
      const fabric = fabricModule;

      if (frameRef.current) {
        fabricRef.current.remove(frameRef.current);
        frameRef.current = null;
      }

      const isSvg = selectedFrame.image.endsWith(".svg");

      if (isSvg) {
        const result = await fabric.loadSVGFromURL(selectedFrame.image);
        const objects = result.objects.filter((obj): obj is NonNullable<typeof obj> => obj !== null);
        const group = fabric.util.groupSVGElements(objects, result.options);
        const svgW = result.options.width || 1080;
        const svgH = result.options.height || 1080;
        const scale = 350 / Math.max(svgW, svgH);

        group.scale(scale);
        group.set({
          left: (350 - svgW * scale) / 2,
          top: (350 - svgH * scale) / 2,
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
        });

        fabricRef.current.add(group);
        frameRef.current = group;
      } else {
        const img = await new Promise<HTMLImageElement>((resolve) => {
          const i = new Image();
          i.crossOrigin = "anonymous";
          i.onload = () => resolve(i);
          i.src = selectedFrame.image;
        });

        const fabricImage = new fabric.FabricImage(img, {
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
        });

        const scale = 350 / Math.max(img.width, img.height);
        fabricImage.scale(scale);
        fabricImage.set({
          left: (350 - img.width * scale) / 2,
          top: (350 - img.height * scale) / 2,
        });

        fabricRef.current.add(fabricImage);
        frameRef.current = fabricImage;
      }

      // Reorder: photo at back, frame at front
      if (photoRef.current) {
        fabricRef.current.sendObjectToBack(photoRef.current);
      }
      fabricRef.current.renderAll();
    };

    loadFrame();
  }, [selectedFrame]);

  // Load photo
  useEffect(() => {
    const loadPhoto = async () => {
      if (!fabricRef.current || !photo) return;

      const fabricModule = await import("fabric");
      const fabric = fabricModule;

      if (photoRef.current) {
        fabricRef.current.remove(photoRef.current);
        photoRef.current = null;
      }

      const img = await new Promise<HTMLImageElement>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.src = e.target?.result as string;
        };
        reader.readAsDataURL(photo);
      });

      const fabricImage = new fabric.FabricImage(img, {
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
      });

      const canvasSize = 350;
      const scale = canvasSize / Math.min(img.width, img.height);

      const left = (canvasSize - img.width * scale) / 2;
      const top = (canvasSize - img.height * scale) / 2;

      fabricImage.scale(scale);
      fabricImage.set({ left, top });

      baseScaleRef.current = scale;
      baseLeftRef.current = left;
      baseTopRef.current = top;

      fabricRef.current.add(fabricImage);
      photoRef.current = fabricImage;

      // Photo always at back, frame always at front
      fabricRef.current.sendObjectToBack(fabricImage);
      if (frameRef.current) {
        fabricRef.current.bringObjectForward(frameRef.current);
      }

      fabricRef.current.setActiveObject(fabricImage);
      fabricRef.current.renderAll();
    };

    loadPhoto();
  }, [photo]);

  // Zoom
  useEffect(() => {
    if (photoRef.current && fabricRef.current) {
      const newScale = baseScaleRef.current * zoom;
      photoRef.current.set({ scaleX: newScale, scaleY: newScale });
      fabricRef.current.renderAll();
    }
  }, [zoom]);

  // Rotation
  useEffect(() => {
    if (photoRef.current && fabricRef.current) {
      photoRef.current.set({ angle: rotation });
      fabricRef.current.renderAll();
    }
  }, [rotation]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: "8px",
        padding: "16px",
      }}
    >
      <canvas ref={canvasRef} className="max-w-full" />
    </div>
  );
}
