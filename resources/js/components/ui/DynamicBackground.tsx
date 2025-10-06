// src/components/ui/DynamicBackground.tsx

/**
 * Componente DynamicBackground
 * * Cria um fundo visualmente rico e dinâmico com os seguintes elementos:
 * 1.  Cor de base escura (#0a0f1e).
 * 2.  Uma "nebulosa" ou "aurora" central, que pulsa lentamente, criada com um gradiente radial.
 * 3.  Um efeito de "estrelas a piscar" criado com um gradiente radial repetido.
 * Cada "ponto" do gradiente funciona como uma estrela.
 * * Este componente deve ser usado como a base de um layout, posicionado de forma absoluta
 * ou fixa para cobrir todo o ecrã, com o conteúdo principal por cima dele (usando z-index).
 */
export const DynamicBackground = () => (
    <div className="absolute inset-0 -z-10 h-full w-full bg-[#0a0f1e]">
        {/* Efeito de Nebulosa/Aurora Pulsante */}
        <div className="animate-pulse-slow absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(25,220,140,0.3),rgba(255,255,255,0))]"></div>
        <div className="animate-pulse-slow [animation-delay:4s] absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(0,120,255,0.3),rgba(255,255,255,0))]"></div>
        
        {/* Efeito de Estrelas (adicionado) */}
        <div
            className="absolute inset-0 h-full w-full animate-star-twinkle bg-repeat"
            style={{ backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`, backgroundSize: '50px 50px' }}
        />
    </div>
);