import React, { useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IndianRupee } from "lucide-react";

interface Props {
  form: any;
  siteMode: "existing" | "new";
  sitesData:
    | Array<{
        id: number;
        name: string;
        address: string;
        state: string;
        city: string;
        pincode: string;
      }>
    | undefined;
}

const CreateWOStep3 = ({ form, siteMode, sitesData }: Props) => {
  const { data: budgetCategories, isLoading } =
    trpc.budgetCategoryQuery.getBudgetCategories.useQuery();

  const existingSelectedSites: string[] = form.watch("site_ids") ?? [];
  const newSites: Array<any> = form.watch("newSites") ?? [];

  // Ensure budget entries align with current site selection
  useEffect(() => {
    if (siteMode === "existing") {
      const current: Array<{ site_id: string; budget_category_ids: string[] }> =
        form.getValues("selectedSiteBudgets") ?? [];
      const next = existingSelectedSites.map((sid) => {
        const found = current.find((e) => e.site_id === sid);
        return {
          site_id: sid,
          budget_category_ids: found?.budget_category_ids ?? [],
        };
      });
      form.setValue("selectedSiteBudgets", next, { shouldValidate: false });
    } else if (siteMode === "new") {
      const current: Array<{
        site_index: number;
        budget_category_ids: string[];
      }> = form.getValues("newSiteBudgets") ?? [];
      const next = newSites.map((_, idx: number) => {
        const found = current.find((e) => e.site_index === idx);
        return {
          site_index: idx,
          budget_category_ids: found?.budget_category_ids ?? [],
        };
      });
      form.setValue("newSiteBudgets", next, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteMode, existingSelectedSites.join(","), newSites.length]);

  const existingSitesDetailed = useMemo(() => {
    if (!sitesData)
      return [] as Array<{ id: number; name: string; address: string }>;
    return sitesData.filter((s) =>
      existingSelectedSites.includes(String(s.id))
    );
  }, [sitesData, existingSelectedSites]);

  const onToggleBudget = (opts: {
    mode: "existing" | "new";
    siteKey: string | number;
    categoryId: string;
    checked: boolean;
  }) => {
    if (opts.mode === "existing") {
      const list: Array<{ site_id: string; budget_category_ids: string[] }> =
        form.getValues("selectedSiteBudgets") ?? [];
      const idx = list.findIndex((e) => e.site_id === String(opts.siteKey));
      if (idx === -1) return;
      const ids = new Set(list[idx].budget_category_ids ?? []);
      if (opts.checked) ids.add(opts.categoryId);
      else ids.delete(opts.categoryId);
      list[idx] = { ...list[idx], budget_category_ids: Array.from(ids) };
      form.setValue("selectedSiteBudgets", [...list], { shouldDirty: true });
    } else {
      const list: Array<{ site_index: number; budget_category_ids: string[] }> =
        form.getValues("newSiteBudgets") ?? [];
      const idx = list.findIndex((e) => e.site_index === Number(opts.siteKey));
      if (idx === -1) return;
      const ids = new Set(list[idx].budget_category_ids ?? []);
      if (opts.checked) ids.add(opts.categoryId);
      else ids.delete(opts.categoryId);
      list[idx] = { ...list[idx], budget_category_ids: Array.from(ids) };
      form.setValue("newSiteBudgets", [...list], { shouldDirty: true });
    }
  };

  if (isLoading)
    return (
      <div className='text-sm text-muted-foreground'>
        Loading budget categories...
      </div>
    );

  const categories = budgetCategories ?? [];

  return (
    <Card className='border-0 shadow-sm'>
      <CardHeader className='pb-4'>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30'>
            <IndianRupee className='h-5 w-5 text-yellow-700 dark:text-yellow-400' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>
              Budget Categories per Site
            </h3>
            <p className='text-sm text-muted-foreground'>
              Select budget categories for each selected site
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {siteMode === "existing" ? (
            existingSitesDetailed.length === 0 ? (
              <div className='text-sm text-muted-foreground'>
                No sites selected.
              </div>
            ) : (
              <div className='space-y-4'>
                {existingSitesDetailed.map((site) => {
                  const entry = (
                    form.getValues("selectedSiteBudgets") as Array<{
                      site_id: string;
                      budget_category_ids: string[];
                    }>
                  )?.find((e) => e.site_id === String(site.id));
                  const selectedIds = new Set(entry?.budget_category_ids ?? []);
                  return (
                    <Card
                      key={site.id}
                      className='border-0 bg-muted/20'>
                      <CardHeader className='pb-2'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <h4 className='text-base font-semibold'>
                              {site.name}
                            </h4>
                            <p className='text-xs text-muted-foreground'>
                              {site.address}
                            </p>
                          </div>
                          <Badge variant='secondary'>Site #{site.id}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                          {categories.map((cat: any) => {
                            const checked = selectedIds.has(String(cat.id));
                            return (
                              <label
                                key={cat.id}
                                className='flex items-center gap-2 p-2 rounded-md border bg-white dark:bg-gray-900'>
                                <input
                                  type='checkbox'
                                  className='h-4 w-4'
                                  checked={checked}
                                  onChange={(e) =>
                                    onToggleBudget({
                                      mode: "existing",
                                      siteKey: String(site.id),
                                      categoryId: String(cat.id),
                                      checked: e.target.checked,
                                    })
                                  }
                                />
                                <span className='text-sm font-medium'>
                                  {cat.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )
          ) : newSites.length === 0 ? (
            <div className='text-sm text-muted-foreground'>
              No new sites added.
            </div>
          ) : (
            <div className='space-y-4'>
              {newSites.map((site: any, index: number) => {
                const entry = (
                  form.getValues("newSiteBudgets") as Array<{
                    site_index: number;
                    budget_category_ids: string[];
                  }>
                )?.find((e) => e.site_index === index);
                const selectedIds = new Set(entry?.budget_category_ids ?? []);
                return (
                  <Card
                    key={index}
                    className='border-0 bg-muted/20'>
                    <CardHeader className='pb-2'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h4 className='text-base font-semibold'>
                            {site?.name || `New Site ${index + 1}`}
                          </h4>
                          <p className='text-xs text-muted-foreground'>
                            {site?.address}
                          </p>
                        </div>
                        <Badge variant='secondary'>New #{index + 1}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                        {categories.map((cat: any) => {
                          const checked = selectedIds.has(String(cat.id));
                          return (
                            <label
                              key={cat.id}
                              className='flex items-center gap-2 p-2 rounded-md border bg-white dark:bg-gray-900'>
                              <input
                                type='checkbox'
                                className='h-4 w-4'
                                checked={checked}
                                onChange={(e) =>
                                  onToggleBudget({
                                    mode: "new",
                                    siteKey: index,
                                    categoryId: String(cat.id),
                                    checked: e.target.checked,
                                  })
                                }
                              />
                              <span className='text-sm font-medium'>
                                {cat.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateWOStep3;
