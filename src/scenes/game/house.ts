import GameScene from "../gameScene";
import { Depth } from "./depth";
import { Enemy } from "./enemy";
import { HouseHealthStatBar } from "./statBar";

export class House {
	health = 1;
	statBar: HouseHealthStatBar;
	walls: MatterJS.BodyType[];

	constructor(private scene: GameScene) {

		scene.add.sprite(1920 / 2, 1080 / 2, 'house').setDepth(Depth.Background);

		let w = [
			[1920 / 2, 1080 / 2 - 96, 242, 8], //top
			[1920 / 2 - 116, 1080 / 2 + 24, 8, 242], //left
			[1920 / 2 + 116, 1080 / 2 + 24, 8, 242], //right

			[1920 / 2 - 56, 1080 / 2 + 140, 120, 8], //bottom left
			[1920 / 2 + 72, 1080 / 2 + 140, 80, 8], //bottom right


			[1920 / 2 - 94, 1080 / 2 + 54, 40, 8], //bottom left room top wall left side
			[1920 / 2 - 22, 1080 / 2 + 54, 44, 8], //bottom left room top wall left side
			[1920 / 2 - 4, 1080 / 2 + 60, 8, 20], //bottom left room right wall top side
			[1920 / 2 - 4, 1080 / 2 + 120, 8, 44], //bottom left room right wall right side


			[1920 / 2 + 56, 1080 / 2 + 24, 34, 8], //bottom right room top wall left side
			[1920 / 2 + 106, 1080 / 2 + 24, 8, 8], //bottom right room top wall right side
			[1920 / 2 + 40, 1080 / 2 + 45, 8, 50], //bottom right room left wall top side
			[1920 / 2 + 40, 1080 / 2 + 120, 8, 48], //bottom right room left wall bottom side


			[1920 / 2 - 108, 1080 / 2 + 10, 10, 8], //top left room bottom wall left side
			[1920 / 2 - 40, 1080 / 2 + 10, 68, 8], //top left room bottom wall right side
			[1920 / 2 - 10, 1080 / 2 - 22, 8, 54], //top left room right wall top side
			[1920 / 2 - 10, 1080 / 2 - 88, 8, 20], //top left room right wall bottom side

			[1920 / 2 + 60, 1080 / 2 - 20, 26, 8], //top right room bottom wall left side
			[1920 / 2 + 108, 1080 / 2 - 20, 10, 8], //top right room bottom wall right side
			[1920 / 2 + 50, 1080 / 2 - 60, 8, 80], //top right room left wall


		]
		this.walls = w.map(p => scene.matter.add.rectangle(p[0], p[1], p[2], p[3], {
			isStatic: true,
			collisionFilter: {
				category: scene.categoryWall,
				mask: scene.categoryPlayer | scene.categoryEnemy | scene.categoryLawnMower | scene.categoryTurret | scene.categoryBullet | scene.categoryOvenFire
			}
		})
		);

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