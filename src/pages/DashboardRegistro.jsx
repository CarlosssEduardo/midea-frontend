import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function DashboardRegistro() {
    const [ordens, setOrdens] = useState([]);
    
    const dataAtual = new Date();
    const [anoSelecionado, setAnoSelecionado] = useState(dataAtual.getFullYear());
    const [mesSelecionadoStr, setMesSelecionadoStr] = useState(String(dataAtual.getMonth() + 1).padStart(2, '0'));
    
    // Filtros
    const [filtroTecnico, setFiltroTecnico] = useState('');
    const [filtroTransportadora, setFiltroTransportadora] = useState('');

    // Listas dinâmicas para os Selects
    const [tecnicosDisponiveis, setTecnicosDisponiveis] = useState([]);
    const [transportadorasDisponiveis, setTransportadorasDisponiveis] = useState([]);

    // Controle do novo calendário customizado
    const [calendarioAberto, setCalendarioAberto] = useState(false);
    const dropdownRef = useRef(null);

    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    useEffect(() => {
        api.get('/todas')
           .then(res => {
               const despachadas = res.data.filter(os => os.dataSaida);
               setOrdens(despachadas);

               const tecnicos = [...new Set(despachadas.map(os => os.tecnico).filter(t => t && t !== '.'))];
               const transportadoras = [...new Set(despachadas.map(os => os.transportadora).filter(t => t && t !== '.'))];
               
               setTecnicosDisponiveis(tecnicos.sort());
               setTransportadorasDisponiveis(transportadoras.sort());
           })
           .catch(err => console.error(err));
           
        // Fecha o calendário se clicar fora dele
        const handleClickFora = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCalendarioAberto(false);
            }
        };
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
    }, []);

    const stringMesAnoAtual = `${anoSelecionado}-${mesSelecionadoStr}`;
    const ordensDoMes = ordens.filter(os => os.dataSaida && os.dataSaida.startsWith(stringMesAnoAtual));
    
    const ordensFiltradas = ordensDoMes.filter(os => {
        const matchTecnico = filtroTecnico === '' || os.tecnico === filtroTecnico;
        const matchTransportadora = filtroTransportadora === '' || os.transportadora === filtroTransportadora;
        return matchTecnico && matchTransportadora;
    });

    const regioesMetropolitanas = ['BELEM', 'ANANINDEUA', 'MARITUBA', 'BENEVIDES', 'SANTA BARBARA'];
    const enviosCapital = ordensFiltradas.filter(os => regioesMetropolitanas.includes(os.cidade?.toUpperCase())).length;
    const enviosInterior = ordensFiltradas.length - enviosCapital;

    const contagemTecnicos = ordensFiltradas.reduce((acc, os) => {
        if (os.tecnico && os.tecnico !== '.') acc[os.tecnico] = (acc[os.tecnico] || 0) + 1;
        return acc;
    }, {});
    
    let tecnicoTop = { nome: 'N/A', qtd: 0 };
    Object.keys(contagemTecnicos).forEach(tec => {
        if (contagemTecnicos[tec] > tecnicoTop.qtd) tecnicoTop = { nome: tec, qtd: contagemTecnicos[tec] };
    });

    const contagemTransportadoras = ordensFiltradas.reduce((acc, os) => {
        if (os.transportadora && os.transportadora !== '.') acc[os.transportadora] = (acc[os.transportadora] || 0) + 1;
        return acc;
    }, {});
    
    let transportadoraTop = { nome: 'N/A', qtd: 0 };
    Object.keys(contagemTransportadoras).forEach(transp => {
        if (contagemTransportadoras[transp] > transportadoraTop.qtd) transportadoraTop = { nome: transp, qtd: contagemTransportadoras[transp] };
    });

    return (
        <div className="space-y-8 pb-10">
            {/* CABEÇALHO GLASSMORPHISM */}
            <div className="bg-white/[0.02] backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col md:flex-row justify-between items-center gap-6 relative z-50">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee]"></span>
                        Dashboard de Registro & Expedição
                    </h2>
                    <p className="text-slate-400 text-[11px] font-bold uppercase mt-1 tracking-widest">Métrica mensal de envios, regiões, transportadoras e técnicos</p>
                </div>
                
                {/* CALENDÁRIO CUSTOMIZADO (SEM INPUT NATIVO) */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setCalendarioAberto(!calendarioAberto)}
                        className={`flex items-center gap-4 bg-black/40 backdrop-blur-md px-6 py-3.5 rounded-2xl border transition-all shadow-inner ${calendarioAberto ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-cyan-500/30 hover:border-cyan-400/70'}`}
                    >
                        <span className="text-cyan-400 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                            <span className="text-lg">🗓️</span> Mês de Referência:
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

            {/* BARRA DE FILTROS DINÂMICOS (MANTIDA) */}
            <div className="bg-[#070d1a]/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex items-center gap-6 shadow-md">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Filtros Dinâmicos:</span>
                
                <select 
                    value={filtroTecnico} 
                    onChange={(e) => setFiltroTecnico(e.target.value)}
                    className="bg-[#0b192c] border border-cyan-900/50 text-cyan-300 text-xs font-bold px-4 py-2 rounded-xl outline-none cursor-pointer hover:border-cyan-500 transition-colors shadow-inner uppercase"
                >
                    <option value="">TODOS OS TÉCNICOS</option>
                    {tecnicosDisponiveis.map(tec => (
                        <option key={tec} value={tec}>{tec}</option>
                    ))}
                </select>

                <select 
                    value={filtroTransportadora} 
                    onChange={(e) => setFiltroTransportadora(e.target.value)}
                    className="bg-[#0b192c] border border-amber-900/50 text-amber-300 text-xs font-bold px-4 py-2 rounded-xl outline-none cursor-pointer hover:border-amber-500 transition-colors shadow-inner uppercase"
                >
                    <option value="">TODAS AS TRANSPORTADORAS</option>
                    {transportadorasDisponiveis.map(transp => (
                        <option key={transp} value={transp}>{transp}</option>
                    ))}
                </select>

                {(filtroTecnico || filtroTransportadora) && (
                    <button onClick={() => { setFiltroTecnico(''); setFiltroTransportadora(''); }} className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-widest underline decoration-dashed">
                        Limpar Filtros
                    </button>
                )}
            </div>

            {/* CARDS PRINCIPAIS (MANTIDOS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-cyan-400 shadow-[0_0_20px_#22d3ee]"></div>
                    <span className="text-[11px] font-black text-cyan-400 uppercase tracking-widest block mb-2">Total de Envios (Mês)</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Volume expedido {filtroTecnico ? `para ${filtroTecnico}` : 'geral'}</span>
                    <div className="mt-6 text-7xl font-black text-white drop-shadow-md">{ordensFiltradas.length}</div>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-400 shadow-[0_0_20px_#34d399]"></div>
                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Região Metropolitana</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Belém, Ananindeua, Marituba, etc.</span>
                    <div className="mt-6 text-7xl font-black text-white drop-shadow-md">{enviosCapital}</div>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
                    <div className="absolute left-0 top-0 w-1.5 h-full bg-amber-400 shadow-[0_0_20px_#fbbf24]"></div>
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest block mb-2">Interior</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Demais localidades</span>
                    <div className="mt-6 text-7xl font-black text-white drop-shadow-md">{enviosInterior}</div>
                </div>
            </div>
            
            {/* LINHA INFERIOR (TOPS) (MANTIDA) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!filtroTransportadora && (
                    <div className="bg-gradient-to-r from-fuchsia-950/40 to-[#070d1a] backdrop-blur-xl p-8 rounded-3xl border border-fuchsia-500/20 shadow-xl flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-purple-500"></div>
                        <div>
                            <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest block mb-2">Transportadora Mais Utilizada</span>
                            <div className="text-3xl font-black text-white uppercase tracking-wider">
                                {transportadoraTop.nome} <span className="text-sm text-slate-400 font-bold tracking-normal ml-2">({transportadoraTop.qtd} envios)</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(217,70,239,0.2)]">🚚</div>
                    </div>
                )}
                {!filtroTecnico && (
                    <div className="bg-gradient-to-r from-cyan-950/40 to-[#070d1a] backdrop-blur-xl p-8 rounded-3xl border border-cyan-500/20 shadow-xl flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                        <div>
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-2">Técnico com Mais Retiradas</span>
                            <div className="text-3xl font-black text-white uppercase tracking-wider">
                                {tecnicoTop.nome} <span className="text-sm text-slate-400 font-bold tracking-normal ml-2">({tecnicoTop.qtd} ordens)</span>
                            </div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">👨‍🔧</div>
                    </div>
                )}
            </div>
        </div>
    );
}