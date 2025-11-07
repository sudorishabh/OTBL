"use client";

import React, { useState } from "react";
// import { trpc } from "@/lib/trpc"; // Uncomment when ready to use

/**
 * Example: 0 Day Activity Form Component
 *
 * This component demonstrates how to create a form for collecting
 * 0 Day Activity data (measurements and volume calculations)
 */

interface ZeroDayActivityFormProps {
  siteActivityId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ZeroDayActivityForm: React.FC<ZeroDayActivityFormProps> = ({
  siteActivityId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    length_metric: "",
    width_metric: "",
    depth_metric: "",
    volume_informed: "",
    document_url: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Calculate volume automatically
  const calculateVolume = () => {
    const length = parseFloat(formData.length_metric);
    const width = parseFloat(formData.width_metric);
    const depth = parseFloat(formData.depth_metric);

    if (length && width && depth) {
      const volume = length * width * depth;
      setFormData((prev) => ({
        ...prev,
        volume_informed: volume.toFixed(2),
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Uncomment and use when TRPC is set up
      // await trpc.activity.addZeroDayActivityData.mutate({
      //   site_activity_id: siteActivityId,
      //   length_metric: parseFloat(formData.length_metric),
      //   width_metric: parseFloat(formData.width_metric),
      //   depth_metric: parseFloat(formData.depth_metric),
      //   volume_informed: parseFloat(formData.volume_informed),
      //   document_url: formData.document_url || undefined,
      // });

      console.log("Submitting 0 Day Activity data:", {
        site_activity_id: siteActivityId,
        ...formData,
      });

      // Call success callback
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting 0 Day Activity data:", error);
      alert("Failed to submit activity data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <h2 className='text-xl font-semibold mb-4'>0 Day Activity</h2>
      <p className='text-gray-600 mb-6'>
        Record initial site measurements and volume calculations
      </p>

      <form
        onSubmit={handleSubmit}
        className='space-y-4'>
        {/* Length */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Length (metric)
          </label>
          <input
            type='number'
            step='0.01'
            value={formData.length_metric}
            onChange={(e) => {
              setFormData({ ...formData, length_metric: e.target.value });
            }}
            onBlur={calculateVolume}
            className='w-full border border-gray-300 rounded px-3 py-2'
            required
          />
        </div>

        {/* Width */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Width (metric)
          </label>
          <input
            type='number'
            step='0.01'
            value={formData.width_metric}
            onChange={(e) => {
              setFormData({ ...formData, width_metric: e.target.value });
            }}
            onBlur={calculateVolume}
            className='w-full border border-gray-300 rounded px-3 py-2'
            required
          />
        </div>

        {/* Depth */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Depth (metric)
          </label>
          <input
            type='number'
            step='0.01'
            value={formData.depth_metric}
            onChange={(e) => {
              setFormData({ ...formData, depth_metric: e.target.value });
            }}
            onBlur={calculateVolume}
            className='w-full border border-gray-300 rounded px-3 py-2'
            required
          />
        </div>

        {/* Volume */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Volume Informed (m³)
          </label>
          <input
            type='number'
            step='0.01'
            value={formData.volume_informed}
            onChange={(e) => {
              setFormData({ ...formData, volume_informed: e.target.value });
            }}
            className='w-full border border-gray-300 rounded px-3 py-2 bg-gray-50'
            required
          />
          <p className='text-xs text-gray-500 mt-1'>
            Calculated: {formData.length_metric} × {formData.width_metric} ×{" "}
            {formData.depth_metric}
          </p>
        </div>

        {/* Document Upload */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Supporting Document URL
          </label>
          <input
            type='text'
            value={formData.document_url}
            onChange={(e) => {
              setFormData({ ...formData, document_url: e.target.value });
            }}
            placeholder='https://storage.example.com/document.pdf'
            className='w-full border border-gray-300 rounded px-3 py-2'
          />
          <p className='text-xs text-gray-500 mt-1'>
            Upload document separately and paste URL here
          </p>
        </div>

        {/* Buttons */}
        <div className='flex gap-3 pt-4'>
          <button
            type='submit'
            disabled={isLoading}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400'>
            {isLoading ? "Submitting..." : "Submit Activity Data"}
          </button>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-50'>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ZeroDayActivityForm;

/**
 * USAGE EXAMPLE:
 *
 * import ZeroDayActivityForm from "@/components/activities/ZeroDayActivityForm";
 *
 * function SiteActivityPage({ siteActivityId }: { siteActivityId: number }) {
 *   return (
 *     <ZeroDayActivityForm
 *       siteActivityId={siteActivityId}
 *       onSuccess={() => {
 *         console.log("Data submitted successfully");
 *         // Refresh data, close modal, etc.
 *       }}
 *       onCancel={() => {
 *         // Close form
 *       }}
 *     />
 *   );
 * }
 *
 * SIMILAR COMPONENTS TO CREATE:
 * - ZeroDaySampleForm (with density calculations)
 * - TphActivityForm (lab info and dates)
 * - OilZapperActivityForm (intimation and completion tracking)
 */
