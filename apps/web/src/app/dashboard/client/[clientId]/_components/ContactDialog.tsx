import React from "react";
import { Mail, Phone } from "lucide-react";
import CustomDialogWindow from "@/components/shared/dialog-window";
import { clientTypes } from "@pkg/schema";

interface Props {
  open: boolean;
  onClose: () => void;
  users?: clientTypes.clientUsersType[];
}

const ContactDialog = ({ open, onClose, users }: Props) => {
  const handleSetOpen = (next: boolean) => {
    if (!next) onClose();
  };

  return (
    <CustomDialogWindow
      title='Contacts'
      description='List of client contacts'
      open={open}
      setOpen={handleSetOpen}
      size='sm'>
      <div className='flex flex-col justify-between'>
        <div className='p-4 space-y-3 flex-1'>
          {users && users.length > 0 ? (
            users.map((u) => (
              <div
                key={u.id}
                className='flex items-center justify-between gap-3'>
                <div className='min-w-0'>
                  <div className='text-sm font-medium text-slate-700 truncate'>
                    {u.name}
                    <span className='ml-2'>(</span>
                    <span className=' text-xs text-slate-500'>
                      {u.designation || "User"}
                    </span>
                    <span>, </span>
                    <span className='ml-1 text-xs text-slate-500'>
                      {u.contact_type}
                    </span>
                    <span>)</span>
                  </div>
                  <div className='text-xs text-slate-500 truncate max-w-[300px]'>
                    {u.email}
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <a
                    href={`mailto:${u.email}`}
                    className='text-slate-400 hover:text-slate-600'
                    title='Email'>
                    <Mail className='size-4' />
                  </a>
                  <a
                    href={`tel:${u.contact_number}`}
                    className='text-slate-400 hover:text-slate-600'
                    title='Call'>
                    <Phone className='size-4' />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className='text-sm text-slate-500'>No client users found.</div>
          )}
        </div>

        <div className='px-4 py-3 border-t text-right w-full'>
          <button
            onClick={() => onClose()}
            className='px-3 py-1 rounded bg-gray-100 hover:bg-gray-200'>
            Close
          </button>
        </div>
      </div>
    </CustomDialogWindow>
  );
};

export default ContactDialog;
