"use client";

import * as React from "react";

// 1. The config interface is now simpler (no token)
export interface CanvasConfig {
  courseId: string;
}

// 2. The props now include the button handlers
interface ConfigFormProps {
  config: CanvasConfig;
  onChange: (config: CanvasConfig) => void;
  onLoadData: () => void;
  isLoadingData: boolean;
}


const ConfigForm: React.FC<ConfigFormProps> = ({ 
  config, 
  onChange, 
  onLoadData,
  isLoadingData
}) => {
  const handleChange = (field: keyof CanvasConfig, value: string) => {
    onChange({ ...config, [field]: value });
  };

  // This handles form submission (Enter key or button click)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLoadData();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Configuration
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* THE API TOKEN FIELD HAS BEEN REMOVED */}
        <div>
          <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
            Course ID *
          </label>
          <input
            type="text"
            id="courseId"
            value={config.courseId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("courseId", e.target.value)}
            placeholder="12345"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-canvas-blue focus:border-canvas-blue"
          />
          <p className="mt-1 text-xs text-gray-500">
            Found in the course URL: /courses/[ID]
          </p>
        </div>

        {/* The "Load Course Data" button */}
        <button
          type="submit"
          disabled={isLoadingData || !config.courseId}
          className="w-full px-4 py-2 bg-canvas-blue text-white rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-canvas-blue"
        >
          {isLoadingData ? 'Loading Data...' : 'Load Course Data'}
        </button>
      </form>
    </div>
  );
};

export default ConfigForm;