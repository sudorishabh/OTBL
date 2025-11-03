import { capitalFirstLetter } from "@/utils/capitalFirstLetter";
import React from "react";

interface Props {
  id: string;
  selected: boolean;
  field: any;
  s: {
    name: string;
    address: string;
    id: number;
    city: string;
    email: string;
    state: string;
    pincode: string;
    contact_person: string;
    contact_number: string;
    created_at: string;
    updated_at: string;
  };
}

const CreateWOSiteCard = ({ field, id, s, selected }: Props) => {
  const toggle = () => {
    const current: string[] = (field.value ?? []) as string[];
    const next = selected ? current.filter((v) => v !== id) : [...current, id];
    field.onChange(next);
  };

  return (
    <div
      role='button'
      tabIndex={0}
      aria-pressed={selected}
      className={`group justify-start border cursor-pointer transition-all duration-150 ${
        selected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-gray-200 hover:bg-muted/60"
      } rounded-lg px-4 py-3 text-left flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1`}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}>
      {/* Left selection indicator */}
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 text-muted-foreground"
        } transition-colors`}
        aria-hidden>
        {selected ? (
          <svg
            width='12'
            height='12'
            viewBox='0 0 20 20'
            fill='none'>
            <path
              d='M7.5 10.5L9.5 12.5L13 9'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        ) : (
          <span className='h-1.5 w-1.5 rounded-full bg-current opacity-50' />
        )}
      </span>

      {/* Content */}
      <div className='flex w-full items-start justify-between gap-3'>
        <div className='flex min-w-0 flex-col items-start'>
          <span className='text-base font-semibold leading-tight flex items-center gap-2'>
            <span className='truncate'>{capitalFirstLetter(s.name)}</span>
            {selected && (
              <span className='ml-1 text-primary'>
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 20 20'
                  fill='none'>
                  <circle
                    cx='10'
                    cy='10'
                    r='10'
                    fill='currentColor'
                    opacity='0.15'
                  />
                  <path
                    d='M7.5 10.5L9.5 12.5L13 9'
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </span>
            )}
          </span>
          <span className='mt-1 text-xs text-muted-foreground truncate max-w-[38ch]'>
            <span className='font-medium'>{capitalFirstLetter(s.city)}</span>,
            {capitalFirstLetter(s.state)} • {s.pincode}
          </span>
          <div className='mt-1.5 flex flex-col  gap-y-1 text-xs text-muted-foreground'>
            <div>
              <span className='font-medium'>Contact:</span>{" "}
              {capitalFirstLetter(s.contact_person)}
            </div>
            <div className='flex items-center gap-2'>
              <a
                href={`tel:${s.contact_number}`}
                className='underline-offset-2 hover:underline text-foreground/80'
                onClick={(e) => e.stopPropagation()}>
                {s.contact_number}
              </a>
              •
              <a
                href={`mailto:${s.email}`}
                className='underline-offset-2 hover:underline text-foreground/80'
                onClick={(e) => e.stopPropagation()}>
                {s.email}
              </a>
            </div>
          </div>
        </div>

        {/* Right badge */}
        <div className='shrink-0 self-start'>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${
              selected
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-muted-foreground/20 text-muted-foreground"
            } transition-colors`}>
            {selected ? "Selected" : "Tap to select"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreateWOSiteCard;
