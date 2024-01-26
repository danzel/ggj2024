import GameScene from "../gameScene";
import { LawnMowerControl, MachineGunTurretControl } from "./control";
import { Enemy } from "./enemy";

export abstract class Weapon {

}

export class MachineGunTurret extends Weapon {
	image: Phaser.Physics.Matter.Image;
	controller: MachineGunTurretControl | null = null;

	lastFiredTime = 0;

	constructor(private scene: GameScene, x: number, y: number, public minAngleDegree: number, public maxAngleDegree: number) {
		super();

		this.image = scene.matter.add.image(x, y, 'gunTurret');
		this.image.setCircle(30);
		this.image.setCollisionCategory(scene.categoryTurret);
		this.image.angle = minAngleDegree;

		this.image.setCollidesWith([scene.categoryEnemy, scene.categoryLawnMower, scene.categoryPlayer, scene.categoryWall]);
	}


	fire(time: number, delta: number) {
		this.lastFiredTime = time;

		new Bullet(this.scene, this.image.x, this.image.y, this.image.angle);
	}
}

//DamageWeapon means it damages enemies on collision with them
export abstract class DamageWeapon extends Weapon {

}

export class Bullet extends DamageWeapon {
	body: MatterJS.BodyType;
	image: Phaser.Physics.Matter.Image;

	constructor(private scene: GameScene, x: number, y: number, angle: number) {
		super();

		this.image = scene.matter.add.image(x, y, 'bullet');
		this.image.setCircle(5);
		this.image.setCollisionCategory(scene.categoryBullet);
		this.image.setCollidesWith([scene.categoryEnemy, scene.categoryWall, scene.categoryPlayer, scene.categoryLawnMower]);
		this.image.angle = angle;
		let direction = Phaser.Math.Vector2.ONE.clone().rotate(Phaser.Math.DegToRad(angle)).scale(30);
		this.image.setVelocity(direction.x, direction.y);

		this.body = <MatterJS.BodyType>this.image.body;
		this.body.frictionAir = 0.1;
		this.body.friction = 0.1;
		this.body.restitution = 1;

		this.body.onCollideCallback = (pair: MatterJS.IPair) => {
			//hit enemies
			this.hit((<any>pair.bodyA).enemy);
			this.hit((<any>pair.bodyB).enemy);

			this.image.destroy();
		};

		this.scene.time.addEvent({
			delay: 500,
			callback: () => {
				this.image.destroy();
			}
		});
	}

	private hit(enemy: Enemy | undefined) {
		if (!enemy) return;

		enemy.receiveHitFromWeapon(this);
	}
}

export class LawnMower extends DamageWeapon {
	image: Phaser.Physics.Matter.Image;
	body: MatterJS.BodyType;

	controller: LawnMowerControl | null = null;

	constructor(private scene: GameScene, x: number, y: number) {
		super();

		this.image = scene.matter.add.image(x, y, 'lawnmower');
		this.image.setCircle(20);
		this.image.setCollisionCategory(scene.categoryLawnMower);
		this.image.setCollidesWith([scene.categoryEnemy, scene.categoryWall, scene.categoryPlayer, scene.categoryTurret, scene.categoryBullet])
		//this.image.setDensity(0.0001);
		this.body = <MatterJS.BodyType>this.image.body;

		this.body.frictionAir = 0.03;
		this.body.friction = 0.03;
		this.body.restitution = 1;


		this.body.onCollideCallback = (pair: MatterJS.IPair) => {
			//hit enemies
			if (this.controller!.playerUsingThis) {
				this.hit((<any>pair.bodyA).enemy);
				this.hit((<any>pair.bodyB).enemy);
			}
		};
	}

	private hit(enemy: Enemy | undefined) {
		if (!enemy) return;

		enemy.receiveHitFromWeapon(this);
	}
}