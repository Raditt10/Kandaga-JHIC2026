"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function KeepTitle() {
  const pathname = usePathname();

  useEffect(() => {
    document.title = "Kandaga";
  }, [pathname]);

  return null;
}
