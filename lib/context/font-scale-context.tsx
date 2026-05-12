"use client";

import { createContext, useContext } from "react";
import { type FontClasses, type FontScale, getFontClasses } from "@/lib/font-scale";

const FontScaleContext = createContext<FontClasses>(getFontClasses("regular"));

export function FontScaleProvider({
  scale,
  children,
}: {
  scale: FontScale;
  children: React.ReactNode;
}) {
  return (
    <FontScaleContext.Provider value={getFontClasses(scale)}>
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale(): FontClasses {
  return useContext(FontScaleContext);
}
