import { useRef } from "react";
import "./OtpInput.css";
const LENGTH = 6;
function OtpInput({ value, onChange, disabled }) {
  const inputsRef = useRef([]);
  const digits = value.padEnd(LENGTH, " ").split("").slice(0, LENGTH);
  const updateAt = (index, char) => {
    const arr = value.padEnd(LENGTH, " ").split("").slice(0, LENGTH);
    arr[index] = char;
    onChange(arr.join("").replace(/\s/g, "").slice(0, LENGTH));
  };
  const handleChange = (index, raw) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) {
      updateAt(index, "");
      return;
    }
    updateAt(index, digit);
    if (index < LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index]?.trim()) {
      if (index > 0) inputsRef.current[index - 1]?.focus();
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, LENGTH - 1);
    inputsRef.current[focusIdx]?.focus();
  };
  return <div className="otp-input-row" onPaste={handlePaste}>
      {Array.from({ length: LENGTH }, (_, i) => <input
    key={i}
    ref={(el) => {
      inputsRef.current[i] = el;
    }}
    type="text"
    inputMode="numeric"
    maxLength={1}
    className="otp-digit"
    value={digits[i]?.trim() || ""}
    disabled={disabled}
    onChange={(e) => handleChange(i, e.target.value)}
    onKeyDown={(e) => handleKeyDown(i, e)}
    aria-label={`Digit ${i + 1}`}
  />)}
    </div>;
}
export {
  OtpInput
};
