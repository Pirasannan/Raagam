import { cn } from '@/lib/cn';

/**
 * A softly breathing orb with sound ripples, used to represent a drone.
 * `active` speeds up the ripples while audio is playing.
 */
export function BreathingOrb({ active = false, label, className }: { active?: boolean; label?: string; className?: string }) {
  return (
    <div className={cn('relative flex aspect-square items-center justify-center', className)} aria-hidden={!label}>
      {[0, 1.3, 2.6].map((delay) => (
        <span
          key={delay}
          className="absolute inset-[18%] rounded-full border border-coral/30 animate-ripple"
          style={{ animationDelay: `${delay}s`, animationDuration: active ? '2.6s' : '4s' }}
        />
      ))}
      <span className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(224,88,62,0.22),rgba(224,88,62,0.04)_62%,transparent_70%)]" />
      <span
        className="relative flex h-[56%] w-[56%] items-center justify-center rounded-full bg-[radial-gradient(circle_at_40%_35%,#fff7f2,#f6d8cf_55%,#ebb3a2)] shadow-[0_10px_40px_-8px_rgba(224,88,62,0.55)] animate-breathe"
        style={active ? { animationDuration: '4.4s' } : undefined}
      >
        {label && <span className="text-xs font-medium text-coral-dark">{label}</span>}
      </span>
    </div>
  );
}
