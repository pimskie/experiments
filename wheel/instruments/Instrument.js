class Instrument {
	addInstruments(instruments) {
		this.instruments = this.instruments.concat(instruments);

		return this;
	}

	draw(ctx, ctxTrail) {
		this.drawSelf(ctx);
		this.drawTrail(ctxTrail);

		this.instruments.forEach(wheel => wheel.draw(ctx, ctxTrail));
	}

	drawTrail(ctxTrail) {
		if (this.instruments.length && !this.paint) {
			return;
		}

		ctxTrail.strokeStyle = 'rgba(100, 100, 100, 1)';
		ctxTrail.lineWidth = 0.5;
		ctxTrail.beginPath();
		ctxTrail.moveTo(this.from.x, this.from.y);
		ctxTrail.lineTo(this.to.x, this.to.y);
		ctxTrail.closePath();
		ctxTrail.stroke();
	}
}

export default Instrument;
