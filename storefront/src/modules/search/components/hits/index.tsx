import { clx } from "@medusajs/ui"
import React from "react"
import {
  UseHitsProps,
  useHits,
  useSearchBox,
} from "react-instantsearch-hooks-web"

import { ProductHit } from "../hit"
import ShowAll from "../show-all"

type HitsProps<THit> = React.ComponentProps<"div"> &
  UseHitsProps & {
    hitComponent: (props: { hit: THit }) => JSX.Element
    isDropdown?: boolean
  }

const Hits = ({
  hitComponent: Hit,
  className,
  isDropdown = false,
  ...props
}: HitsProps<ProductHit>) => {
  const { query } = useSearchBox()
  const { hits } = useHits(props)

  if (!query) {
    return null
  }

  return (
    <div
      className={clx(
        "transition-[height,max-height,opacity] duration-300 ease-in-out w-full mb-1 p-px",
        className,
        {
          "max-h-full opacity-100": !!query,
          "max-h-0 opacity-0": !query && !hits.length,
        }
      )}
    >
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4"
        data-testid="search-results"
      >
        {hits.map((hit, index) => (
          <li
            key={index}
            className={clx("list-none snap-start", {
              "hidden sm:block": !isDropdown && index > 2,
            })}
          >
            <Hit hit={hit as unknown as ProductHit} />
          </li>
        ))}
      </div>
    </div>
  )
}

export default Hits
