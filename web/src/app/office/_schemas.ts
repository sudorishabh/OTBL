import z from "zod";

export const addOfficeSchema = z.object({
  name: z.string().min(1, { message: "Office name is required." }),
  address: z.string().min(1, { message: "Office Address is required." }),
  state: z.string().min(1, { message: "Office State is required." }),
  city: z.string().min(1, { message: "Office City is required." }),
  pincode: z
    .string()
    .min(1, { message: "Office Pincode is required." })
    .max(10),
  contact_person: z
    .string()
    .min(1, { message: "Office Contact person is required." }),
  contact_number: z
    .string()
    .min(1, { message: "Contact number is required." })
    .max(15),
  email: z.email({ message: "Invalid email address." }),
});
