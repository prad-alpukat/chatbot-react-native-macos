#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MCPClient, NSObject)

RCT_EXTERN_METHOD(runCommand:(NSArray *)args
                  input:(NSString *)input
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
