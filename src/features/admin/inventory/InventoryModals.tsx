import { Modal } from "@/components/ui/Modal"
import { EditInventoryItemModal, InventoryHandoverModal, InventoryItemDetailsModal, LogNewItemModal } from "@/features/admin/modals"
import type { InventoryRow } from "./types"

type InventoryModalsProps = {
  showFastEntry: boolean
  editItem: InventoryRow | null
  detailsItem: InventoryRow | null
  handoverItem: InventoryRow | null
  onCloseFastEntry: () => void
  onCloseEdit: () => void
  onCloseDetails: () => void
  onCloseHandover: () => void
  onRefresh: () => void
}

export function InventoryModals({
  showFastEntry,
  editItem,
  detailsItem,
  handoverItem,
  onCloseFastEntry,
  onCloseEdit,
  onCloseDetails,
  onCloseHandover,
  onRefresh,
}: InventoryModalsProps) {
  return (
    <>
      <Modal
        isOpen={showFastEntry}
        onClose={onCloseFastEntry}
        className="w-full max-w-xl bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200 p-0"
      >
        <LogNewItemModal onClose={onCloseFastEntry} onSaved={onRefresh} />
      </Modal>

      <Modal
        isOpen={Boolean(editItem)}
        onClose={onCloseEdit}
        className="w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200 p-0"
      >
        {editItem && <EditInventoryItemModal item={editItem} onClose={onCloseEdit} onSaved={onRefresh} />}
      </Modal>

      <Modal
        isOpen={Boolean(detailsItem)}
        onClose={onCloseDetails}
        className="w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200 p-0"
      >
        {detailsItem && <InventoryItemDetailsModal item={detailsItem} onClose={onCloseDetails} />}
      </Modal>

      <Modal
        isOpen={Boolean(handoverItem)}
        onClose={onCloseHandover}
        className="w-full max-w-3xl bg-white rounded-xl overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200 p-0"
      >
        {handoverItem && (
          <InventoryHandoverModal
            item={{ id: handoverItem.id, code: handoverItem.code, title: handoverItem.title, status: handoverItem.status }}
            onClose={onCloseHandover}
            onCompleted={onRefresh}
          />
        )}
      </Modal>
    </>
  )
}
