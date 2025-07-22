import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Table, TableColumn } from "@/shared/components/ui/Table";
import { Card } from "@/shared/components/ui/Card";
import {
  SecondaryButton,
  PrimaryButton,
  EditButton,
  DeleteButton,
  CreateButton,
} from "@/shared/components/ui/Button";

// Mock data types
interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  hp: number;
  ac: number;
  isActive: boolean;
  campaign: string;
}

interface Monster {
  id: string;
  name: string;
  type: string;
  cr: string;
  hp: string;
  ac: number;
  size: string;
  environment: string;
}

interface Campaign {
  id: string;
  title: string;
  setting: string;
  playerCount: number;
  level: string;
  status: "active" | "paused" | "completed";
  lastSession: string;
  totalSessions: number;
}

const DemoTablesPage: React.FC = () => {
  // Table states
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [selectedMonsters, setSelectedMonsters] = useState<string[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  // Pagination states
  const [characterPage, setCharacterPage] = useState(1);
  const [characterPageSize, setCharacterPageSize] = useState(10);
  const [campaignPage, setCampaignPage] = useState(1);
  const [campaignPageSize, setCampaignPageSize] = useState(5);

  // Mock data
  const charactersData: Character[] = useMemo(
    () => [
      {
        id: "1",
        name: "Aranel Moonwhisper",
        race: "Elfo",
        class: "Ranger",
        level: 5,
        hp: 42,
        ac: 15,
        isActive: true,
        campaign: "Curse of Strahd",
      },
      {
        id: "2",
        name: "Thorin Ironfist",
        race: "Nano",
        class: "Guerriero",
        level: 4,
        hp: 38,
        ac: 18,
        isActive: true,
        campaign: "Curse of Strahd",
      },
      {
        id: "3",
        name: "Zara Nightshade",
        race: "Tiefling",
        class: "Stregone",
        level: 5,
        hp: 32,
        ac: 13,
        isActive: false,
        campaign: "Curse of Strahd",
      },
      {
        id: "4",
        name: "Finn Lightfoot",
        race: "Halfling",
        class: "Ladro",
        level: 4,
        hp: 28,
        ac: 14,
        isActive: true,
        campaign: "Dragon Heist",
      },
      {
        id: "5",
        name: "Lyra Starweaver",
        race: "Umano",
        class: "Mago",
        level: 6,
        hp: 36,
        ac: 12,
        isActive: true,
        campaign: "Dragon Heist",
      },
      {
        id: "6",
        name: "Gareth Stoneshield",
        race: "Nano",
        class: "Chierico",
        level: 5,
        hp: 44,
        ac: 16,
        isActive: false,
        campaign: "Out of the Abyss",
      },
      {
        id: "7",
        name: "Silvia Swiftarrow",
        race: "Elfo",
        class: "Ranger",
        level: 3,
        hp: 26,
        ac: 14,
        isActive: true,
        campaign: "Lost Mine",
      },
      {
        id: "8",
        name: "Marcus Flameborn",
        race: "Dragonborn",
        class: "Paladino",
        level: 4,
        hp: 40,
        ac: 17,
        isActive: true,
        campaign: "Lost Mine",
      },
    ],
    []
  );

  const monstersData: Monster[] = useMemo(
    () => [
      {
        id: "1",
        name: "Drago Rosso Antico",
        type: "Drago",
        cr: "24",
        hp: "546 (28d20 + 252)",
        ac: 22,
        size: "Gigantesco",
        environment: "Montagne",
      },
      {
        id: "2",
        name: "Tarrasque",
        type: "Mostruosità",
        cr: "30",
        hp: "676 (33d20 + 330)",
        ac: 25,
        size: "Gigantesco",
        environment: "Qualsiasi",
      },
      {
        id: "3",
        name: "Lich",
        type: "Non Morto",
        cr: "21",
        hp: "165 (18d8 + 90)",
        ac: 17,
        size: "Medio",
        environment: "Dungeon",
      },
      {
        id: "4",
        name: "Owlbear",
        type: "Mostruosità",
        cr: "3",
        hp: "59 (7d10 + 21)",
        ac: 13,
        size: "Grande",
        environment: "Foresta",
      },
      {
        id: "5",
        name: "Goblin",
        type: "Umanoide",
        cr: "1/4",
        hp: "7 (2d6)",
        ac: 15,
        size: "Piccolo",
        environment: "Caverne",
      },
      {
        id: "6",
        name: "Mind Flayer",
        type: "Aberrazione",
        cr: "7",
        hp: "71 (13d8 + 13)",
        ac: 15,
        size: "Medio",
        environment: "Underdark",
      },
    ],
    []
  );

  const campaignsData: Campaign[] = useMemo(
    () => [
      {
        id: "1",
        title: "Curse of Strahd",
        setting: "Ravenloft",
        playerCount: 4,
        level: "1-10",
        status: "active",
        lastSession: "2 giorni fa",
        totalSessions: 12,
      },
      {
        id: "2",
        title: "Waterdeep: Dragon Heist",
        setting: "Forgotten Realms",
        playerCount: 5,
        level: "1-5",
        status: "active",
        lastSession: "1 settimana fa",
        totalSessions: 8,
      },
      {
        id: "3",
        title: "Out of the Abyss",
        setting: "Underdark",
        playerCount: 3,
        level: "1-15",
        status: "paused",
        lastSession: "1 mese fa",
        totalSessions: 15,
      },
      {
        id: "4",
        title: "Lost Mine of Phandelver",
        setting: "Forgotten Realms",
        playerCount: 4,
        level: "1-5",
        status: "completed",
        lastSession: "3 mesi fa",
        totalSessions: 10,
      },
      {
        id: "5",
        title: "Tomb of Annihilation",
        setting: "Chult",
        playerCount: 6,
        level: "1-11",
        status: "paused",
        lastSession: "2 settimane fa",
        totalSessions: 20,
      },
    ],
    []
  );

  // Table columns definitions
  const characterColumns: TableColumn<Character>[] = [
    {
      key: "name",
      title: "Nome",
      dataIndex: "name",
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              record.isActive ? "bg-success-500" : "bg-gray-400"
            }`}
          />
          <strong>{value}</strong>
        </div>
      ),
    },
    {
      key: "race",
      title: "Razza",
      dataIndex: "race",
      sortable: true,
    },
    {
      key: "class",
      title: "Classe",
      dataIndex: "class",
      sortable: true,
    },
    {
      key: "level",
      title: "Livello",
      dataIndex: "level",
      sortable: true,
      align: "center",
      render: (value) => (
        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
          {value}
        </span>
      ),
    },
    {
      key: "hp",
      title: "HP",
      dataIndex: "hp",
      sortable: true,
      align: "center",
    },
    {
      key: "ac",
      title: "CA",
      dataIndex: "ac",
      sortable: true,
      align: "center",
    },
    {
      key: "campaign",
      title: "Campagna",
      dataIndex: "campaign",
      sortable: true,
    },
    {
      key: "actions",
      title: "Azioni",
      align: "center",
      render: (_, record) => (
        <div className="flex gap-2 justify-center">
          <EditButton
            size="sm"
            onClick={() => console.log("Edit", record.name)}
          />
          <DeleteButton
            size="sm"
            onClick={() => console.log("Delete", record.name)}
          />
        </div>
      ),
    },
  ];

  const monsterColumns: TableColumn<Monster>[] = [
    {
      key: "name",
      title: "Nome",
      dataIndex: "name",
      sortable: true,
      render: (value) => <strong>{value}</strong>,
    },
    {
      key: "type",
      title: "Tipo",
      dataIndex: "type",
      sortable: true,
    },
    {
      key: "size",
      title: "Taglia",
      dataIndex: "size",
      sortable: true,
    },
    {
      key: "cr",
      title: "CR",
      dataIndex: "cr",
      sortable: true,
      align: "center",
      render: (value) => (
        <span className="px-2 py-1 bg-warning-100 text-warning-800 rounded text-xs font-bold">
          {value}
        </span>
      ),
    },
    {
      key: "ac",
      title: "CA",
      dataIndex: "ac",
      sortable: true,
      align: "center",
    },
    {
      key: "hp",
      title: "Punti Ferita",
      dataIndex: "hp",
      align: "center",
    },
    {
      key: "environment",
      title: "Ambiente",
      dataIndex: "environment",
      sortable: true,
    },
  ];

  const campaignColumns: TableColumn<Campaign>[] = [
    {
      key: "title",
      title: "Titolo",
      dataIndex: "title",
      sortable: true,
      render: (value) => <strong>{value}</strong>,
    },
    {
      key: "setting",
      title: "Ambientazione",
      dataIndex: "setting",
      sortable: true,
    },
    {
      key: "playerCount",
      title: "Giocatori",
      dataIndex: "playerCount",
      sortable: true,
      align: "center",
      render: (value) => `${value} 👥`,
    },
    {
      key: "level",
      title: "Livelli",
      dataIndex: "level",
      align: "center",
    },
    {
      key: "status",
      title: "Stato",
      dataIndex: "status",
      sortable: true,
      align: "center",
      render: (value) => {
        const statusConfig = {
          active: { color: "bg-success-100 text-success-800", label: "Attiva" },
          paused: {
            color: "bg-warning-100 text-warning-800",
            label: "In Pausa",
          },
          completed: {
            color: "bg-gray-100 text-gray-800",
            label: "Completata",
          },
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: "totalSessions",
      title: "Sessioni",
      dataIndex: "totalSessions",
      sortable: true,
      align: "center",
    },
    {
      key: "lastSession",
      title: "Ultima Sessione",
      dataIndex: "lastSession",
      sortable: true,
    },
  ];

  const DemoSection: React.FC<{
    title: string;
    children: React.ReactNode;
    description?: string;
  }> = ({ title, children, description }) => (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-2">{title}</h2>
        {description && <p className="text-secondary">{description}</p>}
      </div>
      {children}
    </section>
  );

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="surface-primary border-b border-primary sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Table Components
              </h1>
              <p className="text-secondary mt-2">
                Showcase completo di tabelle con sorting, pagination, selezione
                e varianti
              </p>
            </div>
            <Link to="/">
              <SecondaryButton>← Torna alla Home</SecondaryButton>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Basic Table */}
        <DemoSection
          title="Table Base con Sorting"
          description="Tabella base con ordinamento per colonna e rendering custom"
        >
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-primary">
                  Bestiary - Mostri D&D
                </h3>
                <CreateButton size="sm">Aggiungi Mostro</CreateButton>
              </div>

              <Table
                columns={monsterColumns}
                data={monstersData}
                rowKey="id"
                variant="default"
                size="md"
                onSort={(key, direction) =>
                  console.log("Sort:", key, direction)
                }
                className="shadow-sm"
              />
            </div>
          </Card>
        </DemoSection>

        {/* Table with Selection */}
        <DemoSection
          title="Table con Selezione Multipla"
          description="Tabella con checkbox per selezione multipla e azioni batch"
        >
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium text-primary">
                    Lista Personaggi
                  </h3>
                  {selectedCharacters.length > 0 && (
                    <p className="text-sm text-secondary mt-1">
                      {selectedCharacters.length} personaggi selezionati
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  {selectedCharacters.length > 0 && (
                    <>
                      <PrimaryButton size="sm">Azioni Batch</PrimaryButton>
                      <DeleteButton size="sm">Elimina Selezionati</DeleteButton>
                    </>
                  )}
                  <CreateButton size="sm">Nuovo Personaggio</CreateButton>
                </div>
              </div>

              <Table
                columns={characterColumns}
                data={charactersData}
                rowKey="id"
                variant="striped"
                size="md"
                selectable
                multiSelect
                selectedRows={selectedCharacters}
                onSelectChange={(keys) => setSelectedCharacters(keys)}
                onSort={(key, direction) =>
                  console.log("Sort characters:", key, direction)
                }
              />
            </div>
          </Card>
        </DemoSection>

        {/* Table with Pagination */}
        <DemoSection
          title="Table con Paginazione"
          description="Tabella con paginazione completa, page size changer e informazioni"
        >
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-primary">
                  Gestione Campagne
                </h3>
                <CreateButton size="sm">Nuova Campagna</CreateButton>
              </div>

              <Table
                columns={campaignColumns}
                data={campaignsData}
                rowKey="id"
                variant="bordered"
                size="md"
                selectable
                selectedRows={selectedCampaigns}
                onSelectChange={(keys) => setSelectedCampaigns(keys)}
                pagination={{
                  current: campaignPage,
                  pageSize: campaignPageSize,
                  total: campaignsData.length,
                  showSizeChanger: true,
                  showTotal: true,
                  pageSizeOptions: [3, 5, 10],
                  onChange: (page, size) => {
                    setCampaignPage(page);
                    setCampaignPageSize(size);
                  },
                }}
                onSort={(key, direction) =>
                  console.log("Sort campaigns:", key, direction)
                }
              />
            </div>
          </Card>
        </DemoSection>

        {/* Table Variants */}
        <DemoSection
          title="Varianti di Stile"
          description="Diverse varianti visuali delle tabelle"
        >
          <div className="space-y-8">
            {/* Compact Variant */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-primary mb-4">
                  Tabella Compatta
                </h3>
                <Table
                  columns={[
                    {
                      key: "name",
                      title: "Nome",
                      dataIndex: "name",
                      sortable: true,
                    },
                    { key: "race", title: "Razza", dataIndex: "race" },
                    { key: "class", title: "Classe", dataIndex: "class" },
                    {
                      key: "level",
                      title: "Lv",
                      dataIndex: "level",
                      align: "center",
                    },
                  ]}
                  data={charactersData.slice(0, 4)}
                  rowKey="id"
                  variant="compact"
                  size="sm"
                />
              </div>
            </Card>

            {/* Borderless with custom styling */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-primary mb-4">
                  Tabella Personalizzata
                </h3>
                <Table
                  columns={[
                    {
                      key: "name",
                      title: "Mostro",
                      dataIndex: "name",
                      render: (value, record) => (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            {record.type === "Drago"
                              ? "🐉"
                              : record.type === "Non Morto"
                              ? "💀"
                              : "👹"}
                          </div>
                          <div>
                            <div className="font-medium">{value}</div>
                            <div className="text-xs text-secondary">
                              {record.type}
                            </div>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "cr",
                      title: "Challenge Rating",
                      dataIndex: "cr",
                      align: "center",
                      render: (value) => {
                        const crNum = parseFloat(value.replace("/", "."));
                        const colorClass =
                          crNum >= 10
                            ? "bg-error-100 text-error-800"
                            : crNum >= 5
                            ? "bg-warning-100 text-warning-800"
                            : "bg-success-100 text-success-800";
                        return (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${colorClass}`}
                          >
                            CR {value}
                          </span>
                        );
                      },
                    },
                    {
                      key: "environment",
                      title: "Ambiente",
                      dataIndex: "environment",
                    },
                  ]}
                  data={monstersData.slice(0, 5)}
                  rowKey="id"
                  variant="default"
                  size="lg"
                  //hover
                />
              </div>
            </Card>
          </div>
        </DemoSection>

        {/* Loading and Empty States */}
        <DemoSection
          title="Stati Speciali"
          description="Tabelle in stato di caricamento e vuote"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-primary mb-4">
                  Stato Caricamento
                </h3>
                <Table
                  columns={characterColumns.slice(0, 4)}
                  data={[]}
                  rowKey="id"
                  loading
                  variant="default"
                  size="md"
                />
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-primary mb-4">
                  Tabella Vuota
                </h3>
                <Table
                  columns={characterColumns.slice(0, 4)}
                  data={[]}
                  rowKey="id"
                  variant="striped"
                  size="md"
                  //emptyText="Nessun personaggio trovato"
                />
              </div>
            </Card>
          </div>
        </DemoSection>

        {/* Advanced Features Demo */}
        <DemoSection
          title="Funzionalità Avanzate"
          description="Esempio con tutte le funzionalità attive"
        >
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium text-primary">
                    Tabella Completa
                  </h3>
                  <p className="text-sm text-secondary mt-1">
                    Con selezione, paginazione, sorting e azioni personalizzate
                  </p>
                </div>

                <div className="flex gap-3">
                  {selectedCharacters.length > 0 && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                      {selectedCharacters.length} selezionati
                    </span>
                  )}
                  <CreateButton size="sm">Aggiungi</CreateButton>
                </div>
              </div>

              <Table
                columns={characterColumns}
                data={charactersData}
                rowKey="id"
                variant="default"
                size="md"
                selectable
                multiSelect
                selectedRows={selectedCharacters}
                onSelectChange={(keys, records) => {
                  setSelectedCharacters(keys);
                  console.log("Selected records:", records);
                }}
                pagination={{
                  current: characterPage,
                  pageSize: characterPageSize,
                  total: charactersData.length,
                  showSizeChanger: true,
                  showTotal: true,
                  onChange: (page, size) => {
                    setCharacterPage(page);
                    setCharacterPageSize(size);
                  },
                }}
                onSort={(key, direction) =>
                  console.log("Advanced sort:", key, direction)
                }
                // hover
                sticky
                maxHeight="400px"
              />
            </div>
          </Card>
        </DemoSection>
      </div>
    </div>
  );
};

export default DemoTablesPage;
