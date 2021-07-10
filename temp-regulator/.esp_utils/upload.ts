import esp  from "espruino";
import board from "./../board.json";
import { join }  from "path";

declare var Espruino: any;

if (!board.port) {
    throw new Error("[port] not set in Board.json");
}

esp.init(() => {
    Espruino.Config.BAUD_RATE = (board.speed || 115200).toString();
    Espruino.Config.SAVE_ON_SEND = 1;
    Espruino.Config.BLUETOOTH_LOW_ENERGY = false;

    const t = new Date().getTime();

    esp.sendFile(board.port, board.file || join("dist", "output.js"), () => {
        console.log(`ok -> ${new Date().getTime() - t} ms.`);
    });
});
