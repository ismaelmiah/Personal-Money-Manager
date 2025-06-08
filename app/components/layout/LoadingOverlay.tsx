'use client';

export default function LoadingOverlay({ text = 'Loading Platform...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        {/* Simple spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">{text}</p>
      </div>
    </div>
  );
}