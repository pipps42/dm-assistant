import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";

// ================================================================
// TYPES AND INTERFACES
// ================================================================

export type ToolPanelPosition = { x: number; y: number };
export type ToolPanelSize = "sm" | "md" | "lg" | "xl";

export interface ToolPanelContextValue {
  panels: Map<string, ToolPanelData>;
  openPanel: (id: string, panel: ToolPanelData) => void;
  closePanel: (id: string) => void;
  bringToFront: (id: string) => void;
  updatePanel: (id: string, updates: Partial<ToolPanelData>) => void;
}

export interface ToolPanelData {
  id: string;
  title: string;
  position: ToolPanelPosition;
  size: ToolPanelSize;
  isMinimized: boolean;
  zIndex: number;
}

export interface ToolPanelProviderProps {
  children: React.ReactNode;
}

export interface ToolPanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPosition?: ToolPanelPosition;
  size?: ToolPanelSize;
  defaultMinimized?: boolean;
  closable?: boolean;
  minimizable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  className?: string;
  onClose?: () => void;
  onMinimize?: (minimized: boolean) => void;
  onPositionChange?: (position: ToolPanelPosition) => void;
}

// ================================================================
// TOOLPANEL CONTEXT
// ================================================================

const ToolPanelContext = createContext<ToolPanelContextValue | null>(null);

export const useToolPanel = () => {
  const context = useContext(ToolPanelContext);
  if (!context) {
    throw new Error("useToolPanel must be used within a ToolPanelProvider");
  }
  return context;
};

// ================================================================
// TOOLPANEL PROVIDER
// ================================================================

export const ToolPanelProvider: React.FC<ToolPanelProviderProps> = ({
  children,
}) => {
  const [panels, setPanels] = useState<Map<string, ToolPanelData>>(new Map());
  const [maxZIndex, setMaxZIndex] = useState(1000);

  const openPanel = useCallback(
    (id: string, panel: ToolPanelData) => {
      setPanels((prev) => {
        const newPanels = new Map(prev);
        newPanels.set(id, { ...panel, zIndex: maxZIndex + 1 });
        return newPanels;
      });
      setMaxZIndex((prev) => prev + 1);
    },
    [maxZIndex]
  );

  const closePanel = useCallback((id: string) => {
    setPanels((prev) => {
      const newPanels = new Map(prev);
      newPanels.delete(id);
      return newPanels;
    });
  }, []);

  const bringToFront = useCallback(
    (id: string) => {
      setPanels((prev) => {
        const panel = prev.get(id);
        if (!panel) return prev;

        const newPanels = new Map(prev);
        newPanels.set(id, { ...panel, zIndex: maxZIndex + 1 });
        return newPanels;
      });
      setMaxZIndex((prev) => prev + 1);
    },
    [maxZIndex]
  );

  const updatePanel = useCallback(
    (id: string, updates: Partial<ToolPanelData>) => {
      setPanels((prev) => {
        const panel = prev.get(id);
        if (!panel) return prev;

        const newPanels = new Map(prev);
        newPanels.set(id, { ...panel, ...updates });
        return newPanels;
      });
    },
    []
  );

  const contextValue: ToolPanelContextValue = {
    panels,
    openPanel,
    closePanel,
    bringToFront,
    updatePanel,
  };

  return (
    <ToolPanelContext.Provider value={contextValue}>
      {children}
    </ToolPanelContext.Provider>
  );
};

// ================================================================
// MAIN TOOLPANEL COMPONENT
// ================================================================

const ToolPanel: React.FC<ToolPanelProps> = ({
  id,
  title,
  children,
  defaultPosition = { x: 100, y: 100 },
  size = "md",
  defaultMinimized = false,
  closable = true,
  minimizable = true,
  draggable = true,
  resizable = false,
  className = "",
  onClose,
  onMinimize,
  onPositionChange,
}) => {
  const { panels, openPanel, closePanel, bringToFront, updatePanel } =
    useToolPanel();
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Get panel data from context
  const panelData = panels.get(id);
  const isOpen = !!panelData;
  const position = panelData?.position || defaultPosition;
  const isMinimized = panelData?.isMinimized || defaultMinimized;
  const zIndex = panelData?.zIndex || 1000;

  // Register panel on mount
  useEffect(() => {
    if (!isOpen) {
      openPanel(id, {
        id,
        title,
        position: defaultPosition,
        size,
        isMinimized: defaultMinimized,
        zIndex: 1000,
      });
    }
  }, [id, title, defaultPosition, size, defaultMinimized, isOpen, openPanel]);

  // Handle close
  const handleClose = () => {
    closePanel(id);
    onClose?.();
  };

  // Handle minimize toggle
  const handleMinimize = () => {
    const newMinimized = !isMinimized;
    updatePanel(id, { isMinimized: newMinimized });
    onMinimize?.(newMinimized);
  };

  // Handle mouse down on header (start drag)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable || !panelRef.current) return;

    e.preventDefault();
    bringToFront(id);

    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  // Handle mouse move (dragging)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !draggable) return;

      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      };

      // Keep panel within viewport
      const maxX = window.innerWidth - 200; // Minimum 200px visible
      const maxY = window.innerHeight - 50; // Minimum 50px visible

      newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
      newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));

      updatePanel(id, { position: newPosition });
      onPositionChange?.(newPosition);
    },
    [isDragging, draggable, dragOffset, id, updatePanel, onPositionChange]
  );

  // Handle mouse up (end drag)
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle click to bring to front
  const handlePanelClick = () => {
    bringToFront(id);
  };

  if (!isOpen) {
    return null;
  }

  const panelClasses = [
    "dm-toolpanel",
    `dm-toolpanel-${size}`,
    isMinimized ? "dm-toolpanel-minimized" : "",
    isDragging ? "dm-toolpanel-dragging" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={panelRef}
      className={panelClasses}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: zIndex,
      }}
      onClick={handlePanelClick}
    >
      {/* Header */}
      <div
        ref={headerRef}
        className={`dm-toolpanel-header ${
          draggable ? "dm-toolpanel-header-draggable" : ""
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Title */}
        <div className="dm-toolpanel-title">{title}</div>

        {/* Actions */}
        <div className="dm-toolpanel-actions">
          {minimizable && (
            <button
              className="dm-toolpanel-action"
              onClick={handleMinimize}
              aria-label={isMinimized ? "Expand" : "Minimize"}
              type="button"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                {isMinimized ? (
                  <path
                    d="M3 6h6M6 3v6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 6h6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          )}

          {closable && (
            <button
              className="dm-toolpanel-action dm-toolpanel-action-close"
              onClick={handleClose}
              aria-label="Close"
              type="button"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
              >
                <path
                  d="M9 3L3 9M3 3l6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && <div className="dm-toolpanel-content">{children}</div>}

      {/* Resize handle */}
      {resizable && !isMinimized && (
        <div className="dm-toolpanel-resize-handle" />
      )}
    </div>
  );
};

export default ToolPanel;
