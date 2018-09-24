// https://alistapart.com/article/finessing-fecolormatrix

const SvgFilter = {
	name: 'SvgFilter',
	template: `
	<div>
		<svg>
			<filter id="matrix">
				<feColorMatrix in="SourceGraphic"
					type="matrix"
					:values="matrixValues">
				</feColorMatrix>
			</filter>
		</svg>
	</div>
	`,

	props: {
		channelR: {
			required: true,
			type: Object,
		},
		channelG: {
			required: true,
			type: Object,
		},
		channelB: {
			required: true,
			type: Object,
		},
		channelA: {
			required: true,
			type: Object,
		},
	},

	computed: {
		matrixValues() {
			const channels = [this.channelR, this.channelG, this.channelB, this.channelA];

			return channels.map(channel => Object.values(channel).join(' ')).join('\n');
		},
	},
};

const app = new Vue({
	name: 'app',
	el: '#app',

	components: {
		SvgFilter,
	},

	data() {
		return {
			channels: {
				channelR: { r: 1, g: 0, b: 0, a: 0, m: 0 },
				channelG: { r: 0, g: 1, b: 0, a: 0, m: 0 },
				channelB: { r: 0, g: 0, b: 1, a: 0, m: 0 },
				channelA: { r: 0, g: 0, b: 0, a: 1, m: 0 },
			},

			channel: 'channelR',
		};
	},

	methods: {
		update(prop, val) {
			this.channels[this.channel][prop] = val;
		},

		getChannelValue(prop) {
			return this.channels[this.channel][prop];
		}
	},
});
