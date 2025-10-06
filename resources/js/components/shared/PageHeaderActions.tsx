// resources/js/components/shared/PageHeaderActions.tsx

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, ChevronDown, Eye, EyeOff, Plus } from 'lucide-react';
import React from 'react';

interface DropdownAction {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    isDestructive?: boolean;
}

interface PageHeaderActionsProps {
    primaryActionLabel: string;
    onPrimaryActionClick: () => void;
    onBackClick?: () => void;
    onToggleDashboard?: () => void;
    isDashboardVisible?: boolean;
    dropdownActions?: DropdownAction[];
}

// Estilo base para os botões secundários, para evitar repetição
const secondaryButtonClass =
    'rounded-full border-border/30 bg-card/50 backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary';

const PageHeaderActions = ({
    primaryActionLabel,
    onPrimaryActionClick,
    onBackClick,
    onToggleDashboard,
    isDashboardVisible,
    dropdownActions,
}: PageHeaderActionsProps) => {
    return (
        // A estrutura flex continua ótima, apenas ajustamos os componentes internos
        <div className="flex w-full items-center justify-between gap-4">
            {/* ==== Botão de Voltar (Minimalista) ==== */}
            <div>
                {onBackClick && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBackClick}
                        aria-label="Voltar"
                        className="h-9 w-9 rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* ==== Ações à Direita ==== */}
            <div className="flex items-center gap-3">
                {/* Botão de Toggle (Estilo Secundário) */}
                {onToggleDashboard && (
                    <Button variant="outline" className={secondaryButtonClass} onClick={onToggleDashboard}>
                        {isDashboardVisible ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {isDashboardVisible ? 'Esconder Análise' : 'Mostrar Análise'}
                    </Button>
                )}

                {/* Dropdown (Estilo Secundário e Menu "Glass") */}
                {dropdownActions && dropdownActions.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className={secondaryButtonClass}>
                                Ações <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="mt-2 w-56 rounded-xl border border-border/20 bg-card/50 p-1.5 backdrop-blur-xl">
                            {dropdownActions.map((action, index) => (
                                <React.Fragment key={index}>
                                    <DropdownMenuItem
                                        onClick={action.onClick}
                                        className={`cursor-pointer rounded-md transition-colors focus:bg-primary/10 focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary ${
                                            action.isDestructive ? 'text-destructive focus:bg-destructive/10 focus:text-destructive' : ''
                                        }`}
                                    >
                                        <action.icon className="mr-2 h-4 w-4" />
                                        <span>{action.label}</span>
                                    </DropdownMenuItem>
                                    {index < dropdownActions.length - 1 && <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-border/20" />}
                                </React.Fragment>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* ==== Ação Primária (Botão com Gradiente e Efeito de Brilho) ==== */}
                <button
                    onClick={onPrimaryActionClick}
                    className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[var(--chart-1)] to-[var(--chart-2)] px-5 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:brightness-110"
                >
                    <Plus className="relative z-10 mr-2 -ml-1 h-4 w-4" />
                    <span className="relative z-10">{primaryActionLabel}</span>
                    <div className="absolute inset-0 translate-x-[-100%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.3),transparent)] transition-transform duration-700 group-hover:translate-x-[100%]" />
                </button>
            </div>
        </div>
    );
};

export default PageHeaderActions;
