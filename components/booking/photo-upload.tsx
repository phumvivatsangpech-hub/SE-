"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";

interface PhotoUploadProps {
  label: string;
  onUploadSuccess: (url: string) => void;
  existingUrl?: string | null;
  disabled?: boolean;
}

export function PhotoUpload({ label, onUploadSuccess, existingUrl, disabled }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      
      {existingUrl ? (
        <div className="relative aspect-video rounded-xl overflow-hidden border">
          {/* Using img over next/image for simpler external url handling */}
          <img 
            src={existingUrl} 
            alt="Uploaded room photo"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-md shadow flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white block" /> สำเร็จ
          </div>
        </div>
      ) : (
        <CldUploadWidget 
          uploadPreset="music_room_reports" // Cloudinary unsigned upload preset
          onSuccess={(result: any) => {
            setIsUploading(false);
            if (result.info?.secure_url) {
              onUploadSuccess(result.info.secure_url);
            }
          }}
          options={{
            maxFiles: 1,
            resourceType: "image",
            clientAllowedFormats: ["png", "jpeg", "jpg", "webp"]
          }}
          onOpen={() => setIsUploading(true)}
          onClose={() => setIsUploading(false)}
        >
          {({ open }) => {
            return (
              <button
                type="button"
                disabled={disabled || isUploading}
                onClick={() => open()}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl hover:bg-muted/50 hover:border-primary/50 transition-colors disabled:opacity-50 disabled:pointer-events-none group"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
                <span className="mt-2 text-sm text-muted-foreground font-medium group-hover:text-primary transition-colors">
                  {isUploading ? 'กำลังเปิดอัปโหลด...' : 'คลิดเพื่ออัปโหลดรูปภาพ'}
                </span>
              </button>
            );
          }}
        </CldUploadWidget>
      )}
    </div>
  );
}
