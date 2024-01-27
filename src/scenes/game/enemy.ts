import GameScene from "../gameScene";
import { Depth } from "./depth";
import { DamageWeapon, OvenFire } from "./weapons";

export class Enemy {
	image: Phaser.Physics.Matter.Image;
	body: MatterJS.BodyType;

	animOffset = Math.random() * 1000;

	isDestroyed = false;

	constructor(private scene: GameScene, x: number, y: number, private speed: number, private health: number) {

		let scale = 1 + health / 3;

		this.image = scene.matter.add.sprite(x, y, 'enemy', 0);
		this.image.setDepth(Depth.Enemy);
		this.image.setRectangle(18 * scale, 40 * scale);
		this.image.setOrigin(.5, .6);
		this.image.setFixedRotation();
		this.image.setCollisionCategory(scene.categoryEnemy);
		this.image.scale = scale;

		this.body = <MatterJS.BodyType>this.image.body;

		this.body.frictionAir = 0.8;
		this.body.friction = 0.8;
		this.body.restitution = 1;

		(<any>this.body).enemy = this;
	}

	update(time: number, delta: number): void {

		//if there is a player near, walk towards it

		//otherwise walk towards the center of the screen
		let force = new Phaser.Math.Vector2(1920 / 2, 1080 / 2).subtract({ x: this.image.x, y: this.image.y }).normalize().scale(this.speed);
		this.image.applyForce(force);

		this.image.setFrame(Math.floor((this.animOffset + time) / 130) % 8);
		if (this.body.velocity.x < -.02)
			this.image.setFlipX(true);
		else if (this.body.velocity.x > .02)
			this.image.setFlipX(false);

		this.image.setDepth(Depth.Enemy + this.image.y / 1080);
	}

	receiveHitFromWeapon(weapon: DamageWeapon): void {

		if (this.isDestroyed) {
			return;
		}
		this.health--;



		let color = 0x440000;
		if (!(weapon instanceof OvenFire)) {
			color = Phaser.Math.Between(0x660000, 0xbb0000) & 0xff0000;
		} else {
			color = Phaser.Math.Between(0x110000, 0x440000) & 0xff0000;

		}
		let blood = this.scene.add.sprite(this.image.x, this.image.y, 'blood', Phaser.Math.Between(0, 3))
			.setDepth(Depth.Background)
			.setOrigin(.5, .5)
			.setRotation(Math.random() * Math.PI * 2)
			.setAlpha(0)
			.setScale(0.2)
			.setTint(color);
		this.scene.tweens.add({
			targets: blood,
			duration: 200,
			scale: 1,
			alpha: 0.8
		});
		if (this.health == 0) {

			this.image.setCollidesWith([]);

			//this.image.destroy();
			this.scene.enemies.splice(this.scene.enemies.indexOf(this), 1);
			this.isDestroyed = true;

			this.scene.tweens.add({
				targets: this.image,
				alpha: 0,
				duration: 900,
				angle: 90,
				onComplete: () => { this.image.destroy(); }
			})
		}
	}
}