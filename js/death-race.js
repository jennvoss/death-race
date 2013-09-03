var Race = (function () {
'use strict';

    var items = {
        car: {
            element: document.createElement('div'),
            x: 100,
            y: 200,
            w: 24,
            h: 32,
            spriteX: 0, // x position of the background image
            speed: 200  // movement in pixels per second 
        },
        monster: {
            element: document.createElement('div'),
            w: 15,
            h: 24,
            speed: 100,
            caught: 0,
            directions: ['up', 'down', 'left', 'right'],
            movePath: 0
        },
        grave: {
            w: 15,
            h: 24
        }
    },
    module = {
        init: function (id) {
            this.scope = document.getElementById(id);
            this.WIDTH = 600;
            this.HEIGHT = 400;
            this.occupiedCoordinates = []; // occupied coordinates

            this.scope.appendChild(items.car.element);
            items.car.element.className = 'car';

            this.drawMonster();

            this.monstersCaught = document.getElementById('caught');
            this.monstersCaught.innerHTML = items.monster.caught;

            this.keysDown = {};
        },
        drawMonster: function() {
            var scope = this.scope,
                monster = items.monster;

            // Throw the monster somewhere on the screen randomly
            monster.x = Math.floor(Math.random() * (this.WIDTH - monster.w));
            monster.y = Math.floor(Math.random() * (this.HEIGHT - monster.h));
            
            scope.appendChild(monster.element);
            monster.element.className = 'monster';

            monster.element.style.left = monster.x + 'px';
            monster.element.style.top = monster.y + 'px';

        },
        drawGrave: function (x, y) {
            var scope = this.scope,
                grave = items.grave;

            grave.element = document.createElement('div');
            scope.appendChild(grave.element);
            grave.element.className = 'grave';

            grave.element.style.left = x + 'px';
            grave.element.style.top = y + 'px';

            this.occupiedCoordinates.push({x: x, y: y, w: grave.w, h: grave.h});
        },
        keyEvents: function () {
            var that = this;
            addEventListener('keydown', function (e) {
                that.keysDown[e.keyCode] = true;
            }, false);
            addEventListener('keyup', function (e) {
                delete that.keysDown[e.keyCode];
            }, false);
        },
        isCollision: function (a, b) {
            return !(
                ((a.y + a.h) < (b.y)) ||
                (a.y > (b.y + b.h)) ||
                ((a.x + a.w) < b.x) ||
                (a.x > (b.x + b.w))
            );
        },
        moveMonster: function(modifier) {
            var monster = items.monster,
                dir = monster.direction,
                maxTimes = 50;

            if (!dir || monster.movePath === maxTimes) {
                // if it's not defined, choose a direction
                dir = monster.direction = monster.directions[Math.floor(Math.random() * monster.directions.length)];
                monster.movePath = 0;
            }

            if (monster.y > 0 && dir === 'up') { // up
                monster.y -= monster.speed * modifier;
            }
            if (monster.y < (this.HEIGHT - monster.h) && dir === 'down') { // down
                monster.y += monster.speed * modifier;
            }
            if (monster.x < (this.WIDTH - monster.w) && dir === 'right') { // right
                monster.x += monster.speed * modifier;
            }
            if (monster.x > 0 && dir === 'left') { // left
               monster.x -= monster.speed * modifier;
            }

            monster.movePath++;
        },
        update: function (modifier) {
            var car = items.car,
                monster = items.monster,
                move = {
                    up: true,
                    down: true,
                    l: true,
                    r: true
                };

            function detectCollision(element) {
                var xPos = element.x,
                    yPos = element.y,
                    w = element.w,
                    h = element.h;

                if (!module.isCollision(element, car)) {
                    // no collision
                    return;
                }

                // drill down farther to see where the collision occurred
                if (car.y + car.h >= yPos && car.y <= (yPos + h)) {
                    // car is within the y coordinate zone of an object
                    if (car.x + car.w >= xPos && car.x + car.w <= xPos + w) {
                        move.r = false;
                    }
                    if (car.x <= (xPos + w) && car.x >= xPos) {
                        move.l = false;
                    }
                }

                if (car.x + car.w >= xPos && car.x <= (xPos + w)) {
                    // car is within the x coordinate zone of an object
                    if (car.y + car.h >= yPos && car.y + car.h <= yPos + h) {
                        move.down = false;
                    }
                    if (car.y <= (yPos + h) && car.y >= yPos) {
                        move.up = false;
                    }
                }
            }

            if (this.occupiedCoordinates.length) {
                this.occupiedCoordinates.forEach(detectCollision);
            }

            // move the car if any arrow keys are pressed
            if (this.keysDown.hasOwnProperty(38)) { // up
                car.spriteX = 0;
                car.w = 24;
                car.h = 32;
                if (car.y > 0 && move.up) {
                    car.y -= car.speed * modifier;
                }
            }
            if (this.keysDown.hasOwnProperty(40)) { // down
                car.spriteX = 40;
                car.w = 24;
                car.h = 32;
                if (car.y < (this.HEIGHT - car.h) && move.down) {
                    car.y += car.speed * modifier;
                }
            }
            if (this.keysDown.hasOwnProperty(37)) { // left
                car.spriteX = 80;
                car.w = 32;
                car.h = 24;
                if (car.x > 0 && move.l) {
                   car.x -= car.speed * modifier;
                }
            }
            if (this.keysDown.hasOwnProperty(39)) { // right
                car.spriteX = 120;
                car.w = 32;
                car.h = 24;
                if (car.x < (this.WIDTH - car.w) && move.r) {
                    car.x += car.speed * modifier;
                }
            }

            this.moveMonster(modifier);

            // Are they touching?
            if (this.isCollision(monster, car)) {
                ++monster.caught;
                monster.element.remove();
                this.drawGrave(monster.x, monster.y);

                // Score
                this.monstersCaught.innerHTML = monster.caught;

                this.drawMonster();
            }
        },
        render: function () {
            var car = items.car,
                monster = items.monster;

            car.element.style.width = car.w + 'px';
            car.element.style.height = car.h + 'px';
            car.element.style.left = car.x + 'px';
            car.element.style.top = car.y + 'px';
            car.element.style.backgroundPosition = -car.spriteX + 'px 0';

            monster.element.style.left = monster.x + 'px';
            monster.element.style.top = monster.y + 'px';
        },
        start: function () {
            var then = Date.now(),
                that = this;

            this.keyEvents();

            setInterval(function () {
                var now = Date.now();
                var delta = now - then;

                that.update(delta / 1000);
                that.render();

                then = now;
            }, 10);
        }
    };
    return module;
}());