"use client";

import { useState } from "react";
import { formatGrams, formatPrice } from "@/lib/utils";

interface GramSliderProps {
  min: number;
  max: number;
  step: number;
  pricePerGram: number;
  defaultValue?: number;
  onChange: (grams: number) => void;
}

export default function GramSlider({
  min,
  max,
  step,
  pricePerGram,
  defaultValue,
  onChange,
}: GramSliderProps) {
  const [grams, setGrams] = useState(defaultValue ?? min);

  const handleChange = (val: number) => {
    setGrams(val);
    onChange(val);
  };

  const percent = ((grams - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      {/* Display */}
      <div className="flex items-center justify-between">
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 flex items-center gap-2">
          <span className="text-2xl font-bold text-green-700">{grams.toLocaleString()}</span>
          <span className="text-green-500 text-sm font-medium">ກຣາມ</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">ລາຄາ</p>
          <p className="text-lg font-bold text-green-600">{formatPrice(pricePerGram * grams)}</p>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={grams}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-green-100"
          style={{
            background: `linear-gradient(to right, #16a34a ${percent}%, #dcfce7 ${percent}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatGrams(min)}</span>
          <span>{formatGrams(max)}</span>
        </div>
      </div>

      {/* Quick select buttons */}
      <div className="flex gap-2 flex-wrap">
        {[min, Math.round(max * 0.25), Math.round(max * 0.5), max].map((val) => (
          <button
            key={val}
            onClick={() => handleChange(val)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              grams === val
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-green-600 border-green-300 hover:border-green-500"
            }`}
          >
            {formatGrams(val)}
          </button>
        ))}
      </div>

      {/* Manual input */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">ໃສ່ເອງ:</span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={grams}
          onChange={(e) => {
            const v = Math.min(max, Math.max(min, Number(e.target.value)));
            handleChange(v);
          }}
          className="w-28 border border-green-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        <span className="text-sm text-gray-500">ກຣາມ</span>
      </div>
    </div>
  );
}
