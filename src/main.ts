import Phaser from "phaser";
import GameScene from "./scenes/gameScene";

const config: Phaser.Types.Core.GameConfig = {
	parent: "app",
	type: Phaser.AUTO,
	width: 1920,
	height: 1080,
	antialias: false,
	scale: {
		mode: Phaser.Scale.ScaleModes.NONE,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	physics: {
		default: 'matter',
		matter: {
			//debug: true,
			enableSleeping: false,
			gravity: {
				x: 0,
				y: 0,
			},

		}
	},
	scene: [
		GameScene,
	], input: {
		gamepad: true
	}
};

export default new Phaser.Game(config);