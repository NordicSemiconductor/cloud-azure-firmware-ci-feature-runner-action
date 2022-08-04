import { getInput } from '@actions/core'
import { AzureCliCredential } from '@azure/identity'
import {
	ConsoleReporter,
	FeatureRunner,
	storageStepRunners,
} from '@nordicsemiconductor/e2e-bdd-test-runner'
import { Registry } from 'azure-iothub'
import * as chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'
import { deviceStepRunners } from './steps/azureIot'
import { firmwareCIStepRunners } from './steps/firmwareCI'

const getRequiredInput = (input: string): string =>
	getInput(input, { required: true })

const deviceId = getRequiredInput('device id')
const appVersion = getRequiredInput('app version')

const target = getRequiredInput('target')

const featureDir = getRequiredInput('feature dir')

const testEnv = {
	appName: getRequiredInput('app name'),
}

const idScope = getRequiredInput('azure iot hub dps id scope')

const logDir = getRequiredInput('log dir')

const main = async () => {
	const world = {
		deviceId,
		appVersion,
		target,
		testEnv,
		featureDir,
		deviceLog: fs
			.readFileSync(path.resolve(logDir, 'device.log'), 'utf-8')
			.split('\n'),
		idScope,
	}

	console.log(chalk.yellow.bold(' World:'))
	console.log()
	console.log(world)
	console.log()

	const runner = new FeatureRunner<typeof world>(world, {
		dir: featureDir,
		reporters: [
			new ConsoleReporter({
				printResults: true,
				printProgress: true,
				printSummary: true,
			}),
		],
		retry: false,
	})

	try {
		const { success } = await runner
			.addStepRunners(firmwareCIStepRunners())
			.addStepRunners(storageStepRunners())
			.addStepRunners(
				deviceStepRunners({
					iotHubRegistry: Registry.fromTokenCredential(
						`${testEnv.appName}IotHub.azure-devices.net`,
						new AzureCliCredential(),
					),
				}),
			)
			.run()
		if (!success) {
			process.exit(1)
		}
		process.exit()
	} catch (error) {
		console.error(chalk.red('Running the features failed!'))
		console.error(error)
		process.exit(1)
	}
}

void main()
