import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ParkPhoto } from "@/lib/api/parks";

interface PhotoSliderProps {
  photos: ParkPhoto[];
  parkName: string;
}

export const PhotoSlider = ({ photos, parkName }: PhotoSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="relative w-full h-[50vh] md:h-[60vh] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p>Geen foto's beschikbaar</p>
        </div>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
      {/* Main Image */}
      <div className="absolute inset-0">
        <img
          src={photos[currentIndex].photo_url}
          alt={`${parkName} - foto ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors text-white z-10"
            aria-label="Vorige foto"
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors text-white z-10"
            aria-label="Volgende foto"
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator - hidden on mobile, visible on larger screens */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Ga naar foto ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnail Strip - hidden on mobile */}
      {photos.length > 1 && (
        <div className="hidden md:flex absolute bottom-12 left-1/2 -translate-x-1/2 gap-2 max-w-[80%] overflow-x-auto pb-2 scrollbar-hide z-10">
          {photos.slice(0, 6).map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-white shadow-lg scale-105"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={photo.photo_url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Photo counter for mobile */}
      {photos.length > 1 && (
        <div className="md:hidden absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm z-10">
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
};
