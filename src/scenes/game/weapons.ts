import GameScene from "../gameScene";
import { LawnMowerControl } from "./control";
import { Enemy } from "./enemy";

export abstract class Weapon {

}

export class LawnMower extends Weapon {
	image: Phaser.Physics.Matter.Image;
	body: MatterJS.BodyType;

	controller: LawnMowerControl | null = null;

	constructor(private scene: GameScene, x: number, y: number) {
		super();

		this.image = scene.matter.add.image(x, y, 'lawnmower');
		this.image.setCircle(20);
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