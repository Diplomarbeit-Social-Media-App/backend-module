import { array, object, string } from "zod";

const member = object({
  userName: string(),
});

export const createGroupSchema = object({
  body: object({
    name: string({
      errorMap: () => ({
        message: "Name muss zwischen 2 und 32 Zeichen haben",
      }),
    })
      .min(2)
      .max(32),
    description: string().nullable().default("Let's go partying gurrl!"),
    members: array(member).nullable(),
  }),
});
