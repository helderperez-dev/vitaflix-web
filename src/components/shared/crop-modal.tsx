"use client"

import * as React from "react"
import Cropper, { type Area } from "react-easy-crop"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface CropModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    image: string | null
    onCropComplete: (file: File) => void
}

export function CropModal({ open, onOpenChange, image, onCropComplete }: CropModalProps) {
    const [crop, setCrop] = React.useState({ x: 0, y: 0 })
    const [zoom, setZoom] = React.useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteLocal = (croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener("load", () => resolve(image))
            image.addEventListener("error", (error) => reject(error))
            image.setAttribute("crossOrigin", "anonymous")
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<File | null> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) return null

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) return resolve(null)
                const file = new File([blob], "avatar.jpg", { type: "image/jpeg" })
                resolve(file)
            }, "image/jpeg")
        })
    }

    const handleConfirm = async () => {
        if (!image || !croppedAreaPixels) return

        const croppedFile = await getCroppedImg(image, croppedAreaPixels)
        if (croppedFile) {
            onCropComplete(croppedFile)
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background border-border">
                <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-xl font-semibold tracking-tight text-secondary dark:text-foreground">
                        Crop Image
                    </DialogTitle>
                </DialogHeader>

                <div className="relative h-80 bg-muted/20">
                    {image && (
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={onCropChange}
                            onZoomChange={onZoomChange}
                            onCropComplete={onCropCompleteLocal}
                            cropShape="round"
                            showGrid={false}
                        />
                    )}
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Zoom</p>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(val: number[]) => setZoom(val[0])}
                            className="py-4"
                        />
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t bg-muted/5 flex flex-row items-center justify-end gap-3">
                    <Button
                        variant="ghost"
                        className="h-9 px-4 text-xs font-semibold text-muted-foreground/60"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="h-9 px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/5 transition-all active:scale-[0.98]"
                        onClick={handleConfirm}
                    >
                        Save & Apply
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
