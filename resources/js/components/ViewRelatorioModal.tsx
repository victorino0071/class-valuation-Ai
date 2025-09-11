// resources/js/components/ViewRelatorioModal.tsx

import { Relatorio } from "@/types";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    relatorio: Relatorio | null;
}

export default function ViewRelatorioModal({ isOpen, onClose, relatorio }: Props) {
    if (!relatorio) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Relatório do {relatorio.bimestre}º Bimestre</DialogTitle>
                    <DialogDescription>
                        Visualizando relatório criado em {new Date(relatorio.created_at).toLocaleString()}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 whitespace-pre-wrap text-sm text-muted-foreground">
                    {relatorio.texto}
                </div>
            </DialogContent>
        </Dialog>
    );
}