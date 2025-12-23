import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Product, UserRole, WorkflowStep, User } from '../types';
import { ProductService } from '../services/productService';
import { Tag, Clock, CreditCard, Rocket, Box, Zap, UserCheck, Bot, FileText, Settings, Plus, Trash2, X, Calendar, Check, Briefcase, DollarSign, AlignLeft } from 'lucide-react';

const Products: React.FC = () => {
   const { user } = useOutletContext<{ user: User }>();
   // Role Check
   const isManager = user.role === UserRole.MANAGER_CS_OPS || user.role === UserRole.SUPER_ADMIN;

   // Products State
   const [products, setProducts] = useState<Product[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      loadProducts();
   }, []);

   const loadProducts = async () => {
      try {
         const data = await ProductService.getAll();
         setProducts(data);
      } catch (error) {
         console.error("Failed to load products", error);
      } finally {
         setLoading(false);
      }
   };

   // Workflow Modal State
   const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
   const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);

   // Create Product Modal State
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
   const [newProduct, setNewProduct] = useState<Partial<Product>>({
      title: '',
      description: '',
      price: 0,
      priceModel: 'fixed',
      category: 'Assessoria',
      onboardingProcess: '',
      paymentMethods: ['PIX', 'Boleto'],
      automationDesc: 'Configuração manual'
   });

   // New Step Form State (for Workflow)
   const [newStep, setNewStep] = useState<Partial<WorkflowStep>>({
      title: '',
      description: '',
      type: 'task',
      relativeDays: 0,
      durationHours: 1
   });

   const getCategoryColor = (category: string) => {
      switch (category) {
         case 'Curso': return 'bg-green-100 text-green-800';
         case 'Diagnóstico': return 'bg-blue-100 text-blue-800';
         case 'Assessoria': return 'bg-purple-100 text-purple-800';
         case 'Horas': return 'bg-yellow-100 text-yellow-800';
         case 'Club': return 'bg-pot-magenta text-white';
         default: return 'bg-gray-100 text-gray-800';
      }
   };

   const formatPrice = (price: number, model: string) => {
      const formatted = price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      switch (model) {
         case 'hourly': return `${formatted} / hora`;
         case 'monthly': return `${formatted} / mês`;
         case 'yearly': return `${formatted} / ano`;
         default: return formatted;
      }
   };

   // --- Create Product Handlers ---

   const handleCreateProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      const productPayload: Partial<Product> = {
         title: newProduct.title || 'Novo Produto',
         description: newProduct.description || '',
         price: Number(newProduct.price),
         priceModel: newProduct.priceModel as any,
         category: newProduct.category as any,
         onboardingProcess: newProduct.onboardingProcess || '',
         paymentMethods: newProduct.paymentMethods || [],
         automationDesc: newProduct.automationDesc || 'Configuração manual',
         workflow: [] // Empty workflow initially
      };

      try {
         const createdProduct = await ProductService.create(productPayload);
         setProducts([createdProduct, ...products]);
         setIsCreateModalOpen(false);

         // Reset Form
         setNewProduct({
            title: '',
            description: '',
            price: 0,
            priceModel: 'fixed',
            category: 'Assessoria',
            onboardingProcess: '',
            paymentMethods: ['PIX', 'Boleto'],
            automationDesc: 'Configuração manual'
         });
         alert("Produto criado com sucesso!");
      } catch (error) {
         console.error("Failed to create product", error);
         alert("Erro ao criar produto.");
      }
   };

   // --- Workflow Handlers ---

   const handleOpenWorkflowModal = (product: Product) => {
      setSelectedProduct(product);
      setWorkflowSteps(product.workflow || []);
      setIsWorkflowModalOpen(true);
   };

   const handleAddStep = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newStep.title) return;

      const step: WorkflowStep = {
         id: Math.random(),
         title: newStep.title,
         description: newStep.description || '',
         type: newStep.type as any,
         relativeDays: Number(newStep.relativeDays),
         durationHours: Number(newStep.durationHours)
      };

      const updatedSteps = [...workflowSteps, step].sort((a, b) => a.relativeDays - b.relativeDays);
      setWorkflowSteps(updatedSteps);

      // Reset form
      setNewStep({ title: '', description: '', type: 'task', relativeDays: 0, durationHours: 1 });
   };

   const handleRemoveStep = (id: number) => {
      setWorkflowSteps(workflowSteps.filter(s => s.id !== id));
   };

   const handleSaveWorkflow = async () => {
      if (selectedProduct) {
         try {
            const updatedProduct = await ProductService.update(selectedProduct.id, { workflow: workflowSteps });
            setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));

            alert(`Workflow do produto "${selectedProduct.title}" atualizado com sucesso!`);
            setIsWorkflowModalOpen(false);
         } catch (error) {
            console.error("Failed to update workflow", error);
            alert("Erro ao salvar workflow.");
         }
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 className="text-2xl font-bold text-pot-petrol">Catálogo de Produtos & Serviços</h2>
               <p className="text-sm text-gray-500">Consulte preços, escopo e regras de onboarding para cada solução.</p>
            </div>

            {isManager ? (
               <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-pot-orange text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md font-bold"
               >
                  <Plus size={18} className="mr-2" />
                  Novo Produto Personalizado
               </button>
            ) : (
               <div className="text-sm text-gray-400 italic bg-white px-3 py-1 rounded border border-gray-200">
                  Integração com Bitrix disponível
               </div>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
               <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col border border-gray-100 hover:shadow-lg transition-all relative">

                  {/* Manager Actions */}
                  {isManager && (
                     <button
                        onClick={() => handleOpenWorkflowModal(product)}
                        className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-sm text-gray-400 hover:text-pot-orange hover:bg-white transition-all z-10 border border-gray-200"
                        title="Configurar Template de Projeto"
                     >
                        <Settings size={18} />
                     </button>
                  )}

                  {/* Header Card */}
                  <div className="p-6 pb-4 border-b border-gray-100">
                     <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${getCategoryColor(product.category)}`}>
                           {product.category}
                        </span>
                        {product.title.includes('Greenn') && (
                           <span className="flex items-center text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100">
                              <Zap size={10} className="mr-1" /> Webhook Ativo
                           </span>
                        )}
                     </div>
                     <h3 className="text-xl font-bold text-gray-800 mb-2 pr-8">{product.title}</h3>
                     <p className="text-2xl font-bold text-pot-orange">
                        {formatPrice(product.price, product.priceModel)}
                     </p>
                  </div>

                  {/* Content Body */}
                  <div className="p-6 flex-1 space-y-4">
                     <div className="flex items-start">
                        <Box className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed">
                           {product.description}
                        </p>
                     </div>

                     <div className="flex items-center text-sm text-gray-500">
                        <CreditCard className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <span>{product.paymentMethods.join(', ')}</span>
                     </div>
                  </div>

                  {/* Automation/Onboarding Section */}
                  <div className="bg-gray-50 p-5 border-t border-gray-200">
                     <div className="flex items-center justify-between mb-4">
                        <div className="text-pot-petrol font-bold text-sm uppercase tracking-wider flex items-center">
                           <Rocket size={16} className="mr-2 text-pot-orange" />
                           Onboarding & Automação
                        </div>
                        {product.workflow && product.workflow.length > 0 && (
                           <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                              {product.workflow.length} Passos
                           </span>
                        )}
                     </div>

                     <div className="space-y-3">
                        {/* Processo Manual */}
                        <div className="flex items-start">
                           <div className="w-6 flex-shrink-0 flex justify-center mt-0.5">
                              <UserCheck size={16} className="text-blue-500" />
                           </div>
                           <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase mb-0.5">Processo Inicial (CS)</p>
                              <p className="text-xs text-gray-700 leading-snug">
                                 {product.onboardingProcess}
                              </p>
                           </div>
                        </div>

                        <div className="pl-3 border-l-2 border-dashed border-gray-200 h-2 ml-3"></div>

                        {/* Automação do Sistema */}
                        {product.automationDesc && (
                           <div className="flex items-start">
                              <div className="w-6 flex-shrink-0 flex justify-center mt-0.5">
                                 <Bot size={16} className="text-pot-magenta" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-gray-500 uppercase mb-0.5">Ações Automáticas</p>
                                 <p className="text-xs text-gray-700 leading-snug bg-white p-2 rounded border border-gray-200 shadow-sm">
                                    {product.automationDesc}
                                 </p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* CREATE PRODUCT MODAL */}
         {isCreateModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white shrink-0">
                     <h3 className="text-lg font-bold flex items-center">
                        <Briefcase size={20} className="mr-2" />
                        Novo Produto Personalizado
                     </h3>
                     <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-300 hover:text-white">
                        <X size={20} />
                     </button>
                  </div>

                  <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto p-6 space-y-5">

                     {/* 1. Basic Info */}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                           <label className="block text-xs font-bold text-gray-600 mb-1">Título do Produto</label>
                           <div className="relative">
                              <Tag className="absolute left-3 top-2.5 text-gray-400" size={16} />
                              <input
                                 required
                                 type="text"
                                 className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:border-pot-orange outline-none bg-white text-gray-900"
                                 placeholder="Ex: Consultoria Personalizada"
                                 value={newProduct.title}
                                 onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                              />
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-600 mb-1">Categoria</label>
                           <select
                              className="w-full px-3 py-2 border border-gray-300 rounded outline-none bg-white text-gray-900"
                              value={newProduct.category}
                              onChange={e => setNewProduct({ ...newProduct, category: e.target.value as any })}
                           >
                              <option value="Assessoria">Assessoria</option>
                              <option value="Diagnóstico">Diagnóstico</option>
                              <option value="Curso">Curso</option>
                              <option value="Horas">Pacote de Horas</option>
                              <option value="Club">Club (Assinatura)</option>
                           </select>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-gray-600 mb-1">Modelo de Cobrança</label>
                           <select
                              className="w-full px-3 py-2 border border-gray-300 rounded outline-none bg-white text-gray-900"
                              value={newProduct.priceModel}
                              onChange={e => setNewProduct({ ...newProduct, priceModel: e.target.value as any })}
                           >
                              <option value="fixed">Fixo (Único)</option>
                              <option value="monthly">Mensal (Recorrente)</option>
                              <option value="hourly">Por Hora</option>
                              <option value="yearly">Anual</option>
                           </select>
                        </div>

                        <div className="col-span-2">
                           <label className="block text-xs font-bold text-gray-600 mb-1">Valor (R$)</label>
                           <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={16} />
                              <input
                                 required
                                 type="number"
                                 step="0.01"
                                 className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:border-pot-orange outline-none font-bold text-pot-petrol bg-white"
                                 placeholder="0,00"
                                 value={newProduct.price}
                                 onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                              />
                           </div>
                        </div>
                     </div>

                     {/* 2. Description */}
                     <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center">
                           <AlignLeft size={14} className="mr-1" /> Descrição do Produto
                        </label>
                        <textarea
                           required
                           className="w-full border border-gray-300 rounded p-3 h-24 resize-none focus:border-pot-orange outline-none text-sm bg-white text-gray-900"
                           placeholder="Descreva o escopo e detalhes do produto..."
                           value={newProduct.description}
                           onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                        ></textarea>
                     </div>

                     {/* 3. Onboarding Process */}
                     <div className="bg-gray-50 p-4 rounded border border-gray-200">
                        <label className="block text-xs font-bold text-pot-petrol mb-2 flex items-center">
                           <Rocket size={14} className="mr-1 text-pot-orange" />
                           Passos do Onboarding (Pós-Venda)
                        </label>
                        <p className="text-[10px] text-gray-500 mb-2">Liste os passos que serão seguidos após a venda deste produto.</p>
                        <textarea
                           className="w-full border border-gray-300 rounded p-3 h-24 resize-none focus:border-pot-orange outline-none text-sm bg-white text-gray-900"
                           placeholder="1. Agendar reunião inicial &#10;2. Enviar contrato &#10;3. Coletar acessos..."
                           value={newProduct.onboardingProcess}
                           onChange={e => setNewProduct({ ...newProduct, onboardingProcess: e.target.value })}
                        ></textarea>
                     </div>

                  </form>

                  <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                     <button
                        onClick={() => setIsCreateModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium text-sm"
                     >
                        Cancelar
                     </button>
                     <button
                        onClick={handleCreateProduct}
                        className="px-6 py-2 bg-pot-success text-white rounded shadow hover:bg-green-700 font-bold text-sm flex items-center"
                     >
                        <Check size={18} className="mr-2" />
                        Criar Produto
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* WORKFLOW EDITOR MODAL */}
         {isWorkflowModalOpen && selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                  <div className="bg-pot-petrol px-6 py-4 flex justify-between items-center text-white shrink-0">
                     <div>
                        <h3 className="text-lg font-bold flex items-center">
                           <Settings size={20} className="mr-2" />
                           Template de Projeto
                        </h3>
                        <p className="text-xs opacity-80">Configurando workflow para: <strong>{selectedProduct.title}</strong></p>
                     </div>
                     <button onClick={() => setIsWorkflowModalOpen(false)} className="text-gray-300 hover:text-white">
                        <X size={24} />
                     </button>
                  </div>

                  <div className="flex-1 flex overflow-hidden">
                     {/* Left: Step List */}
                     <div className="flex-1 overflow-y-auto p-6 bg-gray-50 border-r border-gray-200">
                        <h4 className="font-bold text-pot-petrol mb-4 flex items-center">
                           <Box size={18} className="mr-2" /> Etapas Definidas
                        </h4>

                        {workflowSteps.length > 0 ? (
                           <div className="relative border-l-2 border-gray-300 ml-3 space-y-6">
                              {workflowSteps.map((step, idx) => (
                                 <div key={step.id} className="ml-6 relative">
                                    <div className="absolute -left-[31px] top-0 bg-pot-petrol text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                                       {idx + 1}
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 group">
                                       <div className="flex justify-between items-start mb-1">
                                          <h5 className="font-bold text-gray-800">{step.title}</h5>
                                          <button
                                             onClick={() => handleRemoveStep(step.id)}
                                             className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                             <Trash2 size={16} />
                                          </button>
                                       </div>
                                       <p className="text-xs text-gray-500 mb-2">{step.description}</p>
                                       <div className="flex items-center gap-3 text-xs">
                                          <span className={`px-2 py-0.5 rounded font-medium ${step.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                                             step.type === 'milestone' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                             }`}>
                                             {step.type === 'meeting' ? 'Reunião' : step.type === 'milestone' ? 'Entrega' : 'Tarefa'}
                                          </span>
                                          <span className="flex items-center text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                             <Calendar size={12} className="mr-1" />
                                             Dia {step.relativeDays}
                                          </span>
                                          <span className="flex items-center text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                             <Clock size={12} className="mr-1" />
                                             {step.durationHours}h
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="text-center py-10 text-gray-400 bg-white rounded border border-dashed border-gray-300">
                              <Box size={32} className="mx-auto mb-2 opacity-50" />
                              <p>Nenhuma etapa configurada.</p>
                              <p className="text-xs">Adicione passos ao lado.</p>
                           </div>
                        )}
                     </div>

                     {/* Right: Add Step Form */}
                     <div className="w-80 bg-white p-6 shadow-lg z-10 flex flex-col">
                        <h4 className="font-bold text-pot-petrol mb-4 flex items-center">
                           <Plus size={18} className="mr-2 text-pot-orange" /> Adicionar Passo
                        </h4>

                        <form onSubmit={handleAddStep} className="space-y-4 flex-1">
                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Título da Atividade</label>
                              <input
                                 required
                                 type="text"
                                 className="w-full border border-gray-300 rounded p-2 text-sm focus:border-pot-orange outline-none bg-white text-gray-900"
                                 placeholder="Ex: Kickoff Meeting"
                                 value={newStep.title}
                                 onChange={e => setNewStep({ ...newStep, title: e.target.value })}
                              />
                           </div>

                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Tipo</label>
                              <select
                                 className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                                 value={newStep.type}
                                 onChange={e => setNewStep({ ...newStep, type: e.target.value as any })}
                              >
                                 <option value="task">Tarefa Padrão</option>
                                 <option value="meeting">Reunião</option>
                                 <option value="milestone">Marco / Entrega</option>
                              </select>
                           </div>

                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="block text-xs font-bold text-gray-600 mb-1" title="Dias após o início do projeto">Dia (Relativo)</label>
                                 <input
                                    type="number"
                                    min="0"
                                    className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                                    value={newStep.relativeDays}
                                    onChange={e => setNewStep({ ...newStep, relativeDays: Number(e.target.value) })}
                                 />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-gray-600 mb-1">Tempo (h)</label>
                                 <input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    className="w-full border border-gray-300 rounded p-2 text-sm outline-none bg-white text-gray-900"
                                    value={newStep.durationHours}
                                    onChange={e => setNewStep({ ...newStep, durationHours: Number(e.target.value) })}
                                 />
                              </div>
                           </div>

                           <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Descrição / Instruções</label>
                              <textarea
                                 className="w-full border border-gray-300 rounded p-2 text-sm h-24 resize-none outline-none focus:border-pot-orange bg-white text-gray-900"
                                 placeholder="Detalhes do que deve ser feito..."
                                 value={newStep.description}
                                 onChange={e => setNewStep({ ...newStep, description: e.target.value })}
                              ></textarea>
                           </div>

                           <button
                              type="submit"
                              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded text-sm transition-colors border border-gray-300"
                           >
                              Adicionar à Lista
                           </button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                           <button
                              onClick={handleSaveWorkflow}
                              className="w-full bg-pot-success hover:bg-green-700 text-white font-bold py-3 rounded shadow-md transition-colors flex items-center justify-center"
                           >
                              <Check size={18} className="mr-2" />
                              Salvar Template
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Products;
