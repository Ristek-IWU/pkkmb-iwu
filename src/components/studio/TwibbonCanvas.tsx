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

  // ── helpers ──────────────────────────────────────────────────────────────

  /**
   * Enforce z-order: photo always below frame.
   * Safe to call any time; no-ops when refs are null.
   */
  const enforceLayerOrder = useCallback((canvas: any) => {
    if (photoRef.current) {
      canvas.sendObjectToBack(photoRef.current);
    }
    if (frameRef.current) {
      canvas.bringObjectToFront(frameRef.current);
    }
    canvas.renderAll();
  }, []);

  // ── canvas init ───────────────────────────────────────────────────────────

  const initCanvas = useCallback(async () => {
    if (!canvasRef.current) return;

    const fabric = await import("fabric");

    if (fabricRef.current) {
      fabricRef.current.dispose();
      photoRef.current = null;
      frameRef.current = null;
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
          // Enforce layer order before export so the PNG is always correct
          enforceLayerOrder(canvas);

          const multiplier = width / 350;

          canvas.setWidth(width);
          canvas.setHeight(height);

          canvas.getObjects().forEach((obj: any) => {
            obj.scaleX = obj.scaleX * multiplier;
            obj.scaleY = obj.scaleY * multiplier;
            obj.left = obj.left * multiplier;
            obj.top = obj.top * multiplier;
            obj.setCoords();
          });

          const dataUrl = canvas.toDataURL({
            format: "png",
            quality: 1,
            multiplier: 1,
          });

          // Restore preview size
          canvas.setWidth(350);
          canvas.setHeight(350);

          canvas.getObjects().forEach((obj: any) => {
            obj.scaleX = obj.scaleX / multiplier;
            obj.scaleY = obj.scaleY / multiplier;
            obj.left = obj.left / multiplier;
            obj.top = obj.top / multiplier;
            obj.setCoords();
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
            photoRef.current.setCoords();
            enforceLayerOrder(canvas);
          }
        },
      });
    }

    return canvas;
  }, [onCanvasReady, enforceLayerOrder]);

  useEffect(() => {
    initCanvas();
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
        photoRef.current = null;
        frameRef.current = null;
      }
    };
  }, [initCanvas]);

  // ── load frame ────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadFrame = async () => {
      if (!fabricRef.current) return;

      // Remove existing frame first
      if (frameRef.current) {
        fabricRef.current.remove(frameRef.current);
        frameRef.current = null;
      }

      // No frame selected — re-enforce order in case photo is still present
      if (!selectedFrame) {
        if (photoRef.current) fabricRef.current.renderAll();
        return;
      }

      const fabric = await import("fabric");

      const isSvg = selectedFrame.image.toLowerCase().endsWith(".svg");

      if (isSvg) {
        const result = await fabric.loadSVGFromURL(selectedFrame.image);
        const objects = result.objects.filter(
          (obj): obj is NonNullable<typeof obj> => obj !== null
        );

        if (objects.length === 0) return;

        const group = fabric.util.groupSVGElements(objects, result.options);

        // Use viewBox / explicit dimensions, fallback to 1080
        const svgW =
          result.options?.width && result.options.width > 0
            ? result.options.width
            : 1080;
        const svgH =
          result.options?.height && result.options.height > 0
            ? result.options.height
            : 1080;

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
        group.setCoords();

        fabricRef.current.add(group);
        frameRef.current = group;
      } else {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.crossOrigin = "anonymous";
          i.onload = () => resolve(i);
          i.onerror = reject;
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
        fabricImage.setCoords();

        fabricRef.current.add(fabricImage);
        frameRef.current = fabricImage;
      }

      // Always enforce: photo behind, frame in front
      enforceLayerOrder(fabricRef.current);
    };

    loadFrame().catch(console.error);
  }, [selectedFrame, enforceLayerOrder]);

  // ── load photo ────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadPhoto = async () => {
      if (!fabricRef.current) return;

      // Remove existing photo
      if (photoRef.current) {
        fabricRef.current.remove(photoRef.current);
        photoRef.current = null;
      }

      if (!photo) return;

      const fabric = await import("fabric");

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = e.target?.result as string;
        };
        reader.onerror = reject;
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
      fabricImage.setCoords();

      baseScaleRef.current = scale;
      baseLeftRef.current = left;
      baseTopRef.current = top;

      fabricRef.current.add(fabricImage);
      photoRef.current = fabricImage;

      // Critical: photo goes to back, frame comes to front
      enforceLayerOrder(fabricRef.current);

      fabricRef.current.setActiveObject(fabricImage);
    };

    loadPhoto().catch(console.error);
  }, [photo, enforceLayerOrder]);

  // ── zoom ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!photoRef.current || !fabricRef.current) return;
    const newScale = baseScaleRef.current * zoom;
    photoRef.current.set({ scaleX: newScale, scaleY: newScale });
    photoRef.current.setCoords();
    // Re-enforce after every transform — keeps frame pinned to front
    enforceLayerOrder(fabricRef.current);
  }, [zoom, enforceLayerOrder]);

  // ── rotation ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!photoRef.current || !fabricRef.current) return;
    photoRef.current.set({ angle: rotation });
    photoRef.current.setCoords();
    // Re-enforce after every transform
    enforceLayerOrder(fabricRef.current);
  }, [rotation, enforceLayerOrder]);

  // ── render ────────────────────────────────────────────────────────────────

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
