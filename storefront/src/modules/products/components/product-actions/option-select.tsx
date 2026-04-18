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

  const filteredOptions = option.values?.map((v) => v.value)
  if (isColor) {
    filteredOptions?.sort((a, b) => (a || "").localeCompare(b || ""))
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
      yellow: "#F59E0B",
    }
    return map[colorName.toLowerCase()] || "#E5E7EB"
  }

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
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
                  "h-8 w-8 rounded-full border-2 transition-all duration-200",
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
