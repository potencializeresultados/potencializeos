
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_DEALS, MOCK_PRODUCTS, MOCK_ACTIVITIES, MOCK_USERS } from '../constants';
import { 
  ArrowLeft, 
  User, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  FileText,
  Rocket,
  AlertTriangle,
  X,
  Check,
  ChevronRight,
  Loader2,
  Send,
  Edit2,
  Plus,
  Trash2,
  Save,
  Search,
  Sparkles,
  ExternalLink,
  Zap
} from 'lucide-react';
import { Deal, ActivityType, Activity, UserRole } from '../types';
import { generateProposalContent, researchCompany } from '../services/ai';

const STAGES = ['Lead', 'Contato', 'Proposta', 'Negociação', 'Ganho'];
const ACTIVITY_TYPES: ActivityType[] = ['Prospecção Novo Lead', 'Follow Up', 'Ligação', 'Reunião externa', 'Visita'];

const DealDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Local state to manage the deal data
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  
  // Modals State
  const [activeModal, setActiveModal] = useState<'note' | 'activity' | 'proposal' | 'research' | null>(null);
  const [noteText, setNoteText] = useState('');
  
  // Proposal State
  const [proposalContent, setProposalContent] = useState('');
  
  // Research State
  const [researchData, setResearchData] = useState<{ text: string, sources: any[] } | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  
  // Activity Form State
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: 'Ligação',
    date: '',
    durationMinutes: 30,
    title: ''
  });

  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  // Editing State
  const [isEditingProducts, setIsEditingProducts] = useState(false);
  const [editValue, setEditValue] = useState<number>(0);
  const [editTitle, setEditTitle] = useState('');
  const [editProductList, setEditProductList] = useState<string[]>([]);
  const [selectedAddProduct, setSelectedAddProduct] = useState('');

  useEffect(() => {
    const foundDeal = MOCK_DEALS.find(d => d.id === Number(id));
    if (foundDeal) {
      setDeal({ ...foundDeal });
      setEditValue(foundDeal.value);
      setEditTitle(foundDeal.title);
      setEditProductList([foundDeal.productInterest, ...(foundDeal.additionalProducts || [])]);
      
      const logs = [
        { type: 'log', text: 'Deal movido para "Ganho"', date: 'Hoje, 10:30', user: 'Roberta Ops', hidden: foundDeal.stage !== 'Ganho' },
        { type: 'note', text: 'Cliente solicitou prazo estendido para pagamento do setup.', date: 'Ontem, 16:45', user: 'João Consultor' },
        { type: 'email', text: 'Proposta enviada (v2.pdf)', date: '15/11/2023', user: 'João Consultor' },
        { type: 'call', text: 'Reunião de Diagnóstico realizada via Meet.', date: '10/11/2023', user: 'João Consultor' },
        { type: 'log', text: 'Deal criado', date: '01/11/2023', user: 'Sistema' },
      ].filter(a => !a.hidden);

      const structuredActs = MOCK_ACTIVITIES
        .filter(a => a.dealId === foundDeal.id)
        .map(a => ({
           type: a.type === 'Ligação' ? 'call' : 'activity',
           text: `${a.type}: ${a.title} - ${new Date(a.date).toLocaleString('pt-BR')}`,
           date: 'Agendado',
           user: 'Você'
        }));

      setActivities([...structuredActs, ...logs]);
    }
  }, [id]);

  // Find Associated Product details (Primary)
  const product = MOCK_PRODUCTS.find(p => p.title === deal?.productInterest);

  if (!deal) {
    return <div className="p-6 text-center text-gray-500">Negócio não encontrado.</div>;
  }

  // --- ACTIONS HANDLERS ---

  const handleMarkWon = () => {
    const updatedDeal = { ...deal, stage: 'Ganho' as any };
    setDeal(updatedDeal);
    const mockIndex = MOCK_DEALS.findIndex(d => d.id === deal.id);
    if (mockIndex >= 0) MOCK_DEALS[mockIndex].stage = 'Ganho';
    
    addActivity('log', 'Deal marcado como GANHO!', 'Sistema');

    // --- AUTOMATION: POTENCIALIZE CLUB ---
    if (deal.productInterest === 'Potencialize Club') {
       setTimeout(() => {
          addActivity('log', '⚡ Automação de Produto "Club" iniciada...', 'Sistema');
          
          // 1. Find User to Upgrade
          const relatedUser = MOCK_USERS.find(u => u.companyName === deal.company || u.companyName === 'Membro Club'); // Fallback for mock
          
          if (relatedUser) {
             relatedUser.role = UserRole.CLUB_MEMBER;
             addActivity('log', `✅ Permissão do usuário "${relatedUser.name}" alterada para MEMBRO CLUB.`, 'Sistema');
          } else {
             addActivity('log', '⚠️ Usuário vinculado não encontrado para upgrade de permissão.', 'Sistema');
          }

          // 2. Trigger Email Sequence
          addActivity('email', '📧 Sequência de Boas-vindas Club disparada (E-mail 1 de 5 enviado).', 'Automação de Marketing');

       }, 800);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    addActivity('note', noteText, 'Carlos CEO');
    setNoteText('');
    setActiveModal(null);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const activity: Activity = {
      id: Math.random(),
      type: newActivity.type as ActivityType,
      title: newActivity.title || 'Nova Atividade',
      date: newActivity.date || new Date().toISOString(),
      durationMinutes: newActivity.durationMinutes || 30,
      userId: 1, 
      status: 'pending',
      dealId: deal.id,
      dealTitle: deal.title
    };
    MOCK_ACTIVITIES.push(activity);
    const formattedDate = new Date(newActivity.date!).toLocaleString('pt-BR');
    addActivity('activity', `${newActivity.type}: ${newActivity.title} (${formattedDate})`, 'Carlos CEO');
    setNewActivity({ type: 'Ligação', date: '', durationMinutes: 30, title: '' });
    setActiveModal(null);
  };

  // --- RESEARCH HANDLER ---
  const handleResearchCompany = async () => {
     setActiveModal('research');
     if (!researchData) {
        setIsResearching(true);
        const data = await researchCompany(deal.company);
        if (data) {
           setResearchData(data);
        }
        setIsResearching(false);
     }
  };

  // --- PRODUCT EDITING HANDLERS ---

  const handleAddProductToDeal = () => {
     if (!selectedAddProduct) return;
     if (editProductList.includes(selectedAddProduct)) return;

     const productData = MOCK_PRODUCTS.find(p => p.title === selectedAddProduct);
     if (productData) {
        setEditValue(prev => prev + productData.price);
     }
     
     setEditProductList([...editProductList, selectedAddProduct]);
     setSelectedAddProduct('');
  };

  const handleRemoveProductFromDeal = (prodName: string) => {
     const productData = MOCK_PRODUCTS.find(p => p.title === prodName);
     if (productData) {
        setEditValue(prev => Math.max(0, prev - productData.price));
     }
     setEditProductList(editProductList.filter(p => p !== prodName));
  };

  const handleSaveProducts = () => {
     if (editProductList.length === 0) {
        alert("O negócio precisa ter pelo menos um produto.");
        return;
     }

     const primaryProduct = editProductList[0];
     const additional = editProductList.slice(1);

     const updatedDeal = {
        ...deal,
        title: editTitle,
        value: editValue,
        productInterest: primaryProduct,
        additionalProducts: additional
     };

     setDeal(updatedDeal);
     
     // Update Persistence
     const mockIndex = MOCK_DEALS.findIndex(d => d.id === deal.id);
     if (mockIndex >= 0) {
        MOCK_DEALS[mockIndex] = updatedDeal;
     }

     setIsEditingProducts(false);
     addActivity('log', 'Negócio atualizado (Título, Valor e Produtos).', 'Você');
  };


  // --- PROPOSAL LOGIC ---
  const handleOpenProposalModal = async () => {
    setActiveModal('proposal');
    setIsGeneratingProposal(true);
    
    // Call AI to generate content
    const primaryProd = MOCK_PRODUCTS.find(p => p.title === deal.productInterest);
    const scope = primaryProd ? primaryProd.description : 'Escopo a definir';
    const allProducts = [deal.productInterest, ...(deal.additionalProducts || [])];
    
    const content = await generateProposalContent({
       client: deal.company,
       products: allProducts,
       value: deal.value,
       scope: scope
    });

    setProposalContent(content);
    setIsGeneratingProposal(false);
  };

  const handleSendProposal = () => {
    setIsGeneratingProposal(true);
    setActiveModal(null);
    
    setTimeout(() => {
      // Add detailed log
      addActivity('email', `Proposta gerada e enviada.\nResumo: ${deal.productInterest} (+${(deal.additionalProducts || []).length}) - R$ ${deal.value}`, 'Sistema');
      setIsGeneratingProposal(false);
      
      // Update stage if current stage is before 'Proposta'
      if (STAGES.indexOf(deal.stage) < STAGES.indexOf('Proposta')) {
         setDeal({ ...deal, stage: 'Proposta' });
         // Update Mock persistence
         const mockIndex = MOCK_DEALS.findIndex(d => d.id === deal.id);
         if (mockIndex >= 0) MOCK_DEALS[mockIndex].stage = 'Proposta';
      }
      
      alert("Proposta enviada com sucesso!");
    }, 1000);
  };

  const addActivity = (type: string, text: string, user: string) => {
    const newActivity = {
      type,
      text,
      user,
      date: 'Agora mesmo'
    };
    setActivities([newActivity, ...activities]);
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'Ganho': return 'bg-pot-success text-white';
      case 'Perdido': return 'bg-pot-error text-white';
      default: return 'bg-pot-orange text-white';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header Navigation */}
      <button 
        onClick={() => navigate('/crm')} 
        className="flex items-center text-gray-500 hover:text-pot-petrol transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" />
        Voltar para Pipeline
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-8 border-pot-petrol flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
           <div className="flex items-center gap-3 mb-2">
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStageBadge(deal.stage)}`}>
               {deal.stage}
             </span>
             <span className="text-gray-400 text-sm">#{deal.id}</span>
           </div>
           <div className="flex items-center gap-3 w-full">
             {isEditingProducts ? (
               <input 
                 type="text" 
                 className="text-3xl font-bold text-pot-petrol border-b-2 border-dashed border-gray-300 focus:border-pot-orange outline-none w-full bg-transparent px-1"
                 value={editTitle}
                 onChange={(e) => setEditTitle(e.target.value)}
                 placeholder="Título do Negócio"
               />
             ) : (
               <h1 className="text-3xl font-bold text-pot-petrol">{deal.title}</h1>
             )}
           </div>
           <div className="flex items-center gap-2 mt-1">
             <p className="text-gray-500 font-medium">{deal.company}</p>
             <button 
                onClick={handleResearchCompany}
                className="flex items-center text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors"
                title="Pesquisar dados da empresa com IA"
             >
                <Search size={12} className="mr-1" /> Pesquisar (IA)
             </button>
           </div>
        </div>
        
        <div className="text-right">
           <div className="flex items-center justify-end gap-2 mb-1">
             <p className="text-sm text-gray-500 uppercase">Valor Estimado</p>
             {!isEditingProducts && (
               <button onClick={() => setIsEditingProducts(true)} className="text-gray-400 hover:text-pot-orange p-1 rounded-full hover:bg-gray-100 transition-colors" title="Editar Negócio">
                 <Edit2 size={14} />
               </button>
             )}
           </div>
           
           {isEditingProducts ? (
              <div className="flex items-center justify-end gap-2">
                 <span className="text-gray-400 text-sm">R$</span>
                 <input 
                   type="number" 
                   className="text-2xl font-bold text-pot-success border-b border-gray-300 focus:border-pot-orange outline-none w-32 text-right"
                   value={editValue}
                   onChange={(e) => setEditValue(Number(e.target.value))}
                 />
              </div>
           ) : (
             <div className="flex items-center gap-2 justify-end">
                <p className="text-3xl font-bold text-pot-success">
                  {deal.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
             </div>
           )}
        </div>
      </div>

      {/* PIPELINE STEPPER */}
      <div className="bg-white rounded-xl shadow-sm p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {STAGES.map((stage, index) => {
            const currentStageIndex = STAGES.indexOf(deal.stage === 'Perdido' ? 'Lead' : deal.stage);
            const isCompleted = index < currentStageIndex || deal.stage === 'Ganho';
            const isActive = stage === deal.stage;
            
            let colorClass = 'bg-gray-200 text-gray-400';
            if (isActive) colorClass = 'bg-pot-orange text-white ring-4 ring-orange-100';
            if (isCompleted) colorClass = 'bg-pot-success text-white';
            if (isActive && deal.stage === 'Ganho') colorClass = 'bg-pot-success text-white ring-4 ring-green-100';

            return (
              <React.Fragment key={stage}>
                <div className="flex flex-col items-center relative z-10 group cursor-default">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${colorClass}`}>
                      {isCompleted || (isActive && deal.stage === 'Ganho') ? <Check size={14} /> : index + 1}
                   </div>
                   <span className={`text-xs mt-2 font-medium ${isActive ? 'text-pot-petrol font-bold' : 'text-gray-500'}`}>
                     {stage}
                   </span>
                </div>
                {index < STAGES.length - 1 && (
                  <div className="flex-1 h-1 mx-2 bg-gray-200 rounded relative -top-3">
                    <div 
                      className={`h-full rounded transition-all duration-500 ${isCompleted ? 'bg-pot-success' : 'w-0'}`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Context & Timeline */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Actions Bar */}
           <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setActiveModal('note')}
                className="flex items-center px-4 py-2 bg-pot-petrol text-white rounded hover:bg-gray-700 text-sm font-medium transition-colors"
              >
                <MessageSquare size={16} className="mr-2" /> Nova Nota
              </button>
              
              <button 
                onClick={() => setActiveModal('activity')}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                <Calendar size={16} className="mr-2" /> Nova Atividade
              </button>
              
              <button 
                onClick={handleOpenProposalModal}
                disabled={isGeneratingProposal}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-70 group"
              >
                 <Sparkles size={16} className="mr-2 text-pot-orange group-hover:animate-pulse" /> 
                 Gerar Proposta (IA)
              </button>
              
              <div className="flex-1"></div>
              
              {deal.stage !== 'Ganho' && (
                <button 
                  onClick={handleMarkWon}
                  className="flex items-center px-4 py-2 bg-pot-success text-white rounded hover:bg-green-700 text-sm font-medium shadow-sm transition-colors"
                >
                  <CheckCircle size={16} className="mr-2" /> Marcar como Ganho
                </button>
              )}
           </div>

           {/* Timeline */}
           <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-pot-petrol mb-6">Linha do Tempo</h3>
              <div className="space-y-6">
                 {activities.map((act, idx) => (
                   <div key={idx} className="flex gap-4 animate-fade-in-up">
                      <div className="flex flex-col items-center">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                            act.type === 'log' ? 'bg-gray-300' : 
                            act.type === 'note' ? 'bg-pot-orange' : 
                            act.type === 'email' ? 'bg-blue-400' : 
                            act.type === 'activity' ? 'bg-pot-petrol' : 'bg-pot-magenta'
                         }`}>
                            {act.type === 'log' && <Clock size={14} />}
                            {act.type === 'note' && <FileText size={14} />}
                            {act.type === 'email' && <Mail size={14} />}
                            {act.type === 'call' && <Phone size={14} />}
                            {act.type === 'activity' && <Calendar size={14} />}
                         </div>
                         {idx !== activities.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-2"></div>}
                      </div>
                      <div className="flex-1 pb-2">
                         <div className="flex justify-between items-start">
                            <p className="font-semibold text-gray-800 text-sm">{act.user}</p>
                            <span className="text-xs text-gray-400">{act.date}</span>
                         </div>
                         <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-3 rounded border border-gray-100 whitespace-pre-line">
                           {act.text}
                         </p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Column: Details Sidebar */}
        <div className="space-y-6">
           {/* Product Info Card */}
           <div className={`bg-white rounded-xl shadow-md overflow-hidden border ${isEditingProducts ? 'border-pot-orange ring-2 ring-orange-100' : 'border-transparent'}`}>
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                 <h3 className="font-bold text-gray-700 text-sm">Escopo e Produtos</h3>
                 {!isEditingProducts ? (
                    <button 
                       onClick={() => setIsEditingProducts(true)} 
                       className="text-gray-400 hover:text-pot-orange transition-colors"
                       title="Editar Produtos e Valor"
                    >
                       <Edit2 size={16} />
                    </button>
                 ) : (
                    <button 
                       onClick={handleSaveProducts} 
                       className="text-pot-success hover:text-green-700 transition-colors flex items-center text-xs font-bold"
                    >
                       <Save size={16} className="mr-1" /> Salvar
                    </button>
                 )}
              </div>
              
              <div className="p-4">
                 {isEditingProducts ? (
                    <div className="space-y-4">
                       <div>
                          <label className="text-xs font-bold text-pot-orange uppercase mb-2 block">Produto Principal</label>
                          {editProductList.length > 0 ? (
                             <div className="flex items-center justify-between bg-orange-50 p-2 rounded border border-orange-200 mb-2">
                                <span className="text-sm font-bold text-pot-petrol truncate">{editProductList[0]}</span>
                                <button 
                                   onClick={() => handleRemoveProductFromDeal(editProductList[0])}
                                   className="text-red-400 hover:text-red-600 bg-white rounded-full p-1 shadow-sm"
                                   title="Remover (O próximo da lista se tornará o principal)"
                                >
                                   <Trash2 size={14} />
                                </button>
                             </div>
                          ) : (
                             <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100 mb-2">
                                Selecione um produto abaixo para ser o principal.
                             </div>
                          )}
                          
                          {editProductList.length > 1 && (
                             <>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block mt-4">Adicionais</label>
                                <div className="space-y-2">
                                   {editProductList.slice(1).map((pName, idx) => (
                                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                         <span className="text-sm text-gray-700 truncate">{pName}</span>
                                         <button 
                                            onClick={() => handleRemoveProductFromDeal(pName)}
                                            className="text-red-400 hover:text-red-600"
                                         >
                                            <Trash2 size={14} />
                                         </button>
                                      </div>
                                   ))}
                                </div>
                             </>
                          )}
                       </div>
                       
                       <div className="pt-2 border-t border-gray-100 mt-2">
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Adicionar Produto</label>
                          <div className="flex gap-2">
                             <select 
                                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 outline-none"
                                value={selectedAddProduct}
                                onChange={(e) => setSelectedAddProduct(e.target.value)}
                             >
                                <option value="">-- Selecione --</option>
                                {MOCK_PRODUCTS.map(p => (
                                   <option key={p.id} value={p.title}>{p.title} - R$ {p.price}</option>
                                ))}
                             </select>
                             <button 
                                onClick={handleAddProductToDeal}
                                disabled={!selectedAddProduct}
                                className="bg-pot-petrol text-white p-1 rounded hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center w-8"
                                title="Adicionar à lista"
                             >
                                <Plus size={16} />
                             </button>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 italic">*O valor total será atualizado automaticamente.</p>
                       </div>
                    </div>
                 ) : (
                    <>
                       <p className="font-bold text-pot-petrol mb-1">{deal.productInterest}</p>
                       {deal.additionalProducts && deal.additionalProducts.length > 0 && (
                          <div className="mb-2 space-y-1">
                             {deal.additionalProducts.map((ap, idx) => (
                                <div key={idx} className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                   <Plus size={10} className="mr-1" /> {ap}
                                </div>
                             ))}
                          </div>
                       )}

                       {product ? (
                         <>
                           <p className="text-xs text-gray-500 mb-3">{product.description}</p>
                           
                           <div className="bg-orange-50 p-3 rounded border border-orange-100">
                              <p className="text-[10px] font-bold text-pot-orange uppercase mb-1 flex items-center">
                                <Zap size={10} className="mr-1" /> Automação de Onboarding
                              </p>
                              <p className="text-xs text-gray-600 leading-snug">
                                {product.onboardingProcess}
                              </p>
                           </div>
                         </>
                       ) : (
                         <p className="text-xs text-gray-400">Detalhes técnicos do produto principal indisponíveis.</p>
                       )}
                    </>
                 )}
              </div>
           </div>

           {/* Contact Info */}
           <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                 <h3 className="font-bold text-gray-700 text-sm">Dados do Cliente</h3>
              </div>
              <div className="p-4 space-y-3">
                 <div className="flex items-center">
                    <Building size={16} className="text-gray-400 mr-3" />
                    <div>
                       <p className="text-sm font-medium text-gray-800">{deal.company}</p>
                       <p className="text-xs text-gray-500">CNPJ: 00.000.000/0001-99</p>
                    </div>
                 </div>
                 <div className="flex items-center">
                    <User size={16} className="text-gray-400 mr-3" />
                    <div>
                       <p className="text-sm font-medium text-gray-800">Contato Principal</p>
                       <p className="text-xs text-gray-500">Diretor Financeiro</p>
                    </div>
                 </div>
                 <div className="flex items-center">
                    <Mail size={16} className="text-gray-400 mr-3" />
                    <a href="mailto:contato@cliente.com" className="text-sm text-pot-petrol hover:underline">
                       contato@cliente.com
                    </a>
                 </div>
                 <div className="flex items-center">
                    <Phone size={16} className="text-gray-400 mr-3" />
                    <p className="text-sm text-gray-600">(11) 99999-9999</p>
                 </div>
              </div>
           </div>

           {/* Internal Info */}
           <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                 <h3 className="font-bold text-gray-700 text-sm">Controle Interno</h3>
              </div>
              <div className="p-4 space-y-3">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Responsável:</span>
                    <div className="flex items-center">
                       <div className="w-5 h-5 rounded-full bg-gray-300 mr-2 overflow-hidden">
                          <img src="https://picsum.photos/101/101" alt="User" />
                       </div>
                       <span className="font-medium text-gray-800">{deal.owner}</span>
                    </div>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Previsão Fechamento:</span>
                    <span className="text-gray-800">30/11/2023</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Probabilidade:</span>
                    <span className="font-bold text-pot-success">75%</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* New Note Modal */}
      {activeModal === 'note' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
             <h3 className="text-lg font-bold text-pot-petrol mb-4">Adicionar Nota</h3>
             <form onSubmit={handleAddNote}>
                <textarea 
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-pot-orange focus:border-transparent outline-none resize-none"
                  placeholder="Escreva os detalhes aqui..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-2 mt-4">
                   <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancelar</button>
                   <button type="submit" className="px-4 py-2 bg-pot-petrol text-white rounded hover:bg-gray-800">Salvar Nota</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Schedule Activity Modal */}
      {activeModal === 'activity' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
             <h3 className="text-lg font-bold text-pot-petrol mb-4">Nova Atividade</h3>
             <form onSubmit={handleCreateActivity}>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Atividade</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange outline-none"
                    value={newActivity.type}
                    onChange={e => setNewActivity({...newActivity, type: e.target.value as ActivityType})}
                  >
                    {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                   <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                   <input 
                    type="text" 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pot-orange outline-none"
                    value={newActivity.title}
                    onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                   />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Data e Hora</label>
                  <input 
                    required
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-pot-orange focus:border-transparent outline-none"
                    value={newActivity.date}
                    onChange={e => setNewActivity({...newActivity, date: e.target.value})}
                  />
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                   <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancelar</button>
                   <button type="submit" className="px-4 py-2 bg-pot-orange text-white rounded hover:bg-orange-600">Agendar</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Proposal Generation Modal */}
      {activeModal === 'proposal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-fade-in">
              <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white shrink-0 rounded-t-xl">
                 <h3 className="text-lg font-bold flex items-center">
                    <Sparkles size={20} className="mr-2 text-pot-orange" />
                    Gerador de Proposta (IA)
                 </h3>
                 <button onClick={() => setActiveModal(null)} className="text-gray-300 hover:text-white">
                    <X size={20} />
                 </button>
              </div>

              <div className="flex-1 p-6 overflow-hidden flex flex-col relative">
                 {isGeneratingProposal ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                      <Loader2 size={48} className="text-pot-orange animate-spin mb-4" />
                      <p className="text-gray-500 font-medium">A IA está escrevendo a melhor proposta para seu cliente...</p>
                      <p className="text-xs text-gray-400 mt-2">Usando modelo Gemini Pro para máxima persuasão</p>
                   </div>
                 ) : (
                    <>
                       <div className="mb-2">
                          <p className="text-sm text-gray-600">O sistema gerou este rascunho com base no produto <strong>{deal.productInterest}</strong>. Revise antes de enviar.</p>
                       </div>
                       <textarea 
                          className="flex-1 w-full border border-gray-300 rounded-lg p-4 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-pot-orange outline-none resize-none"
                          value={proposalContent}
                          onChange={(e) => setProposalContent(e.target.value)}
                       ></textarea>
                    </>
                 )}
              </div>

              {!isGeneratingProposal && (
                <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                   <button 
                     onClick={() => setActiveModal(null)}
                     className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium"
                   >
                     Cancelar
                   </button>
                   <button 
                     onClick={handleSendProposal}
                     className="px-6 py-2 bg-pot-success text-white rounded-lg hover:bg-green-700 font-bold shadow-md flex items-center"
                   >
                     <Send size={18} className="mr-2" />
                     Confirmar e Enviar
                   </button>
                </div>
              )}
           </div>
        </div>
      )}
      
      {/* Research Modal */}
      {activeModal === 'research' && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-fade-in">
               <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white shrink-0 rounded-t-xl">
                  <h3 className="text-lg font-bold flex items-center">
                     <Search size={20} className="mr-2" />
                     Inteligência de Mercado
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="text-blue-200 hover:text-white">
                     <X size={20} />
                  </button>
               </div>
               
               <div className="flex-1 p-8 overflow-y-auto">
                  {isResearching ? (
                     <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-600 font-medium">Pesquisando "{deal.company}" no Google...</p>
                        <p className="text-xs text-gray-400 mt-2">Buscando notícias, riscos e oportunidades de negócio</p>
                     </div>
                  ) : researchData ? (
                     <div className="prose prose-sm max-w-none">
                        <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                           <Building size={24} className="mr-2 text-gray-400" />
                           {deal.company}
                        </h4>
                        
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                           <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                              {researchData.text}
                           </p>
                        </div>
                        
                        {researchData.sources && researchData.sources.length > 0 && (
                           <div className="mt-6 border-t pt-4">
                              <h5 className="font-bold text-gray-500 text-xs uppercase mb-3">Fontes da Pesquisa (Google Grounding)</h5>
                              <ul className="space-y-2">
                                 {researchData.sources.map((chunk, idx) => (
                                    <li key={idx} className="text-xs">
                                       <a 
                                          href={chunk.web?.uri} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center text-blue-600 hover:underline"
                                       >
                                          <ExternalLink size={10} className="mr-2" />
                                          {chunk.web?.title || 'Fonte Web'}
                                       </a>
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        )}
                     </div>
                  ) : (
                     <p className="text-center text-gray-500">Não foi possível carregar as informações.</p>
                  )}
               </div>
               
               <div className="p-4 bg-gray-50 border-t flex justify-end">
                   <button 
                     onClick={() => setActiveModal(null)}
                     className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                   >
                     Fechar
                   </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default DealDetails;
