import GameScene from "../gameScene";
import { Depth } from "./depth";
import { House } from "./house";
import { Stat } from "./stat";

export class StatBar {
	gfx: Phaser.GameObjects.Graphics;
	bgGfx: Phaser.GameObjects.Graphics;
	text: Phaser.GameObjects.Text;
	constructor(scene: GameScene, name: string, public stat: Stat, x: number, y: number, color: number) {


		this.bgGfx = scene.add.graphics();
		this.bgGfx.setDepth(Depth.UI);
		this.bgGfx.fillStyle(0x000000, 1);
		this.bgGfx.fillRect(0, 0, 200, 20);
		this.bgGfx.setPosition(x, y);

		this.gfx = scene.add.graphics();
		this.gfx.setDepth(Depth.UI);
		this.gfx.fillStyle(color, 1);
		this.gfx.fillRect(0, 0, 200 - 2, 20 - 2);
		this.gfx.setPosition(x + 1, y + 1);

		this.text = scene.add.text(x, y, name, { fontSize: '14px', color: '#fff', fontFamily: 'Hellovetica' })
			.setStroke('#000', 4)
			.setDepth(Depth.UI);
	}

	update(time: number, delta: number): void {
		this.gfx.setScale(this.stat.value, 1);
	}
}

export class HouseHealthStatBar {
	gfx: Phaser.GameObjects.Graphics;
	bgGfx: Phaser.GameObjects.Graphics;
	constructor(scene: GameScene, private house: House) {

		const w = 500;
		const h = 40;

		this.bgGfx = scene.add.graphics();
		this.bgGfx.setDepth(Depth.UI);
		this.bgGfx.fillStyle(0x000000, 1);
		this.bgGfx.fillRect(0, 0, w, h);
		this.bgGfx.setPosition((1920 - w) / 2, 40);

		this.gfx = scene.add.graphics();
		this.gfx.setDepth(Depth.UI);
		this.gfx.fillStyle(0xffffff, 1);
		this.gfx.fillRect(0, 0, w - 4, h - 4);
		this.gfx.setPosition((1920 - w + 4) / 2, 40 + 2);

		scene.add.text(1920 / 2, 40, "Flat Health", { fontSize: '20px', color: '#fff', fontFamily: 'Hellovetica' })
			.setStroke('#000', 4)
			.setOrigin(0.5, 0)
			.setDepth(Depth.UI);
	}

	update(time: number, delta: number): void {
		this.gfx.setScale(this.house.health, 1);
	}
}