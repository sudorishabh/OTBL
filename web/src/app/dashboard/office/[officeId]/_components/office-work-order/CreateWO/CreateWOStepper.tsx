import React from "react";
import { FileText, MapPin, CheckCircle2, IndianRupee } from "lucide-react";

interface Props {
  step: number;
}

const CreateWOStepper = ({ step }: Props) => {
  const steps = [
    {
      number: 1,
      title: "Details",
      description: "Work order information",
      icon: FileText,
      isActive: step === 1,
      isCompleted: step > 1,
    },
    {
      number: 2,
      title: "Site Assignment",
      description: "Select or create sites",
      icon: MapPin,
      isActive: step === 2,
      isCompleted: step > 2,
    },
  ];

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between'>
        {steps.map((stepItem, index) => (
          <React.Fragment key={stepItem.number}>
            <div className='flex flex-col items-center space-y-3'>
              {/* Step Circle */}
              <div className='relative'>
                <div
                  className={`flex size-9 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    stepItem.isActive
                      ? "border-gray-500 bg-gray-500 text-white shadow-lg shadow-gray-200 dark:shadow-gray-900/30"
                      : stepItem.isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800"
                  }`}>
                  {stepItem.isCompleted ? (
                    <CheckCircle2 className='size-5' />
                  ) : (
                    <stepItem.icon className='size-5' />
                  )}
                </div>

                {/* Step Number Badge */}
                <div
                  className={`absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    stepItem.isActive
                      ? "bg-gray-700 text-white"
                      : stepItem.isCompleted
                      ? "bg-green-700 text-white"
                      : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}>
                  {stepItem.number}
                </div>
              </div>

              {/* Step Info */}
              <div className='text-center'>
                <h4
                  className={`text-sm font-semibold transition-colors ${
                    stepItem.isActive
                      ? "text-gray-600 dark:text-gray-400"
                      : stepItem.isCompleted
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}>
                  {stepItem.title}
                </h4>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {stepItem.description}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className='flex-1 mx-4'>
                <div
                  className={`h-0.5 w-full transition-colors duration-200 ${
                    stepItem.isCompleted
                      ? "bg-green-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CreateWOStepper;
