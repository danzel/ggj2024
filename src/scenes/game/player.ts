import GameScene from "../gameScene";
import { Control, WeaponControl } from "./control";
import { Depth } from "./depth";
import { Stat } from "./stat";
import { StatBar } from "./statBar";

export class Player {
	image: Phaser.Physics.Matter.Image;
	body: MatterJS.BodyType;

	antiHunger: Stat = new Stat(0.01);
	fun = new Stat(0.01);
	energy = new Stat(0.01);
	toilet = new Stat(0.01);
	stats = [this.antiHunger, this.fun, this.energy, this.toilet];
	statBars: StatBar[];

	onControl: Control | null = null;
	usingControl: Control | null = null;

	constructor(private scene: GameScene, private playerNumber: number) {

		this.image = scene.matter.add.image(1000, 500, 'player');
		this.image.setDepth(Depth.Player);
		this.image.setCircle(10);
		this.image.setCollisionCategory(scene.categoryPlayer);
		this.image.setCollidesWith([scene.categoryPlayer, scene.categoryWall, scene.categoryEnemy, scene.categoryLawnMower, scene.categoryTurret, scene.categoryBullet, scene.categoryControlSensor, scene.categoryOvenFire, scene.categoryPool])
		this.body = <MatterJS.BodyType>this.image.body;

		this.body.frictionAir = 0.8;
		this.body.friction = 0.8;
		this.body.restitution = 1;

		let statPosX = 0, statPosY = 0;

		switch (playerNumber) {
			case 0:
				statPosX = 50;
				statPosY = 50;
				break;
			case 1:
				statPosX = 1920 - 200;
				statPosY = 50;
				break;
			case 2:
				statPosX = 50;
				statPosY = 1080 - 250;
				break;
			case 3:
				statPosX = 1920 - 200;
				statPosY = 1080 - 250;
				break;
		}


		this.statBars = [
			new StatBar(scene, 'Hunger', this.antiHunger, statPosX, statPosY),
			new StatBar(scene, 'Fun', this.fun, statPosX, statPosY + 40),
			new StatBar(scene, 'Energy', this.energy, statPosX, statPosY + 80),
			new StatBar(scene, 'Toilet', this.toilet, statPosX, statPosY + 120),
		];
	}

	private _lastButtonA = false;

	update(time: number, delta: number): void {
		this.stats.forEach(stat => stat.update(time, delta));
		this.statBars.forEach(statBar => statBar.update(time, delta));

		const p = this.scene.input.gamepad?.getPad(this.playerNumber);
		if (!p) return;

		//move player
		if (this.usingControl) {
			//use the control
			if (this.usingControl instanceof WeaponControl) {
				this.usingControl.receiveInput(p, time, delta);
			}
		}
		else {
			let controllerAngle = new Phaser.Math.Vector2(p.axes[0].getValue(), p.axes[1].getValue());
			this.image.applyForce(controllerAngle.clone().scale(0.002));
		}

		//start/end using a control
		if (p.A && !this._lastButtonA) {
			if (this.usingControl) {
				this.usingControl.playerUsingThis = null;
				this.usingControl = null;
			} else if (this.onControl) {
				if (!this.onControl.playerUsingThis) {
					this.onControl.playerUsingThis = this;
					this.usingControl = this.onControl;
				}
			}
		}
		this._lastButtonA = p.A;
	}
}