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
	particles: Phaser.GameObjects.Particles.ParticleEmitter;

	constructor(private scene: GameScene, x: number, y: number, public minAngleDegree: number, public maxAngleDegree: number) {
		super();

		this.image = scene.matter.add.image(x, y, 'turret_barrel');
		this.image.setDepth(Depth.Weapon);
		this.image.setCircle(20, { isStatic: true });
		this.image.setCollisionCategory(scene.categoryTurret);

		this.image.setOrigin(0, 0.5);
		this.image.angle = minAngleDegree;

		this.image.setCollidesWith([scene.categoryEnemy, scene.categoryLawnMower, scene.categoryPlayer, scene.categoryWall, scene.categoryTurret]);


		this.particles = this.scene.add.particles(undefined, undefined, 'flares',
			{
				frame: 'white',
				color: [0x040d61, 0xfacc22, 0xf89800, 0xf83600, 0x9f0404, 0x4b4a4f, 0x353438, 0x040404],
				lifespan: 500,
				angle: () => this.image.angle + (Math.random() * 40 - 20),//{ min: -100, max: -80 },
				scale: 0.2,
				speed: { min: 80, max: 150 },
				//advance: 2000,
				blendMode: 'ADD',
				emitting: false,
			});
		this.particles.setDepth(Depth.Particles);
	}


	fire(time: number, delta: number) {
		this.lastFiredTime = time;

		//this.particles.angle
		//this.particles.angle = this.image.angle - 90;
		let direction = Phaser.Math.Vector2.ONE.clone().rotate(Phaser.Math.DegToRad(this.image.angle - 45)).scale(40);
		this.particles.emitParticleAt(direction.x + this.image.x, direction.y + this.image.y, 10);
		//this.particles.emitParticleAt(5);

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

		//TODO: particles
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

		let direction = Phaser.Math.Vector2.ONE.clone().rotate(Phaser.Math.DegToRad(angle - 45));

		let directionOffset = direction.clone().scale(20);
		this.image = scene.matter.add.image(x + directionOffset.x, y + directionOffset.y, 'bullet');
		this.image.setDepth(Depth.Weapon);
		this.image.setRectangle(40, 5);
		this.image.setCollisionCategory(scene.categoryBullet);
		this.image.setCollidesWith([scene.categoryEnemy, scene.categoryWall, scene.categoryPlayer, scene.categoryLawnMower]);
		this.image.angle = angle;
		//randomise a bit
		direction.scale(60);
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
			let hit = this.hit((<any>pair.bodyA).enemy);
			hit ||= this.hit((<any>pair.bodyB).enemy);

			if (hit) {
				this.body.frictionAir = .2;
				this.body.friction = .2;
			}
		};

		this.scene.time.addEvent({
			delay: 2000,
			callback: () => {
				this.image.destroy();
			}
		});
	}

	private hit(enemy: Enemy | undefined): boolean {
		if (!enemy) return false;

		enemy.receiveHitFromWeapon(this);
		return true;
	}
}

export class LawnMower extends DamageWeapon {
	image: Phaser.Physics.Matter.Image;
	body: MatterJS.BodyType;

	controller: LawnMowerControl | null = null;

	densityDelay = 0;
	particles: Phaser.GameObjects.Particles.ParticleEmitter;

	constructor(private scene: GameScene, x: number, y: number) {
		super();

		this.image = scene.matter.add.sprite(x, y, 'mower');
		this.image.setDepth(Depth.Weapon);
		this.image.setCircle(20);
		this.image.setFixedRotation();
		this.image.setCollisionCategory(scene.categoryLawnMower);
		this.image.setCollidesWith([scene.categoryEnemy, scene.categoryWall, scene.categoryPlayer, scene.categoryTurret, scene.categoryBullet, scene.categoryPool])
		//this.image.setDensity(0.0001);
		this.body = <MatterJS.BodyType>this.image.body;

		this.body.frictionAir = 0.05;
		this.body.friction = 0.05;
		this.body.restitution = 1;

		this.particles = this.scene.add.particles(undefined, undefined, 'grass',
			{
				//color: [0x040d61, 0xfacc22, 0xf89800, 0xf83600, 0x9f0404, 0x4b4a4f, 0x353438, 0x040404],
				lifespan: 500,
				angle: { min: 0, max: 360 },
				scale: .3,
				speed: { min: 30, max: 80 },
				rotate: { min: 0, max: 360 },

				//advance: 2000,
				//blendMode: 'ADD',
				alpha: { start: 1, end: 0 },
				emitting: false,
			});
		this.particles.setDepth(Depth.GrassParticles);


		this.body.onCollideActiveCallback = (pair: MatterJS.IPair) => {
			//hit enemies
			if (this.controller!.playerUsingThis) {

				let hit = this.hit((<any>pair.bodyA).enemy);
				hit ||= this.hit((<any>pair.bodyB).enemy);

				//Make it heavy for a bit to slow you down
				if (hit) {
					console.log(this.body.density);
					this.image.setDensity(100000);
					this.densityDelay += 1;

					this.scene.time.delayedCall(300, () => {
						this.densityDelay--;
						if (this.densityDelay == 0) {
							this.image.setDensity(0.001); //default
						}
					})
				}
			}
		};
	}

	private hit(enemy: Enemy | undefined): boolean {
		if (!enemy) return false;

		enemy.receiveHitFromWeapon(this);
		return true;
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