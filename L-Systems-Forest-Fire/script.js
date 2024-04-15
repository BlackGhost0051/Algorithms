function resizeCanvas(canvas) {
    var parentWidth = canvas.parentElement.offsetWidth;
    canvas.width = parentWidth * 0.8;
    canvas.height = canvas.width * (canvas.offsetHeight / canvas.offsetWidth);
}

function draw(ctx, rule, size, startX, startY) {
    let angle = 0;
    let currX = startX;
    let currY = startY;
    let stack = [];
    console.log("currX = " + currX + " currY = " + currY + " stack = " + stack);

    for (let i = 0; i < rule.length; i++) {
        let currentChar = rule[i];
        switch (currentChar) {
            case 'F':
                let newX = currX + Math.cos(angle) * size;
                let newY = currY + Math.sin(angle) * size;
                if (newX >= 0 && newX <= ctx.canvas.width && newY >= 0 && newY <= ctx.canvas.height) {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(currX, currY, size, size);
                }
                currX = newX;
                currY = newY;
                break;
            case '+':
                angle += Math.PI / 3;
                break;
            case '-':
                angle -= Math.PI / 3;
                break;
            case '[':
                stack.push({ x: currX, y: currY, angle: angle });
                break;
            case ']':
                let state = stack.pop();
                currX = state.x;
                currY = state.y;
                angle = state.angle;
                break;
            default:
                break;
        }
    }

    return { currX: currX, currY: currY, angle: angle };
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const spreadProbabilityInput = document.getElementById('spreadProbability');
const resetButton = document.getElementById('resetButton');

const main = () => {
    resizeCanvas(canvas);

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        x = x - 5;
        y = y - 5;

        ctx.fillStyle = '#ff3300';
        ctx.fillRect(x, y, 10, 10);

        console.log('x=' + x + ', y=' + y);

        let fire = new LSystem({  // rule
            axiom: 'F',
        });

        const productions = [
            'FF+[+F-F-F]-[-F+F+F]+F[+F]F[-F]F',
            'F[+F]F[-F]+F',
            'F[-F][+F]F',
            'F[-F+F+F]+F[+F]F'
        ];

        const successors = [];

        productions.forEach((production) => {
            successors.push({
                weight: (spreadProbabilityInput.value * 100) / productions.length,
                successor: production
            });
        });

        console.log('successors', successors);

        fire.setProduction('F', {
            successors: successors
        });

        const size = 10;

        let jj = 1;
        function drawNextStep() {
            if (jj <= 5) {
                const rule = fire.iterate(1);
                draw(ctx, rule, size, x, y);
                console.log(rule);
                jj++;
                setTimeout(drawNextStep, 1000);
            }
        }

        drawNextStep();
    });

    resetButton.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}

main();
