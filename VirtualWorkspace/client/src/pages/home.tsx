import React from "react";
import Desktop from "@/components/desktop/Desktop";
import Taskbar from "@/components/taskbar/Taskbar";
import WindowManager from "@/components/windows/WindowManager";
import { useWindowSystem } from "@/hooks/useWindowSystem";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <title>Windows Virtual Machine</title>
      <meta name="description" content="A Windows-inspired web interface with Google Drive integration for file storage and a built-in web browser" />
      
      <WindowManager>
        <Desktop />
        <Taskbar />
      </WindowManager>
    </div>
  );
}
