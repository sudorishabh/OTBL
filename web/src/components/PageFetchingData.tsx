import React from "react";
import { LucideIcon } from "lucide-react";

interface PageFetchingDataProps {
  /** Icon to display in the loading state */
  icon?: LucideIcon;
  /** Title text to show while loading */
  title?: string;
  /** Description text to show while loading */
  description?: string;
  /** Loading message at the bottom */
  loadingText?: string;
  /** Minimum height of the container */
  minHeight?: string;
  /** Show progress indicator dots */
  showProgress?: boolean;
}

const PageFetchingData: React.FC<PageFetchingDataProps> = ({
  icon: Icon,
  title = "Loading...",
  description = "Please wait while we fetch your data",
  loadingText = "Loading data...",
  minHeight = "400px",
  showProgress = true,
}) => {
  return (
    <div
      className='flex flex-col items-center justify-center space-y-8'
      style={{ minHeight }}>
      {/* Loading Icon */}
      <div className='flex flex-col items-center space-y-4'>
        {Icon && (
          <div className='relative'>
            <Icon className='h-12 w-12 text-gray-300 animate-pulse' />
            <div className='absolute inset-0 rounded-full bg-gray-200 animate-ping opacity-20'></div>
          </div>
        )}
        <div className='text-center space-y-2'>
          <h3 className='text-lg font-medium text-gray-600'>{title}</h3>
          <p className='text-sm text-gray-500'>{description}</p>
        </div>
      </div>

      {/* Loading Progress Indicator */}
      {showProgress && (
        <div className='flex items-center space-x-2'>
          <div className='flex space-x-1'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className='h-2 w-2 bg-gray-300 rounded-full animate-pulse'
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: "1.5s",
                }}
              />
            ))}
          </div>
          <span className='text-sm text-gray-500 ml-2'>{loadingText}</span>
        </div>
      )}
    </div>
  );
};

export default PageFetchingData;
