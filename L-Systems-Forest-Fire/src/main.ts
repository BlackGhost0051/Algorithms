import './style.css'
import * as PIXI from 'pixi.js'
import {PIXEL_THICKNESS, STAGE_HEIGHT, STAGE_WIDTH, ITERATION_TIMEOUT} from "./constants.ts";
import {Flame} from "./flame.ts";

const stageDiv = document.getElementById('stage')!;
const startButton = document.getElementById('startButton')!;
const stopButton = document.getElementById('stopButton')!;
const flamesList = document.getElementById('flamesList')!;
const windArrow = document.getElementById('windArrow')!;
const maxTemp = document.getElementById('maxTemp')!;

const app = new PIXI.Application();

const main = () => {
    const startingFlame = new Flame();
    startingFlame.temperature = Flame.MINIMUM_TEMPERATURE + 20;
    const flames = new Map<string, Flame>();
    flames.set(`${startingFlame.positionX},${startingFlame.positionY}`, startingFlame);

    // Set random wind direction
    Flame.windAngle = Math.floor(Math.random() * 360);

    let stop: boolean = false;

    const onIteration = () => {
        renderStage(flames);
        iterateFlames(flames);

        if(flames.size > 0 && !stop) {
            setTimeout(onIteration, ITERATION_TIMEOUT);
        }
    }

    startButton.addEventListener('click', () => {
        stop = false;
        onIteration();
    });

    stopButton.addEventListener('click', () => {
        stop = true;
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

const setArrowAngle = (angle: number) => {
    windArrow.style.transform = `rotate(${angle}deg)`;
}

const iterateFlames = (flames: Map<string, Flame>) => {
    // console.log("Current state", flames);

    flamesList.innerHTML = '';

    Flame.changeWindAngle();
    setArrowAngle(Flame.windAngle);

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

    maxTemp.innerText = Flame.maxTemperature.toString() + ' K';
}

const createFlameListItem = (flame: Flame) => {
    const listItem = document.createElement('li');
    listItem.innerText = `(${flame.positionX}, ${flame.positionY}) ${flame.temperature} K ${flame.getFuelPercentage()}`;
    return listItem;
}

const isTileFree = (flames: Map<string, Flame>, x: number, y: number): boolean => {
    return !flames.has(`${x},${y}`);
}

const getDirection = (windAngle: number): string => {
    let mainDirection: string;
    let centerAngle: number;

    if(windAngle >= 315 || windAngle < 45) {
        mainDirection = 'R';
        centerAngle = 0;
    }
    else if(windAngle >= 45 && windAngle < 135) {
        mainDirection = 'D';
        centerAngle = 90;
    }
    else if(windAngle >= 135 && windAngle < 225) {
        mainDirection = 'L';
        centerAngle = 180;
    }
    else {
        mainDirection = 'U';
        centerAngle = 270;
    }

    const directionsWithWeights = {};

    const deviation = windAngle - centerAngle;
    const deviationPercentage = deviation / 90;
    const leadingValue = 0.97;

    if(deviation > 0) {
        directionsWithWeights[getOppositeDirection(mainDirection)] = 1 - leadingValue;
        directionsWithWeights[mainDirection] = leadingValue - deviationPercentage;
        directionsWithWeights[getRightDirectionFrom(mainDirection)] = 1 - leadingValue + deviationPercentage;
        directionsWithWeights[getLeftDirectionFrom(mainDirection)] = 1 - leadingValue;
    }
    else if(deviation < 0) {
        directionsWithWeights[getOppositeDirection(mainDirection)] = 1 - leadingValue;
        directionsWithWeights[mainDirection] = leadingValue + deviationPercentage;
        directionsWithWeights[getRightDirectionFrom(mainDirection)] = 1 - leadingValue;
        directionsWithWeights[getLeftDirectionFrom(mainDirection)] = 1 - leadingValue - deviationPercentage;
    }
    else {
        directionsWithWeights[getOppositeDirection(mainDirection)] = 1 - leadingValue;
        directionsWithWeights[mainDirection] = leadingValue;
        directionsWithWeights[getRightDirectionFrom(mainDirection)] = 1 - leadingValue;
        directionsWithWeights[getLeftDirectionFrom(mainDirection)] = 1 - leadingValue;
    }

    // Sort the directions by weight
    const sortedDirections = Object.keys(directionsWithWeights).sort((a, b) => directionsWithWeights[a] - directionsWithWeights[b]);

    console.log('weights', sortedDirections, directionsWithWeights);

    // Pick a random direction based on the weights
    const random = Math.random();
    let sum = 0;

    for(let i = 0; i < sortedDirections.length; i++) {
        sum += directionsWithWeights[sortedDirections[i]];
        if(random <= sum) {
            return sortedDirections[i];
        }
    }
}

const getOppositeDirection = (direction: string): string => {
    switch(direction) {
        case 'U':
            return 'D';
        case 'D':
            return 'U';
        case 'L':
            return 'R';
        case 'R':
            return 'L';
    }
}

const getRightDirectionFrom = (direction: string): string => {
    switch(direction) {
        case 'U':
            return 'R';
        case 'D':
            return 'L';
        case 'L':
            return 'U';
        case 'R':
            return 'D';
    }
}

const getLeftDirectionFrom = (direction: string): string => {
    switch(direction) {
        case 'U':
            return 'L';
        case 'D':
            return 'R';
        case 'L':
            return 'D';
        case 'R':
            return 'U';
    }
}

const spreadFlame = (flames: Map<string, Flame>, flame: Flame): void => {
    const direction = getDirection(Flame.windAngle);

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
        return;
    }

    if(isTileFree(flames, newPositionX, newPositionY)) {
        const newFlame = new Flame();
        newFlame.positionX = newPositionX;
        newFlame.positionY = newPositionY;
        flames.set(`${newFlame.positionX},${newFlame.positionY}`, newFlame);
    }
}

app.init({width: STAGE_WIDTH, height: STAGE_HEIGHT}).then(main).catch(console.error);
