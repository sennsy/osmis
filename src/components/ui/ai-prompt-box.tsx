"use client";

import React, { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowUp, Paperclip, Square, X, StopCircle, Mic, Globe, BrainCog, FolderCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ai-prompt-box.module.css";

// Utility function for className merging
const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(styles.textarea, className)}
    ref={ref}
    rows={1}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// Tooltip Components
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

// Dialog Components
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 100010,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
    }}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      style={{
        position: "fixed",
        left: "50%",
        top: "50%",
        zIndex: 100011,
        transform: "translate(-50%, -50%)",
        width: "90vw",
        maxWidth: "800px",
        backgroundColor: "#1F2023",
        border: "1px solid #444444",
        borderRadius: "20px",
        padding: "16px",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6)",
      }}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: "6px",
          border: "none",
          color: "#e5e7eb",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={18} />
        <span style={{ display: "none" }}>Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    style={{ fontSize: "1rem", fontWeight: 600, color: "#f3f4f6", margin: "0 0 12px 0" }}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// VoiceRecorder Component
interface VoiceRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: (duration: number) => void;
  visualizerBars?: number;
}
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  visualizerBars = 32,
}) => {
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      onStartRecording();
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (time > 0) {
        onStopRecording(time);
        setTime(0);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, time, onStartRecording, onStopRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isRecording) return null;

  return (
    <div className={styles.voiceRecordingWrap}>
      <div className={styles.voiceTimer}>
        <div className={styles.voiceDot} />
        <span className={styles.voiceTimeText}>{formatTime(time)}</span>
      </div>
      <div className={styles.visualizerRow}>
        {[...Array(visualizerBars)].map((_, i) => (
          <div
            key={i}
            className={styles.visualizerBar}
            style={{
              height: `${Math.max(20, Math.random() * 100)}%`,
              animationDelay: `${i * 0.04}s`,
              animationDuration: `${0.45 + Math.random() * 0.45}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ImageViewDialog Component
interface ImageViewDialogProps {
  imageUrl: string | null;
  onClose: () => void;
}
const ImageViewDialog: React.FC<ImageViewDialogProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  return (
    <Dialog open={!!imageUrl} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Pratinjau Gambar</DialogTitle>
        <div style={{ width: "100%", maxHeight: "75vh", display: "flex", justifyContent: "center", overflow: "hidden", borderRadius: "12px" }}>
          <img
            src={imageUrl}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: "10px" }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main PromptInputBox Component
export interface PromptInputBoxProps {
  onSend?: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export const PromptInputBox = forwardRef<HTMLDivElement, PromptInputBoxProps>((props, ref) => {
  const {
    onSend = () => {},
    isLoading = false,
    placeholder = "Ketik pertanyaan Anda di sini...",
    className,
  } = props;

  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showThink, setShowThink] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Autosize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
  }, [input]);

  const handleToggleChange = (mode: "search" | "think") => {
    if (mode === "search") {
      setShowSearch((prev) => !prev);
      setShowThink(false);
    } else if (mode === "think") {
      setShowThink((prev) => !prev);
      setShowSearch(false);
    }
  };

  const handleCanvasToggle = () => setShowCanvas((prev) => !prev);

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const processFile = (file: File) => {
    if (!isImageFile(file)) return;
    if (file.size > 10 * 1024 * 1024) return;
    setFiles([file]);
    const reader = new FileReader();
    reader.onload = (e) => setFilePreviews({ [file.name]: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove && filePreviews[fileToRemove.name]) setFilePreviews({});
    setFiles([]);
  };

  const handleSubmit = () => {
    if (input.trim() || files.length > 0) {
      let prefix = "";
      if (showSearch) prefix = "[Search: ";
      else if (showThink) prefix = "[Think: ";
      else if (showCanvas) prefix = "[Canvas: ";
      const formattedInput = prefix ? `${prefix}${input}]` : input;
      onSend(formattedInput, files);
      setInput("");
      setFiles([]);
      setFilePreviews({});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = input.trim() !== "" || files.length > 0;

  return (
    <>
      <TooltipProvider>
        <div
          ref={ref}
          className={cn(
            styles.promptBoxRoot,
            isLoading && styles.promptBoxLoading,
            className
          )}
        >
          {/* File Previews */}
          {files.length > 0 && !isRecording && (
            <div className={styles.fileList}>
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className={styles.fileItem}
                  onClick={() => setSelectedImage(filePreviews[file.name] || null)}
                >
                  <img
                    src={filePreviews[file.name]}
                    alt={file.name}
                    className={styles.fileThumb}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className={styles.fileRemoveBtn}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <div className={cn(styles.textareaWrap, isRecording && styles.textareaWrapHidden)}>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isRecording}
              placeholder={
                showSearch
                  ? "Cari arsip OSMIS di web..."
                  : showThink
                  ? "Analisis mendalam dengan Matra AI..."
                  : showCanvas
                  ? "Buat draft/ide di canvas..."
                  : placeholder
              }
            />
          </div>

          {/* Voice Visualizer */}
          {isRecording && (
            <VoiceRecorder
              isRecording={isRecording}
              onStartRecording={() => {}}
              onStopRecording={(duration) => {
                setIsRecording(false);
                onSend(`[Voice message - ${duration} detik]`, []);
              }}
            />
          )}

          {/* Action Row */}
          <div className={styles.actionsRow}>
            <div className={styles.actionsLeft}>
              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className={styles.iconBtn}
                title="Unggah Gambar"
                disabled={isRecording}
              >
                <Paperclip size={18} />
                <input
                  ref={uploadInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) processFile(e.target.files[0]);
                    if (e.target) e.target.value = "";
                  }}
                  accept="image/*"
                />
              </button>

              {/* Mode Toggles */}
              <button
                type="button"
                onClick={() => handleToggleChange("search")}
                className={cn(styles.modeToggleBtn, showSearch && styles.searchActive)}
                title="Search Mode"
              >
                <motion.div
                  animate={{ rotate: showSearch ? 360 : 0, scale: showSearch ? 1.1 : 1 }}
                  whileHover={{ rotate: showSearch ? 360 : 15, scale: 1.15, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Globe size={15} />
                </motion.div>
                <AnimatePresence>
                  {showSearch && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <div className={styles.divider} />

              <button
                type="button"
                onClick={() => handleToggleChange("think")}
                className={cn(styles.modeToggleBtn, showThink && styles.thinkActive)}
                title="Deep Thinking Mode"
              >
                <motion.div
                  animate={{ rotate: showThink ? 360 : 0, scale: showThink ? 1.1 : 1 }}
                  whileHover={{ rotate: showThink ? 360 : 15, scale: 1.15, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <BrainCog size={15} />
                </motion.div>
                <AnimatePresence>
                  {showThink && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                    >
                      Think
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <div className={styles.divider} />

              <button
                type="button"
                onClick={handleCanvasToggle}
                className={cn(styles.modeToggleBtn, showCanvas && styles.canvasActive)}
                title="Canvas Mode"
              >
                <motion.div
                  animate={{ rotate: showCanvas ? 360 : 0, scale: showCanvas ? 1.1 : 1 }}
                  whileHover={{ rotate: showCanvas ? 360 : 15, scale: 1.15, transition: { type: "spring", stiffness: 300, damping: 10 } }}
                  transition={{ type: "spring", stiffness: 260, damping: 25 }}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <FolderCode size={15} />
                </motion.div>
                <AnimatePresence>
                  {showCanvas && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                    >
                      Canvas
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Right: Submit / Record Button */}
            <div className={styles.actionsRight}>
              <button
                type="button"
                className={cn(
                  styles.sendBtn,
                  isRecording
                    ? styles.voiceRecordingBtn
                    : hasContent
                    ? styles.sendBtnActive
                    : styles.sendBtnInactive
                )}
                onClick={() => {
                  if (isRecording) setIsRecording(false);
                  else if (hasContent) handleSubmit();
                  else setIsRecording(true);
                }}
                disabled={isLoading && !hasContent}
                title={
                  isLoading
                    ? "Sedang memproses..."
                    : isRecording
                    ? "Berhenti Merekam"
                    : hasContent
                    ? "Kirim Pesan"
                    : "Pesan Suara"
                }
              >
                {isLoading ? (
                  <Square size={16} fill="currentColor" />
                ) : isRecording ? (
                  <StopCircle size={20} color="#ef4444" />
                ) : hasContent ? (
                  <ArrowUp size={18} />
                ) : (
                  <Mic size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      </TooltipProvider>

      <ImageViewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  );
});

PromptInputBox.displayName = "PromptInputBox";
export default PromptInputBox;
