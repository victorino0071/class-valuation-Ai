// resources/js/components/shared/SectionTitle.tsx
import React from 'react';

interface SectionTitleProps {
    children: React.ReactNode;
}

const SectionTitle = ({ children }: SectionTitleProps) => {
    return <h3 className="text-xl font-semibold tracking-tight text-foreground">{children}</h3>;
};

export default SectionTitle;
