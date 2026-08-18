import { useState, useEffect } from 'react';
import api from '../services/api';

export default function PainelExecucao() {
    const [todasOrdens, setTodasOrdens] = useState([]);
    const [filtroOs, setFiltroOs] = useState('');
    const [filtroCidade, setFiltroCidade] = useState('');
    const [pecasFaltantes, setPecasFaltantes] = useState({});

    // Pega a data de hoje no formato YYYY-MM-DD para calcular a produtividade
    const hoje = new Date();
    const dataHojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

    const carregarOrdensParaExecucao = () => {
        api.get('/todas')
           .then(res => setTodasOrdens(res.data))
           .catch(err => {
               console.error("Erro ao carregar ordens:", err);
               setTodasOrdens([]); 
           });
    };

    useEffect(() => {
        carregarOrdensParaExecucao();
    }, []);

    const handlePecasSeparadas = async (numeroOs) => {
        try {
            await api.put(`/${numeroOs}/status`, `"PECAS_SEPARADAS"`, { headers: { 'Content-Type': 'application/json' }});
            // Atualiza localmente para a métrica de produtividade subir na mesma hora!
            setTodasOrdens(prev => prev.map(os => os.numeroOs === numeroOs ? { ...os, status: 'PECAS_SEPARADAS', dataAtualizacao: dataHojeStr } : os));
        } catch (error) {
            console.error(error); alert("Erro ao atualizar.");
        }
    };

    const handleAguardandoChegada = async (numeroOs) => {
        const pecaDigitada = pecasFaltantes[numeroOs];
        try {
            if (pecaDigitada && pecaDigitada.trim() !== '') {
                await api.put(`/${numeroOs}/observacao`, `"${pecaDigitada}"`, { headers: { 'Content-Type': 'application/json' }});
            }
            await api.put(`/${numeroOs}/status`, `"AGUARDANDO_PECA"`, { headers: { 'Content-Type': 'application/json' }});
            setTodasOrdens(prev => prev.map(os => os.numeroOs === numeroOs ? { ...os, status: 'AGUARDANDO_PECA' } : os));
        } catch (error) {
            console.error(error); alert("Erro ao informar falta de peça.");
        }
    };

    const handleAcordo = async (numeroOs) => {
        try {
            await api.put(`/${numeroOs}/status`, `"ACORDO"`, { headers: { 'Content-Type': 'application/json' }});
            setTodasOrdens(prev => prev.map(os => os.numeroOs === numeroOs ? { ...os, status: 'ACORDO' } : os));
        } catch (error) { console.error(error); }
    };

    // LÓGICA DE PRODUTIVIDADE
    const filaAtual = todasOrdens.filter(os => os.status === 'EM_ESTOQUE' || os.status === 'URGENTE');
    
    // Conta quantas foram separadas HOJE
    const separadasHoje = todasOrdens.filter(os => 
        ['PECAS_SEPARADAS', 'CONCLUIDO'].includes(os.status) && os.dataAtualizacao === dataHojeStr
    );

    const metaTotalDia = filaAtual.length + separadasHoje.length;
    const progressoFeito = separadasHoje.length;
    const porcentagem = metaTotalDia === 0 ? 0 : Math.round((progressoFeito / metaTotalDia) * 100);

    // FILTRO DA TABELA
    const ordensExibidas = filaAtual.filter(os => {
        return (
            os.numeroOs?.toLowerCase().includes(filtroOs.toLowerCase()) &&
            (os.cidade?.toLowerCase() || '').includes(filtroCidade.toLowerCase())
        );
    }).sort((a, b) => {
        if (a.status === 'URGENTE' && b.status !== 'URGENTE') return -1;
        if (a.status !== 'URGENTE' && b.status === 'URGENTE') return 1;
        return b.dias - a.dias;
    });

    const getEstiloStatus = (status) => {
        switch (status) {
            case 'EM_ESTOQUE': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
            case 'URGENTE': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
            default: return 'text-slate-300 bg-slate-800 border-slate-700';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* CABEÇALHO GLASSMORPHISM */}
            <div className="bg-white/[0.02] backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]"></span>
                        Painel de Execução (Estoque)
                    </h2>
                    <p className="text-slate-400 text-[11px] font-bold uppercase mt-1 tracking-widest">Separação física das peças na prateleira</p>
                </div>
                <div className="bg-black/40 px-5 py-3 rounded-2xl border border-cyan-500/30 text-cyan-400 font-black text-sm uppercase shadow-inner flex items-center gap-3">
                    <span>{ordensExibidas.length}</span> <span className="text-[10px] text-slate-400">Ordens na Fila</span>
                </div>
            </div>

            {/* NOVO PAINEL DE PRODUTIVIDADE DIÁRIA */}
            <div className="bg-gradient-to-r from-cyan-950/30 to-[#070d1a]/80 backdrop-blur-xl p-6 rounded-3xl border border-cyan-500/20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-emerald-400"></div>
                
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-1">Produtividade Diária da Equipe</span>
                        <div className="text-2xl font-black text-white">
                            {progressoFeito} <span className="text-sm text-slate-400 font-bold ml-1">de {metaTotalDia} ordens separadas hoje</span>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                        {porcentagem}%
                    </div>
                </div>

                {/* BARRA DE PROGRESSO GROSSA E BRILHANTE */}
                <div className="w-full bg-black/50 rounded-full h-4 border border-white/5 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(52,211,153,0.8)] relative"
                        style={{ width: `${porcentagem}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
                        <thead className="bg-white/[0.01] text-[10px] uppercase tracking-widest text-slate-400 border-b border-white/5">
                            <tr>
                                <th className="px-5 py-4 font-black">Data</th>
                                <th className="px-5 py-4 font-black">Ordem de Serviço</th>
                                <th className="px-5 py-4 font-black">Dias</th>
                                <th className="px-5 py-4 font-black">Cidade</th>
                                <th className="px-5 py-4 font-black text-center">Status (Triagem)</th>
                                <th className="px-5 py-4 font-black text-amber-400">Registrar Peça Faltante</th>
                                <th className="px-5 py-4 font-black text-center">Ação do Auxiliar</th>
                            </tr>
                            <tr className="bg-black/20 border-b border-white/5">
                                <th className="px-4 py-3"></th>
                                <th className="px-4 py-3"><input type="text" placeholder="Filtrar OS..." value={filtroOs} onChange={(e) => setFiltroOs(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 w-full outline-none focus:border-cyan-400 shadow-inner" /></th>
                                <th className="px-4 py-3"></th>
                                <th className="px-4 py-3"><input type="text" placeholder="Filtrar Cidade..." value={filtroCidade} onChange={(e) => setFiltroCidade(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 w-full outline-none focus:border-cyan-400 shadow-inner" /></th>
                                <th colSpan="3" className="px-4 py-3 text-[10px] font-bold text-slate-500 italic">Urgentes e mais atrasadas no topo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {ordensExibidas.map((os) => (
                                <tr key={os.numeroOs} className="hover:bg-white/[0.03] transition-colors">
                                    <td className="px-5 py-4 text-xs text-slate-400">{os.dataEntrada}</td>
                                    <td className="px-5 py-4 font-black text-cyan-400">{os.numeroOs}</td>
                                    <td className="px-5 py-4"><span className="font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">{os.dias}d</span></td>
                                    <td className="px-5 py-4 text-slate-400 uppercase text-xs">{os.cidade}</td>
                                    <td className="px-5 py-4 text-center"><span className={`border text-[10px] px-3 py-1 rounded-xl font-black uppercase tracking-wider shadow-sm ${getEstiloStatus(os.status)}`}>{os.status?.replace(/_/g, ' ')}</span></td>
                                    <td className="px-5 py-4">
                                        <input type="text" placeholder="Ex: Placa principal..." value={pecasFaltantes[os.numeroOs] || ''} onChange={(e) => setPecasFaltantes({...pecasFaltantes, [os.numeroOs]: e.target.value})} className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold w-48 outline-none focus:border-amber-400 shadow-inner"/>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handlePecasSeparadas(os.numeroOs)} className="px-3 py-2 rounded-xl text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]">📦 PEÇAS SEPARADAS</button>
                                            <button onClick={() => handleAguardandoChegada(os.numeroOs)} className="px-3 py-2 rounded-xl text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]">⏳ AGUARDANDO PEÇA</button>
                                            <button onClick={() => handleAcordo(os.numeroOs)} className="px-3 py-2 rounded-xl text-[10px] font-black bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 hover:bg-fuchsia-500 hover:text-white transition-all shadow-[0_0_10px_rgba(217,70,239,0.2)]">🤝 ACORDO</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {ordensExibidas.length === 0 && (
                                <tr><td colSpan="7" className="px-6 py-14 text-center text-slate-500 font-bold text-[10px] uppercase tracking-widest">Nenhuma ordem pendente de separação física no momento. Bom trabalho!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}