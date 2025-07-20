import React, { useState, useEffect } from "react";
import { useCampaign } from "../../shared/hooks/dnd/useCampaign";
import {
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  DIFFICULTY_LEVELS,
  COMMON_SETTINGS,
  getDifficultyLabel,
} from "@/core/entities/Campaign";
import { CampaignService } from "@/core/services/CampaignService";
import CampaignCard from "../../shared/components/dnd/CampaignCard";
import CampaignSelector from "../../shared/components/dnd/CampaignSelector";
import StatusBadge from "../../shared/components/dnd/StatusBadge";
import ActionButton, {
  CreateButton,
  EditButton,
  DeleteButton,
} from "../../shared/components/dnd/ActionButton";

interface CampaignManagerToolProps {}

const CampaignManagerTool: React.FC<CampaignManagerToolProps> = () => {
  const {
    campaigns,
    currentCampaign,
    campaignSummaries,
    recentCampaigns,
    appSettings,
    loading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    archiveCampaign,
    setCurrentCampaign,
    clearCurrentCampaign,
    startSession,
    updateCampaignStats,
    completeCampaign,
    pauseCampaign,
    resumeCampaign,
    duplicateCampaign,
    exportCampaign,
    importCampaign,
    backupCampaigns,
    validateCampaignName,
    clearError,
    refreshCampaigns,
    activeCampaigns,
    completedCampaigns,
    archivedCampaigns,
    campaignsNeedingAttention,
    overallStats,
    campaignSuggestions,
    recentlyUpdated,
  } = useCampaign();

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [showStatsForm, setShowStatsForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [currentView, setCurrentView] = useState<
    "grid" | "list" | "selector" | "stats"
  >("grid");

  // Create campaign form
  const [newCampaign, setNewCampaign] = useState<CreateCampaignRequest>({
    name: "",
    description: "",
    setting: "Forgotten Realms",
    dmNotes: "",
    difficultyLevel: "Normal",
    playerCount: 4,
  });

  // Edit campaign form
  const [editCampaign, setEditCampaign] = useState<UpdateCampaignRequest>({});
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Stats update form
  const [statsForm, setStatsForm] = useState({
    campaignId: "",
    activeCharacters: 0,
    totalCharacters: 0,
    averageLevel: 1.0,
  });

  // Import form
  const [importData, setImportData] = useState("");

  // Load data on mount
  useEffect(() => {
    refreshCampaigns();
  }, [refreshCampaigns]);

  // Handle create campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = CampaignService.validateCreateData(newCampaign);
    if (!validation.isValid) {
      alert(`Errori di validazione:\n${validation.errors.join("\n")}`);
      return;
    }

    try {
      await createCampaign(newCampaign);
      setNewCampaign({
        name: "",
        description: "",
        setting: "Forgotten Realms",
        dmNotes: "",
        difficultyLevel: "Normal",
        playerCount: 4,
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create campaign:", err);
    }
  };

  // Handle update campaign
  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    const validation = CampaignService.validateUpdateData(editCampaign);
    if (!validation.isValid) {
      alert(`Errori di validazione:\n${validation.errors.join("\n")}`);
      return;
    }

    try {
      await updateCampaign(editingCampaign.id, editCampaign);
      setEditCampaign({});
      setEditingCampaign(null);
      setShowEditForm(false);
    } catch (err) {
      console.error("Failed to update campaign:", err);
    }
  };

  // Handle delete campaign
  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      await deleteCampaign(campaignId);
    } catch (err) {
      console.error("Failed to delete campaign:", err);
    }
  };

  // Handle export campaign
  const handleExportCampaign = async (campaignId: string) => {
    try {
      const jsonData = await exportCampaign(campaignId);

      // Download as file
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `campaign-${campaignId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export campaign:", err);
    }
  };

  // Handle import campaign
  const handleImportCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await importCampaign(importData);
      setImportData("");
      setShowImportForm(false);
    } catch (err) {
      console.error("Failed to import campaign:", err);
    }
  };

  // Handle update stats
  const handleUpdateStats = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCampaignStats(
        statsForm.campaignId,
        statsForm.activeCharacters,
        statsForm.totalCharacters,
        statsForm.averageLevel
      );
      setStatsForm({
        campaignId: "",
        activeCharacters: 0,
        totalCharacters: 0,
        averageLevel: 1.0,
      });
      setShowStatsForm(false);
    } catch (err) {
      console.error("Failed to update campaign stats:", err);
    }
  };

  // Start edit
  const startEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setEditCampaign({
      name: campaign.name,
      description: campaign.description,
      setting: campaign.setting,
      dmNotes: campaign.dmNotes,
      difficultyLevel: campaign.info.difficultyLevel,
      playerCount: campaign.playerCount,
    });
    setShowEditForm(true);
  };

  // Start stats update
  const startStatsUpdate = (campaign: Campaign) => {
    setStatsForm({
      campaignId: campaign.id,
      activeCharacters: campaign.activeCharacters,
      totalCharacters: campaign.info.totalCharacters,
      averageLevel: campaign.averageLevel,
    });
    setShowStatsForm(true);
  };

  return (
    <div className="campaign-manager-tool min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🏰 Campaign Manager
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestisci le tue campagne D&D
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={refreshCampaigns}
                loading={loading}
              >
                🔄 Ricarica
              </ActionButton>

              <ActionButton
                variant="info"
                size="sm"
                onClick={() => setShowSelectorModal(true)}
              >
                📋 Selettore
              </ActionButton>

              <CreateButton onClick={() => setShowCreateForm(true)}>
                + Nuova Campagna
              </CreateButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-red-800 dark:text-red-300">{error}</span>
              </div>
              <ActionButton variant="danger" size="xs" onClick={clearError}>
                ✕
              </ActionButton>
            </div>
          </div>
        )}

        {/* Current Campaign Banner */}
        {currentCampaign && (
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-1">
                  📖 Campagna Corrente: {currentCampaign.name}
                </h2>
                <p className="text-blue-700 dark:text-blue-400 mb-2">
                  {currentCampaign.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-blue-600 dark:text-blue-400">
                  <span>Sessione {currentCampaign.currentSession}</span>
                  <span>{currentCampaign.activeCharacters} PG attivi</span>
                  <span>
                    Livello medio {Math.round(currentCampaign.averageLevel)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ActionButton
                  variant="success"
                  size="sm"
                  onClick={() => startSession(currentCampaign.id)}
                >
                  🎲 Nuova Sessione
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={() => startStatsUpdate(currentCampaign)}
                >
                  📊 Aggiorna Stats
                </ActionButton>
                <ActionButton
                  variant="warning"
                  size="sm"
                  onClick={clearCurrentCampaign}
                >
                  ✕ Deseleziona
                </ActionButton>
              </div>
            </div>
          </div>
        )}

        {/* Overall Statistics */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {overallStats.totalCampaigns}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Campagne Totali
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {overallStats.activeCampaigns}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Attive
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {overallStats.totalCharacters}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Personaggi Totali
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {overallStats.totalSessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Sessioni Totali
            </div>
          </div>
        </div>

        {/* Campaign Suggestions */}
        {campaignSuggestions.length > 0 && (
          <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-4">
              💡 Suggerimenti
            </h2>
            <div className="space-y-3">
              {campaignSuggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3">
                  <StatusBadge
                    variant={
                      suggestion.priority === "high"
                        ? "danger"
                        : suggestion.priority === "medium"
                        ? "warning"
                        : "info"
                    }
                    size="sm"
                  >
                    {suggestion.priority === "high"
                      ? "Alta"
                      : suggestion.priority === "medium"
                      ? "Media"
                      : "Bassa"}
                  </StatusBadge>
                  <div>
                    <div className="font-medium text-yellow-900 dark:text-yellow-300">
                      {suggestion.title}
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-400">
                      {suggestion.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Campagne ({campaigns.length})
            </h2>

            <div className="flex gap-2">
              <StatusBadge variant="success">
                {activeCampaigns.length} Attive
              </StatusBadge>
              {completedCampaigns.length > 0 && (
                <StatusBadge variant="positive">
                  {completedCampaigns.length} Completate
                </StatusBadge>
              )}
              {archivedCampaigns.length > 0 && (
                <StatusBadge variant="neutral">
                  {archivedCampaigns.length} Archiviate
                </StatusBadge>
              )}
              {campaignsNeedingAttention.length > 0 && (
                <StatusBadge variant="warning">
                  {campaignsNeedingAttention.length} Richiedono Attenzione
                </StatusBadge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ActionButton
              variant={currentView === "grid" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setCurrentView("grid")}
            >
              🔳 Griglia
            </ActionButton>
            <ActionButton
              variant={currentView === "selector" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setCurrentView("selector")}
            >
              📋 Selettore
            </ActionButton>
            <ActionButton
              variant={currentView === "stats" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setCurrentView("stats")}
            >
              📊 Statistiche
            </ActionButton>
          </div>
        </div>

        {/* Content based on current view */}
        {currentView === "grid" && (
          <>
            {/* Campaigns Grid */}
            {campaigns.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                <div className="text-6xl mb-4">🏰</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nessuna campagna
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Inizia creando la tua prima campagna D&D!
                </p>
                <CreateButton onClick={() => setShowCreateForm(true)}>
                  Crea la prima campagna
                </CreateButton>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onEdit={startEdit}
                    onDelete={handleDeleteCampaign}
                    onSelect={setCurrentCampaign}
                    onStartSession={startSession}
                    onArchive={archiveCampaign}
                    onDuplicate={(id) => {
                      const name = prompt("Nome per la campagna duplicata:");
                      if (name) duplicateCampaign(id, name);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {currentView === "selector" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <CampaignSelector
              campaigns={campaignSummaries}
              currentCampaign={currentCampaign}
              onSelect={setCurrentCampaign}
              onCreateNew={() => setShowCreateForm(true)}
            />
          </div>
        )}

        {currentView === "stats" && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📅 Attività Recente
              </h3>
              {recentlyUpdated.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  Nessuna attività recente
                </p>
              ) : (
                <div className="space-y-3">
                  {recentlyUpdated.slice(0, 5).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Aggiornata:{" "}
                          {new Date(campaign.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <StatusBadge
                        variant={
                          campaign.status === "Active" ? "success" : "neutral"
                        }
                        size="sm"
                      >
                        {campaign.status}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📈 Statistiche Dettagliate
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Sessioni medie per campagna:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {overallStats.averageSessionsPerCampaign}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Ambientazione più popolare:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {overallStats.mostPopularSetting}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Livello medio complessivo:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {overallStats.averageCampaignLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Campagne completate:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {overallStats.completedCampaigns}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🔧 Azioni Rapide
                </h3>
                <div className="space-y-3">
                  <ActionButton
                    variant="info"
                    fullWidth
                    onClick={() => setShowStatsForm(true)}
                  >
                    📊 Aggiorna Statistiche Campagna
                  </ActionButton>
                  <ActionButton
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowImportForm(true)}
                  >
                    📥 Importa Campagna
                  </ActionButton>
                  <ActionButton
                    variant="utility"
                    fullWidth
                    onClick={backupCampaigns}
                  >
                    💾 Backup Tutte le Campagne
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ⚡ Azioni Rapide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionButton
              variant="success"
              fullWidth
              onClick={() => setShowCreateForm(true)}
            >
              ➕ Nuova Campagna
            </ActionButton>
            <ActionButton
              variant="info"
              fullWidth
              onClick={() => setShowImportForm(true)}
            >
              📥 Importa
            </ActionButton>
            <ActionButton variant="utility" fullWidth onClick={backupCampaigns}>
              💾 Backup
            </ActionButton>
            <ActionButton
              variant="secondary"
              fullWidth
              onClick={refreshCampaigns}
              loading={loading}
            >
              🔄 Ricarica
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Modals and Forms... (I'll create these in the next parts) */}
      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Crea Nuova Campagna
              </h2>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome campagna"
                  value={newCampaign.name}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <textarea
                  placeholder="Descrizione campagna"
                  value={newCampaign.description}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                  required
                />
                <select
                  value={newCampaign.setting}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, setting: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {COMMON_SETTINGS.map((setting) => (
                    <option key={setting} value={setting}>
                      {setting}
                    </option>
                  ))}
                </select>
                <select
                  value={newCampaign.difficultyLevel}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      difficultyLevel: e.target.value as any,
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DIFFICULTY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {getDifficultyLabel(level)}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Numero giocatori"
                  min="1"
                  max="10"
                  value={newCampaign.playerCount}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      playerCount: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Note private del DM..."
                  value={newCampaign.dmNotes}
                  onChange={(e) =>
                    setNewCampaign({ ...newCampaign, dmNotes: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                />

                <div className="flex gap-3 pt-4">
                  <CreateButton type="submit" fullWidth loading={loading}>
                    Crea Campagna
                  </CreateButton>
                  <ActionButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateForm(false)}
                    fullWidth
                  >
                    Annulla
                  </ActionButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Selector Modal */}
      {showSelectorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Seleziona Campagna
                </h2>
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSelectorModal(false)}
                >
                  ✕
                </ActionButton>
              </div>
            </div>
            <div className="p-4 overflow-y-auto">
              <CampaignSelector
                campaigns={campaignSummaries}
                currentCampaign={currentCampaign}
                onSelect={(campaign) => {
                  setCurrentCampaign(campaign.id);
                  setShowSelectorModal(false);
                }}
                showCreateButton={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Additional modals for edit, stats update, import etc. would go here */}
    </div>
  );
};

export default CampaignManagerTool;
