import GameScene from "../gameScene";
import { LawnMowerControl, MachineGunTurretControl, OvenControl, PoolControl } from "./control";
import { Depth } from "./depth";
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
		this.image.setDepth(Depth.Weapon);
		this.image.setCircle(30, { isStatic: true });
		this.image.setCollisionCategory(scene.categoryTurret);
		this.image.angle = minAngleDegree;

		this.image.setCollidesWith([scene.categoryEnemy, scene.categoryLawnMower, scene.categoryPlayer, scene.categoryWall, scene.categoryTurret]);
	}


	fire(time: number, delta: number) {
		this.lastFiredTime = time;

		new Bullet(this.scene, this.image.x, this.image.y, this.image.angle);
	}
}

export class Oven extends Weapon {
	controller: OvenControl = null!;
	image: Phaser.Physics.Matter.Sprite;
	lastFiredTime: number = 0;
	aimRotation: number = 0;

	constructor(private scene: GameScene, x: number, y: number) {
		super();

		this.image = scene.matter.add.sprite(x, y, 'oven', 0);
		this.image.setDepth(Depth.Weapon);
		this.image.setRectangle(30, 30);
		this.image.setFixedRotation();
		this.image.setFriction(.8, .8, 1);
		this.image.setCollisionCategory(scene.categoryTurret);
		this.image.setCollidesWith([scene.categoryEnemy, scene.categoryLawnMower, scene.categoryPlayer, scene.categoryWall, scene.categoryBullet, scene.categoryTurret]);
	}

	fire(time: number, delta: number) {
		this.lastFiredTime = time;

		new OvenFire(this.scene, this.image.x, this.image.y, Phaser.Math.RadToDeg(this.aimRotation));
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
		this.image.setDepth(Depth.Weapon);
		this.image.setRectangle(40, 5);
		this.image.setCollisionCategory(scene.categoryBullet);
		this.image.setCollidesWith([scene.categoryEnemy, scene.categoryWall, scene.categoryPlayer, scene.categoryLawnMower]);
		this.image.angle = angle;
		let direction = Phaser.Math.Vector2.ONE.clone().rotate(Phaser.Math.DegToRad(angle - 45)).scale(50);
		//randomise a bit
		direction.rotate(Phaser.Math.DegToRad(Phaser.Math.Between(-2, 2)));
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

export class OvenFire extends DamageWeapon {
	image: Phaser.Physics.Matter.Image;
	body: MatterJS.BodyType;


	constructor(private scene: GameScene, x: number, y: number, angle: number) {
		super();

		this.image = scene.matter.add.image(x, y, 'ovenfire');
		this.image.setDepth(Depth.Weapon);
		this.image.setCircle(15, { restitution: 0.2 });
		this.image.setCollisionCategory(scene.categoryOvenFire);
		this.image.setCollidesWith([scene.categoryEnemy, scene.categoryWall, scene.categoryPlayer, scene.categoryLawnMower]);
		this.image.angle = angle;
		let direction = Phaser.Math.Vector2.ONE.clone().rotate(Phaser.Math.DegToRad(angle - 45)).scale(20);
		//randomise a bit
		direction.rotate(Phaser.Math.DegToRad(Phaser.Math.Between(-20, 20)));
		this.image.setVelocity(direction.x, direction.y);

		this.body = <MatterJS.BodyType>this.image.body;
		this.body.frictionAir = 0.1;
		this.body.friction = 0.1;

		this.body.onCollideCallback = (pair: MatterJS.IPair) => {
			//hit enemies
			this.hit((<any>pair.bodyA).enemy);
			this.hit((<any>pair.bodyB).enemy);
		};

		this.scene.time.addEvent({
			delay: 2000,
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
		this.image.setDepth(Depth.Weapon);
		this.image.setCircle(20);
		this.image.setCollisionCategory(scene.categoryLawnMower);
		this.image.setCollidesWith([scene.categoryEnemy, scene.categoryWall, scene.categoryPlayer, scene.categoryTurret, scene.categoryBullet, scene.categoryPool])
		//this.image.setDensity(0.0001);
		this.body = <MatterJS.BodyType>this.image.body;

		this.body.frictionAir = 0.05;
		this.body.friction = 0.05;
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


export class Pool extends DamageWeapon {

	controller: PoolControl | null = null;

	width = 180;
	height = 300;

	maxEnemiesInside = 10;
	enemiesInside = 0;
	lastTimeCleaned: number = 0;
	fullLabel: Phaser.GameObjects.Text;

	constructor(private scene: GameScene, x: number, y: number) {
		super();

		//Blocker for players
		this.scene.matter.add.rectangle(x, y, this.width, this.height, {
			isStatic: true,
			collisionFilter: {
				category: scene.categoryPool,
				mask: scene.categoryPlayer | scene.categoryLawnMower
			}
		});

		//Sensor for enemies
		let enemySensor = this.scene.matter.add.rectangle(x, y, this.width, this.height, {
			isSensor: true,
			isStatic: true,
			collisionFilter: {
				category: scene.categoryPool,
				mask: scene.categoryEnemy
			}
		});
		enemySensor.onCollideActiveCallback = (pair: MatterJS.IPair) => {

			this.hit((<any>pair.bodyA).enemy);
			this.hit((<any>pair.bodyB).enemy);
		}

		this.fullLabel = this.scene.add.text(x, y, 'Pool is full', { color: 'white', fontFamily: 'Hellovetica' })
			.setStroke('#000', 4)
			.setOrigin(0.5, 0.5).setDepth(Depth.UI);
		this.scene.tweens.add({
			loop: -1,
			targets: this.fullLabel,
			scale: 1.4,
			ease: 'sine.inOut',
			yoyo: true,
		});
		this.fullLabel.setVisible(false);


		//Probably need a fullness bar
	}
	hit(enemy: Enemy | undefined) {
		if (!enemy) return;

		if (this.enemiesInside < this.maxEnemiesInside) {
			this.enemiesInside++;
			enemy.receiveHitFromWeapon(this);

			if (this.enemiesInside == this.maxEnemiesInside) {
				this.fullLabel.setVisible(true);
			}
		}
	}

	decreaseEnemiesInside() {
		this.enemiesInside--;
		this.enemiesInside = Math.max(0, this.enemiesInside);
		this.fullLabel.setVisible(false);
	}
}