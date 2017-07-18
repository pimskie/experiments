const size = 512
const boxElement = document.querySelector('#box')
const canvas = document.querySelector('canvas')
canvas.width = size
canvas.height = size
const ctx = canvas.getContext('2d')

const {
  pow,
  abs,
  sign,
  min,
} = Math

const colorConfigs = {
  'grayscale': {
    bodyBackground: 'white',
    baseColor: 'black',
    rgba: (iteration, minIteration) => [, , , 255 * (1 - pow(0.99, iteration - minIteration))],
  },
  'rainbow': {
    bodyBackground: `radial-gradient(circle,${
    new Array(20).fill().map((_, i) =>
      `${d3.interpolateRainbow(i / 20)} ${50 + i / 20 * 50}%`
    )}`,
    shape: 'round',
    baseColor: 'black',
    rgba: (iteration, minIteration) => {
      return d3.interpolateRainbow((iteration - minIteration) / 100).match(/\d+/g)
    }
  },
  'deep ocean': {
    bodyBackground: '#001',
    backgroundColor: '#6cf',
    baseColor: 'black',
    rgba: (iteration, minIteration) => [, , 17, 255 * pow(0.99, iteration - minIteration)],
  },
  'black and white': {
    baseColor: 'white',
    rgba: () => [, , , 0],
  },
}

class Mandelbrot {
  constructor() {
    if (this.constructor._) {
      return this.constructor._
    }
    this.constructor._ = this

    this.left = -2
    this.top = -2
    this.viewSize = 4
    this.colorScheme = 'deep ocean'
    this.setup()
    this.draw = this.draw.bind(this)
    this.draw()
  }
  reset() {
    this.left = -2
    this.top = -2
    this.viewSize = 4
    this.setup()
  }
  setup() {
    delete this.minIteration
    this.colorConfig = colorConfigs[this.colorScheme]
    canvas.style.backgroundColor = this.colorConfig.backgroundColor || 'transparent'
    canvas.style.borderRadius = this.colorConfig.shape ? '50%' : 0
    document.body.style.background = this.colorConfig.bodyBackground || 'black'
    ctx.clearRect(0, 0, size, size)
    if (this.colorConfig.baseColor) {
      ctx.fillStyle = this.colorConfig.baseColor
      ctx.fillRect(0, 0, size, size)
    }
    this.imageData = ctx.getImageData(0, 0, size, size)
    this.iteration = 0

    this._viewSize = this.viewSize
    this.c = []
    for (let i = 0; i < size; i++) {
      this.c[i] = []
      for (let j = 0; j < size; j++) {
        const x0 = i * this._viewSize / size + this.left
        const y0 = j * this._viewSize / size + this.top
        this.c[i][j] = [x0, y0, 0, x0, y0]
      }
    }
  }
	draw() {
		const data = this.imageData.data
		const rgba = this.colorConfig.rgba(
			this.iteration,
			this.minIteration === undefined ? this.iteration : this.minIteration
		);

		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				const [x, y, iteration, x0, y0] = this.c[i][j]
				if (iteration >= this.iteration) {
					if (x * x + y * y < 4) {
						this.c[i][j] = [x * x - y * y + x0, 2 * x * y + y0, iteration + 1, x0, y0]
					} else {
						if (this.minIteration === undefined) {
							this.minIteration = iteration;
						}

						const p = j * size * 4 + i * 4;
						rgba.forEach((e, i) => {
							data[p + i] = e;
						});
					}
				}
			}
		}
		ctx.putImageData(this.imageData, 0, 0)
		this.iteration += 1
		requestAnimationFrame(this.draw)
	}
}

function start(e) {
  boxElement.className = ''
  const rect = canvas.getBoundingClientRect()
  Mandelbrot._.box = {
    startX: (e.clientX - rect.left) * size / rect.width,
    startY: (e.clientY - rect.top) * size / rect.width,
  }
}

function move(e) {
  if (Mandelbrot._.box) {
    const rect = canvas.getBoundingClientRect()
    const offsetX = (e.clientX - rect.left) * size / rect.width
    const offsetY = (e.clientY - rect.top) * size / rect.width
    const box = Mandelbrot._.box
    const _viewSize = min(abs(offsetX - box.startX), abs(offsetY - box.startY))
    box.endX = box.startX + sign(offsetX - box.startX) * _viewSize
    box.endY = box.startY + sign(offsetY - box.startY) * _viewSize

    const style = boxElement.style
    style.visibility = 'visible'
    style.left = min(box.startX, box.endX) * rect.width / size + 'px'
    style.top = min(box.startY, box.endY) * rect.width / size + 'px'
    style.width = _viewSize * rect.width / size + 'px'
    style.height = _viewSize * rect.width / size + 'px'
  }
}

function cancel() {
  delete Mandelbrot._.box
  boxElement.style.visibility = 'hidden'
}

function end(e) {
  const _ = Mandelbrot._
  if (_.box) {
    const rect = canvas.getBoundingClientRect()
    const offsetX = (e.clientX - rect.left) * size / rect.width
    const offsetY = (e.clientY - rect.top) * size / rect.width
    const box = _.box
    const _viewSize = min(abs(offsetX - box.startX), abs(offsetY - box.startY))
    if (_viewSize === 0) {
      return
    }
    box.endX = box.startX + sign(offsetX - box.startX) * _viewSize
    box.endY = box.startY + sign(offsetY - box.startY) * _viewSize

    const _left = min(box.startX, box.endX)
    const _top = min(box.startY, box.endY)
    const viewSize = _viewSize / size * _.viewSize
    const left = _.left + _left / size * _.viewSize
    const top = _.top + _top / size * _.viewSize

    _.viewSize = viewSize
    _.left = left
    _.top = top
    cancel()
    setup()
  }
}

const _ = new Mandelbrot()
const setup = _.setup.bind(_)
const gui = new dat.GUI({
  autoPlace: false,
})
const controller = document.getElementById('controller')
controller.appendChild(gui.domElement)
gui.add(_, 'iteration').listen()
gui.add(_, 'colorScheme', Object.keys(colorConfigs)).onFinishChange(setup)
gui.add(_, 'reset')

document.body.addEventListener('mousedown', function(e) {
  if (e.button === 0) {
    start(e)
  } else {
    cancel()
  }
})
document.body.addEventListener('click', cancel)
document.body.addEventListener('mousemove', move)
document.body.addEventListener('mouseup', end)
controller.addEventListener('mousedown', function(e) {
  e.stopPropagation()
})

document.body.addEventListener('touchstart', function(e) {
  if (e.touches.length === 1) {
    e.preventDefault()
    start(e.touches[0])
  } else {
    cancel()
  }
})
document.body.addEventListener('touchmove', function(e) {
  move(e.touches[0])
})
document.body.addEventListener('touchcancel', cancel)
document.body.addEventListener('touchend', function(e) {
  end(e.changedTouches[0])
})
controller.addEventListener('touchstart', function(e) {
  e.stopPropagation()
})