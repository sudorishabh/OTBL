"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClipboardList, Plus } from "lucide-react";

type EmptyActivitiesStateProps = {
  onCreate: () => void;
};

const EmptyActivitiesState: React.FC<EmptyActivitiesStateProps> = ({
  onCreate,
}) => (
  <Card className='p-10 text-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-dashed border-2'>
    <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center'>
      <ClipboardList className='w-8 h-8 text-slate-400' />
    </div>
    <h4 className='font-semibold text-lg mb-2'>No Activities Yet</h4>
    <p className='text-muted-foreground mb-6 max-w-sm mx-auto'>
      Create your first activity to start tracking work estimates, orders, and
      expenses for this site.
    </p>
    <Button
      onClick={onCreate}
      className='gap-2'>
      <Plus className='w-4 h-4' />
      Create First Activity
    </Button>
  </Card>
);

export default EmptyActivitiesState;
