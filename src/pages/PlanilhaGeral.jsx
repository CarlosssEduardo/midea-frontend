import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PlanilhaGeral() {
    const [dadosGerais, setDadosGerais] = useState([]);
    const [totaisStatus, setTotaisStatus] = useState({ total: 0, urgente: 0, estoque: 0, separadas: 0, chegada: 0, acordo: 0 });
    const [filtroOs, setFiltroOs] = useState('');
    const [filtroConsultor, setFiltroConsultor] = useState('');
    const [filtroCidade, setFiltroCidade] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

    const carregarPlanilhaCompleta = () => {
        api.get('/todas') 
           .then(res => {
               const dadosReais = res.data;
               
               // Sempre ordena do mais atrasado para o mais novo
               dadosReais.sort((a, b) => b.dias - a.dias);

               setDadosGerais(dadosReais);
               setTotaisStatus({
                   total: dadosReais.length,
                   urgente: dadosReais.filter(o => o.status === 'URGENTE').length,
                   estoque: dadosReais.filter(o => o.status === 'EM_ESTOQUE').length,
                   separadas: dadosReais.filter(o => o.status === 'PECAS_SEPARADAS' || o.status === 'CONCLUIDO').length,
                   chegada: dadosReais.filter(o => o.status === 'AGUARDANDO_CHEGADA' || o.status === 'AGUARDANDO_PECA').length,
                   acordo: dadosReais.filter(o => o.status === 'ACORDO').length,
               });
           })
           .catch(err => {
               console.error("Erro ao carregar planilha geral:", err);
               setDadosGerais([]); 
           });
    };

    useEffect(() => {
        carregarPlanilhaCompleta();
    }, []);

    const dadosFiltrados = dadosGerais.filter(os => {
        return (
            os.numeroOs?.toLowerCase().includes(filtroOs.toLowerCase()) &&
            (os.consultor?.toLowerCase() || '').includes(filtroConsultor.toLowerCase()) &&
            (os.cidade?.toLowerCase() || '').includes(filtroCidade.toLowerCase()) &&
            (os.status?.toLowerCase() || '').includes(filtroStatus.toLowerCase())
        );
    });

    const getEstiloStatus = (status) => {
        switch (status) {
            case 'PECAS_SEPARADAS': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'CONCLUIDO': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'EM_ESTOQUE': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
            case 'AGUARDANDO_PECA': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'AGUARDANDO_CHEGADA': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'URGENTE': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
            case 'ACORDO': return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30';
            default: return 'bg-slate-800 text-slate-300 border-slate-700';
        }
    };

    const getCorTextoOs = (status) => {
        switch (status) {
            case 'PECAS_SEPARADAS': return 'text-emerald-400';
            case 'CONCLUIDO': return 'text-emerald-400';
            case 'EM_ESTOQUE': return 'text-sky-400';
            case 'AGUARDANDO_PECA': return 'text-amber-400';
            case 'AGUARDANDO_CHEGADA': return 'text-amber-400';
            case 'URGENTE': return 'text-rose-400';
            case 'ACORDO': return 'text-fuchsia-400';
            default: return 'text-white';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="bg-gradient-to-r from-[#0b192c] via-[#112240] to-[#0b192c] p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.12)] flex justify-between items-center backdrop-blur-md">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                        Planilha Mestra (Visão Geral)
                    </h2>
                </div>
                <div className="bg-[#030712]/80 px-5 py-2.5 rounded-2xl border border-cyan-500/30 shadow-inner text-cyan-400 font-black text-xs tracking-widest uppercase">
                    {dadosFiltrados.length} Registros Exibidos
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
                <div className="bg-gradient-to-br from-[#0b192c] to-[#07101d] p-5 rounded-2xl border border-slate-800 text-center shadow-xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Geral</span>
                    <div className="text-3xl font-black text-white mt-2">{totaisStatus.total}</div>
                </div>
                <div className="bg-gradient-to-br from-[#0b192c] to-[#07101d] p-5 rounded-2xl border border-rose-500/30 text-center shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Urgentes</span>
                    <div className="text-3xl font-black text-rose-400 mt-2">{totaisStatus.urgente}</div>
                </div>
                <div className="bg-gradient-to-br from-[#0b192c] to-[#07101d] p-5 rounded-2xl border border-sky-500/30 text-center shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Em Estoque</span>
                    <div className="text-3xl font-black text-sky-400 mt-2">{totaisStatus.estoque}</div>
                </div>
                <div className="bg-gradient-to-br from-[#0b192c] to-[#07101d] p-5 rounded-2xl border border-emerald-500/30 text-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Separadas</span>
                    <div className="text-3xl font-black text-emerald-400 mt-2">{totaisStatus.separadas}</div>
                </div>
                <div className="bg-gradient-to-br from-[#0b192c] to-[#07101d] p-5 rounded-2xl border border-amber-500/30 text-center shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Ag. Peças/Chegada</span>
                    <div className="text-3xl font-black text-amber-400 mt-2">{totaisStatus.chegada}</div>
                </div>
                <div className="bg-gradient-to-br from-[#0b192c] to-[#07101d] p-5 rounded-2xl border border-fuchsia-500/30 text-center shadow-[0_0_15px_rgba(217,70,239,0.1)]">
                    <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">Acordo</span>
                    <div className="text-3xl font-black text-fuchsia-400 mt-2">{totaisStatus.acordo}</div>
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
                                <th className="px-5 py-4 font-black">Status Estoque</th>
                            </tr>
                            <tr className="bg-[#030712]/90 border-b border-slate-800">
                                <th className="px-4 py-3"></th>
                                <th className="px-4 py-3"><input type="text" placeholder="Filtrar OS..." value={filtroOs} onChange={(e) => setFiltroOs(e.target.value)} className="bg-[#0b192c] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 w-full outline-none focus:border-cyan-400 shadow-inner" /></th>
                                <th className="px-4 py-3"></th>
                                <th className="px-4 py-3"><input type="text" placeholder="Filtrar Consultor..." value={filtroConsultor} onChange={(e) => setFiltroConsultor(e.target.value)} className="bg-[#0b192c] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 w-full outline-none focus:border-cyan-400 shadow-inner" /></th>
                                <th className="px-4 py-3"><input type="text" placeholder="Filtrar Cidade..." value={filtroCidade} onChange={(e) => setFiltroCidade(e.target.value)} className="bg-[#0b192c] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 w-full outline-none focus:border-cyan-400 shadow-inner" /></th>
                                <th className="px-4 py-3"></th>
                                <th className="px-4 py-3"><input type="text" placeholder="Filtrar Status..." value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="bg-[#0b192c] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-cyan-300 w-full outline-none focus:border-cyan-400 shadow-inner" /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {dadosFiltrados.map((os) => (
                                <tr key={os.numeroOs} className="hover:bg-[#132238]/60 transition-colors">
                                    <td className="px-5 py-4 text-xs text-slate-400">{os.dataEntrada}</td>
                                    <td className="px-5 py-4 font-bold"><span className={`font-black ${getCorTextoOs(os.status)}`}>{os.numeroOs}</span></td>
                                    <td className="px-5 py-4"><span className="font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">{os.dias}d</span></td>
                                    <td className="px-5 py-4 font-medium text-slate-200">{os.consultor}</td>
                                    <td className="px-5 py-4 text-slate-400 uppercase text-xs">{os.cidade}</td>
                                    <td className="px-5 py-4 text-slate-300 font-medium">{os.tecnico}</td>
                                    <td className="px-5 py-4">
                                        <span className={`border text-[10px] px-3 py-1 rounded-xl font-black uppercase tracking-wider shadow-sm ${getEstiloStatus(os.status)}`}>
                                            {os.status === 'CONCLUIDO' ? 'PECAS SEPARADAS' : os.status?.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {dadosFiltrados.length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-14 text-center text-slate-500 font-bold text-base">Nenhuma ordem encontrada na base de dados.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}