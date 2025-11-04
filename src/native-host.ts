import * as readline from "readline";

export function startNativeHost(onMessage: (msg: any) => void) {
    const rl = readline.createInterface({
       input: process.stdin,
       output: process.stdout,
    });

    rl.on("line", (data) => {
       try {
           const msg = JSON.parse(data);
           onMessage(msg);
       } catch (err) {
           console.error("Failed to parse message from stdin:", err);
       }
    });
}