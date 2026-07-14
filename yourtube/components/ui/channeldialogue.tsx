import React from "react";

type Props = {
  isopen: boolean;
  onclose: () => void;
  mode?: string;
};

const Channeldialogue: React.FC<Props> = ({ isopen, onclose, mode }) => {
  if (!isopen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onclose} />
      <div className="relative z-10 w-full max-w-md rounded bg-white p-4 shadow-lg">
        <h3 className="text-lg font-medium">{mode === "create" ? "Create Channel" : "Channel"}</h3>
        <p className="mt-2 text-sm text-gray-600">Fill in channel details here.</p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onclose}
            className="rounded bg-gray-200 px-3 py-1 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Channeldialogue;
