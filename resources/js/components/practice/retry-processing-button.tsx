import { useForm } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';

type RetryProcessingButtonProps = {
    action: string;
    label: string;
    processingLabel?: string;
    className?: string;
};

export function RetryProcessingButton({
    action,
    label,
    processingLabel = 'Queueing retry...',
    className,
}: RetryProcessingButtonProps) {
    const { post, processing, errors } = useForm<{ retry: string }>({
        retry: '',
    });

    function submit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        post(action, {
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={submit} className={className}>
            <Button type="submit" variant="outline" disabled={processing}>
                <RotateCcw className={processing ? 'size-4 animate-spin' : 'size-4'} />
                {processing ? processingLabel : label}
            </Button>
            {errors.retry && (
                <p className="mt-2 text-sm text-destructive">{errors.retry}</p>
            )}
        </form>
    );
}
