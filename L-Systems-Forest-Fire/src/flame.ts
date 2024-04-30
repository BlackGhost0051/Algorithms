import {PIXEL_THICKNESS, STAGE_HEIGHT, STAGE_WIDTH} from "./constants.ts";

export class Flame {
    public static readonly MINIMUM_TEMPERATURE = 900;
    public static readonly MAXIMUM_TEMPERATURE = 1000;
    public static readonly MINIMUM_FUEL = 0.5;
    public static readonly MAXIMUM_FUEL = 1;
    private static readonly MINIMUM_TEMPERATURE_CHANGE = -2;
    private static readonly MAXIMUM_TEMPERATURE_CHANGE = 5;

    static maxTemperature: number = Flame.MINIMUM_TEMPERATURE;
    static windAngle: number = 0;

    temperature: number = Flame.MINIMUM_TEMPERATURE;
    positionX: number;
    positionY: number;
    fuel: number;
    dead: boolean = false;

    constructor() {
        const thickness = PIXEL_THICKNESS;
        this.positionX = Math.floor(Math.random() * (STAGE_WIDTH / thickness)) * thickness;
        this.positionY = Math.floor(Math.random() * (STAGE_HEIGHT / thickness)) * thickness;

        this.fuel = Math.random() * (Flame.MAXIMUM_FUEL - Flame.MINIMUM_FUEL) + Flame.MINIMUM_FUEL;
    }

    public static changeWindAngle(): void {
        if(Math.random() > 0.5) {
            Flame.windAngle = (Flame.windAngle % 360) + 1;
        }
        else {
            Flame.windAngle = (Flame.windAngle % 360) - 1;
        }
    }

    public burn(): void {
        if(this.fuel <= 0) {
            this.temperature--;
            return;
        }

        const fuelConsumption = 0.01 * (this.temperature - Flame.MINIMUM_TEMPERATURE) / (Flame.MAXIMUM_TEMPERATURE - Flame.MINIMUM_TEMPERATURE);
        this.fuel -= fuelConsumption;

        if(this.temperature <= Flame.MAXIMUM_TEMPERATURE) {
            const change = Math.floor(Math.random() * (Flame.MAXIMUM_TEMPERATURE_CHANGE + 1)) + Flame.MINIMUM_TEMPERATURE_CHANGE;
            this.temperature += change;

            if(this.temperature > Flame.maxTemperature) {
                Flame.maxTemperature = this.temperature;
            }
        }
    }

    public getFuelPercentage(): string {
        if(this.fuel <= 0) {
            return '0%';
        }

        return `${Math.floor(this.fuel * 100)}%`;
    }

    public getTemperatureColor(temperature: number): string {
        if(this.dead) {
            return 'hsl(0, 0%, 0%)';
        }

        const dividend = Flame.maxTemperature - Flame.MINIMUM_TEMPERATURE;
        if(dividend === 0) {
            return 'hsl(0, 100%, 50%)';
        }

        const hue = 240 - 240 * (temperature - Flame.MINIMUM_TEMPERATURE) / (Flame.maxTemperature - Flame.MINIMUM_TEMPERATURE);
        return `hsl(${hue}, 100%, 50%)`;
    }
}
