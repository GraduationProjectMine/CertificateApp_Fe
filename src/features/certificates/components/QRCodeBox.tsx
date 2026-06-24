import React from "react";

export default function QRCodeBox({ value, size = 80 }: { value?: string; size?: number }) {
  return (
    <div className="inline-flex items-center justify-center bg-white p-1 border border-gray-200 rounded-lg" style={{ width: size, height: size }}>
      <div className="w-full h-full border border-dashed border-gray-300 flex items-center justify-center text-[8px] text-gray-400 uppercase font-bold select-none">
        QR Code
      </div>
    </div>
  );
}
