import esp from "espruino";
import board from "./../board.json";
if (!board.port) {
    throw new Error("[port] not set in Board.json");
}
process.on('SIGINT', () => {
    console.log("Caught interrupt signal");
    process.exit();
});
esp.init(() => {
    console.log("initialized");
    Espruino.Config.BAUD_RATE = (board.speed || 115200).toString();
    Espruino.Config.BLUETOOTH_LOW_ENERGY = false;
    process.stdin.setRawMode(true);
    Espruino.Core.Serial.startListening((data) => {
        const temp = String.fromCharCode.apply(null, new Uint8Array(data));
        process.stdout.write(temp);
    });
    Espruino.Core.Serial.open(board.port, (status) => {
        if (status === undefined) {
            console.error("can't connect");
            process.exit();
        }
        process.stdin.on("data", (chunk) => {
            console.log("data: " + chunk.toString());
            Espruino.Core.Serial.write(chunk.toString());
        });
        process.stdin.on("end", () => {
            console.error("stdin closed");
            process.exit();
        });
    }, () => {
        console.error("disconnected");
        process.exit();
    });
});
