import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const StepperCreateWO = ({ steps }: { steps: any }) => {
  return (
    <Card className='border-0 shadow-none py-0'>
      <CardContent className='p-0 bg-transparent pl-2 mb-4'>
        <div className='flex items-center gap-3'>
          {steps.map((stepItem: any, index: number) => (
            <React.Fragment key={stepItem.number}>
              <div className='flex items-center gap-2'>
                <div
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                    stepItem.isCompleted
                      ? "bg-emerald-500 text-white"
                      : stepItem.isActive
                        ? "bg-sky-700 text-white"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}>
                  {stepItem.isCompleted ? (
                    <Check className='size-4' />
                  ) : (
                    stepItem.number
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    stepItem.isCompleted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : stepItem.isActive
                        ? "text-sky-700 dark:text-sky-400"
                        : "text-gray-500 dark:text-gray-400"
                  }`}>
                  {stepItem.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-px w-8 ${
                    stepItem.isCompleted
                      ? "bg-emerald-400"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StepperCreateWO;
