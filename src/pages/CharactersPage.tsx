// src/pages/CharactersPage.tsx
import React, { useState, useEffect } from "react";
import { CharacterCard } from "../components/CharacterCard";
import { characterManager } from "../managers/CharacterManager";
import { Character, CharacterFormData } from "../types/character";
import { Plus, Search, Filter, Users } from "lucide-react";

export const CharactersPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [classFilter, setClassFilter] = useState<string>("");
  const [raceFilter, setRaceFilter] = useState<string>("");

  // Load characters on mount
  useEffect(() => {
    loadCharacters();

    // Subscribe to character changes
    const unsubscribe = characterManager.addListener(() => {
      loadCharacters();
    });

    return unsubscribe;
  }, []);

  // Filter characters when search/filters change
  useEffect(() => {
    let filtered = characters;

    // Apply search
    if (searchQuery) {
      filtered = characterManager.searchCharacters(searchQuery);
    }

    // Apply filters
    filtered = characterManager.filterCharacters({
      class: classFilter || undefined,
      race: raceFilter || undefined,
    });

    setFilteredCharacters(filtered);
  }, [characters, searchQuery, classFilter, raceFilter]);

  const loadCharacters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedCharacters = await characterManager.loadCharacters();
      setCharacters(loadedCharacters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel caricamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCharacter = () => {
    // TODO: Aprire modal di creazione
    console.log("Aprire modal creazione personaggio");
  };

  const handleEditCharacter = (character: Character) => {
    // TODO: Aprire modal di modifica
    console.log("Modificare personaggio:", character.name);
  };

  const handleDeleteCharacter = async (id: string) => {
    try {
      await characterManager.deleteCharacter(id);
      // I dati si aggiornano automaticamente tramite listener
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nell'eliminazione");
    }
  };

  const handleViewCharacter = (character: Character) => {
    // TODO: Aprire vista dettagli
    console.log("Visualizzare dettagli:", character.name);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setClassFilter("");
    setRaceFilter("");
  };

  const getUniqueClasses = () => {
    return [...new Set(characters.map((c) => c.class))].sort();
  };

  const getUniqueRaces = () => {
    return [...new Set(characters.map((c) => c.race))].sort();
  };

  const getStats = () => {
    return characterManager.getCharacterStats();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <button
          onClick={loadCharacters}
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Riprova
        </button>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-500" />
            Personaggi
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gestisci i personaggi della tua campagna
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {stats.totalCharacters}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-300">
              Totali
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca personaggi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtri
          </button>

          {/* Add Button */}
          <button
            onClick={handleCreateCharacter}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuovo Personaggio
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Classe
              </label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Tutte</option>
                {getUniqueClasses().map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Razza
              </label>
              <select
                value={raceFilter}
                onChange={(e) => setRaceFilter(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Tutte</option>
                {getUniqueRaces().map((race) => (
                  <option key={race} value={race}>
                    {race}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Pulisci Filtri
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Characters Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {characters.length === 0
              ? "Nessun personaggio"
              : "Nessun risultato"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {characters.length === 0
              ? "Inizia creando il tuo primo personaggio"
              : "Prova a modificare i filtri di ricerca"}
          </p>
          {characters.length === 0 && (
            <button
              onClick={handleCreateCharacter}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Crea Primo Personaggio
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onEdit={handleEditCharacter}
              onDelete={handleDeleteCharacter}
              onView={handleViewCharacter}
            />
          ))}
        </div>
      )}
    </div>
  );
};
