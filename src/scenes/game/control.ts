import GameScene from "../gameScene";
import { Player } from "./player";
import { LawnMower, MachineGunTurret, Oven, Pool } from "./weapons";

export abstract class Control {
	sensor: MatterJS.BodyType;

	playerUsingThis: Player | null = null;

	constructor(protected scene: GameScene, x: number, y: number, w: number, h: number | undefined) {

		if (h === undefined) {
			this.sensor = scene.matter.add.circle(x, y, w, {
				isSensor: true,
				//isStatic: true,
				collisionFilter: {
					category: scene.categoryControlSensor,
					mask: scene.categoryPlayer
				}
			});
		}
		else {
			this.sensor = scene.matter.add.rectangle(x, y, w, h, {
				isSensor: true,
				isStatic: true,
				collisionFilter: {
					category: scene.categoryControlSensor,
					mask: scene.categoryPlayer
				}
			});
		}

		//record who is on top of this control
		this.sensor.onCollideCallback = (pair: MatterJS.IPair) => {
			if (scene.playerByBody.has(<any>pair.bodyA)) {
				scene.playerByBody.get(<any>pair.bodyA)!.onControl = this;
			}
			else if (scene.playerByBody.has(<any>pair.bodyB)) {
				scene.playerByBody.get(<any>pair.bodyB)!.onControl = this;
			}
		}
		this.sensor.onCollideEndCallback = (pair: MatterJS.IPair) => {
			if (scene.playerByBody.has(<any>pair.bodyA)) {
				scene.playerByBody.get(<any>pair.bodyA)!.onControl = null;
			}
			else if (scene.playerByBody.has(<any>pair.bodyB)) {
				scene.playerByBody.get(<any>pair.bodyB)!.onControl = null;
			}
		}
	}

	abstract update(time: number, delta: number): void;
}

const amountToIncrease = 0.3;
export class Toilet extends Control {
	constructor(scene: GameScene, x: number, y: number, w: number, h: number) {
		super(scene, x, y, w, h);
	}

	update(time: number, delta: number): void {
		if (this.playerUsingThis) {
			this.playerUsingThis.toilet.value = Math.min(1, this.playerUsingThis.toilet.value + amountToIncrease * delta / 1000);
		}
	}
}

export class Bed extends Control {
	constructor(scene: GameScene, x: number, y: number, w: number, h: number) {
		super(scene, x, y, w, h);
	}

	update(time: number, delta: number): void {
		if (this.playerUsingThis) {
			this.playerUsingThis.energy.value = Math.min(1, this.playerUsingThis.energy.value + amountToIncrease * delta / 1000);
		}
	}
}

export class Kitchen extends Control {
	constructor(scene: GameScene, x: number, y: number, w: number, h: number) {
		super(scene, x, y, w, h);
	}

	update(time: number, delta: number): void {
		if (this.playerUsingThis) {
			this.playerUsingThis.antiHunger.value = Math.min(1, this.playerUsingThis.antiHunger.value + amountToIncrease * delta / 1000);
		}
	}
}

export class TV extends Control {
	constructor(scene: GameScene, x: number, y: number, w: number, h: number) {
		super(scene, x, y, w, h);
	}

	update(time: number, delta: number): void {
		if (this.playerUsingThis) {
			this.playerUsingThis.fun.value = Math.min(1, this.playerUsingThis.fun.value + amountToIncrease * delta / 1000);
		}
	}
}



export abstract class WeaponControl extends Control {

	constructor(scene: GameScene, x: number, y: number, w: number, h: number | undefined) {
		super(scene, x, y, w, h);
	}

	abstract receiveInput(gamepad: Phaser.Input.Gamepad.Gamepad, time: number, delta: number): void;
}

export class LawnMowerControl extends WeaponControl {
	constructor(scene: GameScene, x: number, y: number, w: number, h: number, public lawnMower: LawnMower) {
		super(scene, x, y, w, h);
		lawnMower.controller = this;
	}

	receiveInput(p: Phaser.Input.Gamepad.Gamepad, time: number, delta: number): void {
		let controllerAngle = new Phaser.Math.Vector2(p.axes[0].getValue(), p.axes[1].getValue());
		this.lawnMower.image.applyForce(controllerAngle.clone().scale(0.0007));
	}

	update(time: number, delta: number): void {
		//todo if a player is controlling, put out some smoke particles
	}
}

export class MachineGunTurretControl extends WeaponControl {
	constructor(scene: GameScene, x: number, y: number, w: number, h: number, public turret: MachineGunTurret) {
		super(scene, x, y, w, h);
		turret.controller = this;
	}

	receiveInput(p: Phaser.Input.Gamepad.Gamepad, time: number, delta: number): void {
		let x = p.axes[0].getValue();
		if (x > 0.1 || x < -0.1) {
			let rotation = delta / 1000 * 40 * x;

			if (this.turret.minAngleDegree < this.turret.maxAngleDegree) {
				this.turret.image.angle = Phaser.Math.Clamp(this.turret.image.angle + rotation, this.turret.minAngleDegree, this.turret.maxAngleDegree);
			} else {
				this.turret.image.angle = this.turret.image.angle + rotation;

				if (this.turret.image.angle > 0 && this.turret.image.angle < this.turret.minAngleDegree) {
					this.turret.image.angle = this.turret.minAngleDegree;
				}
				if (this.turret.image.angle < 0 && this.turret.image.angle > this.turret.maxAngleDegree) {
					this.turret.image.angle = this.turret.maxAngleDegree;
				}
			}
		}

		if (p.B && time - this.turret.lastFiredTime > 333) {
			this.turret.fire(time, delta);
		}
	}

	update(time: number, delta: number): void {
	}
}

export class OvenControl extends WeaponControl {
	constructor(scene: GameScene, x: number, y: number, r: number, public oven: Oven) {
		super(scene, x, y, r, undefined);
		oven.controller = this;

		this.update(0, 0);
	}

	receiveInput(p: Phaser.Input.Gamepad.Gamepad, time: number, delta: number): void {
		if (p.B && time - this.oven.lastFiredTime > 100) {
			this.oven.fire(time, delta);
		}

		if (!p.B) {
			//Move it
			let controllerAngle = new Phaser.Math.Vector2(p.axes[0].getValue(), p.axes[1].getValue());

			if (controllerAngle.length() > 0.1) {
				this.oven.image.applyForce(controllerAngle.clone().scale(0.003));

				this.oven.aimRotation = Phaser.Math.Angle.RotateTo(this.oven.aimRotation, controllerAngle.angle(), 2 * delta / 1000);

				//Set frame by angle
				let r = (Phaser.Math.RadToDeg(this.oven.aimRotation) + 360) % 360;
				if (r > 360 - 45 || r < 45)
					this.oven.image.setFrame(1);
				else if (r > 45 && r < 135)
					this.oven.image.setFrame(2);
				else if (r > 135 && r < 135 + 90)
					this.oven.image.setFrame(0);
				else if (r > 360 - 45 - 90 && r < 360 - 45)
					this.oven.image.setFrame(3);
				console.log(r, this.oven.image.frame.name)
				//this.oven.image.rotation = Phaser.Math.Angle.RotateTo(this.oven.image.rotation, controllerAngle.angle(), 2 * delta / 1000);
			}
		}
	}

	update(time: number, delta: number): void {
		this.sensor.position.x = this.oven.image.x;
		this.sensor.position.y = this.oven.image.y;

		//make player follow
		if (this.playerUsingThis) {
			let pp = new Phaser.Math.Vector2(this.playerUsingThis.image.x, this.playerUsingThis.image.y);
			let op = new Phaser.Math.Vector2(this.oven.image.x, this.oven.image.y);

			if (pp.distance(op) > 40) {
				this.playerUsingThis.image.applyForce(op.subtract(pp).normalize().scale(0.0015));
			}
		}
	}
}

export class PoolControl extends WeaponControl {
	constructor(scene: GameScene, x: number, y: number, w: number, h: number, public pool: Pool) {
		super(scene, x, y, w, h);
		pool.controller = this;
	}

	receiveInput(gamepad: Phaser.Input.Gamepad.Gamepad, time: number, delta: number): void {

	}

	update(time: number, delta: number): void {
		if (this.playerUsingThis) {
			if (time - this.pool.lastTimeCleaned > 200) {
				this.pool.decreaseEnemiesInside();
				this.pool.lastTimeCleaned = time;
			}
		}
	}
}