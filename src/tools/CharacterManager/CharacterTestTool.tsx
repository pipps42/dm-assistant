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
} from "@/core/entities/Character";
import { CharacterService } from "@/core/services/CharacterService";

// Mock campaign ID for testing
const TEST_CAMPAIGN_ID = "12345678-1234-1234-1234-123456789012";

interface CharacterTestToolProps {}

const CharacterTestTool: React.FC<CharacterTestToolProps> = () => {
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
      npcId: "test-npc-1", // Mock NPC ID
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
        npcId: "test-npc-1",
        relationshipType: "Neutral",
        notes: "",
      });
      setShowRelationshipForm(false);
    } catch (err) {
      console.error("Failed to update relationship:", err);
    }
  };

  // Handle delete character
  const handleDeleteCharacter = async (characterId: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questo personaggio?")) {
      try {
        await deleteCharacter(characterId);
      } catch (err) {
        console.error("Failed to delete character:", err);
      }
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
    <div className="character-test-tool p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Character Manager Test Tool</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Caricamento...
        </div>
      )}

      {/* Party Summary */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Riassunto Party</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="font-medium">Personaggi Totali:</span>{" "}
            {partySummary.totalCharacters}
          </div>
          <div>
            <span className="font-medium">Attivi:</span>{" "}
            {partySummary.activeCharacters}
          </div>
          <div>
            <span className="font-medium">Livello Medio:</span>{" "}
            {partySummary.averageLevel}
          </div>
          <div>
            <span className="font-medium">Range Livelli:</span>{" "}
            {partySummary.levelRange}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Crea Personaggio
        </button>
        <button
          onClick={() => loadCharactersByCampaign(TEST_CAMPAIGN_ID)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Ricarica Personaggi
        </button>
      </div>

      {/* Characters List */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Personaggi ({characters.length})
        </h2>
        {characters.length === 0 ? (
          <p className="text-gray-500">
            Nessun personaggio trovato. Creane uno per iniziare!
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {characters.map((character) => (
              <div
                key={character.id}
                className="border rounded p-4 bg-white shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">
                    {character.name}
                    {!character.isActive && (
                      <span className="text-red-500 text-sm ml-2">
                        (Inattivo)
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentCharacter(character)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Visualizza
                    </button>
                    <button
                      onClick={() => startEdit(character)}
                      className="text-yellow-500 hover:text-yellow-700 text-sm"
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => handleDeleteCharacter(character.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Elimina
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 mb-2">
                  {CharacterService.getDisplayName(character)}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  HP: {character.maxHp} | Achievements:{" "}
                  {character.achievements.length} | Relazioni:{" "}
                  {character.relationships.length}
                </p>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => levelUpCharacter(character.id)}
                    className="bg-purple-500 text-white px-2 py-1 text-xs rounded hover:bg-purple-600"
                    disabled={character.level >= 20}
                  >
                    Level Up
                  </button>
                  <button
                    onClick={() => toggleCharacterActive(character.id)}
                    className={`px-2 py-1 text-xs rounded ${
                      character.isActive
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {character.isActive ? "Disattiva" : "Attiva"}
                  </button>
                  <button
                    onClick={() => startAddAchievement(character)}
                    className="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600"
                  >
                    + Achievement
                  </button>
                  <button
                    onClick={() => startAddRelationship(character)}
                    className="bg-indigo-500 text-white px-2 py-1 text-xs rounded hover:bg-indigo-600"
                  >
                    + Relazione
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Character Details */}
      {currentCharacter && (
        <div className="mb-8 bg-gray-50 p-4 rounded">
          <h2 className="text-2xl font-semibold mb-4">
            Dettagli: {currentCharacter.name}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Informazioni Base</h3>
              <p>
                <strong>Razza:</strong> {currentCharacter.race}
              </p>
              <p>
                <strong>Classe:</strong> {currentCharacter.class}
              </p>
              <p>
                <strong>Livello:</strong> {currentCharacter.level}
              </p>
              <p>
                <strong>HP Massimi:</strong> {currentCharacter.maxHp}
              </p>
              <p>
                <strong>Stato:</strong>{" "}
                {currentCharacter.isActive ? "Attivo" : "Inattivo"}
              </p>

              {currentCharacter.background && (
                <div className="mt-2">
                  <strong>Background:</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentCharacter.background}
                  </p>
                </div>
              )}

              {currentCharacter.notes && (
                <div className="mt-2">
                  <strong>Note DM:</strong>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentCharacter.notes}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">
                Achievements ({currentCharacter.achievements.length})
              </h3>
              {currentCharacter.achievements.length === 0 ? (
                <p className="text-gray-500 text-sm">Nessun achievement</p>
              ) : (
                <div className="space-y-2">
                  {CharacterService.getRecentAchievements(
                    currentCharacter,
                    3
                  ).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="bg-white p-2 rounded border"
                    >
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-600">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-blue-600">
                        {getAchievementLabel(achievement.achievementType)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="text-lg font-medium mb-2 mt-4">
                Relazioni ({currentCharacter.relationships.length})
              </h3>
              {currentCharacter.relationships.length === 0 ? (
                <p className="text-gray-500 text-sm">Nessuna relazione</p>
              ) : (
                <div className="space-y-2">
                  {currentCharacter.relationships.map((relationship) => (
                    <div
                      key={relationship.id}
                      className="bg-white p-2 rounded border"
                    >
                      <p className="font-medium text-sm">
                        NPC: {relationship.npcId.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-600">
                        {getRelationshipLabel(relationship.relationshipType)}
                      </p>
                      {relationship.notes && (
                        <p className="text-xs text-gray-500">
                          {relationship.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Character Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Crea Nuovo Personaggio
            </h2>
            <form onSubmit={handleCreateCharacter}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={newCharacter.name}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, name: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Razza"
                  value={newCharacter.race}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, race: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Classe"
                  value={newCharacter.class}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, class: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
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
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="number"
                  placeholder="HP Massimi"
                  min="1"
                  value={newCharacter.maxHp}
                  onChange={(e) =>
                    setNewCharacter({
                      ...newCharacter,
                      maxHp: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
                <textarea
                  placeholder="Background"
                  value={newCharacter.background}
                  onChange={(e) =>
                    setNewCharacter({
                      ...newCharacter,
                      background: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded h-20"
                />
                <textarea
                  placeholder="Note DM"
                  value={newCharacter.notes}
                  onChange={(e) =>
                    setNewCharacter({ ...newCharacter, notes: e.target.value })
                  }
                  className="w-full p-2 border rounded h-16"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Crea
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Character Form */}
      {showEditForm && currentCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Modifica {currentCharacter.name}
            </h2>
            <form onSubmit={handleUpdateCharacter}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={editCharacter.name || ""}
                  onChange={(e) =>
                    setEditCharacter({ ...editCharacter, name: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Razza"
                  value={editCharacter.race || ""}
                  onChange={(e) =>
                    setEditCharacter({ ...editCharacter, race: e.target.value })
                  }
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
                />
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
                  className="w-full p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="HP Massimi"
                  min="1"
                  value={editCharacter.maxHp || ""}
                  onChange={(e) =>
                    setEditCharacter({
                      ...editCharacter,
                      maxHp: parseInt(e.target.value) || undefined,
                    })
                  }
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Background"
                  value={editCharacter.background || ""}
                  onChange={(e) =>
                    setEditCharacter({
                      ...editCharacter,
                      background: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded h-20"
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
                  className="w-full p-2 border rounded h-16"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Salva
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Achievement Form */}
      {showAchievementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Aggiungi Achievement</h2>
            <form onSubmit={handleAddAchievement}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Titolo"
                  value={newAchievement.title}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      title: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
                <textarea
                  placeholder="Descrizione"
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded h-20"
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
                  className="w-full p-2 border rounded"
                >
                  {ACHIEVEMENT_TYPES.filter(
                    (type) => typeof type == "string"
                  ).map((type) => (
                    <option key={type as string} value={type as string}>
                      {getAchievementLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Aggiungi
                </button>
                <button
                  type="button"
                  onClick={() => setShowAchievementForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Relationship Form */}
      {showRelationshipForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Aggiungi Relazione</h2>
            <form onSubmit={handleUpdateRelationship}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="ID NPC (test-npc-1)"
                  value={newRelationship.npcId}
                  onChange={(e) =>
                    setNewRelationship({
                      ...newRelationship,
                      npcId: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
                >
                  {RELATIONSHIP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {getRelationshipLabel(type)}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Note sulla relazione"
                  value={newRelationship.notes || ""}
                  onChange={(e) =>
                    setNewRelationship({
                      ...newRelationship,
                      notes: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded h-20"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                >
                  Aggiungi
                </button>
                <button
                  type="button"
                  onClick={() => setShowRelationshipForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterTestTool;
