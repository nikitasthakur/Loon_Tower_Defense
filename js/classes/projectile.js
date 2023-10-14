class Projectile extends Sprite{
    constructor({ position = { x: 0, y: 0 }, loon }) {
        super({position, imageSrc: 'img/projectile.png'});
        this.velocity = {
            x: 0,
            y: 0
        }
        this.loon = loon;
        this.radius = 10;
    }

    update() {
        this.draw();

        const angle = Math.atan2(
            this.loon.center.y - this.position.y,
            this.loon.center.x - this.position.x
        );

        const power = 5;
        this.velocity.x = Math.cos(angle) * power;
        this.velocity.y = Math.sin(angle) * power;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}