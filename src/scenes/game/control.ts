import GameScene from "../gameScene";
import { Player } from "./player";
import { LawnMower, MachineGunTurret } from "./weapons";

export abstract class Control {
	sensor: MatterJS.BodyType;

	playerUsingThis: Player | null = null;

	constructor(protected scene: GameScene, x: number, y: number, w: number, h: number) {
		this.sensor = scene.matter.add.rectangle(x, y, w, h, {
			isSensor: true,
			isStatic: true,
			collisionFilter: {
				category: scene.categoryControlSensor,
				mask: scene.categoryPlayer
			}
		});

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

export class Toilet extends Control {
	constructor(scene: GameScene, x: number, y: number, w: number, h: number) {
		super(scene, x, y, w, h);
	}

	update(time: number, delta: number): void {
		if (this.playerUsingThis) {
			this.playerUsingThis.toilet.value = Math.min(1, this.playerUsingThis.toilet.value + 0.1 * delta / 1000);
		}
	}
}

export class Bed extends Control {
	constructor(scene: GameScene, x: number, y: number, w: number, h: number) {
		super(scene, x, y, w, h);
	}

	update(time: number, delta: number): void {
		if (this.playerUsingThis) {
			this.playerUsingThis.energy.value = Math.min(1, this.playerUsingThis.energy.value + 0.1 * delta / 1000);
		}
	}
}

export class Kitchen extends Control {
	constructor(scene: GameScene, x: number, y: number, w: number, h: number) {
		super(scene, x, y, w, h);
	}

	update(time: number, delta: number): void {
		if (this.playerUsingThis) {
			this.playerUsingThis.antiHunger.value = Math.min(1, this.playerUsingThis.antiHunger.value + 0.1 * delta / 1000);
		}
	}
}

export class TV extends Control {
	constructor(scene: GameScene, x: number, y: number, w: number, h: number) {
		super(scene, x, y, w, h);
	}

	update(time: number, delta: number): void {
		if (this.playerUsingThis) {
			this.playerUsingThis.fun.value = Math.min(1, this.playerUsingThis.fun.value + 0.1 * delta / 1000);
		}
	}
}



export abstract class WeaponControl extends Control {

	constructor(scene: GameScene, x: number, y: number, w: number, h: number) {
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
			let rotation = delta / 1000 * 30 * x;

			this.turret.image.angle = Phaser.Math.Clamp(this.turret.image.angle + rotation, this.turret.minAngleDegree, this.turret.maxAngleDegree);
		}

		if (p.B && time - this.turret.lastFiredTime > 333) {
			this.turret.fire(time, delta);
		}
	}

	update(time: number, delta: number): void {
	}
}