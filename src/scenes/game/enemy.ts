import GameScene from "../gameScene";
import { Depth } from "./depth";

export class Enemy {
	image: Phaser.Physics.Matter.Image;
	body: MatterJS.BodyType;

	animOffset = Math.random() * 1000;

	constructor(private scene: GameScene, x: number, y: number) {
		this.image = scene.matter.add.sprite(x, y, 'enemy', 0);
		this.image.setDepth(Depth.Enemy);
		this.image.setRectangle(18, 40);
		this.image.setOrigin(.5, .6);
		this.image.setFixedRotation();
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

		this.image.setFrame(Math.floor((this.animOffset + time) / 130) % 8);
		if (this.body.velocity.x < 0)
			this.image.setFlipX(true);
		else
			this.image.setFlipX(false);

		this.image.setDepth(Depth.Enemy + this.image.y / 1080);
	}

	receiveHitFromWeapon(weapon: any): void {
		this.image.destroy();
		this.scene.enemies.splice(this.scene.enemies.indexOf(this), 1);
	}
}