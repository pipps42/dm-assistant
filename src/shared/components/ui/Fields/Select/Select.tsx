import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  forwardRef,
} from "react";

export type SelectVariant = "outlined" | "filled" | "ghost";
export type SelectSize = "sm" | "md" | "lg";
export type SelectState = "default" | "error" | "success" | "warning";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
  group?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number | (string | number)[];
  defaultValue?: string | number | (string | number)[];
  placeholder?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  state?: SelectState;
  label?: string;
  helperText?: string;
  errorText?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  maxHeight?: string | number;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  emptyText?: string;
  searchPlaceholder?: string;
  className?: string;
  containerClassName?: string;
  dropdownClassName?: string;
  optionRender?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
  onSearch?: (searchTerm: string) => void;
  onChange?: (
    value: string | number | (string | number)[],
    option?: SelectOption | SelectOption[]
  ) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onDropdownOpen?: () => void;
  onDropdownClose?: () => void;
}

interface InternalSelectState {
  isOpen: boolean;
  searchTerm: string;
  focusedIndex: number;
  selectedValues: (string | number)[];
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options = [],
      value,
      defaultValue,
      placeholder = "Seleziona un'opzione",
      variant = "outlined",
      size = "md",
      state = "default",
      label,
      helperText,
      errorText,
      multiple = false,
      searchable = false,
      clearable = false,
      loading = false,
      disabled = false,
      required = false,
      fullWidth = false,
      maxHeight = "200px",
      leftIcon,
      rightIcon,
      emptyText = "Nessuna opzione disponibile",
      searchPlaceholder = "Cerca...",
      className = "",
      containerClassName = "",
      dropdownClassName = "",
      optionRender,
      onSearch,
      onChange,
      onFocus,
      onBlur,
      onDropdownOpen,
      onDropdownClose,
    },
    ref
  ) => {
    const [internalState, setInternalState] = useState<InternalSelectState>(
      () => {
        let initialSelectedValues: (string | number)[] = [];

        if (multiple) {
          if (Array.isArray(value || defaultValue)) {
            initialSelectedValues = (value || defaultValue) as (
              | string
              | number
            )[];
          }
        } else {
          const singleValue = value !== undefined ? value : defaultValue;
          if (singleValue !== undefined) {
            initialSelectedValues = [singleValue as string | number];
          }
        }

        return {
          isOpen: false,
          searchTerm: "",
          focusedIndex: -1,
          selectedValues: initialSelectedValues,
        };
      }
    );

    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Determine actual state (error takes precedence)
    const actualState = errorText ? "error" : state;

    // Filter options based on search term
    const filteredOptions =
      searchable && internalState.searchTerm
        ? options.filter(
            (option) =>
              option.label
                .toLowerCase()
                .includes(internalState.searchTerm.toLowerCase()) ||
              option.description
                ?.toLowerCase()
                .includes(internalState.searchTerm.toLowerCase())
          )
        : options;

    // Group options if needed
    const groupedOptions = React.useMemo(() => {
      const groups: Record<string, SelectOption[]> = {};
      const ungrouped: SelectOption[] = [];

      filteredOptions.forEach((option) => {
        if (option.group) {
          if (!groups[option.group]) {
            groups[option.group] = [];
          }
          groups[option.group].push(option);
        } else {
          ungrouped.push(option);
        }
      });

      return { groups, ungrouped };
    }, [filteredOptions]);

    // Get selected options
    const selectedOptions = options.filter((option) =>
      internalState.selectedValues.includes(option.value)
    );

    // Handle option selection
    const handleOptionSelect = useCallback(
      (option: SelectOption) => {
        if (option.disabled) return;

        let newSelectedValues: (string | number)[];

        if (multiple) {
          const isSelected = internalState.selectedValues.includes(
            option.value
          );
          newSelectedValues = isSelected
            ? internalState.selectedValues.filter((v) => v !== option.value)
            : [...internalState.selectedValues, option.value];
        } else {
          newSelectedValues = [option.value];
          // Close dropdown for single select
          setInternalState((prev) => ({
            ...prev,
            isOpen: false,
            focusedIndex: -1,
          }));
        }

        setInternalState((prev) => ({
          ...prev,
          selectedValues: newSelectedValues,
        }));

        // Call onChange callback
        const selectedOptions = options.filter((opt) =>
          newSelectedValues.includes(opt.value)
        );
        if (multiple) {
          onChange?.(newSelectedValues, selectedOptions);
        } else {
          onChange?.(newSelectedValues[0], selectedOptions[0]);
        }
      },
      [multiple, options, internalState.selectedValues, onChange]
    );

    // Handle dropdown toggle
    const handleToggleDropdown = useCallback(() => {
      if (disabled || loading) return;

      const newIsOpen = !internalState.isOpen;
      setInternalState((prev) => ({
        ...prev,
        isOpen: newIsOpen,
        focusedIndex: newIsOpen ? 0 : -1,
        searchTerm: newIsOpen ? prev.searchTerm : "",
      }));

      if (newIsOpen) {
        onDropdownOpen?.();
        onFocus?.();
        // Focus search input if searchable
        setTimeout(() => {
          if (searchable && searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 10);
      } else {
        onDropdownClose?.();
        onBlur?.();
      }
    }, [
      disabled,
      loading,
      internalState.isOpen,
      searchable,
      onDropdownOpen,
      onDropdownClose,
      onFocus,
      onBlur,
    ]);

    // Handle clear
    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setInternalState((prev) => ({ ...prev, selectedValues: [] }));
        onChange?.(multiple ? [] : "", multiple ? [] : undefined);
      },
      [multiple, onChange]
    );

    // Handle search
    const handleSearch = useCallback(
      (searchTerm: string) => {
        setInternalState((prev) => ({ ...prev, searchTerm, focusedIndex: 0 }));
        onSearch?.(searchTerm);
      },
      [onSearch]
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        switch (e.key) {
          case "Enter":
          case " ":
            e.preventDefault();
            if (!internalState.isOpen) {
              handleToggleDropdown();
            } else if (
              internalState.focusedIndex >= 0 &&
              filteredOptions[internalState.focusedIndex]
            ) {
              handleOptionSelect(filteredOptions[internalState.focusedIndex]);
            }
            break;

          case "Escape":
            if (internalState.isOpen) {
              e.preventDefault();
              setInternalState((prev) => ({
                ...prev,
                isOpen: false,
                focusedIndex: -1,
              }));
              triggerRef.current?.focus();
            }
            break;

          case "ArrowDown":
            e.preventDefault();
            if (!internalState.isOpen) {
              handleToggleDropdown();
            } else {
              const nextIndex = Math.min(
                internalState.focusedIndex + 1,
                filteredOptions.length - 1
              );
              setInternalState((prev) => ({
                ...prev,
                focusedIndex: nextIndex,
              }));
            }
            break;

          case "ArrowUp":
            e.preventDefault();
            if (internalState.isOpen) {
              const prevIndex = Math.max(internalState.focusedIndex - 1, 0);
              setInternalState((prev) => ({
                ...prev,
                focusedIndex: prevIndex,
              }));
            }
            break;

          case "Home":
            if (internalState.isOpen) {
              e.preventDefault();
              setInternalState((prev) => ({ ...prev, focusedIndex: 0 }));
            }
            break;

          case "End":
            if (internalState.isOpen) {
              e.preventDefault();
              setInternalState((prev) => ({
                ...prev,
                focusedIndex: filteredOptions.length - 1,
              }));
            }
            break;
        }
      },
      [internalState, filteredOptions, handleToggleDropdown, handleOptionSelect]
    );

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          dropdownRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setInternalState((prev) => ({
            ...prev,
            isOpen: false,
            focusedIndex: -1,
          }));
        }
      };

      if (internalState.isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [internalState.isOpen]);

    // Scroll focused option into view
    useEffect(() => {
      if (internalState.isOpen && internalState.focusedIndex >= 0) {
        const focusedElement = optionRefs.current[internalState.focusedIndex];
        if (focusedElement) {
          focusedElement.scrollIntoView({ block: "nearest" });
        }
      }
    }, [internalState.isOpen, internalState.focusedIndex]);

    // Sync external value changes
    useEffect(() => {
      if (value !== undefined) {
        const newSelectedValues = multiple
          ? Array.isArray(value)
            ? (value as (string | number)[])
            : [value as string | number]
          : [value as string | number];
        setInternalState((prev) => ({
          ...prev,
          selectedValues: newSelectedValues,
        }));
      }
    }, [value, multiple]);

    // CSS classes
    const containerClasses = [
      "dm-select-container",
      fullWidth ? "dm-select-full-width" : "",
      containerClassName,
    ]
      .filter(Boolean)
      .join(" ");

    const triggerClasses = [
      "dm-select-trigger",
      `dm-select-${size}`,
      `dm-select-${variant}`,
      actualState !== "default" ? `dm-select-${actualState}` : "",
      internalState.isOpen ? "dm-select-open" : "",
      disabled ? "dm-select-disabled" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Render display value
    const renderDisplayValue = () => {
      if (internalState.selectedValues.length === 0) {
        return <span className="dm-select-placeholder">{placeholder}</span>;
      }

      if (multiple) {
        if (internalState.selectedValues.length === 1) {
          const option = selectedOptions[0];
          return <span className="dm-select-value">{option.label}</span>;
        }
        return (
          <span className="dm-select-value">
            {internalState.selectedValues.length} elementi selezionati
          </span>
        );
      }

      const option = selectedOptions[0];
      return option ? (
        <span className="dm-select-value">{option.label}</span>
      ) : null;
    };

    // Render option
    const renderOption = (option: SelectOption, index: number) => {
      const isSelected = internalState.selectedValues.includes(option.value);
      const isFocused = index === internalState.focusedIndex;

      if (optionRender) {
        return optionRender(option, isSelected);
      }

      return (
        <div
          key={option.value}
          ref={(el) => {
            optionRefs.current[index] = el;
          }}
          className={[
            "dm-select-option",
            isSelected ? "dm-select-option-selected" : "",
            isFocused ? "dm-select-option-focused" : "",
            option.disabled ? "dm-select-option-disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => handleOptionSelect(option)}
          role="option"
          aria-selected={isSelected}
          aria-disabled={option.disabled}
        >
          <div className="dm-select-option-content">
            {option.icon && (
              <span className="dm-select-option-icon">{option.icon}</span>
            )}
            <div className="dm-select-option-text">
              <span className="dm-select-option-label">{option.label}</span>
              {option.description && (
                <span className="dm-select-option-description">
                  {option.description}
                </span>
              )}
            </div>
            {multiple && isSelected && (
              <span className="dm-select-option-check">✓</span>
            )}
          </div>
        </div>
      );
    };

    // Render options list
    const renderOptionsList = () => {
      if (loading) {
        return (
          <div className="dm-select-loading">
            <div className="dm-select-spinner"></div>
            <span>Caricamento...</span>
          </div>
        );
      }

      if (filteredOptions.length === 0) {
        return (
          <div className="dm-select-empty">
            <span>{emptyText}</span>
          </div>
        );
      }

      // Reset option refs
      optionRefs.current = [];

      // Render grouped options
      if (Object.keys(groupedOptions.groups).length > 0) {
        let optionIndex = 0;
        return (
          <>
            {/* Ungrouped options first */}
            {groupedOptions.ungrouped.map((option) =>
              renderOption(option, optionIndex++)
            )}

            {/* Grouped options */}
            {Object.entries(groupedOptions.groups).map(
              ([groupName, groupOptions]) => (
                <div key={groupName} className="dm-select-group">
                  <div className="dm-select-group-label">{groupName}</div>
                  {groupOptions.map((option) =>
                    renderOption(option, optionIndex++)
                  )}
                </div>
              )
            )}
          </>
        );
      }

      // Render flat options
      return filteredOptions.map((option, index) =>
        renderOption(option, index)
      );
    };

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label className="dm-select-label">
            {label}
            {required && <span className="dm-select-required">*</span>}
          </label>
        )}

        {/* Select Trigger */}
        <div className="dm-select-wrapper" ref={ref}>
          <button
            ref={triggerRef}
            type="button"
            className={triggerClasses}
            onClick={handleToggleDropdown}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            aria-haspopup="listbox"
            aria-expanded={internalState.isOpen}
            aria-required={required}
            aria-invalid={actualState === "error"}
          >
            {/* Left Icon */}
            {leftIcon && (
              <span className="dm-select-icon dm-select-icon-left">
                {leftIcon}
              </span>
            )}

            {/* Display Value */}
            <div className="dm-select-display">{renderDisplayValue()}</div>

            {/* Right Icons */}
            <div className="dm-select-icons">
              {clearable && internalState.selectedValues.length > 0 && (
                <button
                  type="button"
                  className="dm-select-clear"
                  onClick={handleClear}
                  aria-label="Cancella selezione"
                >
                  ✕
                </button>
              )}

              {rightIcon && (
                <span className="dm-select-icon dm-select-icon-right">
                  {rightIcon}
                </span>
              )}

              <span
                className={`dm-select-arrow ${
                  internalState.isOpen ? "dm-select-arrow-up" : ""
                }`}
              >
                ▼
              </span>
            </div>
          </button>

          {/* Dropdown */}
          {internalState.isOpen && (
            <div
              ref={dropdownRef}
              className={`dm-select-dropdown ${dropdownClassName}`}
              style={{
                maxHeight:
                  typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
              }}
              role="listbox"
              aria-multiselectable={multiple}
            >
              {/* Search Input */}
              {searchable && (
                <div className="dm-select-search">
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="dm-select-search-input"
                    placeholder={searchPlaceholder}
                    value={internalState.searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              )}

              {/* Options */}
              <div className="dm-select-options">{renderOptionsList()}</div>
            </div>
          )}
        </div>

        {/* Helper Text */}
        {(helperText || errorText) && (
          <p
            className={`dm-select-helper ${
              actualState === "error" ? "dm-select-error-text" : ""
            }`}
          >
            {errorText || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;

// Preset Select components for common D&D use cases
export const ClassSelect: React.FC<Omit<SelectProps, "options">> = (props) => {
  const classOptions: SelectOption[] = [
    { value: "barbarian", label: "Barbaro" },
    { value: "bard", label: "Bardo" },
    { value: "cleric", label: "Chierico" },
    { value: "druid", label: "Druido" },
    { value: "fighter", label: "Guerriero" },
    { value: "monk", label: "Monaco" },
    { value: "paladin", label: "Paladino" },
    { value: "ranger", label: "Ranger" },
    { value: "rogue", label: "Ladro" },
    { value: "sorcerer", label: "Stregone" },
    { value: "warlock", label: "Warlock" },
    { value: "wizard", label: "Mago" },
  ];

  return (
    <Select options={classOptions} placeholder="Seleziona classe" {...props} />
  );
};

export const RaceSelect: React.FC<Omit<SelectProps, "options">> = (props) => {
  const raceOptions: SelectOption[] = [
    { value: "human", label: "Umano", group: "Comuni" },
    { value: "elf", label: "Elfo", group: "Comuni" },
    { value: "dwarf", label: "Nano", group: "Comuni" },
    { value: "halfling", label: "Halfling", group: "Comuni" },
    { value: "dragonborn", label: "Draconico", group: "Esotiche" },
    { value: "gnome", label: "Gnomo", group: "Esotiche" },
    { value: "half-elf", label: "Mezzelfo", group: "Esotiche" },
    { value: "half-orc", label: "Mezzorco", group: "Esotiche" },
    { value: "tiefling", label: "Tiefling", group: "Esotiche" },
  ];

  return (
    <Select options={raceOptions} placeholder="Seleziona razza" {...props} />
  );
};

export const AlignmentSelect: React.FC<Omit<SelectProps, "options">> = (
  props
) => {
  const alignmentOptions: SelectOption[] = [
    { value: "lg", label: "Legale Buono", description: "Il Crociato" },
    { value: "ng", label: "Neutrale Buono", description: "Il Benefattore" },
    { value: "cg", label: "Caotico Buono", description: "Il Ribelle" },
    { value: "ln", label: "Legale Neutrale", description: "Il Giudice" },
    { value: "n", label: "Neutrale", description: "L'Indeciso" },
    { value: "cn", label: "Caotico Neutrale", description: "L'Spirito Libero" },
    { value: "le", label: "Legale Malvagio", description: "Il Dominatore" },
    { value: "ne", label: "Neutrale Malvagio", description: "Il Maligno" },
    { value: "ce", label: "Caotico Malvagio", description: "Il Distruttore" },
  ];

  return (
    <Select
      options={alignmentOptions}
      placeholder="Seleziona allineamento"
      {...props}
    />
  );
};

export const SizeSelect: React.FC<Omit<SelectProps, "options">> = (props) => {
  const sizeOptions: SelectOption[] = [
    { value: "tiny", label: "Minuscola" },
    { value: "small", label: "Piccola" },
    { value: "medium", label: "Media" },
    { value: "large", label: "Grande" },
    { value: "huge", label: "Enorme" },
    { value: "gargantuan", label: "Mastodontica" },
  ];

  return (
    <Select options={sizeOptions} placeholder="Seleziona taglia" {...props} />
  );
};

export const CreatureTypeSelect: React.FC<Omit<SelectProps, "options">> = (
  props
) => {
  const typeOptions: SelectOption[] = [
    { value: "aberration", label: "Aberrazione" },
    { value: "beast", label: "Bestia" },
    { value: "celestial", label: "Celestiale" },
    { value: "construct", label: "Costrutto" },
    { value: "dragon", label: "Drago" },
    { value: "elemental", label: "Elementale" },
    { value: "fey", label: "Fata" },
    { value: "fiend", label: "Immondo" },
    { value: "giant", label: "Gigante" },
    { value: "humanoid", label: "Umanoide" },
    { value: "monstrosity", label: "Mostruosità" },
    { value: "ooze", label: "Melma" },
    { value: "plant", label: "Pianta" },
    { value: "undead", label: "Non Morto" },
  ];

  return (
    <Select options={typeOptions} placeholder="Seleziona tipo" {...props} />
  );
};
