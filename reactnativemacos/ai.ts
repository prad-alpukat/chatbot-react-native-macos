import {callTool, getTools} from './native-modules/MCPClient';

import {API_KEY} from './api-key';

import type {Message} from './types';

export async function runAI({
  messages,
}: {
  messages: Message[];
}): Promise<Message[]> {
  const toolList = await getTools();

  async function callAIWithTools(messagesToSend: Message[]): Promise<Message> {
    const messagesWithoutIds = messagesToSend.map(m => ({
      role: m.role,
      content: m.content,
    }));
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 4096,
        messages: messagesWithoutIds,
        tools: toolList.map(t => ({
          name: t.name,
          description: t.description,
          input_schema: t.inputSchema,
        })),
      }),
    });
    return (await response.json()) as Message;
  }

  async function callAI(messagesToSend: Message[]): Promise<Message[]> {
    const newMessages: Message[] = [...messagesToSend];

    let calls = 0;
    let finished = false;
    do {
      const message = await callAIWithTools(newMessages);
      newMessages.push(message);

      const content = message.content;
      if (
        Array.isArray(content) &&
        content[content.length - 1].type === 'tool_use'
      ) {
        const toolUse = {...content[content.length - 1]};
        const output = await callTool(toolUse.name!, toolUse.input!);
        newMessages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify(output),
            },
          ],
        });
      } else {
        finished = true;
      }

      calls++;
    } while (!finished && calls < 10);

    return newMessages;
  }

  try {
    return await callAI(messages);
  } catch (error) {
    return [
      ...messages,
      {
        role: 'assistant',
        content: `Error: ${error}`,
        id: Math.random().toString(),
      },
    ];
  }
}
