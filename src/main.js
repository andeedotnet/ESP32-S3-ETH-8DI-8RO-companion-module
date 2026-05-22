const { InstanceBase, Regex, InstanceStatus } = require('@companion-module/base')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables')

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.pollTimer = null
		// Index 0 = relay/input 1, index 7 = relay/input 8
		this.relayStates = new Array(8).fill(0)
		this.inputStates = new Array(8).fill(0)
	}

	async init(config) {
		this.config = config

		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()

		this.startPolling()
	}

	async destroy() {
		this.stopPolling()
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
		this.stopPolling()
		this.startPolling()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Device IP Address',
				width: 8,
				regex: Regex.IP,
			},
			{
				type: 'number',
				id: 'port',
				label: 'Port',
				width: 4,
				default: 80,
				min: 1,
				max: 65535,
			},
			{
				type: 'number',
				id: 'pollInterval',
				label: 'Poll Interval (ms)',
				width: 4,
				default: 1000,
				min: 250,
				max: 30000,
				tooltip: 'How often to read relay and input states from the device',
			},
		]
	}

	baseUrl() {
		const port = this.config.port || 80
		return `http://${this.config.host}:${port}`
	}

	async apiGet(path) {
		const res = await fetch(`${this.baseUrl()}${path}`, {
			signal: AbortSignal.timeout(5000),
		})
		if (!res.ok) {
			const text = await res.text().catch(() => '')
			throw new Error(`HTTP ${res.status}${text ? `: ${text.trim()}` : ''}`)
		}
		return res.json()
	}

	async apiPost(path, body) {
		const res = await fetch(`${this.baseUrl()}${path}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(5000),
		})
		if (!res.ok) {
			const text = await res.text().catch(() => '')
			throw new Error(`HTTP ${res.status}${text ? `: ${text.trim()}` : ''}`)
		}
		return res.json()
	}

	startPolling() {
		if (!this.config?.host) {
			this.updateStatus(InstanceStatus.BadConfig, 'No IP address configured')
			return
		}
		const interval = this.config.pollInterval ?? 1000
		this.poll()
		this.pollTimer = setInterval(() => this.poll(), interval)
	}

	stopPolling() {
		if (this.pollTimer !== null) {
			clearInterval(this.pollTimer)
			this.pollTimer = null
		}
	}

	async poll() {
		try {
			const data = await this.apiGet('/api/v1/state')
			this.applyState(data)
			this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			this.log('warn', `Poll failed: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		}
	}

	applyState(data) {
		const relays = data.relays ?? []
		const inputs = data.inputs ?? []

		for (let i = 0; i < 8; i++) {
			this.relayStates[i] = relays[i] ?? 0
			this.inputStates[i] = inputs[i] ?? 0
		}

		const vars = {}
		for (let i = 1; i <= 8; i++) {
			vars[`relay_${i}`] = this.relayStates[i - 1] ? 'ON' : 'OFF'
			vars[`input_${i}`] = this.inputStates[i - 1] ? 'HIGH' : 'LOW'
		}
		this.setVariableValues(vars)
		this.checkFeedbacks('relay_state', 'relay_state_off', 'input_state', 'input_state_low')
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}
}

module.exports = ModuleInstance
