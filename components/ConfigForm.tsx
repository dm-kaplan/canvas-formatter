"use client";

import * as React from "react";

// 1. The config interface is now simpler (no token)
// No config needed anymore

// 2. The props now include the button handlers




const ConfigForm: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Configuration
      </h2>
      <div className="text-gray-700 text-base">
        No configuration is required. Just select a template and start formatting your Canvas HTML!
      </div>
    </div>
  );
};

export default ConfigForm;