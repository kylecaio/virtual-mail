import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import PricingForm from './PricingForm';

// Default pricing configuration
const defaultPricing = {
    scan_base_price: 2.50,
    scan_pages_included: 10,
    scan_extra_page_price: 0.30,
    shred_base_price: 1.00,
    shred_pages_included: 10,
    shred_extra_page_price: 0.15,
    storage_free_days: 30,
    storage_daily_rate: 0.10,
    storage_monthly_max: 3.00,
    pickup_base_price: 2.00,
    forward_handling_fee: 3.00,
    forward_postage_markup: 0.20,
};

export default async function AdminPricingPage() {
    const session = await getServerSession(authOptions);

  if (!session?.user || !['ADMIN', 'STAFF'].includes((session.user as any).role)) {
        redirect('/');
  }

  let pricingConfig: Record<string, number> = {};

  try {
        const configs = await db.pricingConfig.findMany();
        configs.forEach((config) => {
                pricingConfig[config.key] = config.value;
        });
  } catch (error) {
        pricingConfig = defaultPricing;
  }

  const pricing = { ...defaultPricing, ...pricingConfig };

  return (
        <div className="space-y-6">
              <div>
                      <h1 className="text-2xl font-bold text-gray-900">Pricing Configuration</h1>h1>
                      <p className="mt-1 text-sm text-gray-500">
                                Configure service pricing for scanning, shredding, storage, and forwarding.
                      </p>p>
              </div>div>
        
              <div className="bg-white shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                                <PricingForm initialPricing={pricing} />
                      </div>div>
              </div>div>
        
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-800">Pricing Guidelines</h3>h3>
                      <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                                <li>Scan: Base price includes first 10 pages, then per-page charge</li>li>
                                <li>Shred: Base price includes first 10 pages, then per-page charge</li>li>
                                <li>Storage: Free for first 30 days, then daily rate (capped monthly)</li>li>
                                <li>Pickup: Base price (free for Premium/Enterprise plans)</li>li>
                                <li>Forwarding: Handling fee + postage with markup percentage</li>li>
                      </ul>ul>
              </div>div>
        </div>div>
      );
}</div>
