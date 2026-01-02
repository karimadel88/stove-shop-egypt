import React, { useRef, useState, useEffect } from 'react';
import { mediaApi } from '@/lib/api';
import { Media } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/utils';

interface ImageUploadProps {
  value: (string | Media)[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export default function ImageUpload({
  value = [],
  onChange,
  multiple = false,
  maxFiles = 10
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media details for existing IDs
  useEffect(() => {
    const fetchMedia = async () => {
      if (value.length === 0) {
        setPreviews([]);
        return;
      }

      // Separate objects from IDs
      const objects = value.filter(v => typeof v === 'object') as Media[];
      const ids = value.filter(v => typeof v === 'string') as string[];

      if (ids.length === 0) {
        setPreviews(objects);
        return;
      }

      // Check if we already have all media in previews
      const currentIds = previews.map(m => m._id);
      const allNeededIds = [...ids, ...objects.map(o => o._id)];
      const needsFetch = allNeededIds.some(id => !currentIds.includes(id)) || allNeededIds.length !== currentIds.length;

      if (needsFetch) {
        try {
          const res = await mediaApi.list();
          // Backend might return { data: Media[] } or directly Media[]
          const allMedia: Media[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          
          const resolvedMedia = value.map(idOrObj => {
            if (typeof idOrObj === 'object') return idOrObj;
            return allMedia.find(m => m._id === idOrObj);
          }).filter(Boolean) as Media[];
          
          setPreviews(resolvedMedia);
        } catch (error) {
          console.error('Failed to fetch media previews', error);
        }
      } else if (objects.length > 0) {
          // If we have objects but didn't need to fetch, still ensure previews match value order
          const resolvedMedia = value.map(idOrObj => {
            if (typeof idOrObj === 'object') return idOrObj;
            return previews.find(m => m._id === idOrObj);
          }).filter(Boolean) as Media[];
          setPreviews(resolvedMedia);
      }
    };

    fetchMedia();
  }, [value]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!multiple && files.length > 1) {
      toast.error('يمكنك اختيار ملف واحد فقط');
      return;
    }

    if (multiple && value.length + files.length > maxFiles) {
      toast.error(`يمكنك رفع بحد أقصى ${maxFiles} صور`);
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    const newIds: string[] = value.map(v => typeof v === 'object' ? (v as Media)._id : (v as string));
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await mediaApi.upload(formData);
        const uploadedMedia: Media = res.data;
        
        if (multiple) {
          newIds.push(uploadedMedia._id);
        } else {
          // If single, replace
          newIds[0] = uploadedMedia._id;
        }
      }
      
      onChange(multiple ? newIds : [newIds[0]]);
      toast.success('تم الرفع بنجاح');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في رفع الصور');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    const newIds = value
      .map(v => (typeof v === 'object' ? v._id : v))
      .filter(v => v !== id);
    onChange(newIds);
  };

  const getMediaUrlFromMedia = (m: Media) => getMediaUrl(m.url);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {previews.map((media) => (
          <div key={media._id} className="relative aspect-square rounded-lg border bg-muted overflow-hidden group">
            <img
              src={getMediaUrlFromMedia(media)}
              alt={media.originalName}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(media._id)}
              className="absolute top-1 left-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {(multiple || value.length === 0) && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || (multiple && value.length >= maxFiles)}
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors disabled:opacity-50",
              isLoading && "cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">رفع صورة</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={handleUpload}
      />

      {isLoading && uploadProgress > 0 && (
        <div className="space-y-1">
          <Progress value={uploadProgress} className="h-1" />
          <p className="text-[10px] text-muted-foreground text-center">جاري الرفع...</p>
        </div>
      )}
    </div>
  );
}
