"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, Download } from "lucide-react";

// --- Types ---
export interface ImageData {
  id: string;
  src: string;
  alt?: string;
  downloadUrl?: string;
  badge?: string;
}

interface GalleryContextType {
  selectedImage: ImageData | null;
  setSelectedImage: (image: ImageData | null) => void;
}

const GalleryContext = React.createContext<GalleryContextType | null>(null);

// --- Physics ---
const spring = {
  type: "spring" as const,
  stiffness: 350,
  damping: 35,
  mass: 1,
};

// --- Components ---
/**
 * Root Gallery Provider
 * Manages the state of the expanded image and renders the Modal.
 */
export function Gallery({ children }: { children: React.ReactNode }) {
  const [selectedImage, setSelectedImage] = React.useState<ImageData | null>(null);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedImage]);

  return (
    <GalleryContext.Provider value={{ selectedImage, setSelectedImage }}>
      <style>{SHARED_GALLERY_CSS}</style>
      {children}
      <GalleryModal />
    </GalleryContext.Provider>
  );
}

/**
 * Responsive Masonry Grid
 */
export function GalleryGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "seg-masonry-grid columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Individual Gallery Image Thumbnail
 */
export function GalleryImage({
  src,
  alt,
  id,
  badge,
  downloadUrl,
  className,
  onImageClick,
}: {
  src: string;
  alt?: string;
  id: string;
  badge?: string;
  downloadUrl?: string;
  className?: string;
  onImageClick?: () => void;
}) {
  const context = React.useContext(GalleryContext);
  if (!context) throw new Error("GalleryImage must be used within a Gallery");

  const [hidden, setHidden] = React.useState(false);
  if (hidden) return null;

  return (
    <motion.div
      whileHover="hover"
      whileTap="tap"
      className={cn(
        "seg-card relative mb-4 break-inside-avoid cursor-zoom-in rounded-xl overflow-hidden",
        className
      )}
      onClick={() => {
        if (onImageClick) {
          onImageClick();
        } else {
          context.setSelectedImage({ id, src, alt, downloadUrl, badge });
        }
      }}
    >
      {badge && (
        <div className="seg-badge mono-font">
          <span>{badge}</span>
        </div>
      )}
      <motion.img
        layoutId={`image-${id}`}
        src={src}
        alt={alt || "Gallery Image"}
        loading="lazy"
        draggable={false}
        referrerPolicy="no-referrer"
        onContextMenu={(e) => e.preventDefault()}
        onError={() => setHidden(true)}
        className="seg-thumb-img w-full h-auto object-cover rounded-xl"
        variants={{
          hover: { scale: 0.98 },
          tap: { scale: 0.95 },
        }}
        transition={spring}
      />
      {/* Subtle hover overlay for premium feel */}
      <motion.div
        variants={{
          hover: { opacity: 1 },
          tap: { opacity: 1 },
        }}
        initial={{ opacity: 0 }}
        className="seg-hover-overlay absolute inset-0 bg-black/10 pointer-events-none rounded-xl"
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}

/**
 * Expanded View Modal with Drag-to-Dismiss
 */
function GalleryModal() {
  const context = React.useContext(GalleryContext);
  if (!context) return null;
  const { selectedImage, setSelectedImage } = context;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedImage) return;
    const targetUrl = selectedImage.downloadUrl || selectedImage.src;
    try {
      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `OSMIS_Gallery_${selectedImage.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      const link = document.createElement("a");
      link.href = targetUrl;
      link.download = `OSMIS_Gallery_${selectedImage.id}.jpg`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <AnimatePresence>
      {selectedImage && (
        <div className="seg-modal-root fixed inset-0 z-50 flex items-center justify-center">
          {/* Frosted glass backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="seg-modal-backdrop absolute inset-0 bg-black/80 backdrop-blur-2xl"
            onClick={() => setSelectedImage(null)}
          />

          {/* Interactive container for drag gesture */}
          <motion.div
            className="seg-modal-stage relative z-10 w-full h-full flex items-center justify-center cursor-zoom-out"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={(_e, info) => {
              // Dismiss if dragged far enough or fast enough
              if (
                Math.abs(info.offset.y) > 100 ||
                Math.abs(info.velocity.y) > 300
              ) {
                setSelectedImage(null);
              }
            }}
            onClick={() => setSelectedImage(null)}
          >
            {/* The Shared Element */}
            <motion.img
              layoutId={`image-${selectedImage.id}`}
              src={selectedImage.src}
              alt={selectedImage.alt || "Selected gallery image"}
              referrerPolicy="no-referrer"
              className="seg-modal-img w-auto h-auto max-w-[95vw] max-h-[90vh] rounded-xl shadow-2xl object-contain will-change-transform"
              draggable={false} // Prevent native drag to allow framer-motion drag
              transition={spring}
            />
          </motion.div>

          {/* Top Action Bar (Icon-Only Liquid Glass Download + Close) */}
          <div className="seg-modal-actions">
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.08, duration: 0.2 }}
              className="seg-liquid-icon-btn"
              onClick={handleDownload}
              aria-label="Unduh Foto"
              title="Unduh Foto"
            >
              <Download size={20} strokeWidth={2.1} />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="seg-liquid-icon-btn"
              onClick={() => setSelectedImage(null)}
              aria-label="Close gallery"
              title="Tutup (Esc)"
            >
              <X size={21} strokeWidth={2.2} />
            </motion.button>
          </div>

          {/* Subtle bottom drag hint */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ delay: 0.15, duration: 0.25 }}
            className="seg-drag-hint mono-font"
          >
            Geser vertikal atau klik layar untuk menutup
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const SHARED_GALLERY_CSS = `
.seg-masonry-grid {
  column-count: 2;
  column-gap: 0.75rem;
  width: 100%;
}
@media (min-width: 640px) {
  .seg-masonry-grid {
    column-count: 2;
    column-gap: 1.25rem;
  }
}
@media (min-width: 768px) {
  .seg-masonry-grid {
    column-count: 3;
    column-gap: 1.35rem;
  }
}
@media (min-width: 1024px) {
  .seg-masonry-grid {
    column-count: 4;
    column-gap: 1.5rem;
  }
}

.seg-card {
  position: relative;
  margin-bottom: 1.25rem;
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  cursor: zoom-in;
  border-radius: 14px;
  overflow: hidden;
  background: var(--card-bg, rgba(24, 57, 43, 0.04));
  border: 1px solid var(--border-color, rgba(24, 57, 43, 0.12));
  box-shadow: 0 8px 24px -12px rgba(24, 57, 43, 0.12);
}

.seg-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3;
  padding: 4px 9px;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 8px;
  background: rgba(250, 247, 239, 0.88);
  color: #18392b;
  border: 1px solid rgba(24, 57, 43, 0.16);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: none;
}

.seg-thumb-img {
  width: 100%;
  height: auto;
  min-height: 160px;
  object-fit: cover;
  display: block;
  border-radius: 13px;
}

@media (max-width: 767px) {
  .seg-card {
    margin-bottom: 0.75rem;
    border-radius: 12px;
  }
  .seg-badge {
    top: 8px;
    left: 8px;
    padding: 3px 7px;
    font-size: 0.62rem;
    border-radius: 6px;
  }
  .seg-thumb-img {
    min-height: 115px;
    aspect-ratio: 4 / 5;
    border-radius: 11px;
  }
  .seg-modal-stage {
    padding: 16px;
  }
  .seg-modal-actions {
    top: 16px;
    right: 16px;
    gap: 10px;
  }
  .seg-drag-hint {
    bottom: 16px;
    font-size: 0.68rem;
    padding: 5px 12px;
    max-width: calc(100vw - 32px);
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.seg-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.12);
  pointer-events: none;
  border-radius: 13px;
}

.seg-modal-root {
  position: fixed;
  inset: 0;
  z-index: 10060;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seg-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(8, 14, 11, 0.84);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.seg-modal-stage {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  padding: 24px;
  box-sizing: border-box;
}

.seg-modal-img {
  width: auto;
  height: auto;
  max-width: 94vw;
  max-height: 86vh;
  border-radius: 16px;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.65);
  object-fit: contain;
  will-change: transform;
  user-select: none;
  -webkit-user-select: none;
}

.seg-modal-actions {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 12px;
}

.seg-liquid-icon-btn {
  width: 46px;
  height: 46px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.24) 0%,
    rgba(255, 255, 255, 0.08) 55%,
    rgba(255, 255, 255, 0.16) 100%
  );
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(22px) saturate(190%);
  -webkit-backdrop-filter: blur(22px) saturate(190%);
  box-shadow:
    0 10px 32px rgba(0, 0, 0, 0.38),
    inset 0 1.5px 1px rgba(255, 255, 255, 0.45),
    inset 0 -1px 1px rgba(255, 255, 255, 0.12);
  transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
              background 0.22s ease,
              border-color 0.22s ease;
}
.seg-liquid-icon-btn:hover {
  transform: scale(1.07) translateY(-1px);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.34) 0%,
    rgba(255, 255, 255, 0.14) 55%,
    rgba(255, 255, 255, 0.24) 100%
  );
  border-color: rgba(255, 255, 255, 0.55);
}
.seg-liquid-icon-btn:active {
  transform: scale(0.95);
}

.seg-drag-hint {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  pointer-events: none;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  white-space: nowrap;
}
`;
