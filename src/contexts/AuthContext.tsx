<![CDATA[
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useRouter
...
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
]]>

[Tool result trimmed: kept first 100 chars and last 100 chars of 11842 chars.]