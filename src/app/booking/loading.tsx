import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="pb-1">
        <h1 className="text-2xl font-bold mb-2 text-center font-heading">
          線上預約
        </h1>
      </div>
      <Card>
        <CardContent>
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-md bg-muted animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
