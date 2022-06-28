import {
	InterpolatedStep,
	regexGroupMatcher,
	StepRunnerFunc,
} from '@nordicsemiconductor/e2e-bdd-test-runner'
import { Registry } from 'azure-iothub'
import * as chai from 'chai'
import { expect } from 'chai'
import * as chaiSubset from 'chai-subset'
chai.use(chaiSubset)

export const deviceStepRunners = ({
	iotHubRegistry,
}: {
	iotHubRegistry: Registry
}): ((step: InterpolatedStep) => StepRunnerFunc<any> | false)[] => [
	regexGroupMatcher(
		/^the (?<desiredOrReported>desired|reported) state of the (?:device|asset tracker) "(?<deviceId>[^"]+)" (?:should )?(?<equalOrMatch>equals?|match(?:es)?)$/,
	)(async ({ desiredOrReported, deviceId, equalOrMatch }, step) => {
		if (step.interpolatedArgument === undefined) {
			throw new Error('Must provide argument!')
		}
		const j = JSON.parse(step.interpolatedArgument)

		const res = await iotHubRegistry
			.createQuery(`SELECT * FROM devices WHERE deviceId='${deviceId}'`)
			.nextAsTwin()

		if (res.result[0]?.properties === undefined) {
			throw new Error(`Device ${deviceId} has no reported state.`)
		}
		const fragment =
			desiredOrReported === 'desired'
				? res.result[0].properties.desired
				: res.result[0].properties.reported
		if (equalOrMatch.startsWith('match')) {
			expect(fragment).to.containSubset(j)
		} else {
			expect(fragment).to.deep.equal(j)
		}
		return res.result[0].properties
	}),
]
