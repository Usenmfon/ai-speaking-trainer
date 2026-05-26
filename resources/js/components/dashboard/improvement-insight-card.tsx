import { Lightbulb, Target } from 'lucide-react';

type ImprovementInsightCardProps = {
    latestSessionTitle: string | null;
    mostCommonWeakness: string | null;
};

export function ImprovementInsightCard({
    latestSessionTitle,
    mostCommonWeakness,
}: ImprovementInsightCardProps) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-700 dark:text-violet-200">
                    <Lightbulb className="size-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold">
                        Improvement insight
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        A focused next step from your reports.
                    </p>
                </div>
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-background p-4">
                <div className="flex gap-3">
                    <Target className="mt-0.5 size-5 shrink-0 text-cyan-700 dark:text-cyan-200" />
                    <div>
                        <p className="font-medium">
                            {mostCommonWeakness ??
                                'Complete a session to unlock insights'}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {mostCommonWeakness
                                ? `This appears most often in your feedback. Try one short drill focused only on this before your next full take.`
                                : 'Once your first report is analyzed, the dashboard will highlight the coaching theme that appears most often.'}
                        </p>
                    </div>
                </div>
            </div>

            {latestSessionTitle && (
                <p className="mt-4 text-sm text-muted-foreground">
                    Latest session: {latestSessionTitle}
                </p>
            )}
        </section>
    );
}
