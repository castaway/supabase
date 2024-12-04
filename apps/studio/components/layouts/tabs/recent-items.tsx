import { EntityTypeIcon } from 'components/explorer/entity-type-icon'
import { ENTITY_TYPE } from 'data/entity-types/entity-type-constants'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { RecentItem } from 'state/recent-items'
import { recentItemsStore } from 'state/recent-items'
import { editorEntityTypes } from 'state/tabs'
import { useSnapshot } from 'valtio'
import { useEditorType } from '../editors/editors-layout.hooks'

dayjs.extend(relativeTime)

export function RecentItems() {
  const recentItemsSnap = useSnapshot(recentItemsStore)
  const router = useRouter()
  const editor = useEditorType()
  const { ref } = router.query

  if (!recentItemsSnap?.items || !ref) return null

  // Filter items based on editor type
  const filteredItems = recentItemsSnap.items
    .filter((item) => editorEntityTypes[editor].includes(item.type))
    .sort((a, b) => b.timestamp - a.timestamp)

  console.log('filteredItems', filteredItems)

  return (
    <div className="space-y-4">
      <h2 className="text-sm text-foreground">Recent files</h2>
      <div className="flex flex-col gap-0">
        {filteredItems.length === 0 ? (
          <motion.div
            layout
            initial={false}
            className="flex flex-col items-center justify-center p-8 text-center border rounded-md border-muted gap-3"
          >
            <EntityTypeIcon type={'r' as ENTITY_TYPE} />
            <div>
              <p className="text-xs text-foreground-light">No recent items yet</p>
              <p className="text-xs text-foreground-lighter">
                Items will appear here as you browse through your project
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 gap-12 gap-y-0">
              {filteredItems.map((item: RecentItem, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: index * 0.012, duration: 0.15 }}
                >
                  <Link
                    href={`/project/${ref}/${
                      item.type === 'sql'
                        ? `sql/${item.metadata?.sqlId}`
                        : item.type === 'r' ||
                            item.type === 'v' ||
                            item.type === 'm' ||
                            item.type === 'f' ||
                            item.type === 'p'
                          ? `editor/${item.metadata?.tableId}?schema=${item.metadata?.schema}`
                          : `explorer/${item.type}/${item.metadata?.schema}/${item.metadata?.name}`
                    }`}
                    className="flex items-center gap-4 rounded-lg bg-surface-100 py-2 transition-colors hover:bg-surface-200"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-surface-100 border">
                      <EntityTypeIcon type={item.type} />
                    </div>
                    <div className="flex flex-1 gap-5 items-center">
                      <span className="text-sm text-foreground">
                        <span className="text-foreground-lighter">{item.metadata?.schema}</span>
                        {item.metadata?.schema && <span className="text-foreground-light">.</span>}
                        <span className="text-foreground">{item.label || 'Untitled'}</span>
                      </span>
                      <div className="bg-border-muted flex grow h-px"></div>
                      <span className="text-xs text-foreground-lighter">
                        {dayjs(item.timestamp).fromNow()}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
