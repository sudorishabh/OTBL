import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import React from "react";

interface Props {
  step: number;
  setStep: (step: number) => void;
  closeDialog: () => void;
  form: any;
}

const CreateWOFooter = ({ setStep, step, closeDialog, form }: Props) => {
  const stepBack = () => setStep(step - 1);

  let backBtnText = "";
  switch (step) {
    case 2:
      backBtnText = "Back to Details";
      break;
    case 3:
      backBtnText = "Back to Sites";
      break;
  }

  const siteMode = form.watch("siteMode");

  const goNext = async () => {
    const isValidStep1 = await form.trigger([
      "code",
      "title",
      "date",
      "description",
      "budget_amount",
      "siteMode",
    ]);
    if (isValidStep1) setStep(2);
  };

  const goNextFrom2 = async () => {
    const isValidStep2 = await form.trigger([
      siteMode === "existing" ? "site_ids" : "newSites",
    ]);
    if (isValidStep2) setStep(3);
  };

  return (
    <Card className='border-0 shadow-sm bg-muted/30'>
      <CardContent className='px-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <CheckCircle2 className='h-4 w-4' />
            <span>Step {step} of 3</span>
          </div>

          <div className='flex items-center gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={closeDialog}
              className='px-6'>
              Cancel
            </Button>

            {step !== 1 && (
              <Button
                type='button'
                variant='outline'
                onClick={stepBack}
                className='px-6 flex items-center gap-2'>
                <ArrowLeft className='h-4 w-4' />
                {backBtnText}
              </Button>
            )}

            {step === 1 ? (
              <Button
                type='button'
                onClick={goNext}
                className='px-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700'>
                Continue to Site
                <ArrowRight className='h-4 w-4' />
              </Button>
            ) : step === 2 ? (
              <Button
                type='button'
                onClick={goNextFrom2}
                className='px-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700'>
                Continue to Budget
                <ArrowRight className='h-4 w-4' />
              </Button>
            ) : (
              <Button
                type='submit'
                className='px-6 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700'>
                <CheckCircle2 className='h-4 w-4' />
                Create Work Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateWOFooter;
