import { Pause, Play, Square } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { SpeakingFeedbackReport } from '@/types';

type FeedbackReaderProps = {
    report: SpeakingFeedbackReport | null;
};

type ReaderStatus = 'idle' | 'speaking' | 'paused';

function scoreLine(label: string, value: number | null | undefined): string {
    return `${label}: ${value ?? 'not available'} out of 100.`;
}

function listSection(
    title: string,
    items: string[] | null | undefined,
): string {
    if (!items?.length) {
        return '';
    }

    return `${title}. ${items.join('. ')}.`;
}

function buildFeedbackScript(report: SpeakingFeedbackReport | null): string {
    if (!report || report.status !== 'completed') {
        return '';
    }

    return [
        'Here is your speaking feedback.',
        scoreLine('Overall score', report.overall_score),
        scoreLine('Clarity', report.clarity_score),
        scoreLine('Structure', report.structure_score),
        scoreLine('Confidence', report.confidence_score),
        scoreLine('Pace', report.pace_score),
        scoreLine('Filler words', report.filler_word_score),
        report.summary_feedback ? `Summary. ${report.summary_feedback}` : '',
        listSection('Strengths', report.strengths),
        listSection('Weaknesses', report.weaknesses),
        listSection('Recommendations', report.recommendations),
        report.improved_version
            ? `Improved version. ${report.improved_version}`
            : '',
    ]
        .filter(Boolean)
        .join(' ');
}

export function FeedbackReader({ report }: FeedbackReaderProps) {
    const [status, setStatus] = useState<ReaderStatus>('idle');
    const [isSupported] = useState(
        () => typeof window !== 'undefined' && 'speechSynthesis' in window,
    );
    const feedbackScript = useMemo(() => buildFeedbackScript(report), [report]);

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    function readFeedback() {
        if (!isSupported || !feedbackScript) {
            return;
        }

        if (status === 'speaking') {
            window.speechSynthesis.pause();
            setStatus('paused');

            return;
        }

        if (status === 'paused') {
            window.speechSynthesis.resume();
            setStatus('speaking');

            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(feedbackScript);
        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.onend = () => setStatus('idle');
        utterance.onerror = () => setStatus('idle');

        window.speechSynthesis.speak(utterance);
        setStatus('speaking');
    }

    function stopReading() {
        if (!isSupported) {
            return;
        }

        window.speechSynthesis.cancel();
        setStatus('idle');
    }

    const isUnavailable = !isSupported || !feedbackScript;
    const buttonLabel =
        status === 'speaking'
            ? 'Pause'
            : status === 'paused'
              ? 'Resume'
              : 'Read aloud';
    const ButtonIcon = status === 'speaking' ? Pause : Play;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={readFeedback}
                disabled={isUnavailable}
            >
                <ButtonIcon className="size-4" />
                {buttonLabel}
            </Button>
            {status !== 'idle' && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={stopReading}
                    aria-label="Stop reading feedback"
                >
                    <Square className="size-4" />
                    Stop
                </Button>
            )}
            {!isSupported && (
                <span className="text-xs text-muted-foreground">
                    Read aloud is not supported in this browser.
                </span>
            )}
        </div>
    );
}
