import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateWOSiteCard from "../CreateWOSiteCard";
import {
  Building2,
  Plus,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin as LocationIcon,
  Hash as HashIcon,
  MapPin,
  Layers,
} from "lucide-react";

interface NewSite {
  name: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  contact_person: string;
  contact_number: string;
  email: string;
}

interface Props {
  siteMode: "existing" | "new";
  form: any;
  sitesData:
    | {
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
      }[]
    | undefined;
  isGetSitesLoading: boolean;
  newSiteFields: { id: string }[];
  append: (value: NewSite) => void;
  remove: (index: number) => void;
}

const CreateWOStep2 = ({
  siteMode,
  form,
  sitesData,
  isGetSitesLoading,
  newSiteFields,
  append,
  remove,
}: Props) => {
  return (
    <Card className='border-0 shadow drop-shadow'>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-green-100 dark:bg-green-900/30'>
            <MapPin className='h-5 w-5 text-green-600 dark:text-green-400' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>Site Assignment</h3>
            <p className='text-sm text-muted-foreground'>
              {siteMode === "existing"
                ? "Select existing sites for this work order"
                : "Create new sites for this work order"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {/* Activity Type Selection */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30'>
                <Layers className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              </div>
              <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                Activity Type
              </h4>
            </div>

            <FormField
              control={form.control}
              name='activity_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Activity Type</FormLabel>
                  <FormDescription>
                    Choose the type of activity for the sites in this work order
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select activity type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='insitu'>
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 rounded-full bg-blue-500' />
                          <span>In-Situ</span>
                        </div>
                      </SelectItem>
                      <SelectItem value='exsitu'>
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 rounded-full bg-green-500' />
                          <span>Ex-Situ</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {siteMode === "existing" ? (
            <div className='space-y-4'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30'>
                  <Building2 className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                </div>
                <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Select Existing Sites
                </h4>
              </div>

              <FormField
                control={form.control}
                name='site_ids'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Sites</FormLabel>
                    <FormDescription>
                      Choose one or more sites to assign to this work order
                    </FormDescription>
                    <FormControl>
                      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                        {(sitesData ?? []).map((s) => {
                          const id = String(s.id);
                          const selected = (
                            (field.value ?? []) as string[]
                          ).includes(id);
                          return (
                            <CreateWOSiteCard
                              field={field}
                              id={id}
                              s={s}
                              selected={selected}
                              key={id}
                            />
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <div className='space-y-6 '>
              <div className='flex items-center gap-2 mb-4'>
                {/* <div className='p-2 rounded-lg bg-green-100 dark:bg-green-900/30'>
              <Plus className='h-4 w-4 text-green-600 dark:text-green-400' />
            </div> */}
                <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Create New Sites
                </h4>
              </div>

              {newSiteFields.map((f, index) => (
                <Card
                  key={f.id}
                  className='border-0 shadow-sm bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'>
                  <CardHeader className='pb-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div>
                          <h4 className='text-sm font-semibold'>
                            New Site {index + 1}
                          </h4>
                          <p className='text-xs text-muted-foreground'>
                            Site information and contact details
                          </p>
                        </div>
                      </div>
                      {newSiteFields.length > 1 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => remove(index)}
                          className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className='space-y-10'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-start'>
                      <FormField
                        control={form.control}
                        name={`newSites.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <Building2 className='h-4 w-4' />
                              Site Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Enter site name'
                                className='bg-white'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`newSites.${index}.contact_person`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <User className='h-4 w-4' />
                              Contact Person
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Contact person name'
                                className='bg-white'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`newSites.${index}.address`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <LocationIcon className='h-4 w-4' />
                            Address
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={2}
                              placeholder='Enter complete address'
                              className='bg-white'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 items-start'>
                      <FormField
                        control={form.control}
                        name={`newSites.${index}.state`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='State'
                                className='bg-white'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`newSites.${index}.city`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='City'
                                className='bg-white'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`newSites.${index}.pincode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <HashIcon className='h-4 w-4' />
                              Pincode
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Pincode'
                                className='bg-white'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-start'>
                      <FormField
                        control={form.control}
                        name={`newSites.${index}.contact_number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <Phone className='h-4 w-4' />
                              Contact Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Contact number'
                                className='bg-white'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`newSites.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2'>
                              <Mail className='h-4 w-4' />
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='email'
                                placeholder='email@example.com'
                                className='bg-white'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className='border-dashed border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10'>
                <CardContent className='px-6'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() =>
                      append({
                        name: "",
                        address: "",
                        state: "",
                        city: "",
                        pincode: "",
                        contact_person: "",
                        contact_number: "",
                        email: "",
                      })
                    }
                    className='w-full h-12 border-dashed border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/20 hover:border-green-400 dark:hover:border-green-600'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Another Site
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateWOStep2;
