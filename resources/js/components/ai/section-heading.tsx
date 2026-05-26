import type { ReactNode } from 'react';

type SectionHeadingProps = {
    eyebrow?: string;
    title: string;
    description?: string;
    align?: 'left' | 'center';
    children?: ReactNode;
};

export function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'center',
    children,
}: SectionHeadingProps) {
    return (
        <div
            className={
                align === 'center'
                    ? 'mx-auto max-w-3xl text-center'
                    : 'max-w-3xl text-left'
            }
        >
            {eyebrow && (
                <p className="mb-3 text-sm font-semibold text-cyan-200">
                    {eyebrow}
                </p>
            )}
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                {title}
            </h2>
            {description && (
                <p className="mt-4 text-base leading-7 text-slate-300">
                    {description}
                </p>
            )}
            {children}
        </div>
    );
}
