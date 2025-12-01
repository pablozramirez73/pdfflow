import React, { useState, useMemo } from 'react';
import { Document } from '../types';
import { Search, MoreHorizontal, FileText, Loader2, Calendar, HardDrive, SlidersHorizontal, X, Tag, Filter, LayoutGrid, List } from 'lucide-react';

interface DashboardProps {
  documents: Document[];
  onSelectDocument: (doc: Document) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ documents, onSelectDocument }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter States
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');

  // Extract unique tags from all documents dynamically
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    documents.forEach(doc => doc.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [documents]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setDateFrom('');
    setDateTo('');
    setMinSize('');
    setMaxSize('');
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // 1. Text Search (Name)
      if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // 2. Tags Filter (Must contain at least one of the selected tags if any are selected)
      if (selectedTags.length > 0) {
        const hasTag = selectedTags.some(tag => doc.tags.includes(tag));
        if (!hasTag) return false;
      }

      // 3. Date Range
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (doc.uploadDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        // Set to end of day
        to.setHours(23, 59, 59, 999);
        if (doc.uploadDate > to) return false;
      }

      // 4. Size Range (MB)
      const sizeMB = doc.size / (1024 * 1024);
      if (minSize && sizeMB < parseFloat(minSize)) return false;
      if (maxSize && sizeMB > parseFloat(maxSize)) return false;

      return true;
    });
  }, [documents, searchQuery, selectedTags, dateFrom, dateTo, minSize, maxSize]);

  const activeFiltersCount = [
    selectedTags.length > 0,
    dateFrom !== '',
    dateTo !== '',
    minSize !== '',
    maxSize !== ''
  ].filter(Boolean).length;

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <header className="mb-6 shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">I tuoi documenti</h1>
          <p className="text-gray-500">Gestisci e analizza i tuoi PDF con l'intelligenza artificiale.</p>
        </div>
        
        {/* View Toggle */}
        <div className="bg-gray-100 p-1 rounded-lg border border-gray-200 flex items-center shrink-0">
          <button 
            onClick={() => setViewMode('grid')} 
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Visualizzazione a griglia"
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')} 
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Visualizzazione elenco"
          >
            <List size={18} />
          </button>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="mb-6 shrink-0 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
            <Search className="text-gray-400" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca documenti per nome..." 
              className="flex-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border font-medium flex items-center gap-2 transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'bg-brand-50 border-brand-200 text-brand-700' 
                : 'bg-white border-border text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={18} />
            <span>Filtri</span>
            {activeFiltersCount > 0 && (
              <span className="bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="bg-white p-5 rounded-xl border border-border shadow-sm animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                  <Calendar size={14} /> Data Caricamento
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input 
                    type="date" 
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Size Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                  <HardDrive size={14} /> Dimensione (MB)
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minSize}
                    onChange={(e) => setMinSize(e.target.value)}
                    className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxSize}
                    onChange={(e) => setMaxSize(e.target.value)}
                    className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                  <Tag size={14} /> Filtra per Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-brand-100 border-brand-200 text-brand-700 font-medium'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {allTags.length === 0 && <span className="text-xs text-gray-400 italic">Nessun tag disponibile</span>}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={14} /> Resetta filtri
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Area */}
      <div className={`flex-1 overflow-y-auto ${viewMode === 'list' ? 'bg-white rounded-xl border border-border shadow-sm' : ''}`}>
        
        {filteredDocuments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-border border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              {activeFiltersCount > 0 || searchQuery ? (
                <Filter size={32} className="text-gray-400" />
              ) : (
                <FileText size={32} className="text-gray-400" />
              )}
            </div>
            <p className="text-lg font-medium text-gray-900">
              {activeFiltersCount > 0 || searchQuery ? "Nessun risultato trovato" : "Nessun documento"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {activeFiltersCount > 0 || searchQuery 
                ? "Prova a modificare i filtri o la ricerca." 
                : "Carica un PDF per iniziare l'analisi."}
            </p>
            {(activeFiltersCount > 0 || searchQuery) && (
              <button 
                onClick={clearFilters}
                className="mt-4 text-brand-600 hover:text-brand-700 font-medium text-sm"
              >
                Rimuovi tutti i filtri
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="flex flex-col h-full">
             <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0 sticky top-0">
              <div className="col-span-6">Nome</div>
              <div className="col-span-2">Stato</div>
              <div className="col-span-2">Data</div>
              <div className="col-span-1">Dimensione</div>
              <div className="col-span-1 text-right">Azioni</div>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredDocuments.map((doc) => (
                <div 
                  key={doc.id} 
                  onClick={() => onSelectDocument(doc)}
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-orange-50/30 cursor-pointer transition-colors group"
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 group-hover:text-brand-700 truncate">{doc.name}</h3>
                      <div className="flex gap-2 mt-1">
                        {doc.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    {doc.status === 'processing' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        <Loader2 size={12} className="animate-spin" />
                        In analisi
                      </span>
                    ) : doc.status === 'ready' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        Pronto
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        Errore
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    {doc.uploadDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>

                  <div className="col-span-1 flex items-center gap-2 text-sm text-gray-500">
                    <HardDrive size={14} />
                    {(doc.size / 1024 / 1024).toFixed(1)} MB
                  </div>

                  <div className="col-span-1 text-right">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id} 
                onClick={() => onSelectDocument(doc)}
                className="group bg-white rounded-xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-[280px]"
              >
                {/* Thumbnail Visualization */}
                <div className="flex-1 bg-gray-50 relative flex items-center justify-center p-6 border-b border-gray-100 group-hover:bg-orange-50/10 transition-colors overflow-hidden">
                  {/* Decorative Background Pattern */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  
                  {/* Paper Card Effect */}
                  <div className="relative w-32 h-40 bg-white shadow-md border border-gray-200 flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-105">
                     {/* Corner Fold */}
                     <div className="absolute top-0 right-0 border-t-[12px] border-r-[12px] border-t-gray-100 border-r-gray-200 shadow-sm z-10"></div>
                     <div className="absolute top-0 right-0 w-3 h-3 bg-white"></div> {/* Hide corner behind fold */}
                     
                     {/* Icon */}
                     <FileText size={48} className="text-brand-500 opacity-90" strokeWidth={1} />
                     
                     {/* Lines representing text */}
                     <div className="w-16 h-1 bg-gray-100 rounded-full mt-4 mb-1"></div>
                     <div className="w-12 h-1 bg-gray-100 rounded-full mb-1"></div>
                     <div className="w-14 h-1 bg-gray-100 rounded-full"></div>

                     {/* Type Badge */}
                     <div className="absolute bottom-3 right-3 text-[9px] font-bold text-gray-300 tracking-wider">PDF</div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 truncate pr-2 text-sm" title={doc.name}>{doc.name}</h3>
                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={16}/>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-1 overflow-hidden">
                      {doc.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap">
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 2 && (
                         <span className="bg-gray-100 text-gray-400 text-[10px] px-1.5 py-0.5 rounded-sm">+</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {(doc.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};