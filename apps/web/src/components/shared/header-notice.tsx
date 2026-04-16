import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

interface Props {
  notice: string;
}

const HeaderNotice = ({ notice }: Props) => {
  return (
    <Card className='border-blue-200 bg-blue-50/50 shadow-sm py-1'>
      <CardContent className='p-4'>
        <div className='flex items-start gap-3'>
          <div className='shrink-0'>
            <Info className='h-5 w-5 text-[#035864] mt-0.5' />
          </div>
          <div className='flex-1'>
            <h3 className='text-sm font-medium text-[#035864] mb-1'>
              Important Notice
            </h3>
            <p className='text-sm text-[#035864]/90 leading-relaxed'>
              {notice}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderNotice;
