import { XMarkMini } from "@medusajs/icons"
import { FormEvent } from "react"
import { clx } from "@medusajs/ui"
import { useRouter } from "next/navigation"

import SearchBoxWrapper, {
  ControlledSearchBoxProps,
} from "../search-box-wrapper"

const ControlledSearchBox = ({
  inputRef,
  onChange,
  onReset,
  onSubmit,
  placeholder,
  value,
  isHomePage,
  ...props
}: ControlledSearchBoxProps & { isHomePage?: boolean }) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (onSubmit) {
      onSubmit(event)
    }

    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleReset = (event: FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    onReset(event)

    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div {...props} className="w-full">
      <form action="" noValidate onSubmit={handleSubmit} onReset={handleReset}>
        <div className="flex items-center justify-between">
          <input
            ref={inputRef}
            data-testid="search-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder={placeholder}
            spellCheck={false}
            type="search"
            value={value}
            onChange={onChange}
            className={clx(
              "txt-compact-large h-6 placeholder:transition-colors focus:outline-none flex-1 bg-transparent pl-2",
              isHomePage ? "text-white placeholder:text-white/40" : "text-black placeholder:text-black/40",
              "[&::-webkit-search-decoration]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
            )}
          />
          {value && (
            <button
              onClick={handleReset}
              type="button"
              className={clx(
                "items-center justify-center focus:outline-none gap-x-2 pr-4 pl-2 txt-compact-large flex transition-colors",
                isHomePage ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black"
              )}
            >
              <XMarkMini />
              <span className="text-[10px] font-medium hidden md:inline">
                cancel
              </span>
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

const SearchBox = ({ isHomePage }: { isHomePage?: boolean }) => {
  const router = useRouter()

  return (
    <SearchBoxWrapper>
      {(props) => {
        return (
          <>
            <ControlledSearchBox {...props} isHomePage={isHomePage} />
          </>
        )
      }}
    </SearchBoxWrapper>
  )
}

export default SearchBox
