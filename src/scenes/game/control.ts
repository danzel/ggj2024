import GameScene from "../gameScene";
import { Player } from "./player";

export abstract class Control {
	sensor: MatterJS.BodyType;

	playerUsingThis: Player | null = null;

	constructor(protected scene: GameScene, x: number, y: number, w: number, h: number) {
		this.sensor = scene.matter.add.rectangle(x, y, w, h, {
			isSensor: true,
			isStatic: true
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
			this.playerUsingThis.toilet.value = Math.min(1, this.playerUsingThis.toilet.value + 0.1 * time);
		}
	}
}