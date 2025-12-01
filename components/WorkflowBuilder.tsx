import React, { useState } from 'react';
import { Workflow, WorkflowStep, ActionType, TriggerType } from '../types';
import { ArrowLeft, Save, Plus, Zap, FileText, Split, Merge, Stamp, FileType, Sparkles, Trash2, ChevronRight } from 'lucide-react';

interface WorkflowBuilderProps {
  initialWorkflow?: Workflow | null;
  onSave: (workflow: Workflow) => void;
  onCancel: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ initialWorkflow, onSave, onCancel }) => {
  const [name, setName] = useState(initialWorkflow?.name || 'Nuovo Flusso di Lavoro');
  const [trigger, setTrigger] = useState<TriggerType>(initialWorkflow?.trigger || 'ON_UPLOAD');
  const [steps, setSteps] = useState<WorkflowStep[]>(initialWorkflow?.steps || []);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const availableActions: { type: ActionType; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: 'GEMINI_SUMMARY', label: 'Genera Riassunto AI', icon: <Sparkles size={18} className="text-purple-600" />, desc: 'Usa Gemini 2.5 per analizzare il contenuto' },
    { type: 'GEMINI_EXTRACT', label: 'Estrai Dati Chiave', icon: <FileText size={18} className="text-blue-600" />, desc: 'Estrai date, importi e nomi in JSON' },
    { type: 'PDF_MERGE', label: 'Unisci PDF', icon: <Merge size={18} className="text-orange-600" />, desc: 'Combina con altri documenti recenti' },
    { type: 'PDF_SPLIT', label: 'Dividi PDF', icon: <Split size={18} className="text-indigo-600" />, desc: 'Separa ogni pagina in un file nuovo' },
    { type: 'PDF_WATERMARK', label: 'Applica Filigrana', icon: <Stamp size={18} className="text-pink-600" />, desc: 'Aggiungi logo o testo "Confidenziale"' },
    { type: 'CONVERT_TEXT', label: 'Converti in Word', icon: <FileType size={18} className="text-green-600" />, desc: 'Trasforma il PDF in documento modificabile' },
  ];

  const handleAddStep = (action: typeof availableActions[0]) => {
    const newStep: WorkflowStep = {
      id: Date.now().toString(),
      type: action.type,
      name: action.label,
      config: {}
    };
    setSteps([...steps, newStep]);
    setIsSelectorOpen(false);
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleSave = () => {
    const workflow: Workflow = {
      id: initialWorkflow?.id || Date.now().toString(),
      name,
      description: `Workflow con ${steps.length} passaggi`,
      isActive: true,
      trigger,
      steps,
      runCount: initialWorkflow?.runCount || 0
    };
    onSave(workflow);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="font-bold text-xl text-gray-900 border-none focus:ring-0 p-0 bg-transparent placeholder-gray-400"
              placeholder="Nome del flusso..."
            />
            <p className="text-sm text-gray-500">Configura la tua automazione</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-all">
            <Save size={18} />
            Salva Automazione
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          
          {/* Trigger Node */}
          <div className="w-full bg-white rounded-xl shadow-sm border border-border p-5 relative group hover:border-brand-300 transition-colors cursor-pointer">
            <div className="absolute -left-3 top-6 w-1.5 h-12 bg-brand-500 rounded-r-md"></div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <Zap size={24} className="text-brand-600" fill="currentColor" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Trigger</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Automatico</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Quando succede questo...</h3>
                <select 
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value as TriggerType)}
                  className="mt-2 w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="ON_UPLOAD">1. Nuovo PDF caricato</option>
                  <option value="MANUAL">1. Avvio Manuale (Pulsante)</option>
                  <option value="ON_SCHEDULE">1. Ogni Giorno alle 9:00</option>
                </select>
              </div>
            </div>
          </div>

          {/* Connection Line */}
          <div className="h-8 w-0.5 bg-gray-300 my-1"></div>

          {/* Steps */}
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="w-full bg-white rounded-xl shadow-sm border border-border p-5 relative group hover:border-blue-300 transition-colors">
                <div className="absolute -left-3 top-6 w-1.5 h-12 bg-blue-500 rounded-r-md"></div>
                <button 
                  onClick={() => handleRemoveStep(step.id)}
                  className="absolute right-4 top-4 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    {availableActions.find(a => a.type === step.type)?.icon}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Azione {index + 1}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {availableActions.find(a => a.type === step.type)?.desc}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Connection Line */}
              <div className="h-8 w-0.5 bg-gray-300 my-1"></div>
            </React.Fragment>
          ))}

          {/* Add Step Button */}
          <div className="relative">
             {isSelectorOpen && (
               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 bg-white rounded-xl shadow-xl border border-border z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                 <div className="p-3 bg-gray-50 border-b border-border text-xs font-semibold text-gray-500 uppercase tracking-wider">
                   Scegli un'azione
                 </div>
                 <div className="max-h-64 overflow-y-auto">
                   {availableActions.map(action => (
                     <button
                        key={action.type}
                        onClick={() => handleAddStep(action)}
                        className="w-full text-left p-3 hover:bg-brand-50 hover:text-brand-900 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                     >
                        <div className="text-gray-500">{action.icon}</div>
                        <div>
                          <div className="text-sm font-medium">{action.label}</div>
                          <div className="text-xs text-gray-400">{action.desc}</div>
                        </div>
                     </button>
                   ))}
                 </div>
               </div>
             )}

            <button 
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all border-4 border-white ${isSelectorOpen ? 'bg-gray-800 rotate-45' : 'bg-brand-600 hover:bg-brand-700 hover:scale-110'}`}
            >
              <Plus size={24} className="text-white" />
            </button>
          </div>
          
          <span className="mt-3 text-sm font-medium text-gray-400">Aggiungi step</span>

        </div>
      </div>
    </div>
  );
};