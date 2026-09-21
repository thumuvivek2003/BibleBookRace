import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { cn } from '@/utils/cn.js';

/**
 * Drag (or tap) book cards into numbered boxes to put them in canonical order.
 *
 * Two ways to answer, on purpose:
 *  - drag, which is what makes it feel like a game;
 *  - tap a card then tap a box, which works with a shaky hand, a stylus, a
 *    trackpad or a screen reader, and is how most kids will actually use it.
 *
 * The board is presentational: it owns no rules. The parent holds
 * `placements` (slot index -> card id) and decides what a correct answer is.
 *
 * @param {object} props
 * @param {{id: string, label: string}[]} props.cards        every card, in shuffled order
 * @param {(string|null)[]} props.placements                 one entry per slot
 * @param {(slot: number, cardId: string|null) => void} props.onPlace
 * @param {boolean} [props.locked]
 * @param {object} props.labels hint, tapHint, slot, empty, pool, dragInstructions
 */
const POOL_ID = 'pool';

export function OrderingBoard({ cards, placements, onPlace, locked = false, labels }) {
  const [draggingId, setDraggingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  // A few pixels of movement before a drag starts, so a tap stays a tap.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  );

  const placedIds = new Set(placements.filter(Boolean));
  const pool = cards.filter((card) => !placedIds.has(card.id));
  const cardById = (id) => cards.find((card) => card.id === id);

  /** Puts a card in a slot, evicting whatever was there. */
  const place = (slot, cardId) => {
    if (locked || !cardId) return;
    onPlace(slot, cardId);
    setSelectedId(null);
  };

  const handleDragEnd = ({ active, over }) => {
    setDraggingId(null);
    if (!over) return;
    if (over.id === POOL_ID) {
      const from = placements.indexOf(active.id);
      if (from !== -1) onPlace(from, null);
      return;
    }
    place(Number(over.id), active.id);
  };

  /** Tap flow: first tap picks a card up, second tap drops it in a box. */
  const handleSlotTap = (slot) => {
    if (locked) return;
    if (selectedId) {
      place(slot, selectedId);
      return;
    }
    if (placements[slot]) onPlace(slot, null); // tap a filled box to take it back
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      // dnd-kit's built-in screen reader text is English only; this app is not.
      accessibility={{ screenReaderInstructions: { draggable: labels.dragInstructions } }}
      onDragStart={({ active }) => {
        setDraggingId(active.id);
        setSelectedId(null);
      }}
      onDragCancel={() => setDraggingId(null)}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <ol className="space-y-2">
          {placements.map((cardId, slot) => (
            <Slot
              key={slot}
              slot={slot}
              card={cardId ? cardById(cardId) : null}
              locked={locked}
              armed={Boolean(selectedId)}
              label={labels.slot.replace('{position}', String(slot + 1))}
              emptyLabel={labels.empty}
              onTap={() => handleSlotTap(slot)}
              onCardTap={() => !locked && onPlace(slot, null)}
            />
          ))}
        </ol>

        <Pool
          cards={pool}
          locked={locked}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId((current) => (current === id ? null : id))}
          labels={labels}
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {draggingId ? <CardFace label={cardById(draggingId)?.label} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Slot({ slot, card, locked, armed, label, emptyLabel, onTap, onCardTap }) {
  const { setNodeRef, isOver } = useDroppable({ id: slot, disabled: locked });

  return (
    <li ref={setNodeRef} className="flex items-stretch gap-2">
      <span className="flex w-8 shrink-0 items-center justify-center rounded-lg bg-surface-sunken font-display text-sm font-extrabold text-ink-muted">
        {slot + 1}
      </span>

      <button
        type="button"
        onClick={onTap}
        disabled={locked || (!card && !armed)}
        aria-label={label}
        className={cn(
          'flex min-h-[3rem] flex-1 items-center rounded-2xl border-2 border-dashed px-3 transition',
          card ? 'border-transparent p-1' : 'border-line bg-surface-sunken/60',
          isOver && 'border-primary bg-primary-soft',
          armed && !card && 'border-primary',
          'disabled:cursor-default',
        )}
      >
        {card ? (
          <DraggableCard id={card.id} label={card.label} locked={locked} onTap={onCardTap} placed />
        ) : (
          <span className="text-xs font-semibold text-ink-subtle">{emptyLabel}</span>
        )}
      </button>
    </li>
  );
}

function Pool({ cards, locked, selectedId, onSelect, labels }) {
  const { setNodeRef, isOver } = useDroppable({ id: POOL_ID, disabled: locked });

  return (
    <div className="space-y-1.5">
      <p className="px-1 text-center text-xs font-semibold text-ink-muted">
        {labels.hint}
        <span className="mt-0.5 block text-[11px] text-ink-subtle">{labels.tapHint}</span>
      </p>

      <div
        ref={setNodeRef}
        aria-label={labels.pool}
        className={cn(
          'flex min-h-[3.5rem] flex-wrap justify-center gap-2 rounded-card p-2 transition',
          isOver ? 'bg-primary-soft' : 'bg-surface-sunken',
        )}
      >
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            id={card.id}
            label={card.label}
            locked={locked}
            selected={selectedId === card.id}
            onTap={() => onSelect(card.id)}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({ id, label, locked, selected = false, placed = false, onTap }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, disabled: locked });

  return (
    <span
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={locked ? -1 : 0}
      onClick={(event) => {
        event.stopPropagation();
        onTap?.();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onTap?.();
        }
      }}
      className={cn(
        'touch-none select-none',
        isDragging && 'opacity-30',
        placed && 'w-full',
      )}
    >
      <CardFace label={label} selected={selected} placed={placed} />
    </span>
  );
}

function CardFace({ label, selected = false, placed = false, dragging = false }) {
  return (
    <span
      className={cn(
        'block rounded-xl px-3.5 py-2.5 text-center font-display text-sm font-bold shadow-card transition',
        placed ? 'bg-success text-white' : 'bg-surface text-ink',
        selected && 'bg-primary text-on-primary ring-2 ring-primary',
        dragging && 'rotate-2 scale-105 shadow-float',
      )}
    >
      {label}
    </span>
  );
}
