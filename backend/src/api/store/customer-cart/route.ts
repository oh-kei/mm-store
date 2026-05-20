import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const customerId = (req as any).auth_context?.actor_id;
    if (!customerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cartModuleService = req.scope.resolve(Modules.CART);
    
    // Retrieve all carts for this customer, ordered by creation date descending
    const carts = await cartModuleService.listCarts(
      { customer_id: customerId },
      {
        relations: ["items"],
        order: { created_at: "DESC" },
      }
    );

    // Find the latest cart that is not completed
    const activeCart = carts.find((c: any) => !c.completed_at) || null;

    return res.json({ cart: activeCart });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
