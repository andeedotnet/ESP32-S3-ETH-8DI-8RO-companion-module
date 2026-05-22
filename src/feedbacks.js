module.exports = function (self) {
	self.setFeedbackDefinitions({
		relay_state: {
			name: 'Relay is ON',
			type: 'boolean',
			label: 'Relay is ON',
			defaultStyle: {
				bgcolor: 0x00aa00,
				color: 0xffffff,
			},
			options: [
				{
					id: 'relay',
					type: 'dropdown',
					label: 'Relay',
					default: '1',
					choices: Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), label: `Relay ${i + 1}` })),
				},
			],
			callback: (feedback) => {
				return self.relayStates[Number(feedback.options.relay) - 1] === 1
			},
		},

		relay_state_off: {
			name: 'Relay is OFF',
			type: 'boolean',
			label: 'Relay is OFF',
			defaultStyle: {
				bgcolor: 0xaa0000,
				color: 0xffffff,
			},
			options: [
				{
					id: 'relay',
					type: 'dropdown',
					label: 'Relay',
					default: '1',
					choices: Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), label: `Relay ${i + 1}` })),
				},
			],
			callback: (feedback) => {
				return self.relayStates[Number(feedback.options.relay) - 1] === 0
			},
		},

		input_state: {
			name: 'Digital Input is HIGH',
			type: 'boolean',
			label: 'Input is HIGH',
			defaultStyle: {
				bgcolor: 0x0055ff,
				color: 0xffffff,
			},
			options: [
				{
					id: 'input',
					type: 'dropdown',
					label: 'Input',
					default: '1',
					choices: Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), label: `Input ${i + 1}` })),
				},
			],
			callback: (feedback) => {
				return self.inputStates[Number(feedback.options.input) - 1] === 1
			},
		},

		input_state_low: {
			name: 'Digital Input is LOW',
			type: 'boolean',
			label: 'Input is LOW',
			defaultStyle: {
				bgcolor: 0x555555,
				color: 0xffffff,
			},
			options: [
				{
					id: 'input',
					type: 'dropdown',
					label: 'Input',
					default: '1',
					choices: Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), label: `Input ${i + 1}` })),
				},
			],
			callback: (feedback) => {
				return self.inputStates[Number(feedback.options.input) - 1] === 0
			},
		},
	})
}
