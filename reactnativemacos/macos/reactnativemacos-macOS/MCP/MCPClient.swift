import Foundation
import UniformTypeIdentifiers
import React

@objc(MCPClient)
class MCPClient: NSObject {
    @objc func runCommand(_ args: [NSString], input: NSString, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        let process = Process()
        
        process.standardInput = Pipe()

        process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
        process.arguments = args as [String]
        let pipe = Pipe()
        process.standardOutput = pipe

        let inputPipe = Pipe()
        process.standardInput = inputPipe

        do {
            try process.run()

            if let inputData = (input as String).data(using: .utf8) {
                inputPipe.fileHandleForWriting.write(inputData)
            }
            inputPipe.fileHandleForWriting.closeFile()

            process.waitUntilExit()
        } catch {
            rejecter("COMMAND_EXECUTION_FAILED", "Failed to execute command", error)
            return
        }

        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        if let output = String(data: data, encoding: .utf8) {
            resolver(output.trimmingCharacters(in: .whitespacesAndNewlines))
        } else {
            rejecter("OUTPUT_CONVERSION_FAILED", "Failed to convert command output to string", nil)
        }
    }
}
