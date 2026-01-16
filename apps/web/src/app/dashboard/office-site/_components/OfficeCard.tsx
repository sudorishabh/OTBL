import { ArrowUpRight, Loader, Plus } from "lucide-react";
import React, { useState } from "react";
import SitesTable from "./OfficeSiteTable";
import { capitalizeEachWord, capitalFirstLetter } from "@pkg/utils";
import CustomButton from "@/components/CustomButton";
import AddSiteDialog from "./office-site-dialogs/AddSiteDialog";
import { trpc } from "@/lib/trpc";
import useHandleParams from "@/hooks/useHandleParams";
import OfficeDetailsDialog from "./office-site-dialogs/OfficeDetailsDialog";

type Site = {
  id: number;
  name: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  office_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  users: {
    id: number;
    name: string;
    email: string;
    role: string;
  }[];
};

type Office = {
  id: number;
  name: string;
  address: string;
  state: string;
  city: string;
  gst_number: string;
  pincode: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
  //   sites: Site[];
  operators: {
    id: number;
    name: string;
    email: string;
    role: string;
  }[];
  manager: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
};

const OfficeCard: React.FC<{ office: Office }> = ({ office }) => {
  const { setParams } = useHandleParams();

  const handleAddSiteDialogOpen = () => {
    setParams({
      siteMode: "add",
      officeId: office.id.toString(),
      officeName: office.name,
    });
  };

  const handleOfficeDetailsDialogOpen = () => {
    setParams({
      officeMode: "view",
      officeId: office.id.toString(),
      officeName: office.name,
    });
  };

  return (
    <div className='bg-white rounded-xl hover:border-emerald-400 border border-gray-50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden  p-4'>
      <div className='flex items-start justify-between border- pb-2 mb-2'>
        <div>
          <div>
            <div className='flex items-center relative gap-3'>
              <h3 className='text-gray-800 font-medium'>
                {capitalizeEachWord(office.name)}
              </h3>
              <div className='bg-sky-100 group rounded-full text-xs text-sky-800 flex items-center px-2.5 py-0.5 max-w-full'>
                <span className='text-sky-700 text-[11px] font-medium'>
                  Info...
                </span>

                <div className='hidden group-hover:block absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-md drop-shadow-xl p-3 text-sm text-gray-700 z-30'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <div className='font-medium text-gray-800'>
                        {capitalizeEachWord(office.name)}
                      </div>
                      <div className='text-xs text-gray-600 mt-1 whitespace-pre-line'>
                        {office.address}
                        {office.city ? `, ${office.city}` : ""}
                        {office.state ? `, ${office.state}` : ""} -{" "}
                        {office.pincode}
                      </div>
                      <div className='text-xs text-gray-500 mt-2'>
                        Email: {office.email}
                      </div>
                      <div className='text-xs text-gray-500'>
                        GST: {office.gst_number}
                      </div>
                      {office.manager?.name ? (
                        <div className='text-xs text-gray-500'>
                          Manager: {capitalFirstLetter(office.manager.name)}
                        </div>
                      ) : null}
                      {office.operators.length > 0 ? (
                        <div className='text-xs text-gray-500'>
                          Operators: {office.operators.length}
                        </div>
                      ) : null}
                    </div>
                    <div className='text-right'>
                      <div
                        className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${office.status === "Active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}`}>
                        {office.status}
                      </div>
                      <div className='text-xs text-gray-400 mt-2'>
                        Created:
                        {new Date(office.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {(office.manager?.name || office.operators.length > 0) && (
            <div className='text-xs text-gray-500 mt-1'>
              {office.manager?.name ? (
                <span className='mr-3'>
                  Manager: {capitalFirstLetter(office.manager.name)}
                </span>
              ) : null}
              {office.operators.length > 0 ? (
                <span>Operators: {office.operators.length}</span>
              ) : null}
            </div>
          )}
          <div className='mt-1'></div>
        </div>
        <div className='text-right flex items-center gap-4'>
          <div
            className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
              office.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}>
            {capitalFirstLetter(office.status)}
          </div>

          <CustomButton
            arrowType='upright'
            variant='arrow'
            onClick={handleOfficeDetailsDialogOpen}
          />
          <CustomButton
            text='Create Site'
            Icon={Plus}
            variant='outline'
            onClick={handleAddSiteDialogOpen}
          />
        </div>
      </div>

      <div className='mt-  p- rounded-xl '>
        <div className='flex items-center'></div>
        <SitesTable officeId={office.id} />
      </div>

      <AddSiteDialog />
      <OfficeDetailsDialog />
    </div>
  );
};
export default OfficeCard;
