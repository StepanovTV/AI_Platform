"use client";
import React from "react";

import Preview from "@/components/preview";

function PrevDesc({ value }: { value: string }) {
  return (
    <div>
      <Preview value={value} />
    </div>
  );
}

export default PrevDesc;
