import { AlertCircle, Sparkles } from 'lucide-react';

import { analysis as retryAnalysis } from '@/actions/App/Http/Controllers/PracticeSessionRetryController';
import { RetryProcessingButton } from '@/components/practice/retry-processing-button';
import type { SpeakingFeedbackReport } from '@/types';

type ReportStatusPanelProps = {
    report: SpeakingFeedbackReport | null;
};

export function ReportStatusPanel({ report }: ReportStatusPanelProps) {
    if (report?.status === 'failed') {
        return (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-destructive">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2 font-semibold">
                            <AlertCircle className="size-5" />
                            Analysis failed
                        </div>
                        <p className="mt-2 text-sm">
                            {report.error_message ??
                                'The report could not be generated.'}
                        </p>
                    </div>
                    <RetryProcessingButton
                        action={retryAnalysis.url(report.practice_session_id)}
                        label="Retry analysis"
                    />
                </div>
            </div>
        );
    }

    if (!report || report.status === 'pending' || report.status === 'processing') {
        return (
            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-5 text-cyan-900 dark:text-cyan-100">
                <div className="flex items-center gap-2 font-semibold">
                    <Sparkles className="size-5 animate-pulse" />
                    AI analysis is in progress
                </div>
                <p className="mt-2 text-sm">
                    Your transcript is ready and the feedback report will appear
                    here when analysis completes.
                </p>
            </div>
        );
    }

    return null;
}
