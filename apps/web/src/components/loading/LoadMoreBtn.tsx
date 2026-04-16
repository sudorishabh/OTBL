import React from "react";
import CustomButton from "../shared/btn";

interface Props {
  onClick: () => void;
  loading: boolean;
}

const LoadMoreBtn = ({ loading, onClick }: Props) => {
  return (
    <div className='flex justify-center pt-6'>
      <CustomButton
        text='Load More'
        variant='outline'
        onClick={onClick}
        disabled={loading}
        loading={loading}
      />
    </div>
  );
};

export default LoadMoreBtn;
