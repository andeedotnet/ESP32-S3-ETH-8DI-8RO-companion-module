module.exports = function (self) {
	const defs = {}

	for (let i = 1; i <= 8; i++) {
		defs[`relay_${i}`] = { name: `Relay ${i} State` }
		defs[`input_${i}`] = { name: `Digital Input ${i} State` }
	}

	self.setVariableDefinitions(defs)

	const initialVals = {}
	for (let i = 1; i <= 8; i++) {
		initialVals[`relay_${i}`] = 'OFF'
		initialVals[`input_${i}`] = 'LOW'
	}
	self.setVariableValues(initialVals)
}
