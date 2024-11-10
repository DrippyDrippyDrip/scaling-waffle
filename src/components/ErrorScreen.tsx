import React from 'react';
import { XCircle } from 'lucide-react';

interface ErrorScreenProps {
  onDismiss: () => void;
}

export default function ErrorScreen({ onDismiss }: ErrorScreenProps) {
  return (
    <div className="min-h-screen bg-blue-600 text-white font-mono flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <XCircle className="w-24 h-24 mx-auto text-red-500" />
          <h1 className="text-4xl font-bold">FATAL_ERROR</h1>
          <p className="text-xl text-blue-200">A fatal exception 0E has occurred at 0028:C0011E36</p>
        </div>

        <div className="bg-blue-700 p-6 rounded-lg border border-blue-400 space-y-4">
          <p>* Press any key to terminate the current operation</p>
          <p>* Press CTRL+ALT+DEL to restart your computer</p>
          <p className="text-red-400">You will lose any unsaved information in all applications.</p>
        </div>

        <div className="text-center">
          <button
            onClick={onDismiss}
            className="bg-gray-200 text-blue-600 px-8 py-3 rounded hover:bg-gray-100 transition-colors"
          >
            Press any key to continue _
          </button>
        </div>
      </div>
    </div>
  );
}