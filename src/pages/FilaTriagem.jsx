import { useState, useEffect } from 'react';
import api from '../services/api';

export default function FilaTriagem() {
    const [pendentes, setPendentes] = useState([]);
    
    // Controle do Modal Inteligente de Peças Faltantes
    const [modalPeca, setModalPeca] = useState({ aberto: false, os: null, texto: '' });

    const carregarPendentes = () => {
        api.get('/pendentes')
           .then(res => setPendentes(res.data))
           .catch(err => {
               console.error("Erro ao buscar fila de triagem do banco:", err);
               setPendentes([]); 
           });
    };

    useEffect(() => {
        carregarPendentes();
    }, []);

    // Função normal para Urgente, Estoque e Acordo
    const handleDefinirStatus = async (numeroOs, novoStatus) => {
        try {
            await api.put(`/${numeroOs}/status`, `"${novoStatus}"`, {
                headers: { 'Content-Type': 'application/json' }
            });
            setPendentes(pendentes.filter(os => os.numeroOs !== numeroOs));
        } catch (error) {
            console.error(error);
            alert("Erro ao definir status da ordem.");
        }
    };

    // Função Exclusiva que roda ao confirmar o Modal de Peça Faltante
    const handleConfirmarAgPeca = async () => {
        const { os, texto } = modalPeca;
        try {
            // 1. Salva a peça faltante na observação (se o usuário digitou algo)
            if (texto.trim() !== '') {
                await api.put(`/${os.numeroOs}/observacao`, `"${texto}"`, {
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            // 2. Muda o status para Aguardando Peça
            await api.put(`/${os.numeroOs}/status`, `"AGUARDANDO_PECA"`, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            // 3. Limpa da tela e fecha o modal
            setPendentes(pendentes.filter(item => item.numeroOs !== os.numeroOs));
            setModalPeca({ aberto: false, os: null, texto: '' });
        } catch (error) {
            console.error(error);
            alert("Erro ao mover para Aguardando Peça.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-[#0b192c] via-[#112240] to-[#0b192c] p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.12)] flex justify-between items-center backdrop-blur-md">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                        Mesa de Triagem Inicial
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">Defina o destino e classifique as ordens recém-importadas do iService</p>
                </div>
                <div className="bg-[#030712]/80 px-5 py-2.5 rounded-2xl border border-cyan-500/30 text-cyan-400 font-black text-xs uppercase shadow-inner">
                    {pendentes.length} Ordens para Triar
                </div>
            </div>

            <div className="bg-[#0b192c] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
                        <thead className="bg-[#07101d] text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="px-5 py-4 font-black">Data</th>
                                <th className="px-5 py-4 font-black">Ordem de Serviço</th>
                                <th className="px-5 py-4 font-black">Dias</th>
                                <th className="px-5 py-4 font-black">Consultor</th>
                                <th className="px-5 py-4 font-black">Cidade</th>
                                <th className="px-5 py-4 font-black">Técnico</th>
                                <th className="px-5 py-4 font-black text-center">Ação de Classificação (Triagem)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {pendentes.map((os) => (
                                <tr key={os.numeroOs} className="hover:bg-[#132238]/60 transition-colors">
                                    <td className="px-5 py-4 text-xs text-slate-400">{os.dataEntrada}</td>
                                    <td className="px-5 py-4 font-bold text-cyan-400">{os.numeroOs}</td>
                                    <td className="px-5 py-4">
                                        <span className="font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">{os.dias}d</span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-200">{os.consultor}</td>
                                    <td className="px-5 py-4 text-slate-400 uppercase text-xs">{os.cidade}</td>
                                    <td className="px-5 py-4 text-slate-300">{os.tecnico || '-'}</td>
                                    
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleDefinirStatus(os.numeroOs, 'URGENTE')} className="px-3 py-1.5 rounded-lg text-xs font-black bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-colors">⏳ Urgente</button>
                                            <button onClick={() => handleDefinirStatus(os.numeroOs, 'EM_ESTOQUE')} className="px-3 py-1.5 rounded-lg text-xs font-black bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500 hover:text-white transition-colors">📦 Estoque</button>
                                            
                                            {/* BOTÃO QUE ABRE A NUVEM SUSPENSA (MODAL) */}
                                            <button onClick={() => setModalPeca({ aberto: true, os: os, texto: os.observacao || '' })} className="px-3 py-1.5 rounded-lg text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-900 transition-colors">
                                                ⏳ Ag. Peça
                                            </button>
                                            
                                            <button onClick={() => handleDefinirStatus(os.numeroOs, 'ACORDO')} className="px-3 py-1.5 rounded-lg text-xs font-black bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 hover:bg-fuchsia-500 hover:text-white transition-colors">🤝 Acordo</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pendentes.length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-bold text-base">Nenhuma ordem aguardando triagem no momento.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL INTELIGENTE DE PEÇAS FALTANTES */}
            {modalPeca.aberto && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-[#0b192c] p-8 rounded-3xl border border-amber-500/40 shadow-2xl w-[500px]">
                        <h3 className="text-xl font-black text-amber-400 mb-2 uppercase flex items-center gap-2">
                            <span>⚠️</span> Informar Peças Faltantes
                        </h3>
                        <p className="text-slate-400 text-xs mb-6 uppercase tracking-wider">
                            OS: <strong className="text-white">{modalPeca.os.numeroOs}</strong> - {modalPeca.os.cidade}
                        </p>
                        
                        <textarea 
                            value={modalPeca.texto} 
                            onChange={(e) => setModalPeca({...modalPeca, texto: e.target.value})} 
                            placeholder="Descreva os códigos ou nomes das peças que faltam..." 
                            className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-300 font-bold outline-none focus:border-amber-400 mb-6 shadow-inner min-h-[120px] resize-none" 
                            autoFocus 
                        />
                        
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModalPeca({ aberto: false, os: null, texto: '' })} className="px-5 py-2.5 text-slate-400 font-bold text-xs">Cancelar</button>
                            <button onClick={handleConfirmarAgPeca} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-lg uppercase tracking-wider">
                                Salvar e Mover
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}