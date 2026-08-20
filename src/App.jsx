import { useState } from 'react';
import PlanilhaGeral from './pages/PlanilhaGeral';
import FilaTriagem from './pages/FilaTriagem';
import PainelExecucao from './pages/PainelExecucao';
import ExecucaoRegistro from './pages/ExecucaoRegistro';
import DashboardRegistro from './pages/DashboardRegistro';
import AguardandoChegada from './pages/AguardandoChegada';
import DashboardMensal from './pages/DashboardMensal';
import logoEstrela from './assets/logo-estrela.png';
import logoMidea from './assets/logo-midea.png';
import api from './services/api';

export default function App() {
  const [modalAberto, setModalAberto] = useState(false);
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [menuExpandido, setMenuExpandido] = useState(true);
  const [paginaAtiva, setPaginaAtiva] = useState('geral');
  
  // ESTADOS DO RANKING DINÂMICO
  const [modalRanking, setModalRanking] = useState(false);
  const [ranking, setRanking] = useState({
      posicao: '6ª',
      alertaTexto: 'ALERTA NACIONAL',
      
      // Cores separadas para manter o fundo "vidro" e mudar só o destaque
      corPilula: 'from-rose-600 to-rose-500', 
      corBorda: 'border-rose-500/40',
      corTexto: 'text-rose-200',
      corDestaque: 'border-rose-400',
      sombraCor: 'rgba(225,29,72,0.5)',
      
      mensagem: 'COLOCAÇÃO NO RANKING DE MAIOR VOLUME DE PENDÊNCIAS ACIMA DE 10 DIAS (BRASIL)',
      meta: 'ZERAR E SAIR DO RANKING (< 50 PENDÊNCIAS)'
  });

  const [rankingTemp, setRankingTemp] = useState({...ranking});

  const handleSalvarRanking = () => {
      setRanking(rankingTemp);
      setModalRanking(false);
  };

  const handleUpload = async (tipo) => {
      if (!arquivo) { alert("Selecione o arquivo Excel primeiro."); return; }
      const formData = new FormData();
      formData.append("file", arquivo);
      setEnviando(true);
      let endpoint = '';
      if (tipo === 'diario') endpoint = '/upload-diario';
      else if (tipo === 'midea') endpoint = '/upload-historico';
      else if (tipo === 'separacao') endpoint = '/upload-historico-separacao';

      try {
          await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
          alert('Upload concluído com sucesso!');
          setModalAberto(false); setArquivo(null); window.location.reload(); 
      } catch (error) {
          console.error(error); alert("Erro ao processar a planilha.");
      } finally { setEnviando(false); }
  };

  const handleLimparBanco = async () => {
      if (window.confirm("🚨 MODO DESENVOLVEDOR: Apagar tudo?")) {
          try {
              await api.delete('/limpar-banco'); alert("Banco zerado!"); window.location.reload(); 
          } catch (error) { console.error(error); }
      }
  };

  return (
    <div className="flex h-screen bg-[#040811] text-slate-100 font-sans overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-950/20 via-[#040811] to-[#040811]">
      
      <aside className={`${menuExpandido ? 'w-80' : 'w-24'} bg-[#070d1a]/80 backdrop-blur-2xl border-r border-cyan-900/30 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20 shrink-0 transition-all duration-300`}>
         <div className="p-6 border-b border-cyan-900/30 flex items-center justify-between">
            {menuExpandido && <span className="text-sm font-black text-cyan-500 uppercase tracking-[0.2em] ml-2">Navegação</span>}
            
            {/* ÍCONE DE MENU CLÁSSICO (3 TRAÇOS) COM DESIGN MODERNO */}
            <button onClick={() => setMenuExpandido(!menuExpandido)} className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-105 transition-all flex flex-col gap-1.5 w-12 h-12 items-center justify-center mx-auto border border-white/20">
                <span className="w-6 h-1 rounded-full bg-white opacity-90"></span>
                <span className="w-6 h-1 rounded-full bg-white opacity-90"></span>
                <span className="w-6 h-1 rounded-full bg-white opacity-90"></span>
            </button>
         </div>

         <nav className="flex-1 p-5 space-y-3 overflow-y-auto">
            <button onClick={() => setPaginaAtiva('geral')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold border transition-all ${paginaAtiva === 'geral' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 border-transparent hover:bg-white/5'}`}>
                <span className="text-xl">📑</span> {menuExpandido && <span className="text-sm">Planilha Mestra (Geral)</span>}
            </button>
            <button onClick={() => setPaginaAtiva('triagem')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold border transition-all ${paginaAtiva === 'triagem' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 border-transparent hover:bg-white/5'}`}>
                <span className="text-xl">📋</span> {menuExpandido && <span className="text-sm">Fila de Triagem</span>}
            </button>
            <button onClick={() => setPaginaAtiva('execucao')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold border transition-all ${paginaAtiva === 'execucao' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 border-transparent hover:bg-white/5'}`}>
                <span className="text-xl">⚡</span> {menuExpandido && <span className="text-sm">Painel de Execução</span>}
            </button>
            <button onClick={() => setPaginaAtiva('exec-registro')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold border transition-all ${paginaAtiva === 'exec-registro' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 border-transparent hover:bg-white/5'}`}>
                <span className="text-xl">✍️</span> {menuExpandido && <span className="text-sm">Execução de Registro</span>}
            </button>
            <button onClick={() => setPaginaAtiva('dash-registro')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold border transition-all ${paginaAtiva === 'dash-registro' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 border-transparent hover:bg-white/5'}`}>
                <span className="text-xl">📈</span> {menuExpandido && <span className="text-sm">Dashboard de Registro</span>}
            </button>
            <button onClick={() => setPaginaAtiva('chegada')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold border transition-all ${paginaAtiva === 'chegada' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 border-transparent hover:bg-white/5'}`}>
                <span className="text-xl">📦</span> {menuExpandido && <span className="text-sm">Aguardando Chegada</span>}
            </button>
            <button onClick={() => setPaginaAtiva('mensal')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold border transition-all ${paginaAtiva === 'mensal' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-400 border-transparent hover:bg-white/5'}`}>
                <span className="text-xl">📊</span> {menuExpandido && <span className="text-sm">Dashboard Mensal</span>}
            </button>
         </nav>
         
         <div className="p-5 border-t border-cyan-900/30 flex flex-col items-center justify-center space-y-4 bg-[#040811]/50 pb-8">
            <button onClick={() => setModalAberto(true)} className="w-full flex items-center justify-center gap-2 px-3 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                📥 {menuExpandido && 'Atualizar Base'}
            </button>
            <button onClick={handleLimparBanco} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-xl font-black uppercase tracking-wider transition-colors text-xs mb-4">
                🗑️ {menuExpandido && 'Zerar Banco'}
            </button>
            
            {/* ASSINATURA DO DESENVOLVEDOR */}
            {menuExpandido && (
                <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-4 opacity-50 hover:opacity-100 transition-opacity text-center">
                    Desenvolvido por <span className="text-cyan-500 block text-xs mt-1">Carlos Eduardo</span>
                    <span className="text-cyan-500 block text-xs mt-1">Engenheiro de Computação</span>
                </div>
            )}
         </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
         {/* HEADER COM LOGO ESTRELA GIGANTE */}
         <header className="h-36 bg-white/[0.02] backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-16 shrink-0 shadow-lg relative z-10">
            {/* A logo Estrela muito maior agora */}
            <img src={logoEstrela} alt="Estrela Assistência Técnica" className="h-[120px] object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] mt-2" />
            
            <div className="text-center flex flex-col">
                <h1 className="text-4xl font-black text-white uppercase tracking-[0.2em] drop-shadow-lg">
                CENTRAL LOGÍSTICA
                </h1>
                <span className="text-base text-cyan-400 font-bold tracking-[0.4em] mt-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">PAINEL DE OPERAÇÕES</span>
            </div>
            <img src={logoMidea} alt="Midea" className="h-16 object-contain filter drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]" />
         </header>

         {/* BANNER DE RANKING DINÂMICO E INTELIGENTE */}
         <div 
            onClick={() => setModalRanking(true)}
            // Fundo de vidro padrão, mudando apenas a borda inferior para a cor de destaque
            className={`bg-[#0b1221]/80 backdrop-blur-xl border-b-[3px] ${ranking.corBorda} px-10 py-5 flex items-center justify-between shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative z-10 cursor-pointer hover:bg-[#0f172a]/90 transition-colors group`}
            title="Clique para editar as informações do banner"
        >
            <div className="flex items-center gap-5">
               {/* A pílula muda de cor totalmente */}
               <span className={`bg-gradient-to-r ${ranking.corPilula} text-white font-black text-xs px-5 py-2.5 rounded-lg shadow-[0_0_15px_${ranking.sombraCor}] uppercase tracking-widest animate-pulse`}>
                   {ranking.alertaTexto}
               </span>
               <div className={`text-sm font-bold ${ranking.corTexto} uppercase tracking-widest flex items-center gap-3`}>
                  <span className={`border-b-2 border-dashed ${ranking.corDestaque} group-hover:text-white transition-colors font-black text-base`}>
                      {ranking.posicao}
                  </span>
                  {ranking.mensagem}
               </div>
            </div>
            <div className={`text-xs font-black uppercase tracking-widest bg-black/40 px-6 py-3 rounded-xl border ${ranking.corBorda} shadow-inner flex items-center gap-3 ${ranking.corTexto}`}>
               <span className="text-lg">🎯</span> META: {ranking.meta}
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-10 relative z-0">
            <div className="max-w-[1700px] mx-auto">
                {paginaAtiva === 'geral' && <PlanilhaGeral />}
                {paginaAtiva === 'triagem' && <FilaTriagem />}
                {paginaAtiva === 'execucao' && <PainelExecucao />}
                {paginaAtiva === 'exec-registro' && <ExecucaoRegistro />}
                {paginaAtiva === 'dash-registro' && <DashboardRegistro />}
                {paginaAtiva === 'chegada' && <AguardandoChegada />}
                {paginaAtiva === 'mensal' && <DashboardMensal />}
            </div>
         </div>
      </main>

      {/* MODAL DE EDIÇÃO DO RANKING (ATUALIZADO) */}
      {modalRanking && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-[#0b192c] p-8 rounded-3xl border border-cyan-500/40 shadow-2xl w-[600px]">
                  <h3 className="text-xl font-black text-white mb-6 uppercase">Editar Banner de Notificação</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Posição no Ranking</label>
                          <input type="text" value={rankingTemp.posicao} onChange={(e) => setRankingTemp({...rankingTemp, posicao: e.target.value})} className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-cyan-400 shadow-inner uppercase" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Texto da Pílula</label>
                              <input type="text" value={rankingTemp.alertaTexto} onChange={(e) => setRankingTemp({...rankingTemp, alertaTexto: e.target.value})} className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-cyan-400 shadow-inner uppercase" />
                          </div>
                          <div>
                              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Cor do Tema</label>
                              <select value={rankingTemp.corPilula} onChange={(e) => {
                                  const cor = e.target.value;
                                  let novaConfig = { corPilula: cor };
                                  
                                  if (cor.includes('rose')) {
                                      novaConfig = { ...novaConfig, corBorda: 'border-rose-500/50', corTexto: 'text-rose-200', corDestaque: 'border-rose-400', sombraCor: 'rgba(225,29,72,0.5)' };
                                  } else if (cor.includes('amber')) {
                                      novaConfig = { ...novaConfig, corBorda: 'border-amber-500/50', corTexto: 'text-amber-200', corDestaque: 'border-amber-400', sombraCor: 'rgba(245,158,11,0.5)' };
                                  } else if (cor.includes('emerald')) {
                                      novaConfig = { ...novaConfig, corBorda: 'border-emerald-500/50', corTexto: 'text-emerald-200', corDestaque: 'border-emerald-400', sombraCor: 'rgba(16,185,129,0.5)' };
                                  } else if (cor.includes('cyan')) {
                                      novaConfig = { ...novaConfig, corBorda: 'border-cyan-500/50', corTexto: 'text-cyan-200', corDestaque: 'border-cyan-400', sombraCor: 'rgba(6,182,212,0.5)' };
                                  }
                                  
                                  setRankingTemp({...rankingTemp, ...novaConfig});
                              }} className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-cyan-400 shadow-inner uppercase cursor-pointer">
                                  <option value="from-rose-600 to-rose-500">🔴 Vermelho (Crítico)</option>
                                  <option value="from-amber-500 to-orange-500">🟡 Amarelo (Atenção)</option>
                                  <option value="from-emerald-500 to-teal-500">🟢 Verde (Estável)</option>
                                  <option value="from-cyan-500 to-blue-600">🔵 Azul (Informativo)</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Mensagem Principal</label>
                          <textarea value={rankingTemp.mensagem} onChange={(e) => setRankingTemp({...rankingTemp, mensagem: e.target.value})} className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-cyan-400 shadow-inner uppercase resize-none h-24" />
                      </div>

                      <div>
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Texto da Meta</label>
                          <input type="text" value={rankingTemp.meta} onChange={(e) => setRankingTemp({...rankingTemp, meta: e.target.value})} className="w-full bg-[#030712] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-cyan-400 shadow-inner uppercase" />
                      </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                      <button onClick={() => setModalRanking(false)} className="px-5 py-2.5 text-slate-400 font-bold text-xs">Cancelar</button>
                      <button onClick={handleSalvarRanking} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-xs shadow-lg uppercase tracking-wider">Salvar Alterações</button>
                  </div>
              </div>
          </div>
      )}

      {/* Modal Upload mantido */}
      {modalAberto && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl w-[600px]">
                  <div className="flex justify-between items-start mb-2"><h2 className="text-2xl font-black text-white uppercase">Upload de Planilhas</h2><button onClick={() => { setModalAberto(false); setArquivo(null); }} className="text-slate-500 hover:text-white font-bold text-xl">✕</button></div>
                  <input type="file" accept=".xlsx, .xls" onChange={(e) => setArquivo(e.target.files[0])} className="mb-6 block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:bg-cyan-600 file:text-white cursor-pointer" />
                  <div className="grid grid-cols-1 gap-3">
                      <button onClick={() => handleUpload('diario')} disabled={enviando || !arquivo} className="w-full px-6 py-4 rounded-2xl font-black text-sm bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all uppercase tracking-widest">Atualização Diária (iService)</button>
                      <button onClick={() => handleUpload('midea')} disabled={enviando || !arquivo} className="w-full px-6 py-4 rounded-2xl font-black text-sm bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all uppercase tracking-widest">Carga Histórica: Peça Midea</button>
                      <button onClick={() => handleUpload('separacao')} disabled={enviando || !arquivo} className="w-full px-6 py-4 rounded-2xl font-black text-sm bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-all uppercase tracking-widest">Carga Histórica: Separação</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}