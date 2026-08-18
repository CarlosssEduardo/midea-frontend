import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ControleExpedicao() {
    const [listaSaidas, setListaSaidas] = useState([]);
    const [buscaGeral, setBuscaGeral] = useState(''); // Filtro para o consultor consultar o envio

    const [modalTecnico, setModalTecnico] = useState(false);
    const [modalTransportadora, setModalTransportadora] = useState(false);
    
    const [novoTecnico, setNovoTecnico] = useState('');
    const [novaTransportadora, setNovaTransportadora] = useState('');

    // Listas base de exemplo (que depois virão do cadastro do banco)
    const [tecnicos, setTecnicos] = useState(['EDUARDO', 'TIAGO - TUCURUI', 'ANAJÁS - ELIAS', 'JONIEL - MARABÁ', 'PAULO - CASTANHAL']);
    const [transportadoras, setTransportadoras] = useState(['RETIRADA BALCÃO', 'BOA ESPERANÇA', 'JAM JOY', 'AZUL CARGO', 'SINPROVAN']);

    const carregarExpedicao = () => {
        api.get('/filtro/status/PECAS_SEPARADAS')
           .then(res => setListaSaidas(res.data))
           .catch(err => {
               setListaSaidas([
                   { numeroOs: 'BRWO260610299', cidade: 'ANANINDEUA', tecnico: 'EDUARDO', dataSaida: '2026-07-08', transportadora: 'RETIRADA BALCÃO', consumido: 'NAO_CONSUMIDO', envioA: 'ENTREGUE A EDUARDO' },
                   { numeroOs: 'BRWO260602760', cidade: 'BELEM', tecnico: 'TIAGO - TUCURUI', dataSaida: '2026-07-09', transportadora: 'BOA ESPERANÇA', consumido: 'CONSUMIDO', envioA: 'ENTREGUE AO JOSE' },
               ]);
           });
    };

    useEffect(() => {
        carregarExpedicao();
    }, []);

    const salvarCampoExpedicao = async (numeroOs, campo, valor) => {
        try {
            await api.put(`/${numeroOs}/${campo}`, `"${valor}"`, {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error(`Erro ao salvar ${campo}:`, error);
        }
    };

    const cadastrarTecnico = () => {
        if (!novoTecnico) return;
        setTecnicos([...tecnicos, novoTecnico.toUpperCase()]);
        setNovoTecnico('');
        setModalTecnico(false);
    };

    const cadastrarTransportadora = () => {
        if (!novaTransportadora) return;
        setTransportadoras([...transportadoras, novaTransportadora.toUpperCase()]);
        setNovaTransportadora('');
        setModalTransportadora(false);
    };

    // Filtragem para o consultor consultar se a peça foi enviada
    const listaFiltrada = listaSaidas.filter(os => {
        return (
            os.numeroOs.toLowerCase().includes(buscaGeral.toLowerCase()) ||
            os.cidade.toLowerCase().includes(buscaGeral.toLowerCase()) ||
            os.tecnico.toLowerCase().includes(buscaGeral.toLowerCase())
        );
    });

    return (
        <div className="space-y-8">
            
            {/* CABEÇALHO E CONSULTA PARA CONSULTORES */}
            <div className="bg-gradient-to-r from-[#0b192c] via-[#112240] to-[#0b192c] p-8 rounded-3xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.12)] flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-md">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"></span>
                        Controle de Expedição & Saídas
                    </h2>
                    <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">Consulta rápida para consultores e registro de envios</p>
                </div>

                {/* CAMPO DE CONSULTA DO CONSULTOR */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="🔍 Consultar OS, Cidade ou Técnico..."
                        value={buscaGeral}
                        onChange={(e) => setBuscaGeral(e.target.value)}
                        className="bg-[#030712] border border-cyan-500/40 rounded-2xl px-4 py-3 text-xs text-cyan-300 w-full md:w-72 outline-none focus:border-cyan-400 shadow-inner"
                    />
                    <div className="flex gap-2">
                        <button onClick={() => setModalTecnico(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg whitespace-nowrap">
                            + Técnico
                        </button>
                        <button onClick={() => setModalTransportadora(true)} className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-3 rounded-2xl font-black text-xs transition-all shadow-lg whitespace-nowrap">
                            + Transp.
                        </button>
                    </div>
                </div>
            </div>

            {/* TABELA DE EXPEDIÇÃO */}
            <div className="bg-[#0b192c] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300 whitespace-nowrap">
                        <thead className="bg-[#07101d] text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="px-5 py-4 font-black">Ordem de Serviço</th>
                                <th className="px-5 py-4 font-black">Cidade</th>
                                <th className="px-5 py-4 font-black">Técnico Responsável</th>
                                <th className="px-5 py-4 font-black">Data de Saída</th>
                                <th className="px-5 py-4 font-black">Transportadora</th>
                                <th className="px-5 py-4 font-black">Status Consumo</th>
                                <th className="px-5 py-4 font-black">Envio A... (Destinatário)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {listaFiltrada.map((os) => (
                                <tr key={os.numeroOs} className="hover:bg-[#132238]/60 transition-colors">
                                    <td className="px-5 py-4 font-bold text-white">
                                        <span className="text-emerald-400 font-black">{os.numeroOs}</span>
                                    </td>
                                    
                                    <td className="px-5 py-4 text-slate-400 uppercase text-xs">{os.cidade}</td>
                                    
                                    {/* Técnico com Lista Dinâmica Pesquisável */}
                                    <td className="px-5 py-4">
                                        <input 
                                            type="text" 
                                            list="tecnicos-list"
                                            defaultValue={os.tecnico || 'EDUARDO'}
                                            onBlur={(e) => salvarCampoExpedicao(os.numeroOs, 'tecnico', e.target.value)}
                                            className="bg-[#030712] border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-bold w-48 outline-none focus:border-cyan-400 shadow-inner"
                                            placeholder="Digite ou selecione..."
                                        />
                                        <datalist id="tecnicos-list">
                                            {tecnicos.map((tec, idx) => <option key={idx} value={tec} />)}
                                        </datalist>
                                    </td>

                                    {/* Data de Saída Manual */}
                                    <td className="px-5 py-4">
                                        <input 
                                            type="date" 
                                            defaultValue={os.dataSaida || '2026-07-08'}
                                            onChange={(e) => salvarCampoExpedicao(os.numeroOs, 'dataSaida', e.target.value)}
                                            className="bg-[#030712] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 w-36 outline-none focus:border-cyan-400 shadow-inner cursor-pointer"
                                        />
                                    </td>

                                    {/* Transportadora com Lista Dinâmica */}
                                    <td className="px-5 py-4">
                                        <input 
                                            type="text" 
                                            list="transp-list"
                                            defaultValue={os.transportadora || 'RETIRADA BALCÃO'}
                                            onBlur={(e) => salvarCampoExpedicao(os.numeroOs, 'transportadora', e.target.value)}
                                            className="bg-[#030712] border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold w-48 outline-none focus:border-cyan-400 shadow-inner"
                                            placeholder="Digite ou selecione..."
                                        />
                                        <datalist id="transp-list">
                                            {transportadoras.map((transp, idx) => <option key={idx} value={transp} />)}
                                        </datalist>
                                    </td>

                                    {/* Status de Consumo */}
                                    <td className="px-5 py-4">
                                        <select 
                                            defaultValue={os.consumido || 'NAO_CONSUMIDO'}
                                            onChange={(e) => salvarCampoExpedicao(os.numeroOs, 'consumido', e.target.value)}
                                            className="bg-[#030712] border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-black uppercase outline-none focus:border-cyan-400 shadow-inner">
                                            <option value="CONSUMIDO">✔ CONSUMIDO</option>
                                            <option value="NAO_CONSUMIDO">⏳ NÃO CONSUMIDO</option>
                                        </select>
                                    </td>

                                    {/* Envio A... */}
                                    <td className="px-5 py-4">
                                        <input 
                                            type="text" 
                                            defaultValue={os.envioA || 'ENTREGUE A EDUARDO'}
                                            onBlur={(e) => salvarCampoExpedicao(os.numeroOs, 'envioA', e.target.value)}
                                            className="bg-[#030712] border border-slate-700 rounded-xl px-3 py-2 text-xs text-fuchsia-300 font-bold w-48 outline-none focus:border-cyan-400 shadow-inner"
                                            placeholder="Quem levou..."
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL CADASTRAR TÉCNICO */}
            {modalTecnico && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-[#0b192c] p-8 rounded-3xl border border-cyan-500/40 shadow-2xl w-[450px]">
                        <h3 className="text-xl font-black text-white mb-2 uppercase">Cadastrar Novo Técnico</h3>
                        <p className="text-slate-400 text-xs mb-6">Insira o nome do técnico para habilitar na lista.</p>
                        <input 
                            type="text" 
                            placeholder="Ex: CARLOS - CASTANHAL"
                            value={novoTecnico}
                            onChange={(e) => setNovoTecnico(e.target.value)}
                            className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-3 text-sm text-cyan-300 font-bold outline-none focus:border-cyan-400 mb-6 shadow-inner uppercase"
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModalTecnico(false)} className="px-5 py-2.5 text-slate-400 font-bold text-xs">Cancelar</button>
                            <button onClick={cadastrarTecnico} className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-xs shadow-lg">Salvar Técnico</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CADASTRAR TRANSPORTADORA */}
            {modalTransportadora && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-[#0b192c] p-8 rounded-3xl border border-amber-500/40 shadow-2xl w-[450px]">
                        <h3 className="text-xl font-black text-white mb-2 uppercase">Cadastrar Transportadora</h3>
                        <p className="text-slate-400 text-xs mb-6">Insira o nome da transportadora.</p>
                        <input 
                            type="text" 
                            placeholder="Ex: TRANSNET"
                            value={novaTransportadora}
                            onChange={(e) => setNovaTransportadora(e.target.value)}
                            className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-3 text-sm text-amber-300 font-bold outline-none focus:border-amber-400 mb-6 shadow-inner uppercase"
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setModalTransportadora(false)} className="px-5 py-2.5 text-slate-400 font-bold text-xs">Cancelar</button>
                            <button onClick={cadastrarTransportadora} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs shadow-lg">Salvar Transportadora</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}