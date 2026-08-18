import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
    const [dados, setDados] = useState(null);
    const [fila, setFila] = useState([]);
    const [filtroAtivo, setFiltroAtivo] = useState('PENDENTE_TRIAGEM'); // Controla qual card está selecionado

    const carregarDados = (statusFiltro = 'PENDENTE_TRIAGEM') => {
        setFiltroAtivo(statusFiltro);
        Promise.all([
            api.get('/dashboard'),
            api.get(`/filtro/status/${statusFiltro}`)
        ]).then(([resDashboard, resFila]) => {
            setDados(resDashboard.data);
            setFila(resFila.data);
        }).catch(error => console.error("Erro ao carregar dados:", error));
    };

    useEffect(() => {
        carregarDados('PENDENTE_TRIAGEM');
    }, []);

    const alterarStatus = async (numeroOs, novoStatus) => {
        try {
            await api.put(`/${numeroOs}/status`, `"${novoStatus}"`, {
                headers: { 'Content-Type': 'application/json' }
            });
            carregarDados(filtroAtivo); 
        } catch (error) {
            alert("Erro de comunicação com o servidor.");
        }
    };

    if (!dados) return <div className="text-cyan-400 text-center font-bold animate-pulse mt-20">Carregando painel operacional...</div>;

    return (
        <div className="space-y-8">
            
            {/* 1. CARDS CLICÁVEIS (FILTROS DO PAINEL) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card Peças Separadas */}
                <div 
                    onClick={() => carregarDados('PECAS_SEPARADAS')}
                    className={`bg-slate-900 p-6 rounded-xl border shadow-xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${filtroAtivo === 'PECAS_SEPARADAS' ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-800'}`}>
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">Peças Separadas</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase">Clique para Filtrar Tabela</p>
                        </div>
                        <span className="bg-cyan-500/10 text-cyan-400 p-2 rounded-lg border border-cyan-500/20 text-xs font-bold">OK</span>
                    </div>
                    <div className="mt-4 text-5xl font-black text-white tracking-tight">{dados.diario.PECAS_SEPARADAS}</div>
                </div>

                {/* Card Em Estoque / Ag. Peça */}
                <div 
                    onClick={() => carregarDados('EM_ESTOQUE')}
                    className={`bg-slate-900 p-6 rounded-xl border shadow-xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${filtroAtivo === 'EM_ESTOQUE' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-800'}`}>
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">Aguardando Peça (Estoque)</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase">Clique para Filtrar Tabela</p>
                        </div>
                        <span className="bg-amber-400/10 text-amber-400 p-2 rounded-lg border border-amber-400/20 text-xs font-bold">ESTOQUE</span>
                    </div>
                    <div className="mt-4 text-5xl font-black text-white tracking-tight">{dados.diario.EM_ESTOQUE}</div>
                </div>

                {/* Card Urgentes */}
                <div 
                    onClick={() => carregarDados('URGENTE')}
                    className={`bg-slate-900 p-6 rounded-xl border shadow-xl relative overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${filtroAtivo === 'URGENTE' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-800'}`}>
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-slate-400 text-xs font-black uppercase tracking-wider mb-1">Urgentes Acionadas</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase">Clique para Filtrar Tabela</p>
                        </div>
                        <span className="bg-rose-500/10 text-rose-400 p-2 rounded-lg border border-rose-500/20 text-xs font-bold">PRIORIDADE</span>
                    </div>
                    <div className="mt-4 text-5xl font-black text-rose-400 tracking-tight">{dados.diario.URGENTE}</div>
                </div>
            </div>

            {/* 2. TABELA COMPLETA ESTILO EXCEL */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="bg-slate-950/60 p-5 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
                        Fila Operacional: <span className="text-cyan-400">{filtroAtivo.replace(/_/g, ' ')}</span>
                    </h2>
                    <span className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-1.5 rounded-full border border-slate-700">
                        {fila.length} Registros na Tabela
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
                        <thead className="bg-slate-950/40 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="px-4 py-4 font-black">Data</th>
                                <th className="px-4 py-4 font-black">Ordem de Serviço</th>
                                <th className="px-4 py-4 font-black">Dias</th>
                                <th className="px-4 py-4 font-black">Consultor</th>
                                <th className="px-4 py-4 font-black">Cidade</th>
                                <th className="px-4 py-4 font-black">Técnico</th>
                                <th className="px-4 py-4 font-black">Status Estoque</th>
                                <th className="px-4 py-4 font-black">Observação iService</th>
                                <th className="px-4 py-4 font-black">Nº da Fatura</th>
                                <th className="px-4 py-4 font-black text-right">Ação de Execução</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {fila.map((os) => {
                                // Efeito visual idêntico ao Excel se o status for ACORDO
                                const isAcordo = os.status === 'ACORDO';
                                return (
                                    <tr key={os.numeroOs} className={`transition-colors ${isAcordo ? 'bg-fuchsia-950/20 hover:bg-fuchsia-900/30' : 'hover:bg-slate-800/40'}`}>
                                        
                                        <td className="px-4 py-4 text-xs text-slate-400">{os.data || '15/07/2026'}</td>
                                        
                                        <td className="px-4 py-4 font-bold text-white">
                                            <span className={isAcordo ? 'text-fuchsia-400 font-black' : 'text-cyan-400'}>{os.numeroOs}</span>
                                        </td>
                                        
                                        <td className="px-4 py-4">
                                            <span className={`font-black ${os.dias >= 15 ? 'text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20' : 'text-slate-400'}`}>
                                                {os.dias}d
                                            </span>
                                        </td>
                                        
                                        <td className="px-4 py-4 font-medium text-slate-200">{os.consultor || 'ALINNE'}</td>
                                        <td className="px-4 py-4 text-slate-400 uppercase text-xs">{os.cidade || 'BELEM'}</td>
                                        <td className="px-4 py-4 text-slate-300 font-medium">{os.tecnico || 'EDUARDO'}</td>
                                        
                                        {/* Status com cores dinâmicas */}
                                        <td className="px-4 py-4">
                                            <span className={`border text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider ${isAcordo ? 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                                                {os.status ? os.status.replace(/_/g, ' ') : 'PENDENTE'}
                                            </span>
                                        </td>
                                        
                                        <td className="px-4 py-4">
                                            <div className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-300 max-w-xs truncate shadow-inner">
                                                {os.observacao || 'Sem observações'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 font-mono text-cyan-300 font-bold text-xs">
                                            {os.fatura || '996484'}
                                        </td>

                                        {/* BOTÕES DE AÇÃO */}
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button 
                                                    onClick={() => alterarStatus(os.numeroOs, 'PECAS_SEPARADAS')}
                                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1.5 rounded font-bold text-[11px] transition-all">
                                                    Separar
                                                </button>
                                                <button 
                                                    onClick={() => alterarStatus(os.numeroOs, 'EM_ESTOQUE')}
                                                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1.5 rounded font-black text-[11px] transition-all">
                                                    Ag. Peça
                                                </button>
                                                <button 
                                                    onClick={() => alterarStatus(os.numeroOs, 'ACORDO')}
                                                    className="bg-fuchsia-600/20 text-fuchsia-400 hover:bg-fuchsia-600 hover:text-white border border-fuchsia-500/30 px-2 py-1.5 rounded font-bold text-[11px] transition-all">
                                                    Acordo
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {fila.length === 0 && (
                                <tr>
                                    <td colSpan="10" className="px-6 py-12 text-center text-slate-500 font-bold text-base">
                                        Nenhum registro encontrado para este filtro.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}