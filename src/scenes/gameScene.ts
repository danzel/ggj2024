import { Control, Toilet } from "./game/control";
import { Enemy } from "./game/enemy";
import { Player } from "./game/player";


export default class GameScene extends Phaser.Scene {
	logo: Phaser.GameObjects.Image = null!;
	players: Player[];
	playerByBody: Map<MatterJS.BodyType, Player> = new Map();

	enemies = new Array<Enemy>();
	controls = new Array<Control>();
	constructor() {
		super('hello');

		this.players = [];
	}

	preload() {

		// load static from our public dir
		this.load.image('vite-phaser-logo', 'assets/images/vite-phaser.png');

		// load static assets from url
		this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
		this.load.image('red', 'https://labs.phaser.io/assets/particles/red.png');
	}

	create() {
		for (let i = 0; i < 4; i++) {
			this.players.push(new Player(this, i));
			this.playerByBody.set(this.players[i].body, this.players[i]);
		}

		this.controls.push(new Toilet(this, 1920 / 2 + 200, 1080 / 2 + 200, 100, 100));
	}

	update(time: number, delta: number): void {
		this.players.forEach(player => player.update(time, delta));
		this.controls.forEach(control => control.update(time, delta));


		this.manageEnemies(time, delta);
	}

	waveTimes = [
		4000,
		20 * 1000,
	]
	waveSizes = [
		10,
		50
	]

	manageEnemies(time: number, delta: number) {
		this.enemies.forEach(enemy => enemy.update(time, delta));


		if (this.waveTimes.length && time > this.waveTimes[0]) {

			//TODO: need different spawn patterns
			for (let i = 0; i < this.waveSizes[0]; i++) {
				//Find a random position off screen
				let x = Math.random() * 1920;
				let y = Math.random() * 1080;

				//Randomly make them sides or top/bottom
				if (Math.random() < 0.5) {
					if (Math.random() < 0.5) {
						x = - 20;
					} else {
						x = 1920 + 20;
					}
				} else {
					if (Math.random() < 0.5) {
						y = - 20;
					} else {
						y = 1080 + 20;
					}

				}
				this.enemies.push(new Enemy(this, x, y));
			}

			this.waveTimes.shift();
			this.waveSizes.shift();
		}
	}
}