import React, { useState, useEffect } from "react";
import { useCharacters } from "../../shared/hooks/dnd/useCharacters";
import { useCampaign } from "../../shared/hooks/dnd/useCampaign";
import {
  PlayerCharacter,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  AddAchievementRequest,
  UpdateRelationshipRequest,
  RELATIONSHIP_TYPES,
  ACHIEVEMENT_TYPES,
  getRelationshipLabel,
  getAchievementLabel,
} from "@/core/entities/Character";
import { CharacterService } from "@/core/services/CharacterService";
import CharacterCard, {
  CompactCharacterCard,
} from "@/shared/components/dnd/CharacterCard";
import ActionButton, {
  CreateButton,
  EditButton,
  AchievementButton,
  RelationshipButton,
} from "../../shared/components/dnd/ActionButton";
import StatusBadge from "../../shared/components/dnd/StatusBadge";

const ImprovedCharacterTestTool: React.FC = () => {
  const { currentCampaign, updateCampaignStats } = useCampaign();
  const {
    characters,
    currentCharacter,
    loading,
    error,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    setCurrentCharacter,
    addAchievement,
    updateRelationship,
    levelUpCharacter,
    toggleCharacterActive,
    clearError,
    activeCharacters,
    partySummary,
    hasActiveCampaign,
    activeCampaignId,
  } = useCharacters(); // No need to pass campaign ID - automatically uses current

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Create character form
  const [newCharacter, setNewCharacter] = useState<CreateCharacterRequest>({
    campaignId: activeCampaignId || "",
    name: "",
    race: "",
    class: "",
    level: 1,
    maxHp: 10,
    background: "",
    notes: "",
  });

  // Update form campaign ID when current campaign changes
  useEffect(() => {
    if (activeCampaignId) {
      setNewCharacter((prev) => ({ ...prev, campaignId: activeCampaignId }));
    }
  }, [activeCampaignId]);

  // Auto-update campaign stats when characters change
  useEffect(() => {
    if (currentCampaign && characters.length > 0) {
      const activeCount = activeCharacters.length;
      const totalCount = characters.length;
      const avgLevel =
        activeCharacters.length > 0
          ? activeCharacters.reduce((sum, char) => sum + char.level, 0) /
            activeCharacters.length
          : 1;

      // Update campaign stats automatically
      updateCampaignStats(
        currentCampaign.id,
        activeCount,
        totalCount,
        avgLevel
      );
    }
  }, [characters, activeCharacters, currentCampaign, updateCampaignStats]);

  // Show campaign required message if no campaign
  if (!hasActiveCampaign) {
    return (
      <div className="campaign-required p-6 max-w-2xl mx-auto text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-12">
          <div className="text-8xl mb-6">🎭</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Character Manager
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Gestisci i personaggi della tua campagna
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
            <div className="text-yellow-900 dark:text-yellow-300 font-medium mb-2">
              ⚠️ Campagna Richiesta
            </div>
            <div className="text-yellow-700 dark:text-yellow-400 text-sm mb-4">
              Per gestire i personaggi, devi prima selezionare o creare una
              campagna.
            </div>
            <ActionButton
              variant="warning"
              onClick={() => window.history.back()}
            >
              🏰 Vai al Campaign Manager
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  // Handle create character
  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCharacter(newCharacter);
      setNewCharacter({
        campaignId: activeCampaignId || "",
        name: "",
        race: "",
        class: "",
        level: 1,
        maxHp: 10,
        background: "",
        notes: "",
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create character:", err);
    }
  };

  // Handle update character
  const handleUpdateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCharacter) return;

    try {
      await updateCharacter(currentCharacter.id, editCharacter);
      setEditCharacter({});
      setShowEditForm(false);
    } catch (err) {
      console.error("Failed to update character:", err);
    }
  };

  // Handle add achievement
  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAchievement(newAchievement);
      setNewAchievement({
        characterId: "",
        title: "",
        description: "",
        achievementType: "Roleplay",
      });
      setShowAchievementForm(false);
    } catch (err) {
      console.error("Failed to add achievement:", err);
    }
  };

  // Handle update relationship
  const handleUpdateRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateRelationship(newRelationship);
      setNewRelationship({
        characterId: "",
        npcId: "11111111-2222-3333-4444-555555555555",
        relationshipType: "Neutral",
        notes: "",
      });
      setShowRelationshipForm(false);
    } catch (err) {
      console.error("Failed to update relationship:", err);
    }
  };

  // Edit character setup
  const startEdit = (character: PlayerCharacter) => {
    setCurrentCharacter(character);
    setEditCharacter({
      name: character.name,
      race: character.race,
      class: character.class,
      level: character.level,
      maxHp: character.maxHp,
      background: character.background,
      notes: character.notes,
    });
    setShowEditForm(true);
  };

  // Add achievement setup
  const startAddAchievement = (character: PlayerCharacter) => {
    setNewAchievement({
      ...newAchievement,
      characterId: character.id,
    });
    setShowAchievementForm(true);
  };

  // Add relationship setup
  const startAddRelationship = (character: PlayerCharacter) => {
    setNewRelationship({
      ...newRelationship,
      characterId: character.id,
    });
    setShowRelationshipForm(true);
  };

  return (
    <div className="campaign-aware-character-tool">
      {/* Campaign Context Header */}
      {currentCampaign && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-700 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                  📖 Campagna: {currentCampaign.name}
                </h2>
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  Gestisci i personaggi di questa campagna
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-blue-600 dark:text-blue-400">
                <span>Sessione {currentCampaign.currentSession}</span>
                <span>{partySummary.activeCharacters} PG attivi</span>
                <span>Livello medio {partySummary.averageLevel}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-700 px-6 py-4">
          <div className="max-w-7xl mx-auto">
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
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Party Summary */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            👥 Riassunto Party
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {partySummary.totalCharacters}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Personaggi Totali
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {partySummary.activeCharacters}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Attivi
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {partySummary.averageLevel}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Livello Medio
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {partySummary.totalAchievements}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Achievements Totali
              </div>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Personaggi ({characters.length})
            </h2>

            <div className="flex gap-2">
              <StatusBadge variant="success">
                {activeCharacters.length} Attivi
              </StatusBadge>
              {characters.length - activeCharacters.length > 0 && (
                <StatusBadge variant="inactive">
                  {characters.length - activeCharacters.length} Inattivi
                </StatusBadge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ActionButton
              variant={viewMode === "grid" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              🔳 Griglia
            </ActionButton>
            <ActionButton
              variant={viewMode === "list" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              📋 Lista
            </ActionButton>
            <CreateButton onClick={() => setShowCreateForm(true)}>
              + Nuovo Personaggio
            </CreateButton>
          </div>
        </div>

        {/* Characters Display */}
        {characters.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nessun personaggio
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Inizia creando il primo personaggio per {currentCampaign?.name}!
            </p>
            <CreateButton onClick={() => setShowCreateForm(true)}>
              Crea il primo personaggio
            </CreateButton>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-3"
            }
          >
            {characters.map((character) =>
              viewMode === "grid" ? (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onEdit={() => {}} // Implement edit functionality
                  onDelete={deleteCharacter}
                  onLevelUp={levelUpCharacter}
                  onToggleActive={toggleCharacterActive}
                  onAddAchievement={() => {}} // Implement achievement functionality
                  onAddRelationship={() => {}} // Implement relationship functionality
                  onView={setCurrentCharacter}
                />
              ) : (
                <CompactCharacterCard
                  key={character.id}
                  character={character}
                  onEdit={() => {}} // Implement edit functionality
                  onDelete={deleteCharacter}
                  onLevelUp={levelUpCharacter}
                  onToggleActive={toggleCharacterActive}
                  onAddAchievement={() => {}} // Implement achievement functionality
                  onAddRelationship={() => {}} // Implement relationship functionality
                  onView={setCurrentCharacter}
                />
              )
            )}
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Nuovo Personaggio - {currentCampaign?.name}
                </h2>
                <form onSubmit={handleCreateCharacter} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome personaggio"
                    value={newCharacter.name}
                    onChange={(e) =>
                      setNewCharacter({ ...newCharacter, name: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Razza (es. Umano, Elfo)"
                    value={newCharacter.race}
                    onChange={(e) =>
                      setNewCharacter({ ...newCharacter, race: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Classe (es. Guerriero, Mago)"
                    value={newCharacter.class}
                    onChange={(e) =>
                      setNewCharacter({
                        ...newCharacter,
                        class: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Livello"
                      min="1"
                      max="20"
                      value={newCharacter.level}
                      onChange={(e) =>
                        setNewCharacter({
                          ...newCharacter,
                          level: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input
                      type="number"
                      placeholder="HP Max"
                      min="1"
                      value={newCharacter.maxHp}
                      onChange={(e) =>
                        setNewCharacter({
                          ...newCharacter,
                          maxHp: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Background del personaggio..."
                    value={newCharacter.background}
                    onChange={(e) =>
                      setNewCharacter({
                        ...newCharacter,
                        background: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                  />
                  <textarea
                    placeholder="Note private del DM..."
                    value={newCharacter.notes}
                    onChange={(e) =>
                      setNewCharacter({
                        ...newCharacter,
                        notes: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                  />

                  <div className="flex gap-3 pt-4">
                    <CreateButton type="submit" fullWidth loading={loading}>
                      Crea Personaggio
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
      </div>
    </div>
  );
};

export default ImprovedCharacterTestTool;
