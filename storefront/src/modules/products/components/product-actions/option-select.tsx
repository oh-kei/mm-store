import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  onMouseEnter?: (title: string, value: string) => void
  onMouseLeave?: () => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  onMouseEnter,
  onMouseLeave,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const isColor = title.toLowerCase().includes("color") || title.toLowerCase().includes("colour")
  const isSize = title.toLowerCase().includes("size")

  const filteredOptions = option.values?.map((v) => v.value)
  if (isColor) {
    const colorOrder = ["navy", "gray", "grey"];
    filteredOptions?.sort((a, b) => {
      const aLower = (a || "").toLowerCase();
      const bLower = (b || "").toLowerCase();
      
      const aIdx = colorOrder.indexOf(aLower);
      const bIdx = colorOrder.indexOf(bLower);
      
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      
      return aLower.localeCompare(bLower);
    });
  } else if (isSize) {
    const sizeOrder: Record<string, number> = {
      "xxs": 1,
      "xs": 2,
      "s": 3,
      "small": 3,
      "m": 4,
      "medium": 4,
      "l": 5,
      "large": 5,
      "xl": 6,
      "xxl": 7,
      "2xl": 7,
      "xxxl": 8,
      "3xl": 8,
      "xxxxl": 9,
      "4xl": 9,
    };
    
    filteredOptions?.sort((a, b) => {
      const aLower = (a || "").toLowerCase();
      const bLower = (b || "").toLowerCase();
      
      const aVal = sizeOrder[aLower];
      const bVal = sizeOrder[bLower];
      
      if (aVal !== undefined && bVal !== undefined) return aVal - bVal;
      if (aVal !== undefined) return -1;
      if (bVal !== undefined) return 1;

      // Handle numbers (like shoe sizes "9", "9.5", "10")
      const aNum = parseFloat(aLower);
      const bNum = parseFloat(bLower);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      
      return aLower.localeCompare(bLower);
    });
  }

  const getColorHex = (colorName: string) => {
    const map: Record<string, string> = {
      black: "#000000",
      white: "#FFFFFF",
      navy: "#1E3A8A",
      grey: "#4B5563",
      gray: "#4B5563",
      blue: "#3B82F6",
      red: "#EF4444",
      green: "#10B981",
      yellow: "#FFD700",
      cyan: "#06B6D4",
      "light green": "#86EFAC",
      lightgreen: "#86EFAC",
      "light blue": "#ADD8E6",
      lightblue: "#ADD8E6",
      "dark blue": "#1E3A8A",
      orange: "#F97316",
      "cool blue": "#60A5FA",
      "khaki": "#C3B091",
      "dark green": "#064E3B",
      "red black": "linear-gradient(135deg, #EF4444 50%, #000000 50%)",
      "blue black": "linear-gradient(135deg, #3B82F6 50%, #000000 50%)",
      "red/black": "linear-gradient(135deg, #EF4444 50%, #000000 50%)",
      "blue/black": "linear-gradient(135deg, #3B82F6 50%, #000000 50%)",
      purple: "#581C87",
    }
    return map[colorName.toLowerCase()] || "#E5E7EB"
  }

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-medium text-gray-400">
        Select {title.toLowerCase() === "color" ? "Colour" : title}
      </span>
      <div
        className="flex flex-wrap gap-3"
        data-testid={dataTestId}
      >
        {filteredOptions?.map((v) => {
          if (!v) return null;
          
          if (isColor) {
            /* COLOR CIRCLES CONFIGURATION: Change h-10 w-10 to adjust circle size. */
            return (
              <button
                onClick={() => updateOption(option.title ?? "", v)}
                onMouseEnter={() => onMouseEnter?.(option.title ?? "", v)}
                onMouseLeave={() => onMouseLeave?.()}
                key={v}
                title={v}
                className={clx(
                  "h-12 w-12 md:h-8 md:w-8 rounded-full border-2 transition-all duration-200",
                  {
                    "border-maritime-navy scale-110 shadow-md": v === current,
                    "border-transparent hover:border-gray-300": v !== current,
                  }
                )}
                disabled={disabled}
              >
                <div 
                  className="w-full h-full rounded-full border border-black/10" 
                  style={{ backgroundColor: getColorHex(v) }}
                />
              </button>
            )
          }

          return (
            <button
              onClick={() => updateOption(option.title ?? "", v)}
              onMouseEnter={() => onMouseEnter?.(option.title ?? "", v)}
              onMouseLeave={() => onMouseLeave?.()}
              key={v}
              className={clx(
                "border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded px-4 min-w-[3rem] transition-all",
                {
                  "border-ui-border-interactive bg-white shadow-sm ring-1 ring-ui-border-interactive": v === current,
                  "hover:shadow-elevation-card-rest": v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
