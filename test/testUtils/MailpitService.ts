import dayjs from 'dayjs';
import {
  array as zodArray,
  boolean as zodBoolean,
  type infer as ZodInfer,
  number as zodNumber,
  object as zodObject,
  string as zodString,
  unknown as zodUnknown,
} from 'zod';

import { sleep } from '#shared/utils/utils';

const messageIdSchema = zodString().brand<'MessageId'>();
type MessageId = ZodInfer<typeof messageIdSchema>;

const recipientSchema = zodObject({ Name: zodString(), Address: zodString() });
const optionalRecipientArraySchema = zodArray(recipientSchema)
  .nullable()
  .transform((val) => val ?? []);

const messageSummarySchema = zodObject({
  ID: messageIdSchema,
  MessageID: zodString(),
  Read: zodBoolean(),
  From: recipientSchema,
  To: zodArray(recipientSchema),
  Cc: optionalRecipientArraySchema,
  Bcc: optionalRecipientArraySchema,
  ReplyTo: zodArray(recipientSchema),
  Subject: zodString(),
  Created: zodString(),
  Tags: zodArray(zodUnknown()),
  Size: zodNumber(),
  Attachments: zodNumber(),
  Snippet: zodString(),
});
type MessageSummary = ZodInfer<typeof messageSummarySchema>;

const messageSchema = zodObject({
  ID: messageIdSchema,
  MessageID: zodString(),
  From: recipientSchema,
  To: zodArray(recipientSchema),
  Cc: optionalRecipientArraySchema,
  Bcc: optionalRecipientArraySchema,
  ReplyTo: zodArray(recipientSchema),
  ReturnPath: zodString(),
  Subject: zodString(),
  ListUnsubscribe: zodObject({
    Header: zodString(),
    Links: zodUnknown(),
    Errors: zodString(),
    HeaderPost: zodString(),
  }),
  Date: zodString(),
  Tags: zodArray(zodUnknown()),
  Text: zodString(),
  HTML: zodString(),
  Size: zodNumber(),
  Inline: zodArray(zodUnknown()),
  Attachments: zodArray(zodUnknown()),
});

export class MailpitService {
  constructor(private readonly baseUrl: string) {}

  readonly getAllMessages = async () => {
    const response = await fetch(`${this.baseUrl}/api/v1/messages`);
    const body = zodObject({ messages: zodArray(messageSummarySchema) }).parse(
      await response.json(),
    );
    return body.messages;
  };

  readonly getMessage = async (id: MessageId) => {
    const response = await fetch(`${this.baseUrl}/api/v1/message/${id}`);
    return messageSchema.parse(await response.json());
  };

  readonly waitForEmail = async (
    filterMessage: (message: MessageSummary) => boolean,
    timeout: number = 5_000,
  ) => {
    const deadline = dayjs().add(timeout, 'millisecond');
    while (dayjs().isBefore(deadline)) {
      const messages = await this.getAllMessages();
      const filteredMessages = messages.filter(filterMessage);

      if (filteredMessages.length > 1)
        throw new Error('More than one email found');
      if (filteredMessages.length === 1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return await this.getMessage(filteredMessages[0]!.ID);
      }

      await sleep(200);
    }
    throw new Error('Timeout waiting for email');
  };
}
