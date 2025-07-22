import React from "react";

export type BreadcrumbsSize = "sm" | "md" | "lg";

export interface BreadcrumbData {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  isDisabled?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbData[];
  size?: BreadcrumbsSize;
  separator?: React.ReactNode;
  maxItems?: number;
  showRoot?: boolean;
  className?: string;
}

export interface BreadcrumbItemProps {
  item: BreadcrumbData;
  isLast?: boolean;
  size: BreadcrumbsSize;
  separator?: React.ReactNode;
  className?: string;
}

// ================================================================
// DEFAULT SEPARATOR COMPONENT
// ================================================================

const DefaultSeparator: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="dm-breadcrumb-separator-icon"
  >
    <path d="M6 4l4 4-4 4V4z" />
  </svg>
);

// ================================================================
// BREADCRUMB ITEM COMPONENT
// ================================================================

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  item,
  isLast = false,
  size,
  separator,
  className = "",
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (item.isDisabled) {
      e.preventDefault();
      return;
    }

    if (item.onClick) {
      e.preventDefault();
      item.onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      (e.key === "Enter" || e.key === " ") &&
      item.onClick &&
      !item.isDisabled
    ) {
      e.preventDefault();
      item.onClick();
    }
  };

  const itemClasses = [
    "dm-breadcrumb-item",
    `dm-breadcrumb-item-${size}`,
    isLast ? "dm-breadcrumb-item-current" : "",
    item.isDisabled ? "dm-breadcrumb-item-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const ItemContent = (
    <>
      {/* Icon */}
      {item.icon && (
        <span className="dm-breadcrumb-item-icon">{item.icon}</span>
      )}

      {/* Label */}
      <span className="dm-breadcrumb-item-label">{item.label}</span>
    </>
  );

  return (
    <li className="dm-breadcrumb-item-wrapper">
      {/* Breadcrumb Item */}
      {item.href && !isLast ? (
        <a
          href={item.href}
          className={itemClasses}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-disabled={item.isDisabled}
          aria-current={isLast ? "page" : undefined}
        >
          {ItemContent}
        </a>
      ) : (
        <span
          className={itemClasses}
          onClick={item.onClick && !isLast ? handleClick : undefined}
          onKeyDown={item.onClick && !isLast ? handleKeyDown : undefined}
          role={item.onClick && !isLast ? "button" : undefined}
          tabIndex={item.onClick && !isLast && !item.isDisabled ? 0 : undefined}
          aria-disabled={item.isDisabled}
          aria-current={isLast ? "page" : undefined}
        >
          {ItemContent}
        </span>
      )}

      {/* Separator */}
      {!isLast && (
        <span className="dm-breadcrumb-separator" aria-hidden="true">
          {separator || <DefaultSeparator />}
        </span>
      )}
    </li>
  );
};

// ================================================================
// MAIN BREADCRUMBS COMPONENT
// ================================================================

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  size = "md",
  separator,
  maxItems = 3,
  showRoot = true,
  className = "",
}) => {
  // Process items for truncation
  const processedItems = React.useMemo(() => {
    if (items.length <= maxItems) {
      return items;
    }

    const firstItem = showRoot ? items[0] : null;
    const lastItems = items.slice(-(maxItems - (showRoot ? 2 : 1)));

    if (showRoot && firstItem) {
      return [
        firstItem,
        {
          id: "ellipsis",
          label: "...",
          isDisabled: true,
        },
        ...lastItems,
      ];
    }

    return [
      {
        id: "ellipsis",
        label: "...",
        isDisabled: true,
      },
      ...lastItems,
    ];
  }, [items, maxItems, showRoot]);

  const breadcrumbsClasses = [
    "dm-breadcrumbs",
    `dm-breadcrumbs-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (items.length === 0) {
    return null;
  }

  return (
    <nav className={breadcrumbsClasses} aria-label="Breadcrumb">
      <ol className="dm-breadcrumbs-list">
        {processedItems.map((item, index) => (
          <BreadcrumbItem
            key={item.id}
            item={item}
            isLast={index === processedItems.length - 1}
            size={size}
            separator={separator}
          />
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
