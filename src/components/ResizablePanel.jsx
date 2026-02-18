
import React, { useEffect, useState, useRef } from 'react';

const ResizablePanel = ({ children, height, setHeight, minHeight = 100, maxHeight = 900, onClose, mode = 'fixed', className = '' }) => {
  const [isResizing, setIsResizing] = useState(false);
  const startRef = useRef({ y: 0, h: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      // Calculate delta: moving mouse UP (negative Y change) means INCREASE height
      const delta = startRef.current.y - e.clientY;
      const newHeight = startRef.current.h + delta;

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing, minHeight, maxHeight, setHeight]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startRef.current = { y: e.clientY, h: height };
  };

  const baseClasses = mode === 'fixed'
    ? "absolute bottom-0 left-0 right-0 flex flex-col shadow-xl"
    : "flex flex-col shrink-0 transition-none";

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{
        height,
        background: 'var(--panel-bg)',
        borderTop: '1px solid var(--border-1)',
      }}
    >
      {/* Drag Handle */}
      <div
        className="h-1.5 w-full cursor-row-resize hover:bg-blue-500/20 transition-colors flex items-center justify-center group shrink-0"
        onMouseDown={handleMouseDown}
      >
        <div className="w-12 h-1 rounded-full bg-gray-400/20 group-hover:bg-blue-500/50 transition-colors" />
      </div>

      {children}
    </div>
  );
};

export default ResizablePanel;
