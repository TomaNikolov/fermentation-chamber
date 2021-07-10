const ow = new OneWire(NodeMCU.D6);

const sensor = (require("DS18B20") as any).connect(ow);

I2C1.setup({ scl: NodeMCU.D1, sda: NodeMCU.D2 });
const lcd = require("HD44780").connectI2C(I2C1);

const button = NodeMCU.D8;
const relayOne = NodeMCU.D7;
const relayTwo = NodeMCU.D4;
const relays = [relayOne, relayTwo];
const relayOn = 0;
const relayOff = 1;

const margin = 0.2;
const maxThreshold = 35;
const minThreshold = 0;

let threshold = 28;

let shouldStartCooler = false;
let coolerOn = false;

digitalWrite(NodeMCU.D5, 1);

const hystThresh = (current) => {
    if (current >= threshold + margin) {
        shouldStartCooler = true;
    } else if (current <= threshold - margin) {
        shouldStartCooler = false;
    }
};

const printCurrentState = (temp) => {
    lcd.clear()
    const coolerState = coolerOn ? "running" : "stopped";
    lcd.setCursor(4, 0)
    lcd.print(temp + "°C ");
    lcd.setCursor(0, 1)
    lcd.print(`Cooler ${coolerState}`);
}

const setRelaysState = (state: number) => {
    relays.forEach(relay => digitalWrite(relay, state));
}

setInterval(() => {
    sensor.getTemp((temp) => {
        console.log("Temp is " + temp + "°C");
        hystThresh(temp);

        if (shouldStartCooler && !coolerOn) {
            console.log("start cooler");
            setRelaysState(relayOn)
            coolerOn = true;
        } else if (!shouldStartCooler && coolerOn) {
            console.log("stop cooler");
            setRelaysState(relayOff)
            coolerOn = false;
        }

        printCurrentState(temp);
    });
}, 5000);

setWatch((e) =>  {
    threshold += 1;
    if(threshold > maxThreshold) {
        threshold = 0;
    }

    const message = `Threshold: ${threshold} °C `;
    lcd.clear()
    lcd.setCursor(0, 0)
    lcd.print(message);
    console.log(message);
  }, button, { repeat: true, edge: 'rising', debounce: 50 });
