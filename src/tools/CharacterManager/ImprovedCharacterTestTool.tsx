// src/tools/CharacterManager/ImprovedCharacterTestTool.tsx

import React, { useState, useEffect } from "react";
import { useCharacters } from "../../shared/hooks/dnd/useCharacters";
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
} from "../../core/entities/Character";
import { CharacterService } from "../../core/services/CharacterService";
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

// Mock campaign ID for testing (UUID valido)
const TEST_CAMPAIGN_ID = "12345678-1234-1234-1234-123456789012";

interface ImprovedCharacterTestToolProps {}

const ImprovedCharacterTestTool: React.FC<
  ImprovedCharacterTestToolProps
> = () => {
  const {
    characters,
    currentCharacter,
    loading,
    error,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    loadCharactersByCampaign,
    setCurrentCharacter,
    addAchievement,
    updateRelationship,
    levelUpCharacter,
    toggleCharacterActive,
    clearError,
    activeCharacters,
    partySummary,
  } = useCharacters(TEST_CAMPAIGN_ID);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Create character form
  const [newCharacter, setNewCharacter] = useState<CreateCharacterRequest>({
    campaignId: TEST_CAMPAIGN_ID,
    name: "",
    race: "",
    class: "",
    level: 1,
    maxHp: 10,
    background: "",
    notes: "",
  });

  // Edit character form
  const [editCharacter, setEditCharacter] = useState<UpdateCharacterRequest>(
    {}
  );

  // Achievement form
  const [newAchievement, setNewAchievement] = useState<AddAchievementRequest>({
    characterId: "",
    title: "",
    description: "",
    achievementType: "Roleplay",
  });

  // Relationship form
  const [newRelationship, setNewRelationship] =
    useState<UpdateRelationshipRequest>({
      characterId: "",
      npcId: "11111111-2222-3333-4444-555555555555", // Mock NPC ID
      relationshipType: "Neutral",
      notes: "",
    });

  // Load characters on mount
  useEffect(() => {
    loadCharactersByCampaign(TEST_CAMPAIGN_ID);
  }, [loadCharactersByCampaign]);

  // Handle create character
  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCharacter(newCharacter);
      setNewCharacter({
        campaignId: TEST_CAMPAIGN_ID,
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
    <div className="improved-character-test-tool min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Character Manager
              </h1>
              <p className="text-sm text-gray-600">
                Gestisci i personaggi della tua campagna
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ActionButton
                variant="secondary"
                size="sm"
                onClick={() => loadCharactersByCampaign(TEST_CAMPAIGN_ID)}
                loading={loading}
              >
                🔄 Ricarica
              </ActionButton>

              <CreateButton onClick={() => setShowCreateForm(true)}>
                + Nuovo Personaggio
              </CreateButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex">
                <span className="text-red-500 mr-2">⚠️</span>
                <span className="text-red-800">{error}</span>
              </div>
              <ActionButton variant="danger" size="xs" onClick={clearError}>
                ✕
              </ActionButton>
            </div>
          </div>
        )}

        {/* Party Summary */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Riassunto Party
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {partySummary.totalCharacters}
              </div>
              <div className="text-sm text-gray-600">Personaggi Totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {partySummary.activeCharacters}
              </div>
              <div className="text-sm text-gray-600">Attivi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {partySummary.averageLevel}
              </div>
              <div className="text-sm text-gray-600">Livello Medio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {partySummary.totalAchievements}
              </div>
              <div className="text-sm text-gray-600">Achievements Totali</div>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
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
          </div>
        </div>

        {/* Characters Display */}
        {characters.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nessun personaggio
            </h3>
            <p className="text-gray-600 mb-6">
              Inizia creando il primo personaggio della tua campagna!
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
                  onEdit={startEdit}
                  onDelete={deleteCharacter}
                  onLevelUp={levelUpCharacter}
                  onToggleActive={toggleCharacterActive}
                  onAddAchievement={startAddAchievement}
                  onAddRelationship={startAddRelationship}
                  onView={setCurrentCharacter}
                />
              ) : (
                <CompactCharacterCard
                  key={character.id}
                  character={character}
                  onEdit={startEdit}
                  onDelete={deleteCharacter}
                  onLevelUp={levelUpCharacter}
                  onToggleActive={toggleCharacterActive}
                  onAddAchievement={startAddAchievement}
                  onAddRelationship={startAddRelationship}
                  onView={setCurrentCharacter}
                />
              )
            )}
          </div>
        )}

        {/* Character Details Modal */}
        {currentCharacter && !showEditForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentCharacter.name}
                    </h2>
                    <p className="text-lg text-gray-600">
                      {CharacterService.getDisplayName(currentCharacter)}
                    </p>
                  </div>
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentCharacter(null)}
                  >
                    ✕
                  </ActionButton>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Informazioni Base
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Razza:</strong> {currentCharacter.race}
                      </div>
                      <div>
                        <strong>Classe:</strong> {currentCharacter.class}
                      </div>
                      <div>
                        <strong>Livello:</strong> {currentCharacter.level}
                      </div>
                      <div>
                        <strong>HP Massimi:</strong> {currentCharacter.maxHp}
                      </div>
                      <div>
                        <strong>Stato:</strong>{" "}
                        {currentCharacter.isActive ? "Attivo" : "Inattivo"}
                      </div>
                    </div>

                    {currentCharacter.background && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Background
                        </h4>
                        <p className="text-sm text-gray-600">
                          {currentCharacter.background}
                        </p>
                      </div>
                    )}

                    {currentCharacter.notes && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Note DM
                        </h4>
                        <p className="text-sm text-gray-600">
                          {currentCharacter.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">
                      Achievements ({currentCharacter.achievements.length})
                    </h3>
                    {currentCharacter.achievements.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        Nessun achievement
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {CharacterService.getRecentAchievements(
                          currentCharacter,
                          10
                        ).map((achievement) => (
                          <div
                            key={achievement.id}
                            className="bg-blue-50 p-3 rounded border"
                          >
                            <div className="font-medium text-sm text-blue-900">
                              {achievement.title}
                            </div>
                            <div className="text-xs text-blue-700 mt-1">
                              {achievement.description}
                            </div>
                            <StatusBadge
                              variant="info"
                              size="sm"
                              className="mt-2"
                            >
                              {getAchievementLabel(achievement.achievementType)}
                            </StatusBadge>
                          </div>
                        ))}
                      </div>
                    )}

                    <h3 className="text-lg font-medium mb-3 mt-6">
                      Relazioni ({currentCharacter.relationships.length})
                    </h3>
                    {currentCharacter.relationships.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nessuna relazione</p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {currentCharacter.relationships.map((relationship) => (
                          <div
                            key={relationship.id}
                            className="bg-gray-50 p-2 rounded border"
                          >
                            <div className="text-sm font-medium">
                              NPC: {relationship.npcId.substring(0, 8)}...
                            </div>
                            <StatusBadge
                              variant="neutral"
                              size="sm"
                              className="mt-1"
                            >
                              {getRelationshipLabel(
                                relationship.relationshipType
                              )}
                            </StatusBadge>
                            {relationship.notes && (
                              <div className="text-xs text-gray-500 mt-1">
                                {relationship.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Crea Nuovo Personaggio
              </h2>
              <form onSubmit={handleCreateCharacter} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={newCharacter.name}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Razza (es. Umano, Elfo)"
                  value={newCharacter.race}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, race: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder="Classe (es. Guerriero, Mago)"
                  value={newCharacter.class}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, class: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                />
                <textarea
                  placeholder="Note private del DM..."
                  value={newCharacter.notes}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, notes: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
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

      {/* Edit Form Modal */}
      {showEditForm && currentCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Modifica {currentCharacter.name}
              </h2>
              <form onSubmit={handleUpdateCharacter} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={editCharacter.name || ""}
                  onChange={(e) =>
                    setEditCharacter({ ...editCharacter, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Razza"
                  value={editCharacter.race || ""}
                  onChange={(e) =>
                    setEditCharacter({ ...editCharacter, race: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Classe"
                  value={editCharacter.class || ""}
                  onChange={(e) =>
                    setEditCharacter({
                      ...editCharacter,
                      class: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Livello"
                    min="1"
                    max="20"
                    value={editCharacter.level || ""}
                    onChange={(e) =>
                      setEditCharacter({
                        ...editCharacter,
                        level: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="HP Max"
                    min="1"
                    value={editCharacter.maxHp || ""}
                    onChange={(e) =>
                      setEditCharacter({
                        ...editCharacter,
                        maxHp: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <textarea
                  placeholder="Background"
                  value={editCharacter.background || ""}
                  onChange={(e) =>
                    setEditCharacter({
                      ...editCharacter,
                      background: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                />
                <textarea
                  placeholder="Note DM"
                  value={editCharacter.notes || ""}
                  onChange={(e) =>
                    setEditCharacter({
                      ...editCharacter,
                      notes: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                />

                <div className="flex gap-3 pt-4">
                  <EditButton type="submit" fullWidth loading={loading}>
                    Salva Modifiche
                  </EditButton>
                  <ActionButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowEditForm(false)}
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

      {/* Add Achievement Form */}
      {showAchievementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Aggiungi Achievement
              </h2>
              <form onSubmit={handleAddAchievement} className="space-y-4">
                <input
                  type="text"
                  placeholder="Titolo achievement"
                  value={newAchievement.title}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      title: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <textarea
                  placeholder="Descrizione achievement"
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                  required
                />
                <select
                  value={
                    typeof newAchievement.achievementType === "string"
                      ? newAchievement.achievementType
                      : "Roleplay"
                  }
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      achievementType: e.target.value as any,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ACHIEVEMENT_TYPES.filter(
                    (type) => typeof type === "string"
                  ).map((type) => (
                    <option key={type as string} value={type as string}>
                      {getAchievementLabel(type)}
                    </option>
                  ))}
                </select>

                <div className="flex gap-3 pt-4">
                  <AchievementButton type="submit" fullWidth loading={loading}>
                    Aggiungi Achievement
                  </AchievementButton>
                  <ActionButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAchievementForm(false)}
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

      {/* Add Relationship Form */}
      {showRelationshipForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Aggiungi Relazione</h2>
              <form onSubmit={handleUpdateRelationship} className="space-y-4">
                <input
                  type="text"
                  placeholder="ID NPC (mock: usa ID valido)"
                  value={newRelationship.npcId}
                  onChange={(e) =>
                    setNewRelationship({
                      ...newRelationship,
                      npcId: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <select
                  value={newRelationship.relationshipType}
                  onChange={(e) =>
                    setNewRelationship({
                      ...newRelationship,
                      relationshipType: e.target.value as any,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {RELATIONSHIP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {getRelationshipLabel(type)}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Note sulla relazione..."
                  value={newRelationship.notes || ""}
                  onChange={(e) =>
                    setNewRelationship({
                      ...newRelationship,
                      notes: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                />

                <div className="flex gap-3 pt-4">
                  <RelationshipButton type="submit" fullWidth loading={loading}>
                    Aggiungi Relazione
                  </RelationshipButton>
                  <ActionButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowRelationshipForm(false)}
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
  );
};

export default ImprovedCharacterTestTool;
