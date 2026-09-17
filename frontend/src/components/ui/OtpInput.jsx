import React, { useRef } from "react";

export function OtpInput({ length = 6, value = "", onChange, disabled = false }) {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) return;

    const newArr = value.split("").slice(0, length);
    while (newArr.length < length) newArr.push("");
    newArr[index] = val.slice(-1);
    
    const newVal = newArr.join("").slice(0, length);
    onChange(newVal);

    if (index < length - 1 && val) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newArr = value.split("").slice(0, length);
      while (newArr.length < length) newArr.push("");
      
      if (newArr[index]) {
        newArr[index] = "";
        onChange(newArr.join(""));
      } else if (index > 0) {
        newArr[index - 1] = "";
        onChange(newArr.join(""));
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (index < length - 1) inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, length);
    if (pasteData) {
      onChange(pasteData);
      const focusIndex = Math.min(pasteData.length, length - 1);
      setTimeout(() => inputsRef.current[focusIndex]?.focus(), 10);
    }
  };

  return (
    <div className="flex items-center gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className="w-10 h-12 text-center text-lg font-mono font-bold bg-background border border-border rounded-lg shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      ))}
    </div>
  );
}
