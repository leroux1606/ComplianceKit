"use client";

import { useState } from "react";
import { X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BannerConfigInput } from "@/lib/validations";

interface BannerPreviewProps {
  config: BannerConfigInput;
}

export function BannerPreview({ config }: BannerPreviewProps) {
  const [showSettings, setShowSettings] = useState(false);

  const buttonRadius = {
    rounded: "rounded-md",
    square: "rounded-none",
    pill: "rounded-full",
  };

  const positionStyles = {
    bottom: "bottom-0 left-0 right-0",
    top: "top-0 left-0 right-0",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg rounded-lg",
  };

  const bgColor = config.theme === "dark" ? "#1f2937" : "#ffffff";
  const textColor = config.theme === "dark" ? "#f9fafb" : "#1f2937";

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg border bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Simulated website content */}
      <div className="p-4 space-y-4">
        <div className="h-8 w-32 bg-slate-300 rounded" />
        <div className="h-4 w-full bg-slate-300 rounded" />
        <div className="h-4 w-3/4 bg-slate-300 rounded" />
        <div className="h-4 w-5/6 bg-slate-300 rounded" />
        <div className="h-32 w-full bg-slate-300 rounded" />
        <div className="h-4 w-full bg-slate-300 rounded" />
        <div className="h-4 w-2/3 bg-slate-300 rounded" />
      </div>

      {/* Cookie Banner */}
      <div
        className={cn(
          "absolute p-4 shadow-lg transition-all duration-300",
          positionStyles[config.position],
          config.position === "center" && "mx-4"
        )}
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {showSettings ? (
          // Settings Panel
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Cookie Preferences</h4>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Necessary</p>
                  <p className="text-xs opacity-70">Required for the site to work</p>
                </div>
                <div className="h-5 w-9 rounded-full bg-green-500 relative">
                  <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Analytics</p>
                  <p className="text-xs opacity-70">Help us improve</p>
                </div>
                <div className="h-5 w-9 rounded-full bg-gray-300 relative">
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Marketing</p>
                  <p className="text-xs opacity-70">Personalized ads</p>
                </div>
                <div className="h-5 w-9 rounded-full bg-gray-300 relative">
                  <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white" />
                </div>
              </div>
            </div>

            <button
              className={cn(
                "w-full py-2 px-4 text-sm font-medium",
                buttonRadius[config.buttonStyle]
              )}
              style={{
                backgroundColor: config.primaryColor,
                color: config.textColor,
              }}
            >
              Save Preferences
            </button>
          </div>
        ) : (
          // Main Banner
          <div className="space-y-3">
            <p className="text-sm">
              We use cookies to enhance your experience. By continuing to visit
              this site you agree to our use of cookies.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                className={cn(
                  "py-2 px-4 text-sm font-medium",
                  buttonRadius[config.buttonStyle]
                )}
                style={{
                  backgroundColor: config.primaryColor,
                  color: config.textColor,
                }}
              >
                Accept All
              </button>
              <button
                className={cn(
                  "py-2 px-4 text-sm font-medium border",
                  buttonRadius[config.buttonStyle]
                )}
                style={{
                  borderColor: config.primaryColor,
                  color: config.theme === "dark" ? "#f9fafb" : config.primaryColor,
                }}
              >
                Reject All
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className={cn(
                  "py-2 px-4 text-sm font-medium flex items-center gap-1",
                  buttonRadius[config.buttonStyle]
                )}
                style={{
                  color: config.theme === "dark" ? "#f9fafb" : config.primaryColor,
                }}
              >
                <Settings className="h-3 w-3" />
                Customize
              </button>
            </div>

            <p className="text-xs opacity-70">
              <a href="#" className="underline">
                Privacy Policy
              </a>
              {" • "}
              <a href="#" className="underline">
                Cookie Policy
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

