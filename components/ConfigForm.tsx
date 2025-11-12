"use client";

import * as React from "react";

// 1. The config interface is now simpler (no token)
// No config needed anymore

// 2. The props now include the button handlers




const ConfigForm: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Welcome to Canvas Formatter!
      </h2>
      <div className="text-gray-700 text-base">
        Easily convert your course content into WFU SPS Canvas-ready HTML. Select a template, paste your material, and generate clean, formatted HTML for Canvas pages.
      </div>
    </div>
  );
};

export default ConfigForm;