"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);
  const [bg3dDisabled, setBg3dDisabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("obsidian-theme");
    const dark = stored !== "light";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    setBg3dDisabled(localStorage.getItem("obsidian-3d-disabled") === "true");
  }, []);

  const toggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("obsidian-theme", newIsDark ? "dark" : "light");
  };

  if (isDark === null) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Theme and settings">
          {isDark ? "🌙" : "☀️"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem
          checked={!isDark}
          onCheckedChange={toggle}
        >
          Light mode
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={bg3dDisabled}
          onCheckedChange={(v) => {
            localStorage.setItem("obsidian-3d-disabled", v ? "true" : "");
            setBg3dDisabled(v);
            window.location.reload();
          }}
        >
          Disable 3D background
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}