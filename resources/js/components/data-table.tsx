// src/components/data-table.tsx

import { Button } from '@/components/ui/button'; // Usaremos o Button para os ícones
import { Pencil, SearchX, Trash2 } from 'lucide-react'; // Ícones para ações e estado vazio
import React from 'react';

// As interfaces e tipos permanecem os mesmos. A estrutura lógica está perfeita.
export interface ColumnDef<T> {
    header: string;
    accessorKey: keyof T;
}

interface DataTableProps<T extends { id: number | string }> {
    data: T[];
    columns: ColumnDef<T>[];
    onDelete?: (id: number | string) => void;
    onEdit: (item: T) => void;
    onRowClick?: (item: T) => void;
    isProcessingActions?: boolean;
    emptyStateMessage: string;
}

export default function DataTable<T extends { id: number | string }>({
    data,
    columns,
    onDelete,
    onEdit,
    onRowClick,
    isProcessingActions,
    emptyStateMessage,
}: DataTableProps<T>) {
    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // MUDANÇA: O 'div' exterior foi removido. O componente agora retorna a <table> diretamente.
    // O estilo de "cartão de vidro" é agora responsabilidade do componente pai.
    return (
        <table className="w-full caption-bottom text-sm">
            {/* ==== CABEÇALHO COM ESTILO PROFISSIONAL ==== */}
            <thead>
                <tr className="border-b border-border/20">
                    {columns.map((column) => (
                        <th
                            key={String(column.accessorKey)}
                            className="h-12 px-4 text-left align-middle font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                            {column.header}
                        </th>
                    ))}
                    <th className="relative h-12 px-4 text-right align-middle">
                        <span className="sr-only">Ações</span>
                    </th>
                </tr>
            </thead>
            {/* ==== CORPO DA TABELA COM LINHAS "FLUTUANTES" E AÇÕES OCULTAS ==== */}
            <tbody className="divide-y divide-border/10">
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length + 1} className="py-16 text-center text-muted-foreground">
                            <SearchX className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                            {emptyStateMessage}
                        </td>
                    </tr>
                ) : (
                    data.map((item) => (
                        <tr
                            key={item.id}
                            className={`group transition-colors hover:bg-primary/10 ${onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onRowClick?.(item)}
                        >
                            {columns.map((column) => (
                                <td key={`${item.id}-${String(column.accessorKey)}`} className="p-4 align-middle font-medium">
                                    {(item[column.accessorKey] as React.ReactNode) || 'N/A'}
                                </td>
                            ))}
                            {/* ==== AÇÕES COM ÍCONES QUE APARECEM NO HOVER ==== */}
                            <td className="p-4 text-right align-middle">
                                <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:text-primary"
                                        onClick={(e) => {
                                            handleActionClick(e);
                                            onEdit(item);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Editar</span>
                                    </Button>
                                    {onDelete && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full hover:text-destructive"
                                            onClick={(e) => {
                                                handleActionClick(e);
                                                onDelete(item.id);
                                            }}
                                            disabled={isProcessingActions}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Deletar</span>
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}
