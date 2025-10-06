// resources/js/layouts/Header.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { logout } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Loader2, PanelLeft, School, Search, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';

// Tipagem para os resultados da busca
interface SearchResult {
    id: number;
    nome: string;
    turma?: {
        id: number;
        nome: string;
    };
}

interface SearchResults {
    alunos: SearchResult[];
    turmas: SearchResult[];
}

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // --- LÓGICA DA BUSCA ---
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults>({ alunos: [], turmas: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Efeito para buscar com "debounce"
    useEffect(() => {
        if (query.length < 2) {
            setResults({ alunos: [], turmas: [] });
            return;
        }

        setIsLoading(true);
        const debounceTimeout = setTimeout(() => {
            axios
                .get(route('search', { query }))
                .then((response) => {
                    setResults(response.data);
                })
                .catch((error) => {
                    console.error('Erro ao buscar:', error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }, 300); // Aguarda 300ms após o utilizador parar de digitar

        return () => clearTimeout(debounceTimeout);
    }, [query]);

    // Efeito para fechar os resultados ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [searchRef]);

    const handleResultClick = () => {
        setQuery('');
        setShowResults(false);
    };

    const hasResults = results.alunos.length > 0 || results.turmas.length > 0;

    return (
        <header className="flex h-14 items-center gap-4 border-b border-border/20 bg-card/40 px-4 backdrop-blur-lg lg:h-[60px] lg:px-6">
            <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary md:hidden"
                onClick={onMenuClick}
            >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Abrir/Fechar Menu</span>
            </Button>

            {/* --- COMPONENTE DE BUSCA ATUALIZADO --- */}
            <div className="relative w-full flex-1" ref={searchRef}>
                <div className="relative">
                    <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar alunos, turmas..."
                        className="w-full appearance-none rounded-full border border-input bg-card/50 py-2 pr-4 pl-10 text-foreground shadow-sm backdrop-blur-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 md:w-2/3 lg:w-1/3"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setShowResults(true)}
                    />
                </div>

                {/* Dropdown de Resultados da Busca */}
                {showResults && query.length > 1 && (
                    <div className="absolute top-full z-50 mt-2 w-full rounded-xl border border-border/60 bg-card/80 p-2 shadow-lg backdrop-blur-xl md:w-2/3 lg:w-1/3">
                        {isLoading && (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {!isLoading && !hasResults && <p className="p-4 text-center text-sm text-muted-foreground">Nenhum resultado encontrado.</p>}
                        {!isLoading && hasResults && (
                            <div className="flex flex-col gap-1">
                                {/* Seção de Turmas */}
                                {results.turmas.length > 0 && (
                                    <>
                                        <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground">Turmas</h4>
                                        {results.turmas.map((turma) => (
                                            <Link
                                                key={`turma-${turma.id}`}
                                                href={route('turmas.show', turma.id)}
                                                className="flex items-center gap-3 rounded-lg p-2 text-sm transition-colors hover:bg-primary/10"
                                                onClick={handleResultClick}
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                                    <School className="h-4 w-4 text-primary" />
                                                </div>
                                                <span>{turma.nome}</span>
                                            </Link>
                                        ))}
                                    </>
                                )}
                                {/* Seção de Alunos */}
                                {results.alunos.length > 0 && (
                                    <>
                                        <h4 className="px-2 py-1 text-xs font-semibold text-muted-foreground">Alunos</h4>
                                        {results.alunos.map((aluno) => (
                                            <Link
                                                key={`aluno-${aluno.id}`}
                                                href={route('alunos.show', aluno.id)}
                                                className="flex items-center gap-3 rounded-lg p-2 text-sm transition-colors hover:bg-primary/10"
                                                onClick={handleResultClick}
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                                    <Users className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <span>{aluno.nome}</span>
                                                    <p className="text-xs text-muted-foreground">{aluno.turma?.nome}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Menu do Utilizador (sem alterações) */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="group rounded-full outline-none">
                        <Avatar className="h-9 w-9 transition-all group-hover:scale-110 group-hover:ring-2 group-hover:ring-primary group-hover:ring-offset-2 group-hover:ring-offset-background">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt={user?.name} />
                            <AvatarFallback>{user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="mt-2 w-56 rounded-xl border border-border/20 bg-card/50 p-1.5 backdrop-blur-xl">
                    <DropdownMenuLabel className="px-2 py-1.5 font-medium">{user?.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/20" />
                    <DropdownMenuItem asChild>
                        <Link href={route('profile.edit')} className="cursor-pointer">
                            Perfil
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/20" />
                    <DropdownMenuItem asChild>
                        <Link href={logout()} method="post" as="button" className="w-full cursor-pointer">
                            Sair
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
