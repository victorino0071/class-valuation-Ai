// resources/js/components/shared/EmptyStateCard.tsx
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

interface EmptyStateCardProps {
    title: string;
    message: string;
    buttonLabel: string;
    onButtonClick: () => void;
    isLoading?: boolean;
}

const EmptyStateCard = ({ title, message, buttonLabel, onButtonClick, isLoading }: EmptyStateCardProps) => {
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="text-center">
                    <CardHeader className="items-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <BarChart3 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{message}</CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-center">
                        <Button onClick={onButtonClick}>{isLoading ? 'Gerando...' : buttonLabel}</Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
};

export default EmptyStateCard;
