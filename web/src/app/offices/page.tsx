import Wrapper from "@/components/Wrapper";
import React from "react";
import OfficeFilterTab from "./_components/OfficeFilterTab";
import { Button } from "@/components/ui/button";
import OfficeCard from "./_components/OfficeCard";
import { Office } from "@/types/office.types";
import { Plus } from "lucide-react";

const offices: Office[] = [
  {
    office_id: 1,
    office_name: "Office 1",
    office_address: "123 Main St, Anytown, USA",
    office_state: "Anytown",
    office_city: "Anytown",
    office_pincode: "12345",
    office_contact_person: "John Doe",
    office_contact_number: "1234567890",
    office_email: "john.doe@example.com",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    office_id: 2,
    office_name: "Office 2",
    office_address: "456 Main St, Anytown, USA",
    office_state: "Anytown",
    office_city: "Anytown",
    office_pincode: "12345",
    office_contact_person: "Jane Doe",
    office_contact_number: "1234567890",
    office_email: "jane.doe@example.com",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    office_id: 3,
    office_name: "Office 3",
    office_address: "789 Main St, Anytown, USA",
    office_state: "Anytown",
    office_city: "Anytown",
    office_pincode: "12345",
    office_contact_person: "John Doe",
    office_contact_number: "1234567890",
    office_email: "john.doe@example.com",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    office_id: 4,
    office_name: "Office 4",
    office_address: "101 Main St, Anytown, USA",
    office_state: "Anytown",
    office_city: "Anytown",
    office_pincode: "12345",
    office_contact_person: "John Doe",
    office_contact_number: "1234567890",
    office_email: "john.doe@example.com",
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const Offices = () => {
  return (
    <Wrapper
      title='Offices'
      description='Manage and monitor all your office locations'
      button={
        <Button className='bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all duration-200 hover:shadow-md'>
          <Plus className='w-4 h-4 mr-2' />
          Add Office
        </Button>
      }>
      <OfficeFilterTab officeLength={offices.length} />

      {/* Office Cards Grid */}
      <div className='space-y-6'>
        {/* <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Office Locations
          </h2>
          <span className='text-sm text-gray-500'>
            {offices.length} total offices
          </span>
        </div> */}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {offices.map((office) => (
            <OfficeCard
              key={office.office_id}
              office={office}
            />
          ))}
        </div>
      </div>
    </Wrapper>
  );
};

export default Offices;
