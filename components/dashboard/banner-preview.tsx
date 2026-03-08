"use client";

import { useState } from "react";
import type { BannerConfigInput } from "@/lib/validations";
import { generatePreviewDocument, type PreviewPanel } from "@/lib/banner-preview-html";

interface BannerPreviewProps {
  config: BannerConfigInput;
}

const PANELS: { key: PreviewPanel; label: string }[] = [
  { key: "banner",     label: "Banner" },
  { key: "settings",   label: "Settings Panel" },
  { key: "withdrawal", label: "After Consent" },
];

export function BannerPreview({ config }: BannerPreviewProps) {
  const [panel, setPanel] = useState<PreviewPanel>("banner");

  const srcDoc = generatePreviewDocument(config, panel);

  // Taller iframe for center-positioned banners; shorter for after-consent view
  const iframeHeight =
    panel === "withdrawal" ? "160px" :
    config.position === "center" ? "420px" :
    "300px";

  return (
    <div className="space-y-2">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {PANELS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPanel(key)}
            className={[
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              panel === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
            aria-pressed={panel === key}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Iframe preview */}
      <div className="overflow-hidden rounded-lg border bg-slate-100">
        <iframe
          key={`${panel}-${config.position}`}
          srcDoc={srcDoc}
          title={`Cookie banner preview — ${panel}`}
          sandbox=""
          scrolling="no"
          style={{ width: "100%", height: iframeHeight, border: "none", display: "block" }}
          aria-label="Live banner preview"
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Live preview — updates as you configure
      </p>
    </div>
  );
}
