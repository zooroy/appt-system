import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardContent className="space-y-3">
          <div className="h-7 w-24 mx-auto rounded bg-muted animate-pulse" />
          <div className="flex gap-3 mb-4">
            <div className="h-10 flex-2 rounded bg-muted animate-pulse" />
            <div className="h-10 w-32 rounded bg-muted animate-pulse" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-md bg-muted animate-pulse" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
