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
  }

  const siteMode = form.watch("siteMode");

  const goNext = async () => {
    const isValidStep1 = await form.trigger([
      "code",
      "title",
      "clientMode",
      "client_id",
      "newClient",
      "start_date",
      "end_date",
      "handing_over_date",
      "agreement_number",
      "description",
      "budget_amount",
      "siteMode",
    ]);
    if (isValidStep1) setStep(2);
  };

  return (
    <Card className='border-0 shadow-sm bg-muted/30'>
      <CardContent className='px-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <CheckCircle2 className='h-4 w-4' />
            <span>Step {step} of 2</span>
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
                Continue to Sites
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
