import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AguardandoChegada() {
    const [ordensAguardando, setOrdensAguardando] = useState([]);
    
    const [filtroOs, setFiltroOs] = useState('');
    const [filtroCidade, setFiltroCidade] = useState('');
    const [filtroPeca, setFiltroPeca] = useState('');

    const carregarOrdens = () => {
        api.get('/filtro/status/AGUARDANDO_PECA')
           .then(res => {
               const dadosOrdenados = res.data.sort((a, b) => b.dias - a.dias);
               setOrdensAguardando(dadosOrdenados);
           })
           .catch(err => {
               console.error("Erro ao buscar ordens aguardando peça do banco:", err);
               setOrdensAguardando([]); 
           });
    };

    useEffect(() => {
        carregarOrdens();
    }, []);

    // Atualiza os campos de texto ou datas
    const salvarDadosTransito = async (numeroOs, campo, valor) => {
        try {
            await api.put(`/${numeroOs}/${campo}`, `"${valor}"`, {
                headers: { 'Content-Type': 'application/json' }
            });
            setOrdensAguardando(prev => prev.map(os => os.numeroOs === numeroOs ? { ...os, [campo]: valor } : os));
        } catch (error) {
            console.error(`Erro ao salvar ${campo}:`, error);
        }
    };

    // NOVA FUNÇÃO: Muda o status e tira da tela
    const handleMudarStatus = async (numeroOs, novoStatus) => {
        try {
            await api.put(`/${numeroOs}/status`, `"${novoStatus}"`, {
                headers: { 'Content-Type': 'application/json' }
            });
            // Remove a ordem da tela imediatamente após o clique
            setOrdensAguardando(prev => prev.filter(os => os.numeroOs !== numeroOs));
        } catch (error) {
            console.error(error);
            alert("Erro ao alterar o status da ordem. Verifique o console.");
        }
    };

    const ordensFiltradas = ordensAguardando.filter(os => {
        return (
            os.numeroOs?.toLowerCase().includes(filtroOs.toLowerCase()) &&
            (os.cidade?.toLowerCase() || '').includes(filtroCidade.toLowerCase()) &&
            (os.observacao?.toLowerCase() || '').includes(filtroPeca.toLowerCase())
        );
    });

    return (
        <div className="space-y-8 pb-10">
            {/* CABEÇALHO */}
            <div className="bg-gradient-to-r from-[#0b192c] via-[#112240] to-[#0b192c] p-8 rounded-3xl border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.12)] flex justify-between items-center backdrop-blur-md">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse"></span>
                        Painel de Aguardando Chegada de Peça
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">Controle de peças em trânsito, notas fiscais e chamados JIRA</p>
                </div>
                <div className="bg-[#030712]/80 px-5 py-2.5 rounded-2xl border border-amber-500/30 text-amber-400 font-black text-xs uppercase shadow-inner">
                    {ordensFiltradas.length} Ordens em Trânsito / Espera
                </div>
            </div>

            {/* TABELA */}
            <div className="bg-[#0b192c] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
                        <thead className="bg-[#07101d] text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="px-5 py-4 font-black">Data</th>
                                <th className="px-5 py-4 font-black">Ordem de Serviço</th>
                                <th className="px-5 py-4 font-black">Dias</th>
                                <th className="px-5 py-4 font-black">Cidade</th>
                                <th className="px-5 py-4 font-black text-amber-400">Peça Faltando (Observação)</th>
                                <th className="px-5 py-4 font-black text-emerald-400">Previsão Entrega</th>
                                <th className="px-5 py-4 font-black text-amber-400">Nota Fiscal (NF)</th>
                                <th className="px-5 py-4 font-black text-amber-400">Chamado JIRA</th>
                                <th className="px-5 py-4 font-black text-center">Ação Operacional</th>
                            </tr>
                            {/* LINHA DE FILTROS */}
                            <tr className="bg-[#030712]/90 border-b border-slate-800">
                                <th className="px-4 py-3"></th>
                                <th className="px-4 py-3"><input type="text" placeholder="Filtrar OS..." value={filtroOs} onChange={(e) => setFiltroOs(e.target.value)} className="bg-[#0b192c] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 w-full outline-none focus:border-amber-400 shadow-inner" /></th>
                                <th className="px-4 py-3"></th>
                                <th className="px-4 py-3"><input type="text" placeholder="Filtrar Cidade..." value={filtroCidade} onChange={(e) => setFiltroCidade(e.target.value)} className="bg-[#0b192c] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 w-full outline-none focus:border-amber-400 shadow-inner" /></th>
                                <th className="px-4 py-3"><input type="text" placeholder="Filtrar Peça..." value={filtroPeca} onChange={(e) => setFiltroPeca(e.target.value)} className="bg-[#0b192c] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 w-full outline-none focus:border-amber-400 shadow-inner" /></th>
                                <th className="px-4 py-3"></th>
                                <th className="px-4 py-3"></th>
                                <th className="px-4 py-3"></th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {ordensFiltradas.map((os) => (
                                <tr key={os.numeroOs} className="hover:bg-[#132238]/60 transition-colors">
                                    <td className="px-5 py-4 text-xs text-slate-400">{os.dataEntrada}</td>
                                    <td className="px-5 py-4 font-black text-amber-400">{os.numeroOs}</td>
                                    <td className="px-5 py-4"><span className="font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">{os.dias}d</span></td>
                                    <td className="px-5 py-4 text-slate-400 uppercase text-xs">{os.cidade}</td>
                                    
                                    <td className="px-5 py-4">
                                        <input type="text" defaultValue={os.observacao || ''} onBlur={(e) => salvarDadosTransito(os.numeroOs, 'observacao', e.target.value)} placeholder="Descreva a peça..." className="bg-transparent border-b border-slate-700 hover:border-amber-400 px-2 py-1 text-xs text-white font-bold w-48 outline-none transition-colors placeholder-slate-600" />
                                    </td>
                                    
                                    {/* CALENDÁRIO COM TEMA ESCURO: [color-scheme:dark] */}
                                    <td className="px-5 py-4">
                                        <input 
                                            type="date" 
                                            defaultValue={os.previsao || ''} 
                                            onBlur={(e) => salvarDadosTransito(os.numeroOs, 'previsao', e.target.value)} 
                                            className="bg-transparent border-b border-slate-700 hover:border-emerald-400 px-2 py-1 text-xs text-emerald-400 font-bold w-36 outline-none transition-colors cursor-pointer [color-scheme:dark]" 
                                        />
                                    </td>
                                    
                                    <td className="px-5 py-4">
                                        <input type="text" defaultValue={os.fatura || ''} onBlur={(e) => salvarDadosTransito(os.numeroOs, 'fatura', e.target.value)} placeholder="Ex: 12345" className="bg-transparent border-b border-slate-700 hover:border-amber-400 px-2 py-1 text-xs text-amber-300 font-bold w-24 outline-none transition-colors placeholder-slate-600" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <input type="text" defaultValue={os.jira || ''} onBlur={(e) => salvarDadosTransito(os.numeroOs, 'jira', e.target.value)} placeholder="Ex: INC-9876" className="bg-transparent border-b border-slate-700 hover:border-amber-400 px-2 py-1 text-xs text-amber-300 font-bold w-24 outline-none transition-colors placeholder-slate-600" />
                                    </td>

                                    {/* NOVOS BOTÕES DE AÇÃO OPERACIONAL */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleMudarStatus(os.numeroOs, 'URGENTE')} 
                                                title="Mover para Painel de Execução"
                                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-colors uppercase tracking-wider">
                                                🚨 Urgente
                                            </button>
                                            <button 
                                                onClick={() => handleMudarStatus(os.numeroOs, 'CONCLUIDO')} 
                                                title="Baixar na Planilha Mestra"
                                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-colors uppercase tracking-wider">
                                                ✅ Concluído
                                            </button>
                                            <button 
                                                onClick={() => handleMudarStatus(os.numeroOs, 'ACORDO')} 
                                                title="Mover para Acordo"
                                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-black bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 hover:bg-fuchsia-500 hover:text-white transition-colors uppercase tracking-wider">
                                                🤝 Acordo
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {ordensFiltradas.length === 0 && (
                                <tr><td colSpan="9" className="px-6 py-14 text-center text-slate-500 font-bold text-base">Nenhuma ordem aguardando peça no momento.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}