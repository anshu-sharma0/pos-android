import * as z from "zod";

export const hostFormSchema = z.object({
  firmName: z.string(),
  outletName: z.string(),
  address:  z.string(),
  taxId: z.string().nullable(),
  taxIdType: z.string().nullable(),
});

export const hostFormDefaultValues = {
  firmName: "",
  outletName: "",
  address: "",
  taxId: "",
  taxIdType: "",
};
