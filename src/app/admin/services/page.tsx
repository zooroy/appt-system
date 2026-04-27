import { prisma } from '@/lib/prisma';
import { ServicesClient } from './_components/services-client';

export default async function AdminServicesPage() {
  const rawServices = await prisma.service.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, durationMinutes: true, description: true, isActive: true },
  });

  const services = rawServices.map((s) => ({
    ...s,
    description: s.description ?? undefined,
  }));

  return <ServicesClient services={services} />;
}
