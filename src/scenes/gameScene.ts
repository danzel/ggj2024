import { Bed, Control, Kitchen, LawnMowerControl, MachineGunTurretControl, OvenControl, PoolControl, TV, Toilet } from "./game/control";
import { Depth } from "./game/depth";
import { Enemy } from "./game/enemy";
import { House } from "./game/house";
import { Player } from "./game/player";
import { LawnMower, MachineGunTurret, Oven, Pool, Weapon } from "./game/weapons";


export default class GameScene extends Phaser.Scene {
	logo: Phaser.GameObjects.Image = null!;
	players: Player[];
	playerByBody: Map<MatterJS.BodyType, Player> = new Map();

	enemies = new Array<Enemy>();
	controls = new Array<Control>();
	weapons = new Array<Weapon>();

	categoryPlayer: number = null!;
	categoryEnemy: number = null!;
	categoryWall: number = null!;
	categoryLawnMower: number = null!;
	categoryTurret: number = null!;
	categoryBullet: number = null!;
	categoryControlSensor: number = null!;
	categoryOvenFire: number = null!;
	categoryPool: number = null!;

	house: House = null!;

	constructor() {
		super('hello');

		this.players = [];
	}

	preload() {
		// load static from our public dir
		this.load.image('vite-phaser-logo', 'assets/images/vite-phaser.png');

		this.load.image('house', 'assets/images/house.png');
		this.load.spritesheet('oven', 'assets/images/oven.png', { frameWidth: 40, frameHeight: 40 });
		this.load.spritesheet('enemy', 'assets/images/enemy2.png', { frameWidth: 44, frameHeight: 65, endFrame: 8 });

		this.load.image('grave', 'assets/images/grave.png');
		this.load.spritesheet('blood', 'assets/images/blood.png', { frameWidth: 256, frameHeight: 256 });
		this.load.image('turret_barrel', 'assets/images/turret_barrel.png');

		// load static assets from url
		//this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
		//this.load.image('red', 'https://labs.phaser.io/assets/particles/red.png');
	}

	create() {
		this.categoryPlayer = this.matter.world.nextCategory();
		this.categoryEnemy = this.matter.world.nextCategory();
		this.categoryWall = this.matter.world.nextCategory();
		this.categoryLawnMower = this.matter.world.nextCategory();
		this.categoryTurret = this.matter.world.nextCategory();
		this.categoryBullet = this.matter.world.nextCategory();
		this.categoryControlSensor = this.matter.world.nextCategory();
		this.categoryOvenFire = this.matter.world.nextCategory();
		this.categoryPool = this.matter.world.nextCategory();


		for (let i = 0; i < 4; i++) {
			this.players.push(new Player(this, i));
			this.playerByBody.set(this.players[i].body, this.players[i]);
		}

		this.house = new House(this);

		this.controls.push(new Toilet(this, 1920 / 2 + 84, 1080 / 2 - 80, 50, 40));
		this.controls.push(new Bed(this, 1920 / 2 - 60, 1080 / 2 - 60, 50, 50));
		this.controls.push(new Kitchen(this, 1920 / 2 - 50, 1080 / 2 + 90, 80, 40));
		this.controls.push(new TV(this, 1920 / 2 + 80, 1080 / 2 + 80, 50, 50));

		let lawnMower = new LawnMower(this, 400, 700);
		this.weapons.push(lawnMower);
		this.controls.push(new LawnMowerControl(this, 1920 / 2 - 200, 1080 / 2 + 200, 100, 100, lawnMower));

		let turret = new MachineGunTurret(this, 1090, 530, -90, 90);
		this.weapons.push(turret);
		this.controls.push(new MachineGunTurretControl(this, 1060, 530, 30, 20, turret));

		turret = new MachineGunTurret(this, 830, 560, 90, -90);
		this.weapons.push(turret);
		this.controls.push(new MachineGunTurretControl(this, 860, 560, 30, 20, turret));


		let oven = new Oven(this, 1000, 800);
		this.weapons.push(oven);
		this.controls.push(new OvenControl(this, 1000, 500, 50, oven));


		let pool = new Pool(this, 430, 300);
		this.weapons.push(pool);
		this.controls.push(new PoolControl(this, 430, 300, pool.width + 100, pool.height + 100, pool));
	}

	isGameOver = false;
	aliveTime = 0;

	update(time: number, delta: number): void {
		this.aliveTime += delta;

		this.players.forEach(player => player.update(time, delta));
		this.controls.forEach(control => control.update(time, delta));
		this.house.update(time, delta);


		this.manageEnemies(time, delta);

		if (this.players.every(p => p.isDead) && !this.isGameOver) {
			this.isGameOver = true;

			this.add.text(1920 / 2, 1080 / 2, 'Game Over', { color: 'white', fontSize: '100px', fontFamily: 'Hellovetica' })
				.setStroke('#000', 4)
				.setOrigin(0.5, 0.5)
				.setDepth(Depth.UI);

			this.add.text(1920 / 2, 1080 / 2 + 100, 'You survived for ' + (this.aliveTime / 1000).toFixed() + " seconds", { color: 'white', fontSize: '80px', fontFamily: 'Hellovetica' })
				.setStroke('#000', 4)
				.setOrigin(0.5, 0.5)
				.setDepth(Depth.UI);

			this.add.text(1920 / 2, 1080 / 2 + 200, "Restarting in 5 seconds", { color: 'white', fontSize: '50px', fontFamily: 'Hellovetica' })
				.setStroke('#000', 4)
				.setOrigin(0.5, 0.5)
				.setDepth(Depth.UI);

			this.time.delayedCall(5000, () => {
				document.location.reload();
			});
		}
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