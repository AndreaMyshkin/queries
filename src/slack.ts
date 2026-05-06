const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: SlackBlock[];
}

export interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
  fields?: { type: string; text: string }[];
}

export async function sendSlackMessage(message: SlackMessage): Promise<void> {
  if (!WEBHOOK_URL) {
    throw new Error("SLACK_WEBHOOK_URL environment variable is not set");
  }

  const payload = {
    channel: message.channel,
    text: message.text,
    blocks: message.blocks,
  };

  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack API error ${response.status}: ${body}`);
  }
}

export async function sendOrderAlert(
  channel: string,
  orderNumber: string,
  customerName: string,
  phone: string,
  daysPending: number,
): Promise<void> {
  await sendSlackMessage({
    channel,
    text: `Order ${orderNumber} has been pending for ${daysPending} days — follow up with ${customerName}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:warning: *Order ${orderNumber}* has been pending for *${daysPending} day${daysPending !== 1 ? "s" : ""}*`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Customer:*\n${customerName}` },
          { type: "mrkdwn", text: `*Phone:*\n${phone ?? "N/A"}` },
        ],
      },
    ],
  });
}
