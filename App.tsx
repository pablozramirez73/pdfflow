
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DocumentView } from './components/DocumentView';
import { WorkflowDashboard } from './components/WorkflowDashboard';
import { UploadModal } from './components/UploadModal';
import { LandingPage } from './components/LandingPage';
import { Document, ViewState, Workflow, WorkflowRun } from './types';
import { fileToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LANDING);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Mock initial documents
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Contratto_Servizi_2024.pdf',
      size: 1024 * 1024 * 2.5,
      type: 'application/pdf',
      uploadDate: new Date('2023-10-15'),
      status: 'ready',
      tags: ['Legale', 'Contratti']
    },
    {
      id: '2',
      name: 'Report_Finanziario_Q3.pdf',
      size: 1024 * 1024 * 4.2,
      type: 'application/pdf',
      uploadDate: new Date('2023-11-02'),
      status: 'ready',
      tags: ['Finanza', 'Report']
    }
  ]);

  // Mock initial workflows
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Analisi Contratti Legali',
      description: 'Genera automaticamente un riassunto per ogni contratto caricato e aggiungi filigrana.',
      isActive: true,
      trigger: 'ON_UPLOAD',
      runCount: 42,
      steps: [
        { id: '101', type: 'GEMINI_SUMMARY', name: 'Analisi AI' },
        { id: '102', type: 'PDF_WATERMARK', name: 'Filigrana "CONFIDENZIALE"' }
      ]
    },
    {
      id: '2',
      name: 'Estrazione Fatture',
      description: 'Estrae dati chiave dalle fatture e converte in JSON.',
      isActive: false,
      trigger: 'MANUAL',
      runCount: 15,
      steps: [
        { id: '201', type: 'GEMINI_EXTRACT', name: 'Estrai Dati' }
      ]
    }
  ]);

  // Mock Workflow Runs
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([
    {
      id: 'r1',
      workflowId: '1',
      date: new Date('2023-11-05T10:30:00'),
      status: 'SUCCESS',
      duration: '4.2s',
      details: 'Elaborato Contratto_A.pdf. Riassunto generato.',
      triggeredBy: 'Auto (Upload)'
    },
    {
      id: 'r2',
      workflowId: '1',
      date: new Date('2023-11-05T09:15:00'),
      status: 'SUCCESS',
      duration: '3.8s',
      details: 'Elaborato NDA_Rossi.pdf.',
      triggeredBy: 'Auto (Upload)'
    },
    {
      id: 'r3',
      workflowId: '1',
      date: new Date('2023-11-04T16:45:00'),
      status: 'ERROR',
      duration: '1.2s',
      details: 'Errore API Gemini: Quota exceeded.',
      triggeredBy: 'Auto (Upload)'
    },
    {
      id: 'r4',
      workflowId: '2',
      date: new Date('2023-11-06T11:00:00'),
      status: 'RUNNING',
      duration: 'Pending',
      details: 'In elaborazione batch di 5 fatture...',
      triggeredBy: 'Manuale'
    }
  ]);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (view !== ViewState.DOCUMENT_DETAIL) {
      setSelectedDocument(null);
    }
  };

  const handleDocumentSelect = (doc: Document) => {
    setSelectedDocument(doc);
    setCurrentView(ViewState.DOCUMENT_DETAIL);
  };

  const handleUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        status: 'ready',
        content: base64, // Store base64 for preview and AI
        tags: ['Nuovo']
      };

      setDocuments(prev => [newDoc, ...prev]);
      
      // Auto-open the new document
      setSelectedDocument(newDoc);
      setCurrentView(ViewState.DOCUMENT_DETAIL);

    } catch (error) {
      console.error("Upload failed", error);
      alert("Caricamento fallito.");
    }
  };

  if (currentView === ViewState.LANDING) {
    return <LandingPage onEnter={() => handleNavigate(ViewState.DASHBOARD)} />;
  }

  return (
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans">
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        onUploadClick={() => setIsUploadModalOpen(true)}
      />
      
      <main className="flex-1 ml-64 h-full overflow-hidden">
        {currentView === ViewState.DASHBOARD && (
          <div className="h-full overflow-y-auto">
            <Dashboard 
              documents={documents} 
              onSelectDocument={handleDocumentSelect} 
            />
          </div>
        )}

        {currentView === ViewState.DOCUMENT_DETAIL && selectedDocument && (
          <DocumentView 
            document={selectedDocument} 
            onBack={() => handleNavigate(ViewState.DASHBOARD)} 
          />
        )}

        {currentView === ViewState.WORKFLOWS && (
          <WorkflowDashboard 
            workflows={workflows}
            runs={workflowRuns}
            onUpdateWorkflows={setWorkflows}
          />
        )}
        
        {currentView === ViewState.SETTINGS && (
           <div className="p-12 text-center text-gray-500">
             <h2 className="text-2xl font-bold mb-4">Impostazioni</h2>
             <p>Funzionalità in arrivo...</p>
           </div>
        )}
      </main>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onUpload={handleUpload}
      />
    </div>
  );
};

export default App;
