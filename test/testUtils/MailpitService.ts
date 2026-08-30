import dayjs from 'dayjs';
import type { EntityId } from '#shared/types/ddd';
import { sleep } from '#shared/utils/utils';

type Recipient = {
  Name: string;
  Address: string;
};

type MessageId = EntityId<'MailpitMessage'>;

type MessageSummary = {
  ID: MessageId;
  MessageID: string;
  Read: boolean;
  From: Recipient;
  To: Recipient[];
  Cc: Recipient[];
  Bcc: Recipient[];
  ReplyTo: Recipient[];
  Subject: string;
  Created: string;
  Tags: unknown[];
  Size: number;
  Attachments: number;
  Snippet: string;
};

type Message = {
  ID: MessageId;
  MessageID: string;
  From: Recipient;
  To: Recipient[];
  Cc: Recipient[];
  Bcc: Recipient[];
  ReplyTo: Recipient[];
  ReturnPath: string;
  Subject: string;
  ListUnsubscribe: {
    Header: string;
    Links: unknown;
    Errors: string;
    HeaderPost: string;
  };
  Date: string;
  Tags: unknown[];
  Text: string;
  HTML: string;
  Size: number;
  Inline: unknown[];
  Attachments: unknown[];
};

export class MailpitService {
  constructor(private readonly baseUrl: string) {}

  readonly getAllMessages = async () => {
    const response = await fetch(`${this.baseUrl}/api/v1/messages`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return (await response.json()).messages as MessageSummary[];
  };

  readonly getMessage = async (id: MessageId) => {
    const response = await fetch(`${this.baseUrl}/api/v1/message/${id}`);
    return (await response.json()) as Message;
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
