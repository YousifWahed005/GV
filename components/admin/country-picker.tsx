"use client";

import { useState } from "react";
import { WORLD_COUNTRIES } from "@/lib/world-countries";

export function CountryPicker({ defaultName, defaultCode }: { defaultName?: string; defaultCode?: string }) {
  const initial = WORLD_COUNTRIES.find((c) => c.name === defaultName || c.code === defaultCode);
  const [code, setCode] = useState(initial?.code || defaultCode || "");

  return (
    <div className="flex items-center gap-2 sm:col-span-2">
      <select
        className="field"
        name="name"
        required
        defaultValue={initial?.name || ""}
        onChange={(e) => {
          const picked = WORLD_COUNTRIES.find((c) => c.name === e.target.value);
          setCode(picked?.code || "");
        }}
      >
        <option value="" disabled>Select Country *</option>
        {WORLD_COUNTRIES.map((c) => (
          <option key={c.code} value={c.name}>{c.name}</option>
        ))}
      </select>
      <input type="hidden" name="flagCode" value={code} />
      {code ? (
        <img
          src={`https://flagcdn.com/w40/${code}.png`}
          alt=""
          className="h-8 w-11 shrink-0 rounded border border-white/10 object-cover"
        />
      ) : (
        <div className="h-8 w-11 shrink-0 rounded border border-dashed border-white/15" aria-hidden="true" />
      )}
    </div>
  );
}
