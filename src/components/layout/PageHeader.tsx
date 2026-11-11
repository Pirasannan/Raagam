import { Eyebrow } from '@/components/ui/Eyebrow';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  accent?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/** Centered page introduction used by every inner page. */
export function PageHeader({ eyebrow, title, accent, description, children, className }: PageHeaderProps) {
  return (
    <section className={cn('relative overflow-hidden', className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(55%_60%_at_50%_0%,#f8f4ef_0%,rgba(248,244,239,0)_70%)]" aria-hidden />
      <div className="container-page relative pb-12 pt-14 text-center sm:pb-16 sm:pt-20">
        <div className="animate-fade-up">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h1 className="display mx-auto mt-6 max-w-4xl text-[2.6rem] animate-fade-up sm:text-6xl lg:text-7xl" style={{ animationDelay: '80ms' }}>
          {title}
          {accent && (
            <>
              <br />
              <span className="text-coral">{accent}</span>
            </>
          )}
        </h1>
        {description && (
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted animate-fade-up sm:text-lg" style={{ animationDelay: '160ms' }}>
            {description}
          </p>
        )}
        {children && (
          <div className="mt-8 animate-fade-up" style={{ animationDelay: '240ms' }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
