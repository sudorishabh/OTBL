import React from "react";
import CustomButton from "./custom/CustomButton";

interface Props {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

const LoadMoreBtn = ({ disabled, loading, onClick }: Props) => {
  return (
    <div className='flex justify-center pt-6'>
      <CustomButton
        text='Load More'
        variant='outline'
        onClick={onClick}
        disabled={disabled}
        loading={loading}
      />
    </div>
  );
};

export default LoadMoreBtn;
