import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'appres',

  projectId: '48khq3nj',
  dataset: 'appres',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
