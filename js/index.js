const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 768;

c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);


const placementTilesData2D = []

for (let i = 0; i < placementTilesData.length; i += 20) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 20))
}

const placementTiles = []
placementTilesData2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 14) {
            //Add building placment tile here
            placementTiles.push(new PlacementTile({
                position: {
                    x: x * 64,
                    y: y * 64
                }
            }))
        }
    })
})

const img = new Image();
img.onload = () => {
    animate()
}

img.src = 'img/TowerDefense.png';

const loons = []


function spawnLoons(spawnCount) {
    for (let i = 1; i < spawnCount + 1; i++) {
        const xOffSet = i * 150;
        loons.push(new Loon({
            position: { x: waypoints[0].x - xOffSet, y: waypoints[0].y }
        }));
    }
}


const buildings = []
let activeTile = undefined;
let loonCount = 3;
let hearts = 10;
let coins = 100;
const explosions = [];
spawnLoons(loonCount);

function animate() {
    const animationId = requestAnimationFrame(animate);
    c.drawImage(img, 0, 0);

    for (let i = loons.length - 1; i >= 0; i--) {
        const loon = loons[i];
        loon.update();
        if (loon.position.x > canvas.width) {
            hearts -= 1;
            loons.splice(i, 1);
            document.querySelector('#hearts').innerHTML = hearts;

            if (hearts === 0) {
                console.log("game over");
                window.cancelAnimationFrame(animationId);
                document.querySelector('#gameOver').style.display = 'flex';
            }
        }
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.draw();
        explosion.update();

        if (explosion.frames.current >= explosion.frames.max - 1){
            explosions.splice(i, 1);
        }
    }
    //tracking total enemies
    if (loons.length === 0) {
        loonCount += 2;
        spawnLoons(loonCount)
    }

    placementTiles.forEach(tile => {
        tile.update(mouse)
    })

    buildings.forEach((building) => {
        building.update();
        building.target = null;
        const validLoons = loons.filter(loon => {
            const xDifference = loon.center.x - building.center.x;
            const yDifference = loon.center.y - building.center.y;
            const distance = Math.hypot(xDifference, yDifference);
            return (distance < loon.radius + building.radius)
        })
        building.target = validLoons[0];

        for (let i = building.projectiles.length - 1; i >= 0; i--) {
            const projectile = building.projectiles[i];

            projectile.update();

            const xDifference = projectile.loon.center.x - projectile.position.x;
            const yDifference = projectile.loon.center.y - projectile.position.y;
            const distance = Math.hypot(xDifference, yDifference);

            //This is when a projectile hits a loon
            if (distance < projectile.loon.radius + projectile.radius) {

                //loon health and removal
                projectile.loon.health -= 20;
                if (projectile.loon.health <= 0) {
                    const loonIndex = loons.findIndex((loon) => {
                        return projectile.loon === loon
                    })
                    if (loonIndex > -1) {
                        loons.splice(loonIndex, 1);
                        coins += 25;
                        document.querySelector('#coins').innerHTML = coins;
                    }
                }

                explosions.push(
                    new Sprite({
                        position: { x: projectile.position.x, y: projectile.position.y },
                        imageSrc: './img/explosion.png',
                        frames: { max: 4 },
                        offset: { x: 0, y: 0 }
                    }))
                building.projectiles.splice(i, 1);
            }
        }
    })
}

const mouse = {
    x: undefined,
    y: undefined
};

canvas.addEventListener('click', (event) => {
    if (activeTile && !activeTile.occupied && (coins - 50 >= 0)) {
        coins -= 50;
        document.querySelector('#coins').innerHTML = coins;
        buildings.push(new Building({
            position: {
                x: activeTile.position.x,
                y: activeTile.position.y
            }
        }))
        activeTile.occupied = true
        buildings.sort((a, b) => {
            return a.position.y - b.position.y;
        })
    }
})

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    activeTile = null;

    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        if (mouse.x > tile.position.x &&
            mouse.x < tile.position.x + tile.size &&
            mouse.y > tile.position.y &&
            mouse.y < tile.position.y + tile.size) {
            activeTile = tile
            break
        }
    }
})