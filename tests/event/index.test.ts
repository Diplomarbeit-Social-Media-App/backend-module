import dayjs from "dayjs";
import type { eventType } from "../../src/types/event-types";
import { eventSchema } from "../../src/schema/event-schema";

interface IBodyEventType {
  body: eventType;
}

const baseEvent: eventType = {
  description: "A very cool festival in Wels",
  endsAt: dayjs().add(1, "day").toDate(),
  startsAt: dayjs().toDate(),
  name: "Welser-Fest",
};

const buildBody = (values?: Partial<eventType>): IBodyEventType => {
  return { body: { ...baseEvent, ...values } };
};

test("if event schema fails if end date is earlier than start date", async () => {
  const event: IBodyEventType = buildBody({
    startsAt: dayjs().add(2, "day").toDate(),
  });
  const parsed = eventSchema.safeParse(event);
  expect(parsed.success).toBe(false);
  expect(parsed.error).toBeDefined();
});

test("if event schema fails if description is too short", async () => {
  const event: IBodyEventType = buildBody({
    description: "",
  });
  const parsed = eventSchema.safeParse(event);
  expect(parsed.success).toBe(false);
  expect(parsed.error).toBeDefined();
});

test("if event schema fails if name is too short", async () => {
  const event: IBodyEventType = buildBody({
    name: "",
  });
  const parsed = eventSchema.safeParse(event);
  expect(parsed.success).toBe(false);
  expect(parsed.error).toBeDefined();
});

test("if event schema fails is start date is earlier than now", async () => {
  const event: IBodyEventType = buildBody({
    startsAt: dayjs().subtract(5, "day").toDate(),
  });
  const parsed = eventSchema.safeParse(event);
  expect(parsed.success).toBe(false);
  expect(parsed.error).toBeDefined();
});

test("if event is parsed successfully", async () => {
  const event: IBodyEventType = buildBody();
  const parsed = eventSchema.safeParse(event);
  expect(parsed.success).toBe(true);
  expect(parsed.error).toBeFalsy();
  expect(parsed.data).toBeDefined();
});
