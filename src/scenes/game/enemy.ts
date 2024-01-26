import GameScene from "../gameScene";

export class Enemy {
	image: Phaser.Physics.Matter.Image;
	body: MatterJS.BodyType;
	constructor(scene: GameScene, x: number, y: number) {
		this.image = scene.matter.add.image(x, y, 'enemy');

		this.image.setCircle(10);
		this.body = <MatterJS.BodyType>this.image.body;

		this.body.frictionAir = 0.8;
		this.body.friction = 0.8;
		this.body.restitution = 1;
	}

	update(time: number, delta: number): void {

		//if there is a player near, walk towards it

		//otherwise walk towards the center of the screen
		let force = new Phaser.Math.Vector2(1920 / 2, 1080 / 2).subtract({ x: this.image.x, y: this.image.y }).normalize().scale(0.0003);
		this.image.applyForce(force);
	}
}