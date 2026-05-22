const RELAY_CHOICES = Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), label: `Relay ${i + 1}` }))

module.exports = function (self) {
	self.setActionDefinitions({
		set_relay: {
			name: 'Set Relay',
			options: [
				{
					id: 'relay',
					type: 'dropdown',
					label: 'Relay',
					default: '1',
					choices: RELAY_CHOICES,
				},
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: '1',
					choices: [
						{ id: '1', label: 'ON' },
						{ id: '0', label: 'OFF' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (event) => {
				const relay = event.options.relay
				let state
				if (event.options.state === 'toggle') {
					state = self.relayStates[Number(relay) - 1] ? 0 : 1
				} else {
					state = Number(event.options.state)
				}
				try {
					await self.apiPost(`/api/v1/relays/${relay}`, { state })
				} catch (err) {
					self.log('error', `set_relay failed: ${err.message}`)
				}
			},
		},

		toggle_relay: {
			name: 'Toggle Relay',
			options: [
				{
					id: 'relay',
					type: 'dropdown',
					label: 'Relay',
					default: '1',
					choices: RELAY_CHOICES,
				},
			],
			callback: async (event) => {
				const idx = Number(event.options.relay) - 1
				const newState = self.relayStates[idx] ? 0 : 1
				try {
					await self.apiPost(`/api/v1/relays/${event.options.relay}`, { state: newState })
				} catch (err) {
					self.log('error', `toggle_relay failed: ${err.message}`)
				}
			},
		},

		set_all_relays: {
			name: 'Set All Relays',
			options: [
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					default: '1',
					choices: [
						{ id: '1', label: 'All ON' },
						{ id: '0', label: 'All OFF' },
					],
				},
			],
			callback: async (event) => {
				const state = Number(event.options.state)
				const results = await Promise.allSettled(
					Array.from({ length: 8 }, (_, i) =>
						self.apiPost(`/api/v1/relays/${i + 1}`, { state })
					)
				)
				results.forEach((r, i) => {
					if (r.status === 'rejected') {
						self.log('error', `set_all_relays relay ${i + 1} failed: ${r.reason.message}`)
					}
				})
			},
		},

		set_input_mode: {
			name: 'Set Input Mode',
			options: [
				{
					id: 'input',
					type: 'dropdown',
					label: 'Input',
					default: '1',
					choices: Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), label: `Input ${i + 1}` })),
				},
				{
					id: 'mode',
					type: 'dropdown',
					label: 'Mode',
					default: '0',
					choices: [
						{ id: '0', label: 'Off (webhook only)' },
						{ id: '1', label: 'Momentary (rising edge toggles relays)' },
						{ id: '2', label: 'Latching (relay follows input)' },
					],
				},
				{
					id: 'relay_mask',
					type: 'number',
					label: 'Relay Mask (bitmask)',
					default: 0,
					min: 0,
					max: 255,
					tooltip: 'Bit 0 = Relay 1 … Bit 7 = Relay 8. E.g. 3 = Relays 1+2',
				},
			],
			callback: async (event) => {
				try {
					await self.apiPost(`/api/v1/input_modes/${event.options.input}`, {
						mode: Number(event.options.mode),
						relay_mask: event.options.relay_mask,
					})
				} catch (err) {
					self.log('error', `set_input_mode failed: ${err.message}`)
				}
			},
		},

		set_webhook: {
			name: 'Set Webhook',
			options: [
				{
					id: 'index',
					type: 'dropdown',
					label: 'Webhook Slot',
					default: '1',
					choices: Array.from({ length: 8 }, (_, i) => ({ id: String(i + 1), label: `Webhook ${i + 1}` })),
				},
				{
					id: 'url',
					type: 'textinput',
					label: 'URL',
					default: 'http://',
				},
				{
					id: 'trigger',
					type: 'dropdown',
					label: 'Trigger',
					default: 'rising',
					choices: [
						{ id: 'rising', label: 'Rising edge' },
						{ id: 'falling', label: 'Falling edge' },
						{ id: 'change', label: 'Any change' },
					],
				},
				{
					id: 'enabled',
					type: 'checkbox',
					label: 'Enabled',
					default: true,
				},
			],
			callback: async (event) => {
				try {
					await self.apiPost(`/api/v1/webhooks/${event.options.index}`, {
						url: event.options.url,
						trigger: event.options.trigger,
						enabled: event.options.enabled,
					})
				} catch (err) {
					self.log('error', `set_webhook failed: ${err.message}`)
				}
			},
		},

		set_ntp: {
			name: 'Set NTP Config',
			options: [
				{
					id: 'server',
					type: 'textinput',
					label: 'NTP Server',
					default: 'pool.ntp.org',
				},
				{
					id: 'tz',
					type: 'textinput',
					label: 'Timezone (POSIX TZ string)',
					default: 'CET-1CEST,M3.5.0,M10.5.0/3',
					tooltip: 'POSIX TZ format, e.g. "CET-1CEST,M3.5.0,M10.5.0/3" for Central European Time',
				},
			],
			callback: async (event) => {
				try {
					await self.apiPost('/api/v1/ntp', {
						server: event.options.server,
						tz: event.options.tz,
					})
				} catch (err) {
					self.log('error', `set_ntp failed: ${err.message}`)
				}
			},
		},
	})
}
