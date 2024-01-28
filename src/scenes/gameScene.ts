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
		super({ key: 'gamescene' });

		this.players = [];
	}

	preload() {
		this.load.image('intro1', 'assets/images/IntroScreen1.png');
		this.load.image('intro2', 'assets/images/IntroScreen2.png');


		// load static from our public dir
		this.load.image('vite-phaser-logo', 'assets/images/vite-phaser.png');

		this.load.image('house', 'assets/images/house.png');
		this.load.image('housejustwalls', 'assets/images/housejustwalls.png');
		this.load.image('pools_full', 'assets/images/pools_full.png');

		this.load.spritesheet('oven', 'assets/images/oven.png', { frameWidth: 40, frameHeight: 40 });
		this.load.spritesheet('mower', 'assets/images/mower.png', { frameWidth: 40, frameHeight: 40 });
		this.load.spritesheet('enemy', 'assets/images/enemy2.png', { frameWidth: 44, frameHeight: 65, endFrame: 8 });
		this.load.spritesheet('player', 'assets/images/player.png', { frameWidth: 40, frameHeight: 40, endFrame: 4 });
		this.load.spritesheet('player1', 'assets/images/player1.png', { frameWidth: 40, frameHeight: 40, endFrame: 4 });
		this.load.spritesheet('player2', 'assets/images/player2.png', { frameWidth: 40, frameHeight: 40, endFrame: 4 });
		this.load.spritesheet('player3', 'assets/images/player3.png', { frameWidth: 40, frameHeight: 40, endFrame: 4 });
		this.load.spritesheet('player4', 'assets/images/player4.png', { frameWidth: 40, frameHeight: 40, endFrame: 4 });

		this.load.spritesheet('ovenfire', 'assets/images/burning_loop_1.png', { frameWidth: 24, frameHeight: 32, endFrame: 8 });

		this.load.image('grave', 'assets/images/grave.png');
		this.load.spritesheet('blood', 'assets/images/blood.png', { frameWidth: 256, frameHeight: 256 });
		this.load.image('turret_barrel', 'assets/images/turret_barrel.png');
		this.load.image('bullet', 'assets/images/bullet.png');

		this.load.image('grass', 'assets/images/grass.png');
		this.load.atlas('flares', 'assets/fromphaser/flares.png', 'assets/fromphaser/flares.json');


		this.load.audio('spawn1', 'assets/sound/spawn/groan.ogg');
		this.load.audio('spawn2', 'assets/sound/spawn/groan2.ogg');
		this.load.audio('spawn3', 'assets/sound/spawn/groan3.ogg');
		this.load.audio('spawn4', 'assets/sound/spawn/groan4.ogg');
		this.load.audio('spawn5', 'assets/sound/spawn/groan5.ogg');
		this.load.audio('spawn6', 'assets/sound/spawn/groan6.ogg');

		this.load.audio('die1', 'assets/sound/die/bonk.ogg');
		this.load.audio('die2', 'assets/sound/die/juicy.ogg');
		this.load.audio('die3', 'assets/sound/die/limbs_pop.ogg');
		this.load.audio('die4', 'assets/sound/die/melonimpact.ogg');
		this.load.audio('die5', 'assets/sound/die/melonimpact2.ogg');

		this.load.audio('gun1', 'assets/sound/gun/tap.ogg');
		this.load.audio('gun2', 'assets/sound/gun/tap2.ogg');

		this.load.audio('scream', 'assets/sound/scream.ogg');


		// load static assets from url
		//this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
		//this.load.image('red', 'https://labs.phaser.io/assets/particles/red.png');
	}

	preview: Phaser.GameObjects.Image = null!;
	showingPreview1 = true;
	showingPreview2 = false;
	previewPressed = false;

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

		this.preview = this.add.image(0, 0, 'intro1').setOrigin(0, 0);
	}

	createLater() {
		this.nextWaveTime = 4000 + this.time.now;

		for (let i = 0; i < 4; i++) {
			this.players.push(new Player(this, i));
			this.playerByBody.set(this.players[i].body, this.players[i]);
		}

		this.house = new House(this);

		this.controls.push(new Toilet(this, 1920 / 2 + 84, 1080 / 2 - 80, 50, 40));
		this.controls.push(new Bed(this, 1920 / 2 - 60, 1080 / 2 - 60, 50, 50));
		this.controls.push(new Kitchen(this, 1920 / 2 - 50, 1080 / 2 + 90, 80, 40));
		this.controls.push(new TV(this, 1920 / 2 + 80, 1080 / 2 + 80, 50, 50));

		let lawnMower = new LawnMower(this, 870, 790);
		this.weapons.push(lawnMower);
		this.controls.push(new LawnMowerControl(this, 930, 800, 60, 80, lawnMower));

		let turret = new MachineGunTurret(this, 1090, 540, -90, 90);
		this.weapons.push(turret);
		this.controls.push(new MachineGunTurretControl(this, 1060, 530, 30, 20, turret));

		turret = new MachineGunTurret(this, 830, 570, 90, -90);
		this.weapons.push(turret);
		this.controls.push(new MachineGunTurretControl(this, 860, 560, 30, 20, turret));


		let oven = new Oven(this, 1000, 800);
		this.weapons.push(oven);
		this.controls.push(new OvenControl(this, 1000, 500, 50, oven));


		let pool = new Pool(this, 426, 302);
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
		let somethingPressed = this.input.gamepad!.total > 0 && this.input.gamepad?.getAll().some(p => p.A)
		if (this.showingPreview1) {
			if (somethingPressed) {
				this.preview.destroy();
				this.preview = this.add.image(0, 0, 'intro2').setOrigin(0, 0);
				this.previewPressed = true;

				this.showingPreview1 = false;
				this.showingPreview2 = true;
			}
			return;
		}
		if (this.showingPreview2) {
			if (!this.previewPressed && somethingPressed) {
				this.preview.destroy();
				this.createLater();
				this.showingPreview2 = false;
			} else {
				if (!somethingPressed) {
					this.previewPressed = false;
				}
			}

			return;
		}



		this.aliveTime += delta;

		this.players.forEach(player => player.update(time, delta));
		this.controls.forEach(control => control.update(time, delta));
		this.house.update(time, delta);


		this.manageEnemies(time, delta);

		if ((this.players.every(p => p.isDead) || this.house.health == 0) && !this.isGameOver) {
			this.isGameOver = true;
			this.sound.play('scream');

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
			this.nextWaveSource = Phaser.Math.RND.pick([
				WaveSource.Surround, WaveSource.Left, WaveSource.Right, WaveSource.LeftRight, WaveSource.Above, WaveSource.Below, WaveSource.AboveBelow,
				WaveSource.Surround, WaveSource.Left, WaveSource.Right, WaveSource.LeftRight,
			]);
			this.nextWaveModifier = Phaser.Math.RND.pick([WaveModifier.None, WaveModifier.Fast, WaveModifier.Huge, WaveModifier.BigZombies]);

			this.nextWaveTime += 30_000;
		}
	}

	leftSpawnZone = [-20 - 80, -100, 80, 1080 + 200];
	rightSpawnZone = [1920 + 20, -100, 80, 1080 + 200];
	aboveSpawnZone = [-100, -20 - 80, 1920 + 200, 80];
	belowSpawnZone = [-100, 1080 + 20, 1920 + 200, 80];

	private spawnWave() {
		this.sound.play(Phaser.Math.RND.pick(['spawn1', 'spawn2', 'spawn3', 'spawn4', 'spawn5', 'spawn6']));

		let size = 10 + this.nextWaveNumber * 20;
		let speed = 0.0004 + this.nextWaveNumber * 0.00005;
		let health = 1;

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

		if (this.nextWaveModifier == WaveModifier.BigZombies) {
			label += " and they are big!";

			speed *= 20;
			health = 8;
			size /= 5;
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

			if (this.nextWaveModifier == WaveModifier.BigZombies) {
				if (Object.is(spawnZone, this.leftSpawnZone)) {
					x -= 100;
				}
				else if (Object.is(spawnZone, this.rightSpawnZone)) {
					x += 100;
				}
				else if (Object.is(spawnZone, this.aboveSpawnZone)) {
					y -= 100;
				}
				else if (Object.is(spawnZone, this.belowSpawnZone)) {
					y += 100;
				}

			}
			this.enemies.push(new Enemy(this, x, y, speed, health));
		}
	}
}