import React, { useState } from 'react';
import { Workflow, WorkflowRun } from '../types';
import { Plus, Play, MoreHorizontal, Clock, Zap, CheckCircle2, Search, ArrowLeft, AlertCircle, Loader2, Edit3, Settings } from 'lucide-react';
import { WorkflowBuilder } from './WorkflowBuilder';

interface WorkflowDashboardProps {
  workflows: Workflow[];
  runs: WorkflowRun[];
  onUpdateWorkflows: (workflows: Workflow[]) => void;
}

type DashboardState = 'GRID' | 'HISTORY' | 'BUILDER';

export const WorkflowDashboard: React.FC<WorkflowDashboardProps> = ({ workflows, runs, onUpdateWorkflows }) => {
  const [viewState, setViewState] = useState<DashboardState>('GRID');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  const handleCreateNew = () => {
    setSelectedWorkflow(null);
    setViewState('BUILDER');
  };

  const handleSelectWorkflow = (wf: Workflow) => {
    setSelectedWorkflow(wf);
    setViewState('HISTORY');
  };

  const handleEditDefinition = () => {
    setViewState('BUILDER');
  };

  const handleSaveWorkflow = (wf: Workflow) => {
    const exists = workflows.find(w => w.id === wf.id);
    let newWorkflows;
    if (exists) {
      newWorkflows = workflows.map(w => w.id === wf.id ? wf : w);
    } else {
      newWorkflows = [...workflows, wf];
    }
    onUpdateWorkflows(newWorkflows);
    setViewState('GRID');
    setSelectedWorkflow(null);
  };

  const toggleActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newWorkflows = workflows.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive } : w
    );
    onUpdateWorkflows(newWorkflows);
  };

  // Render Workflow Builder
  if (viewState === 'BUILDER') {
    return (
      <WorkflowBuilder 
        initialWorkflow={selectedWorkflow} 
        onSave={handleSaveWorkflow} 
        onCancel={() => {
          setViewState(selectedWorkflow ? 'HISTORY' : 'GRID');
        }} 
      />
    );
  }

  // Render History / Detail View
  if (viewState === 'HISTORY' && selectedWorkflow) {
    const workflowRuns = runs.filter(r => r.workflowId === selectedWorkflow.id).sort((a, b) => b.date.getTime() - a.date.getTime());
    const successCount = workflowRuns.filter(r => r.status === 'SUCCESS').length;
    const successRate = workflowRuns.length > 0 ? Math.round((successCount / workflowRuns.length) * 100) : 0;

    return (
      <div className="h-full flex flex-col bg-white animate-in fade-in duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setViewState('GRID');
                setSelectedWorkflow(null);
              }} 
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{selectedWorkflow.name}</h2>
                <div 
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    selectedWorkflow.isActive 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {selectedWorkflow.isActive ? 'ATTIVO' : 'INATTIVO'}
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-1">{selectedWorkflow.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={handleEditDefinition}
               className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
             >
               <Edit3 size={16} />
               Modifica Flusso
             </button>
             <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors">
               <Play size={16} fill="currentColor" />
               Esegui Ora
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3 text-gray-500 mb-2">
                  <Zap size={18} />
                  <span className="text-sm font-medium">Esecuzioni Totali</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{selectedWorkflow.runCount}</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3 text-gray-500 mb-2">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-medium">Tasso di Successo</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{successRate}%</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                <div className="flex items-center gap-3 text-gray-500 mb-2">
                  <Clock size={18} />
                  <span className="text-sm font-medium">Ultima Esecuzione</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {workflowRuns[0] ? workflowRuns[0].date.toLocaleDateString() : '-'}
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Cronologia Esecuzioni</h3>
                <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">Aggiorna</button>
              </div>
              
              {workflowRuns.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Clock size={32} className="mx-auto mb-3 opacity-30" />
                  <p>Nessuna esecuzione registrata.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-border">
                    <tr>
                      <th className="px-6 py-3 w-10">Stato</th>
                      <th className="px-6 py-3">Data & Ora</th>
                      <th className="px-6 py-3">Innescato Da</th>
                      <th className="px-6 py-3">Dettagli</th>
                      <th className="px-6 py-3 text-right">Durata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {workflowRuns.map(run => (
                      <tr key={run.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          {run.status === 'SUCCESS' && <CheckCircle2 size={18} className="text-green-500" />}
                          {run.status === 'ERROR' && <AlertCircle size={18} className="text-red-500" />}
                          {run.status === 'RUNNING' && <Loader2 size={18} className="text-blue-500 animate-spin" />}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {run.date.toLocaleDateString()} <span className="text-gray-400 font-normal">{run.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs">
                            {run.triggeredBy}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 truncate max-w-xs" title={run.details}>
                          {run.details}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500 font-mono">
                          {run.duration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard Grid
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-8 py-8 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Automazioni</h1>
            <p className="text-gray-500">Crea flussi di lavoro intelligenti per elaborare i tuoi PDF.</p>
          </div>
          <button 
            onClick={handleCreateNew}
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} />
            Crea Automazione
          </button>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-border max-w-md">
          <Search className="text-gray-400 ml-2" size={20} />
          <input 
            type="text" 
            placeholder="Cerca i tuoi flussi..." 
            className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
        {workflows.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap size={40} className="text-brand-500" fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nessuna automazione attiva</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Risparmia tempo automatizzando le operazioni ripetitive sui PDF come l'estrazione dati, l'unione di file o la conversione.
            </p>
            <button 
              onClick={handleCreateNew}
              className="text-brand-600 font-medium hover:text-brand-700 hover:underline"
            >
              Inizia da un modello vuoto &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {workflows.map((wf) => (
              <div 
                key={wf.id}
                onClick={() => handleSelectWorkflow(wf)}
                className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Zap size={20} fill="currentColor" />
                    </div>
                    <div 
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${wf.isActive ? 'bg-brand-600' : 'bg-gray-200'}`}
                      onClick={(e) => toggleActive(wf.id, e)}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${wf.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-brand-600 transition-colors">{wf.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{wf.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {wf.steps.slice(0, 3).map((step, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200 truncate max-w-[100px]">
                        {step.name}
                      </span>
                    ))}
                    {wf.steps.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md border border-gray-200">
                        +{wf.steps.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-border bg-gray-50/50 rounded-b-xl flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>Eseguito {wf.runCount} volte</span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200/50">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};