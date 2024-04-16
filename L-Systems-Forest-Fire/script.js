const MINIMUM_FIRE_TEMPERATURE = 873;

const canvasWrapper = document.getElementById('canvasWrapper');
const app = new PIXI.Application();

const spreadProbabilityInput = document.getElementById('spreadProbability');
const resetButton = document.getElementById('resetButton');

const getLSystem = () => {
    const system = new LSystem({
        axiom: [
            {symbol: 'F', temperature: MINIMUM_FIRE_TEMPERATURE},
        ],
        productions: {
            'F': ({part, index}) => {
                part.temperature += 10;
                return [
                    {symbol: 'F', temperature: part.temperature},
                    {symbol: 'F', temperature: part.temperature},
                ];
            }
        }
    });

    return system;
}

const drawSystem = (output, clickEvent) => {
    console.log('output', output, clickEvent);

    output.forEach((symbol) => {
        const spread = symbol.temperature - MINIMUM_FIRE_TEMPERATURE;

        const graphics = new PIXI.Graphics();
        graphics.circle(clickEvent.offsetX, clickEvent.offsetY, spread, spread);
        graphics.fill(0xFF0000);
        app.stage.addChild(graphics);
    });
}

const main = async () => {
    await app.init({width: 640, height: 480});
    const canvas = canvasWrapper.appendChild(app.canvas);

    canvas.addEventListener('click', (event) => {
        const system = getLSystem();

        const MAX_ITERATIONS = 5;
        let currentIteration = 0;

        const timeoutFunction = () => {
            if (currentIteration < MAX_ITERATIONS) {
                system.iterate(1);
                drawSystem(system.getRaw(), event);

                currentIteration++;
                setTimeout(timeoutFunction, 1000);
            }
        }

        timeoutFunction();
    });
}

main();
