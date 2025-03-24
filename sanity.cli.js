import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '48khq3nj',
    dataset: 'appres'
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
