import { Check } from 'lucide-react';
import { GlassCard } from '@/components/ai/glass-card';
import { GradientButton } from '@/components/ai/gradient-button';

type PricingCardProps = {
    name: string;
    price: string;
    description: string;
    features: string[];
    highlighted?: boolean;
};

export function PricingCard({
    name,
    price,
    description,
    features,
    highlighted = false,
}: PricingCardProps) {
    return (
        <GlassCard
            className={`h-full p-6 ${highlighted ? 'border-cyan-300/35 bg-cyan-300/[0.08]' : ''}`}
            glow={highlighted}
        >
            <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                {name}
            </p>
            <div className="mt-4 flex items-end gap-2">
                <span className="text-4xl font-semibold text-foreground dark:text-white">
                    {price}
                </span>
                {price !== 'Custom' && (
                    <span className="pb-1 text-sm text-muted-foreground dark:text-slate-400">
                        /month
                    </span>
                )}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground dark:text-slate-300">
                {description}
            </p>
            <ul className="mt-6 flex flex-col gap-3">
                {features.map((feature) => (
                    <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-foreground dark:text-slate-200"
                    >
                        <Check className="size-4 text-cyan-600 dark:text-cyan-300" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <GradientButton
                className="mt-7 w-full"
                variant={highlighted ? 'primary' : 'secondary'}
            >
                Choose {name}
            </GradientButton>
        </GlassCard>
    );
}
