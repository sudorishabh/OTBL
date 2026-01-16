"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  FileText,
  DollarSign,
  Ruler,
  Beaker,
  File,
  ExternalLink,
} from "lucide-react";
import type { PhaseType } from "../types";

export type ImprovedItemCardProps = {
  item: any;
  itemType: string;
  phase: PhaseType;
};

type SectionData = {
  title: string;
  icon: React.ReactNode;
  fields: { label: string; value: string }[];
};

const ImprovedItemCard: React.FC<ImprovedItemCardProps> = ({
  item,
  itemType,
  phase,
}) => {
  const getDisplayData = (): SectionData[] => {
    const sections: SectionData[] = [];

    // Financial section
    if (item.amount) {
      sections.push({
        title: "Financial",
        icon: <DollarSign className='w-4 h-4' />,
        fields: [
          {
            label: "Amount",
            value: `₹${Number(item.amount).toLocaleString("en-IN")}`,
          },
        ],
      });
    }

    // Dimensions section based on type
    const dimensionFields: { label: string; value: string }[] = [];
    switch (itemType) {
      case "zero_days":
        if (item.length_metric)
          dimensionFields.push({
            label: "Length",
            value: `${item.length_metric}m`,
          });
        if (item.width_metric)
          dimensionFields.push({
            label: "Width",
            value: `${item.width_metric}m`,
          });
        if (item.depth_metric)
          dimensionFields.push({
            label: "Depth",
            value: `${item.depth_metric}m`,
          });
        if (item.volume_informed)
          dimensionFields.push({
            label: "Volume",
            value: `${item.volume_informed}m³`,
          });
        break;
      case "zero_day_samples":
        if (item.length)
          dimensionFields.push({ label: "Length", value: `${item.length}m` });
        if (item.width)
          dimensionFields.push({ label: "Width", value: `${item.width}m` });
        if (item.height)
          dimensionFields.push({ label: "Height", value: `${item.height}m` });
        if (item.volume_a1)
          dimensionFields.push({ label: "Volume A1", value: item.volume_a1 });
        if (item.density_a2)
          dimensionFields.push({ label: "Density A2", value: item.density_a2 });
        if (item.result_a)
          dimensionFields.push({ label: "Result A", value: item.result_a });
        break;
      default:
        if (item.length)
          dimensionFields.push({ label: "Length", value: `${item.length}m` });
        if (item.width)
          dimensionFields.push({ label: "Width", value: `${item.width}m` });
        if (item.depth)
          dimensionFields.push({ label: "Depth", value: `${item.depth}m` });
    }

    if (dimensionFields.length > 0) {
      sections.push({
        title: "Dimensions",
        icon: <Ruler className='w-4 h-4' />,
        fields: dimensionFields,
      });
    }

    // TPH specific section
    if (itemType === "tph") {
      const tphFields: { label: string; value: string }[] = [];
      if (item.tph_value)
        tphFields.push({ label: "TPH Value", value: item.tph_value });
      if (item.sample_collection_date)
        tphFields.push({
          label: "Collection Date",
          value: format(new Date(item.sample_collection_date), "PP"),
        });
      if (item.sample_send_date)
        tphFields.push({
          label: "Send Date",
          value: format(new Date(item.sample_send_date), "PP"),
        });
      if (item.sample_report_received)
        tphFields.push({
          label: "Report Status",
          value: item.sample_report_received === "yes" ? "Received" : "Pending",
        });
      if (item.lab_info)
        tphFields.push({ label: "Lab Info", value: item.lab_info });

      if (tphFields.length > 0) {
        sections.push({
          title: "Sample Details",
          icon: <Beaker className='w-4 h-4' />,
          fields: tphFields,
        });
      }
    }

    return sections;
  };

  const sections = getDisplayData();

  return (
    <div className='space-y-4'>
      {sections.map((section, sectionIdx) => (
        <div key={sectionIdx}>
          <div className='flex items-center gap-2 mb-2'>
            <span className={`${phase.textColor}`}>{section.icon}</span>
            <h5 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
              {section.title}
            </h5>
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            {section.fields.map((field, fieldIdx) => (
              <div
                key={fieldIdx}
                className='p-3 rounded-lg bg-slate-50 dark:bg-slate-800'>
                <p className='text-[10px] uppercase tracking-wider text-muted-foreground mb-1'>
                  {field.label}
                </p>
                <p className='font-semibold text-sm'>{field.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Description */}
      {item.activity_description && (
        <DescriptionSection
          description={item.activity_description}
          phase={phase}
        />
      )}

      {/* Document Section with View Button */}
      {item.document_key && (
        <DocumentSection
          documentKey={item.document_key}
          phase={phase}
        />
      )}

      {/* Timestamp */}
      {item.created_at && (
        <p className='text-[10px] text-muted-foreground pt-2 border-t'>
          Created: {format(new Date(item.created_at), "PPp")}
        </p>
      )}
    </div>
  );
};

// Sub-component: Description Section
const DescriptionSection: React.FC<{
  description: string;
  phase: PhaseType;
}> = ({ description, phase }) => (
  <div>
    <div className='flex items-center gap-2 mb-2'>
      <FileText className={`w-4 h-4 ${phase.textColor}`} />
      <h5 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
        Description
      </h5>
    </div>
    <p className='text-sm text-muted-foreground bg-slate-50 dark:bg-slate-800 p-3 rounded-lg'>
      {description}
    </p>
  </div>
);

// Sub-component: Document Section
const DocumentSection: React.FC<{
  documentKey: string;
  phase: PhaseType;
}> = ({ documentKey, phase }) => (
  <div>
    <div className='flex items-center gap-2 mb-2'>
      <File className={`w-4 h-4 ${phase.textColor}`} />
      <h5 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
        Attached Document
      </h5>
    </div>
    <div className='flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
      <div className='flex items-center gap-2 overflow-hidden'>
        <div className='w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0'>
          <File className='w-4 h-4 text-blue-600 dark:text-blue-400' />
        </div>
        <span className='text-sm font-medium truncate'>
          {documentKey.split("/").pop() || "Document"}
        </span>
      </div>
      <Button
        size='sm'
        variant='outline'
        className='gap-1.5 shrink-0'
        onClick={() => window.open(documentKey, "_blank")}>
        <ExternalLink className='w-3.5 h-3.5' />
        View
      </Button>
    </div>
  </div>
);

export default ImprovedItemCard;
