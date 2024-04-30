import './style.css'
import * as PIXI from 'pixi.js'
import {PIXEL_THICKNESS, STAGE_HEIGHT, STAGE_WIDTH} from "./constants.ts";
import {Flame} from "./flame.ts";

const stageDiv = document.getElementById('stage')!;
const startButton = document.getElementById('startButton')!;
const stopButton = document.getElementById('stopButton')!;
const resetButton = document.getElementById('resetButton')!;
const flamesList = document.getElementById('flamesList')!;

const app = new PIXI.Application();

const main = () => {
    const startingFlame = new Flame();
    startingFlame.temperature = Flame.MINIMUM_TEMPERATURE + 20;
    const flames = new Map<string, Flame>();
    flames.set(`${startingFlame.positionX},${startingFlame.positionY}`, startingFlame);

    let stop: boolean = false;

    const onIteration = () => {
        renderStage(flames);
        iterateFlames(flames);

        if(flames.size > 0 && !stop) {
            setTimeout(onIteration, 100);
        }
    }

    startButton.addEventListener('click', () => {
        stop = false;
        onIteration();
    });

    stopButton.addEventListener('click', () => {
        stop = true;
    });

    resetButton.addEventListener('click', () => {
        stop = true;
        flames.clear();
        const startingFlame = new Flame();
        flames.set(`${startingFlame.positionX},${startingFlame.positionY}`, startingFlame);
        flamesList.innerHTML = '';
        app.stage.removeChildren();
        Flame.maxTemperature = Flame.MINIMUM_TEMPERATURE;
    });

    stageDiv.appendChild(app.canvas);
}

const renderStage = (flames: Map<string, Flame>) => {
    app.stage.removeChildren();

    flames.forEach(flame => {
        const graphics = new PIXI.Graphics();
        graphics.rect(flame.positionX, flame.positionY, PIXEL_THICKNESS, PIXEL_THICKNESS);
        graphics.fill(flame.getTemperatureColor(flame.temperature));
        app.stage.addChild(graphics);
    })
}

const iterateFlames = (flames: Map<string, Flame>) => {
    // console.log("Current state", flames);

    flamesList.innerHTML = '';

    flames.forEach(flame => {
        if(flame.temperature < Flame.MINIMUM_TEMPERATURE) {
            if(flame.fuel <= 0) {
                flame.dead = true;
            }
            else {
                flames.delete(`${flame.positionX},${flame.positionY}`);
            }
        }
        else {
            flame.burn();

            flamesList.appendChild(createFlameListItem(flame));

            const spreadProbability = Math.min(1, (flame.temperature - Flame.MINIMUM_TEMPERATURE) / 100);
            if(Math.random() < spreadProbability) {
                spreadFlame(flames, flame);
            }
        }
    });
}

const createFlameListItem = (flame: Flame) => {
    const listItem = document.createElement('li');
    listItem.innerText = `(${flame.positionX}, ${flame.positionY}) ${flame.temperature} K ${flame.getFuelPercentage()}`;
    return listItem;
}

const isTileFree = (flames: Map<string, Flame>, x: number, y: number): boolean => {
    return !flames.has(`${x},${y}`);
}

const spreadFlame = (flames: Map<string, Flame>, flame: Flame): void => {
    const tryDirections = ['U', 'D', 'L', 'R'];
    tryDirections.sort(() => Math.random() - 0.5);

    for(const direction of tryDirections) {
        let newPositionX = flame.positionX;
        let newPositionY = flame.positionY;

        switch(direction) {
            case 'U':
                newPositionY -= PIXEL_THICKNESS;
                break;
            case 'D':
                newPositionY += PIXEL_THICKNESS
                break;
            case 'L':
                newPositionX -= PIXEL_THICKNESS
                break;
            case 'R':
                newPositionX += PIXEL_THICKNESS;
                break;
        }

        if(newPositionX < 0 || newPositionX >= STAGE_WIDTH || newPositionY < 0 || newPositionY >= STAGE_HEIGHT) {
            continue;
        }

        if(isTileFree(flames, newPositionX, newPositionY)) {
            const newFlame = new Flame();
            newFlame.positionX = newPositionX;
            newFlame.positionY = newPositionY;
            flames.set(`${newFlame.positionX},${newFlame.positionY}`, newFlame);
            return
        }
    }
}

app.init({width: STAGE_WIDTH, height: STAGE_HEIGHT}).then(main).catch(console.error);
