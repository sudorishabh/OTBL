import CustomButton from "@/components/custom/CustomButton";
import { ArrowUpRight, CheckCircle2, Clock, Plus } from "lucide-react";
import React from "react";
import ActiveWOCard from "./ActiveWOCard";
import CompletedWOCard from "./CompletedWOCard";

const completedWOs = [
  {
    Key: 1,
    title: "Lorem ipsum dolor, sit amet consectetur",
    code: "FDGE-432",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit Dolor enim qui deserunt reprehenderit consequuntur similique aliquid facilis. Modi ratione corporis sed, placeat officiis sit earum quibusdam inventore veritatis praesentium voluptate?",
    budget_amount: 23423,
    expense_amount: 234234,
  },
  {
    Key: 2,
    title: "Lorem ipsum dolor, sit amet consectetur",
    code: "FDGE-432",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit Dolor enim qui deserunt reprehenderit consequuntur similique aliquid facilis. Modi ratione corporis sed, placeat officiis sit earum quibusdam inventore veritatis praesentium voluptate?",
    budget_amount: 23423,
    expense_amount: 234234,
  },
  {
    Key: 3,
    title: "",
    code: "FDGE-432",
    description:
      "Lorem ipsum dolor, sit amet consectetur adipisicing elit Dolor enim qui deserunt reprehenderit consequuntur similique aliquid facilis. Modi ratione corporis sed, placeat officiis sit earum quibusdam inventore veritatis praesentium voluptate?",
    budget_amount: 23423,
    expense_amount: 234234,
  },
];

interface Props {
  isCreateWODialog: boolean;
  setIsCreateWODialog: (isCreateWODialog: boolean) => void;
}

const OfficeWOComp = ({ isCreateWODialog, setIsCreateWODialog }: Props) => {
  return (
    <div className='flex gap-4'>
      <div className='w-4/6 bg-gradient-to-b from-white to-gray-50 p-2 rounded-xl border ring-1 ring-gray-100'>
        <div className='flex items-center justify-between py-2 px-4'>
          <h3 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
            <Clock className='h-4 w-4 text-amber-600' /> Active Work Orders
          </h3>
          <div className='flex items-center gap-3'>
            <CustomButton
              text='Create Work Order'
              variant='primary'
              Icon={Plus}
              onClick={() => setIsCreateWODialog(!isCreateWODialog)}
              className='bg-emerald-600 text-white'
            />
            <button className='border-[0.1rem] rounded-full p-1.5 cursor-pointer hover'>
              <ArrowUpRight className='size-5 ' />
            </button>
          </div>
        </div>
        <div className='px-4 pb-4 pt-2 grid grid-cols-1 gap-4'>
          {/* sample active WOs list (UI only) */}
          <ActiveWOCard
            title='Generator maintenance at Site A'
            code='WO-1023'
            description='Routine maintenance and oil change for generator set.'
            budget_amount={35000}
            date={"12 Oct 2025"}
          />
          <ActiveWOCard
            title='Solar panel cleaning'
            code='WO-1045'
            description='Quarterly cleaning and inspection of solar panels.'
            budget_amount={12000}
            date={"18 Oct 2025"}
          />
          <ActiveWOCard
            title='CCTV installation expansion'
            code='WO-1102'
            description='Add 6 additional cameras and re-route cables.'
            budget_amount={78000}
            date={"25 Oct 2025"}
          />
        </div>
      </div>

      <div className='w-2/6 bg-gradient-to-b from-white to-gray-50 p-2 rounded-xl border ring-1 ring-gray-100'>
        <div className='flex items-center justify-between py-2 px-4'>
          <h3 className='text-base font-semibold text-gray-900 flex items-center gap-2'>
            <CheckCircle2 className='h-4 w-4 text-green-600' /> Active Work
            Orders
          </h3>
          <div className='flex items-center gap-3'>
            <button className='border-[0.1rem] rounded-full p-1.5 cursor-pointer hover'>
              <ArrowUpRight className='size-5 ' />
            </button>
          </div>
        </div>
        <div className='px-4 pb-4 pt-2 grid grid-cols-1 gap-4'>
          {completedWOs.map((wo) => (
            <CompletedWOCard
              key={wo.Key}
              title={wo.title}
              description={wo.description}
              code={wo.code}
              budget_amount={wo.budget_amount}
              expense_amount={wo.expense_amount}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfficeWOComp;
