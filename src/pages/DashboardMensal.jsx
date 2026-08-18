import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function DashboardMensal() {
    const [todasOrdens, setTodasOrdens] = useState([]);
    
    const dataAtual = new Date();
    const [anoSelecionado, setAnoSelecionado] = useState(dataAtual.getFullYear());
    const [mesSelecionadoStr, setMesSelecionadoStr] = useState(String(dataAtual.getMonth() + 1).padStart(2, '0'));
    
    // Controle do novo calendário customizado
    const [calendarioAberto, setCalendarioAberto] = useState(false);
    const dropdownRef = useRef(null);
    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    useEffect(() => {
        api.get('/todas').then(res => setTodasOrdens(res.data)).catch(err => console.error(err));

        const handleClickFora = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCalendarioAberto(false);
            }
        };
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
    }, []);

    const stringMesAnoAtual = `${anoSelecionado}-${mesSelecionadoStr}`;
    const ordensDoMes = todasOrdens.filter(os => os.dataEntrada && os.dataEntrada.startsWith(stringMesAnoAtual));
    
    const totalRecebido = ordensDoMes.length;
    const ordensTratadas = ordensDoMes.filter(os => ['PECAS_SEPARADAS', 'CONSUMIDO', 'CONCLUIDO', 'EM_TRANSITO'].includes(os.status));
    const entregasPrazoIdeal = ordensTratadas.filter(os => os.dias <= 2).length;
    const eficaciaSLA = ordensTratadas.length > 0 ? Math.round((entregasPrazoIdeal / ordensTratadas.length) * 100) : 0;
    
    const statusAuditoria = eficaciaSLA >= 90 ? 'APROVADO' : (totalRecebido === 0 ? 'SEM DADOS' : 'ALERTA');
    const corAuditoria = statusAuditoria === 'APROVADO' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : (statusAuditoria === 'SEM DADOS' ? 'text-slate-500 bg-slate-800' : 'text-rose-500 bg-rose-500/10 border-rose-500/30');

    const qtdAguardando = ordensDoMes.filter(os => os.status === 'AGUARDANDO_PECA' || os.status === 'AGUARDANDO_CHEGADA').length;
    const qtdEstoque = ordensDoMes.filter(os => os.status === 'EM_ESTOQUE').length;
    const qtdAcordo = ordensDoMes.filter(os => os.status === 'ACORDO').length;
    const qtdUrgente = ordensDoMes.filter(os => os.status === 'URGENTE').length;

    return (
        <div className="space-y-8 pb-10">
            {/* CABEÇALHO GLASSMORPHISM */}
            <div className="bg-white/[0.02] backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row justify-between items-center gap-6 relative z-50">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]"></span>
                        Dashboard Mensal & Performance SLA
                    </h2>
                    <p className="text-slate-400 text-[11px] font-bold uppercase mt-1 tracking-widest">Eficiência de entrega do estoque e fechamento operacional do período</p>
                </div>
                
                {/* CALENDÁRIO CUSTOMIZADO */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setCalendarioAberto(!calendarioAberto)}
                        className={`flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3.5 rounded-2xl border transition-all shadow-inner ${calendarioAberto ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-cyan-500/30 hover:border-cyan-400/70'}`}
                    >
                        <span className="text-cyan-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <span className="text-lg">🗓️</span> Mês Fechamento:
                        </span>
                        <span className="text-white font-black text-sm uppercase tracking-wider">
                            {mesesNomes[parseInt(mesSelecionadoStr)-1]} / {anoSelecionado}
                        </span>
                        <span className={`text-cyan-500 text-xs transition-transform ${calendarioAberto ? 'rotate-180' : ''}`}>▼</span>
                    </button>

                    {/* DROPDOWN DO CALENDÁRIO */}
                    {calendarioAberto && (
                        <div className="absolute right-0 top-full mt-3 w-80 bg-[#0b192c]/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] p-5 z-[100] animate-fade-in overflow-hidden">
                            {/* Controle do Ano */}
                            <div className="flex justify-between items-center mb-5 bg-black/20 p-2 rounded-2xl border border-white/5">
                                <button onClick={() => setAnoSelecionado(anoSelecionado - 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-cyan-500/20 text-cyan-400 font-bold transition-colors">◀</button>
                                <span className="text-xl font-black text-white">{anoSelecionado}</span>
                                <button onClick={() => setAnoSelecionado(anoSelecionado + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-cyan-500/20 text-cyan-400 font-bold transition-colors">▶</button>
                            </div>
                            
                            {/* Grade de Meses */}
                            <div className="grid grid-cols-3 gap-3">
                                {mesesNomes.map((nomeMes, index) => {
                                    const mesNumStr = String(index + 1).padStart(2, '0');
                                    const selecionado = mesSelecionadoStr === mesNumStr;
                                    return (
                                        <button 
                                            key={nomeMes}
                                            onClick={() => { setMesSelecionadoStr(mesNumStr); setCalendarioAberto(false); }}
                                            className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selecionado ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-black/30 text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300 border border-transparent hover:border-cyan-500/30'}`}
                                        >
                                            {nomeMes}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            {/* Botão Mês Atual */}
                            <div className="mt-5 pt-4 border-t border-white/5 text-center">
                                <button 
                                    onClick={() => {
                                        setAnoSelecionado(dataAtual.getFullYear());
                                        setMesSelecionadoStr(String(dataAtual.getMonth() + 1).padStart(2, '0'));
                                        setCalendarioAberto(false);
                                    }}
                                    className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Ir para o Mês Atual
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SEÇÃO DO BALANÇO E AUDITORIA (MANTIDO) */}
            <div className="bg-gradient-to-r from-blue-950/40 to-[#070d1a] backdrop-blur-xl p-10 rounded-3xl border border-cyan-500/20 flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                <div className="flex-1">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest border border-cyan-500/30 px-3 py-1.5 rounded-xl mb-4 inline-block bg-cyan-500/10">Relatório Oficial de Encerramento</span>
                    <h3 className="text-3xl font-black text-white uppercase tracking-wider mb-4">Balanço Final Logístico</h3>
                    <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
                        O estoque encerra o mês com um índice de assertividade de <strong className="text-cyan-400 text-xl mx-1">{eficaciaSLA}%</strong> nas separações logísticas. 
                        <br/><br/>
                        {eficaciaSLA >= 90 
                            ? <span className="text-emerald-400 font-bold">✨ Meta operacional atingida com sucesso! O fluxo logístico demonstrou excelência no tempo de resposta da equipe.</span> 
                            : (totalRecebido === 0 ? "Não há ordens de serviço importadas para este período." : <span className="text-rose-400 font-bold">⚠️ Indicador de performance está abaixo da meta operacional exigida (90%). É necessário um plano de ação imediato para reduzir atrasos na separação.</span>)
                        }
                    </p>
                </div>
                <div className="flex gap-4 shrink-0">
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 text-center min-w-[140px] shadow-xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Taxa de Sucesso</span>
                        <div className="text-4xl font-black text-white">{eficaciaSLA}%</div>
                    </div>
                    <div className={`backdrop-blur-md p-6 rounded-3xl border text-center min-w-[180px] shadow-xl ${corAuditoria}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest block mb-3 opacity-80">Status Auditoria</span>
                        <div className="text-3xl font-black uppercase tracking-widest">{statusAuditoria}</div>
                    </div>
                </div>
            </div>

            {/* LINHA 1 DE CARDS (SLA) (MANTIDO) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-cyan-400 shadow-[0_0_20px_#22d3ee]"></div>
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-widest block mb-1">Total Recebido (Mês)</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Volume de Ordens de Serviço Importadas</span>
                    <div className="mt-4 text-6xl font-black text-white">{totalRecebido}</div>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-400 shadow-[0_0_20px_#34d399]"></div>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block mb-1">Entregas &lt; 2 Dias</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Separadas no Prazo Ideal</span>
                    <div className="mt-4 text-6xl font-black text-emerald-400">{entregasPrazoIdeal}</div>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform flex flex-col justify-between">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-400 shadow-[0_0_20px_#34d399]"></div>
                    <div>
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block mb-1">Eficácia de SLA</span>
                            <span className="text-3xl font-black text-emerald-400">{eficaciaSLA}% 🚀</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Meta: 90% em até 2 dias</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-2.5 mt-4 border border-white/5">
                        <div className="bg-emerald-400 h-2.5 rounded-full shadow-[0_0_10px_#34d399] transition-all duration-1000" style={{ width: `${eficaciaSLA}%` }}></div>
                    </div>
                </div>
            </div>

            {/* LINHA DE STATUS INDIVIDUAIS (MANTIDO) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white/[0.02] backdrop-blur-xl p-5 rounded-2xl border border-white/5 flex justify-between items-center shadow-lg hover:border-amber-500/40 transition-colors">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Aguardando Chegada/Peça</span>
                        <div className="text-2xl font-black text-amber-400">{qtdAguardando} <span className="text-xs text-slate-500 uppercase tracking-widest ml-1">ordens</span></div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/30 text-amber-400 shadow-inner">⏳</div>
                </div>
                <div className="bg-white/[0.02] backdrop-blur-xl p-5 rounded-2xl border border-white/5 flex justify-between items-center shadow-lg hover:border-sky-500/40 transition-colors">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Em Estoque</span>
                        <div className="text-2xl font-black text-sky-400">{qtdEstoque} <span className="text-xs text-slate-500 uppercase tracking-widest ml-1">ordens</span></div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/30 text-sky-400 shadow-inner">📦</div>
                </div>
                <div className="bg-white/[0.02] backdrop-blur-xl p-5 rounded-2xl border border-white/5 flex justify-between items-center shadow-lg hover:border-fuchsia-500/40 transition-colors">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Em Acordo</span>
                        <div className="text-2xl font-black text-fuchsia-400">{qtdAcordo} <span className="text-xs text-slate-500 uppercase tracking-widest ml-1">ordens</span></div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/30 text-fuchsia-400 shadow-inner">🤝</div>
                </div>
                <div className="bg-white/[0.02] backdrop-blur-xl p-5 rounded-2xl border border-white/5 flex justify-between items-center shadow-lg hover:border-rose-500/40 transition-colors">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Urgentes</span>
                        <div className="text-2xl font-black text-rose-400">{qtdUrgente} <span className="text-xs text-slate-500 uppercase tracking-widest ml-1">ordens</span></div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/30 text-rose-400 shadow-inner">🚨</div>
                </div>
            </div>
            
        </div>
    );
}