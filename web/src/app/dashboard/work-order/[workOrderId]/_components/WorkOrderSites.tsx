import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, User, Building2 } from "lucide-react";
import SiteInfoDialog from "./SiteInfoDialog";

interface Props {
  sites: Array<{
    id: number;
    wo_site_id: number;
    activity_type: "insitu" | "exsitu" | null;
    name: string;
    address: string;
    state: string;
    city: string;
    pincode: string;
    contact_person: string;
    contact_number: string;
    email: string;
    created_at: string;
    updated_at: string;
  }>;
  siteActivities?: Array<{
    site_id: number;
    activities: Array<{
      id: number;
      budget_category: {
        id: number;
        name: string;
        description: string;
      };
      activities: Array<{
        id: number;
        name: string;
        description: string;
        status: "pending" | "completed" | "cancelled";
        start_date: string;
        end_date: string;
        budget_amount: string;
        expense_amount: string;
        utilization_percentage: number;
        expenses: Array<{
          id: number;
          amount: string;
          description: string;
          expense_date: string;
          category: string;
          receipt_number: string | null;
        }>;
      }>;
    }>;
  }>;
}

const WorkOrderSites = ({ sites, siteActivities }: Props) => {
  const [selectedSite, setSelectedSite] = useState<(typeof sites)[0] | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSiteClick = (site: (typeof sites)[0]) => {
    setSelectedSite(site);
    setIsDialogOpen(true);
  };

  const getSiteActivities = (siteId: number) => {
    if (!siteActivities) return [];
    const siteActivityData = siteActivities.find((sa) => sa.site_id === siteId);
    return siteActivityData ? siteActivityData.activities : [];
  };
  if (!sites || sites.length === 0) {
    return (
      <Card className='shadow-sm border-[0.1rem] bg-gradient-to-br border-emerald-300 from-white to-gray-50'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <Building2 className='size-5 text-emerald-600' />
            Sites ({sites?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-gray-500'>
            <MapPin className='size-12 mx-auto mb-3 text-gray-300' />
            <p>No sites assigned to this work order</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className='shadow-sm border-[0.1rem] bg-gradient-to-br border-emerald-300 from-white to-gray-50'>
        <CardHeader>
          <CardTitle className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
            <Building2 className='size-5 text-emerald-600' />
            Sites ({sites.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {sites.map((site) => (
              <div
                key={site.id}
                className='p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow group cursor-pointer'
                onClick={() => handleSiteClick(site)}>
                <div className='flex items-start justify-between mb-3'>
                  <h3 className='font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors'>
                    {site.name}
                  </h3>
                  <Badge
                    variant='outline'
                    className='text-xs'>
                    Site #{site.id}
                  </Badge>
                </div>

                <div className='space-y-3'>
                  <div className='flex items-start gap-2'>
                    <MapPin className='size-4 text-gray-500 mt-0.5 flex-shrink-0' />
                    <div className='min-w-0'>
                      <p className='text-sm text-gray-700 font-medium line-clamp-2'>
                        {site.address}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {site.city}, {site.state} - {site.pincode}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <User className='size-4 text-gray-500 flex-shrink-0' />
                    <div className='min-w-0'>
                      <p className='text-sm text-gray-700 font-medium truncate'>
                        {site.contact_person}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Phone className='size-4 text-gray-500 flex-shrink-0' />
                    <a
                      href={`tel:${site.contact_number}`}
                      className='text-sm text-gray-700 hover:text-emerald-600 hover:underline transition-colors'>
                      {site.contact_number}
                    </a>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Mail className='size-4 text-gray-500 flex-shrink-0' />
                    <a
                      href={`mailto:${site.email}`}
                      className='text-sm text-gray-700 hover:text-emerald-600 hover:underline transition-colors truncate block'>
                      {site.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Site Info Dialog */}
      {selectedSite && (
        <SiteInfoDialog
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          site={selectedSite}
          woSiteId={selectedSite.wo_site_id}
          activityType={selectedSite.activity_type}
          activities={getSiteActivities(selectedSite.id)}
          onActivityAdded={() => {
            // Refetch work order data when activity is added
            window.location.reload();
          }}
        />
      )}
    </>
  );
};

export default WorkOrderSites;
