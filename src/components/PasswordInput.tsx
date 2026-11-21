"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({ name, value, onChange, autoComplete, label }: { name: string; value: string; onChange: (v: string) => void; autoComplete?: string; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <div className="pw">
        <input id={name} name={name} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required minLength={8} maxLength={72} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>
    </>
  );
}
