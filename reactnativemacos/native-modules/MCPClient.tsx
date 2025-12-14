import { NativeModules, Platform } from 'react-native';

interface MCPClientInterface {
    runCommand: (args: string[], input: string) => Promise<string>;
}

const NativeMCPClient =
    Platform.OS === 'macos'
        ? (NativeModules.MCPClient as MCPClientInterface)
        : null;

const MCPClientModule = {
    /**
     * Shows the native macOS color picker with the given initial color
     * @param initialColor - Initial color in hex format (e.g. #FF0000)
     * @returns Promise that resolves with the selected color in hex format, or rejects if canceled
     */
    runCommand: async (args: string[], input: string): Promise<string> => {
        if (!NativeMCPClient) {
            console.log('MCPClient is not supported on this platform');
            throw new Error('MCPClient is not supported on this platform');
        }

        return NativeMCPClient.runCommand(args, input);
    },
};

const server = {
    command: 'node',
    args: ['/Volumes/pradityaSSD/personal-project/personal-projects/rn-macos-ai-mcp/mcp-server/dist/index.js'],
};

let tools:
    | {
        name: string;
        description: string;
        inputSchema: any;
    }[]
    | undefined;

export async function getTools(): Promise<
    {
        name: string;
        description: string;
        inputSchema: any;
    }[]
> {
    if (tools) {
        return tools;
    }

    const cmdResult = await MCPClientModule.runCommand(
        [server.command, ...server.args],
        JSON.stringify({
            jsonrpc: '2.0',
            method: 'tools/list',
            params: {},
            id: 1,
        }) + '\n',
    );
    const { result } = JSON.parse(cmdResult);
    return result.tools!;
}

export const callTool = async (name: string, args: Record<string, unknown>) => {
    const cmdResult = await MCPClientModule.runCommand(
        [server.command, ...server.args],
        JSON.stringify({
            jsonrpc: '2.0',
            method: 'tools/call',
            params: {
                name,
                arguments: args,
                _meta: { progressToken: 1 },
            },
            id: 1,
        }) + '\n',
    );

    const { result } = JSON.parse(cmdResult);

    return JSON.parse(result.content[0].text);
};