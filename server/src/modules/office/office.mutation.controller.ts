// import asyncHandler from "../../utils/async-handler";
// import { addOfficeSchema } from "./office.routes";
// import { OfficeTable } from "../../db/schema";
// import { z } from "zod";
// import { db } from "../../db";

// export const addOffice = async (
//   addOfficeSchema: z.infer<typeof addOfficeSchema>
// ) => {
//   const {
//     name,
//     address,
//     state,
//     city,
//     pincode,
//     contact_person,
//     contact_number,
//     email,
//   } = addOfficeSchema;
//   await db.insert(OfficeTable).values({
//     name,
//     address,
//     state,
//     city,
//     pincode,
//     contact_person,
//     contact_number,
//     email,
//   });
// };
