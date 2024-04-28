import {PIXEL_THICKNESS, STAGE_HEIGHT, STAGE_WIDTH} from "./constants.ts";

export class Flame {
    public static readonly MINIMUM_TEMPERATURE = 900;
    private static readonly MINIMUM_TEMPERATURE_CHANGE = -2;
    private static readonly MAXIMUM_TEMPERATURE_CHANGE = 5;

    static maxTemperature: number = Flame.MINIMUM_TEMPERATURE;
    temperature: number = Flame.MINIMUM_TEMPERATURE;
    positionX: number;
    positionY: number;

    constructor() {
        const thickness = PIXEL_THICKNESS;
        this.positionX = Math.floor(Math.random() * (STAGE_WIDTH / thickness)) * thickness;
        this.positionY = Math.floor(Math.random() * (STAGE_HEIGHT / thickness)) * thickness;
    }

    public burn(): void {
        const change = Math.floor(Math.random() * (Flame.MAXIMUM_TEMPERATURE_CHANGE + 1)) + Flame.MINIMUM_TEMPERATURE_CHANGE;
        this.temperature += change;

        if(this.temperature > Flame.maxTemperature) {
            Flame.maxTemperature = this.temperature;
        }
    }

    public static getTemperatureColor(temperature: number): string {
        const dividend = Flame.maxTemperature - Flame.MINIMUM_TEMPERATURE;
        if(dividend === 0) {
            return 'hsl(0, 100%, 50%)';
        }

        const hue = 240 - 240 * (temperature - Flame.MINIMUM_TEMPERATURE) / (Flame.maxTemperature - Flame.MINIMUM_TEMPERATURE);
        return `hsl(${hue}, 100%, 50%)`;
    }
}