import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

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
            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <SignInPrompt />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-6 max-w-[250px]">
                Authentication required to view and manage your shopping bag.
              </p>
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
