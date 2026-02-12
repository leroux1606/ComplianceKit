"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintPolicyButton() {
  function handlePrint() {
    window.print();
  }

  return (
    <Button variant="outline" onClick={handlePrint}>
      <Printer className="mr-2 h-4 w-4" />
      Print
    </Button>
  );
}
