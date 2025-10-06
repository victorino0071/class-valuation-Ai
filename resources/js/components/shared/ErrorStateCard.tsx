// resources/js/components/shared/ErrorStateCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateCardProps {
    title?: string;
    message: string;
    details?: string;
}

const ErrorStateCard = ({ title = 'Ocorreu um Erro', message, details }: ErrorStateCardProps) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-destructive bg-destructive/10">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                        <CardTitle className="text-destructive">{title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm font-medium text-destructive">{message}</p>
                    {details && <p className="mt-2 text-sm text-muted-foreground">{details}</p>}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ErrorStateCard;
