import GameScene from "../gameScene";
import { Control, OvenControl, WeaponControl } from "./control";
import { Depth } from "./depth";
import { Enemy } from "./enemy";
import { Stat } from "./stat";
import { StatBar } from "./statBar";

export class Player {
	image: Phaser.Physics.Matter.Image;
	body: MatterJS.BodyType;

	antiHunger: Stat = new Stat(0.01);
	fun = new Stat(0.01);
	energy = new Stat(0.01);
	toilet = new Stat(0.01);
	stats = [this.energy, this.antiHunger, this.fun, this.toilet];
	statBars: StatBar[];

	onControl: Control | null = null;
	usingControl: Control | null = null;
	warningLabel: Phaser.GameObjects.Text;

	isDead = false;

	constructor(private scene: GameScene, private playerNumber: number) {

		let x = 0, y = 0;
		let statPosX = 0, statPosY = 0;

		switch (playerNumber) {
			case 0:
				x = 300;
				y = 300;
				statPosX = 50;
				statPosY = 50;
				this.energy.value = 0.25;
				break;
			case 1:
				x = 1920 - 300;
				y = 300;
				statPosX = 1920 - 200;
				statPosY = 50;
				this.antiHunger.value = 0.25;
				break;
			case 2:
				x = 300;
				y = 1080 - 300;
				statPosX = 50;
				statPosY = 1080 - 250;
				this.fun.value = 0.25;
				break;
			case 3:
				x = 1920 - 300;
				y = 1080 - 300;
				statPosX = 1920 - 200;
				statPosY = 1080 - 250;
				this.toilet.value = 0.25;
				break;
		}
		this.image = scene.matter.add.image(x, y, 'player');
		this.image.setDepth(Depth.Player);
		this.image.setCircle(10);
		this.image.setCollisionCategory(scene.categoryPlayer);
		this.image.setCollidesWith([scene.categoryPlayer, scene.categoryWall, scene.categoryEnemy, scene.categoryLawnMower, scene.categoryTurret, scene.categoryBullet, scene.categoryControlSensor, scene.categoryOvenFire, scene.categoryPool])
		this.body = <MatterJS.BodyType>this.image.body;

		this.body.frictionAir = 0.8;
		this.body.friction = 0.8;
		this.body.restitution = 1;
		this.image.setFixedRotation();


		this.warningLabel = scene.add.text(x, y, 'Hungry Bored Tired Poopy', { color: 'white', fontSize: '20px', fontFamily: 'Hellovetica' })
			.setStroke('#000', 4)
			.setOrigin(0.5, 1.5)
			.setDepth(Depth.UI);

		this.statBars = [
			new StatBar(scene, 'Energy', this.energy, statPosX, statPosY),
			new StatBar(scene, 'Hunger', this.antiHunger, statPosX, statPosY + 40),
			new StatBar(scene, 'Fun', this.fun, statPosX, statPosY + 80),
			new StatBar(scene, 'Toilet', this.toilet, statPosX, statPosY + 120),
		];

		(<MatterJS.BodyType>this.image.body).onCollideActiveCallback = (pair: MatterJS.IPair) => {
			this.hitByEnemy((<any>pair.bodyA).enemy);
			this.hitByEnemy((<any>pair.bodyB).enemy);
		}
	}

	private hitByEnemy(enemy: Enemy | undefined) {
		if (!enemy) return;

		//fps hack
		this.energy.value -= 0.14 / 60;
		this.energy.value = Math.max(0, this.energy.value);
	}

	private _lastButtonA = false;

	update(time: number, delta: number): void {
		if (this.isDead) {
			return;
		}

		this.stats.forEach(stat => stat.update(time, delta));
		this.statBars.forEach(statBar => statBar.update(time, delta));

		//Update warning based on low stats
		let warning = new Array<string>();
		if (this.energy.value < 0.1) warning.push('Tired');
		if (this.antiHunger.value == 0) warning.push('Hungry');
		if (this.fun.value == 0) warning.push('Bored');
		if (this.toilet.value == 0) warning.push('Poopy');

		if (warning.length) {
			this.warningLabel.setColor('red');
		} else {
			if (this.energy.value < 0.25) warning.push('Tired');
			if (this.antiHunger.value < 0.25) warning.push('Hungry');
			if (this.fun.value < 0.25) warning.push('Bored');
			if (this.toilet.value < 0.25) warning.push('Poopy');
			this.warningLabel.setColor('white');
		}
		this.warningLabel.text = warning.join(' ');
		this.warningLabel.x = this.image.x;
		this.warningLabel.y = this.image.y;


		//Damage energy if other stats are low
		for (let i = 1; i < this.stats.length; i++) {
			if (this.stats[i].value == 0) {
				this.energy.value -= delta / 20000;
				this.energy.value = Math.max(0, this.energy.value);
			}
		}


		if (this.energy.value == 0) {
			//TODO: Particles

			this.isDead = true;

			this.image.setTexture('grave');
			this.image.setOrigin(.5, .8);
			this.image.setScale(.7);

			this.warningLabel.destroy();

			return;
		}

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
				this.body.isStatic = false;
			} else if (this.onControl) {
				if (!this.onControl.playerUsingThis) {
					this.onControl.playerUsingThis = this;
					this.usingControl = this.onControl;

					if (!(this.onControl instanceof OvenControl)) {
						this.body.isStatic = true;
					}
				}
			}
		}
		this._lastButtonA = p.A;
	}
}