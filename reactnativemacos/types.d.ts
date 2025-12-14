export type Message = {
  role: 'assistant' | 'user';
  id?: string;
  content:
    | string
    | {
        type: 'text' | 'tool_use' | 'tool_result';
        text?: string;
        content?: string;
        tool_use_id?: string;
        id?: string;
        name?: string;
        input?: Record<string, unknown>;
      }[];
};
