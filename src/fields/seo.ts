import type { Field } from 'payload'
import {
  MetaDescriptionField, MetaImageField, MetaTitleField, OverviewField, PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const noIndexField: Field = {
  name: 'noIndex', type: 'checkbox', label: 'Von Suchmaschinen ausschließen', defaultValue: false,
  admin: {
    description: 'Setzt noindex und entfernt die URL aus Sitemap und llms.txt. Die Seite bleibt öffentlich erreichbar; dies ist kein Zugriffsschutz.',
  },
}

export const seoFields: Field[] = [
  OverviewField({ titlePath: 'meta.title', descriptionPath: 'meta.description', imagePath: 'meta.image' }),
  MetaTitleField({ hasGenerateFn: true }),
  MetaImageField({ relationTo: 'media' }),
  MetaDescriptionField({}),
  noIndexField,
  PreviewField({ hasGenerateFn: true, titlePath: 'meta.title', descriptionPath: 'meta.description' }),
]
