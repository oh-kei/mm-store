import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@medusajs/ui"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="pt-32 pb-12">
      <div className="content-container" data-testid="cart-container">
    {cart?.items?.length ? (
      <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-40">
        <div className="flex flex-col bg-white py-6 gap-y-6">
          {!customer ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-xl font-bold mb-6">
                Please Sign in or Create an account to view the cart.
              </p>
              <LocalizedClientLink href="/account">
                <Button className="h-10" data-testid="sign-in-button">
                  Sign In / Create Account
                </Button>
              </LocalizedClientLink>
            </div>
          ) : (
            <ItemsTemplate items={cart?.items} />
          )}
        </div>
        <div className="relative">
          <div className="flex flex-col gap-y-8 sticky top-12">
            {customer && cart && cart.region && (
              <div className="bg-white py-6">
                <Summary cart={cart as any} />
              </div>
            )}
          </div>
        </div>
      </div>
    ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
