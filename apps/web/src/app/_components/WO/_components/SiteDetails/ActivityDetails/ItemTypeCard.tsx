"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  FileText,
  Loader2,
  ChevronDown,
  Package,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { ITEM_TYPE_LABELS, type PhaseType } from "../types";
import { ImprovedItemCard } from "../ItemDisplay";

export type ItemTypeCardProps = {
  itemType: string;
  phase: PhaseType;
  items: any[];
  hasEntry: boolean;
  onAddItem: () => void;
  isLoading: boolean;
};

const ItemTypeCard: React.FC<ItemTypeCardProps> = ({
  itemType,
  phase,
  items,
  hasEntry,
  onAddItem,
  isLoading,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <Card className='overflow-hidden'>
      {/* Header - Clickable */}
      <div
        className={`flex items-center justify-between p-4 ${phase.bgColor} border-b ${phase.borderColor} cursor-pointer hover:brightness-95 transition-all`}
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className='flex items-center gap-3'>
          <div
            className={`w-10 h-10 rounded-lg ${phase.color} flex items-center justify-center shadow-sm`}>
            <FileText className='w-5 h-5 text-white' />
          </div>
          <div>
            <h4 className='font-semibold text-sm'>
              {ITEM_TYPE_LABELS[itemType] || itemType}
            </h4>
            <p className={`text-xs ${phase.textColor}`}>
              {hasEntry ? (
                <span className='flex items-center gap-1'>
                  <CheckCircle2 className='w-3 h-3' />
                  Entry completed
                </span>
              ) : (
                <span className='flex items-center gap-1'>
                  <Clock className='w-3 h-3' />
                  Pending entry
                </span>
              )}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* Add button - only show if no entry */}
          {!hasEntry && !isLoading && (
            <Button
              size='sm'
              variant='outline'
              className={`gap-1.5 ${phase.textColor} border-current hover:${phase.bgColor}`}
              onClick={(e) => {
                e.stopPropagation();
                onAddItem();
              }}>
              <Plus className='w-4 h-4' />
              Add Entry
            </Button>
          )}
          {/* Expand/Collapse indicator */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}>
            <ChevronDown className='w-5 h-5 text-muted-foreground' />
          </div>
        </div>
      </div>

      {/* Content - Slide Down */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}>
        <div className='p-4 bg-white dark:bg-slate-900'>
          {isLoading ? (
            <div className='flex items-center justify-center py-6'>
              <Loader2 className='w-5 h-5 animate-spin text-muted-foreground' />
            </div>
          ) : !hasEntry ? (
            <EmptyItemState
              phase={phase}
              onAddItem={onAddItem}
            />
          ) : (
            items.map((item: any, index: number) => (
              <ImprovedItemCard
                key={item.id || index}
                item={item}
                itemType={itemType}
                phase={phase}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

// Sub-component: Empty Item State
const EmptyItemState: React.FC<{
  phase: PhaseType;
  onAddItem: () => void;
}> = ({ phase, onAddItem }) => (
  <div className='text-center py-6 text-muted-foreground'>
    <Package className='w-10 h-10 mx-auto mb-2 opacity-30' />
    <p className='text-sm'>No entry yet</p>
    <Button
      size='sm'
      variant='link'
      className={`mt-2 ${phase.textColor}`}
      onClick={onAddItem}>
      <Plus className='w-3.5 h-3.5 mr-1' />
      Add first entry
    </Button>
  </div>
);

export default ItemTypeCard;
