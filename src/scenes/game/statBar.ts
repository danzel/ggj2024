import GameScene from "../gameScene";
import { Stat } from "./stat";

export class StatBar {
	gfx: Phaser.GameObjects.Graphics;
	bgGfx: Phaser.GameObjects.Graphics;
	constructor(scene: GameScene, name: string, private stat: Stat, x: number, y: number) {


		this.bgGfx = scene.add.graphics();
		this.bgGfx.fillStyle(0xff0000, 1);
		this.bgGfx.fillRect(0, 0, 200, 20);
		this.bgGfx.setPosition(x, y);

		this.gfx = scene.add.graphics();
		this.gfx.fillStyle(0x00ff00, 1);
		this.gfx.fillRect(0, 0, 200 - 2, 20 - 2);
		this.gfx.setPosition(x + 1, y + 1);

		scene.add.text(x, y, name, { fontSize: '32px', color: '#fff' });
	}

	update(time: number, delta: number): void {
		this.gfx.setScale(this.stat.value, 1);
	}
}