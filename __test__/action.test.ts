import * as core from '@actions/core'
import mock from 'mock-fs'
import run from '../src/action'

//const rootPath = `${process.cwd()}/nonprod/useast2/ci/apps/configmaps`
const rootPath = `${process.cwd()}/nonprod/useast2`
const ciPath = `${rootPath}/ci/apps/configmaps`
const qaPath = `${rootPath}/qa/apps/configmaps`

beforeAll(() => {
  mock({
    [ciPath]: {
      'common.yml': `
apiVersion: 1
data:
  APPLICATION_ENVIRONMENT: ci
  APPLICATION_VAR1: "true"
kind: ConfigMap
metadata:
  name: common
  namespace: ci
`
    },
    [qaPath]: {
      'app.yml': `
apiVersion: 1
data:
  APPLICATION_ENVIRONMENT: qa
  APPLICATION_VAR2: avalue
kind: ConfigMap
metadata:
  name: common
  namespace: ci
    `
    },
  });
});

beforeEach(() => {
  jest.resetModules()
  jest.spyOn(core, 'getInput').mockImplementation((name: string): string => {
    if (name === 'configmaps-paths') return './ci/apps/configmaps/common.yml,./qa/apps/configmaps/app.yml'
    if (name === 'configmaps-directory') return `${rootPath}`
    return ''
  })
})

afterAll(() => {
  mock.restore();
});

describe('action', () => {
  it('runs', async () => {
    await expect(run()).resolves.not.toThrow()
  })

  it('sets variables', async () => {
    const mock = jest.spyOn(core, 'exportVariable').mockImplementation((name: string, val: any): string => {
      return `${name} = ${val}`
    })

    await run()
    expect(mock).toHaveBeenCalledWith('APPLICATION_ENVIRONMENT', 'qa')
    expect(mock).toHaveBeenLastCalledWith('APPLICATION_VAR2', 'avalue')
  })
})
