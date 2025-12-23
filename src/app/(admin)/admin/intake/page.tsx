import { db } from '@/lib/db';
import { MailIntakeForm } from './MailIntakeForm';

async function getCustomers() {
    return db.user.findMany({ where: { role: 'CUSTOMER' }, select: { id: true, firstName: true, lastName: true, email: true }, orderBy: { lastName: 'asc' } });
}

export default async function MailIntakePage() {
    const customers = await getCustomers();

  return (
        <div>
              <h1 className="text-2xl font-semibold text-gray-900">Mail Intake</h1>h1>
              <p className="mt-2 text-sm text-gray-600">Log new mail items received for customers.</p>p>
              <div className="mt-6 bg-white shadow rounded-lg p-6">
                      <MailIntakeForm customers={customers} />
              </div>div>
        </div>div>
      );
}</div>
