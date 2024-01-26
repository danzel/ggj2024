import GameScene from "../gameScene";
import { Enemy } from "./enemy";
import { HouseHealthStatBar } from "./statBar";

export class House {
	health = 1;
	statBar: HouseHealthStatBar;
	walls: MatterJS.BodyType[];

	constructor(private scene: GameScene) {

		//TODO: walls and sprite
		this.walls = [
			scene.matter.add.rectangle(1920 / 2, 1080 / 2 - 300, 400, 50, {
				isStatic: true,
				collisionFilter: {
					category: scene.categoryWall,
					mask: scene.categoryPlayer | scene.categoryEnemy | scene.categoryLawnMower | scene.categoryTurret | scene.categoryBullet | scene.categoryOvenFire
				}
			})
		];

		this.walls.forEach(wall => {
			wall.onCollideActiveCallback = (pair: MatterJS.IPair) => {
				this.receiveHit((<any>pair.bodyA).enemy);
				this.receiveHit((<any>pair.bodyB).enemy);
			}
		});

		this.statBar = new HouseHealthStatBar(scene, this);
	}

	private receiveHit(enemy: Enemy | undefined): void {
		if (!enemy) return;

		//hack in per second damage
		this.health -= 0.01 / 60;
		this.health = Math.max(0, this.health);
	}

	update(time: number, delta: number): void {
		this.statBar.update(time, delta);
	}
}