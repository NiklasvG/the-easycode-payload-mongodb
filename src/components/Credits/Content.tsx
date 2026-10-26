import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type { ContentBlock } from '@/payload-types'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import styles from './credits.module.css'

function hasContent(node: DefaultTypedEditorState['root']['children'][number]): boolean {
  if ('text' in node && typeof node.text === 'string') return node.text.trim().length > 0
  if ('children' in node && Array.isArray(node.children)) return node.children.some(hasContent)
  return !['paragraph', 'heading', 'linebreak'].includes(node.type)
}

// Split at editorial h2 boundaries, preserving every node and all link fields.
// This also supports introductions, additional sources and non-heading content.
export function groupCreditSections(data: DefaultTypedEditorState): DefaultTypedEditorState[] {
  const groups: DefaultTypedEditorState['root']['children'][] = []
  for (const node of data.root.children) {
    if (
      groups.length === 0 ||
      (node.type === 'heading' &&
        'tag' in node &&
        node.tag === 'h2' &&
        groups[groups.length - 1].some(hasContent))
    ) {
      groups.push([])
    }
    groups[groups.length - 1].push(node)
  }
  return groups
    .filter((children) => children.some(hasContent))
    .map((children) => ({ ...data, root: { ...data.root, children } }))
}

export function CreditsContent({ columns, id }: ContentBlock) {
  if (!columns?.length) return null

  return (
    <section className={`container ${styles.sources}`}>
      <div className={styles.grid}>
        {columns.map((column, columnIndex) => {
          const groups = column.richText ? groupCreditSections(column.richText) : []
          return (
            <div
              key={column.id || columnIndex}
              className={styles.column}
              data-size={column.size || 'full'}
            >
              {groups.map((data, index) => (
                <div key={`${id}-${columnIndex}-${index}`} className={styles.card}>
                  <span className={styles.marker} aria-hidden="true" />
                  <RichText data={data} enableGutter={false} className={styles.sourceText} />
                </div>
              ))}
              {column.enableLink && column.link && (
                <div className={styles.columnLink}>
                  <CMSLink {...column.link} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
