import { z } from "zod";

const noControlChars = (s: string) => !/[\u0000-\u001f\u007f]/.test(s);
const text = (max: number) => z.string().trim().min(1).max(max).refine(noControlChars, "invalid characters");

export const slugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{0,119}$/, "invalid slug");

/** Product search: letters/numbers/spaces and a few punctuation marks, max 60 chars. */
export const searchQuerySchema = z.object({
  q: z.string().trim().max(60).regex(/^[\p{L}\p{N}\s'&.,+-]*$/u, "invalid characters").optional(),
});

export const SHOPIFY_VARIANT_ID = /^gid:\/\/shopify\/ProductVariant\/\d{1,20}$/;

export const shopifyCheckoutSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            variantId: z.string().regex(SHOPIFY_VARIANT_ID, "invalid variant id"),
            quantity: z.number().int().min(1).max(99),
            source: z.literal("shopify"),
          })
          .passthrough() // the cart sends extra display fields (name, price...); they are ignored, never trusted
      )
      .min(1)
      .max(50),
  })
  .passthrough();

export const cjOrderSchema = z
  .object({
    orderNumber: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
    customer: z
      .object({
        name: text(100),
        phone: z.string().trim().regex(/^\+?[0-9 ()-]{6,20}$/),
        address: text(200),
        city: text(80),
        province: text(80),
        zip: z.string().trim().regex(/^[A-Za-z0-9 -]{3,12}$/),
        countryCode: z.string().regex(/^[A-Z]{2}$/),
      })
      .strict(),
    items: z
      .array(z.object({ vid: z.string().regex(/^[A-Za-z0-9-]{8,64}$/), quantity: z.number().int().min(1).max(99) }).strict())
      .min(1)
      .max(50),
  })
  .strict();

export type ShopifyCheckoutInput = z.infer<typeof shopifyCheckoutSchema>;
export type CjOrderBody = z.infer<typeof cjOrderSchema>;
