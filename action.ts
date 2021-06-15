import { getInput } from '@actions/core'

const getRequiredInput = (input: string): string =>
	getInput(input, { required: true })

const deviceId = getRequiredInput('device id')
const appVersion = getRequiredInput('app version')

const target = getRequiredInput('target')
const network = getRequiredInput('network')

const featureDir = getRequiredInput('feature dir')

const testEnv = {
	credentials: getRequiredInput('azure credentials'),
	location: getRequiredInput('azure location'),
	resourceGroup: getRequiredInput('azure resource group'),
	appName: getRequiredInput('app name'),
}

const main = async () => {
	console.log('deviceId', deviceId)
	console.log('appVersion', appVersion)
	console.log('target', target)
	console.log('network', network)
	console.log('testEnv', testEnv)
	console.log('featureDir', featureDir)
}

void main()
