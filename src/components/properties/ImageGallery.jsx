import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  ZoomOut,
  ImageIcon,
  Maximize2,
  Grid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function ImageGallery({ 
  images = [], 
  mainImageUrl = null, 
  propertyTitle = "" 
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Combinar imagem principal com outras imagens
  const allImages = mainImageUrl 
    ? [mainImageUrl, ...images.filter(img => img !== mainImageUrl)]
    : images;

  useEffect(() => {
    const handleKeyboard = (e) => {
      if (!isFullscreen) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          navigateImage('prev');
          break;
        case 'ArrowRight':
          navigateImage('next');
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isFullscreen, currentImageIndex]);

  const navigateImage = (direction) => {
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === allImages.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? allImages.length - 1 : prev - 1
      );
    }
    setIsZoomed(false);
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigateImage('next');
    } else if (isRightSwipe) {
      navigateImage('prev');
    }
  };

  const imageControls = (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
      <Button
        variant="outline"
        size="icon"
        className="bg-black/40 border-white/20 hover:bg-black/60"
        onClick={() => setShowThumbnails(!showThumbnails)}
      >
        <Grid className="h-4 w-4 text-white" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="bg-black/40 border-white/20 hover:bg-black/60"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        {isZoomed ? (
          <ZoomOut className="h-4 w-4 text-white" />
        ) : (
          <ZoomIn className="h-4 w-4 text-white" />
        )}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="bg-black/40 border-white/20 hover:bg-black/60"
        onClick={() => setIsFullscreen(true)}
      >
        <Maximize2 className="h-4 w-4 text-white" />
      </Button>
      <Badge variant="secondary" className="bg-black/40 text-white">
        {currentImageIndex + 1} / {allImages.length}
      </Badge>
    </div>
  );

  const renderGalleryImage = (fullscreen = false) => (
    <div 
      className={`relative group ${fullscreen ? 'h-full' : 'aspect-[16/9]'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={allImages[currentImageIndex]}
        alt={`${propertyTitle} - Imagem ${currentImageIndex + 1}`}
        className={`w-full h-full object-contain transition-transform duration-300
          ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}
        `}
        onClick={() => setIsZoomed(!isZoomed)}
      />
      
      {/* Botões de navegação */}
      <button
        onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {imageControls}
      
      {/* Miniaturas */}
      {showThumbnails && (
        <div className="absolute bottom-16 left-0 right-0 bg-black/40 p-2 overflow-x-auto">
          <div className="flex gap-2 justify-center">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden
                  ${currentImageIndex === idx ? 'ring-2 ring-white' : 'opacity-70'}
                `}
              >
                <img
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Galeria principal */}
      {renderGalleryImage()}

      {/* Modal de tela cheia */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <div className="relative w-full h-full bg-black">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-50 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            {renderGalleryImage(true)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}