import GameScene from "../gameScene";
import { Depth } from "./depth";

export class Enemy {
	image: Phaser.Physics.Matter.Image;
	body: MatterJS.BodyType;
	constructor(private scene: GameScene, x: number, y: number) {
		this.image = scene.matter.add.image(x, y, 'enemy');
		this.image.setDepth(Depth.Enemy);
		this.image.setCircle(10);
		this.image.setCollisionCategory(scene.categoryEnemy);
		this.body = <MatterJS.BodyType>this.image.body;

		this.body.frictionAir = 0.8;
		this.body.friction = 0.8;
		this.body.restitution = 1;

		(<any>this.body).enemy = this;
	}

	update(time: number, delta: number): void {

		//if there is a player near, walk towards it

		//otherwise walk towards the center of the screen
		let force = new Phaser.Math.Vector2(1920 / 2, 1080 / 2).subtract({ x: this.image.x, y: this.image.y }).normalize().scale(0.0003);
		this.image.applyForce(force);
	}

	receiveHitFromWeapon(weapon: any): void {
		this.image.destroy();
		this.scene.enemies.splice(this.scene.enemies.indexOf(this), 1);
	}
}