var inputTreeSize = document.getElementById("inputTreeSize");
var btnGenWorld = document.getElementById("btnGenWorld");


function resizeCanvas() {
    var parentWidth = canvas.parentElement.offsetWidth;
    canvas.width = parentWidth * 0.8;
    canvas.height = canvas.width * (canvas.offsetHeight / canvas.offsetWidth);
}

resizeCanvas();


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



function genWorld(treeSize){
      var canvas = document.getElementById("canvas");
      var ctx = canvas.getContext('2d');




      var retPixX = treeSize * 1.5;
      var retPixY = treeSize * 1.5;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (var x = treeSize/2; x < canvas.width - treeSize/2; x+=retPixX) {
            for(var y = treeSize/2; y < canvas.height - treeSize/2; y +=retPixY){
                  ctx.fillStyle = '#008616';
                  ctx.fillRect(x, y, treeSize, treeSize);
            }

      }

      console.log("W = " + canvas.width + " H = " + canvas.height);


      canvas.addEventListener('click', function(event) {

            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;

            x = x - 5;
            y = y - 5;

            ctx.fillStyle = '#ff3300';
            ctx.fillRect(x, y, 10, 10);

            console.log('x=' + x + ', y=' + y);




            let fire = new LSystem({  // rule
                axiom: 'F',
                //productions: {'F': 'FF+[+F-F-F]-[-F+F+F]'},
                productions: {'F': 'FF+[+F-F-F]-[-F+F+F]+F[+F]F[-F]F'},
            });

            var size = 10;

            var jj = 1;
            function drawNextStep() {
                  if (jj <= 8) {
                      var rule = fire.iterate(1);
                      draw(ctx, rule, size, x, y);
                      console.log(rule);
                      jj++;
                      setTimeout(drawNextStep, 1000);
                  }
              }

              drawNextStep();
      });
}




btnGenWorld.addEventListener('click',function(event){
      var treeSize = inputTreeSize.value;

      if (treeSize === "" || parseInt(treeSize) <= 0) {
          console.log('Error input <= 0');
          return;
      }


      if (isNaN(treeSize)) {
          console.log('Error NaN');
          return;
      }

      console.log('Tree size:', treeSize);
      genWorld(treeSize);
});
