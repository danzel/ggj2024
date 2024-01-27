import { Bed, Control, Kitchen, LawnMowerControl, MachineGunTurretControl, OvenControl, PoolControl, TV, Toilet } from "./game/control";
import { Depth } from "./game/depth";
import { Enemy } from "./game/enemy";
import { House } from "./game/house";
import { Player } from "./game/player";
import { WaveModifier, WaveSource } from "./game/wave";
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
	nextWaveInText: Phaser.GameObjects.Text = null!;

	constructor() {
		super('hello');

		this.players = [];
	}

	preload() {
		// load static from our public dir
		this.load.image('vite-phaser-logo', 'assets/images/vite-phaser.png');

		this.load.image('house', 'assets/images/house.png');
		this.load.image('housejustwalls', 'assets/images/housejustwalls.png');

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

		let lawnMower = new LawnMower(this, 900, 780);
		this.weapons.push(lawnMower);
		this.controls.push(new LawnMowerControl(this, 900, 700, 40, 40, lawnMower));

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


		this.nextWaveInText = this.add.text(1920 / 2, 100, 'Next wave in 5 seconds', { color: 'white', fontSize: '30px', fontFamily: 'Hellovetica' })
			.setStroke('#000', 4)
			.setOrigin(0.5, 0.5)
			.setDepth(Depth.UI);
	}

	isGameOver = false;
	aliveTime = 0;

	update(time: number, delta: number): void {
		this.aliveTime += delta;

		this.players.forEach(player => player.update(time, delta));
		this.controls.forEach(control => control.update(time, delta));
		this.house.update(time, delta);


		this.manageEnemies(time, delta);

		if ((this.players.every(p => p.isDead) || this.house.health == 0) && !this.isGameOver) {
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

		let next = ((this.nextWaveTime - time + 500) / 1000).toFixed();
		let label = 'Next wave in ' + next + " seconds";
		if (next == "1")
			label = "Next wave in 1 second";
		this.nextWaveInText.setText(label);
	}

	nextWaveNumber = 0;
	nextWaveSource = WaveSource.Surround;
	nextWaveModifier = WaveModifier.None;
	nextWaveTime = 4000;

	manageEnemies(time: number, delta: number) {
		this.enemies.forEach(enemy => enemy.update(time, delta));

		if (time > this.nextWaveTime || (this.nextWaveModifier == WaveModifier.Early && time > this.nextWaveTime - 6000)) {
			//Spawn this wave
			this.spawnWave();

			//Maintain the right thingy
			if (this.nextWaveModifier == WaveModifier.Early) {
				this.nextWaveTime -= 6_000;
			}

			this.nextWaveNumber++;
			this.nextWaveSource = Phaser.Math.RND.pick([WaveSource.Surround, WaveSource.Left, WaveSource.Right, WaveSource.LeftRight, WaveSource.Above, WaveSource.Below, WaveSource.AboveBelow]);
			this.nextWaveModifier = Phaser.Math.RND.pick([WaveModifier.None, WaveModifier.Fast, WaveModifier.Huge, WaveModifier.Early]);

			this.nextWaveTime += 30_000;
		}
	}

	leftSpawnZone = [-100, -100, 80, 1080 + 200];
	rightSpawnZone = [1920 + 20, -100, 80, 1080 + 200];
	aboveSpawnZone = [-100, -100, 1920 + 200, 80];
	belowSpawnZone = [-100, 1080 + 20, 1920 + 200, 80];

	private spawnWave() {
		let size = 10 + this.nextWaveNumber * 25;
		let speed = 0.0003 + this.nextWaveNumber * 0.00005;

		let label = "Zombies approach from ";

		if (this.nextWaveModifier == WaveModifier.Huge) {
			size *= 2;
			label = "A huge wave of " + label;
		}
		if (this.nextWaveModifier == WaveModifier.Fast) {
			speed *= 2;
			label = "A fast wave of " + label;
		}


		let spawnZones = new Array<number[]>();
		switch (this.nextWaveSource) {
			case WaveSource.Surround:
				spawnZones.push(this.leftSpawnZone);
				spawnZones.push(this.rightSpawnZone);
				spawnZones.push(this.aboveSpawnZone);
				spawnZones.push(this.belowSpawnZone);
				label += "all sides";
				break;
			case WaveSource.Left:
				spawnZones.push(this.leftSpawnZone);
				label += "the west";
				break;
			case WaveSource.Right:
				spawnZones.push(this.rightSpawnZone);
				label += "the east";
				break;
			case WaveSource.LeftRight:
				spawnZones.push(this.leftSpawnZone);
				spawnZones.push(this.rightSpawnZone);
				label += "the east and west";
				break;
			case WaveSource.Above:
				spawnZones.push(this.aboveSpawnZone);
				label += "the north";
				break;
			case WaveSource.Below:
				spawnZones.push(this.belowSpawnZone);
				label += "the south";
				break;
			case WaveSource.AboveBelow:
				spawnZones.push(this.aboveSpawnZone);
				spawnZones.push(this.belowSpawnZone);
				label += "the north and south";
				break;
			default:
				throw new Error("Unknown WaveSource: " + this.nextWaveSource);
		}


		let text = this.add.text(1920 / 2, 1080 / 2 - 300, label, { color: 'white', fontSize: '50px', fontFamily: 'Hellovetica' })
			.setStroke('#000', 4)
			.setOrigin(0.5, 0.5)
			.setDepth(Depth.UI);
		this.time.delayedCall(3000, () => {
			text.destroy();
		});

		if (this.nextWaveModifier == WaveModifier.Early) {
			let text = this.add.text(1920 / 2, 1080 / 2 - 300 + 60, "\n They are early!", { color: 'white', fontSize: '50px', fontFamily: 'Hellovetica' })
				.setStroke('#000', 4)
				.setOrigin(0.5, 0.5)
				.setDepth(Depth.UI);
			this.time.delayedCall(3000, () => {
				text.destroy();
			});
		}

		for (let i = 0; i < size; i++) {
			//pick a random spawn zone
			let spawnZone = Phaser.Math.RND.pick(spawnZones);
			//random locatin in that zone	
			let x = Phaser.Math.RND.between(spawnZone[0], spawnZone[0] + spawnZone[2]);
			let y = Phaser.Math.RND.between(spawnZone[1], spawnZone[1] + spawnZone[3]);
			this.enemies.push(new Enemy(this, x, y, speed));
		}
	}
}