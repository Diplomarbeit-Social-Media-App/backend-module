import { object, string } from 'zod';

export const chatMessageSchema = object({
  message: string({ message: 'Nachricht ungültig' }).min(
    1,
    'Nachricht zu kurz',
  ),
});

export const joinRoomSchema = object({});
