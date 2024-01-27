export class Stat {
	//Between 0-1, lowers over time
	public value: number;

	constructor(private decreasePerSecond: number) {
		this.value = .5 + Math.random() * .5
	}

	update(time: number, delta: number): void {
		this.value -= this.decreasePerSecond * delta / 1000;
		this.value = Math.max(0, this.value);
	}
}