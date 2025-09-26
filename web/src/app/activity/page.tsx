"use client";
import CustomButton from "@/components/custom/CustomButton";
import Wrapper from "@/components/Wrapper";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import AddActivityDialog from "./_components/AddActivityDialog";
import { trpc } from "@/lib/trpc";
import TitleDescRow from "@/components/TitleDescRow";
import HeaderNotice from "@/components/HeaderNotice";
import PageLoading from "@/components/PageLoading";

const Activity = () => {
  const [isActivityDialog, setIsActivityDialog] = useState(false);
  const [isEditInfo, setIsEditInfo] = useState<{
    id: number;
    name: string;
    description: string;
  } | null>(null);

  const getActivities = trpc.activityQuery.getActivities.useQuery();

  if (getActivities.isLoading) return <PageLoading />;

  return (
    <Wrapper
      title='Activities'
      description='Add activities which will be used in sites'
      button={
        <CustomButton
          text='Add Activity'
          Icon={Plus}
          onClick={() => {
            setIsEditInfo(null);
            setIsActivityDialog(!isActivityDialog);
          }}
          variant='primary'
        />
      }>
      <div className='my-5'>
        <HeaderNotice
          notice=' Once an activity is created, it cannot be deleted from the system.
              This ensures data integrity and maintains a complete audit trail
              of all activities used across sites. Please review your activity
              details carefully before submitting.'
        />
      </div>

      <div className='flex flex-col gap-2'>
        {getActivities.data?.map((activity, i) => (
          <TitleDescRow
            key={activity.id}
            isDialog={isActivityDialog}
            setIsDialog={setIsActivityDialog}
            rowDetails={activity}
            setIsEditInfo={setIsEditInfo}
          />
        ))}
      </div>

      <AddActivityDialog
        open={isActivityDialog}
        setOpen={setIsActivityDialog}
        isEditInfo={isEditInfo}
        setIsEditInfo={setIsEditInfo}
      />
    </Wrapper>
  );
};

export default Activity;
