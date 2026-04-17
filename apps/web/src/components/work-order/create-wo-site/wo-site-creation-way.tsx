import { Building2, Plus } from "lucide-react";
import React from "react";

import { UseFormSetValue } from "react-hook-form";

interface Props {
  setSiteChoice: (choice: "existing" | "new") => void;
  setStep: (step: number) => void;
  setValue: UseFormSetValue<any>;
  clearErrors: () => void;
  workOrder: {
    id: number;
    office_id: number;
    client_id: number;
    process_type?: string;
  };
}

const WOSiteCreationWay = ({
  setSiteChoice,
  setStep,
  setValue,
  clearErrors,
  workOrder,
}: Props) => {
  return (
    <div className='flex flex-col gap-8 py-6'>
      <div className='text-center space-y-2'>
        <h3 className='text-xl font-semibold text-slate-800 uppercase tracking-tight'>
          Choose Site Method
        </h3>
        <p className='text-muted-foreground'>
          How would you like to link a site to this work order?
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <button
          type='button'
          onClick={() => {
            setSiteChoice("existing");
            setStep(2);
            setValue("new_site", undefined);
            clearErrors();
          }}
          className='flex flex-col cursor-pointer items-center justify-center p-10 border-2 border-gray-200 rounded-xl hover:border-gray-200 hover:bg-gray-50/50 hover:shadow-xl hover:shadow-gray-50/10 transition-all group relative overflow-hidden'>
          <div className='absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors' />
          <div className='p-5 rounded-2xl bg-primary/10 group-hover:scale-110 transition-transform mb-6'>
            <Building2 className='size-6 text-gray-700' />
          </div>
          <h3 className='text-xl font-semibold text-slate-800'>
            Existing Site
          </h3>
          <p className='text-sm text-center text-slate-500 mt-3 max-w-[200px]'>
            Select from previously created sites for this office
          </p>
        </button>

        <button
          type='button'
          onClick={() => {
            setSiteChoice("new");
            setStep(2);
            setValue("new_site", {
              office_id: workOrder.office_id,
              name: "",
              address: "",
              city: "",
              state: "",
              pincode: "",
            });
            setValue("site_id", undefined);
            clearErrors();
          }}
          className='flex flex-col cursor-pointer items-center justify-center p-10 border-2 border-gray-200 rounded-xl hover:border-gray-200 hover:bg-gray-50/50 hover:shadow-xl hover:shadow-gray-50/10 transition-all group relative overflow-hidden'>
          <div className='absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors' />
          <div className='p-5 rounded-2xl bg-emerald-100 group-hover:scale-110 transition-transform mb-6'>
            <Plus className='size-6 text-emerald-700' />
          </div>
          <h3 className='text-xl font-semibold text-slate-700'>New Site</h3>
          <p className='text-sm text-center text-slate-500 mt-3 max-w-[200px]'>
            Create a new site entity and add it to the work order
          </p>
        </button>
      </div>
    </div>
  );
};

export default WOSiteCreationWay;
