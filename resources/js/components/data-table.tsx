// src/components/data-table.tsx

import React from 'react';

/**
 * Interface para a definição de cada coluna da tabela.
 * Usamos um Generic <T> para que o accessorKey seja uma chave válida do objeto de dados.
 */
export interface ColumnDef<T> {
    header: string; // O texto que aparecerá no cabeçalho <th>
    accessorKey: keyof T; // A chave do objeto de dados para acessar o valor da célula
}

/**
 * Props para o nosso componente DataTable.
 * Ele usa um Generic <T> que deve ser um objeto com uma propriedade 'id'.
 */
interface DataTableProps<T extends { id: number | string }> {
    // Array de dados a serem renderizados. Ex: turmas, alunos, etc.
    data: T[];
    // Definição das colunas, seguindo a interface ColumnDef.
    columns: ColumnDef<T>[];
    // Função a ser chamada ao clicar no botão de deletar.
    onDelete?: (id: number | string) => void;
    // Função a ser chamada ao clicar no botão de editar.
    onEdit: (item: T) => void;
    // Função OPCIONAL a ser chamada quando uma linha inteira é clicada.
    onRowClick?: (item: T) => void;
    // Estado booleano para desabilitar os botões de ação enquanto uma operação está em andamento.
    isProcessingActions?: boolean;
    // Mensagem a ser exibida quando não houver dados.
    emptyStateMessage: string;
}

/**
 * Componente de Tabela Genérico e Reutilizável.
 * Ele pode renderizar qualquer tipo de dado, contanto que as colunas e os dados sejam fornecidos.
 */
export default function DataTable<T extends { id: number | string }>({
    data,
    columns,
    onDelete,
    onEdit,
    onRowClick,
    isProcessingActions,
    emptyStateMessage,
}: DataTableProps<T>) {
    
    // Função para parar a propagação do evento, para que o onRowClick não seja acionado ao clicar nos botões.
    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                        {/* Mapeia as definições de coluna para criar os cabeçalhos */}
                        {columns.map((column) => (
                            <th key={String(column.accessorKey)} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                {column.header}
                            </th>
                        ))}
                        <th className="relative h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                            <span className="sr-only">Ações</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                    {data.length === 0 ? (
                        <tr>
                            {/* O colSpan é dinâmico, baseado no número de colunas + a coluna de ações */}
                            <td colSpan={columns.length + 1} className="p-4 text-center text-muted-foreground">
                                {emptyStateMessage}
                            </td>
                        </tr>
                    ) : (
                        // Mapeia os dados para criar as linhas da tabela
                        data.map((item) => (
                            <tr
                                key={item.id}
                                className={`border-b transition-colors hover:bg-muted/50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                // Se onRowClick for fornecido, a linha se torna clicável
                                onClick={() => onRowClick?.(item)}
                            >
                                {/* Mapeia as colunas novamente para cada linha para renderizar as células corretas */}
                                {columns.map((column) => (
                                    <td key={`${item.id}-${String(column.accessorKey)}`} className="p-4 align-middle font-medium">
                                        {/* Acessa o valor dinamicamente usando a accessorKey e fornece um fallback */}
                                        {(item[column.accessorKey] as React.ReactNode) || 'N/A'}
                                    </td>
                                ))}
                                <td className="p-4 text-right align-middle">
                                    <button
                                        onClick={(e) => {
                                            handleActionClick(e); // Impede que o clique na linha seja acionado
                                            onEdit(item);
                                        }}
                                        className="font-medium text-primary underline-offset-4 hover:underline mr-4"
                                    >
                                        Editar
                                    </button>
                                    {onDelete && ( // <-- Adiciona esta condição
                                        <button
                                            onClick={(e) => {
                                                handleActionClick(e);
                                                onDelete(item.id);
                                            }}
                                            className="font-medium text-destructive underline-offset-4 hover:underline disabled:opacity-50"
                                            disabled={isProcessingActions}
                                        >
                                            Deletar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}