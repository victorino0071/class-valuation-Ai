// resources/js/components/shared/DashboardHeader.tsx

import { Button } from '@/components/ui/button';

// ATUALIZADO: Tornando as props do botão opcionais
interface DashboardHeaderProps {
    title: string;
    description?: string;
    buttonLabel?: string; // <-- ADICIONE '?'
    onButtonClick?: () => void; // <-- ADICIONE '?'
    isLoading?: boolean;
}

const DashboardHeader = ({ title, description, buttonLabel, onButtonClick, isLoading }: DashboardHeaderProps) => {
    return (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>

            {/* ATUALIZADO: Renderiza o botão apenas se a função onButtonClick for passada */}
            {onButtonClick && buttonLabel && (
                <Button onClick={onButtonClick} disabled={isLoading}>
                    {isLoading ? 'Gerando...' : buttonLabel}
                </Button>
            )}
        </div>
    );
};

export default DashboardHeader;
