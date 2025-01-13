import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
  variant?: "text" | "circular" | "rectangular";
  height?: string | number;
  width?: string | number;
}

export function Skeleton({
  className,
  count = 1,
  variant = "text",
  height,
  width,
}: SkeletonProps) {
  const skeletons = Array(count).fill(0);

  const getSkeletonClass = () => {
    const baseClass = "animate-pulse bg-muted rounded";
    switch (variant) {
      case "circular":
        return cn(baseClass, "rounded-full", className);
      case "rectangular":
        return cn(baseClass, "rounded-md", className);
      default:
        return cn(baseClass, "h-4 rounded-md", className);
    }
  };

  return (
    <div className="space-y-2">
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={getSkeletonClass()}
          style={{
            height: height || (variant === "circular" ? width : undefined),
            width: width,
          }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton count={3} className="h-4 w-full" />
        <div className="flex justify-between items-center pt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" variant="rectangular" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton count={4} className="h-4 w-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 py-4">
      <Skeleton className="h-12 w-12" variant="rectangular" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6).fill(0).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
} 
