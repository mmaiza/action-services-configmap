import * as fs from 'fs'
import * as core from '@actions/core'
// import * as github from '@actions/github'
import * as path from 'path'
import * as yaml from 'js-yaml'
// async function print_variables(path: string, name: string): Promise<void> {
// }
interface EnvVar {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  [key: string]: any
}

interface ConfigMap {
  v1: string
  data: EnvVar
  kind: string
  metadata: EnvVar[]
}

async function run(): Promise<void> {
  try {
    const configMapsDir = core.getInput('configmaps-directory')
    const configMapsPaths = core.getInput('configmaps-paths')

    const pathsList = configMapsPaths.split(',').filter(element => {
      return element.trim()
    })

    for (const apath of pathsList) {
      core.info(`processing config map: ${apath}`)
      const fileContents = fs.readFileSync(
        path.join(configMapsDir, apath),
        'utf8'
      )
      const yaml_data = yaml.loadAll(fileContents) as {}
      const [{ data }] = yaml_data as ConfigMap[]

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          core.info(`key = ${key}, value = ${data[key]}`)
          core.exportVariable(key, data[key])
        }
      }
    }
  } catch (e) {
    core.error(`ACTION SERVICES CONFIGMAP ERROR: ${e}`)
  }
}

if (process.env['NODE_ENV'] !== 'test') {
  /* eslint-disable github/no-then */
  run()
    .catch(message => core.setFailed(message))
    .then(() => console.log('Done'))
    .catch(() => 'Forced to add it')
}

export default run
