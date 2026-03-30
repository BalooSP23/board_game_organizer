"use client";

import { KALLAX_SIZES, KALLAX_CELL } from "@/lib/kallax";

interface KallaxSizePickerProps {
  selected: (typeof KALLAX_SIZES)[number] | null;
  onSelect: (size: (typeof KALLAX_SIZES)[number]) => void;
}

export function KallaxSizePicker({ selected, onSelect }: KallaxSizePickerProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {KALLAX_SIZES.map((size) => {
        const isSelected = selected?.label === size.label;
        const widthCm = size.cols * KALLAX_CELL.widthCm + (size.cols + 1) * 1.5;
        const heightCm = size.rows * KALLAX_CELL.heightCm + (size.rows + 1) * 1.5;
        return (
          <button
            key={size.label}
            type="button"
            onClick={() => onSelect(size)}
            className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors ${
              isSelected
                ? "border-amber-600 bg-amber-50 text-amber-900"
                : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
            }`}
          >
            {/* Mini grid preview */}
            <div
              className="grid gap-px bg-amber-800/30 rounded"
              style={{
                gridTemplateColumns: `repeat(${size.cols}, 1fr)`,
                width: `${Math.min(size.cols * 14, 70)}px`,
                height: `${Math.min(size.rows * 14, 70)}px`,
              }}
            >
              {Array.from({ length: size.rows * size.cols }).map((_, i) => (
                <div key={i} className="bg-amber-100 rounded-[1px]" />
              ))}
            </div>
            <span className="font-semibold text-sm">Kallax {size.label}</span>
            <span className="text-xs text-gray-500">
              {Math.round(widthCm)}×{Math.round(heightCm)} cm
            </span>
          </button>
        );
      })}
    </div>
  );
}
