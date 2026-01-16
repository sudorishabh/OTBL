"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import {
  FileText,
  DollarSign,
  Package,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Info,
} from "lucide-react";
import { useApiError } from "@/hooks/useApiError";

// Activity item types mapping
const ACTIVITY_ITEM_TYPES: Record<string, { label: string; color: string }> = {
  zero_days: { label: "Zero Day Activity", color: "blue" },
  zero_day_samples: { label: "Zero Day Sample", color: "indigo" },
  tph: { label: "TPH Activity", color: "purple" },
  oil_zappers: { label: "Oil Zapper", color: "pink" },
  clean_up_oil_spill: { label: "Clean Up Oil Spill", color: "red" },
  lifting_oil_slush: { label: "Lifting Oil Slush", color: "orange" },
  excavation_cont_soil: {
    label: "Excavation Contaminated Soil",
    color: "amber",
  },
  trnsprt_oil_slush: { label: "Transport Oil Slush", color: "yellow" },
};

// Phase configuration
const PHASES = [
  {
    key: "work_estimate",
    label: "Work Estimate",
    icon: FileText,
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200",
    iconColor: "text-blue-500",
  },
  {
    key: "order",
    label: "Order",
    icon: Package,
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200",
    iconColor: "text-amber-500",
  },
  {
    key: "expense",
    label: "Expense",
    icon: DollarSign,
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200",
    iconColor: "text-green-500",
  },
] as const;

type Props = {
  siteActivityId: number;
  onAddItem?: (phase: string, tableName: string) => void;
  onEditItem?: (item: any) => void;
  onDeleteItem?: (item: any) => void;
  refreshKey?: number;
};

const ActivityItemsPhaseView: React.FC<Props> = ({
  siteActivityId,
  onAddItem,
  onEditItem,
  onDeleteItem,
  refreshKey,
}) => {
  const { handleError } = useApiError();
  const [activePhase, setActivePhase] = React.useState<string>("work_estimate");

  // Fetch items grouped by phase
  const itemsByPhaseQuery = trpc.siteActivityQuery.getItemsByPhase.useQuery(
    { id: siteActivityId },
    { enabled: !!siteActivityId }
  );

  // Refetch when refreshKey changes
  React.useEffect(() => {
    if (refreshKey) {
      itemsByPhaseQuery.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const getItemTypeInfo = (tableName: string) => {
    return (
      ACTIVITY_ITEM_TYPES[tableName] || { label: tableName, color: "gray" }
    );
  };

  const formatAmount = (amount: string | number | null | undefined) => {
    if (!amount) return null;
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (itemsByPhaseQuery.isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='w-6 h-6 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (itemsByPhaseQuery.isError) {
    return (
      <div className='text-center py-8 text-red-500'>
        Failed to load items. Please try again.
      </div>
    );
  }

  const data = itemsByPhaseQuery.data || {
    work_estimate: [],
    order: [],
    expense: [],
  };

  return (
    <Tabs
      value={activePhase}
      onValueChange={setActivePhase}
      className='w-full'>
      <TabsList className='grid w-full grid-cols-3 mb-4'>
        {PHASES.map((phase) => {
          const Icon = phase.icon;
          const count = data[phase.key as keyof typeof data]?.length || 0;
          return (
            <TabsTrigger
              key={phase.key}
              value={phase.key}
              className={`flex items-center gap-2 data-[state=active]:${phase.bgColor}`}>
              <Icon className={`w-4 h-4 ${phase.iconColor}`} />
              <span className='hidden sm:inline'>{phase.label}</span>
              <Badge
                variant={activePhase === phase.key ? "default" : "outline"}
                className='ml-1 text-xs'>
                {count}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {PHASES.map((phase) => (
        <TabsContent
          key={phase.key}
          value={phase.key}>
          <div
            className={`rounded-lg p-4 ${phase.bgColor} ${phase.borderColor} border`}>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <phase.icon className={`w-5 h-5 ${phase.iconColor}`} />
                <h4 className='font-semibold'>{phase.label}</h4>
                <Badge variant='secondary'>
                  {data[phase.key as keyof typeof data]?.length || 0} items
                </Badge>
              </div>
              {onAddItem && (
                <Button
                  size='sm'
                  variant='outline'
                  className='gap-1'
                  onClick={() => onAddItem(phase.key, "")}>
                  <Plus className='w-4 h-4' />
                  Add Item
                </Button>
              )}
            </div>

            <ScrollArea className='max-h-[400px]'>
              <div className='grid gap-3'>
                {(data[phase.key as keyof typeof data] || []).map(
                  (item: any, idx: number) => {
                    const typeInfo = getItemTypeInfo(item.table_name);
                    return (
                      <Card
                        key={`${item.table_name}-${item.item_id}-${idx}`}
                        className='p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow'>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-2'>
                              <Badge
                                variant='outline'
                                className={`text-xs bg-${typeInfo.color}-100 text-${typeInfo.color}-700 border-${typeInfo.color}-300`}>
                                {typeInfo.label}
                              </Badge>
                              <span className='text-xs text-muted-foreground'>
                                #{item.item_id}
                              </span>
                            </div>

                            {item.activity_description && (
                              <p className='text-sm text-foreground mb-2 line-clamp-2'>
                                {item.activity_description}
                              </p>
                            )}

                            <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
                              {item.amount && (
                                <span className='font-medium text-green-600'>
                                  {formatAmount(item.amount)}
                                </span>
                              )}

                              {/* Dimension fields based on item type */}
                              {(item.length || item.length_metric) && (
                                <span>
                                  L: {item.length || item.length_metric}m
                                </span>
                              )}
                              {(item.width || item.width_metric) && (
                                <span>
                                  W: {item.width || item.width_metric}m
                                </span>
                              )}
                              {(item.depth || item.depth_metric) && (
                                <span>
                                  D: {item.depth || item.depth_metric}m
                                </span>
                              )}
                              {item.height && <span>H: {item.height}m</span>}

                              {item.volume_informed && (
                                <span>Vol: {item.volume_informed} m³</span>
                              )}
                              {item.volume_a1 && (
                                <span>Vol A1: {item.volume_a1}</span>
                              )}
                              {item.result_a && (
                                <span>Result A: {item.result_a}</span>
                              )}
                              {item.tph_value && (
                                <span>TPH: {item.tph_value}</span>
                              )}

                              {item.sample_collection_date && (
                                <span className='flex items-center gap-1'>
                                  <Calendar className='w-3 h-3' />
                                  {format(
                                    new Date(item.sample_collection_date),
                                    "PP"
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className='flex items-center gap-1'>
                            {onEditItem && (
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-8 w-8 p-0'
                                onClick={() => onEditItem(item)}>
                                <Edit className='w-4 h-4' />
                              </Button>
                            )}
                            {onDeleteItem && (
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-8 w-8 p-0 text-red-500 hover:text-red-600'
                                onClick={() => onDeleteItem(item)}>
                                <Trash2 className='w-4 h-4' />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  }
                )}

                {(data[phase.key as keyof typeof data] || []).length === 0 && (
                  <div className='text-center py-8 text-muted-foreground'>
                    <Info className='w-8 h-8 mx-auto mb-2 opacity-50' />
                    <p className='text-sm'>
                      No items in {phase.label} phase yet.
                    </p>
                    {onAddItem && (
                      <Button
                        size='sm'
                        variant='link'
                        className='mt-2'
                        onClick={() => onAddItem(phase.key, "")}>
                        <Plus className='w-4 h-4 mr-1' />
                        Add first item
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default ActivityItemsPhaseView;
