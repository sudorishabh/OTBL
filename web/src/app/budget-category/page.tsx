"use client";
import CustomButton from "@/components/custom/CustomButton";
import Wrapper from "@/components/Wrapper";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import AddBudgetCategoryDialog from "./_components/AddBudgetCategoryDialog";
import TitleDescRow from "@/components/TitleDescRow";
import HeaderNotice from "@/components/HeaderNotice";
import PageLoading from "@/components/PageLoading";

const BudgetCategory = () => {
  const [isBudgetCategoryDialog, setIsBudgetCategoryDialog] = useState(false);
  const [isEditInfo, setIsEditInfo] = useState<{
    id: number;
    name: string;
    description: string;
  } | null>(null);

  const getBudgetCategories =
    trpc.budgetCategoryQuery.getBudgetCategories.useQuery();

  if (getBudgetCategories.isLoading) return <PageLoading />;

  return (
    <Wrapper
      title='Budget Categories'
      description='Add budget categories which will be used in sites'
      button={
        <CustomButton
          text='Add Budget Category'
          Icon={Plus}
          onClick={() => {
            setIsEditInfo(null);
            setIsBudgetCategoryDialog(!isBudgetCategoryDialog);
          }}
          variant='primary'
        />
      }>
      <div className='my-5'>
        <HeaderNotice
          notice=' Once a budget category is created, it cannot be deleted from the system.
              This ensures data integrity and maintains a complete audit trail
              of all budget categories used across sites. Please review your budget category
              details carefully before submitting.'
        />
      </div>

      <div className='flex flex-col gap-2'>
        {getBudgetCategories.data?.map((budgetCategory, i) => (
          <TitleDescRow
            key={budgetCategory.id}
            isDialog={isBudgetCategoryDialog}
            setIsDialog={setIsBudgetCategoryDialog}
            rowDetails={budgetCategory}
            setIsEditInfo={setIsEditInfo}
          />
        ))}
      </div>

      <AddBudgetCategoryDialog
        isEditInfo={isEditInfo}
        setIsEditInfo={setIsEditInfo}
        open={isBudgetCategoryDialog}
        setOpen={setIsBudgetCategoryDialog}
      />
    </Wrapper>
  );
};

export default BudgetCategory;
