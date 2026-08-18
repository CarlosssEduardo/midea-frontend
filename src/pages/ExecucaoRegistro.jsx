import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ExecucaoRegistro() {
    const [todasOrdens, setTodasOrdens] = useState([]);
    const [abaAtiva, setAbaAtiva] = useState('triagem'); 
    const [datasSaidaTemp, setDatasSaidaTemp] = useState({});

    const [modalTecnico, setModalTecnico] = useState(false);
    const [modalTransportadora, setModalTransportadora] = useState(false);
    const [modalManual, setModalManual] = useState(false);
    const [novoTecnico, setNovoTecnico] = useState('');
    const [novaTransportadora, setNovaTransportadora] = useState('');
    const [novaOsManual, setNovaOsManual] = useState('');

    const [listaTecnicos, setListaTecnicos] = useState(['EDUARDO', 'TIAGO', 'ELIAS', 'MAIKON', 'JONIEL', 'RONIELSON', 'DIEGO']);
    const [listaTransportadoras, setListaTransportadoras] = useState(['RETIRADA BALCÃO', 'BOA ESPERANÇA', 'PORTO ESPERANÇA', 'JAM JOY', 'AZUL CARGO', 'SINPROVAN']);

    const [filtroOs, setFiltroOs] = useState('');
    const [filtroTecnico, setFiltroTecnico] = useState('');

    const carregarOrdens = () => { api.get('/todas').then(res => setTodasOrdens(res.data)).catch(err => console.error(err)); };
    
    useEffect(() => { carregarOrdens(); }, []);

    const salvarRegistroExpedicao = async (numeroOs, campo, valor) => {
        try {
            await api.put(`/${numeroOs}/${campo}`, `"${valor}"`, { headers: { 'Content-Type': 'application/json' }});
            setTodasOrdens(prev => prev.map(os => os.numeroOs === numeroOs ? { ...os, [campo]: valor } : os));
        } catch (error) { console.error(error); }
    };

    const handleConcluir = async (os) => {
        const dataFinal = datasSaidaTemp[os.numeroOs] || os.dataSaida;
        if (!dataFinal) { alert("Preencha a Data de Saída antes de concluir!"); return; }
        try {
            await api.put(`/${os.numeroOs}/dataSaida`, `"${dataFinal}"`, { headers: { 'Content-Type': 'application/json' }});
            await api.put(`/${os.numeroOs}/status`, `"CONCLUIDO"`, { headers: { 'Content-Type': 'application/json' }});
            setTodasOrdens(prev => prev.map(item => item.numeroOs === os.numeroOs ? { ...item, dataSaida: dataFinal, status: 'CONCLUIDO' } : item));
        } catch (error) { console.error(error); }
    };

    const handleAdicionarManual = async () => { 
        if (!novaOsManual.trim()) return;
        try {
            const res = await api.post(`/manual/${novaOsManual.trim().toUpperCase()}`);
            setTodasOrdens([...todasOrdens, res.data]);
            setModalManual(false); setNovaOsManual(''); setAbaAtiva('triagem');
        } catch (error) { console.error(error); alert("Erro ao criar ordem manual."); }
    };
    
    const handleCadastrarTecnico = () => { 
        if (!novoTecnico.trim()) return;
        setListaTecnicos([...listaTecnicos, novoTecnico.toUpperCase().trim()]);
        setNovoTecnico(''); setModalTecnico(false);
    };
    
    const handleCadastrarTransportadora = () => { 
        if (!novaTransportadora.trim()) return;
        setListaTransportadoras([...listaTransportadoras, novaTransportadora.toUpperCase().trim()]);
        setNovaTransportadora(''); setModalTransportadora(false);
    };

    const ordensTriagem = todasOrdens.filter(os => os.status === 'PECAS_SEPARADAS' && !os.dataSaida);
    
    const ordensHistorico = todasOrdens.filter(os => os.dataSaida).filter(os => {
        return (os.numeroOs?.toLowerCase().includes(filtroOs.toLowerCase()) && (os.tecnico?.toLowerCase() || '').includes(filtroTecnico.toLowerCase()));
    }).sort((a, b) => {
        const dataA = a.dataSaida ? new Date(a.dataSaida) : new Date(0);
        const dataB = b.dataSaida ? new Date(b.dataSaida) : new Date(0);
        return dataB - dataA; 
    });

    return (
        <div className="space-y-8 pb-10">
            <div className="bg-white/[0.02] backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_#34d399]"></span>
                        Execução de Registro (Expedição)
                    </h2>
                    <p className="text-slate-400 text-[11px] font-bold uppercase mt-1 tracking-widest">Mesa de triagem de envio e painel geral de arquivos</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setModalManual(true)} className="bg-gradient-to-r from-fuchsia-600 to-purple-500 hover:scale-105 text-white px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(192,38,211,0.4)] border border-white/20 flex items-center gap-2"><span>📝</span> Registro Manual</button>
                    <button onClick={() => setModalTecnico(true)} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-white/20">+ Técnico</button>
                    <button onClick={() => setModalTransportadora(true)} className="bg-gradient-to-r from-amber-400 to-orange-500 hover:scale-105 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-white/20">+ Transportadora</button>
                </div>
            </div>

            <div className="flex bg-white/[0.02] backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-lg w-fit">
                <button onClick={() => setAbaAtiva('triagem')} className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${abaAtiva === 'triagem' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-400 hover:text-emerald-400'}`}>Triagem de Registro ({ordensTriagem.length})</button>
                <button onClick={() => setAbaAtiva('historico')} className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${abaAtiva === 'historico' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-cyan-400'}`}>Painel Geral de Separação</button>
            </div>

            {/* ABA 1: TRIAGEM DE REGISTRO */}
            {abaAtiva === 'triagem' && (
                <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden animate-fade-in">
                    <div className="bg-emerald-500/5 p-5 border-b border-emerald-500/10 flex justify-between items-center">
                        <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Fila de Triagem de Registro
                        </h3>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Após preencher os dados, clique em Concluir.</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
                            <thead className="bg-white/[0.01] text-[10px] uppercase tracking-widest text-slate-400 border-b border-white/5">
                                <tr>
                                    <th className="px-5 py-4 font-black">OS</th>
                                    <th className="px-5 py-4 font-black text-emerald-500">Data Separação</th>
                                    <th className="px-5 py-4 font-black">Técnico Responsável</th>
                                    <th className="px-5 py-4 font-black text-amber-400">Data Saída (Obrigatório)</th>
                                    <th className="px-5 py-4 font-black">Transportadora</th>
                                    <th className="px-5 py-4 font-black">Consumo</th>
                                    <th className="px-5 py-4 font-black text-center">Finalizar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {ordensTriagem.map((os) => (
                                    <tr key={os.numeroOs} className="hover:bg-white/[0.02] transition-colors">
                                        
                                        {/* CORREÇÃO AQUI: APENAS A LETRA DA OS MUDA A COR! */}
                                        <td className={`px-5 py-4 font-black drop-shadow-md ${os.consumido === 'CONSUMIDO' ? 'text-emerald-400' : 'text-rose-500'}`}>
                                            {os.numeroOs}
                                        </td>
                                        
                                        <td className="px-5 py-4 text-xs font-bold text-slate-400">{os.dataAtualizacao || '-'}</td>
                                        <td className="px-5 py-4">
                                            <input type="text" list="lista-tecnicos-cadastrados" defaultValue={os.tecnico && os.tecnico !== '.' ? os.tecnico : ''} onBlur={(e) => salvarRegistroExpedicao(os.numeroOs, 'tecnico', e.target.value)} placeholder="Técnico..." className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold w-40 outline-none focus:border-cyan-400 shadow-inner uppercase"/>
                                        </td>
                                        <td className="px-5 py-4 bg-amber-500/5">
                                            <input type="date" value={datasSaidaTemp[os.numeroOs] || os.dataSaida || ''} onChange={(e) => setDatasSaidaTemp({...datasSaidaTemp, [os.numeroOs]: e.target.value})} className="bg-black/40 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold w-36 outline-none focus:border-amber-400 shadow-inner cursor-pointer [color-scheme:dark]"/>
                                        </td>
                                        <td className="px-5 py-4">
                                            <input type="text" list="lista-transportadoras-cadastradas" defaultValue={os.transportadora && os.transportadora !== '.' ? os.transportadora : ''} onBlur={(e) => salvarRegistroExpedicao(os.numeroOs, 'transportadora', e.target.value)} placeholder="Transp..." className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold w-40 outline-none focus:border-cyan-400 shadow-inner uppercase"/>
                                        </td>
                                        <td className="px-5 py-4">
                                            <select 
                                                value={os.consumido || 'NAO_CONSUMIDO'} 
                                                onChange={(e) => salvarRegistroExpedicao(os.numeroOs, 'consumido', e.target.value)} 
                                                className={`border-2 rounded-xl px-2 py-1.5 text-[10px] font-black uppercase outline-none shadow-inner cursor-pointer transition-colors ${os.consumido === 'CONSUMIDO' ? 'border-emerald-500 text-emerald-400 bg-emerald-900/50' : 'border-rose-500 text-rose-400 bg-rose-900/50'}`}
                                            >
                                                <option value="CONSUMIDO" className="bg-[#0b192c] text-emerald-400">✔ CONSUMIDO</option>
                                                <option value="NAO_CONSUMIDO" className="bg-[#0b192c] text-rose-400">⏳ NÃO CONS.</option>
                                            </select>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button onClick={() => handleConcluir(os)} className="px-5 py-2.5 rounded-xl text-[10px] font-black bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] uppercase tracking-widest">✅ Concluir</button>
                                        </td>
                                    </tr>
                                ))}
                                {ordensTriagem.length === 0 && (
                                    <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">Nenhuma ordem aguardando triagem de registro.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ABA 2: PAINEL GERAL DE ARQUIVOS */}
            {abaAtiva === 'historico' && (
                <div className="bg-white/[0.02] backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden animate-fade-in">
                    <div className="bg-cyan-500/5 p-5 border-b border-cyan-500/10 flex justify-between items-center">
                        <h3 className="text-sm font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                            Painel Geral de Separação (Arquivo)
                        </h3>
                        <span className="bg-cyan-500/20 text-cyan-400 font-black text-[10px] px-3 py-1.5 rounded-xl border border-cyan-500/30 uppercase tracking-widest">
                            {ordensHistorico.length} Registros
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
                            <thead className="bg-white/[0.01] text-[10px] uppercase tracking-widest text-slate-400 border-b border-white/5">
                                <tr>
                                    <th className="px-5 py-4 font-black">Data Separação</th>
                                    <th className="px-5 py-4 font-black text-cyan-400">Data Saída</th>
                                    <th className="px-5 py-4 font-black text-white">Ordem de Serviço</th>
                                    <th className="px-5 py-4 font-black">Técnico</th>
                                    <th className="px-5 py-4 font-black">Transportadora</th>
                                    <th className="px-5 py-4 font-black">Consumo</th>
                                </tr>
                                <tr className="bg-black/20 border-b border-white/5">
                                    <th className="px-4 py-3"></th>
                                    <th className="px-4 py-3"></th>
                                    <th className="px-4 py-3"><input type="text" placeholder="Filtrar OS..." value={filtroOs} onChange={(e) => setFiltroOs(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 w-full outline-none focus:border-cyan-400 shadow-inner" /></th>
                                    <th className="px-4 py-3"><input type="text" placeholder="Filtrar Técnico..." value={filtroTecnico} onChange={(e) => setFiltroTecnico(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-cyan-300 w-full outline-none focus:border-cyan-400 shadow-inner" /></th>
                                    <th colSpan="2" className="px-4 py-3 text-[10px] font-bold text-slate-500 italic">Ordenado por Data de Saída</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {ordensHistorico.map((os) => (
                                    <tr key={os.numeroOs} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-4 text-xs font-bold text-slate-500">{os.dataAtualizacao || '-'}</td>
                                        <td className="px-5 py-4">
                                            <input type="date" defaultValue={os.dataSaida} onChange={(e) => salvarRegistroExpedicao(os.numeroOs, 'dataSaida', e.target.value)} className="bg-transparent text-cyan-300 font-bold outline-none cursor-pointer hover:border-b hover:border-cyan-400 transition-all w-32 [color-scheme:dark]"/>
                                        </td>
                                        
                                        {/* CORREÇÃO AQUI NO HISTÓRICO TAMBÉM */}
                                        <td className={`px-5 py-4 font-black drop-shadow-md ${os.consumido === 'CONSUMIDO' ? 'text-emerald-400' : 'text-rose-500'}`}>
                                            {os.numeroOs}
                                        </td>
                                        
                                        <td className="px-5 py-4">
                                            <input type="text" list="lista-tecnicos-cadastrados" defaultValue={os.tecnico && os.tecnico !== '.' ? os.tecnico : ''} onBlur={(e) => salvarRegistroExpedicao(os.numeroOs, 'tecnico', e.target.value)} className="bg-transparent text-slate-300 font-bold outline-none hover:border-b hover:border-cyan-400 transition-all w-36 uppercase"/>
                                        </td>
                                        <td className="px-5 py-4">
                                            <input type="text" list="lista-transportadoras-cadastradas" defaultValue={os.transportadora && os.transportadora !== '.' ? os.transportadora : ''} onBlur={(e) => salvarRegistroExpedicao(os.numeroOs, 'transportadora', e.target.value)} className="bg-transparent text-amber-200 font-bold outline-none hover:border-b hover:border-amber-400 transition-all w-36 uppercase"/>
                                        </td>
                                        <td className="px-5 py-4">
                                            <select 
                                                defaultValue={os.consumido || 'NAO_CONSUMIDO'} 
                                                onChange={(e) => salvarRegistroExpedicao(os.numeroOs, 'consumido', e.target.value)} 
                                                className={`border-2 rounded-xl px-2 py-1.5 text-[10px] font-black uppercase outline-none shadow-inner cursor-pointer transition-colors ${os.consumido === 'CONSUMIDO' ? 'border-emerald-500 text-emerald-400 bg-emerald-900/50' : 'border-rose-500 text-rose-400 bg-rose-900/50'}`}
                                            >
                                                <option value="CONSUMIDO" className="bg-[#0b192c] text-emerald-400">✔ CONS.</option>
                                                <option value="NAO_CONSUMIDO" className="bg-[#0b192c] text-rose-400">⏳ NÃO CONS.</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {ordensHistorico.length === 0 && (
                                    <tr><td colSpan="6" className="px-6 py-14 text-center text-slate-500 font-bold text-[10px] uppercase tracking-widest">Nenhum registro de despacho concluído.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <datalist id="lista-tecnicos-cadastrados">{listaTecnicos.map((tec, i) => <option key={i} value={tec} />)}</datalist>
            <datalist id="lista-transportadoras-cadastradas">{listaTransportadoras.map((transp, i) => <option key={i} value={transp} />)}</datalist>

            {modalManual && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-[#0b192c] p-8 rounded-3xl border border-fuchsia-500/40 shadow-2xl w-[450px]">
                        <h3 className="text-xl font-black text-white mb-2 uppercase">Registro Manual (Avulso)</h3>
                        <input type="text" value={novaOsManual} onChange={(e) => setNovaOsManual(e.target.value)} placeholder="Ex: BRWO260..." className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-3 text-sm text-fuchsia-300 font-bold outline-none focus:border-fuchsia-400 mb-6 shadow-inner uppercase" autoFocus />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModalManual(false)} className="px-5 py-2.5 text-slate-400 font-bold text-xs">Cancelar</button>
                            <button onClick={handleAdicionarManual} className="px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-black text-xs shadow-lg">Criar OS</button>
                        </div>
                    </div>
                </div>
            )}

            {modalTecnico && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-[#0b192c] p-8 rounded-3xl border border-cyan-500/40 shadow-2xl w-[450px]">
                        <h3 className="text-xl font-black text-white mb-2 uppercase">Cadastrar Técnico</h3>
                        <input type="text" value={novoTecnico} onChange={(e) => setNovoTecnico(e.target.value)} className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-3 text-sm text-cyan-300 font-bold outline-none focus:border-cyan-400 my-6 shadow-inner uppercase" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModalTecnico(false)} className="px-5 py-2.5 text-slate-400 font-bold text-xs">Cancelar</button>
                            <button onClick={handleCadastrarTecnico} className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-xs shadow-lg">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalTransportadora && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-[#0b192c] p-8 rounded-3xl border border-amber-500/40 shadow-2xl w-[450px]">
                        <h3 className="text-xl font-black text-white mb-2 uppercase">Cadastrar Transportadora</h3>
                        <input type="text" value={novaTransportadora} onChange={(e) => setNovaTransportadora(e.target.value)} className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-300 font-bold outline-none focus:border-amber-400 my-6 shadow-inner uppercase" />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModalTransportadora(false)} className="px-5 py-2.5 text-slate-400 font-bold text-xs">Cancelar</button>
                            <button onClick={handleCadastrarTransportadora} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-lg">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}