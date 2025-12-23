'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PricingFormProps {
    initialPricing: Record<string, number>;
}

const pricingFields = [
  { key: 'scan_base_price', label: 'Scan Base Price', prefix: '$', section: 'Scanning' },
  { key: 'scan_pages_included', label: 'Pages Included', section: 'Scanning' },
  { key: 'scan_extra_page_price', label: 'Extra Page Price', prefix: '$', section: 'Scanning' },
  { key: 'shred_base_price', label: 'Shred Base Price', prefix: '$', section: 'Shredding' },
  { key: 'shred_pages_included', label: 'Pages Included', section: 'Shredding' },
  { key: 'shred_extra_page_price', label: 'Extra Page Price', prefix: '$', section: 'Shredding' },
  { key: 'storage_free_days', label: 'Free Storage Days', suffix: 'days', section: 'Storage' },
  { key: 'storage_daily_rate', label: 'Daily Storage Rate', prefix: '$', section: 'Storage' },
  { key: 'storage_monthly_max', label: 'Monthly Maximum', prefix: '$', section: 'Storage' },
  { key: 'pickup_base_price', label: 'Pickup Price', prefix: '$', section: 'Pickup' },
  { key: 'forward_handling_fee', label: 'Handling Fee', prefix: '$', section: 'Forwarding' },
  { key: 'forward_postage_markup', label: 'Postage Markup', suffix: '%', multiplier: 100, section: 'Forwarding' },
  ];

export default function PricingForm({ initialPricing }: PricingFormProps) {
    const router = useRouter();
    const [pricing, setPricing] = useState(initialPricing);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

  const handleChange = (key: string, value: string, multiplier?: number) => {
        const numValue = parseFloat(value) || 0;
        setPricing((prev) => ({
                ...prev,
                [key]: multiplier ? numValue / multiplier : numValue,
        }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
                const res = await fetch('/api/admin/pricing', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(pricing),
                });

          if (res.ok) {
                    setMessage('Pricing updated successfully!');
                    router.refresh();
          } else {
                    setMessage('Failed to update pricing.');
          }
        } catch (error) {
                setMessage('Error updating pricing.');
        } finally {
                setSaving(false);
        }
  };

  const sections = [...new Set(pricingFields.map((f) => f.section))];

  return (
        <form onSubmit={handleSubmit} className="space-y-8">
          {sections.map((section) => (
                  <div key={section}>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">{section}</h3>h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                              {pricingFields
                                              .filter((f) => f.section === section)
                                              .map((field) => (
                                                                <div key={field.key}>
                                                                                  <label className="block text-sm font-medium text-gray-700">
                                                                                    {field.label}
                                                                                    </label>label>
                                                                                  <div className="mt-1 relative rounded-md shadow-sm">
                                                                                    {field.prefix && (
                                                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                                                                                                <span className="text-gray-500 sm:text-sm">{field.prefix}</span>span>
                                                                                          </div>div>
                                                                                                      )}
                                                                                                      <input
                                                                                                                              type="number"
                                                                                                                              step="0.01"
                                                                                                                              value={field.multiplier ? pricing[field.key] * field.multiplier : pricing[field.key]}
                                                                                                                              onChange={(e) => handleChange(field.key, e.target.value, field.multiplier)}
                                                                                                                              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                                                                                                                                                        field.prefix ? 'pl-7' : ''
                                                                                                                                } ${field.suffix ? 'pr-12' : ''}`}
                                                                                                                            />
                                                                                    {field.suffix && (
                                                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                                                                                <span className="text-gray-500 sm:text-sm">{field.suffix}</span>span>
                                                                                          </div>div>
                                                                                                      )}
                                                                                    </div>div>
                                                                </div>div>
                                                              ))}
                            </div>div>
                  </div>div>
                ))}
        
          {message && (
                  <div className={`p-3 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                  </div>div>
              )}
        
              <div className="flex justify-end">
                      <button
                                  type="submit"
                                  disabled={saving}
                                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                        {saving ? 'Saving...' : 'Save Pricing'}
                      </button>button>
              </div>div>
        </form>form>
      );
}</form>
